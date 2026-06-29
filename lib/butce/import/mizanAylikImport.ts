import * as XLSX from "xlsx";
import { normalizeBransKodu } from "../textUtils";
import type { MizanAylikRow } from "../types";

const SHEET_NAMES = ["MIZAN_AY", "MIZAN_AYLIK", "MIZAN AY"];

export function importMizanAylikFromBuffer(buffer: Buffer): {
  rows: MizanAylikRow[];
  log: string;
} {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheetName = SHEET_NAMES.find((n) => wb.Sheets[n]);
  if (!sheetName) {
    return { rows: [], log: "MIZAN_AY sayfası yok (atlandı)" };
  }

  const sheet = wb.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: null,
  });

  const rows: MizanAylikRow[] = [];

  for (const row of rawRows) {
    if (!row || row.length < 5) continue;
    const yil = Number(row[0]);
    const ay = Number(row[1]);
    if (!Number.isFinite(yil) || !Number.isFinite(ay) || ay < 1 || ay > 12) continue;
    const hesap = String(row[2] ?? "").replace(/\.0$/, "");
    const bransKodu = normalizeBransKodu(row[3]);
    const tutar = Number(row[4]) || 0;
    if (!bransKodu || bransKodu === "TOPLAM") continue;
    rows.push({ yil, ay, hesap, bransKodu, tutar });
  }

  if (rows.length === 0) {
    throw new Error(
      "MIZAN_AY satırı okunamadı — A:yıl, B:ay(1-12), C:hesap, D:branş, E:kümülatif tutar",
    );
  }

  const yillar = [...new Set(rows.map((r) => r.yil))].sort((a, b) => a - b);
  const log = `MIZAN_AY: ${rows.length.toLocaleString("tr-TR")} satır, yıl ${yillar[0]}–${yillar[yillar.length - 1]}`;
  return { rows, log };
}
