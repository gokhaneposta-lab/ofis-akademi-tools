import { HAZINE_BRANS_KODLARI, HAZINE_BRANS_SIRASI } from "../config/brans";
import { AYLAR } from "../config/constants";
import { normalizeBransKodu } from "../textUtils";
import { buildKpkSonuc, kpkHucreOverride } from "../kpk/buildKpkSonuc";
import { KPK_GT_SATIRLARI } from "../kpk/kpkMotoru";
import type { AylikPrimStore, FaaliyetGiderRow, KpkVadeRow, MizanAylikRow, MizanRow, OranAyarStore, TarifeBransPayRow, KpkKapanisTahminStore } from "../types";
import {
  buildFaaliyetGiderSonuc,
  faaliyetGiderHucreOverride,
  FAALIYET_GT_SATIRLARI,
} from "./faaliyetGiderGt";
import { GelirTablosuMotoru, type GtEksikGirdi } from "./gtMotoru";

/** Gelir tablosunda gösterilecek GT satırları (Excel satır no + sunum). */
export type GtGosterimSatir = {
  satir: number;
  /** Sunum kodu; boş değer sentetik V2 toplamlarında F satır numarasını gizler. */
  kod?: string;
  ad: string;
  seviye: 0 | 1 | 2;
  kalin?: boolean;
  vurgu?: boolean;
  disGirdi?: boolean;
  /** Hesaplamaya dahil edilir ancak tabloda gösterilmez. */
  gizli?: boolean;
};

export const GT_GOSTERIM_SATIRLARI: GtGosterimSatir[] = [
  { satir: 11, ad: "Brüt yazılan prim", seviye: 0, kalin: true },
  { satir: 19, ad: "Reasüransa devredilen prim (-)", seviye: 1 },
  { satir: 21, ad: "Kazanılmamış prim karş. değişim", seviye: 1 },
  { satir: 31, ad: "Devam eden riskler karş.", seviye: 1, disGirdi: true },
  { satir: 86, ad: "Rücu ve sovtaj gelirleri (+)", seviye: 1 },
  { satir: 9, ad: "HAYAT DIŞI TEKNİK GELİR", seviye: 0, kalin: true },
  { satir: 96, ad: "Brüt ödenen hasar (-)", seviye: 1 },
  { satir: 105, ad: "Ödenen hasarda reasürör payı (+)", seviye: 1 },
  { satir: 95, ad: "Ödenen hasarlar (net)", seviye: 1, kalin: true },
  { satir: 114, ad: "Muallak hasar karş. değişim", seviye: 1 },
  { satir: 177, ad: "Üretim komisyon gideri (-)", seviye: 2 },
  { satir: 196, ad: "Alınan reasürans komisyonları (+)", seviye: 2 },
  { satir: 176, ad: "Faaliyet giderleri", seviye: 1 },
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
  mizanAylik?: MizanAylikRow[];
  tarifeBransPay?: TarifeBransPayRow[];
  kpkVade?: KpkVadeRow[];
  kapanisTahmin?: KpkKapanisTahminStore | null;
  faaliyetGider?: FaaliyetGiderRow[];
  /** Branş → GT satır override (örn. V2 F38 mali gelir). */
  disHucrelerByBrans?: Record<string, Record<number, number>>;
  /** Varsayılan gösterim satırlarını değiştir (V2 geniş liste). */
  gosterimSatirlari?: GtGosterimSatir[];
  /** Şirket toplamı aylık override; branşlara prim payı ile dağıtılır. */
  aylikSatirOverride?: Record<number, number[]>;
  /** MIZAN_AY full — GT kodları (02571 vb.) yılsonu snapshot ile oranlara eklenir. */
  mizanAylikFull?: MizanAylikRow[];
}): GelirTablosuSonuc {
  const {
    mizan,
    butceYili,
    primHedefleri,
    endirektPrim = {},
    aylikPrim,
    oranAyar = {},
    mizanAylik = [],
    tarifeBransPay = [],
    kpkVade = [],
    kapanisTahmin,
    faaliyetGider = [],
    disHucrelerByBrans = {},
    gosterimSatirlari,
    aylikSatirOverride,
    mizanAylikFull = [],
  } = opts;

  const satirlar = gosterimSatirlari ?? GT_GOSTERIM_SATIRLARI;
  const gosterimNolari = satirlar.map((s) => s.satir);

  const kpkSonuc =
    kpkVade.length > 0
      ? buildKpkSonuc({
          butceYili,
          mizan,
          mizanAylik,
          tarifeBransPay,
          vadeRows: kpkVade,
          aylikPrim,
          oranAyar,
          kapanisTahmin,
          mizanAylikFull,
        })
      : null;

  const kpkByBrans = new Map(kpkSonuc?.branslar.map((b) => [b.bransKodu, b]) ?? []);

  const aktifBranslar = HAZINE_BRANS_SIRASI.filter((k) => (primHedefleri[k] ?? 0) > 0);

  const faaliyetSonuc =
    faaliyetGider.length > 0
      ? buildFaaliyetGiderSonuc({
          butceYili,
          rows: faaliyetGider,
          mizan,
          oranAyar,
          aktifBransKodlari: aktifBranslar,
          mizanAylikFull,
        })
      : null;
  const faaliyetByBrans = new Map(faaliyetSonuc?.map((b) => [b.bransKodu, b]) ?? []);

  const motor = new GelirTablosuMotoru(mizan, butceYili, oranAyar, mizanAylikFull);

  const branslar: GelirBransKolon[] = [];
  const toplam: Record<number, number> = {};
  const aylikToplam: Record<number, number[]> = {};
  const aylikBrans: Record<string, Record<number, number[]>> = {};
  for (const s of gosterimNolari) {
    toplam[s] = 0;
    aylikToplam[s] = Array.from({ length: 12 }, () => 0);
  }

  const aylikPaylar = aylikPrimPaylariMap(aylikPrim);
  const brutPrimToplam = HAZINE_BRANS_SIRASI.reduce((a, k) => a + (primHedefleri[k] ?? 0), 0);

  for (const kod of HAZINE_BRANS_SIRASI) {
    const brut = primHedefleri[kod] ?? 0;
    if (brut <= 0) continue;
    const endirekt = endirektPrim[kod] ?? 0;
    const kpkBrans = kpkByBrans.get(kod);
    const fgBrans = faaliyetByBrans.get(kod);
    const disHucreler = {
      ...(kpkBrans ? kpkHucreOverride(kpkBrans) : {}),
      ...(fgBrans ? faaliyetGiderHucreOverride(fgBrans) : {}),
      ...(disHucrelerByBrans[kod] ?? {}),
    };
    const tumDegerler = motor.hesaplaBrans(kod, brut, endirekt, disHucreler);

    const degerler: Record<number, number> = {};
    for (const s of gosterimNolari) degerler[s] = tumDegerler.get(s) ?? 0;

    const info = HAZINE_BRANS_KODLARI[kod] ?? ["", kod, ""];
    branslar.push({ bransKodu: kod, bransAdi: info[1], brutPrim: brut, degerler });

    for (const s of gosterimNolari) toplam[s] += degerler[s];

    // Aylık: tüm satırları branşın prim mevsimselliğine göre dağıt.
    const paylar = aylikPaylar[kod] ?? null;
    const bransAylik: Record<number, number[]> = {};
    const kpkAylikSatirlar = new Set<number>(KPK_GT_SATIRLARI as unknown as number[]);
    const faaliyetAylikSatirlar = new Set<number>(FAALIYET_GT_SATIRLARI);
    for (const s of gosterimNolari) {
      const yillik = degerler[s];
      if (kpkBrans && kpkAylikSatirlar.has(s) && kpkBrans.gtAylik[s]) {
        bransAylik[s] = [...kpkBrans.gtAylik[s]!];
      } else if (fgBrans && faaliyetAylikSatirlar.has(s) && fgBrans.gtAylik[s]) {
        bransAylik[s] = [...fgBrans.gtAylik[s]!];
      } else {
        const paylarLocal = paylar;
        bransAylik[s] = paylarLocal
          ? paylarLocal.map((p) => yillik * p)
          : Array.from({ length: 12 }, () => yillik / 12);
      }
      for (let i = 0; i < 12; i++) aylikToplam[s][i] += bransAylik[s]![i] ?? 0;
    }
    aylikBrans[kod] = bransAylik;
  }

  if (aylikSatirOverride) {
    for (const [satirStr, serie] of Object.entries(aylikSatirOverride)) {
      const satir = Number(satirStr);
      if (!serie || serie.length !== 12) continue;
      aylikToplam[satir] = [...serie];
      toplam[satir] = serie.reduce((a, b) => a + b, 0);
      for (const b of branslar) {
        const pay = brutPrimToplam > 0 ? b.brutPrim / brutPrimToplam : 0;
        const ser = serie.map((v) => v * pay);
        if (!aylikBrans[b.bransKodu]) aylikBrans[b.bransKodu] = {};
        aylikBrans[b.bransKodu]![satir] = ser;
        b.degerler[satir] = ser.reduce((a, x) => a + x, 0);
      }
    }
  }

  return {
    butceYili,
    satirlar,
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
