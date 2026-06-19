import * as XLSX from "xlsx";
import { normalizeBransKodu, normalizeText } from "../textUtils";
import type { UretimRow } from "../types";

export function importUretimFromBuffer(buffer: Buffer): { rows: UretimRow[]; log: string } {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  if (!sheet) throw new Error("Üretim Excel boş veya okunamadı.");

  const rawRows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: null,
  });

  const rows: UretimRow[] = [];
  for (const row of rawRows) {
    if (!row || row.length < 8) continue;
    const yil = Number(row[0]);
    if (!Number.isFinite(yil)) continue;
    const ay = Number(row[1]) || 0;
    rows.push({
      yil: Math.round(yil),
      ay: Math.round(ay),
      kanal1: String(row[2] ?? "").trim(),
      kanal3: String(row[3] ?? "").trim(),
      bolge: String(row[4] ?? "").trim(),
      bransKodu: normalizeBransKodu(row[5]),
      tarifeGrubu: String(row[6] ?? "").trim(),
      netPrim: Number(row[7]) || 0,
    });
  }

  if (rows.length === 0) {
    throw new Error("Üretim satırı okunamadı — 2023_2025_Prim formatı (8 kolon) bekleniyor.");
  }

  return {
    rows,
    log: `Üretim: ${rows.length.toLocaleString("tr-TR")} satır (${sheetName})`,
  };
}

/** Dağıtım motoru için normalize alanlar */
export function uretimWithNorm(rows: UretimRow[]) {
  return rows.map((r) => ({
    ...r,
    kanal1Norm: normalizeText(r.kanal1),
    kanal3Norm: normalizeText(r.kanal3),
    tarifeNorm: normalizeText(r.tarifeGrubu),
  }));
}
