/**
 * TARIFE_MAP çıktısı — Blob/yerel JSON veya BUTCE_MAP.xlsx
 * Kullanım: npx tsx scripts/butce-export-tarife-map.mjs [excel-yolu]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import XLSX from "xlsx";

const envPath = join(process.cwd(), ".env.local");
if (existsSync(envPath) && !process.env.BLOB_READ_WRITE_TOKEN) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = /^([^#=]+)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const OUT_DIR = join(process.cwd(), "public", "data", "butce", "out");
const excelArg = process.argv[2];

let rows = [];
let kaynak = "";

if (excelArg && existsSync(excelArg)) {
  const { importTarifeMapFromBuffer } = await import("../lib/butce/import/tarifeMapImport.ts");
  const buf = readFileSync(excelArg);
  const r = importTarifeMapFromBuffer(buf);
  rows = r.rows;
  kaynak = `excel:${excelArg}`;
} else {
  const local = join(process.cwd(), "data", "butce", "private", "tarife-map.json");
  if (existsSync(local)) {
    rows = JSON.parse(readFileSync(local, "utf8"));
    kaynak = "local:tarife-map.json";
  } else {
    const { loadTarifeMapRows } = await import("../lib/butce/loadData.ts");
    rows = await loadTarifeMapRows();
    kaynak = rows.length ? "blob:tarife-map.json" : "bos";
  }
}

if (rows.length === 0) {
  console.error("TARIFE_MAP bulunamadı.");
  console.error("Yol 1: BUTCE_MAP.xlsx yükleyin (canlı) veya");
  console.error('Yol 2: node scripts/butce-export-tarife-map.mjs "C:/.../BUTCE_MAP.xlsx"');
  process.exit(1);
}

rows.sort((a, b) => {
  const tg = a.tarifeGrubu.localeCompare(b.tarifeGrubu, "tr");
  if (tg !== 0) return tg;
  return a.bransKodu.localeCompare(b.bransKodu);
});

mkdirSync(OUT_DIR, { recursive: true });
const jsonPath = join(OUT_DIR, "tarife-map-export.json");
const xlsxPath = join(OUT_DIR, "tarife-map-export.xlsx");
const csvPath = join(OUT_DIR, "tarife-map-export.csv");

writeFileSync(
  jsonPath,
  JSON.stringify({ kaynak, guncellemeIso: new Date().toISOString(), satirSayisi: rows.length, rows }, null, 2),
);

const sheetRows = [
  ["BransKodu", "HazineBransAd", "AnaBrans", "SirketBransAd", "TarifeGrubu"],
  ...rows.map((r) => [r.bransKodu, r.hazineBransAd, r.anaBrans, r.sirketBransAd, r.tarifeGrubu]),
];
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheetRows), "TARIFE_MAP");
XLSX.writeFile(wb, xlsxPath);

const csv = sheetRows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
writeFileSync(csvPath, "\uFEFF" + csv, "utf8");

// Özet: tarife grubu başına branş sayısı
const ozet = new Map();
for (const r of rows) {
  ozet.set(r.tarifeGrubu, (ozet.get(r.tarifeGrubu) ?? 0) + 1);
}
console.log(`Kaynak: ${kaynak}`);
console.log(`Toplam branş: ${rows.length}`);
console.log("\nTarife grubu özeti:");
for (const [tg, n] of [...ozet.entries()].sort((a, b) => a[0].localeCompare(b[0], "tr"))) {
  const branslar = rows.filter((r) => r.tarifeGrubu === tg).map((r) => r.bransKodu).join(", ");
  console.log(`  ${tg}: ${n} branş → ${branslar}`);
}
console.log(`\nYazıldı:\n  ${xlsxPath}\n  ${csvPath}\n  ${jsonPath}`);
