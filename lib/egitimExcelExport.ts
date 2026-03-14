"use client";

import * as XLSX from "xlsx";
import type { PracticeGridDef } from "@/components/ExcelPracticeGrid";

/** Hücre anahtarı (A1, B2) → sütun ve satır indeksine çevir (0 tabanlı) */
function cellKeyToIndex(key: string): { col: number; row: number } {
  const match = key.match(/^([A-Z]+)(\d+)$/);
  if (!match) return { col: 0, row: 0 };
  const colStr = match[1];
  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64);
  }
  return { col: col - 1, row: parseInt(match[2], 10) - 1 };
}

/** PracticeGridDef'teki cells'tan 2D dizi üret (Excel için). Label ve editable hücrelerin value/expected değeri yazılır. */
function practiceDefToSheetData(def: PracticeGridDef): (string | number)[][] {
  const data: (string | number)[][] = [];
  for (let r = 0; r < def.rows; r++) {
    const row: (string | number)[] = [];
    for (let c = 0; c < def.cols; c++) {
      const key = indexToCellKey(c, r);
      const cell = def.cells[key];
      let val: string | number = "";
      if (cell) {
        if (cell.type === "label") val = cell.value;
        else if (cell.type === "editable") val = cell.expected;
      }
      row.push(val);
    }
    data.push(row);
  }
  return data;
}

function indexToCellKey(col: number, row: number): string {
  let c = "";
  let x = col + 1;
  while (x > 0) {
    const r = (x - 1) % 26;
    c = String.fromCharCode(65 + r) + c;
    x = Math.floor((x - 1) / 26);
  }
  return c + (row + 1);
}

export type SheetFromPractice = {
  sheetName: string;
  practiceKey: string;
};

export type SheetFromTable = {
  sheetName: string;
  rows: number;
  cols: number;
  cells: Record<string, string | number>;
};

/**
 * Seviye için Excel çalışma kitabı oluşturur.
 * practiceDefs ve practiceByGroupTitle ile eşleşen gruplar için sayfa ekler;
 * ek olarak tableSheets varsa onları da ekler.
 */
export function buildLevelWorkbook(
  levelLabel: string,
  groupTitlesWithPractice: { groupTitle: string; practiceKey: string; sheetName: string }[],
  practiceDefs: Record<string, PracticeGridDef>,
  tableSheets: SheetFromTable[] = []
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  for (const { groupTitle, practiceKey, sheetName } of groupTitlesWithPractice) {
    const def = practiceDefs[practiceKey];
    if (!def) continue;
    const data = practiceDefToSheetData(def);
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  }

  for (const { sheetName, rows, cols, cells } of tableSheets) {
    const data: (string | number)[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: (string | number)[] = [];
      for (let c = 0; c < cols; c++) {
        const key = indexToCellKey(c, r);
        row.push(cells[key] ?? "");
      }
      data.push(row);
    }
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  }

  return wb;
}

/** Tarayıcıda Excel dosyası indirir */
export function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}
