/**
 * Ölçek segmenti (HD / Hayat-Emeklilik ayrı) → Excel.
 * Kullanım: npm run tsb:olcek-segment-xlsx
 * veya: npx --yes tsx scripts/tsb-olcek-segment-export-xlsx.ts [donem] [çıktı.xlsx]
 */

import { existsSync, readFileSync, readdirSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import XLSX from "xlsx";
import type { TsbGelirTidyRowLike } from "../lib/tsbYatirimGeliriKpi";
import {
  OLCEK_SEGMENT_KPI,
  olcekSegmentHavuzuFromRows,
  type SirketOlcekSegmentSonuc,
} from "../lib/tsbOlcekSegment";
import type { SegmentSkorPool } from "../lib/tsbSirketSegmentSkor";

function loadGelirRows(root: string, donem: string): TsbGelirTidyRowLike[] {
  const perDonem = join(root, "public", "data", "tsb", "gelir-tidy", `${donem}.json`);
  if (existsSync(perDonem)) {
    return JSON.parse(readFileSync(perDonem, "utf8")) as TsbGelirTidyRowLike[];
  }
  const legacy = join(root, "public", "data", "tsb", "gelir-tidy.json");
  if (existsSync(legacy)) {
    const all = JSON.parse(readFileSync(legacy, "utf8")) as TsbGelirTidyRowLike[];
    return all.filter((r) => r.donem === donem);
  }
  const dir = join(root, "public", "data", "tsb", "gelir-tidy");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "index.json");
  const out: TsbGelirTidyRowLike[] = [];
  for (const f of files) {
    const chunk = JSON.parse(readFileSync(join(dir, f), "utf8")) as TsbGelirTidyRowLike[];
    for (const r of chunk) {
      if (r.donem === donem) out.push(r);
    }
  }
  return out;
}

function sirketAdi(rows: TsbGelirTidyRowLike[], donem: string, kod: number): string {
  return rows.find((x) => x.donem === donem && x.sirketKodu === kod)?.sirketAdi?.trim() ?? "";
}

function roundNum(x: number, d: number): number {
  const p = 10 ** d;
  return Math.round(x * p) / p;
}

function buildOzet(
  rows: TsbGelirTidyRowLike[],
  havuz: SirketOlcekSegmentSonuc[],
): (string | number)[][] {
  const header = [
    "donem",
    "pool",
    "olcekSirasi",
    "sirketKodu",
    "sirketAdi",
    "olcekSkoru",
    "olcekSegmenti",
    "olcekSegmentAdi",
    "peerSayisi",
    "brutPrim_TL",
    "ozsermaye_TL",
    "toplamAktif_TL",
    "puan_brutPrim",
    "puan_ozsermaye",
    "puan_toplamAktif",
  ];
  const out: (string | number)[][] = [header];
  for (const s of havuz) {
    const pPrim = s.bilesenler.find((b) => b.kpiId === "brut_prim")?.puan ?? "";
    const pOz = s.bilesenler.find((b) => b.kpiId === "ozsermaye")?.puan ?? "";
    const pAktif = s.bilesenler.find((b) => b.kpiId === "toplam_aktif")?.puan ?? "";
    out.push([
      s.donem,
      s.pool,
      s.olcekSirasi,
      s.sirketKodu,
      sirketAdi(rows, s.donem, s.sirketKodu),
      roundNum(s.olcekSkoru, 2),
      s.olcekSegmenti,
      s.olcekSegmentAdiTr,
      s.peerSayisi,
      roundNum(s.ham.brutPrim, 2),
      roundNum(s.ham.ozsermaye, 2),
      roundNum(s.ham.toplamAktif, 2),
      pPrim === "" ? "" : roundNum(Number(pPrim), 2),
      pOz === "" ? "" : roundNum(Number(pOz), 2),
      pAktif === "" ? "" : roundNum(Number(pAktif), 2),
    ]);
  }
  return out;
}

function main() {
  const root = process.cwd();
  let donem = "2025-4";
  let outPath = "";
  for (const a of process.argv.slice(2)) {
    if (/^\d{4}-\d$/.test(a)) donem = a;
    else if (/\.xlsx$/i.test(a)) {
      outPath =
        a.startsWith("/") || /^[A-Za-z]:[\\/]/.test(a) || a.startsWith("\\\\")
          ? a
          : join(root, a);
    }
  }
  if (!outPath) outPath = join(root, "data", "tsb", "out", `olcek-segment-${donem}.xlsx`);

  const rows = loadGelirRows(root, donem);
  if (rows.length === 0) {
    console.error("Gelir tidy verisi bulunamadi:", donem);
    process.exit(1);
  }

  const notlar: (string | number)[][] = [
    ["Olcek segmenti — notlar"],
    [""],
    ["Amac", "Sirket buyuklugu (prim, ozsermaye, aktif) — performans skorundan ayri."],
    ["KPI agirliklari", "Brut prim %50 · Ozsermaye %30 · Toplam aktif %20"],
    ["Normalizasyon", "Ayni havuz (HD veya HAYAT_EMEKLILIK) icinde min-max → 0-100, agirlikli ortalama = olcekSkoru"],
    [
      "Segment dagilimi",
      "A+ ilk %10 · A sonraki %20 · B %40 · C %20 · D son %10 (olcekSkoru azalan sira)",
    ],
    ["Donem", donem],
    ["KPI tanimlari", ...OLCEK_SEGMENT_KPI.map((k) => `${k.labelTr} (${k.agirlik * 100}%)`)],
  ];

  const pools: SegmentSkorPool[] = ["HD", "HAYAT_EMEKLILIK"];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(notlar), "Notlar");

  for (const pool of pools) {
    const havuz = olcekSegmentHavuzuFromRows(rows, donem, pool);
    const sheetName = pool === "HD" ? "Olcek_HD" : "Olcek_HayatEmeklilik";
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(buildOzet(rows, havuz)), sheetName);
  }

  mkdirSync(dirname(outPath), { recursive: true });
  XLSX.writeFile(wb, outPath);
  console.log("Yazildi:", outPath);
}

main();
