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
import { aylikKumulatifMizanSnapshot } from "./aylikMizanBridge";

const MIN_BAZ_TUTAR = 1;

export class MizanOranServisi {
  readonly butceYili: number;
  readonly yillar: number[];
  private readonly index: MizanIndex;
  /** yil|ay → kümülatif ay-sonu mizan indeksi (ay=12 yok; YE için `index` kullanılır). */
  private readonly ayIndex = new Map<string, MizanIndex>();
  private readonly aylikYillar: number[];

  constructor(mizan: MizanRow[], butceYili = 2027, mizanAylikFull: MizanAylikRow[] = []) {
    this.butceYili = butceYili;
    const merged = mergeMizanYillikVeAylik(mizan, mizanAylikFull);
    const filtered = merged.filter((r) => r.bransKodu !== "TOPLAM");
    this.index = new MizanIndex(filtered);
    this.yillar = [...new Set(filtered.map((r) => r.yil))]
      .filter((y) => y < butceYili)
      .sort((a, b) => a - b);

    const ayYillar = new Set<number>();
    for (let ay = 1; ay <= 11; ay++) {
      for (const y of this.yillar) {
        const snap = aylikKumulatifMizanSnapshot(mizanAylikFull, y, ay);
        if (snap.length === 0) continue;
        this.ayIndex.set(`${y}|${ay}`, new MizanIndex(snap));
        ayYillar.add(y);
      }
    }
    this.aylikYillar = [...ayYillar].sort((a, b) => a - b);
  }

  private hesapTutar(
    yil: number,
    brans: string,
    hesaplar: string[],
    opts: { prefix?: boolean; tumSirket?: boolean; ay?: number } = {},
  ): number {
    const ay = opts.ay ?? 12;
    if (ay === 12) {
      return this.index.hesapTutar(yil, brans, hesaplar, opts);
    }
    const idx = this.ayIndex.get(`${yil}|${ay}`);
    if (!idx) return 0;
    return idx.hesapTutar(yil, brans, hesaplar, opts);
  }

  private hesapEslesmeOpts(bilesen: BilesenSpec) {
    return {
      prefix: bilesen.hesap_eslesme === "prefix",
      bransGt: bilesen.hesap_eslesme === "brans_gt",
    };
  }

  private bilesenPayBaz(
    brans: string,
    yil: number,
    bilesen: BilesenSpec,
    ay = 12,
  ): { pay: number; baz: number } {
    const eslesme = this.hesapEslesmeOpts(bilesen);
    const tumSirketBaz = bilesen.baz_toplam_sirket ?? false;
    const pay = this.hesapTutar(yil, brans, bilesen.pay, { ...eslesme, ay });
    const baz = this.hesapTutar(yil, brans, bilesen.baz, {
      ...eslesme,
      tumSirket: tumSirketBaz,
      ay,
    });
    return { pay, baz };
  }

  private bilesenYilOrani(
    brans: string,
    yil: number,
    bilesen: BilesenSpec,
    ay = 12,
  ): number | null {
    if (ay < 12 && !this.ayIndex.has(`${yil}|${ay}`)) return null;
    const { pay, baz } = this.bilesenPayBaz(brans, yil, bilesen, ay);
    if (Math.abs(baz) < MIN_BAZ_TUTAR) return null;
    return pay / baz;
  }

  /**
   * Birden fazla 7xx: pay ve paydayı branşlarda toplayıp oran.
   * `baz_toplam_sirket` kalemlerinde payda şirket geneli kalır (çift sayılmaz).
   */
  grupBilesenYilOrani(
    branslar: readonly string[],
    yil: number,
    bilesen: BilesenSpec,
    ay = 12,
  ): number | null {
    if (branslar.length === 0) return null;
    if (ay < 12 && !this.ayIndex.has(`${yil}|${ay}`)) return null;
    if (branslar.length === 1) return this.bilesenYilOrani(branslar[0]!, yil, bilesen, ay);

    let pay = 0;
    let baz = 0;
    let sirketBaz: number | null = null;
    const tumSirketBaz = bilesen.baz_toplam_sirket ?? false;
    for (const br of branslar) {
      const olc = this.bilesenPayBaz(br, yil, bilesen, ay);
      pay += olc.pay;
      if (tumSirketBaz) {
        if (sirketBaz == null) sirketBaz = olc.baz;
      } else {
        baz += olc.baz;
      }
    }
    const payda = tumSirketBaz ? (sirketBaz ?? 0) : baz;
    if (Math.abs(payda) < MIN_BAZ_TUTAR) return null;
    return pay / payda;
  }

  grupOrani(
    kalemKodu: string,
    branslar: readonly string[],
    referans: string,
    ay = 12,
  ): number {
    const kodlar = [...new Set(branslar.filter((k) => /^7\d{2}$/.test(k)))];
    if (kodlar.length === 0) return 0;
    if (kodlar.length === 1) return this.bransOrani(kalemKodu, kodlar[0]!, referans, ay);
    if (!(kalemKodu in ORAN_KALEM_MIZAN)) {
      return ORAN_BAZLI_KALEMLER[kalemKodu]?.varsayilan_oran ?? 0;
    }
    if (referans === "manuel") {
      return ORAN_BAZLI_KALEMLER[kalemKodu]?.varsayilan_oran ?? 0;
    }
    const yillar = ay === 12 ? this.yillar : this.aylikYillar;
    const yilFn = (_b: string, y: number, bil: BilesenSpec) =>
      this.grupBilesenYilOrani(kodlar, y, bil, ay);

    if (referans === ORAN_REFERANS_VARSAYILAN || referans === "excel_gt") {
      return hesaplaEtkinOran(kalemKodu, kodlar.join("+"), yilFn, yillar).etkinOran;
    }
    if (referans === "son_yil") {
      if (yillar.length === 0) return 0;
      const b0 = exportNormSpec(kalemKodu).bilesenler[0];
      return this.grupBilesenYilOrani(kodlar, yillar[yillar.length - 1]!, b0, ay) ?? 0;
    }
    if (/^\d+$/.test(referans)) {
      const y = parseInt(referans, 10);
      if (!yillar.includes(y)) return 0;
      const b0 = exportNormSpec(kalemKodu).bilesenler[0];
      return this.grupBilesenYilOrani(kodlar, y, b0, ay) ?? 0;
    }
    if (referans === "son_3_yil_ort") {
      const b0 = exportNormSpec(kalemKodu).bilesenler[0];
      const oranlar: number[] = [];
      for (const y of yillar.slice(-3)) {
        const o = this.grupBilesenYilOrani(kodlar, y, b0, ay);
        if (o != null) oranlar.push(o);
      }
      if (oranlar.length) return oranlar.reduce((a, b) => a + b, 0) / oranlar.length;
    }
    return 0;
  }

  grupYilOlcum(
    kalemKodu: string,
    branslar: readonly string[],
    yil: number,
    ay = 12,
  ): { pay: number; baz: number; oran: number | null } | null {
    const kodlar = [...new Set(branslar.filter((k) => /^7\d{2}$/.test(k)))];
    if (kodlar.length === 0) return null;
    if (kodlar.length === 1) return this.yilOlcum(kalemKodu, kodlar[0]!, yil, ay);

    const yillar = ay === 12 ? this.yillar : this.aylikYillar;
    if (!yillar.includes(yil)) return null;
    if (ay < 12 && !this.ayIndex.has(`${yil}|${ay}`)) return null;
    const b0 = exportNormSpec(kalemKodu).bilesenler[0];
    if (!b0) return null;
    const tumSirketBaz = b0.baz_toplam_sirket ?? false;
    let pay = 0;
    let baz = 0;
    let sirketBaz: number | null = null;
    for (const br of kodlar) {
      const olc = this.bilesenPayBaz(br, yil, b0, ay);
      pay += olc.pay;
      if (tumSirketBaz) {
        if (sirketBaz == null) sirketBaz = olc.baz;
      } else {
        baz += olc.baz;
      }
    }
    const payda = tumSirketBaz ? (sirketBaz ?? 0) : baz;
    if (Math.abs(payda) < MIN_BAZ_TUTAR) return { pay, baz: payda, oran: null };
    return { pay, baz: payda, oran: pay / payda };
  }

  private etkinOranHesapla(kalemKodu: string, brans: string, ay = 12) {
    const yillar = ay === 12 ? this.yillar : this.aylikYillar;
    return hesaplaEtkinOran(
      kalemKodu,
      brans,
      (b, y, bil) => this.bilesenYilOrani(b, y, bil, ay),
      yillar,
    );
  }

  /**
   * Teknik oran — `ay` verilirse aynı ay kümülatif geçmiş yılların ağırlıklı ortalaması.
   * ay=12 (varsayılan) = mevcut YE davranışı.
   */
  bransOrani(kalemKodu: string, brans: string, referans: string, ay = 12): number {
    if (!(kalemKodu in ORAN_KALEM_MIZAN)) {
      return ORAN_BAZLI_KALEMLER[kalemKodu]?.varsayilan_oran ?? 0;
    }
    if (referans === "manuel") {
      return ORAN_BAZLI_KALEMLER[kalemKodu]?.varsayilan_oran ?? 0;
    }
    if (referans === ORAN_REFERANS_VARSAYILAN || referans === "excel_gt") {
      return this.etkinOranHesapla(kalemKodu, brans, ay).etkinOran;
    }
    if (referans === "son_yil") {
      const yillar = ay === 12 ? this.yillar : this.aylikYillar;
      if (yillar.length === 0) return 0;
      const b0 = exportNormSpec(kalemKodu).bilesenler[0];
      const o = this.bilesenYilOrani(brans, yillar[yillar.length - 1], b0, ay);
      return o ?? 0;
    }
    if (/^\d+$/.test(referans)) {
      const y = parseInt(referans, 10);
      const yillar = ay === 12 ? this.yillar : this.aylikYillar;
      if (yillar.includes(y)) {
        const b0 = exportNormSpec(kalemKodu).bilesenler[0];
        const o = this.bilesenYilOrani(brans, y, b0, ay);
        return o ?? 0;
      }
      return 0;
    }
    if (referans === "son_3_yil_ort") {
      const b0 = exportNormSpec(kalemKodu).bilesenler[0];
      const yillar = ay === 12 ? this.yillar : this.aylikYillar;
      const oranlar: number[] = [];
      for (const y of yillar.slice(-3)) {
        const o = this.bilesenYilOrani(brans, y, b0, ay);
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
    opts: { mizanHesapla?: boolean; ay?: number } = {},
  ): BransOranSatir[] {
    const { mizanHesapla = true, ay = 12 } = opts;

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
        : this.bransOrani(kalemKodu, kod, referans, ay);

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

  kalemDetay(kalemKodu: string, brans: string, ay = 12) {
    return this.etkinOranHesapla(kalemKodu, brans, ay);
  }

  /** Tek yıl (veya yıl×ay kümülatif) için pay/baz/oran. */
  yilOlcum(
    kalemKodu: string,
    brans: string,
    yil: number,
    ay = 12,
  ): { pay: number; baz: number; oran: number | null } | null {
    const yillar = ay === 12 ? this.yillar : this.aylikYillar;
    if (!yillar.includes(yil)) return null;
    if (ay < 12 && !this.ayIndex.has(`${yil}|${ay}`)) return null;
    const b0 = exportNormSpec(kalemKodu).bilesenler[0];
    if (!b0) return null;
    const eslesme = {
      prefix: b0.hesap_eslesme === "prefix",
      bransGt: b0.hesap_eslesme === "brans_gt",
    };
    const tumSirketBaz = b0.baz_toplam_sirket ?? false;
    const pay = this.hesapTutar(yil, brans, b0.pay, { ...eslesme, ay });
    const baz = this.hesapTutar(yil, brans, b0.baz, { ...eslesme, tumSirket: tumSirketBaz, ay });
    if (Math.abs(baz) < MIN_BAZ_TUTAR) return { pay, baz, oran: null };
    return { pay, baz, oran: pay / baz };
  }
}

export function oranKalemListesi(): { kod: string; ad: string }[] {
  return Object.entries(ORAN_BAZLI_KALEMLER).map(([kod, v]) => ({ kod, ad: v.ad }));
}
