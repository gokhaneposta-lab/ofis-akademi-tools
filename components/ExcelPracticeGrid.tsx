"use client";

import React, { useState, useCallback } from "react";
import { THEME } from "@/lib/theme";

const ERROR_RED = "#b91c1c";
const ERROR_BG = "#fef2f2";
const SUCCESS_GREEN = "#15803d";
const SUCCESS_BG = "#f0fdf4";

export type CellDef =
  | { type: "label"; value: string }
  | {
      type: "editable";
      expected: string;
      /** Alternatif doğru cevaplar (örn. =MIN yerine =MİN). Hepsi normalize edilerek karşılaştırılır. */
      expectedAlternatives?: string[];
      hint?: string;
      normalize?: (v: string) => string;
    };

export type PracticeGridDef = {
  /** Örn: "B2 hücresine A1:A5 toplamını veren formülü yazın." */
  instruction: string;
  /** Satır sayısı (1 tabanlı), örn. 6 */
  rows: number;
  /** Sütun sayısı (A=1), örn. 3 */
  cols: number;
  /** Hücre tanımları: "A1", "B2" gibi. Verilmeyen hücreler boş. */
  cells: Record<string, CellDef>;
};

function defaultNormalize(v: string): string {
  return v
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function getCellKey(col: number, row: number): string {
  let c = "";
  let x = col;
  while (x > 0) {
    x -= 1;
    c = String.fromCharCode(65 + (x % 26)) + c;
    x = Math.floor(x / 26);
  }
  return c + row;
}

/** Aralıktaki sayıları döndürür; geçersiz hücre varsa null. */
function getRangeNumbers(
  start: string,
  end: string,
  getLabelValue: (key: string) => string | undefined
): number[] | null {
  const startCol = columnToIndex(start.replace(/\d+$/, ""));
  const startRow = parseInt(start.replace(/\D/g, ""), 10);
  const endCol = columnToIndex(end.replace(/\d+$/, ""));
  const endRow = parseInt(end.replace(/\D/g, ""), 10);
  const nums: number[] = [];
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const key = getCellKey(c, r);
      const raw = getLabelValue(key);
      if (raw === undefined) return null;
      const n = parseFloat(raw);
      if (Number.isNaN(n)) return null;
      nums.push(n);
    }
  }
  return nums;
}

/** =FONKSİYON(A1:A5) formatında formülden fonksiyon adı ve aralığı parse eder. */
function parseFormulaRange(formula: string): { fn: string; start: string; end: string } | null {
  const upper = formula.trim().toUpperCase().replace(/\s+/g, "");
  const match = upper.match(/^=(TOPLA|ORTALAMA|MİN|MIN|MAKS|MAX|SAY)\(([A-Z]+\d+):([A-Z]+\d+)\)$/);
  if (!match) return null;
  const [, fn, start, end] = match;
  return { fn: fn!, start, end };
}

type GetCellValue = (key: string) => string | undefined;

/** Aralık değerlerini 2D olarak döndürür (DÜŞEYARA tablosu için). */
function getRangeValues(
  start: string,
  end: string,
  getLabelValue: GetCellValue
): string[][] | null {
  const startCol = columnToIndex(start.replace(/\d+$/, ""));
  const startRow = parseInt(start.replace(/\D/g, ""), 10);
  const endCol = columnToIndex(end.replace(/\D/g, ""));
  const endRow = parseInt(end.replace(/\D/g, ""), 10);
  const rows: string[][] = [];
  for (let r = startRow; r <= endRow; r++) {
    const row: string[] = [];
    for (let c = startCol; c <= endCol; c++) {
      const key = getCellKey(c, r);
      const raw = getLabelValue(key);
      if (raw === undefined) return null;
      row.push(raw);
    }
    rows.push(row);
  }
  return rows;
}

/** Tarih metnini (15.03.2025 veya 15/03/2025) gün, ay, yıl sayılarına çevirir. */
function parseDateParts(dateStr: string): { day: number; month: number; year: number } | null {
  const normalized = dateStr.trim().replace(/\//g, ".");
  const parts = normalized.split(".");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null;
  return { day, month, year };
}

/**
 * Excel benzeri formüllerin sonucunu hesaplar.
 * TOPLA, ORTALAMA, MİN, MAKS, SAY, EĞER, DÜŞEYARA, SAĞ, SOL, EĞERSAY, BİRLEŞTİR, GÜN, AY, YIL, EĞERHATA desteklenir.
 */
function evaluateFormula(formula: string, getLabelValue: GetCellValue): string | null {
  const raw = formula.trim();
  if (!raw.startsWith("=")) return null;
  const upper = raw.toUpperCase().replace(/\s+/g, "");

  // TOPLA, ORTALAMA, MİN, MAKS, SAY
  const rangeParsed = parseFormulaRange(formula);
  if (rangeParsed) {
    const nums = getRangeNumbers(rangeParsed.start, rangeParsed.end, getLabelValue);
    if (!nums || nums.length === 0) return null;
    const fn = rangeParsed.fn;
    if (fn === "TOPLA") return String(nums.reduce((a, b) => a + b, 0));
    if (fn === "ORTALAMA") return String(nums.reduce((a, b) => a + b, 0) / nums.length);
    if (fn === "MİN" || fn === "MIN") return String(Math.min(...nums));
    if (fn === "MAKS" || fn === "MAX") return String(Math.max(...nums));
    if (fn === "SAY") return String(nums.length);
  }

  // EĞER( koşul ; doğru_değer ; yanlış_değer ) veya IF( ... )
  const egerMatch = upper.match(/^=EĞER\((.+)\)$/) || upper.match(/^=IF\((.+)\)$/);
  if (egerMatch) {
    const inner = egerMatch[1];
    const parts = inner.split(";").map((p) => p.trim());
    if (parts.length >= 3) {
      const cond = parts[0];
      const refMatch = cond.match(/^([A-Z]+\d+)(>=|<=|>|<|=)(.+)$/i);
      if (refMatch) {
        const [, ref, op, rightStr] = refMatch;
        const leftVal = getLabelValue(ref!);
        if (leftVal === undefined) return null;
        const leftNum = parseFloat(leftVal);
        const rightNum = parseFloat(rightStr.trim().replace(/^["']|["']$/g, ""));
        let result = false;
        if (!Number.isNaN(leftNum) && !Number.isNaN(rightNum)) {
          if (op === ">=") result = leftNum >= rightNum;
          else if (op === "<=") result = leftNum <= rightNum;
          else if (op === ">") result = leftNum > rightNum;
          else if (op === "<") result = leftNum < rightNum;
          else if (op === "=") result = leftNum === rightNum;
        }
        const rawInner = raw.slice(raw.indexOf("(") + 1, -1);
        const rawParts = rawInner.split(";").map((p) => p.trim());
        const valTrue = (rawParts.length >= 2 ? rawParts[1] : parts[1]).replace(/^["']|["']$/g, "");
        const valFalse = (rawParts.length >= 3 ? rawParts[2] : parts[2]).replace(/^["']|["']$/g, "");
        return result ? valTrue : valFalse;
      }
    }
  }

  // DÜŞEYARA( aranan ; tablo_aralık ; sütun_no ; 0 ) veya VLOOKUP( ... )
  const vlookMatch = upper.match(/^=DÜŞEYARA\(([^;]+);([^;]+);([^;]+);([^)]+)\)$/i) ||
    upper.match(/^=VLOOKUP\(([^;]+);([^;]+);([^;]+);([^)]+)\)$/i);
  if (vlookMatch) {
    const lookupRef = vlookMatch[1].trim();
    const tableRange = vlookMatch[2].trim();
    const colNum = parseInt(vlookMatch[3].trim(), 10);
    const lookupVal = getLabelValue(lookupRef) ?? "";
    const rangeMatch = tableRange.match(/^([A-Z]+\d+):([A-Z]+\d+)$/i);
    if (!rangeMatch || Number.isNaN(colNum) || colNum < 1) return null;
    const table = getRangeValues(rangeMatch[1], rangeMatch[2], getLabelValue);
    if (!table) return null;
    for (const row of table) {
      if (String(row[0]) === String(lookupVal)) {
        const idx = colNum - 1;
        return row[idx] != null ? String(row[idx]) : null;
      }
    }
    return null; // bulunamadı (EĞERHATA ile sarılı olabilir)
  }

  // SAĞ( ref ; karakter_sayısı ) veya RIGHT( ... )
  const sagMatch = upper.match(/^=SAĞ\(([^;]+);(\d+)\)$/i) || upper.match(/^=RIGHT\(([^;]+);(\d+)\)$/i);
  if (sagMatch) {
    const ref = sagMatch[1].trim();
    const n = parseInt(sagMatch[2], 10);
    const val = getLabelValue(ref);
    if (val === undefined || Number.isNaN(n)) return null;
    return val.slice(-n);
  }

  // SOL( ref ; karakter_sayısı ) veya LEFT( ... )
  const solMatch = upper.match(/^=SOL\(([^;]+);(\d+)\)$/i) || upper.match(/^=LEFT\(([^;]+);(\d+)\)$/i);
  if (solMatch) {
    const ref = solMatch[1].trim();
    const n = parseInt(solMatch[2], 10);
    const val = getLabelValue(ref);
    if (val === undefined || Number.isNaN(n)) return null;
    return val.slice(0, n);
  }

  // EĞERSAY( aralık ; kriter ) veya COUNTIF( ... ) — kriter ">50" gibi
  const countifMatch = upper.match(/^=EĞERSAY\(([A-Z]+\d+:[A-Z]+\d+);["']?([^"']+)["']?\)$/i) ||
    upper.match(/^=COUNTIF\(([A-Z]+\d+:[A-Z]+\d+);["']?([^"']+)["']?\)$/i);
  if (countifMatch) {
    const rangeStr = countifMatch[1].trim();
    const criteria = countifMatch[2].trim();
    const rangeParts = rangeStr.match(/^([A-Z]+\d+):([A-Z]+\d+)$/i);
    if (!rangeParts) return null;
    const nums = getRangeNumbers(rangeParts[1], rangeParts[2], getLabelValue);
    if (!nums) return null;
    const opMatch = criteria.match(/^([><]=?)(\d+)$/);
    let count = 0;
    if (opMatch) {
      const op = opMatch[1];
      const limit = parseFloat(opMatch[2]);
      for (const n of nums) {
        if (op === ">") count += n > limit ? 1 : 0;
        else if (op === ">=") count += n >= limit ? 1 : 0;
        else if (op === "<") count += n < limit ? 1 : 0;
        else if (op === "<=") count += n <= limit ? 1 : 0;
      }
    }
    return String(count);
  }

  // BİRLEŞTİR( ref1 ; " " ; ref2 ) veya CONCATENATE — arada boşluk ile birleştir
  const birlMatch = upper.match(/^=BİRLEŞTİR\(([A-Z]+\d+);[^;]+;([A-Z]+\d+)\)$/i) ||
    upper.match(/^=CONCATENATE\(([A-Z]+\d+);[^;]+;([A-Z]+\d+)\)$/i);
  if (birlMatch) {
    const a = getLabelValue(birlMatch[1].trim());
    const b = getLabelValue(birlMatch[2].trim());
    if (a !== undefined && b !== undefined) return `${a} ${b}`;
  }

  // GÜN( ref ) / AY( ref ) / YIL( ref )
  const gunMatch = upper.match(/^=GÜN\(([A-Z]+\d+)\)$/i) || upper.match(/^=DAY\(([A-Z]+\d+)\)$/i);
  if (gunMatch) {
    const val = getLabelValue(gunMatch[1].trim());
    if (val === undefined) return null;
    const parts = parseDateParts(val);
    return parts ? String(parts.day) : null;
  }
  const ayMatch = upper.match(/^=AY\(([A-Z]+\d+)\)$/i) || upper.match(/^=MONTH\(([A-Z]+\d+)\)$/i);
  if (ayMatch) {
    const val = getLabelValue(ayMatch[1].trim());
    if (val === undefined) return null;
    const parts = parseDateParts(val);
    return parts ? String(parts.month) : null;
  }
  const yilMatch = upper.match(/^=YIL\(([A-Z]+\d+)\)$/i) || upper.match(/^=YEAR\(([A-Z]+\d+)\)$/i);
  if (yilMatch) {
    const val = getLabelValue(yilMatch[1].trim());
    if (val === undefined) return null;
    const parts = parseDateParts(val);
    return parts ? String(parts.year) : null;
  }

  // EĞERHATA( formül ; hata_değeri ) — parantez derinliğine göre ayır (iç formül parantez içerebilir)
  if (upper.startsWith("=EĞERHATA(") || upper.startsWith("=IFERROR(")) {
    const innerStart = upper.indexOf("(") + 1;
    let depth = 1;
    let splitIdx = -1;
    for (let i = innerStart; i < upper.length; i++) {
      const ch = upper[i];
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      else if (ch === ";" && depth === 1) {
        splitIdx = i;
        break;
      }
    }
    if (splitIdx > innerStart) {
      const innerFormula = raw.slice(innerStart, splitIdx).trim();
      const fallbackPart = raw.slice(splitIdx + 1, raw.length - 1).trim().replace(/^["']|["']$/g, "");
      const innerResult = evaluateFormula("=" + innerFormula, getLabelValue);
      return innerResult != null ? innerResult : fallbackPart;
    }
  }

  return null;
}

function columnToIndex(col: string): number {
  let idx = 0;
  for (let i = 0; i < col.length; i++) {
    idx = idx * 26 + (col.charCodeAt(i) - 64);
  }
  return idx;
}

type CellState = "idle" | "error" | "success";

export default function ExcelPracticeGrid({ def }: { def: PracticeGridDef }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [cellState, setCellState] = useState<Record<string, CellState>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const getCellDef = useCallback(
    (col: number, row: number): CellDef | undefined => {
      const key = getCellKey(col, row);
      return def.cells[key];
    },
    [def.cells]
  );

  const handleCellChange = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setCellState((prev) => ({ ...prev, [key]: "idle" }));
  }, []);

  const validateCell = useCallback(
    (key: string): boolean => {
      const cell = def.cells[key];
      if (!cell || cell.type !== "editable") return true;
      const raw = values[key] ?? "";
      const normalize = cell.normalize ?? defaultNormalize;
      const normalizedInput = normalize(raw);
      const accepted = [cell.expected, ...(cell.expectedAlternatives ?? [])];
      const match = accepted.some((exp) => normalize(exp) === normalizedInput);
      setCellState((prev) => ({ ...prev, [key]: match ? "success" : "error" }));
      setTouched((prev) => ({ ...prev, [key]: true }));
      return match;
    },
    [def.cells, values]
  );

  const handleBlur = useCallback(
    (key: string) => {
      validateCell(key);
    },
    [validateCell]
  );

  const handleCheck = useCallback(() => {
    let allOk = true;
    Object.keys(def.cells).forEach((key) => {
      const cell = def.cells[key];
      if (cell?.type === "editable") {
        const ok = validateCell(key);
        if (!ok) allOk = false;
      }
    });
    setTouched((prev) => {
      const next = { ...prev };
      Object.keys(def.cells).forEach((key) => {
        if (def.cells[key]?.type === "editable") next[key] = true;
      });
      return next;
    });
  }, [def.cells, validateCell]);

  const resetPractice = useCallback(() => {
    setValues({});
    setCellState({});
    setTouched({});
  }, []);

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: THEME.gridLine, background: THEME.sheetBg, fontFamily: THEME.font }}
    >
      <p className="px-4 py-2 text-sm text-gray-700 border-b" style={{ borderColor: THEME.gridLine, background: THEME.headerBg }}>
        {def.instruction}
      </p>
      <div className="p-4 overflow-x-auto">
        <table
          className="border-collapse text-sm"
          style={{ borderColor: THEME.gridLine }}
          role="grid"
          aria-label="Uygulama tablosu"
        >
          <thead>
            <tr>
              <th
                className="w-8 h-7 border font-medium text-center text-gray-600"
                style={{ borderColor: THEME.gridLine, background: THEME.cornerBg }}
                aria-hidden
              />
              {Array.from({ length: def.cols }, (_, i) => {
                const isFormulaCol = i === 1; // B kolonu: formül yazılan alan =ORTALAMA(A1:A5) sığsın
                return (
                  <th
                    key={i}
                    className={`h-7 border font-medium text-center text-gray-600 ${isFormulaCol ? "min-w-[13rem] w-52" : "w-16 min-w-[4rem]"}`}
                    style={{ borderColor: THEME.gridLine, background: THEME.headerBg }}
                  >
                    {String.fromCharCode(65 + i)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: def.rows }, (_, rowIndex) => {
              const row = rowIndex + 1;
              return (
                <tr key={row}>
                  <td
                    className="w-8 h-8 border text-center text-gray-500"
                    style={{ borderColor: THEME.gridLine, background: THEME.headerBg }}
                  >
                    {row}
                  </td>
                  {Array.from({ length: def.cols }, (_, colIndex) => {
                    const col = colIndex + 1;
                    const key = getCellKey(col, row);
                    const cell = getCellDef(col, row);
                    const state = cellState[key] ?? "idle";
                    const showFeedback = touched[key];

                    const isFormulaCol = colIndex === 1; // B kolonu: formül alanı
                    const colWidthClass = isFormulaCol ? "min-w-[13rem] w-52" : "w-16 min-w-[4rem]";

                    if (!cell) {
                      return (
                        <td
                          key={key}
                          className={`${colWidthClass} h-8 border p-0`}
                          style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}
                        />
                      );
                    }

                    if (cell.type === "label") {
                      return (
                        <td
                          key={key}
                          className={`${colWidthClass} h-8 border px-1.5 py-0.5 align-middle`}
                          style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}
                        >
                          {cell.value}
                        </td>
                      );
                    }

                    // editable
                    const isError = state === "error" && showFeedback;
                    const isSuccess = state === "success" && showFeedback;
                    const getLabelValue = (k: string) =>
                      def.cells[k]?.type === "label" ? (def.cells[k] as { type: "label"; value: string }).value : undefined;
                    const acceptedFormulas = [cell.expected, ...(cell.expectedAlternatives ?? [])];
                    const formulaToEval = isSuccess ? (values[key] ?? cell.expected) : "";
                    const displayResult =
                      isSuccess && formulaToEval
                        ? evaluateFormula(formulaToEval, getLabelValue) ??
                          acceptedFormulas.map((f) => evaluateFormula(f, getLabelValue)).find((r) => r != null) ?? null
                        : null;
                    return (
                      <td
                        key={key}
                        className={`${colWidthClass} h-8 border p-0 align-middle relative`}
                        style={{
                          borderColor: isError ? ERROR_RED : THEME.gridLine,
                          background: isError ? ERROR_BG : isSuccess ? SUCCESS_BG : THEME.sheetBg,
                        }}
                      >
                        {displayResult != null ? (
                          <span
                            className="block w-full h-full px-1.5 py-0.5 text-sm font-bold flex items-center"
                            style={{ color: SUCCESS_GREEN, fontFamily: "Consolas, monospace" }}
                            aria-label={`Hücre ${key}, sonuç: ${displayResult}`}
                          >
                            {displayResult}
                          </span>
                        ) : (
                          <input
                            type="text"
                            value={values[key] ?? ""}
                            onChange={(e) => handleCellChange(key, e.target.value)}
                            onBlur={() => handleBlur(key)}
                            placeholder="=..."
                            className="w-full h-full px-1.5 py-0.5 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-[#217346]"
                            style={{ fontFamily: "Consolas, monospace" }}
                            aria-label={`Hücre ${key}`}
                            aria-invalid={isError}
                            aria-describedby={isError && cell.hint ? `hint-${key}` : undefined}
                          />
                        )}
                        {isError && (
                          <span
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-red-600 flex items-center justify-center"
                            title={cell.hint ?? "Beklenen değerle eşleşmiyor"}
                            style={{ color: ERROR_RED }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                          </span>
                        )}
                        {isSuccess && displayResult == null && (
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-green-600" style={{ color: SUCCESS_GREEN }} aria-hidden>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {Object.values(def.cells).some((c) => c.type === "editable") && (
        <div className="px-4 py-2 border-t flex flex-wrap items-center gap-2" style={{ borderColor: THEME.gridLine, background: THEME.formulaBarBg }}>
          <button
            type="button"
            onClick={handleCheck}
            className="px-3 py-1.5 text-sm font-medium rounded text-white hover:opacity-90 transition"
            style={{ background: THEME.ribbon }}
          >
            Kontrol et
          </button>
          <button
            type="button"
            onClick={resetPractice}
            className="px-3 py-1.5 text-sm font-medium rounded border hover:bg-gray-100 transition"
            style={{ borderColor: THEME.gridLine }}
          >
            Sıfırla
          </button>
        </div>
      )}
      {/* Hata mesajları: hatalı hücreler için hint */}
      {Object.keys(def.cells).some((key) => {
        const cell = def.cells[key];
        return cell?.type === "editable" && cell.hint && cellState[key] === "error" && touched[key];
      }) && (
        <div className="px-4 pb-2 space-y-1">
          {Object.entries(def.cells).map(([key, cell]) => {
            if (cell.type !== "editable" || !cell.hint) return null;
            const isError = cellState[key] === "error" && touched[key];
            if (!isError) return null;
            return (
              <p
                key={key}
                id={`hint-${key}`}
                className="text-xs flex items-center gap-1"
                style={{ color: ERROR_RED }}
                role="alert"
              >
                <span aria-hidden>💡</span> {key}: {cell.hint}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}
