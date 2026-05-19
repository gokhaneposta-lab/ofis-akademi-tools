/**
 * Segment skoru tablosu (stdout). Havuz: HD veya Hayat/Emeklilik.
 * Kullanım: npx --yes tsx scripts/tsb-segment-skor-rapor.ts [donem] [pool]
 * pool: HD (varsayılan) | HE (HAYAT_EMEKLILIK)
 * Örn.: npx --yes tsx scripts/tsb-segment-skor-rapor.ts 2025-4 HE
 */

import { readFileSync } from "fs";
import { join } from "path";
import {
  segmentPeerSirketKodlari,
  sirketSegmentSkoruFromRows,
  type SegmentSkorPool,
} from "../lib/tsbSirketSegmentSkor";
import type { TsbGelirTidyRowLike } from "../lib/tsbYatirimGeliriKpi";

function latestDonem(rows: TsbGelirTidyRowLike[]): string {
  let max = "";
  for (const r of rows) {
    if (typeof r.donem === "string" && r.donem > max) max = r.donem;
  }
  return max;
}

function parsePool(arg: string | undefined): SegmentSkorPool {
  const u = String(arg ?? "")
    .trim()
    .toUpperCase();
  if (u === "HE" || u === "HAYAT" || u === "HAYAT_EMEKLILIK" || u === "EMEKLILIK") {
    return "HAYAT_EMEKLILIK";
  }
  return "HD";
}

function main() {
  const root = process.cwd();
  const pathJson = join(root, "public", "data", "tsb", "gelir-tidy.json");
  const rows = JSON.parse(readFileSync(pathJson, "utf8")) as TsbGelirTidyRowLike[];

  let donem = latestDonem(rows);
  let pool: SegmentSkorPool = "HD";
  for (const a of process.argv.slice(2)) {
    if (/^\d{4}-\d$/.test(a)) donem = a;
    else pool = parsePool(a);
  }

  const peers = segmentPeerSirketKodlari(rows, donem, pool);
  const satirlar: { sira: number; sirketKodu: number; sirketAdi: string; segmentSkoru: number }[] =
    [];

  for (const kod of peers) {
    const son = sirketSegmentSkoruFromRows(rows, donem, kod, { pool });
    if (!son) continue;
    const ad =
      rows.find((x) => x.donem === donem && x.sirketKodu === kod)?.sirketAdi?.trim() ?? "";
    satirlar.push({ sira: 0, sirketKodu: kod, sirketAdi: ad, segmentSkoru: son.segmentSkoru });
  }

  satirlar.sort((a, b) => b.segmentSkoru - a.segmentSkoru);
  satirlar.forEach((r, i) => {
    r.sira = i + 1;
  });

  console.log(
    `donem=${donem}  pool=${pool}  sirket=${satirlar.length}  (segment skoru 0–100)`,
  );
  console.log("");
  for (const r of satirlar) {
    const sk = r.segmentSkoru.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
    console.log(`${String(r.sira).padStart(2)}  ${r.sirketKodu}\t${sk}\t${r.sirketAdi}`);
  }
}

main();
