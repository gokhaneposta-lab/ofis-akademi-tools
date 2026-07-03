import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const TR_MAP = { İ: "I", I: "I", ı: "I", i: "I", Ş: "S", ş: "S", Ğ: "G", ğ: "G", Ü: "U", ü: "U", Ö: "O", ö: "O", Ç: "C", ç: "C" };

function normalizeText(value) {
  if (value == null || value === "") return "";
  const s = String(value).trim();
  return [...s].map((ch) => TR_MAP[ch] ?? ch).join("").toUpperCase();
}

function normalizeBransKodu(value) {
  if (value == null) return "";
  let s = String(value).trim().replace(/\.0$/, "");
  if (/^\d+$/.test(s)) return s.length <= 3 ? s.padStart(3, "0") : s;
  return s;
}

function cell(row, ...wanted) {
  const targets = wanted.map((w) => normalizeText(w));
  for (const key of Object.keys(row)) {
    if (targets.includes(normalizeText(key))) return row[key];
  }
  return undefined;
}

const src = process.argv[2] ?? path.join(process.env.USERPROFILE ?? "", "Downloads", "kpk_vade.xlsx");
const wb = XLSX.readFile(src);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: null });
const rows = [];
const seen = new Set();

for (const row of rawRows) {
  const bransKodu = normalizeBransKodu(cell(row, "Branş Kod", "Hazine Branş Kod"));
  if (!/^7\d\d$/.test(bransKodu)) continue;
  const ay = Number(cell(row, "Ay"));
  if (!Number.isFinite(ay) || ay < 1 || ay > 12) continue;
  const key = `${bransKodu}-${ay}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const vadeGun = Number(cell(row, "Vade", "KPK Vade Gün"));
  if (!Number.isFinite(vadeGun) || vadeGun <= 0) continue;
  rows.push({
    bransKodu,
    bransAd: String(cell(row, "Branş Ad", "Hazine Branş Ad") ?? "").trim(),
    ay: Math.trunc(ay),
    vadeGun: Math.round(vadeGun * 1e6) / 1e6,
  });
}

rows.sort((a, b) => a.bransKodu.localeCompare(b.bransKodu) || a.ay - b.ay);

const outDir = path.join(root, "data", "butce", "defaults");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "kpk-vade.json");
fs.writeFileSync(outPath, JSON.stringify(rows));

const bransSayisi = new Set(rows.map((r) => r.bransKodu)).size;
console.log(`KPK vade: ${bransSayisi} branş × 12 ay = ${rows.length} satır → ${outPath}`);
