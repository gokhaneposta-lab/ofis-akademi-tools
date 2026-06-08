import * as XLSX from "xlsx";
import { BUTCE_YILI_VARSAYILAN } from "../config/constants";
import { normalizeBransKodu } from "../textUtils";
import type { ButceMeta, MizanRow } from "../types";

export function importMizanFromBuffer(
  buffer: Buffer,
  butceYili = BUTCE_YILI_VARSAYILAN,
): { rows: MizanRow[]; meta: ButceMeta; log: string } {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheet = wb.Sheets.MIZAN;
  if (!sheet) {
    throw new Error("MIZAN sayfası bulunamadı — Excel'de sayfa adının tam olarak MIZAN olduğundan emin olun.");
  }

  const rawRows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: null,
  });

  const rows: MizanRow[] = [];

  for (const row of rawRows) {
    if (!row || row.length < 5) continue;
    const yil = Number(row[0]);
    if (!Number.isFinite(yil)) continue;
    const hesap = String(row[1] ?? "").replace(/\.0$/, "");
    const bransKodu = normalizeBransKodu(row[3]);
    const tutar = Number(row[4]) || 0;
    if (!bransKodu || bransKodu === "TOPLAM") continue;
    rows.push({ yil, hesap, bransKodu, tutar });
  }

  if (rows.length === 0) {
    throw new Error(
      "MIZAN satırı okunamadı — A (yıl), B (hesap), D (branş), E (tutar) kolonlarını kontrol edin.",
    );
  }

  const yillar = rows.map((r) => r.yil);
  const meta: ButceMeta = {
    schemaVersion: 2,
    butceYili,
    mizanGuncellemeIso: new Date().toISOString(),
    mizanYilMin: Math.min(...yillar),
    mizanYilMax: Math.max(...yillar),
    mizanSatirSayisi: rows.length,
  };

  const log = `MIZAN: ${rows.length.toLocaleString("tr-TR")} satır, yıl ${meta.mizanYilMin}–${meta.mizanYilMax}`;
  return { rows, meta, log };
}
