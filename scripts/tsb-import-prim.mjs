/**
 * TSB "Satış Kanalı Bazında Primler" Excel → tidy JSON birleştirme.
 *
 * Kullanım:
 *   node scripts/tsb-import-prim.mjs path/to/dosya.xlsx
 * veya dosyayı data/tsb/incoming/ altına koyup:
 *   npm run tsb:import-prim -- data/tsb/incoming/prim-2026-03.xlsx
 *
 * Dönem: dosya adından YYYY-MM (ör. "...2026 03..." veya "prim-2026-03.xlsx").
 * Aynı dönem tekrar içe aktarılırsa public/data/tsb/prim-tidy.json içindeki o dönem satırları silinip yenisi yazılır.
 *
 * Şirket kodu 9000 / 9001 / 9003 (TSB alt toplamları) satırları atlanır.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LOOKUP_PATH = path.join(ROOT, "data", "tsb", "branch-lookup.json");
const DEFAULT_OUT = path.join(ROOT, "public", "data", "tsb", "prim-tidy.json");

/** Son 5 kanal sayfası (Hayat Grubu Toplam hariç) */
const CHANNEL_SHEETS = [
  ["Merkez", "merkez"],
  ["Acente", "acente"],
  ["Banka", "banka"],
  ["Broker", "broker"],
  ["Diğer", "diger"],
];

const CODE_ROW = 4;
const NAME_ROW = 5;
const DATA_START_ROW = 6;
const COL_SIRKET_ADI = 0;
const COL_SIRKET_KODU = 1;
const COL_SIRKET_TIPI = 2;
const FIRST_BRANCH_COL = 3;

/** TSB Excel'deki sektör alt toplam satırları (şirket kodu) — tabloya dahil edilmez */
const TSB_TOPLAM_SIRKET_KODLARI = new Set([9000, 9001, 9003]);

function parsePeriodFromFilename(filePath) {
  const base = path.basename(filePath).replace(/\.xlsx$/i, "");
  const patterns = [/(\d{4})[\s\-_.]+(\d{2})\b/, /\b(\d{4})(\d{2})\b/];
  for (const re of patterns) {
    const m = base.match(re);
    if (!m) continue;
    const y = m[1];
    const mo = Number(m[2], 10);
    if (mo >= 1 && mo <= 12) return `${y}-${String(mo).padStart(2, "0")}`;
  }
  throw new Error(
    `[tsb-import-prim] Dosya adından dönem çıkarılamadı (YYYY-MM veya YYYY MM): ${base}`,
  );
}

function cell(ws, r, c) {
  const addr = XLSX.utils.encode_cell({ r, c });
  const z = ws[addr];
  if (!z) return undefined;
  return z.v;
}

function normalizeCompanyCode(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? Math.round(v) : parseInt(String(v).trim(), 10);
  return Number.isFinite(n) ? n : null;
}

function normalizeBranchCode(v) {
  if (v === undefined || v === null || v === "") return null;
  const n =
    typeof v === "number" ? Math.round(v) : parseInt(String(v).trim(), 10);
  return Number.isFinite(n) ? n : null;
}

function isAllowedBranchColumn(code, lookup) {
  const key = String(code);
  if (!lookup[key]) return false;
  if (code >= 700 && code <= 799) return true;
  if (code === 903) return true;
  return false;
}

function toNumber(v) {
  if (v === undefined || v === null || v === "") return 0;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  let s = String(v).trim();
  if (!s) return 0;
  const neg = /^\(.*\)$/.test(s);
  if (neg) s = s.slice(1, -1);
  s = s.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return 0;
  return neg ? -n : n;
}

function parseSheet(wb, sheetName, channelField, lookup, merged) {
  const ws = wb.Sheets[sheetName];
  if (!ws || !ws["!ref"]) {
    throw new Error(`[tsb-import-prim] Sayfa bulunamadı veya boş: ${sheetName}`);
  }
  const range = XLSX.utils.decode_range(ws["!ref"]);
  const branchCols = [];

  for (let c = FIRST_BRANCH_COL; c <= range.e.c; c++) {
    const raw = cell(ws, CODE_ROW, c);
    const code = normalizeBranchCode(raw);
    if (code === null) continue;
    if (!isAllowedBranchColumn(code, lookup)) continue;
    branchCols.push({ c, code });
  }

  if (branchCols.length === 0) {
    throw new Error(`[tsb-import-prim] ${sheetName}: geçerli branş kolonu yok (7xx + 903 + lookup).`);
  }

  for (let r = DATA_START_ROW; r <= range.e.r; r++) {
    const sirketAdi = String(cell(ws, r, COL_SIRKET_ADI) ?? "").trim();
    const kod = normalizeCompanyCode(cell(ws, r, COL_SIRKET_KODU));
    if (kod === null) continue;
    if (TSB_TOPLAM_SIRKET_KODLARI.has(kod)) continue;
    const sirketTipi = String(cell(ws, r, COL_SIRKET_TIPI) ?? "").trim();

    for (const { c, code } of branchCols) {
      const bransAd = String(cell(ws, NAME_ROW, c) ?? "").trim();
      const val = toNumber(cell(ws, r, c));
      const key = `${kod}|${code}`;
      let row = merged.get(key);
      if (!row) {
        row = {
          sirketKodu: kod,
          sirketAdi,
          sirketTipi,
          bransKodu: code,
          bransAd,
          acente: 0,
          banka: 0,
          broker: 0,
          diger: 0,
          merkez: 0,
        };
        merged.set(key, row);
      }
      row[channelField] = val;
      if (sirketAdi) row.sirketAdi = sirketAdi;
      if (sirketTipi) row.sirketTipi = sirketTipi;
      if (bransAd) row.bransAd = bransAd;
    }
  }
}

function main() {
  const inputArg = process.argv[2];
  const outPath = process.argv[3] ? path.resolve(process.argv[3]) : DEFAULT_OUT;

  if (!inputArg) {
    console.error(
      "Kullanım: node scripts/tsb-import-prim.mjs <girdi.xlsx> [çıktı.json]\n" +
        `Öntanımlı çıktı: ${path.relative(ROOT, DEFAULT_OUT)}`,
    );
    process.exit(1);
  }

  const inputPath = path.resolve(inputArg);
  if (!fs.existsSync(inputPath)) {
    console.error(`[tsb-import-prim] Dosya yok: ${inputPath}`);
    process.exit(1);
  }

  const lookup = JSON.parse(fs.readFileSync(LOOKUP_PATH, "utf8"));
  const period = parsePeriodFromFilename(inputPath);

  const wb = XLSX.readFile(inputPath, { cellDates: false, dense: false });
  const merged = new Map();

  for (const [sheetName, field] of CHANNEL_SHEETS) {
    parseSheet(wb, sheetName, field, lookup, merged);
  }

  const newRows = [];
  for (const row of merged.values()) {
    const genelToplam = row.acente + row.banka + row.broker + row.diger + row.merkez;
    if (genelToplam === 0) continue;

    const lu = lookup[String(row.bransKodu)];
    if (!lu) continue;

    newRows.push({
      donem: period,
      sirketTipi: row.sirketTipi,
      sirketKodu: row.sirketKodu,
      anaBransH: lu.anaBrans,
      sirketAdi: row.sirketAdi,
      bransKodu: row.bransKodu,
      bransAd: row.bransAd,
      acente: row.acente,
      banka: row.banka,
      broker: row.broker,
      diger: row.diger,
      merkez: row.merkez,
      genelToplam,
      tarifeGrubu: lu.tarifeGrubu,
      sirketBransTrafikEk: 0,
    });
  }

  newRows.sort((a, b) => {
    if (a.sirketKodu !== b.sirketKodu) return a.sirketKodu - b.sirketKodu;
    return a.bransKodu - b.bransKodu;
  });

  let existing = [];
  if (fs.existsSync(outPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(outPath, "utf8"));
      if (!Array.isArray(existing)) existing = [];
    } catch {
      existing = [];
    }
  }

  const kept = existing.filter((r) => r && r.donem !== period);
  const combined = kept.concat(newRows);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(combined), "utf8");

  console.log(
    `[tsb-import-prim] Dönem ${period}: +${newRows.length} satır yazıldı; ` +
      `toplam ${combined.length} satır → ${path.relative(ROOT, outPath)}`,
  );
}

main();
