/**
 * Bütçe V3 (yeni motor) — Tip tanımları.
 * Motor V2'nin `MizanOranServisi`ne bağımlı değildir; kendi oran/mevsim modelini kurar.
 */

/** Bir kalem × branş × yıl için ham gözlem (pay/baz). */
export type OranGozlem = {
  yil: number;
  ay?: number;      // Aylık kümülatif snapshot; boşsa YE
  pay: number;
  baz: number;
  oran: number;     // pay/baz (null yerine 0 tercih)
  quality: "ok" | "kucuk_baz" | "torpu_dislandi" | "sifir_baz";
};

/** Bir kalem × branş için öğrenilen efektif oran. */
export type V3Oran = {
  kalemKodu: string;
  bransKodu: string;
  /** Efektif ağırlıklı oran (Ağu–Ara projeksiyonda kullanılacak). */
  oran: number;
  /** Öğrenmeye giren yıl örneklerinin çokluğu. */
  gozlemSayisi: number;
  /** Ağırlıklandırma stratejisi (audit). */
  yontem: "veri_kalite_agirlikli" | "kural_sabit" | "grup_fallback" | "manuel_varsayilan";
  /** Torpu / fallback nedeniyle uygulanan not. */
  notlar: string[];
  /** Kaynak gözlemler (audit; UI'da rozet ile gösterilebilir). */
  gozlemler: OranGozlem[];
};

/** Bir branş × F yaprak için 12 aylık pay eğrisi (toplam = 1). */
export type V3Mevsim = {
  bransKodu: string;
  fSatir: number;
  aylikPay: number[];        // 12 sayı, toplam 1
  ytdKaynak: "gecmis_ort" | "ytd_blend" | "esit_dagitim";
};

/** Model önerisi vs kullanıcı girdisi karşılaştırması (UI rozeti için). */
export type V3Oneri = {
  alan: "tarife_prim" | "genel_gider" | "mali_getiri";
  key: string;                       // tarife grubu / hesap kodu / ay index
  kullaniciDeger: number;
  modelOneri: number;
  sapmaPct: number | null;
  aciklama: string;
};

/** Motor sonuç toplamı — API'den UI'ya gider. */
export type V3MotorSonuc = {
  oranlar: V3Oran[];
  mevsim: V3Mevsim[];
  oneriler: V3Oneri[];
  ytdOverlayDetay: {
    anchorAy: number;
    kilitliBransSayisi: number;
    kilitliSatirSayisi: number;
    ytdSafiTkz: number;              // Ocak..anchor mizan safi TKZ toplam
    modelSafiTkz: number;             // Motor bu aralık için ne demiş
    sapmaTL: number;
  };
  /** Uyarılar / audit notları. */
  uyarilar: string[];
};
