import { HAZINE_BRANS_KODLARI, HAZINE_BRANS_SIRASI } from "../config/brans";
import {
  ORAN_KALEM_ALT_GRUP,
  ORAN_REFERANS_SECENEKLERI,
  ORAN_REFERANS_VARSAYILAN,
} from "../config/constants";
import { bransGrubu } from "../v2/buildGtFormatGrid";
import type { BransOranAyar, BransOranSatir, MizanAylikRow, MizanRow, OranAyarStore } from "../types";
import type { BilesenSpec } from "./oranKalemLoader";
import { ORAN_BAZLI_KALEMLER, ORAN_KALEM_MIZAN } from "./oranKalemLoader";
import type { OranDuzenleme } from "./oranMetodoloji";
import {
  birlestirDuzenlemeler,
  oranDuzenleme,
  V2_GRUP_FALLBACK_KALEMLER,
  V2_HASAR_BLOK_KALEMLER,
} from "./oranMetodoloji";
import { exportNormSpec, hesaplaEtkinOran } from "./oranMotoru";
import {
  duzenlemelerFromEtkinDetay,
  grupFallbackDuzenlemesi,
  kucukBazMi,
  kuralDuzenlemeleri,
  tarifeGrupUyeleri,
} from "./oranV2Duzenleme";
import { MizanIndex } from "./mizanIndex";
import { mergeMizanYillikVeAylik } from "./mizanAylikYilsonu";
import { aylikKumulatifMizanSnapshot } from "./aylikMizanBridge";

const MIN_BAZ_TUTAR = 1;
/** 613 gideri (karşılık ayırma) eşiği — yuvarlama gürültüsünü ele. */
const MIN_PAY_GIDERI = 1;

export class MizanOranServisi {
  readonly butceYili: number;
  readonly yillar: number[];
  private readonly index: MizanIndex;
  /** yil|ay → kümülatif ay-sonu mizan indeksi (ay=12 yok; YE için `index` kullanılır). */
  private readonly ayIndex = new Map<string, MizanIndex>();
  private readonly aylikYillar: number[];
  /** kalem|brans → YE mizanda pay gideri (negatif) var mı */
  private readonly payGideriCache = new Map<string, boolean>();
  /** Bütçe V2: küçük baz / hasar bloğu grup fallback + audit */
  readonly v2Metodoloji: boolean;
  private readonly oranCache = new Map<string, number>();
  private readonly duzenlemeCache = new Map<string, OranDuzenleme[]>();
  private readonly sonBazCache = new Map<string, number>();
  private readonly hasarBlokCache = new Map<string, boolean>();

  constructor(
    mizan: MizanRow[],
    butceYili = 2027,
    mizanAylikFull: MizanAylikRow[] = [],
    v2Metodoloji = false,
  ) {
    this.v2Metodoloji = v2Metodoloji;
    this.butceYili = butceYili;
    const merged = mergeMizanYillikVeAylik(mizan, mizanAylikFull);
    const filtered = merged.filter((r) => r.bransKodu !== "TOPLAM");
    this.index = new MizanIndex(filtered);
    this.yillar = [...new Set(filtered.map((r) => r.yil))]
      .filter((y) => y < butceYili)
      .sort((a, b) => a - b);

    const aylikKaynakYillar = [...new Set(mizanAylikFull.map((r) => Number(r.yil)))]
      .filter((y) => Number.isFinite(y) && y <= butceYili)
      .sort((a, b) => a - b);
    const ayYillar = new Set<number>();
    for (let ay = 1; ay <= 11; ay++) {
      for (const y of aylikKaynakYillar) {
        const snap = aylikKumulatifMizanSnapshot(mizanAylikFull, y, ay);
        if (snap.length === 0) continue;
        this.ayIndex.set(`${y}|${ay}`, new MizanIndex(snap));
        ayYillar.add(y);
      }
    }
    // Sistem/ortalama hesaplari kapali yillari kullanir; guncel yil YTD ayIndex'te durur.
    this.aylikYillar = [...ayYillar].filter((y) => y < butceYili).sort((a, b) => a - b);
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
   * Mizanda pay hesabı gideri (negatif tutar) geçmişi olan branşlara sabit oran.
   * F348: yalnızca daha önce dengeleme ayırılan branşlarda −%12.
   */
  private payGideriGecmisiVar(kalemKodu: string, brans: string): boolean {
    const key = `${kalemKodu}|${brans}`;
    const cached = this.payGideriCache.get(key);
    if (cached != null) return cached;
    const spec = ORAN_KALEM_MIZAN[kalemKodu];
    if (!spec?.pay.length) {
      this.payGideriCache.set(key, false);
      return false;
    }
    let varMi = false;
    for (const yil of this.yillar) {
      const pay = this.hesapTutar(yil, brans, spec.pay);
      if (pay < -MIN_PAY_GIDERI) {
        varMi = true;
        break;
      }
    }
    this.payGideriCache.set(key, varMi);
    return varMi;
  }

  /** `sadece_pay_gideri` kaleminde sistem oranı; değilse null (klasik motor). */
  private sabitOranSistem(kalemKodu: string, brans: string): number | null {
    const spec = ORAN_KALEM_MIZAN[kalemKodu];
    if (spec?.sabit_oran == null || !spec.sadece_pay_gideri) return null;
    return this.payGideriGecmisiVar(kalemKodu, brans) ? spec.sabit_oran : 0;
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

  /** V2 audit: branş×kalem düzenleme notları (son bransOrani çağrısından). */
  bransOranDuzenlemeleri(
    kalemKodu: string,
    brans: string,
    referans: string,
    ay = 12,
  ): OranDuzenleme[] {
    if (!this.v2Metodoloji) return [];
    const key = `${kalemKodu}|${brans}|${ay}|${referans}`;
    if (!this.duzenlemeCache.has(key)) {
      void this.bransOrani(kalemKodu, brans, referans, ay);
    }
    return this.duzenlemeCache.get(key) ?? [];
  }

  private sonYilBaz(kalemKodu: string, brans: string, ay: number): number {
    const key = `${kalemKodu}|${brans}|${ay}`;
    const cached = this.sonBazCache.get(key);
    if (cached != null) return cached;
    const yillar = ay === 12 ? this.yillar : this.aylikYillar;
    const y = yillar[yillar.length - 1];
    let baz = 0;
    if (y != null && kalemKodu in ORAN_KALEM_MIZAN) {
      baz = this.yilOlcum(kalemKodu, brans, y, ay)?.baz ?? 0;
    }
    this.sonBazCache.set(key, baz);
    return baz;
  }

  private hasarBlokGrupModu(brans: string, ay: number): boolean {
    const key = `${brans}|${ay}`;
    const cached = this.hasarBlokCache.get(key);
    if (cached != null) return cached;
    let mod = false;
    for (const k of V2_HASAR_BLOK_KALEMLER) {
      if (kucukBazMi(this.sonYilBaz(k, brans, ay), k)) {
        mod = true;
        break;
      }
    }
    this.hasarBlokCache.set(key, mod);
    return mod;
  }

  private v2GrupFallbackGerekli(kalemKodu: string, brans: string, ay: number): boolean {
    if (V2_HASAR_BLOK_KALEMLER.has(kalemKodu) && this.hasarBlokGrupModu(brans, ay)) {
      return true;
    }
    if (V2_GRUP_FALLBACK_KALEMLER.has(kalemKodu)) {
      return kucukBazMi(this.sonYilBaz(kalemKodu, brans, ay), kalemKodu);
    }
    return false;
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
    return this.grupOraniStandart(kalemKodu, kodlar, referans, ay);
  }

  /** Çoklu 7xx: toplam pay ÷ toplam payda (V2 grup fallback burayı kullanır). */
  private grupOraniStandart(
    kalemKodu: string,
    kodlar: readonly string[],
    referans: string,
    ay: number,
  ): number {
    const spec = ORAN_KALEM_MIZAN[kalemKodu];
    if (spec?.sabit_oran != null && spec.sadece_pay_gideri) {
      const yillarSabit = ay === 12 ? this.yillar : this.aylikYillar;
      const refYil = yillarSabit[yillarSabit.length - 1];
      const b0 = exportNormSpec(kalemKodu).bilesenler[0];
      if (!b0 || refYil == null) {
        const herhangi = kodlar.some((k) => this.payGideriGecmisiVar(kalemKodu, k));
        return herhangi ? spec.sabit_oran : 0;
      }
      let pay = 0;
      let baz = 0;
      for (const br of kodlar) {
        const olc = this.bilesenPayBaz(br, refYil, b0, ay);
        const oran = this.sabitOranSistem(kalemKodu, br) ?? 0;
        baz += olc.baz;
        pay += olc.baz * oran;
      }
      if (Math.abs(baz) < MIN_BAZ_TUTAR) {
        const herhangi = kodlar.some((k) => this.payGideriGecmisiVar(kalemKodu, k));
        return herhangi ? spec.sabit_oran : 0;
      }
      return pay / baz;
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

    if (ay === 12) {
      if (!this.yillar.includes(yil)) return null;
    } else if (!this.ayIndex.has(`${yil}|${ay}`)) {
      return null;
    }
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
   * V2: küçük baz / hasar bloğu grup fallback + duzenlemeCache.
   */
  bransOrani(kalemKodu: string, brans: string, referans: string, ay = 12): number {
    const cacheKey = `${kalemKodu}|${brans}|${ay}|${referans}`;
    if (this.oranCache.has(cacheKey)) return this.oranCache.get(cacheKey)!;

    let oran: number;
    let duzenlemeler: OranDuzenleme[] = [];

    if (!(kalemKodu in ORAN_KALEM_MIZAN)) {
      oran = ORAN_BAZLI_KALEMLER[kalemKodu]?.varsayilan_oran ?? 0;
    } else if (referans === "manuel") {
      oran = ORAN_BAZLI_KALEMLER[kalemKodu]?.varsayilan_oran ?? 0;
      duzenlemeler = [oranDuzenleme("manuel")];
    } else {
      const sabit = this.sabitOranSistem(kalemKodu, brans);
      if (sabit != null) {
        oran = sabit;
        duzenlemeler = kuralDuzenlemeleri(kalemKodu);
        if (duzenlemeler.length === 0) duzenlemeler = [oranDuzenleme("kural_sabit")];
      } else {
        oran = this.bransOraniStandart(kalemKodu, brans, referans, ay);
        if (referans === ORAN_REFERANS_VARSAYILAN || referans === "excel_gt") {
          duzenlemeler = duzenlemelerFromEtkinDetay(
            this.etkinOranHesapla(kalemKodu, brans, ay),
          );
        } else {
          duzenlemeler = [oranDuzenleme("standart")];
        }
        if (this.v2Metodoloji && this.v2GrupFallbackGerekli(kalemKodu, brans, ay)) {
          const grupAd = bransGrubu(brans);
          const hasarMod =
            V2_HASAR_BLOK_KALEMLER.has(kalemKodu) && this.hasarBlokGrupModu(brans, ay);
          oran = this.grupOraniStandart(
            kalemKodu,
            tarifeGrupUyeleri(brans),
            referans,
            ay,
          );
          duzenlemeler.push(grupFallbackDuzenlemesi(grupAd, hasarMod));
        }
      }
    }

    if (this.v2Metodoloji) {
      this.duzenlemeCache.set(cacheKey, birlestirDuzenlemeler(duzenlemeler));
    }
    this.oranCache.set(cacheKey, oran);
    return oran;
  }

  /** Mizan ağırlıklı ortalama (V2 öncesi standart). */
  private bransOraniStandart(
    kalemKodu: string,
    brans: string,
    referans: string,
    ay: number,
  ): number {
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
    if (ay === 12) {
      if (!this.yillar.includes(yil)) return null;
    } else if (!this.ayIndex.has(`${yil}|${ay}`)) {
      return null;
    }
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
