/**
 * Bütçe V3 — onaylı 2026 seed varsayımlar.
 * API / UI fallback; diskte v3-varsayimlar.json yoksa bunlar kullanılır.
 */
import { normalizeText } from "../textUtils";
import type { SatisButceRow } from "../types";
import type { V3VarsayimlarStore } from "./types";

export const V3_TARIFE_HEDEF_2026: Readonly<Record<string, number>> = {
  DASK: 348_762_237,
  "DİĞER KAZA": 467_212_597,
  "KAZA OTO": 2_088_329_313,
  MÜHENDİSLİK: 667_175_540,
  NAKLİYAT: 125_661_521,
  SAĞLIK: 331_652_086,
  TARSİM: 11_225_001_469,
  TRAFİK: 7_727_769_856,
  YANGIN: 2_797_576_892,
};

export const V3_FAALIYET_GIDER_2026: Readonly<Record<string, number>> = {
  "61402": 573_640_438,
  "61403": 144_429_147,
  "61404": 0,
  "61405": 105_098_224,
  "61406": 120_882_350,
};

/** 2025 kapanış — tablo gösterimi için. */
export const V3_FAALIYET_GIDER_ONCEKI_2026: Readonly<Record<string, number>> = {
  "61402": 423_009_416,
  "61403": 91_159_832,
  "61404": 0,
  "61405": 60_729_360,
  "61406": 114_276_050,
};

/** Aylık mali getiri (%). */
export const V3_AYLIK_GETIRI_PCT_2026: readonly number[] = [
  2.68, 2.68, 2.68, 2.7, 2.7, 2.6, 2.58, 2.48, 2.38, 2.28, 2.18, 2.08,
];

export const V3_REFERANS_ETIKET_2026 = "Son 2 Yıl Ortalaması (2024-2025)" as const;
export const V3_YIL_AGIRLIK_2026: readonly number[] = [0.5, 0.5];
export const V3_BUTCE_YILI = 2026;
export const V3_YTD_ANCHOR_2026 = 7;

export function toplamPrimFromTarife(tarifeHedefleri: Record<string, number>): number {
  return Object.values(tarifeHedefleri).reduce((a, v) => a + (Number(v) || 0), 0);
}

export function v3DefaultsStore2026(): V3VarsayimlarStore {
  const tarifeHedefleri = { ...V3_TARIFE_HEDEF_2026 };
  return {
    butceYili: V3_BUTCE_YILI,
    toplamPrimHedef: toplamPrimFromTarife(tarifeHedefleri),
    tarifeHedefleri,
    referansEtiket: V3_REFERANS_ETIKET_2026,
    yilAgirliklari: [...V3_YIL_AGIRLIK_2026],
    ytdAnchorAy: V3_YTD_ANCHOR_2026,
    faaliyetGiderButce: { ...V3_FAALIYET_GIDER_2026 },
    aylikGetiriOrani: V3_AYLIK_GETIRI_PCT_2026.map((x) => x / 100),
  };
}

export function v3DefaultsForYear(yil: number): V3VarsayimlarStore | null {
  if (yil === V3_BUTCE_YILI) return v3DefaultsStore2026();
  return null;
}

export type V3TarifeSatir = {
  tarifeGrubu: string;
  mevcutHedef: number;
  yeniHedef: number;
};

export function tarifeSatirlariFromDefaults(
  tarifeHedefleri: Record<string, number>,
): V3TarifeSatir[] {
  return Object.entries(tarifeHedefleri).map(([tarifeGrubu, hedef]) => ({
    tarifeGrubu,
    mevcutHedef: hedef,
    yeniHedef: hedef,
  }));
}

export function lookupTarifeHedef(
  hedefler: Record<string, number> | undefined,
  tarifeGrubu: string,
): number | undefined {
  if (!hedefler) return undefined;
  if (hedefler[tarifeGrubu] != null && Number.isFinite(hedefler[tarifeGrubu])) {
    return hedefler[tarifeGrubu];
  }
  const n = normalizeText(tarifeGrubu);
  for (const [k, v] of Object.entries(hedefler)) {
    if (normalizeText(k) === n && Number.isFinite(v)) return v;
  }
  return undefined;
}

/** Kullanıcı tarife anahtarlarını SATIS satır adlarına hizalar. */
export function alignTarifeHedefleri(
  tarifeHedefleri: Record<string, number>,
  satisRows: SatisButceRow[],
): Record<string, number> {
  if (satisRows.length === 0) return { ...tarifeHedefleri };
  const byNorm = new Map<string, string>();
  for (const r of satisRows) {
    const n = normalizeText(r.tarifeGrubu);
    if (n && !byNorm.has(n)) byNorm.set(n, r.tarifeGrubu);
  }
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(tarifeHedefleri)) {
    const mapped = byNorm.get(normalizeText(k)) ?? k;
    out[mapped] = (out[mapped] ?? 0) + (Number(v) || 0);
  }
  return out;
}
