/**
 * TSB gelir tablosu Excel’inde hesap kodu olmayan (satır 5 boş / boşluk) ama
 * hesap adı olan özet kolonlar — tidy’de `hesapKodu` için ayrılmış stringler.
 * Gerçek TSB kodları (60, 60001, …) ile çakışmaz.
 */
export const GELIR_SYNTHETIC_HESAP_KODU = {
  /** Tablo sonundaki “Teknik Kar Zarar” (Toplam içermez) */
  teknikKarZarar: "__SYN_TKN_KZ__",
  /** MALI sayfası: “Toplam Teknik Kar Zarar” */
  toplamTeknikKarZarar: "__SYN_TOP_TKN_KZ__",
  /** MALI sayfası: “Mali Kar” */
  maliKar: "__SYN_MALI_KAR__",
} as const;

export type GelirSyntheticHesapKodu =
  (typeof GELIR_SYNTHETIC_HESAP_KODU)[keyof typeof GELIR_SYNTHETIC_HESAP_KODU];

const LABEL_TR: Record<GelirSyntheticHesapKodu, string> = {
  __SYN_TKN_KZ__: "Teknik Kar Zarar",
  __SYN_TOP_TKN_KZ__: "Toplam Teknik Kar Zarar",
  __SYN_MALI_KAR__: "Mali Kar",
};

/** Hesap adına göre sentetik kod; bilinmeyen veya boş → null */
export function gelirSyntheticKodFromHesapAdi(hesapAdi: string): GelirSyntheticHesapKodu | null {
  const n = hesapAdi.replace(/\s+/g, " ").trim();
  if (!n) return null;
  const u = n.toLocaleUpperCase("tr-TR");
  if (u.includes("TOPLAM") && u.includes("TEKNİK") && u.includes("KAR") && u.includes("ZARAR")) {
    return GELIR_SYNTHETIC_HESAP_KODU.toplamTeknikKarZarar;
  }
  if (u === "MALİ KAR" || u === "MALI KAR") {
    return GELIR_SYNTHETIC_HESAP_KODU.maliKar;
  }
  if (u.includes("TEKNİK") && u.includes("KAR") && u.includes("ZARAR")) {
    return GELIR_SYNTHETIC_HESAP_KODU.teknikKarZarar;
  }
  return null;
}

export function gelirSyntheticLabel(kod: string): string | undefined {
  return LABEL_TR[kod as GelirSyntheticHesapKodu];
}
