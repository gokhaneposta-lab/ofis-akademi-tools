import * as XLSX from "xlsx";
import { faaliyetHesapGtSatir } from "../config/faaliyetGiderMap";
import { normalizeBransKodu, normalizeText } from "../textUtils";
import type { FaaliyetGiderRow } from "../types";

function cell(row: Record<string, unknown>, ...wanted: string[]): unknown {
  const targets = wanted.map((w) => normalizeText(w));
  for (const key of Object.keys(row)) {
    const nk = normalizeText(key);
    if (targets.includes(nk)) return row[key];
  }
  return undefined;
}

function normalizeHesap(value: unknown): string {
  const raw = String(value ?? "").trim().replace(/\.0$/, "");
  const digits = raw.replace(/\D/g, "");
  if (!digits.startsWith("614")) return "";
  return digits.slice(0, 5);
}

function parseAy(value: unknown): number | null {
  const ay = Number(value);
  if (!Number.isFinite(ay) || ay < 1 || ay > 12) return null;
  return Math.trunc(ay);
}

function parseTutar(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return n;
}

const AY_FROM_HEADER: Record<string, number> = {
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  "11": 11,
  "12": 12,
  OCAK: 1,
  SUBAT: 2,
  MART: 3,
  NISAN: 4,
  MAYIS: 5,
  HAZIRAN: 6,
  TEMMUZ: 7,
  AGUSTOS: 8,
  EYLUL: 9,
  EKIM: 10,
  KASIM: 11,
  ARALIK: 12,
};

function monthColumns(headers: string[]): { key: string; ay: number }[] {
  const out: { key: string; ay: number }[] = [];
  for (const key of headers) {
    const nk = normalizeText(key);
    const ay = AY_FROM_HEADER[nk];
    if (ay != null) out.push({ key, ay });
  }
  return out;
}

function parseBransOptional(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  const nk = normalizeText(s);
  if (nk === "SIGORTA" || nk === "SIRKET" || nk === "TOPLAM" || nk === "-") return undefined;
  const kod = normalizeBransKodu(value);
  if (!/^7\d\d$/.test(kod)) return undefined;
  return kod;
}

export function importFaaliyetGiderFromBuffer(
  buffer: Buffer,
  butceYili: number,
): { rows: FaaliyetGiderRow[]; log: string } {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error("Faaliyet gider dosyası boş veya okunamadı.");

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
  if (rawRows.length === 0) throw new Error("Faaliyet gider dosyasında satır bulunamadı.");

  const headers = Object.keys(rawRows[0] ?? {});
  const hasAyCol = headers.some((h) => normalizeText(h) === "AY");
  const wideCols = monthColumns(headers);

  const rows: FaaliyetGiderRow[] = [];
  const seen = new Set<string>();

  if (hasAyCol) {
    for (const row of rawRows) {
      const hesap = normalizeHesap(cell(row, "Hesap No", "Hesap", "Mizan Hesap", "Hesap Kodu"));
      if (!hesap || faaliyetHesapGtSatir(hesap) == null) continue;

      const ay = parseAy(cell(row, "Ay"));
      if (ay == null) continue;

      const tutar = parseTutar(cell(row, "Tutar", "Net", "Tutar TL", "Bütçe"));
      if (tutar == null) continue;

      const bransKodu = parseBransOptional(cell(row, "Branş Kod", "Branş", "Hazine Branş Kod"));

      const key = `${hesap}-${bransKodu ?? "SIRKET-F368"}-${ay}`;
      if (seen.has(key)) continue;
      seen.add(key);

      rows.push({
        butceYili,
        hesap,
        hesapAd: String(cell(row, "Hesap Adı", "Hesap Ad") ?? "").trim() || undefined,
        ay,
        tutar,
        bransKodu,
      });
    }
  } else if (wideCols.length >= 3) {
    for (const row of rawRows) {
      const hesap = normalizeHesap(cell(row, "Hesap No", "Hesap", "Mizan Hesap", "Hesap Kodu"));
      if (!hesap || faaliyetHesapGtSatir(hesap) == null) continue;

      const hesapAd = String(cell(row, "Hesap Adı", "Hesap Ad") ?? "").trim() || undefined;

      for (const { key, ay } of wideCols) {
        const tutar = parseTutar(row[key]);
        if (tutar == null) continue;

        const dedupeKey = `${hesap}-SIRKET-F368-${ay}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        rows.push({ butceYili, hesap, hesapAd, ay, tutar });
      }
    }
  } else {
    throw new Error(
      "Faaliyet gider formatı okunamadı — «Ay» kolonlu uzun format veya Oca–Ara / 1–12 geniş format kullanın.",
    );
  }

  if (rows.length === 0) {
    throw new Error(
      "Faaliyet gider satırı okunamadı — 61402–61409 hesap kodları, ay ve tutar kolonlarını kontrol edin.",
    );
  }

  rows.sort((a, b) => a.hesap.localeCompare(b.hesap) || a.ay - b.ay);

  const hesapSayisi = new Set(rows.map((r) => r.hesap)).size;
  return {
    rows,
    log: `Faaliyet giderleri: ${hesapSayisi.toLocaleString("tr-TR")} hesap × ay = ${rows.length.toLocaleString("tr-TR")} satır (${butceYili})`,
  };
}
