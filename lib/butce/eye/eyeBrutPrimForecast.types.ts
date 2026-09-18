import type { MizanAylikRow, TarifeMapRow } from "../types";

export type EyeBrutPrimForecastDurum = "ok" | "partial" | "blocked";

export type EyePrimUyari = {
  kod: string;
  mesaj: string;
  tarifeGrubu?: string;
  ay?: number;
  bransKodu?: string;
};

export type EyePrimTarifeSatir = {
  tarifeGrubu: string;
  /** Karşılaştırma only — forecast formülüne girmez. */
  butceYillik: number | null;
  actualYtd: number;
  buyumeOtomatik: number | null;
  buyumeH2Tarihsel: number | null;
  buyumeUygulanan: number | null;
  h2ForecastToplam: number;
  eyeYillik: number;
  butceSapma: number | null;
  /** Tarife incremental; indeks 0..anchor-1 = 0 (actual ayrı katmanda). */
  aylikForecast: number[];
  /** 2025 baz (H2 penceresi anlamlı). */
  aylik2025Baz: number[];
};

export type EyeBrutPrimForecastOpts = {
  butceYili: number;
  anchorAy: number;
  mizanAylikFull: MizanAylikRow[];
  tarifeMap: TarifeMapRow[];
  bransKodlari?: string[];
  /** normalizeText tarife anahtarı → ondalık growth (0.1329 = +13,29%). */
  buyumeOverrideByTarife?: Record<string, number>;
  /** UI karşılaştırma; forecast'e girmez. */
  butceYillikByTarife?: Record<string, number>;
};

export type EyeBrutPrimForecastSonuc = {
  durum: EyeBrutPrimForecastDurum;
  anchorAy: number;
  butceYili: number;
  tarifeSatirlari: EyePrimTarifeSatir[];
  /** Branş × 12 incremental; yalnızca H2 (anchor..11) dolu, actual indeksler 0. */
  h2ForecastPrimByBrans: Record<string, number[]>;
  uyarilar: EyePrimUyari[];
  forecastMethodVersion: "eye-prim-v1-growth-h2";
};

export type ResolveEyeForecastPrimMotorOpts = EyeBrutPrimForecastOpts & {
  /** Unit test inject — production'da kullanılmaz. */
  injectedAylikPrim?: Record<string, number[]>;
};

export type ResolveEyeForecastPrimMotorSonuc = {
  durum: EyeBrutPrimForecastDurum;
  anchorAy: number;
  h2ForecastPrimByBrans: Record<string, number[]>;
  tarifeSatirlari: EyePrimTarifeSatir[];
  uyarilar: EyePrimUyari[];
  mesaj?: string;
  forecastMethodVersion: "eye-prim-v1-growth-h2";
};
