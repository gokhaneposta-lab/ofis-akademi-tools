/**
 * public/data/tsb/gelir-tidy.json → Excel (inceleme için).
 *
 * Kullanım:
 *   node scripts/tsb-export-gelir-tidy-xlsx.mjs
 *   node scripts/tsb-export-gelir-tidy-xlsx.mjs path/to/gelir-tidy.json path/to/cikti.xlsx
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  readGelirTidyJson,
  writeGelirTidyReviewXlsx,
} from "./tsb-gelir-tidy-write-review-xlsx.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DEFAULT_IN = path.join(ROOT, "public", "data", "tsb", "gelir-tidy.json");
const DEFAULT_OUT = path.join(ROOT, "data", "tsb", "out", "gelir-tidy-review.xlsx");

function main() {
  const inPath = process.argv[2] || DEFAULT_IN;
  const outPath = process.argv[3] || DEFAULT_OUT;
  const absIn = path.isAbsolute(inPath) ? inPath : path.join(ROOT, inPath);
  if (!fs.existsSync(absIn)) {
    console.error(`Girdi yok: ${absIn}`);
    process.exit(1);
  }
  const rows = readGelirTidyJson(absIn);
  writeGelirTidyReviewXlsx(rows, outPath);
  console.log(`${rows.length} satır → ${outPath}`);
}

main();
