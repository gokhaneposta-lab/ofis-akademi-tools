/**
 * Birleşik `gelir-tidy.json` → `public/data/tsb/gelir-tidy/{donem}.json` + `index.json`
 * GitHub 100 MB limiti için; ham satır şeması korunur (GT + BL).
 *
 *   node scripts/tsb-split-gelir-tidy-by-donem.mjs
 *   node scripts/tsb-split-gelir-tidy-by-donem.mjs path/to/gelir-tidy.json path/to/out-dir
 *   npm run tsb:split-gelir-tidy
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const DEFAULT_IN = path.join(ROOT, "public", "data", "tsb", "gelir-tidy.json");
const DEFAULT_OUT_DIR = path.join(ROOT, "public", "data", "tsb", "gelir-tidy");

function donemSortKey(d) {
  const m = String(d).match(/^(\d{4})-([1-4])$/);
  if (!m) return d;
  return Number(m[1]) * 10 + Number(m[2]);
}

/**
 * @param {string} [inPath]
 * @param {string} [outDir]
 */
export function splitGelirTidyByDonem(inPath = DEFAULT_IN, outDir = DEFAULT_OUT_DIR) {
  const absIn = path.isAbsolute(inPath) ? inPath : path.join(ROOT, inPath);
  if (!fs.existsSync(absIn)) {
    throw new Error(`Kaynak dosya yok: ${absIn}`);
  }

  console.log(`Okunuyor: ${absIn} (${(fs.statSync(absIn).size / 1e6).toFixed(1)} MB)…`);
  const raw = fs.readFileSync(absIn, "utf8");
  const rows = JSON.parse(raw);
  if (!Array.isArray(rows)) {
    throw new Error("gelir-tidy.json bir dizi olmalı");
  }

  /** @type {Map<string, object[]>} */
  const byDonem = new Map();
  for (const r of rows) {
    const d = r?.donem;
    if (!d) continue;
    let bucket = byDonem.get(d);
    if (!bucket) {
      bucket = [];
      byDonem.set(d, bucket);
    }
    bucket.push(r);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const donemler = [...byDonem.keys()].sort((a, b) => donemSortKey(a) - donemSortKey(b));
  for (const d of donemler) {
    const chunk = byDonem.get(d);
    const outFile = path.join(outDir, `${d}.json`);
    fs.writeFileSync(outFile, JSON.stringify(chunk), "utf8");
    const mb = (fs.statSync(outFile).size / 1e6).toFixed(2);
    console.log(`  ${d}.json  ${chunk.length} satır  ${mb} MB`);
  }

  const indexPath = path.join(outDir, "index.json");
  fs.writeFileSync(indexPath, JSON.stringify(donemler), "utf8");
  console.log(`\nindex.json: ${donemler.length} dönem → ${indexPath}`);

  import("./tsb-refresh-meta.mjs").then(({ refreshTsbMeta }) => refreshTsbMeta());

  return { donemler, outDir, totalRows: rows.length };
}

function main() {
  const inPath = process.argv[2] || DEFAULT_IN;
  const outDir = process.argv[3] || DEFAULT_OUT_DIR;
  try {
    splitGelirTidyByDonem(inPath, outDir);
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

if (process.argv[1]?.includes("tsb-split-gelir-tidy-by-donem")) {
  main();
}
