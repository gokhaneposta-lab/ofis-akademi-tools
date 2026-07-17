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

/** V1 listesine proxy/mali gelir için gerekli satırlar eklenir. */
export const V2_GT_GOSTERIM: GtGosterimSatir[] = [
  { satir: 11, ad: "Brüt yazılan prim", seviye: 0, kalin: true },
  { satir: 19, ad: "Reasüransa devredilen prim (-)", seviye: 1 },
  { satir: 21, ad: "Kazanılmamış prim karş. değişim", seviye: 1 },
  { satir: 31, ad: "Devam eden riskler karş.", seviye: 1, disGirdi: true },
  { satir: 38, ad: "Teknik olmayan yatırım gelirleri (V2 proxy)", seviye: 1, kalin: true },
  { satir: 86, ad: "Rücu ve sovtaj gelirleri (+)", seviye: 1 },
  { satir: 9, ad: "HAYAT DIŞI TEKNİK GELİR", seviye: 0, kalin: true },
  { satir: 96, ad: "Brüt ödenen hasar (-)", seviye: 1 },
  { satir: 105, ad: "Ödenen hasarda reasürör payı (+)", seviye: 1 },
  { satir: 95, ad: "Ödenen hasarlar (net)", seviye: 1, kalin: true },
  { satir: 114, ad: "Muallak hasar karş. değişim", seviye: 1 },
  { satir: 177, ad: "Üretim komisyon gideri (-)", seviye: 2 },
  { satir: 190, ad: "Personel giderleri (-)", seviye: 2 },
  { satir: 191, ad: "Yönetim giderleri (-)", seviye: 2 },
  { satir: 192, ad: "AR-GE giderleri (-)", seviye: 2 },
  { satir: 193, ad: "Pazarlama giderleri (-)", seviye: 2 },
  { satir: 194, ad: "Dış hizmet giderleri (-)", seviye: 2 },
  { satir: 196, ad: "Alınan reasürans komisyonları (+)", seviye: 2 },
  { satir: 176, ad: "Faaliyet giderleri", seviye: 1 },
  { satir: 202, ad: "Matematik karş. değişim", seviye: 1, disGirdi: true },
  { satir: 94, ad: "HAYAT DIŞI TEKNİK GİDER", seviye: 0, kalin: true },
  { satir: 8, ad: "TEKNİK KÂR / ZARAR", seviye: 0, kalin: true, vurgu: true },
];

export type V2GelirTablosuSonuc = {
  gt: GelirTablosuSonuc;
  proxy: V2MaliGelirProxySonuc;
  primHedefleri: Record<string, number>;
  endirektPrim: Record<string, number>;
  referansEtiket: string;
  giderArtisOrani: number;
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

  const refYil =
    opts.mizanAylik.reduce((m, r) => Math.max(m, r.yil), 0) || butceYili - 1;
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
    butceYili,
    giderArtisOrani: opts.varsayimlar.giderArtisOrani,
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
  });

  const acilis = resolveAcilisBanka({
    butceYili,
    bilancoAylik: opts.bilancoAylik,
    mizan: opts.mizan,
  });

  const proxy = buildMaliGelirProxy({
    aylikToplam: gtPass1.aylikToplam,
    aylikGetiriOrani: opts.varsayimlar.aylikGetiriOrani,
    acilisBanka: acilis.tutar,
    acilisKaynak: acilis.kaynak,
  });
  uyarilar.push(...proxy.uyarilar);

  const brutToplam = gtPass1.brutPrimToplam || 1;
  const disHucrelerByBrans: Record<string, Record<number, number>> = {};
  for (const b of gtPass1.branslar) {
    disHucrelerByBrans[b.bransKodu] = {
      38: proxy.maliGelirYillik * (b.brutPrim / brutToplam),
    };
  }

  const gt = buildGelirTablosu({
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
  });

  return {
    gt,
    proxy,
    primHedefleri,
    endirektPrim,
    referansEtiket,
    giderArtisOrani: opts.varsayimlar.giderArtisOrani,
    uyarilar: [...new Set(uyarilar)],
  };
}
