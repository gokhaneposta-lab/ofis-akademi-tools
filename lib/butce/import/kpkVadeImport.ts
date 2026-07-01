import * as XLSX from "xlsx";
import { normalizeBransKodu, normalizeText } from "../textUtils";
import type { KpkVadeRow } from "../types";

function cell(row: Record<string, unknown>, wanted: string): unknown {
  const target = normalizeText(wanted);
  const key = Object.keys(row).find((k) => normalizeText(k) === target);
  return key ? row[key] : undefined;
}

export function importKpkVadeFromBuffer(buffer: Buffer): { rows: KpkVadeRow[]; log: string } {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error("KPK vade tanım dosyası boş veya okunamadı.");

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
  const rows: KpkVadeRow[] = [];
  const seen = new Set<string>();

  for (const row of rawRows) {
    const bransKodu = normalizeBransKodu(cell(row, "Hazine Branş Kod"));
    if (!/^7\d\d$/.test(bransKodu) || seen.has(bransKodu)) continue;
    seen.add(bransKodu);
    rows.push({
      bransKodu,
      hazineBransAd: String(cell(row, "Hazine Branş Ad") ?? "").trim(),
      vadeAy: Number(cell(row, "KPK Vade Ay")) || 0,
      kazanimYontemi: String(cell(row, "Kazanım Yöntemi") ?? "").trim(),
      aciklama: String(cell(row, "Açıklama") ?? "").trim(),
    });
  }

  if (rows.length === 0) {
    throw new Error("KPK vade satırı okunamadı — Hazine Branş Kod ve KPK Vade Ay kolonlarını kontrol edin.");
  }

  return { rows, log: `KPK vade tanımı: ${rows.length.toLocaleString("tr-TR")} branş` };
}
