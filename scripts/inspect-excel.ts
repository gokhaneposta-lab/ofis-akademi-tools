/**
 * Ham TSB Excel inceleyici (read-only, stdout).
 * Yalnızca data/tsb/incoming/ altı.
 *
 *   npx --yes tsx scripts/inspect-excel.ts
 *   npx --yes tsx scripts/inspect-excel.ts "1 Sirketler Bilanco Ozet 2026 1.xlsx"
 *   npx --yes tsx scripts/inspect-excel.ts "dosya.xlsx" --sample 3
 */

import XLSX from "xlsx";
import {
  listIncomingExcelFiles,
  resolveIncomingExcelPath,
  TSB_INCOMING_REL,
} from "./lib/tsb-readonly-helpers";

function cellPreview(ws: XLSX.WorkSheet, r: number, c: number): string {
  const addr = XLSX.utils.encode_cell({ r, c });
  const z = ws[addr];
  if (!z) return "";
  const v = z.v;
  if (v === undefined || v === null) return "";
  const s = String(v).trim();
  return s.length > 40 ? `${s.slice(0, 37)}...` : s;
}

function inspectWorkbook(absPath: string, sampleRows: number) {
  const wb = XLSX.readFile(absPath, { cellDates: false });
  const rel = absPath.replace(/\\/g, "/").split("/data/tsb/incoming/").pop() ?? absPath;

  console.log(`dosya: ${rel}`);
  console.log(`sheetSayisi: ${wb.SheetNames.length}`);
  console.log("");

  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    if (!ws) continue;
    const ref = ws["!ref"];
    const range = ref ? XLSX.utils.decode_range(ref) : null;
    const rows = range ? range.e.r - range.s.r + 1 : 0;
    const cols = range ? range.e.c - range.s.c + 1 : 0;

    console.log(`--- ${name} ---`);
    console.log(`  boyut: ${rows} satır × ${cols} sütun`);

    const headerCols: string[] = [];
    for (let c = 0; c < Math.min(cols, 12); c += 1) {
      const h5 = cellPreview(ws, 4, c);
      const h6 = cellPreview(ws, 5, c);
      if (h5 || h6) headerCols.push(`[${c}] ${h5 || "—"} / ${h6 || "—"}`);
    }
    if (headerCols.length > 0) {
      console.log("  kolonlar (satır5/6, ilk 12):");
      for (const h of headerCols) console.log(`    ${h}`);
    }

    const dataStart = 6;
    const show = Math.min(sampleRows, Math.max(0, rows - dataStart));
    if (show > 0) {
      console.log(`  örnek veri (satır ${dataStart + 1}+, ${show} satır):`);
      for (let r = dataStart; r < dataStart + show; r += 1) {
        const cells: string[] = [];
        for (let c = 0; c < Math.min(cols, 6); c += 1) {
          cells.push(cellPreview(ws, r, c) || "·");
        }
        console.log(`    ${r + 1}: ${cells.join(" | ")}`);
      }
    }
    console.log("");
  }
}

function main() {
  const argv = process.argv.slice(2);
  let sampleRows = 2;
  const files: string[] = [];

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--sample" && argv[i + 1]) {
      sampleRows = Math.max(0, Math.min(10, Number(argv[i + 1]) || 2));
      i += 1;
    } else if (!a.startsWith("-")) {
      files.push(a);
    }
  }

  if (files.length === 0) {
    const listed = listIncomingExcelFiles();
    if (listed.length === 0) {
      console.log(`incoming klasöründe Excel yok: ${TSB_INCOMING_REL}/`);
      return;
    }
    console.log(`incoming (${listed.length} dosya):`);
    for (const f of listed) console.log(`  - ${f}`);
    console.log("");
    console.log("İncelemek için dosya adı ver: npx --yes tsx scripts/inspect-excel.ts \"dosya.xlsx\"");
    return;
  }

  for (const f of files) {
    const abs = resolveIncomingExcelPath(f);
    inspectWorkbook(abs, sampleRows);
  }
}

main();
