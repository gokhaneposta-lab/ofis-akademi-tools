/**
 * Gelir tablosu (GT) KPI’ları — yalnızca özet sayfalar:
 * `HAYATDISI` (61x / hayat dışı), `HAYAT` (63x), `EMEKLİLİK` (65x), `MALI`.
 * Branş sayfaları (KAZA, KASKO …) **dahil edilmez** — HAYATDISI zaten branş toplamıdır.
 */

import { GELIR_SYNTHETIC_HESAP_KODU } from "./tsbGelirSyntheticCodes";
import type { GelirTidyDonemLookup } from "./tsbSirketSegmentSkor";

const GT = "GT";
const HAYATDISI = "HAYATDISI";
const HAYAT = "HAYAT";
const EMEKLILIK = "EMEKLİLİK";
const MALI = "MALI";

function gtCell(
  lookup: GelirTidyDonemLookup,
  sirketKodu: number,
  bransAp: string,
  hesapKodu: string | number,
): number {
  const k = `${GT}|${bransAp}|${String(hesapKodu).trim()}`;
  return lookup.get(sirketKodu)?.get(k) ?? 0;
}

/** Personel — ayrı KPI (genel gider alt kümesi). */
export const PERSONEL_GIDER_HESAP_KODLARI = ["61402", "63602", "65202"] as const;

/** Genel giderler — personel + yönetim + AR-GE + pazarlama + dış hizmet (61401/61408 yok). */
export const GENEL_GIDER_HESAP_KODLARI = [
  "61402",
  "63602",
  "65202",
  "61403",
  "63603",
  "65203",
  "61404",
  "63604",
  "65204",
  "61405",
  "63605",
  "65205",
  "61406",
  "63606",
  "65206",
] as const;

const FAALIYET_GIDER_KODLARI = ["614", "636", "652"] as const;

const SAFI_GIDER_SUFFIXES = ["02", "03", "04", "05", "06"] as const;

const SAFI_TEKNIK_BLOKLARI = [
  { gelir: "60", gider: "61", prefix: "614", bransAp: HAYATDISI },
  { gelir: "62", gider: "63", prefix: "636", bransAp: HAYAT },
  { gelir: "64", gider: "65", prefix: "652", bransAp: EMEKLILIK },
] as const;

/** Hesap kodu → özet `bransAp` (614/61x→HAYATDISI, 636/63x→HAYAT, 652/65x→EMEKLİLİK). */
export function gtOzetBransApForHesapKodu(hesapKodu: string | number): string {
  const k = String(hesapKodu).trim();
  if (k.startsWith("652") || k === "652" || k.startsWith("65") || k.startsWith("64")) {
    return EMEKLILIK;
  }
  if (k.startsWith("636") || k === "636" || k.startsWith("63") || k.startsWith("62")) {
    return HAYAT;
  }
  return HAYATDISI;
}

export function gelirGtOzetCell(
  lookup: GelirTidyDonemLookup,
  sirketKodu: number,
  hesapKodu: string | number,
): number {
  const bransAp = gtOzetBransApForHesapKodu(hesapKodu);
  return gtCell(lookup, sirketKodu, bransAp, hesapKodu);
}

export function sumGtOzetKodlar(
  lookup: GelirTidyDonemLookup,
  sirketKodu: number,
  kodlar: readonly string[],
): number {
  let s = 0;
  for (const kod of kodlar) s += gelirGtOzetCell(lookup, sirketKodu, kod);
  return s;
}

export function personelGiderFromLookup(lookup: GelirTidyDonemLookup, sirketKodu: number): number {
  return sumGtOzetKodlar(lookup, sirketKodu, PERSONEL_GIDER_HESAP_KODLARI);
}

export function genelGiderFromLookup(lookup: GelirTidyDonemLookup, sirketKodu: number): number {
  return sumGtOzetKodlar(lookup, sirketKodu, GENEL_GIDER_HESAP_KODLARI);
}

export function faaliyetGiderFromLookup(lookup: GelirTidyDonemLookup, sirketKodu: number): number {
  return sumGtOzetKodlar(lookup, sirketKodu, FAALIYET_GIDER_KODLARI);
}

export function teknikKarZararFromLookup(lookup: GelirTidyDonemLookup, sirketKodu: number): number {
  const syn = GELIR_SYNTHETIC_HESAP_KODU.teknikKarZarar;
  return (
    gtCell(lookup, sirketKodu, HAYATDISI, syn) +
    gtCell(lookup, sirketKodu, HAYAT, syn) +
    gtCell(lookup, sirketKodu, EMEKLILIK, syn)
  );
}

/** §4.2 — üç teknik blok toplamı (HD + Hayat + Emeklilik özet). */
export function safiTeknikKzFromLookup(lookup: GelirTidyDonemLookup, sirketKodu: number): number {
  let total = 0;
  for (const blok of SAFI_TEKNIK_BLOKLARI) {
    const g = (hk: string) => gtCell(lookup, sirketKodu, blok.bransAp, hk);
    let giderAlt = 0;
    for (const sfx of SAFI_GIDER_SUFFIXES) {
      giderAlt += g(`${blok.prefix}${sfx}`);
    }
    total += g(blok.gelir) - g("603") + (g(blok.gider) - giderAlt);
  }
  return total;
}

/** §4.1 — 60–61 (HAYATDISI) + 62–63 (HAYAT) + 64–65 (EMEKLİLİK) + 66–68 (MALI). */
export function vokGtOzetFromLookup(lookup: GelirTidyDonemLookup, sirketKodu: number): number {
  let s = 0;
  for (const k of ["60", "61"] as const) {
    s += gtCell(lookup, sirketKodu, HAYATDISI, k);
  }
  for (const k of ["62", "63"] as const) {
    s += gtCell(lookup, sirketKodu, HAYAT, k);
  }
  for (const k of ["64", "65"] as const) {
    s += gtCell(lookup, sirketKodu, EMEKLILIK, k);
  }
  for (const k of ["66", "67", "68"] as const) {
    s += gtCell(lookup, sirketKodu, MALI, k);
  }
  return s;
}
