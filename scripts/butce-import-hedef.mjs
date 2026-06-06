/**
 * 2027 (veya benzeri) prim hedef Excel → data/butce/private/hedef-prim.json
 *
 *   npm run butce:import-hedef -- "C:/Users/.../2027 Hedef.xlsx"
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "data", "butce", "private");
const OUT_FILE = path.join(OUT_DIR, "hedef-prim.json");
const META_FILE = path.join(OUT_DIR, "meta.json");

const GM_TARIFE = {
  TRAFIK: "TRAFİK",
  "KAZA OTO": "KASKO",
  KASKO: "KASKO",
  DASK: "DASK",
  YANGIN: "YANGIN",
  NAKLIYAT: "NAKLİYAT",
  NAKLİYAT: "NAKLİYAT",
  "DİĞER KAZA": "DİĞER KAZA",
  SAĞLIK: "SAĞLIK",
  MÜHENDISLIK: "MÜHENDİSLİK",
  MÜHENDİSLİK: "MÜHENDİSLİK",
  TARSİM: "TARSİM",
};

const HP_TARIFE_TO_BRANS_AP = {
  KASKO: "KASKO",
  TRAFİK: "TRAFİK",
  YANGIN: "YANGIN VE DOĞAL AFETLER",
  DASK: "YANGIN VE DOĞAL AFETLER",
  NAKLİYAT: "NAKLİYAT",
  "FERDİ KAZA": "KAZA",
  "DİĞER KAZA": "KAZA",
  SAĞLIK: "HASTALIK-SAĞLIK",
  HAYAT: "HAYAT",
  MÜHENDİSLİK: "MÜHENDİSLİK SİGORTALARI",
  TARSİM: "DEV. DEST. TARIM SİGORTALARI",
};

function normalizeTarife(raw) {
  const t = String(raw ?? "").trim().toLocaleUpperCase("tr-TR");
  return GM_TARIFE[t] ?? t;
}

function bransAp(tarifeNorm) {
  return HP_TARIFE_TO_BRANS_AP[tarifeNorm] ?? null;
}

function detectHedefYil(rows) {
  const keys = Object.keys(rows[0] ?? {}).filter((k) => /^\d{4}\s+Hedef$/i.test(k) || /Hedef$/i.test(k));
  for (const k of keys) {
    const m = k.match(/(\d{4})/);
    if (m) return Number(m[1]);
  }
  return 2027;
}

function hedefColumnKey(rows) {
  const keys = Object.keys(rows[0] ?? {});
  const yilKey = keys.find((k) => /^\d{4}\s+Hedef$/i.test(k));
  if (yilKey) return yilKey;
  return keys.find((k) => /Hedef/i.test(k)) ?? "2027 Hedef";
}

function readMeta() {
  if (!fs.existsSync(META_FILE)) return { schemaVersion: 1 };
  try {
    return JSON.parse(fs.readFileSync(META_FILE, "utf8"));
  } catch {
    return { schemaVersion: 1 };
  }
}

function main() {
  const input = process.argv[2];
  if (!input) {
    console.error('Kullanım: npm run butce:import-hedef -- "path/2027 Hedef.xlsx"');
    process.exit(1);
  }
  const abs = path.resolve(input);
  if (!fs.existsSync(abs)) {
    console.error("[butce] Dosya yok:", abs);
    process.exit(1);
  }

  const wb = XLSX.readFile(abs, { cellDates: true });
  const sheet = wb.SheetNames[0];
  const raw = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { defval: "" });
  if (raw.length === 0) {
    console.error("[butce] Boş sayfa");
    process.exit(1);
  }

  const hedefKey = hedefColumnKey(raw);
  const hedefYil = detectHedefYil(raw);
  const rows = [];
  let total = 0;
  let unmapped = 0;

  for (const r of raw) {
    const tarifeGrupAdi = String(r["Tarife Grup Adı"] ?? r["Tarife Grup Adi"] ?? "").trim();
    if (!tarifeGrupAdi) continue;
    const tutar = Number(r[hedefKey]);
    if (!Number.isFinite(tutar) || tutar === 0) continue;

    const tarifeGrupNorm = normalizeTarife(tarifeGrupAdi);
    const brans = bransAp(tarifeGrupNorm);
    if (!brans) unmapped++;

    rows.push({
      sirketKodu: String(r.Şirket ?? r.Sirket ?? "BS").trim(),
      kanal1: String(r["KANAL 1_"] ?? r.KANAL1 ?? "").trim(),
      kanal2: String(r.KANAL_2_ ?? r.KANAL2 ?? "").trim(),
      tarifeGrupAdi,
      tarifeGrupNorm,
      bransAp: brans,
      hedefYil,
      hedefTutar: tutar,
    });
    total += tutar;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(rows, null, 2)}\n`, "utf8");

  const meta = {
    ...readMeta(),
    schemaVersion: 1,
    hedefGuncellemeIso: new Date().toISOString(),
    hedefYil,
    hedefToplam: total,
    hedefSatirSayisi: rows.length,
  };
  fs.writeFileSync(META_FILE, `${JSON.stringify(meta, null, 2)}\n`, "utf8");

  console.log(`[butce] Hedef → ${OUT_FILE}`);
  console.log(`  satır: ${rows.length}, yıl: ${hedefYil}, toplam: ${total.toLocaleString("tr-TR")}`);
  if (unmapped) console.warn(`  uyarı: ${unmapped} satırda bransAp eşlemesi yok`);
}

main();
