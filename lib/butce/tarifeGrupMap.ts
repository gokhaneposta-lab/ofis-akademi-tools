import { bransApForHpTarife } from "@/lib/tsbHpTarifeBrans";

/**
 * Genel müdürlük bütçe Excel'indeki tarife grup adı → standart tarife → GT `bransAp`.
 * TSB H/P eşlemesi (`HP_TARIFE_TO_BRANS_AP`) ile uyumlu.
 */
const GM_TARIFE_NORMALIZE: Record<string, string> = {
  TRAFIK: "TRAFİK",
  "KAZA OTO": "KASKO",
  KASKO: "KASKO",
  DASK: "DASK",
  YANGIN: "YANGIN",
  NAKLIYAT: "NAKLİYAT",
  NAKLİYAT: "NAKLİYAT",
  "DİĞER KAZA": "DİĞER KAZA",
  SAĞLIK: "SAĞLIK",
  MÜHENDISLIK: "MÜHENDİSLİK",
  MÜHENDİSLİK: "MÜHENDİSLİK",
  TARSİM: "TARSİM",
};

export function normalizeGmTarifeGrupAdi(raw: string): string {
  const t = String(raw ?? "").trim().toLocaleUpperCase("tr-TR");
  return GM_TARIFE_NORMALIZE[t] ?? t;
}

export function bransApForGmTarifeGrup(raw: string): string | null {
  const tarife = normalizeGmTarifeGrupAdi(raw);
  return bransApForHpTarife(tarife);
}

export function bransApForGmTarifeGrupOrThrow(raw: string): string {
  const brans = bransApForGmTarifeGrup(raw);
  if (!brans) {
    throw new Error(`[butce] Tarife grubu GT branşına eşlenemedi: "${raw}"`);
  }
  return brans;
}
