/**
 * BUTCE_MAP.xlsx → MIZAN sayfası → mizan-tidy.json
 * Kullanım: node scripts/butce-import-mizan.mjs <excel-yolu> [butce-yili]
 */
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRIVATE = join(__dirname, "..", "data", "butce", "private");

function normalizeBransKodu(value) {
  if (value == null || value === "") return "";
  let s = String(value).trim().replace(/\.0$/, "");
  if (/^\d+$/.test(s)) return s.length <= 3 ? s.padStart(3, "0") : s;
  return s;
}

function importMizan(excelPath, butceYili = 2027) {
  const wb = XLSX.readFile(excelPath, { cellDates: false });
  const sheet = wb.Sheets["MIZAN"];
  if (!sheet) throw new Error("MIZAN sayfası bulunamadı");

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  const out = [];

  for (const row of rows) {
    if (!row || row.length < 5) continue;
    const yil = Number(row[0]);
    if (!Number.isFinite(yil)) continue;
    const hesap = String(row[1] ?? "").replace(/\.0$/, "");
    const bransKodu = normalizeBransKodu(row[3]);
    const tutar = Number(row[4]) || 0;
    if (!bransKodu || bransKodu === "TOPLAM") continue;
    out.push({ yil, hesap, bransKodu, tutar });
  }

  if (out.length === 0) throw new Error("MIZAN satırı okunamadı");

  const yillar = out.map((r) => r.yil);
  const meta = {
    schemaVersion: 2,
    butceYili,
    mizanGuncellemeIso: new Date().toISOString(),
    mizanYilMin: Math.min(...yillar),
    mizanYilMax: Math.max(...yillar),
    mizanSatirSayisi: out.length,
  };

  mkdirSync(PRIVATE, { recursive: true });
  writeFileSync(join(PRIVATE, "mizan-tidy.json"), JSON.stringify(out));
  writeFileSync(join(PRIVATE, "meta.json"), JSON.stringify(meta, null, 2));

  console.log(`MIZAN: ${out.length} satır, yıl ${meta.mizanYilMin}–${meta.mizanYilMax}`);
  return { meta, satir: out.length };
}

const excelPath = process.argv[2];
const butceYili = parseInt(process.argv[3] ?? "2027", 10);

if (!excelPath) {
  console.error("Kullanım: node scripts/butce-import-mizan.mjs <BUTCE_MAP.xlsx> [butce-yili]");
  process.exit(1);
}

try {
  importMizan(excelPath, butceYili);
} catch (e) {
  console.error(e.message ?? e);
  process.exit(1);
}
