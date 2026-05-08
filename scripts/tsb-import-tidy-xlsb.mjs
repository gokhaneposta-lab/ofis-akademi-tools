/**
 * Hazır tidy tabloyu (.xlsb veya .xlsx) prim-tidy.json ile birleştirir.
 *
 * Öntanımlı sayfa adı: "kanal bazlı prim" (SEKTÖR PRİM ADET ANALİZ çalışma kitabı).
 *
 * tsb-import-prim.mjs ile aynı iş kuralları:
 * - Şirket kodu 9000 / 9001 / 9003 yok
 * - Branş kodu yalnızca lookup’ta olan 7xx ve 903 (900–902 vb. yok)
 * - Genel toplam === 0 satır yok
 * - anaBransH / tarifeGrubu: branch-lookup.json (tek kaynak)
 *
 * Birleştirme: İçe aktarılan dosyada görünen her dönem için mevcut prim-tidy.json’daki
 * o döneme ait satırlar silinir; yenileri eklenir (diğer dönemler aynı kalır).
 *
 * Kullanım:
 *   npm run tsb:import-tidy-xlsb -- "path/rapor.xlsb"
 *   npm run tsb:import-tidy-xlsb -- "path/rapor.xlsb" "kanal bazlı prim"
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LOOKUP_PATH = path.join(ROOT, "data", "tsb", "branch-lookup.json");
const DEFAULT_OUT = path.join(ROOT, "public", "data", "tsb", "prim-tidy.json");

const TSB_TOPLAM_SIRKET_KODLARI = new Set([9000, 9001, 9003]);

function normalizeKeys(raw) {
  const r = {};
  for (const [k, v] of Object.entries(raw)) {
    r[String(k).trim()] = v;
  }
  return r;
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
  return Number.isFinite(n) ? (neg ? -n : n) : 0;
}

function roundCode(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? Math.round(v) : parseInt(String(v).trim(), 10);
  return Number.isFinite(n) ? n : null;
}

function isAllowedBranchColumn(code, lookup) {
  const key = String(code);
  if (!lookup[key]) return false;
  if (code >= 700 && code <= 799) return true;
  if (code === 903) return true;
  return false;
}

function pick(r, ...names) {
  for (const n of names) {
    if (r[n] !== undefined && r[n] !== null && r[n] !== "") return r[n];
  }
  return undefined;
}

function pickGenelToplam(r) {
  const v = pick(r, "Genel Toplam", "Genel Toplam ", " Genel Toplam ");
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return toNumber(v);
}

function parseSheet(wb, sheetName, lookup) {
  const ws = wb.Sheets[sheetName];
  if (!ws || !ws["!ref"]) {
    throw new Error(`[tsb-import-tidy-xlsb] Sayfa yok veya boş: ${sheetName}`);
  }
  const rawRows = XLSX.utils.sheet_to_json(ws, { defval: null });
  const out = [];
  const periods = new Set();

  for (const raw of rawRows) {
    const r = normalizeKeys(raw);
    const donemRaw = pick(r, "Dönem", "Dönem ");
    const donem = String(donemRaw ?? "")
      .trim()
      .replace(/\s+/g, "");
    if (!donem) continue;

    const sirketKodu = roundCode(pick(r, "Şirket Kodu"));
    if (sirketKodu === null) continue;
    if (TSB_TOPLAM_SIRKET_KODLARI.has(sirketKodu)) continue;

    const bransKodu = roundCode(pick(r, "Branş Kodu", "Branş Kodu "));
    if (bransKodu === null || !isAllowedBranchColumn(bransKodu, lookup)) continue;

    const lu = lookup[String(bransKodu)];
    if (!lu) continue;

    const genelToplam = pickGenelToplam(r);
    if (!Number.isFinite(genelToplam) || genelToplam === 0) continue;

    const acente = toNumber(pick(r, "Acente", " Acente ", "Acente "));
    const banka = toNumber(pick(r, "Banka"));
    const broker = toNumber(pick(r, "Broker"));
    const diger = toNumber(pick(r, "Diğer"));
    const merkez = toNumber(pick(r, "Merkez"));

    const sirketTipi = String(pick(r, "ŞirkHt Tipi", "Şirket Tipi") ?? "").trim();
    const sirketAdi = String(pick(r, "Şirket Adı") ?? "").trim();
    const bransAd = String(pick(r, "Branş Ad") ?? "").trim();
    const trafikEk = toNumber(pick(r, "Şirket Branş Trafik Ek"));

    periods.add(donem);
    out.push({
      donem,
      sirketTipi,
      sirketKodu,
      anaBransH: lu.anaBrans,
      sirketAdi,
      bransKodu,
      bransAd,
      acente,
      banka,
      broker,
      diger,
      merkez,
      genelToplam,
      tarifeGrubu: lu.tarifeGrubu,
      sirketBransTrafikEk: Number.isFinite(trafikEk) ? trafikEk : 0,
    });
  }

  out.sort((a, b) => {
    if (a.donem !== b.donem) return a.donem.localeCompare(b.donem);
    if (a.sirketKodu !== b.sirketKodu) return a.sirketKodu - b.sirketKodu;
    return a.bransKodu - b.bransKodu;
  });

  return { rows: out, periods };
}

function main() {
  const inputPath = process.argv[2];
  const sheetName = process.argv[3] || "kanal bazlı prim";
  const outPath = process.argv[4] ? path.resolve(process.argv[4]) : DEFAULT_OUT;

  if (!inputPath) {
    console.error(
      'Kullanım: node scripts/tsb-import-tidy-xlsb.mjs <dosya.xlsb|xlsx> ["sayfa adı"] [çıktı.json]',
    );
    process.exit(1);
  }

  const resolved = path.resolve(inputPath);
  if (!fs.existsSync(resolved)) {
    console.error(`[tsb-import-tidy-xlsb] Dosya yok: ${resolved}`);
    process.exit(1);
  }

  const lookup = JSON.parse(fs.readFileSync(LOOKUP_PATH, "utf8"));
  const wb = XLSX.readFile(resolved, { cellDates: false });
  if (!wb.SheetNames.includes(sheetName)) {
    console.error(
      `[tsb-import-tidy-xlsb] Sayfa "${sheetName}" yok. Mevcut: ${wb.SheetNames.join(", ")}`,
    );
    process.exit(1);
  }

  const { rows: imported, periods } = parseSheet(wb, sheetName, lookup);

  let existing = [];
  if (fs.existsSync(outPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(outPath, "utf8"));
      if (!Array.isArray(existing)) existing = [];
    } catch {
      existing = [];
    }
  }

  const kept = existing.filter((r) => r && r.donem && !periods.has(r.donem));
  const combined = kept.concat(imported);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(combined), "utf8");

  console.log(
    `[tsb-import-tidy-xlsb] ${imported.length} satır (${periods.size} dönem) yazıldı; ` +
      `dosya toplam ${combined.length} satır → ${path.relative(ROOT, outPath)}`,
  );
}

main();
