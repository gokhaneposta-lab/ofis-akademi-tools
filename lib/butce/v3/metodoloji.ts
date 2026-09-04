/**
 * Bütçe V3 — V2'den sapma gerekçeleri ve metodoloji özeti.
 */

export const V3_V2_SORUN_OZETI: readonly string[] = [
  "V2 çok adımlı: tarife hedefi, ayrı prim dağıtım, KPK, oranlar — pratik akış yok.",
  "Tam yıl oranları YTD gerçekleşmeyi yansıtmıyor; Temmuz mizanı ile yıllık tahmin sık sapıyor.",
  "Tarife mix’i (TARSİM vs TRAFİK) toplam prim + mizan payıyla eziliyordu; V3 tarife hedeflerini DagitimMotoru’na verir.",
  "614 giderlerinde artış oranı + manuel tutar çift kontrolü karışıklık yaratıyor.",
  "Aylık mevsimsellik yalnızca geçmiş tam yıllardan; bütçe yılı YTD (2026-07) kullanılmıyordu.",
];

export const V3_METODOLOJI_ADIMLARI: readonly string[] = [
  "Tarife prim hedefleri → V2 DagitimMotoru (tarife-branş pay; yoksa üretim/mizan yedek).",
  "Teknik oranlar: V2 metodolojisi (ağırlıklı yıl + küçük baz grup fallback).",
  "Aylık prim: bütçe yılı YTD mevsimsellik + geçmiş tam yıl blend.",
  "YTD kilidi: anchor aya kadar mizan-aylik-full'daki TÜM GT kodları (gt_tam_harita) branş×ay bazında kilitlenir.",
  "H2 prim: yıllık tarife hedefi − YTD gerçek, kalan aylara V2 profili ile dağıtılır.",
  "H2 hasar: V2 projeksiyonu korunur (yıllık hasar YTD sapması ile ezilmez).",
  "Tarife-branş pay yoksa: ana grup (TARSİM/TRAFİK/…) + geçmiş yıl iç-grup mizan payı.",
  "Mali gelir (F38): YTD mizan (603); kalan aylar mizan yüklemesindeki bilanço banka (102/100) + getiri proxy.",
  "Genel giderler: kullanıcı 61402–06 tutarları; oran türetimi yok.",
];

export const V3_DEFAULT_YTD_ANCHOR = 7;

/** YTD kilidine alınacak yaprak GT satırları (F11, F96, F105). F95 türetilir. */
export const V3_YTD_KILIT_SATIRLARI = [11, 96, 105] as const;
