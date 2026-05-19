/**
 * TSB "1 Şirketler Bilanço Özet …" Excel → `gelir-tidy.json` ile aynı dosyada tidy satırlar.
 *
 * İşlenen sayfalar: yalnızca "Aktif Detay", "Pasif Detay".
 * Sayfa düzeni (her iki sayfa):
 * - Satır 5 (Excel): D5’ten sağa hesap kodları
 * - Satır 6: D… hesap adları (A–C: Şirket Adı / Kodu / Tipi sütun başlıkları)
 * - Satır 7+: A = Şirket adı, B = Şirket kodu, C = Şirket tipi, D… = tutarlar
 *
 * Çıktı satırları:
 * - tabloTip: "BL" (Bilanço; gelir satırları "GT" kalır)
 * - bransAp: "Aktif" | "Pasif" (sayfa adından türetilir)
 *
 * Dönem: dosya adından çeyrek — gelir import ile aynı kurallar.
 *
 * Kullanım:
 *   node scripts/tsb-import-bilanco-tidy.mjs "data/tsb/incoming/1_Sirketler_Bilanco_Ozet_2022-1.xlsx"
 *   npm run tsb:import-bilanco-tidy -- "data/tsb/incoming/....xlsx"
 *
 * Çıktı: public/data/tsb/gelir-tidy.json (varsayılan)
 * Birleştirme: aynı donem + tabloTip (BL) satırları silinir; GT ve diğer dönemler korunur.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import { writeGelirTidyReviewXlsx } from "./tsb-gelir-tidy-write-review-xlsx.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DEFAULT_OUT = path.join(ROOT, "public", "data", "tsb", "gelir-tidy.json");
const REVIEW_XLSX_OUT = path.join(ROOT, "data", "tsb", "out", "gelir-tidy-review.xlsx");

const BILANCO_SHEETS = new Set(["Aktif Detay", "Pasif Detay"]);

const TSB_TOPLAM_SIRKET_KODLARI = new Set([9000, 9001, 9003]);

const CODE_ROW = 4;
const NAME_ROW = 5;
const DATA_START_ROW = 6;
const COL_SIRKET_ADI = 0;
const COL_SIRKET_KODU = 1;
const COL_SIRKET_TIPI = 2;
const FIRST_ACCOUNT_COL = 3;

function cell(ws, r, c) {
  const addr = XLSX.utils.encode_cell({ r, c });
  const z = ws[addr];
  if (!z) return undefined;
  return z.v;
}

function toNumber(v) {
  if (v === undefined || v === null || v === "") return 0;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  let s = String(v).trim();
  if (!s || s === "-") return 0;
  const neg = /^\(.*\)$/.test(s);
  if (neg) s = s.slice(1, -1);
  s = s.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return 0;
  return neg ? -n : n;
}

function normalizeCompanyCode(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? Math.round(v) : parseInt(String(v).trim(), 10);
  return Number.isFinite(n) ? n : null;
}

function parseDonemFromFilename(filePath) {
  const base = path.basename(filePath).replace(/\.xlsx$/i, "");
  let m = base.match(/(\d{4})\s*[-_]\s*([1-4])(?!\d)/);
  if (m) {
    const q = Number(m[2], 10);
    if (q >= 1 && q <= 4) return `${m[1]}-${q}`;
  }
  m = base.match(/(\d{4})\s+(\d)\s*(?:\(|\s*$|\.)/);
  if (m) {
    const q = Number(m[2], 10);
    if (q >= 1 && q <= 4) return `${m[1]}-${q}`;
  }
  throw new Error(
    `[tsb-import-bilanco-tidy] Dosya adından çeyrek çıkarılamadı (örn. ... 2022-1...): ${base}`,
  );
}

function hesapKoduString(raw) {
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return String(Math.trunc(raw));
  const s = String(raw).trim();
  return s || null;
}

function bransApFromSheet(sheetName) {
  const s = sheetName.trim();
  if (s.startsWith("Aktif")) return "Aktif";
  if (s.startsWith("Pasif")) return "Pasif";
  return s;
}

function isLikelyDataSheet(ws) {
  const hdr = cell(ws, NAME_ROW, COL_SIRKET_ADI);
  if (typeof hdr !== "string") return false;
  if (!hdr.includes("Şirket")) return false;
  const k0 = hesapKoduString(cell(ws, CODE_ROW, FIRST_ACCOUNT_COL));
  return k0 !== null;
}

function parseDataSheet(ws, sheetName, donem) {
  const bransAp = bransApFromSheet(sheetName);
  const range = XLSX.utils.decode_range(ws["!ref"]);
  const accounts = [];
  for (let c = FIRST_ACCOUNT_COL; c <= range.e.c; c++) {
    const kod = hesapKoduString(cell(ws, CODE_ROW, c));
    const adRaw = cell(ws, NAME_ROW, c);
    const hesapAdi = adRaw !== undefined && adRaw !== null ? String(adRaw).trim() : "";
    if (!hesapAdi) continue;
    if (!kod) continue;
    accounts.push({ c, kod, ad: hesapAdi });
  }
  if (accounts.length === 0) return [];

  const rows = [];
  for (let r = DATA_START_ROW; r <= range.e.r; r++) {
    const sirketAdi = cell(ws, r, COL_SIRKET_ADI);
    const sirketKodu = normalizeCompanyCode(cell(ws, r, COL_SIRKET_KODU));
    const tipRaw = cell(ws, r, COL_SIRKET_TIPI);
    if (sirketKodu === null) continue;
    if (TSB_TOPLAM_SIRKET_KODLARI.has(sirketKodu)) continue;

    const adStr = sirketAdi != null ? String(sirketAdi).trim() : "";
    if (!adStr) continue;
    if (/^toplam\b/i.test(adStr)) continue;

    const sirketTipi = tipRaw !== undefined && tipRaw !== null ? String(tipRaw).trim() : "";

    for (const { c, kod, ad } of accounts) {
      const deger = toNumber(cell(ws, r, c));
      if (deger === 0) continue;
      rows.push({
        donem,
        tabloTip: "BL",
        bransAp,
        sirketTipi,
        sirketKodu,
        sirketAdi: adStr,
        hesapKodu: kod,
        hesapAdi: ad,
        deger,
      });
    }
  }
  return rows;
}

async function main() {
  const inPath = process.argv[2];
  const outPath = process.argv[3] || DEFAULT_OUT;
  if (!inPath) {
    console.error("Kullanım: node scripts/tsb-import-bilanco-tidy.mjs <bilanço-xlsx> [çıktı.json]");
    process.exit(1);
  }
  const abs = path.isAbsolute(inPath) ? inPath : path.join(ROOT, inPath);
  if (!fs.existsSync(abs)) {
    console.error(`Dosya yok: ${abs}`);
    process.exit(1);
  }

  const donem = parseDonemFromFilename(abs);
  const wb = XLSX.readFile(abs);
  const all = [];

  for (const sheetName of wb.SheetNames) {
    if (!BILANCO_SHEETS.has(sheetName)) {
      console.warn(`Atlandı (bilanço detay değil): ${sheetName}`);
      continue;
    }
    const ws = wb.Sheets[sheetName];
    if (!ws || !ws["!ref"]) {
      console.warn(`Boş sayfa: ${sheetName}`);
      continue;
    }
    if (!isLikelyDataSheet(ws)) {
      console.warn(`Atlandı (veri ızgarası yok): ${sheetName}`);
      continue;
    }
    const part = parseDataSheet(ws, sheetName, donem);
    console.log(`${sheetName}: ${part.length} satır`);
    all.push(...part);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  let existing = [];
  if (fs.existsSync(outPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(outPath, "utf8"));
      if (!Array.isArray(existing)) existing = [];
    } catch {
      existing = [];
    }
  }
  const kept = existing.filter((r) => !(r && r.donem === donem && r.tabloTip === "BL"));
  const combined = kept.concat(all);

  fs.writeFileSync(outPath, JSON.stringify(combined), "utf8");
  console.log(
    `\nDönem: ${donem}  tabloTip: BL  Bu dosya: ${all.length} satır  Birleşik toplam: ${combined.length}`,
  );
  console.log(`Yazıldı: ${outPath}`);

  console.log("Excel inceleme dosyası yazılıyor…");
  writeGelirTidyReviewXlsx(combined, REVIEW_XLSX_OUT);
  console.log(`Excel: ${REVIEW_XLSX_OUT}`);

  console.log("\nDönem bazlı public dosyaları (B′)…");
  const { splitGelirTidyByDonem } = await import("./tsb-split-gelir-tidy-by-donem.mjs");
  splitGelirTidyByDonem(outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
