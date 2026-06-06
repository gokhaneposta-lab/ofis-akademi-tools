/**
 * Bereket aylık GT + Bilanço unpivot Excel → data/butce/private/gt-bl-tidy.json
 *
 *   npm run butce:import-gt-bl -- "C:/Users/.../Aylık GT ve Bilanço.xlsx"
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "data", "butce", "private");
const OUT_FILE = path.join(OUT_DIR, "gt-bl-tidy.json");
const META_FILE = path.join(OUT_DIR, "meta.json");

const BL_KPI = new Set(["1", "2", "3", "4", "5", "10", "11", "35", "45", "350", "450"]);
const GT_KPI = new Set(["6", "7", "60", "600", "60001"]);

function isKpi(kod) {
  const k = String(kod ?? "").trim();
  if (!k) return false;
  if (BL_KPI.has(k) || GT_KPI.has(k)) return true;
  return k.startsWith("614") && k.length <= 8;
}

function tabloTip(kod) {
  const k = String(kod).trim();
  if (BL_KPI.has(k) || /^[1-5]$/.test(k)) return "BL";
  return "GT";
}

function fmtDonem(d) {
  if (d instanceof Date && !Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 7);
  }
  return String(d ?? "").slice(0, 7);
}

function sirketFromG1(g1) {
  const t = String(g1 ?? "").trim().toLocaleLowerCase("tr-TR");
  if (t === "sigorta") return "sigorta";
  if (t === "emeklilik") return "emeklilik";
  return null;
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
    console.error("Kullanım: npm run butce:import-gt-bl -- \"path/Aylık GT ve Bilanço.xlsx\"");
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

  const seen = new Set();
  const rows = [];
  let minD = "";
  let maxD = "";

  for (const r of raw) {
    const hesapKodu = String(r["HESAP NO"] ?? "").trim();
    if (!isKpi(hesapKodu)) continue;
    const sirket = sirketFromG1(r.G1);
    if (!sirket) continue;
    const donem = fmtDonem(r.DÖNEM);
    if (!donem || donem.length < 7) continue;

    const key = `${sirket}|${donem}|${hesapKodu}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const deger = Number(r.NET);
    if (!Number.isFinite(deger)) continue;

    rows.push({
      donem,
      sirket,
      tabloTip: tabloTip(hesapKodu),
      hesapKodu,
      hesapAdi: String(r["HESAP ADI"] ?? "").trim(),
      deger,
      ...(hesapKodu === "60001" ? { degerTipi: "ytd" } : { degerTipi: "donem" }),
    });

    if (!minD || donem < minD) minD = donem;
    if (!maxD || donem > maxD) maxD = donem;
  }

  rows.sort((a, b) =>
    a.donem.localeCompare(b.donem) ||
    a.sirket.localeCompare(b.sirket) ||
    a.hesapKodu.localeCompare(b.hesapKodu),
  );

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(rows, null, 2)}\n`, "utf8");

  const meta = {
    ...readMeta(),
    schemaVersion: 1,
    gtBlGuncellemeIso: new Date().toISOString(),
    gtBlDonemMin: minD,
    gtBlDonemMax: maxD,
    gtBlSatirSayisi: rows.length,
  };
  fs.writeFileSync(META_FILE, `${JSON.stringify(meta, null, 2)}\n`, "utf8");

  console.log(`[butce] GT/BL → ${OUT_FILE}`);
  console.log(`  satır: ${rows.length}, dönem: ${minD} … ${maxD}`);
}

main();
