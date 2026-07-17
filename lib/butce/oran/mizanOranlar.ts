import { HAZINE_BRANS_KODLARI, HAZINE_BRANS_SIRASI } from "../config/brans";
import {
  ORAN_KALEM_ALT_GRUP,
  ORAN_REFERANS_SECENEKLERI,
  ORAN_REFERANS_VARSAYILAN,
} from "../config/constants";
import type { BransOranAyar, BransOranSatir, MizanAylikRow, MizanRow, OranAyarStore } from "../types";
import type { BilesenSpec } from "./oranKalemLoader";
import { ORAN_BAZLI_KALEMLER, ORAN_KALEM_MIZAN } from "./oranKalemLoader";
import { exportNormSpec, hesaplaEtkinOran } from "./oranMotoru";
import { MizanIndex } from "./mizanIndex";
import { mergeMizanYillikVeAylik } from "./mizanAylikYilsonu";

const MIN_BAZ_TUTAR = 1;

export class MizanOranServisi {
  readonly butceYili: number;
  readonly yillar: number[];
  private readonly index: MizanIndex;

  constructor(mizan: MizanRow[], butceYili = 2027, mizanAylikFull: MizanAylikRow[] = []) {
    this.butceYili = butceYili;
    const merged = mergeMizanYillikVeAylik(mizan, mizanAylikFull);
    const filtered = merged.filter((r) => r.bransKodu !== "TOPLAM");
    this.index = new MizanIndex(filtered);
    this.yillar = [...new Set(filtered.map((r) => r.yil))]
      .filter((y) => y < butceYili)
      .sort((a, b) => a - b);
  }

  private hesapTutar(
    yil: number,
    brans: string,
    hesaplar: string[],
    opts: { prefix?: boolean; tumSirket?: boolean } = {},
  ): number {
    return this.index.hesapTutar(yil, brans, hesaplar, opts);
  }

  private hesapEslesmeOpts(bilesen: BilesenSpec) {
    return {
      prefix: bilesen.hesap_eslesme === "prefix",
      bransGt: bilesen.hesap_eslesme === "brans_gt",
    };
  }

  private bilesenYilOrani(brans: string, yil: number, bilesen: BilesenSpec): number | null {
    const eslesme = this.hesapEslesmeOpts(bilesen);
    const tumSirketBaz = bilesen.baz_toplam_sirket ?? false;
    const pay = this.hesapTutar(yil, brans, bilesen.pay, eslesme);
    const baz = this.hesapTutar(yil, brans, bilesen.baz, { ...eslesme, tumSirket: tumSirketBaz });
    if (Math.abs(baz) < MIN_BAZ_TUTAR) return null;
    return pay / baz;
  }

  private etkinOranHesapla(kalemKodu: string, brans: string) {
    return hesaplaEtkinOran(
      kalemKodu,
      brans,
      (b, y, bil) => this.bilesenYilOrani(b, y, bil),
      this.yillar,
    );
  }

  bransOrani(kalemKodu: string, brans: string, referans: string): number {
    if (!(kalemKodu in ORAN_KALEM_MIZAN)) {
      return ORAN_BAZLI_KALEMLER[kalemKodu]?.varsayilan_oran ?? 0;
    }
    if (referans === "manuel") {
      return ORAN_BAZLI_KALEMLER[kalemKodu]?.varsayilan_oran ?? 0;
    }
    if (referans === ORAN_REFERANS_VARSAYILAN || referans === "excel_gt") {
      return this.etkinOranHesapla(kalemKodu, brans).etkinOran;
    }
    if (referans === "son_yil") {
      if (this.yillar.length === 0) return 0;
      const b0 = exportNormSpec(kalemKodu).bilesenler[0];
      const o = this.bilesenYilOrani(brans, this.yillar[this.yillar.length - 1], b0);
      return o ?? 0;
    }
    if (/^\d+$/.test(referans)) {
      const y = parseInt(referans, 10);
      if (this.yillar.includes(y)) {
        const b0 = exportNormSpec(kalemKodu).bilesenler[0];
        const o = this.bilesenYilOrani(brans, y, b0);
        return o ?? 0;
      }
      return 0;
    }
    if (referans === "son_3_yil_ort") {
      const b0 = exportNormSpec(kalemKodu).bilesenler[0];
      const oranlar: number[] = [];
      for (const y of this.yillar.slice(-3)) {
        const o = this.bilesenYilOrani(brans, y, b0);
        if (o != null) oranlar.push(o);
      }
      if (oranlar.length) return oranlar.reduce((a, b) => a + b, 0) / oranlar.length;
    }
    return 0;
  }

  yilEtiketleri(): [string, string][] {
    const opts: [string, string][] = [...ORAN_REFERANS_SECENEKLERI];
    for (const y of [...this.yillar].reverse()) opts.push([String(y), String(y)]);
    return opts;
  }

  tumBranslarTablosu(
    kalemKodu: string,
    bransAyar: Record<string, BransOranAyar> = {},
    opts: { mizanHesapla?: boolean } = {},
  ): BransOranSatir[] {
    const { mizanHesapla = true } = opts;

    if (!mizanHesapla && Object.keys(bransAyar).length > 0) {
      return this.tabloFromBransAyar(kalemKodu, bransAyar);
    }

    return HAZINE_BRANS_SIRASI.map((kod) => {
      const info = HAZINE_BRANS_KODLARI[kod] ?? ["", kod, ""];
      const ayar = bransAyar[kod] ?? {};
      const referans = ayar.referans ?? ORAN_REFERANS_VARSAYILAN;
      const manuel = ayar.manuel ?? false;
      const oran = manuel && ayar.oran != null
        ? ayar.oran
        : this.bransOrani(kalemKodu, kod, referans);

      return {
        bransKodu: kod,
        bransAdi: info[1],
        anaBrans: info[2],
        referans,
        oran: Math.round(oran * 1e6) / 1e6,
        manuel,
      };
    });
  }

  tabloFromBransAyar(kalemKodu: string, bransAyar: Record<string, BransOranAyar>): BransOranSatir[] {
    const varsayilan = ORAN_BAZLI_KALEMLER[kalemKodu]?.varsayilan_oran ?? 0;
    return HAZINE_BRANS_SIRASI.map((kod) => {
      const info = HAZINE_BRANS_KODLARI[kod] ?? ["", kod, ""];
      const ayar = bransAyar[kod] ?? {};
      return {
        bransKodu: kod,
        bransAdi: info[1],
        anaBrans: info[2],
        referans: ayar.referans ?? ORAN_REFERANS_VARSAYILAN,
        oran: Math.round((ayar.oran ?? varsayilan) * 1e6) / 1e6,
        manuel: ayar.manuel ?? false,
      };
    });
  }

  bransAyarMizanHesapla(
    kalemKodu: string,
    mevcutAyar: Record<string, BransOranAyar> = {},
  ): Record<string, BransOranAyar> {
    const tablo = this.tumBranslarTablosu(kalemKodu, mevcutAyar);
    const out: Record<string, BransOranAyar> = {};
    for (const row of tablo) {
      out[row.bransKodu] = {
        referans: row.referans,
        oran: row.oran,
        manuel: row.manuel,
      };
    }
    return out;
  }

  migrateLegacyBransAyarlar(bransAyarlar: OranAyarStore): OranAyarStore {
    const out: OranAyarStore = { ...bransAyarlar };
    for (const [parent, altlar] of Object.entries(ORAN_KALEM_ALT_GRUP)) {
      if (!(parent in out) || altlar.some((a) => a in out)) continue;
      const parentAyar = out[parent];
      delete out[parent];
      for (const alt of altlar) {
        const altAyar: Record<string, BransOranAyar> = {};
        for (const [kod, ayar] of Object.entries(parentAyar)) {
          const ref = ayar.referans ?? ORAN_REFERANS_VARSAYILAN;
          if (ayar.manuel && ayar.oran != null) {
            altAyar[kod] = { referans: "manuel", oran: ayar.oran, manuel: true };
          } else {
            altAyar[kod] = {
              referans: ref,
              oran: this.bransOrani(alt, kod, ref),
              manuel: false,
            };
          }
        }
        out[alt] = altAyar;
      }
    }
    return out;
  }

  kalemDetay(kalemKodu: string, brans: string) {
    return this.etkinOranHesapla(kalemKodu, brans);
  }

  /** Tek yıl için pay/baz/oran (backtest veya diagnostik). */
  yilOlcum(
    kalemKodu: string,
    brans: string,
    yil: number,
  ): { pay: number; baz: number; oran: number | null } | null {
    if (!this.yillar.includes(yil)) return null;
    const b0 = exportNormSpec(kalemKodu).bilesenler[0];
    if (!b0) return null;
    const eslesme = {
      prefix: b0.hesap_eslesme === "prefix",
      bransGt: b0.hesap_eslesme === "brans_gt",
    };
    const tumSirketBaz = b0.baz_toplam_sirket ?? false;
    const pay = this.hesapTutar(yil, brans, b0.pay, eslesme);
    const baz = this.hesapTutar(yil, brans, b0.baz, { ...eslesme, tumSirket: tumSirketBaz });
    if (Math.abs(baz) < MIN_BAZ_TUTAR) return { pay, baz, oran: null };
    return { pay, baz, oran: pay / baz };
  }
}

export function oranKalemListesi(): { kod: string; ad: string }[] {
  return Object.entries(ORAN_BAZLI_KALEMLER).map(([kod, v]) => ({ kod, ad: v.ad }));
}
