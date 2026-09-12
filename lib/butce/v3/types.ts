/** Bütçe V3 — kullanıcı yalnızca prim + mali getiri + genel gider girer. */

import type { V2GelirTablosuSonuc } from "../v2/buildV2GelirTablosu";
import type { V3MaliGelirRollingSonuc } from "./maliGelirRolling";

export type { V2VarsayimlarStore, V2MaliGelirProxySonuc, V2MaliGelirAySatir } from "../v2/types";
export type { V2GelirTablosuSonuc } from "../v2/buildV2GelirTablosu";
export type { MizanReconSatir, MizanReconSonuc } from "./mizanV3Recon";
export type { V3MaliGelirRollingSonuc };

export type V3VarsayimlarStore = {
  guncellemeIso?: string;
  butceYili: number;
  /** Toplam brüt yazılan prim hedefi (TL). Boşsa tarifeHedefleri toplamı kullanılır. */
  toplamPrimHedef: number;
  /** Tarife grubu bazında yıllık hedef prim (TL). */
  tarifeHedefleri?: Record<string, number>;
  /** Ocak–Aralık aylık getiri (decimal). */
  aylikGetiriOrani: number[];
  /** 61402–61406 yıllık bütçe (pozitif TL). */
  faaliyetGiderButce: Record<string, number>;
  /**
   * YTD gerçekleşme ayı (1–11). Bu aya kadar aylık GT gerçekleşme ile kilitlenir.
   * Varsayılan: 7 (Temmuz).
   */
  ytdAnchorAy?: number;
  /** Oran referans etiketi (V2 ile uyumlu). */
  referansEtiket?: string;
  /** Referans yıllarına göre ağırlıklar (toplam 1). */
  yilAgirliklari?: number[];
};

export type V3KalibrasyonSatir = {
  satir: number;
  ad: string;
  ytdTahmin: number;
  ytdGercek: number;
  sapmaPct: number | null;
  uygulananCarpan: number;
};

export type EyeQuality = {
  f105Proxy: boolean;
  maliGelirProxyMonths: number[];
  mizanRecon: {
    tutmayanSayisi: number;
    satirlar: import("./mizanV3Recon").MizanReconSatir[];
  };
  forecastMethodVersion: "eye-v1";
  kpkRecon: Record<string, number>;
};

export type EyeSnapshotV1 = {
  meta: {
    schemaVersion: "eye-v1";
    butceYili: number;
    kesimAy: number;
    kesimKaynak: "auto" | "manual";
    maxMizanAy: number | null;
    uretimTarihi: string;
    forecastMethodVersion: "eye-v1";
  };
  assumptions: {
    tarifeHedefleri: Record<string, number>;
    aylikGetiriOrani: number[];
    faaliyetGiderButce: Record<string, number>;
    varsayimHash: string;
  };
  branslar: string[];
  sirket: {
    rollupGT: Record<string, number[]>;
    sentetik: Record<string, number[]>;
    yillik: Record<string, number>;
  };
  yaprakGT: Record<string, Record<string, number[]>>;
  rollupGT: Record<string, Record<string, number[]>>;
  sentetik: Record<string, number[]>;
  oranGirdisi: {
    "2026EyeYillik": Record<string, number>;
  };
  quality: EyeQuality;
  /** 2027 prim hedefi — otomatik doldurulmaz. */
  hedef2027: null | Record<string, unknown>;
};

export type V3GelirTablosuSonuc = V2GelirTablosuSonuc & {
  v3: {
    toplamPrimHedef: number;
    primKaynak: string;
    ytdAnchorAy: number;
    kalibrasyon: V3KalibrasyonSatir[];
    mizanRecon?: import("./mizanV3Recon").MizanReconSonuc;
    mizanTutmayan?: import("./mizanV3Recon").MizanReconSatir[];
    maliGelirRolling?: V3MaliGelirRollingSonuc | null;
    metodolojiOzeti: string[];
    uyarilar: string[];
    eye?: {
      quality: EyeQuality;
      snapshotPath?: string;
      f22F96Ok: boolean;
    };
  };
};
