import * as XLSX from "xlsx";
import { normalizeBransKodu, normalizeText } from "../textUtils";
import type { KpkVadeRow } from "../types";

function cell(row: Record<string, unknown>, ...wanted: string[]): unknown {
  const targets = wanted.map((w) => normalizeText(w));
  for (const key of Object.keys(row)) {
    const nk = normalizeText(key);
    if (targets.includes(nk)) return row[key];
  }
  return undefined;
}

function parseAy(value: unknown): number | null {
  const ay = Number(value);
  if (!Number.isFinite(ay) || ay < 1 || ay > 12) return null;
  return Math.trunc(ay);
}

function parseVadeGun(value: unknown): number | null {
  const vade = Number(value);
  if (!Number.isFinite(vade) || vade <= 0) return null;
  return Math.round(vade * 1e6) / 1e6;
}

export function importKpkVadeFromBuffer(buffer: Buffer): { rows: KpkVadeRow[]; log: string } {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error("KPK vade dosyası boş veya okunamadı.");

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
  const rows: KpkVadeRow[] = [];
  const seen = new Set<string>();

  for (const row of rawRows) {
    const bransKodu = normalizeBransKodu(cell(row, "Branş Kod", "Hazine Branş Kod"));
    if (!/^7\d\d$/.test(bransKodu)) continue;

    const ay = parseAy(cell(row, "Ay"));
    if (ay == null) continue;

    const key = `${bransKodu}-${ay}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const vadeGun = parseVadeGun(cell(row, "Vade", "KPK Vade Gün", "KPK Vade Ay"));
    if (vadeGun == null) continue;

    rows.push({
      bransKodu,
      bransAd: String(cell(row, "Branş Ad", "Hazine Branş Ad") ?? "").trim(),
      ay,
      vadeGun,
    });
  }

  if (rows.length === 0) {
    throw new Error(
      "KPK vade satırı okunamadı — Branş Kod, Branş Ad, Ay ve Vade kolonlarını kontrol edin.",
    );
  }

  rows.sort((a, b) => a.bransKodu.localeCompare(b.bransKodu) || a.ay - b.ay);

  const bransSayisi = new Set(rows.map((r) => r.bransKodu)).size;
  return {
    rows,
    log: `KPK vade tablosu: ${bransSayisi.toLocaleString("tr-TR")} branş × 12 ay = ${rows.length.toLocaleString("tr-TR")} satır`,
  };
}
