/** 61402–61406 genel gider import — geçerli ana hesaplar. */

export const GENEL_GIDER_ANA_HESAPLAR = [
  "61402",
  "61403",
  "61404",
  "61405",
  "61406",
] as const;

export type GenelGiderAnaHesap = (typeof GENEL_GIDER_ANA_HESAPLAR)[number];

export const GENEL_GIDER_ANA_HESAP_SET = new Set<string>(GENEL_GIDER_ANA_HESAPLAR);

export const GENEL_GIDER_MIN_ALT_HESAP_UZUNLUK = 5;
