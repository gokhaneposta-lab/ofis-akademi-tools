import { HAZINE_BRANS_KODLARI, HAZINE_BRANS_SIRASI } from "../config/brans";
import type { MizanRow } from "../types";
import { MizanOranServisi } from "./mizanOranlar";

export type HasarBacktestSatir = {
  bransKodu: string;
  bransAdi: string;
  anaBrans: string;
  modelOran: number;
  gercekOran: number | null;
  baz: number;
  gercekHasar: number;
  modelHasar: number;
  /** (model − gerçek) / |gerçek| ; gerçek 0 ise null */
  sapmaYuzde: number | null;
};

export type HasarBacktestSonuc = {
  kalemKodu: string;
  testYili: number;
  modelYillari: number[];
  satirlar: HasarBacktestSatir[];
  ozet: {
    bransSayisi: number;
    bazToplam: number;
    gercekHasarToplam: number;
    modelHasarToplam: number;
    sapmaYuzde: number | null;
  };
  uyari: string | null;
};

/**
 * Hafif backtest: test yılından önceki MIZAN yıllarıyla üretilen 0211 oranını
 * test yılı gerçekleşen hasar bazına uygulayıp sapmayı ölçer.
 */
export function buildHasarBacktest(
  mizan: MizanRow[],
  testYili: number,
  kalemKodu = "0211",
): HasarBacktestSonuc {
  // Model: yalnızca testYili'ndan önceki yıllar
  const modelServis = new MizanOranServisi(mizan, testYili);
  // Gerçekleşen: test yılı dahil
  const gercekServis = new MizanOranServisi(mizan, testYili + 1);

  if (modelServis.yillar.length === 0) {
    return {
      kalemKodu,
      testYili,
      modelYillari: [],
      satirlar: [],
      ozet: {
        bransSayisi: 0,
        bazToplam: 0,
        gercekHasarToplam: 0,
        modelHasarToplam: 0,
        sapmaYuzde: null,
      },
      uyari: `${testYili} öncesi MIZAN yılı yok — backtest yapılamaz.`,
    };
  }

  if (!gercekServis.yillar.includes(testYili)) {
    return {
      kalemKodu,
      testYili,
      modelYillari: modelServis.yillar,
      satirlar: [],
      ozet: {
        bransSayisi: 0,
        bazToplam: 0,
        gercekHasarToplam: 0,
        modelHasarToplam: 0,
        sapmaYuzde: null,
      },
      uyari: `${testYili} MIZAN verisi yok — gerçekleşen hasar ölçülemiyor.`,
    };
  }

  const satirlar: HasarBacktestSatir[] = [];
  for (const kod of HAZINE_BRANS_SIRASI) {
    const info = HAZINE_BRANS_KODLARI[kod] ?? ["", kod, ""];
    const olcum = gercekServis.yilOlcum(kalemKodu, kod, testYili);
    if (!olcum || Math.abs(olcum.baz) < 1) continue;

    const modelOran = modelServis.bransOrani(kalemKodu, kod, "excel_gt");
    const modelHasar = modelOran * olcum.baz;
    const gercekHasar = olcum.pay;
    const sapmaYuzde =
      Math.abs(gercekHasar) >= 1 ? (modelHasar - gercekHasar) / Math.abs(gercekHasar) : null;

    satirlar.push({
      bransKodu: kod,
      bransAdi: info[1],
      anaBrans: info[2],
      modelOran: Math.round(modelOran * 1e6) / 1e6,
      gercekOran: olcum.oran == null ? null : Math.round(olcum.oran * 1e6) / 1e6,
      baz: olcum.baz,
      gercekHasar,
      modelHasar,
      sapmaYuzde,
    });
  }

  const bazToplam = satirlar.reduce((a, s) => a + s.baz, 0);
  const gercekHasarToplam = satirlar.reduce((a, s) => a + s.gercekHasar, 0);
  const modelHasarToplam = satirlar.reduce((a, s) => a + s.modelHasar, 0);
  const sapmaYuzde =
    Math.abs(gercekHasarToplam) >= 1
      ? (modelHasarToplam - gercekHasarToplam) / Math.abs(gercekHasarToplam)
      : null;

  return {
    kalemKodu,
    testYili,
    modelYillari: modelServis.yillar,
    satirlar,
    ozet: {
      bransSayisi: satirlar.length,
      bazToplam,
      gercekHasarToplam,
      modelHasarToplam,
      sapmaYuzde,
    },
    uyari: satirlar.length === 0 ? `${testYili} için yeterli branş baz tutarı yok.` : null,
  };
}
