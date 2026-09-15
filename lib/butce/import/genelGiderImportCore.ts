/**
 * Genel gider import — aylık × tam alt hesap (61402–61406).
 */
import * as XLSX from "xlsx";
import {
  GENEL_GIDER_ANA_HESAP_SET,
  GENEL_GIDER_MIN_ALT_HESAP_UZUNLUK,
} from "../config/genelGiderImportConfig";
import { FAALIYET_IMPORT_HESAP_GT } from "../config/faaliyetGiderMap";
import { normalizeText } from "../textUtils";
import type { FaaliyetGiderRow } from "../types";

export type GenelGiderImportIssue = {
  satir: number;
  kod: string;
  mesaj: string;
};

export type GenelGiderImportParseResult = {
  rows: FaaliyetGiderRow[];
  errors: GenelGiderImportIssue[];
  warnings: GenelGiderImportIssue[];
  log: string;
};

function cell(row: Record<string, unknown>, ...wanted: string[]): unknown {
  const targets = wanted.map((w) => normalizeText(w));
  for (const key of Object.keys(row)) {
    const nk = normalizeText(key);
    if (targets.includes(nk)) return row[key];
  }
  return undefined;
}

export function normalizeAltHesapKodu(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\.0$/, "")
    .replace(/\D/g, "");
}

export function resolveAnaHesapFromAlt(altHesapKodu: string): string | null {
  const digits = normalizeAltHesapKodu(altHesapKodu);
  if (digits.length < GENEL_GIDER_MIN_ALT_HESAP_UZUNLUK) return null;
  const ana = digits.slice(0, 5);
  return GENEL_GIDER_ANA_HESAP_SET.has(ana) ? ana : null;
}

function parseAy(value: unknown): number | null {
  const ay = Number(value);
  if (!Number.isFinite(ay) || ay < 1 || ay > 12) return null;
  return Math.trunc(ay);
}

/** Mizan/gider convention: pozitif bütçe tutarı; GT'ye yazılırken negatif gider. */
function parseTutar(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return Math.abs(value);
  const s = String(value).trim();
  if (!s) return null;
  let n: number;
  if (s.includes(",") && s.includes(".")) {
    n = Number(s.replace(/\./g, "").replace(",", "."));
  } else if (s.includes(",") && !s.includes(".")) {
    n = Number(s.replace(",", "."));
  } else {
    n = Number(s);
  }
  if (!Number.isFinite(n)) return null;
  return Math.abs(n);
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

export function normalizeFaaliyetGiderRow(row: FaaliyetGiderRow): FaaliyetGiderRow {
  const alt = normalizeAltHesapKodu(row.altHesapKodu ?? row.hesap);
  const ana = resolveAnaHesapFromAlt(alt) ?? normalizeAltHesapKodu(row.hesap).slice(0, 5);
  return {
    ...row,
    altHesapKodu: alt,
    hesap: ana,
    hesapAd: row.hesapAd,
  };
}

type DraftRow = {
  satir: number;
  butceYili: number;
  ay: number;
  altHesapKodu: string;
  tutar: number;
  aciklama?: string;
};

function validateDraft(d: DraftRow, hedefYil: number): GenelGiderImportIssue | null {
  if (!d.altHesapKodu) {
    return { satir: d.satir, kod: "EMPTY_HESAP", mesaj: "Alt hesap kodu boş." };
  }
  if (!/^\d+$/.test(d.altHesapKodu)) {
    return { satir: d.satir, kod: "NON_NUMERIC", mesaj: "Alt hesap kodu numerik olmalı." };
  }
  if (d.altHesapKodu.length < GENEL_GIDER_MIN_ALT_HESAP_UZUNLUK) {
    return {
      satir: d.satir,
      kod: "SHORT_HESAP",
      mesaj: `Alt hesap en az ${GENEL_GIDER_MIN_ALT_HESAP_UZUNLUK} hane olmalı.`,
    };
  }
  const ana = resolveAnaHesapFromAlt(d.altHesapKodu);
  if (!ana) {
    return {
      satir: d.satir,
      kod: "OUT_OF_SCOPE",
      mesaj: `${d.altHesapKodu.slice(0, 5)} genel gider import kapsamı dışında (61402–61406).`,
    };
  }
  if (d.butceYili !== hedefYil) {
    return {
      satir: d.satir,
      kod: "YIL_MISMATCH",
      mesaj: `Bütçe yılı ${d.butceYili} — yükleme hedefi ${hedefYil} ile uyuşmuyor.`,
    };
  }
  if (parseAy(d.ay) == null) {
    return { satir: d.satir, kod: "BAD_AY", mesaj: "Ay 1–12 arasında olmalı." };
  }
  if (!Number.isFinite(d.tutar) || d.tutar < 0) {
    return { satir: d.satir, kod: "BAD_TUTAR", mesaj: "Tutar geçerli pozitif sayı olmalı." };
  }
  return null;
}

function finalizeRows(
  drafts: DraftRow[],
  butceYili: number,
): GenelGiderImportParseResult {
  const errors: GenelGiderImportIssue[] = [];
  const warnings: GenelGiderImportIssue[] = [];
  const seen = new Map<string, number>();

  for (const d of drafts) {
    const err = validateDraft(d, butceYili);
    if (err) {
      errors.push(err);
      continue;
    }
    const key = `${d.butceYili}|${d.ay}|${d.altHesapKodu}`;
    if (seen.has(key)) {
      errors.push({
        satir: d.satir,
        kod: "DUPLICATE",
        mesaj: `Duplicate: ${d.butceYili} ay ${d.ay} altHesap ${d.altHesapKodu} (ilk satır ${seen.get(key)}).`,
      });
      continue;
    }
    seen.set(key, d.satir);
  }

  if (errors.length > 0) {
    return {
      rows: [],
      errors,
      warnings,
      log: `Import reddedildi — ${errors.length} hata.`,
    };
  }

  const rows: FaaliyetGiderRow[] = drafts.map((d) => {
    const ana = resolveAnaHesapFromAlt(d.altHesapKodu)!;
    return normalizeFaaliyetGiderRow({
      butceYili: d.butceYili ?? butceYili,
      hesap: ana,
      altHesapKodu: d.altHesapKodu,
      hesapAd: d.aciklama,
      ay: d.ay,
      tutar: d.tutar,
    });
  });

  rows.sort(
    (a, b) =>
      a.hesap.localeCompare(b.hesap) ||
      (a.altHesapKodu ?? "").localeCompare(b.altHesapKodu ?? "") ||
      a.ay - b.ay,
  );

  const altSay = new Set(rows.map((r) => r.altHesapKodu)).size;
  const anaSay = new Set(rows.map((r) => r.hesap)).size;
  return {
    rows,
    errors,
    warnings,
    log: `Genel gider import: ${altSay} alt hesap, ${anaSay} ana hesap, ${rows.length} satır (${butceYili}).`,
  };
}

export function parseGenelGiderFromRawRows(
  rawRows: Record<string, unknown>[],
  butceYili: number,
  satirOffset = 2,
): GenelGiderImportParseResult {
  if (rawRows.length === 0) {
    return {
      rows: [],
      errors: [{ satir: 0, kod: "EMPTY", mesaj: "Dosyada satır yok." }],
      warnings: [],
      log: "Boş dosya.",
    };
  }

  const headers = Object.keys(rawRows[0] ?? {});
  const hasAyCol =
    headers.some((h) => normalizeText(h) === "AY") ||
    headers.some((h) => normalizeText(h) === "ISLEM AY");
  const wideCols = monthColumns(headers);
  const drafts: DraftRow[] = [];
  const scopeWarnings: GenelGiderImportIssue[] = [];
  const scopeWarned = new Set<string>();

  if (hasAyCol) {
    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i]!;
      const satir = i + satirOffset;
      const altHesapKodu = normalizeAltHesapKodu(
        cell(
          row,
          "Alt Hesap Kodu",
          "AltHesapKodu",
          "altHesapKodu",
          "Hesap No",
          "HESAP_NO",
          "Hesap",
          "Hesap Kodu",
          "Mizan Hesap",
        ),
      );
      if (!altHesapKodu) continue;

      if (!resolveAnaHesapFromAlt(altHesapKodu)) {
        const ana = altHesapKodu.slice(0, 5);
        if (!scopeWarned.has(ana)) {
          scopeWarned.add(ana);
          scopeWarnings.push({
            satir,
            kod: "OUT_OF_SCOPE",
            mesaj: `${ana}xxx satırları atlandı (61402–61406 kapsamı dışı).`,
          });
        }
        continue;
      }

      const yilRaw = cell(row, "Bütçe Yılı", "ButceYili", "butceYili", "Yıl", "Yil", "YIL");
      const rowYil = yilRaw != null && String(yilRaw).trim() !== "" ? Number(yilRaw) : butceYili;
      const ay = parseAy(cell(row, "Ay", "İşlem Ay", "Islem Ay", "AY"));
      if (ay == null) continue;

      const tutar = parseTutar(cell(row, "Tutar", "TUTAR", "Net", "Tutar TL", "Bütçe", "Butce"));
      if (tutar == null) continue;

      const aciklama = String(cell(row, "Açıklama", "Aciklama", "Hesap Adı", "Hesap Ad") ?? "").trim() || undefined;

      drafts.push({
        satir,
        butceYili: Number.isFinite(rowYil) ? Math.trunc(rowYil) : butceYili,
        ay,
        altHesapKodu,
        tutar,
        aciklama,
      });
    }
  } else if (wideCols.length >= 3) {
    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i]!;
      const satir = i + satirOffset;
      const altHesapKodu = normalizeAltHesapKodu(
        cell(row, "Alt Hesap Kodu", "AltHesapKodu", "Hesap No", "Hesap", "Hesap Kodu"),
      );
      if (!altHesapKodu) continue;
      const aciklama = String(cell(row, "Açıklama", "Hesap Adı", "Hesap Ad") ?? "").trim() || undefined;

      for (const { key, ay } of wideCols) {
        const tutar = parseTutar(row[key]);
        if (tutar == null) continue;
        drafts.push({ satir, butceYili, ay, altHesapKodu, tutar, aciklama });
      }
    }
  } else {
    return {
      rows: [],
      errors: [
        {
          satir: 1,
          kod: "FORMAT",
          mesaj: "Format okunamadı — Ay kolonlu uzun format veya Oca–Ara geniş format gerekli.",
        },
      ],
      warnings: [],
      log: "Format hatası.",
    };
  }

  if (drafts.length === 0) {
    return {
      rows: [],
      errors: [
        {
          satir: 0,
          kod: "NO_ROWS",
          mesaj: "Geçerli satır okunamadı — altHesapKodu, ay ve tutar kontrol edin.",
        },
      ],
      warnings: [],
      log: "Satır yok.",
    };
  }

  const result = finalizeRows(drafts, butceYili);
  if (scopeWarnings.length > 0) {
    result.warnings.push(...scopeWarnings);
    result.log += ` ${scopeWarnings.length} kapsam dışı ana hesap uyarısı (satırlar atlandı).`;
  }
  return result;
}

export function parseGenelGiderFromBuffer(
  buffer: Buffer,
  butceYili: number,
): GenelGiderImportParseResult {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheet = wb.Sheets[wb.SheetNames[0]!];
  if (!sheet) {
    return {
      rows: [],
      errors: [{ satir: 0, kod: "EMPTY_SHEET", mesaj: "Dosya boş veya okunamadı." }],
      warnings: [],
      log: "Boş dosya.",
    };
  }
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
  return parseGenelGiderFromRawRows(rawRows, butceYili);
}

/** Ana hesap adları (GT map). */
export function anaHesapAdi(ana: string): string {
  return FAALIYET_IMPORT_HESAP_GT[ana]?.ad ?? ana;
}
