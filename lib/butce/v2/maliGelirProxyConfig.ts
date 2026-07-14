/** V2 mali gelir nakit proxy — onaylı hesap listesi (tahakkuk esaslı, gerçek nakit akışı değil). */

export const V2_MALI_GELIR_DISCLAIMER =
  "V2 mali gelir yaklaşımı: tahakkuk esaslı basitleştirilmiş proxy, gerçek nakit akışı değildir.";

export const V2_VERGI_DISCLAIMER =
  "Vergi/690 kalemleri hariç tutulmuştur; proxy vergi etkisini yansıtmaz.";

/**
 * Açılış banka stoku — öncelik: tam kod 102, sonra 100.
 * Prefix toplamı yapılmaz (102 + 10202 + … çift sayım).
 * Yoksa agrega tam kod 10.
 */
export const V2_BANKA_STOK_PREFIX = ["102", "100"] as const;
export const V2_BANKA_STOK_FALLBACK = "10";

/**
 * Varsayılan aylık mali getiri (decimal).
 * 2025 gerçekleşen mizan backtest: düzeltilmiş 102 açılış + bu oran ≈ Σ60301 (%0 sapma).
 */
export const V2_AYLIK_GETIRI_VARSAYILAN = 0.0268;

/** Bütçe yılı proxy girişleri (GT satır eşlemesi ile). */
export const V2_PROXY_GT_GIRIS: { satir: number; etiket: string }[] = [
  { satir: 11, etiket: "60001 Brüt yazılan prim" },
  { satir: 105, etiket: "61002 Ödenen hasarda reasürör payı" },
  { satir: 86, etiket: "605 Rücu / sovtaj" },
];

/** Bütçe yılı proxy çıkışları (mutlak değer). */
export const V2_PROXY_GT_CIKIS: { satir: number; etiket: string }[] = [
  { satir: 96, etiket: "61001 Brüt ödenen hasar" },
  { satir: 177, etiket: "Komisyon (cari üretim)" },
  { satir: 19, etiket: "60002 Reasüransa devredilen prim" },
  { satir: 190, etiket: "61402 Personel" },
  { satir: 191, etiket: "61403 Yönetim" },
  { satir: 192, etiket: "61404 AR-GE" },
  { satir: 193, etiket: "61405 Pazarlama" },
  { satir: 194, etiket: "61406 Dış hizmet" },
];

/** Faaliyet gider artışına tabi mizan hesapları. */
export const V2_FAALIYET_ARTIS_HESAPLARI = ["61402", "61403", "61404", "61405", "61406"] as const;
