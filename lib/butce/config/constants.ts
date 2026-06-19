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

/** A dağıtım motoru — üretim payları için referans yıl seçenekleri */
export const REFERANS_YIL_SECENEKLERI: Readonly<Record<string, readonly number[]>> = {
  "2024": [2024],
  "2023": [2023],
  "2025": [2025],
  "2022": [2022],
  "Son 2 Yıl Ortalaması (2023-2024)": [2023, 2024],
  "Son 2 Yıl Ortalaması (2024-2025)": [2024, 2025],
  "Son 3 Yıl Ortalaması (2023-2025)": [2023, 2024, 2025],
};

export const MIZAN_HESAP_DIREKT = "60001";
export const MIZAN_HESAP_ENDIREKT = "600012";
