/**
 * Forecast rate policy — sabit eşikler ve blend ağırlıkları.
 * Motor oranları (F320/F451) değiştirilmez; yalnızca EYE forecast seçiminde kullanılır.
 */
export const FORECAST_RATE_POLICY_CONFIG = {
  /** YTD pay hareketinin bu oranından fazlası şok ay(lar)da ise oneOff=YUKSEK */
  shockShareHigh: 0.45,
  shockShareLow: 0.25,
  /** adjusted vs raw YTD farkı (pp) */
  ytdAdjustedGapHighPp: 15,
  ytdAdjustedGapLowPp: 8,
  /** Son 3 ay vs tarihsel fark (pp) — persistence */
  persistenceRecentVsHistPp: 10,
  /** YTD vs son 3 ay fark (pp) — YTD şok baskınlığı */
  ytdVsRecentGapPp: 15,
  /** Aylık oran σ eşiği (pp) */
  volatilityHighPp: 50,
  /** Tek ay çıkarılınca YTD oranı bu kadar pp değişirse şok say */
  singleMonthShockImpactPp: 12,
  /** Şok ay tespiti: en fazla kaç ay */
  shockDetectMaxMonths: 2,
  /** Şok ay minimum |pay| eşiği (TL) — branş bazlı seride */
  shockMinPayAbsTl: 5_000_000,

  blend: {
    /** A) oneOff YUKSEK + persistence DÜŞÜK */
    shockHighPersistLow: { adjusted: 0.5, recent3: 0.3, historical: 0.2 },
    /** B) oneOff DÜŞÜK + persistence YÜKSEK */
    shockLowPersistHigh: { recent3: 0.45, ytd: 0.35, historical: 0.2 },
    /** C) ikisi ORTA */
    bothMedium: { historical: 0.34, adjusted: 0.33, recent3: 0.33 },
    /** Varsayılan */
    default: { historical: 0.4, adjusted: 0.35, recent3: 0.25 },
  },
} as const;

export type ForecastRatePolicyConfig = typeof FORECAST_RATE_POLICY_CONFIG;
