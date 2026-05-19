/**
 * gelir-tidy satırları → Excel (inceleme). Import sonrası otomatik + ayrı komut.
 */
import fs from "fs";
import path from "path";
import XLSX from "xlsx";

export const GELIR_TIDY_COLS = [
  "donem",
  "tabloTip",
  "bransAp",
  "sirketTipi",
  "sirketKodu",
  "sirketAdi",
  "hesapKodu",
  "hesapAdi",
  "deger",
];

export function writeGelirTidyReviewXlsx(rows, outPath) {
  const aoa = [GELIR_TIDY_COLS];
  for (const r of rows) {
    aoa.push(GELIR_TIDY_COLS.map((k) => r[k] ?? ""));
  }
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [
    { wch: 8 },
    { wch: 6 },
    { wch: 32 },
    { wch: 6 },
    { wch: 10 },
    { wch: 48 },
    { wch: 12 },
    { wch: 52 },
    { wch: 18 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "gelir-tidy");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  XLSX.writeFile(wb, outPath);
}

export function readGelirTidyJson(jsonPath) {
  const raw = fs.readFileSync(jsonPath, "utf8");
  const rows = JSON.parse(raw);
  if (!Array.isArray(rows)) throw new Error("gelir-tidy.json dizi değil");
  return rows;
}
