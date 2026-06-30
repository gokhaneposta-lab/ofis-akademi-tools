import { HAZINE_BRANS_KODLARI, HAZINE_BRANS_SIRASI } from "../config/brans";
import { AYLAR } from "../config/constants";
import { normalizeBransKodu } from "../textUtils";
import type { AylikPrimStore, MizanRow, OranAyarStore } from "../types";
import { GelirTablosuMotoru, type GtEksikGirdi } from "./gtMotoru";

/** Gelir tablosunda gösterilecek GT satırları (Excel satır no + sunum). */
export type GtGosterimSatir = {
  satir: number;
  ad: string;
  seviye: 0 | 1 | 2;
  kalin?: boolean;
  vurgu?: boolean;
  disGirdi?: boolean;
};

export const GT_GOSTERIM_SATIRLARI: GtGosterimSatir[] = [
  { satir: 11, ad: "Brüt yazılan prim", seviye: 0, kalin: true },
  { satir: 19, ad: "Reasüransa devredilen prim (-)", seviye: 1 },
  { satir: 21, ad: "Kazanılmamış prim karş. değişim", seviye: 1, disGirdi: true },
  { satir: 31, ad: "Devam eden riskler karş.", seviye: 1, disGirdi: true },
  { satir: 86, ad: "Rücu ve sovtaj gelirleri (+)", seviye: 1 },
  { satir: 9, ad: "HAYAT DIŞI TEKNİK GELİR", seviye: 0, kalin: true },
  { satir: 96, ad: "Brüt ödenen hasar (-)", seviye: 1 },
  { satir: 105, ad: "Ödenen hasarda reasürör payı (+)", seviye: 1 },
  { satir: 95, ad: "Ödenen hasarlar (net)", seviye: 1, kalin: true },
  { satir: 114, ad: "Muallak hasar karş. değişim", seviye: 1 },
  { satir: 176, ad: "Faaliyet giderleri", seviye: 1 },
  { satir: 177, ad: "Üretim komisyon gideri (-)", seviye: 2 },
  { satir: 202, ad: "Matematik karş. değişim", seviye: 1, disGirdi: true },
  { satir: 94, ad: "HAYAT DIŞI TEKNİK GİDER", seviye: 0, kalin: true },
  { satir: 8, ad: "TEKNİK KÂR / ZARAR", seviye: 0, kalin: true, vurgu: true },
];

export type GelirBransKolon = {
  bransKodu: string;
  bransAdi: string;
  brutPrim: number;
  /** satir no → tutar */
  degerler: Record<number, number>;
};

export type GelirTablosuSonuc = {
  butceYili: number;
  satirlar: GtGosterimSatir[];
  branslar: GelirBransKolon[];
  /** Tüm branş toplamı: satir no → tutar */
  toplam: Record<number, number>;
  /** Aylık: satir no → 12 aylık toplam tutar (tüm branş) */
  aylikToplam: Record<number, number[]>;
  /** Branş bazlı aylık: bransKodu → satir no → 12 ay */
  aylikBrans: Record<string, Record<number, number[]>>;
  aylar: string[];
  eksikGirdiler: GtEksikGirdi[];
  brutPrimToplam: number;
};

const GOSTERIM_SATIR_NOLARI = GT_GOSTERIM_SATIRLARI.map((s) => s.satir);

export function buildGelirTablosu(opts: {
  mizan: MizanRow[];
  butceYili: number;
  primHedefleri: Record<string, number>;
  endirektPrim?: Record<string, number>;
  aylikPrim?: AylikPrimStore | null;
  oranAyar?: OranAyarStore;
}): GelirTablosuSonuc {
  const { mizan, butceYili, primHedefleri, endirektPrim = {}, aylikPrim, oranAyar = {} } = opts;

  const motor = new GelirTablosuMotoru(mizan, butceYili, oranAyar);

  const branslar: GelirBransKolon[] = [];
  const toplam: Record<number, number> = {};
  const aylikToplam: Record<number, number[]> = {};
  const aylikBrans: Record<string, Record<number, number[]>> = {};
  for (const s of GOSTERIM_SATIR_NOLARI) {
    toplam[s] = 0;
    aylikToplam[s] = Array.from({ length: 12 }, () => 0);
  }

  const aylikPaylar = aylikPrimPaylariMap(aylikPrim);

  for (const kod of HAZINE_BRANS_SIRASI) {
    const brut = primHedefleri[kod] ?? 0;
    if (brut <= 0) continue;
    const endirekt = endirektPrim[kod] ?? 0;
    const tumDegerler = motor.hesaplaBrans(kod, brut, endirekt);

    const degerler: Record<number, number> = {};
    for (const s of GOSTERIM_SATIR_NOLARI) degerler[s] = tumDegerler.get(s) ?? 0;

    const info = HAZINE_BRANS_KODLARI[kod] ?? ["", kod, ""];
    branslar.push({ bransKodu: kod, bransAdi: info[1], brutPrim: brut, degerler });

    for (const s of GOSTERIM_SATIR_NOLARI) toplam[s] += degerler[s];

    // Aylık: tüm satırları branşın prim mevsimselliğine göre dağıt.
    const paylar = aylikPaylar[kod] ?? null;
    const bransAylik: Record<number, number[]> = {};
    for (const s of GOSTERIM_SATIR_NOLARI) {
      const yillik = degerler[s];
      const aylar = paylar
        ? paylar.map((p) => yillik * p)
        : Array.from({ length: 12 }, () => yillik / 12);
      bransAylik[s] = aylar;
      for (let i = 0; i < 12; i++) aylikToplam[s][i] += aylar[i];
    }
    aylikBrans[kod] = bransAylik;
  }

  return {
    butceYili,
    satirlar: GT_GOSTERIM_SATIRLARI,
    branslar,
    toplam,
    aylikToplam,
    aylikBrans,
    aylar: AYLAR,
    eksikGirdiler: [...motor.eksikGirdiler.values()].sort((a, b) => a.satir - b.satir),
    brutPrimToplam: branslar.reduce((a, b) => a + b.brutPrim, 0),
  };
}

/** AylikPrimStore → branş → 12 aylık pay (toplam 1). */
function aylikPrimPaylariMap(store?: AylikPrimStore | null): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  if (!store) return out;
  for (const r of store.satirlar) {
    const toplam = r.toplam || r.aylar.reduce((a, b) => a + b, 0);
    if (toplam <= 0) continue;
    out[normalizeBransKodu(r.bransKodu)] = r.aylar.map((v) => v / toplam);
  }
  return out;
}
