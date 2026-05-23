import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { isTsbToplamSirketKodu, sirketKoduHayatEmeklilikPrefix } from "@/lib/tsbPrimDashboard";
import type { TsbGelirTidyRowLike } from "@/lib/tsbYatirimGeliriKpi";
import type { TsbPrimRow } from "@/lib/tsbPrimDashboard";

export type TsbVeriDurumu = {
  sonPrimDonem: string;
  sonFinansalDonem: string;
  /** Hayat dışı (HD) havuzundaki şirket sayısı — finansal son çeyrek peer kümesi */
  sirketSayisiHd: number;
  /** ISO 8601 — veri dosyalarının en son değişim zamanı */
  guncellemeIso: string;
};

export type TsbVeriDurumuMeta = TsbVeriDurumu & {
  /** meta.json sürümü — import script uyumu */
  schemaVersion: 1;
};

const META_REL = join("public", "data", "tsb", "meta.json");
const PRIM_REL = join("public", "data", "tsb", "prim-tidy.json");
const GELIR_INDEX_REL = join("public", "data", "tsb", "gelir-tidy", "index.json");
const GELIR_DIR_REL = join("public", "data", "tsb", "gelir-tidy");

function tsbDataRoot(): string {
  return join(process.cwd());
}

function readJsonFile<T>(relPath: string): T | null {
  const abs = join(tsbDataRoot(), relPath);
  if (!existsSync(abs)) return null;
  try {
    return JSON.parse(readFileSync(abs, "utf8")) as T;
  } catch {
    return null;
  }
}

function latestDonemFromList(donemler: string[]): string {
  let max = "";
  for (const d of donemler) {
    if (typeof d === "string" && d > max) max = d;
  }
  return max;
}

function latestPrimDonem(rows: TsbPrimRow[]): string {
  const set = new Set<string>();
  for (const r of rows) {
    if (typeof r.donem === "string" && r.donem) set.add(r.donem);
  }
  return latestDonemFromList([...set]);
}

function isHdGelirRow(r: TsbGelirTidyRowLike): boolean {
  if (!Number.isFinite(r.sirketKodu) || isTsbToplamSirketKodu(r.sirketKodu)) return false;
  const t = String(r.sirketTipi ?? "").trim().toUpperCase();
  const p3 = sirketKoduHayatEmeklilikPrefix(r.sirketKodu);
  return !p3 && t === "HD";
}

function hdSirketSayisiFromGelir(rows: TsbGelirTidyRowLike[], donem: string): number {
  const set = new Set<number>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!isHdGelirRow(r)) continue;
    set.add(r.sirketKodu);
  }
  return set.size;
}

function dataFilesMtimeIso(): string {
  const root = tsbDataRoot();
  let maxMs = 0;

  const primPath = join(root, PRIM_REL);
  if (existsSync(primPath)) {
    maxMs = Math.max(maxMs, statSync(primPath).mtimeMs);
  }

  const gelirDir = join(root, GELIR_DIR_REL);
  if (existsSync(gelirDir)) {
    for (const name of readdirSync(gelirDir)) {
      if (!name.endsWith(".json") || name === "index.json") continue;
      maxMs = Math.max(maxMs, statSync(join(gelirDir, name)).mtimeMs);
    }
  }

  const metaPath = join(root, META_REL);
  if (maxMs === 0 && existsSync(metaPath)) {
    maxMs = statSync(metaPath).mtimeMs;
  }

  return new Date(maxMs || Date.now()).toISOString();
}

/** Diskteki tidy dosyalarından meta hesaplar (import script ve build fallback). */
export function computeTsbVeriDurumu(): TsbVeriDurumu {
  const primRows = readJsonFile<TsbPrimRow[]>(PRIM_REL) ?? [];
  const sonPrimDonem = latestPrimDonem(primRows);

  const gelirIndex = readJsonFile<string[]>(GELIR_INDEX_REL) ?? [];
  const sonFinansalDonem = latestDonemFromList(gelirIndex);

  let sirketSayisiHd = 0;
  if (sonFinansalDonem) {
    const quarterRows =
      readJsonFile<TsbGelirTidyRowLike[]>(join(GELIR_DIR_REL, `${sonFinansalDonem}.json`)) ?? [];
    sirketSayisiHd = hdSirketSayisiFromGelir(quarterRows, sonFinansalDonem);
  }

  return {
    sonPrimDonem: sonPrimDonem || "—",
    sonFinansalDonem: sonFinansalDonem || "—",
    sirketSayisiHd,
    guncellemeIso: dataFilesMtimeIso(),
  };
}

export function writeTsbVeriDurumuMeta(): TsbVeriDurumuMeta {
  const computed = computeTsbVeriDurumu();
  const meta: TsbVeriDurumuMeta = { schemaVersion: 1, ...computed };
  const abs = join(tsbDataRoot(), META_REL);
  mkdirSync(join(tsbDataRoot(), "public", "data", "tsb"), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(meta, null, 2)}\n`, "utf8");
  return meta;
}

/** Hub bandı — önce meta.json, yoksa veya eksikse hesapla. */
export function loadTsbVeriDurumu(): TsbVeriDurumu {
  const meta = readJsonFile<TsbVeriDurumuMeta>(META_REL);
  if (
    meta &&
    meta.schemaVersion === 1 &&
    meta.sonPrimDonem &&
    meta.sonFinansalDonem &&
    meta.guncellemeIso
  ) {
    return {
      sonPrimDonem: meta.sonPrimDonem,
      sonFinansalDonem: meta.sonFinansalDonem,
      sirketSayisiHd: meta.sirketSayisiHd,
      guncellemeIso: meta.guncellemeIso,
    };
  }
  return computeTsbVeriDurumu();
}

const guncellemeFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatTsbGuncellemeTarihi(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return guncellemeFmt.format(d);
}
