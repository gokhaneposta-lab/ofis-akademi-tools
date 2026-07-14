export type V2VarsayimlarStore = {
  guncellemeIso?: string;
  butceYili: number;
  tarifeHedefleri: Record<string, number>;
  referansEtiket?: string;
  yilAgirliklari?: number[];
  /** 61402–06 için önceki yıla uygulanacak artış (örn. 0.35 = +%35). */
  giderArtisOrani: number;
  /** Ocak–Aralık aylık getiri (decimal, örn. 0.0268 ≈ %2,68 — 2025 60301 backtest). */
  aylikGetiriOrani: number[];
};

export type V2MaliGelirAySatir = {
  ay: number;
  ayAd: string;
  ayBasiBanka: number;
  giris: number;
  cikis: number;
  netNakit: number;
  maliGelir: number;
  aySonuBanka: number;
  getiriOrani: number;
  /** Ay başı veya ay sonu bakiyesi < 0 */
  negatifBakiye: boolean;
};

export type V2MaliGelirProxySonuc = {
  acilisBanka: number;
  acilisKaynak: "102/100" | "10" | "yok";
  aylar: V2MaliGelirAySatir[];
  maliGelirYillik: number;
  maliGelirAylik: number[];
  uyarilar: string[];
  /** Negatif ay başı/sonu görülen aylar (1–12). */
  negatifBakiyeAylar: number[];
};
