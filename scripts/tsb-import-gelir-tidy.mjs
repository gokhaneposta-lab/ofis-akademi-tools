/**
 * TSB "4 Şirketler Gelir Tablosu Özet …" Excel → branş sayfası bazlı tidy JSON.
 *
 * Sayfa düzeni (veri sayfaları):
 * - Satır 5 (Excel): D5’ten sağa hesap kodları
 * - Satır 6: hesap adları
 * - Satır 7+: A = Şirket adı, B = Şirket kodu, C = Şirket tipi, D… = tutarlar
 *
 * Dönem: dosya adından çeyrek — örn. "... 2025 4(3).xlsx" → "2025-4"
 *
 * Kullanım:
 *   node scripts/tsb-import-gelir-tidy.mjs "path/4 Sirketler Gelir Tablosu Özet 2025 4(3).xlsx"
 *   npm run tsb:import-gelir-tidy -- "data/tsb/incoming/....xlsx"
 *
 * Çıktı: public/data/tsb/gelir-tidy.json (varsayılan; 2. arg ile değiştirilebilir)
 * Ayrıca her import sonunda: data/tsb/out/gelir-tidy-review.xlsx (Excel inceleme, aynı birleşik veri)
 *
 * Birleştirme: Çıktı dosyası varsa, bu dosyadan gelen **aynı donem + tabloTip (GT)** satırları
 * silinir; kalan satırlarla yeni satırlar birleştirilir (prim import ile aynı mantık).
 *
 * Not: "Hayatdışı Branşlar" / "Hayat Branşlar" küçük pivot sayfaları — yapı benzer olsa da
 * satır 2 seçim metni ile kirlenir; tidy’ye dahil edilmez. HAYAT TOPLAM / HAYAT GRUBU TOPLAM
 * özet sayfaları hariç.
 *
 * Hesap kodu olmayan sütunlar (satır 5 boş / boşluk, satır 6’da ad):
 * - Teknik Kar Zarar → __SYN_TKN_KZ__
 * - Toplam Teknik Kar Zarar (MALI) → __SYN_TOP_TKN_KZ__
 * - Mali Kar (MALI) → __SYN_MALI_KAR__
 * Sabitler: lib/tsbGelirSyntheticCodes.ts (Node script ile senkron tutulmalı).
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

/** Özet / navigasyon — D5 hesap ızgarası veya şirket listesi farklı */
const SKIP_SHEETS = new Set([
  "Gelir Tablosu",
  "Branş Kırılımlı Analiz",
  "Hayatdışı Branşlar",
  "Hayat Branşlar",
  "HAYAT TOPLAM",
  "HAYAT GRUBU TOPLAM",
]);

const TSB_TOPLAM_SIRKET_KODLARI = new Set([9000, 9001, 9003]);

const CODE_ROW = 4; // Excel satır 5 → 0-based 4
const NAME_ROW = 5;
const DATA_START_ROW = 6;
const COL_SIRKET_ADI = 0;
const COL_SIRKET_KODU = 1;
const COL_SIRKET_TIPI = 2;
const FIRST_ACCOUNT_COL = 3; // D

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

/** Dosya adından çeyrek: "2025 4(3)" / "2025-4" / "2021-1_suffix" / "... 2026 1 ..." */
function parseDonemFromFilename(filePath) {
  const base = path.basename(filePath).replace(/\.xlsx$/i, "");
  // Çeyrek 1–4: rakamdan sonra başka rakam gelmesin (2021-1_abc); \b tek rakamda _ öncesi patlıyordu
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
    `[tsb-import-gelir-tidy] Dosya adından çeyrek çıkarılamadı (örn. ... 2025 4...): ${base}`,
  );
}

function hesapKoduString(raw) {
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return String(Math.trunc(raw));
  const s = String(raw).trim();
  return s || null;
}

/** lib/tsbGelirSyntheticCodes.ts ile aynı mantık (import yok — .mjs) */
function gelirSyntheticKodFromHesapAdi(hesapAdi) {
  const n = hesapAdi.replace(/\s+/g, " ").trim();
  if (!n) return null;
  const u = n.toLocaleUpperCase("tr-TR");
  if (u.includes("TOPLAM") && u.includes("TEKNİK") && u.includes("KAR") && u.includes("ZARAR")) {
    return "__SYN_TOP_TKN_KZ__";
  }
  if (u === "MALİ KAR" || u === "MALI KAR") {
    return "__SYN_MALI_KAR__";
  }
  if (u.includes("TEKNİK") && u.includes("KAR") && u.includes("ZARAR")) {
    return "__SYN_TKN_KZ__";
  }
  return null;
}

function isLikelyDataSheet(ws) {
  const hdr = cell(ws, NAME_ROW, COL_SIRKET_ADI);
  if (typeof hdr !== "string") return false;
  if (!hdr.includes("Şirket")) return false;
  const k0 = hesapKoduString(cell(ws, CODE_ROW, FIRST_ACCOUNT_COL));
  return k0 !== null;
}

function parseDataSheet(ws, sheetName, donem) {
  const range = XLSX.utils.decode_range(ws["!ref"]);
  const accounts = [];
  for (let c = FIRST_ACCOUNT_COL; c <= range.e.c; c++) {
    const kod = hesapKoduString(cell(ws, CODE_ROW, c));
    const adRaw = cell(ws, NAME_ROW, c);
    const hesapAdi = adRaw !== undefined && adRaw !== null ? String(adRaw).trim() : "";
    if (!hesapAdi) continue;
    let finalKod = kod;
    if (!finalKod) {
      const syn = gelirSyntheticKodFromHesapAdi(hesapAdi);
      if (!syn) continue;
      finalKod = syn;
    }
    accounts.push({ c, kod: finalKod, ad: hesapAdi });
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
        tabloTip: "GT",
        bransAp: sheetName.trim(),
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
    console.error(
      "Kullanım: node scripts/tsb-import-gelir-tidy.mjs <gelir-xlsx> [çıktı.json]",
    );
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
    if (SKIP_SHEETS.has(sheetName)) {
      console.warn(`Atlandı (özet/nav): ${sheetName}`);
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
  const kept = existing.filter(
    (r) => !(r && r.donem === donem && r.tabloTip === "GT"),
  );
  const combined = kept.concat(all);

  fs.writeFileSync(outPath, JSON.stringify(combined), "utf8");
  console.log(
    `\nDönem: ${donem}  tabloTip: GT  Bu dosya: ${all.length} satır  Birleşik toplam: ${combined.length}`,
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
