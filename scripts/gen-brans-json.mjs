import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const py = fs.readFileSync(
  path.join(__dirname, "../../butce-modulu/core/config.py"),
  "utf8",
);

const block = (name) => {
  const m = py.match(new RegExp(`${name} = \\{([\\s\\S]*?)\\n\\}`));
  return m ? m[1] : "";
};

const brans = {};
const bransBlock = block("HAZINE_BRANS_KODLARI");
for (const m of bransBlock.matchAll(/"(\d+)":\s*\("([^"]*)",\s*"([^"]*)",\s*"([^"]*)"\)/g)) {
  brans[m[1]] = [m[2], m[3], m[4]];
}

const sira = [...block("HAZINE_BRANS_SIRASI").matchAll(/"(\d+)"/g)].map((m) => m[1]);

const ana = {};
for (const m of block("ANA_BRANS_GRUPLARI").matchAll(/"([^"]+)":\s*\[([\s\S]*?)\]/g)) {
  ana[m[1]] = [...m[2].matchAll(/"(\d+)"/g)].map((x) => x[1]);
}

const out = path.join(__dirname, "../lib/butce/data/brans.json");
fs.writeFileSync(out, JSON.stringify({ brans, sira, ana }, null, 2));
console.log("wrote", out, Object.keys(brans).length, "brans");
