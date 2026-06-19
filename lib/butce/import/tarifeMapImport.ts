import * as XLSX from "xlsx";
import { normalizeBransKodu, normalizeText } from "../textUtils";
import type { TarifeMapRow } from "../types";

export function importTarifeMapFromBuffer(buffer: Buffer): { rows: TarifeMapRow[]; log: string } {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheet = wb.Sheets.TARIFE_MAP;
  if (!sheet) {
    throw new Error("TARIFE_MAP sayfası bulunamadı — BUTCE_MAP.xlsx içinde sayfa adını kontrol edin.");
  }

  const rawRows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: null,
  });

  const seen = new Set<string>();
  const rows: TarifeMapRow[] = [];

  for (const row of rawRows) {
    if (!row || row.length < 5) continue;
    const bransKodu = normalizeBransKodu(row[0]);
    if (!bransKodu || bransKodu === "TOPLAM") continue;
    if (seen.has(bransKodu)) continue;
    seen.add(bransKodu);
    rows.push({
      bransKodu,
      hazineBransAd: String(row[1] ?? "").trim(),
      anaBrans: String(row[2] ?? "").trim(),
      sirketBransAd: String(row[3] ?? "").trim(),
      tarifeGrubu: normalizeText(row[4]),
    });
  }

  if (rows.length === 0) {
    throw new Error("TARIFE_MAP satırı okunamadı — A–E kolonlarını kontrol edin.");
  }

  return {
    rows,
    log: `TARIFE_MAP: ${rows.length.toLocaleString("tr-TR")} branş eşlemesi`,
  };
}
