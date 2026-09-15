/**
 * V3 EYE — H2 genel gider import (61402–61406).
 * YTD mizan overlay sonrası anchor+1..12 ayları import ile yazar; F368 branş dağılımı korunur.
 */
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import {
  buildFaaliyetGiderSonuc,
  FAALIYET_GT_SATIRLARI,
} from "../gelir/faaliyetGiderGt";
import { HAZINE_BRANS_SIRASI } from "../config/brans";
import type {
  FaaliyetGiderRow,
  MizanAylikRow,
  MizanRow,
  OranAyarStore,
} from "../types";
import { buildGenelGiderImportOzet, type GenelGiderImportOzet } from "./genelGiderSummary";

const FORECAST_GT_SATIRLARI = new Set(FAALIYET_GT_SATIRLARI);

export type GenelGiderImportLayerSonuc = {
  uygulandi: boolean;
  anchorAy: number;
  tahminBaslangicAy: number;
  importSatirSayisi: number;
  tahminAySayisi: number;
  ozet: GenelGiderImportOzet | null;
  uyarilar: string[];
};

export function filterGenelGiderForecastRows(
  rows: FaaliyetGiderRow[],
  butceYili: number,
  anchorAy: number,
): FaaliyetGiderRow[] {
  const anchor = Math.min(Math.max(anchorAy, 1), 11);
  return rows.filter(
    (r) => r.butceYili === butceYili && r.ay > anchor,
  );
}

/**
 * YTD (1..anchor) dokunulmaz; yalnız anchor+1..12 import satırları GT F190–194'e yazılır.
 */
export function uygulaGenelGiderImportLayer(
  gt: GelirTablosuSonuc,
  opts: {
    butceYili: number;
    anchorAy: number;
    importRows: FaaliyetGiderRow[];
    mizan: MizanRow[];
    oranAyar?: OranAyarStore;
    mizanAylikFull?: MizanAylikRow[];
  },
): GenelGiderImportLayerSonuc {
  const uyarilar: string[] = [];
  const anchor = Math.min(Math.max(opts.anchorAy, 1), 11);
  const tahminBaslangicAy = anchor + 1;
  const forecastRows = filterGenelGiderForecastRows(
    opts.importRows,
    opts.butceYili,
    anchor,
  );

  if (forecastRows.length === 0) {
    return {
      uygulandi: false,
      anchorAy: anchor,
      tahminBaslangicAy,
      importSatirSayisi: 0,
      tahminAySayisi: 0,
      ozet: opts.importRows.length
        ? buildGenelGiderImportOzet(opts.importRows, opts.butceYili)
        : null,
      uyarilar: ["Genel gider import yok veya H2 (anchor sonrası) satırı boş — motor bütçesi kullanıldı."],
    };
  }

  const aktifBrans = HAZINE_BRANS_SIRASI.filter(
    (k) => gt.branslar.some((b) => b.bransKodu === k),
  );
  if (aktifBrans.length === 0) {
    aktifBrans.push(...gt.branslar.map((b) => b.bransKodu));
  }

  const fgSonuc = buildFaaliyetGiderSonuc({
    butceYili: opts.butceYili,
    rows: forecastRows,
    mizan: opts.mizan,
    oranAyar: opts.oranAyar,
    aktifBransKodlari: aktifBrans,
    mizanAylikFull: opts.mizanAylikFull,
    v2Metodoloji: true,
  });

  if (!fgSonuc || fgSonuc.length === 0) {
    uyarilar.push("Genel gider import — F368 branş dağılımı üretilemedi.");
    return {
      uygulandi: false,
      anchorAy: anchor,
      tahminBaslangicAy,
      importSatirSayisi: forecastRows.length,
      tahminAySayisi: 0,
      ozet: buildGenelGiderImportOzet(opts.importRows, opts.butceYili),
      uyarilar,
    };
  }

  const tahminBaslangicIdx = anchor;
  for (const b of fgSonuc) {
    const ab = gt.aylikBrans[b.bransKodu] ?? {};
    for (const satir of FORECAST_GT_SATIRLARI) {
      const ser = b.gtAylik[satir];
      if (!ser) continue;
      const mevcut = [...(ab[satir] ?? Array(12).fill(0))];
      for (let i = tahminBaslangicIdx; i < 12; i++) {
        mevcut[i] = ser[i] ?? 0;
      }
      ab[satir] = mevcut;
    }
    gt.aylikBrans[b.bransKodu] = ab;

    let gtBrans = gt.branslar.find((br) => br.bransKodu === b.bransKodu);
    if (!gtBrans) {
      gtBrans = { bransKodu: b.bransKodu, bransAdi: b.bransKodu, brutPrim: 0, degerler: {} };
      gt.branslar.push(gtBrans);
    }
    for (const satir of FORECAST_GT_SATIRLARI) {
      const ser = ab[satir] ?? Array(12).fill(0);
      gtBrans.degerler[satir] = ser.reduce((a, x) => a + x, 0);
    }
  }

  for (const satir of FORECAST_GT_SATIRLARI) {
    const sirketSer = [...(gt.aylikToplam[satir] ?? Array(12).fill(0))];
    for (let i = tahminBaslangicIdx; i < 12; i++) {
      let t = 0;
      for (const br of gt.branslar) {
        t += gt.aylikBrans[br.bransKodu]?.[satir]?.[i] ?? 0;
      }
      sirketSer[i] = t;
    }
    gt.aylikToplam[satir] = sirketSer;
    gt.toplam[satir] = sirketSer.reduce((a, x) => a + x, 0);
  }

  const tahminAySayisi = 12 - tahminBaslangicIdx;
  const ozet = buildGenelGiderImportOzet(opts.importRows, opts.butceYili);
  uyarilar.push(
    `Genel gider import H2: ${tahminBaslangicAy}–12. ay, ${forecastRows.length} satır ` +
      `(${new Set(forecastRows.map((r) => r.altHesapKodu)).size} alt hesap) → F190–194, F368 branş payı.`,
  );

  return {
    uygulandi: true,
    anchorAy: anchor,
    tahminBaslangicAy,
    importSatirSayisi: forecastRows.length,
    tahminAySayisi,
    ozet,
    uyarilar,
  };
}
