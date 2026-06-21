/**
 * Ölçek segmenti önbelleği — sunucu tarafı üretim ve dosya okuma.
 * `npm run tsb:meta` ile `public/data/tsb/olcek-segment.json` yazılır.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  olcekSegmentHavuzuFromRows,
  olcekSegmentSirketKayit,
  type OlcekSegmentHarfi,
} from "./tsbOlcekSegment";
import type {
  OlcekSegmentCache,
  OlcekSegmentDonemPool,
  OlcekSegmentKpiOzet,
} from "./tsbOlcekSegmentCache";
import { buildGelirTidyDonemLookup, hamMetrikFromLookup, type SegmentSkorPool } from "./tsbSirketSegmentSkor";
import { hasarPrimOranlariFromLookup } from "./tsbHasarPrimOrani";
import type { TsbGelirTidyRowLike } from "./tsbYatirimGeliriKpi";

const GELIR_DIR = join("public", "data", "tsb", "gelir-tidy");
const CACHE_REL = join("public", "data", "tsb", "olcek-segment.json");

const POOLS: SegmentSkorPool[] = ["HD", "HAYAT_EMEKLILIK"];

type KpiExtractor = {
  id: string;
  deger: (m: ReturnType<typeof hamMetrikFromLookup>, hp: ReturnType<typeof hasarPrimOranlariFromLookup>) => number | null;
};

const SEGMENT_KPI_EXTRACTORS: KpiExtractor[] = [
  { id: "BRUT_PRIM", deger: (m) => m.brutPrim },
  { id: "OZSERMAYE", deger: (m) => m.ozsermaye },
  { id: "TOPLAM_AKTIF", deger: (m) => m.toplamAktif },
  { id: "VOK_OZSERMAYE", deger: (m) => m.oranVokOzsermaye },
  { id: "SAFI_TEKNIK_PRIM", deger: (m) => m.oranSafiPrim },
  { id: "YATIRIM_OZSERMAYE", deger: (m) => m.oranYatirimOzsermaye },
  { id: "OZSERMAYE_AKTIF", deger: (m) => m.oranOzAktif },
  { id: "BRUT_HP", deger: (_m, hp) => hp.brutHasarPrimOrani },
  { id: "NET_HP", deger: (_m, hp) => hp.netHasarPrimOrani },
];

function median(xs: number[]): number | null {
  const sorted = xs.filter(Number.isFinite).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function mean(xs: number[]): number | null {
  const finite = xs.filter(Number.isFinite);
  if (finite.length === 0) return null;
  return finite.reduce((a, b) => a + b, 0) / finite.length;
}

function readGelirDonem(donem: string): TsbGelirTidyRowLike[] {
  const path = join(GELIR_DIR, `${donem}.json`);
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, "utf8")) as TsbGelirTidyRowLike[];
}

function listGelirDonemler(): string[] {
  if (!existsSync(GELIR_DIR)) return [];
  return readdirSync(GELIR_DIR)
    .filter((f) => f.endsWith(".json") && f !== "index.json")
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}

function sirketAdiFromRows(rows: TsbGelirTidyRowLike[], donem: string, kod: number): string {
  for (const r of rows) {
    if (r.donem === donem && r.sirketKodu === kod) {
      return (r.sirketAdi ?? "").trim() || `Şirket ${kod}`;
    }
  }
  return `Şirket ${kod}`;
}

function segmentOzetleriHesapla(
  rows: TsbGelirTidyRowLike[],
  donem: string,
  havuz: ReturnType<typeof olcekSegmentHavuzuFromRows>,
): OlcekSegmentKpiOzet[] {
  const lookup = buildGelirTidyDonemLookup(rows, donem);
  const segmentler: OlcekSegmentHarfi[] = ["A+", "A", "B", "C", "D"];
  const out: OlcekSegmentKpiOzet[] = [];

  for (const segment of segmentler) {
    const kodlar = havuz.filter((x) => x.olcekSegmenti === segment).map((x) => x.sirketKodu);
    for (const ext of SEGMENT_KPI_EXTRACTORS) {
      const degerler: number[] = [];
      for (const kod of kodlar) {
        if (!lookup.has(kod)) continue;
        const m = hamMetrikFromLookup(lookup, kod);
        const hp = hasarPrimOranlariFromLookup(lookup, kod);
        const v = ext.deger(m, hp);
        if (v !== null && Number.isFinite(v)) degerler.push(v);
      }
      out.push({
        segment,
        kpi: ext.id,
        ortalama: mean(degerler),
        medyan: median(degerler),
        sirketSayisi: kodlar.length,
      });
    }
  }
  return out;
}

function computeDonemPool(
  rows: TsbGelirTidyRowLike[],
  donem: string,
  pool: SegmentSkorPool,
): OlcekSegmentDonemPool | null {
  const havuz = olcekSegmentHavuzuFromRows(rows, donem, pool);
  if (havuz.length === 0) return null;

  const segmentDagilimi: Record<OlcekSegmentHarfi, number> = {
    "A+": 0,
    A: 0,
    B: 0,
    C: 0,
    D: 0,
  };
  for (const s of havuz) segmentDagilimi[s.olcekSegmenti] += 1;

  const sirketler = havuz.map((s) =>
    olcekSegmentSirketKayit(s, sirketAdiFromRows(rows, donem, s.sirketKodu)),
  );

  return {
    peerSayisi: havuz.length,
    segmentDagilimi,
    sirketler,
    segmentOzetleri: segmentOzetleriHesapla(rows, donem, havuz),
  };
}

export function computeOlcekSegmentCache(): OlcekSegmentCache {
  const donemler = listGelirDonemler();
  const byDonem: OlcekSegmentCache["byDonem"] = {};

  for (const donem of donemler) {
    const rows = readGelirDonem(donem);
    if (rows.length === 0) continue;
    byDonem[donem] = {};
    for (const pool of POOLS) {
      const poolData = computeDonemPool(rows, donem, pool);
      if (poolData) byDonem[donem]![pool] = poolData;
    }
  }

  const sonFinDonem = donemler[donemler.length - 1] ?? "";
  const sonPool = sonFinDonem ? byDonem[sonFinDonem] : undefined;

  return {
    guncellemeIso: new Date().toISOString(),
    donemler,
    sonFinDonem,
    hubOzet: {
      HD: sonPool?.HD?.peerSayisi ?? 0,
      HAYAT_EMEKLILIK: sonPool?.HAYAT_EMEKLILIK?.peerSayisi ?? 0,
    },
    byDonem,
  };
}

export function writeOlcekSegmentCache(): OlcekSegmentCache {
  const data = computeOlcekSegmentCache();
  const dir = join(process.cwd(), "public", "data", "tsb");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "olcek-segment.json"), JSON.stringify(data, null, 2), "utf8");
  return data;
}

export function loadOlcekSegmentCache(): OlcekSegmentCache | null {
  const path = join(process.cwd(), CACHE_REL);
  if (!existsSync(path)) return computeOlcekSegmentCache();
  try {
    return JSON.parse(readFileSync(path, "utf8")) as OlcekSegmentCache;
  } catch {
    return computeOlcekSegmentCache();
  }
}
