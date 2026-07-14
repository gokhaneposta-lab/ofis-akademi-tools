export const BUTCE_YILI_VARSAYILAN = 2027;

export const ORAN_TORPU_VARSAYILAN = {
  yil_disi_max: 1.5,
  oran_min: null as number | null,
  oran_max: null as number | null,
};

export const ORAN_REFERANS_VARSAYILAN = "excel_gt";

export const ORAN_REFERANS_SECENEKLERI: readonly [string, string][] = [
  ["excel_gt", "Excel GT (ağırlıklı yıl birleştirme)"],
  ["son_yil", "Son Yıl"],
  ["son_3_yil_ort", "Son 3 Yıl — aritmetik ortalama"],
  ["manuel", "Manuel"],
];

export const ORAN_KALEM_ALT_GRUP: Readonly<Record<string, readonly string[]>> = {
  "0221": ["02211", "02212"],
  "0222": ["02221", "02222"],
};

export const CARPIM_BRUT_PRIM = "brut_prim";
export const CARPIM_DIREKT_PRIM = "direkt_prim";
export const CARPIM_ENDIREKT_PRIM = "endirekt_prim";
export const CARPIM_HASAR_BAZ = "hasar_baz";
export const CARPIM_NET_PRIM = "net_prim";

export const AYLAR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export const TARIFE_GRUPLARI = [
  "YANGIN", "DASK", "TRAFİK", "KASKO", "NAKLİYAT",
  "MÜHENDİSLİK", "FERDİ KAZA", "SAĞLIK", "TARSİM",
  "KREDİ", "DİĞER KAZA",
] as const;

export const KANAL_1 = [
  "ACENTE", "BANKASÜRANS", "BROKER", "INDIRECT İŞLER",
  "KURUMSAL SATIŞ", "TARIM KREDİ", "İŞTİRAK",
] as const;

export const SIRKET_TIPLERI = ["BS", "BE", "HAVUZ"] as const;

/**
 * İlk yüklemede Excel HEDEF kolonuna uygulanacak varsayılan artış (0 = artış yok).
 * Kullanıcı PrimHedefi ekranından tutarı/artışı elle girer.
 */
export const PRIM_HEDEF_ARTIS_VARSAYILAN = 0;

/** A dağıtım motoru — üretim payları için referans yıl seçenekleri */
export const REFERANS_YIL_SECENEKLERI: Readonly<Record<string, readonly number[]>> = {
  "2024": [2024],
  "2023": [2023],
  "2025": [2025],
  "2026": [2026],
  "2022": [2022],
  "Son 2 Yıl Ortalaması (2023-2024)": [2023, 2024],
  "Son 2 Yıl Ortalaması (2024-2025)": [2024, 2025],
  "Son 2 Yıl Ortalaması (2025-2026)": [2025, 2026],
  "Son 3 Yıl Ortalaması (2023-2025)": [2023, 2024, 2025],
};

/** Referans etiketindeki yıl sayısına göre varsayılan ağırlıklar (toplam 1). */
export function varsayilanYilAgirliklari(yilSayisi: number): number[] {
  if (yilSayisi <= 1) return [1];
  if (yilSayisi === 2) return [0.5, 0.5];
  if (yilSayisi === 3) return [0.5, 0.3, 0.2];
  const w = 1 / yilSayisi;
  return Array.from({ length: yilSayisi }, () => w);
}

/** Ağırlıkları pozitif tutup toplamı 1 olacak şekilde normalize eder. */
export function normalizeYilAgirliklari(weights: readonly number[]): number[] {
  const cleaned = weights.map((w) => (Number.isFinite(w) && w > 0 ? w : 0));
  const sum = cleaned.reduce((a, x) => a + x, 0);
  if (sum <= 0) return varsayilanYilAgirliklari(weights.length);
  return cleaned.map((w) => w / sum);
}

export function referansYilAgirliklari(
  referansEtiket: string,
  override?: readonly number[] | null,
): number[] {
  const years = REFERANS_YIL_SECENEKLERI[referansEtiket] ?? [2024];
  if (override && override.length === years.length) {
    return normalizeYilAgirliklari(override);
  }
  return varsayilanYilAgirliklari(years.length);
}

export const MIZAN_HESAP_DIREKT = "60001";
export const MIZAN_HESAP_ENDIREKT = "600012";

/**
 * Aylık GT dosyasında branş kırılımı GT satır kodu diliyle gelir (muhasebe kodu değil).
 * Aylık dağılım mevsimselliği brüt yazılan prim (kod 0111) üzerinden hesaplanır.
 */
export const MIZAN_AYLIK_HESAP_BRUT = "0111";
