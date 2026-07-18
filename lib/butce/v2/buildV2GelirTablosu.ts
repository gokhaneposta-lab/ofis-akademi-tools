import type { GtGosterimSatir, GelirTablosuSonuc } from "../gelir/gelirTablosu";
import { buildGelirTablosu } from "../gelir/gelirTablosu";
import { DagitimMotoru } from "../prim/dagitimMotoru";
import { aylikOranlariFromMizan } from "../prim/mizanAylikOranlari";
import {
  createAylikDagilimTablosu,
  varsayilanAylikDagilim,
} from "../prim/primDagilim";
import type {
  AylikPrimStore,
  BilancoAylikRow,
  KpkKapanisTahminStore,
  KpkVadeRow,
  MizanAylikRow,
  MizanRow,
  OranAyarStore,
  SatisButceRow,
  TarifeBransPayRow,
  TarifeMapRow,
  UretimRow,
} from "../types";
import { buildFaaliyetGiderFromMizanArtis } from "./faaliyetGiderFromMizanArtis";
import { buildMaliGelirProxy, resolveAcilisBanka } from "./maliGelirProxy";
import type { V2MaliGelirProxySonuc, V2VarsayimlarStore } from "./types";

const V2_SENTETIK = {
  teknikGelirSafi: 9001,
  teknikGiderSafi: 9002,
  safiTkz: 9003,
  genelGiderler: 9004,
  tkz: 9005,
  teknikFaaliyetGideri: 9006,
} as const;

const GENEL_GIDER_SATIRLARI = [190, 191, 192, 193, 194] as const;

type V2Formul = Array<{ satir: number; carpan: number }>;

const V2_SENTETIK_FORMULLER: Array<[number, V2Formul]> = [
  [V2_SENTETIK.teknikGelirSafi, [{ satir: 9, carpan: 1 }, { satir: 38, carpan: -1 }]],
  [
    V2_SENTETIK.teknikFaaliyetGideri,
    [{ satir: 176, carpan: 1 }, ...GENEL_GIDER_SATIRLARI.map((satir) => ({ satir, carpan: -1 }))],
  ],
  [
    V2_SENTETIK.teknikGiderSafi,
    [{ satir: 94, carpan: 1 }, ...GENEL_GIDER_SATIRLARI.map((satir) => ({ satir, carpan: -1 }))],
  ],
  [
    V2_SENTETIK.safiTkz,
    [
      { satir: V2_SENTETIK.teknikGelirSafi, carpan: 1 },
      { satir: V2_SENTETIK.teknikGiderSafi, carpan: 1 },
    ],
  ],
  [
    V2_SENTETIK.genelGiderler,
    GENEL_GIDER_SATIRLARI.map((satir) => ({ satir, carpan: 1 })),
  ],
  [
    V2_SENTETIK.tkz,
    [
      { satir: V2_SENTETIK.safiTkz, carpan: 1 },
      { satir: 38, carpan: 1 },
      { satir: V2_SENTETIK.genelGiderler, carpan: 1 },
    ],
  ],
];

function hesaplaV2SentetikSatirlar(gt: GelirTablosuSonuc): GelirTablosuSonuc {
  const hesapla = (degerler: Record<number, number>, formul: V2Formul) =>
    formul.reduce((toplam, b) => toplam + (degerler[b.satir] ?? 0) * b.carpan, 0);
  const hesaplaAylik = (degerler: Record<number, number[]>, formul: V2Formul) =>
    Array.from({ length: 12 }, (_, ay) =>
      formul.reduce((toplam, b) => toplam + (degerler[b.satir]?.[ay] ?? 0) * b.carpan, 0),
    );

  for (const [hedef, formul] of V2_SENTETIK_FORMULLER) {
    gt.toplam[hedef] = hesapla(gt.toplam, formul);
    gt.aylikToplam[hedef] = hesaplaAylik(gt.aylikToplam, formul);
    for (const brans of gt.branslar) {
      brans.degerler[hedef] = hesapla(brans.degerler, formul);
      const aylik = gt.aylikBrans[brans.bransKodu];
      if (aylik) aylik[hedef] = hesaplaAylik(aylik, formul);
    }
  }
  return gt;
}

/** V2 özeti: 61402–06 ve teknik olmayan yatırım geliri Safi TKZ'nin altında gösterilir. */
export const V2_GT_GOSTERIM: GtGosterimSatir[] = [
  { satir: 9, ad: "HAYAT DIŞI TEKNİK GELİR", seviye: 0, gizli: true },
  { satir: 94, ad: "HAYAT DIŞI TEKNİK GİDER", seviye: 0, gizli: true },
  { satir: 176, ad: "FAALİYET GİDERLERİ", seviye: 0, gizli: true },
  { satir: V2_SENTETIK.teknikGelirSafi, kod: "", ad: "TEKNİK GELİR", seviye: 0, kalin: true },
  { satir: 11, ad: "Brüt yazılan prim", seviye: 1, kalin: true },
  { satir: 19, ad: "Reasüransa devredilen prim (-)", seviye: 1 },
  { satir: 21, ad: "Kazanılmamış prim karş. değişim", seviye: 1 },
  { satir: 22, ad: "Brüt KPK değişimi", seviye: 2, kalin: true },
  { satir: 23, ad: "Cari brüt KPK hareketi", seviye: 2 },
  { satir: 24, ad: "Devreden brüt KPK hareketi", seviye: 2 },
  { satir: 25, ad: "KPK reasürör payı değişimi", seviye: 2, kalin: true },
  { satir: 26, ad: "Cari KPK reasürör payı hareketi", seviye: 2 },
  { satir: 27, ad: "Devreden KPK reasürör payı hareketi", seviye: 2 },
  { satir: 28, ad: "KPK SGK payı değişimi", seviye: 2, kalin: true },
  { satir: 29, ad: "Cari KPK SGK payı hareketi", seviye: 2 },
  { satir: 30, ad: "Devreden KPK SGK payı hareketi", seviye: 2 },
  { satir: 31, ad: "Devam eden riskler karş.", seviye: 1, disGirdi: true },
  { satir: 86, ad: "Rücu ve sovtaj gelirleri (+)", seviye: 1 },
  { satir: V2_SENTETIK.teknikGiderSafi, kod: "", ad: "TEKNİK GİDER", seviye: 0, kalin: true },
  { satir: 96, ad: "Brüt ödenen hasar (-)", seviye: 1 },
  { satir: 105, ad: "Ödenen hasarda reasürör payı (+)", seviye: 1 },
  { satir: 95, ad: "Ödenen hasarlar (net)", seviye: 1, kalin: true },
  { satir: 114, ad: "Muallak hasar karş. değişim", seviye: 1 },
  { satir: 177, ad: "Üretim komisyon gideri (-)", seviye: 2 },
  { satir: 196, ad: "Alınan reasürans komisyonları (+)", seviye: 2 },
  { satir: 200, ad: "Diğer faaliyet giderleri (-)", seviye: 2 },
  { satir: 201, ad: "Diğer faaliyet giderleri 2 (-)", seviye: 2 },
  { satir: V2_SENTETIK.teknikFaaliyetGideri, kod: "", ad: "Teknik faaliyet giderleri", seviye: 1 },
  { satir: 202, ad: "Matematik karş. değişim", seviye: 1, disGirdi: true },
  { satir: V2_SENTETIK.safiTkz, kod: "", ad: "SAFİ TKZ", seviye: 0, kalin: true, vurgu: true },
  { satir: 38, ad: "Teknik olmayan yatırım gelirleri (V2 proxy)", seviye: 0, kalin: true },
  { satir: V2_SENTETIK.genelGiderler, kod: "", ad: "Genel giderler (61402–06)", seviye: 0, kalin: true },
  { satir: 190, ad: "Personel giderleri (-)", seviye: 1 },
  { satir: 191, ad: "Yönetim giderleri (-)", seviye: 1 },
  { satir: 192, ad: "AR-GE giderleri (-)", seviye: 1 },
  { satir: 193, ad: "Pazarlama giderleri (-)", seviye: 1 },
  { satir: 194, ad: "Dış hizmet giderleri (-)", seviye: 1 },
  { satir: V2_SENTETIK.tkz, kod: "", ad: "TKZ", seviye: 0, kalin: true, vurgu: true },
];

export type V2GelirTablosuSonuc = {
  gt: GelirTablosuSonuc;
  proxy: V2MaliGelirProxySonuc;
  primHedefleri: Record<string, number>;
  endirektPrim: Record<string, number>;
  referansEtiket: string;
  giderArtisOrani: number;
  faaliyetGiderOncekiYil: number;
  faaliyetGiderBazSatirlari: Array<{
    hesap: string;
    ad: string;
    oncekiYilTutari: number;
    kaynakAy: number | null;
  }>;
  faaliyetGiderButce: Record<string, number>;
  uyarilar: string[];
};

export function buildV2GelirTablosu(opts: {
  varsayimlar: V2VarsayimlarStore;
  satisRows: SatisButceRow[];
  uretim: UretimRow[];
  tarifeMap: TarifeMapRow[];
  tarifeBransPay: TarifeBransPayRow[];
  mizan: MizanRow[];
  mizanAylik: MizanAylikRow[];
  mizanAylikFull?: MizanAylikRow[];
  bilancoAylik: BilancoAylikRow[];
  oranAyar: OranAyarStore;
  kpkVade: KpkVadeRow[];
  kapanisTahmin: KpkKapanisTahminStore | null;
}): V2GelirTablosuSonuc {
  const uyarilar: string[] = [];
  const butceYili = opts.varsayimlar.butceYili;
  const referansEtiket =
    opts.varsayimlar.referansEtiket ?? "Son 2 Yıl Ortalaması (2024-2025)";

  const motor = new DagitimMotoru(
    opts.uretim,
    opts.tarifeMap,
    opts.mizan,
    opts.tarifeBransPay,
  );
  const dagitim = motor.dagit({
    satisRows: opts.satisRows,
    referansEtiket,
    mizanYedek: true,
    tarifeHedefleri: opts.varsayimlar.tarifeHedefleri,
    yilAgirliklari: opts.varsayimlar.yilAgirliklari,
  });

  const primHedefleri: Record<string, number> = {};
  for (const b of dagitim.bransOzet) primHedefleri[b.bransKodu] = b.hedefPrim;
  const endirektPrim: Record<string, number> = {};
  for (const b of dagitim.bransDirektEndirekt) endirektPrim[b.bransKodu] = b.endirektPrim;

  if (dagitim.ozet.dagitilan <= 0) {
    uyarilar.push("Prim dağıtımı 0 — tarife hedefleri veya pay tablosunu kontrol edin.");
  }

  const uygunRefYillar = [...new Set(opts.mizanAylik.map((r) => r.yil))]
    .filter((yil) => yil <= butceYili - 1);
  const refYil = uygunRefYillar.length > 0 ? Math.max(...uygunRefYillar) : butceYili - 1;
  const oranSonuc = aylikOranlariFromMizan(opts.mizanAylik, [refYil]);
  const genelOranlar =
    oranSonuc.genelOranlar.some((x) => x > 0) ? oranSonuc.genelOranlar : varsayilanAylikDagilim();
  const aylikSatirlar = createAylikDagilimTablosu(
    primHedefleri,
    oranSonuc.bransOranlari,
    genelOranlar,
  );
  const aylikPrim: AylikPrimStore = {
    butceYili,
    referansYil: refYil,
    kaynak: oranSonuc.kaynak,
    genelOranlar,
    satirlar: aylikSatirlar,
    guncellemeIso: new Date().toISOString(),
  };

  const fg = buildFaaliyetGiderFromMizanArtis({
    mizan: opts.mizan,
    mizanAylikFull: opts.mizanAylikFull,
    butceYili,
    giderArtisOrani: opts.varsayimlar.giderArtisOrani,
    faaliyetGiderButce: opts.varsayimlar.faaliyetGiderButce,
  });
  uyarilar.push(...fg.uyarilar);

  const gtPass1 = buildGelirTablosu({
    mizan: opts.mizan,
    butceYili,
    primHedefleri,
    endirektPrim,
    aylikPrim,
    oranAyar: opts.oranAyar,
    mizanAylik: opts.mizanAylik,
    tarifeBransPay: opts.tarifeBransPay,
    kpkVade: opts.kpkVade,
    kapanisTahmin: opts.kapanisTahmin,
    faaliyetGider: fg.rows,
    gosterimSatirlari: V2_GT_GOSTERIM,
    mizanAylikFull: opts.mizanAylikFull,
  });

  const acilis = resolveAcilisBanka({
    butceYili,
    bilancoAylik: opts.bilancoAylik,
    mizan: opts.mizan,
  });
  if (acilis.uyari) uyarilar.push(acilis.uyari);

  const proxy = buildMaliGelirProxy({
    aylikToplam: gtPass1.aylikToplam,
    aylikGetiriOrani: opts.varsayimlar.aylikGetiriOrani,
    acilisBanka: acilis.tutar,
    acilisKaynak: acilis.kaynak,
    acilisKaynakYil: acilis.kaynakYil,
    acilisKaynakAy: acilis.kaynakAy,
    acilisKaynakEtiket: acilis.kaynakEtiket,
  });
  uyarilar.push(...proxy.uyarilar);

  const brutToplam = gtPass1.brutPrimToplam || 1;
  const disHucrelerByBrans: Record<string, Record<number, number>> = {};
  for (const b of gtPass1.branslar) {
    disHucrelerByBrans[b.bransKodu] = {
      38: proxy.maliGelirYillik * (b.brutPrim / brutToplam),
    };
  }

  const gt = hesaplaV2SentetikSatirlar(buildGelirTablosu({
    mizan: opts.mizan,
    butceYili,
    primHedefleri,
    endirektPrim,
    aylikPrim,
    oranAyar: opts.oranAyar,
    mizanAylik: opts.mizanAylik,
    tarifeBransPay: opts.tarifeBransPay,
    kpkVade: opts.kpkVade,
    kapanisTahmin: opts.kapanisTahmin,
    faaliyetGider: fg.rows,
    gosterimSatirlari: V2_GT_GOSTERIM,
    disHucrelerByBrans,
    aylikSatirOverride: { 38: proxy.maliGelirAylik },
    mizanAylikFull: opts.mizanAylikFull,
  }));

  return {
    gt,
    proxy,
    primHedefleri,
    endirektPrim,
    referansEtiket,
    giderArtisOrani: opts.varsayimlar.giderArtisOrani,
    faaliyetGiderOncekiYil: fg.oncekiYil,
    faaliyetGiderBazSatirlari: fg.bazSatirlar,
    faaliyetGiderButce: fg.uygulananButce,
    uyarilar: [...new Set(uyarilar)],
  };
}
