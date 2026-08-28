/**
 * Segment skoru tablosu (stdout). Havuz: HD veya Hayat/Emeklilik.
 * Kullanım: npx --yes tsx scripts/tsb-segment-skor-rapor.ts [donem] [pool]
 * pool: HD (varsayılan) | HE (HAYAT_EMEKLILIK)
 * Örn.: npx --yes tsx scripts/tsb-segment-skor-rapor.ts 2025-4 HE
 */

import {
  latestDonemFromList,
  readGelirDonem,
  readGelirIndex,
  readMeta,
} from "./lib/tsb-readonly-helpers";
import {
  segmentPeerSirketKodlari,
  sirketSegmentSkoruFromRows,
  type SegmentSkorPool,
} from "../lib/tsbSirketSegmentSkor";

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
  const index = readGelirIndex();
  const meta = readMeta();
  let donem = meta?.sonFinansalDonem ?? latestDonemFromList(index);
  let pool: SegmentSkorPool = "HD";
  for (const a of process.argv.slice(2)) {
    if (/^\d{4}-\d$/.test(a)) donem = a;
    else pool = parsePool(a);
  }

  const rows = readGelirDonem(donem);
  if (rows.length === 0) {
    console.error(`gelir-tidy/${donem}.json yok veya boş`);
    process.exit(1);
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
