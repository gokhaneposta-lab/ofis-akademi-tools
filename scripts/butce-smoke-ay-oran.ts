import { writeFileSync, readFileSync } from "fs";
import { MizanOranServisi } from "../lib/butce/oran/mizanOranlar";

const mizan = JSON.parse(readFileSync("data/butce/private/mizan-tidy.json", "utf8"));
const aylik = JSON.parse(readFileSync("data/butce/private/mizan-aylik-full.json", "utf8"));
const s = new MizanOranServisi(mizan, 2026, aylik);
const lines: string[] = [];
for (const br of ["715", "777", "717"]) {
  for (const ay of [1, 6, 12]) {
    const o = s.bransOrani("0211", br, "excel_gt", ay);
    lines.push(`${br} ay${ay}: ${(o * 100).toFixed(2)}%`);
  }
}
writeFileSync("public/exports/_smoke-ay-oran.txt", lines.join("\n"));
