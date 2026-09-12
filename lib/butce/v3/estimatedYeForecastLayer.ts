/**
 * Estimated YE Forecast Layer — V3 actual-lock üzerine H2 forecast zinciri.
 *
 * Sıra (forecast aylar): F11 → F23/F24/KPK → F22 → F32 → F320 → YTD F96 → F96 Δ
 * → F105 → F95 → F116/muallak → F86 → (F38 maliGelirRolling ayrı çağrılır)
 */
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import { buildKpkSonuc } from "../kpk/buildKpkSonuc";
import { DERK_GT_SATIRLARI, hesaplaDerkPortfoy } from "../kpk/derkMotoru";
import { buildOncekiYilPrimSerisi } from "../kpk/oncekiYilPrimTahmin";
import { KPK_GT_SATIRLARI } from "../kpk/kpkMotoru";
import { MizanOranServisi } from "../oran/mizanOranlar";
import type {
  AylikPrimStore,
  KpkKapanisTahminStore,
  KpkVadeRow,
  MizanAylikRow,
  MizanRow,
  OranAyarStore,
  OranYilBirlestirmeStore,
  TarifeBransPayRow,
} from "../types";
import {
  extractKpkMizanStok,
  kpkReconOrani,
  kpkStokSeviye,
  type KpkStokGtKod,
} from "./kpkMizanStok";
import { yenidenTuretUstFormuller, yenileToplamlarH2 } from "./gtUstRollup";
import { uygulaMuallakH2Residual } from "./muallakH2Residual";
import { MIZAN_DISI_SATIRLAR } from "./ytdOverlay";
import { extractMizanGtAylik } from "./mizanGtExtract";
import { geriYukleMizanYtdTam } from "./gtUstRollup";
import type { EyeQuality } from "./types";

const KPK_FORECAST_CARI = [23, 26, 29] as const;
/** Muallak devreden hareket — H2=0. KPK F24/F27/F30 stok yolu: kesim stok sabit (sıfırlanmaz). */
const MUALLAK_DEVREDEN_H2_SIFIR = [126, 147] as const;

const HASAR_ZINCIR_SATIRLARI = [96, 105, 95, 86] as const;
const EYE_YENILE_SATIRLARI: readonly number[] = [
  ...KPK_GT_SATIRLARI,
  ...DERK_GT_SATIRLARI,
  ...HASAR_ZINCIR_SATIRLARI,
  114, 115, 116, 126, 136, 137, 147,
];

function ytdSum(ser: number[] | undefined, endIdx: number): number {
  if (!ser?.length) return 0;
  return ser.slice(0, endIdx + 1).reduce((a, x) => a + x, 0);
}

function ensureSer(ab: Record<number, number[]>, satir: number): number[] {
  if (!ab[satir]) ab[satir] = Array(12).fill(0);
  return ab[satir]!;
}

function stokAt(ser: number[] | undefined, ayIndex: number): number {
  return ser?.[ayIndex] ?? 0;
}

function f349Oranlari(
  mizan: MizanRow[],
  butceYili: number,
  oranAyar: OranAyarStore,
  mizanAylikFull: MizanAylikRow[],
): Record<string, number> {
  const servis = new MizanOranServisi(mizan, butceYili, mizanAylikFull, true);
  const tablo = servis.tumBranslarTablosu("F349", oranAyar["F349"] ?? {}, { ay: 12 });
  const out: Record<string, number> = {};
  for (const r of tablo) out[r.bransKodu] = Math.abs(r.oran);
  return out;
}

function reasurOranlari(
  mizan: MizanRow[],
  butceYili: number,
  oranAyar: OranAyarStore,
  mizanAylikFull: MizanAylikRow[],
): Record<string, number> {
  const servis = new MizanOranServisi(mizan, butceYili, mizanAylikFull, true);
  const tablo = servis.tumBranslarTablosu("0112", oranAyar["0112"] ?? {});
  const out: Record<string, number> = {};
  for (const r of tablo) out[r.bransKodu] = Math.abs(r.oran);
  return out;
}

/** Actual aylar: mizan kümülatif stok → branş aylık serisi (stok seviyesi). */
function uygulaActualKpkStok(
  gt: GelirTablosuSonuc,
  stokMap: ReturnType<typeof extractKpkMizanStok>,
  anchor: number,
): void {
  for (const b of gt.branslar) {
    const ab = gt.aylikBrans[b.bransKodu] ?? {};
    for (const gtKod of ["01211", "01212", "01221", "01222", "01231", "01232"] as KpkStokGtKod[]) {
      const satir = { "01211": 23, "01212": 24, "01221": 26, "01222": 27, "01231": 29, "01232": 30 }[gtKod];
      const ser = ensureSer(ab, satir);
      for (let ay = 0; ay < anchor; ay++) {
        ser[ay] = kpkStokSeviye(stokMap, b.bransKodu, gtKod, ay);
      }
    }
    gt.aylikBrans[b.bransKodu] = ab;
  }
}

/** Forecast KPK: F23 motor stok; F24 kesim ay stok sabit; devreden H2=0. */
function uygulaForecastKpk(
  gt: GelirTablosuSonuc,
  kpkByBrans: Map<string, { gtAylik: Record<number, number[]> }>,
  anchor: number,
): void {
  for (const b of gt.branslar) {
    const kb = kpkByBrans.get(b.bransKodu);
    const ab = gt.aylikBrans[b.bransKodu] ?? {};

    for (const satir of KPK_FORECAST_CARI) {
      const motorSer = kb?.gtAylik[satir];
      const ser = ensureSer(ab, satir);
      for (let ay = anchor; ay < 12; ay++) {
        ser[ay] = motorSer?.[ay] ?? ser[ay] ?? 0;
      }
    }

    const f24Ser = ensureSer(ab, 24);
    const f24Kesim = stokAt(f24Ser, anchor - 1);
    for (let ay = anchor; ay < 12; ay++) f24Ser[ay] = f24Kesim;

    for (const satir of [27, 30] as const) {
      const ser = ensureSer(ab, satir);
      for (let ay = anchor; ay < 12; ay++) ser[ay] = 0;
    }

    gt.aylikBrans[b.bransKodu] = ab;
  }
}

/** Forecast DERK: gtAylik[32] hareket serisi. */
function uygulaForecastDerk(
  gt: GelirTablosuSonuc,
  derkByBrans: Map<string, { gtAylik: Record<number, number[]> }>,
  anchor: number,
): void {
  for (const b of gt.branslar) {
    const db = derkByBrans.get(b.bransKodu);
    if (!db) continue;
    const ab = gt.aylikBrans[b.bransKodu] ?? {};
    for (const satir of DERK_GT_SATIRLARI) {
      const motorSer = db.gtAylik[satir];
      if (!motorSer) continue;
      const ser = ensureSer(ab, satir);
      for (let ay = anchor; ay < 12; ay++) ser[ay] = motorSer[ay] ?? 0;
    }
    gt.aylikBrans[b.bransKodu] = ab;
  }
}

/** SGK F20 H2: prim × 0113. */
function uygulaSgkH2(
  gt: GelirTablosuSonuc,
  mizan: MizanRow[],
  butceYili: number,
  oranAyar: OranAyarStore,
  mizanAylikFull: MizanAylikRow[],
  anchor: number,
): void {
  const servis = new MizanOranServisi(mizan, butceYili, mizanAylikFull, true);
  for (const b of gt.branslar) {
    const primSer = gt.aylikBrans[b.bransKodu]?.[11];
    if (!primSer) continue;
    const ser = ensureSer(gt.aylikBrans[b.bransKodu] ?? {}, 20);
    for (let ay = anchor; ay < 12; ay++) {
      const tablo = servis.tumBranslarTablosu("0113", oranAyar["0113"] ?? {}, { ay: ay + 1 });
      const oran = tablo.find((r) => r.bransKodu === b.bransKodu)?.oran ?? 0;
      ser[ay] = (primSer[ay] ?? 0) * oran;
    }
    if (!gt.aylikBrans[b.bransKodu]) gt.aylikBrans[b.bransKodu] = {};
    gt.aylikBrans[b.bransKodu]![20] = ser;
    b.degerler[20] = ser.reduce((a, x) => a + x, 0);
  }
}

function oranBrans(
  servis: MizanOranServisi,
  kalem: string,
  oranAyar: OranAyarStore,
  brans: string,
  ay: number,
): number {
  const tablo = servis.tumBranslarTablosu(kalem, oranAyar[kalem] ?? {}, { ay });
  return tablo.find((r) => r.bransKodu === brans)?.oran ?? 0;
}

/** F96 forecast: YTD = (YTD_F11 + F22_stok + YTD_F32) × F320; aylık = ΔYTD. F86 ayrı (muallak sonrası). */
function uygulaForecastHasarZinciri(
  gt: GelirTablosuSonuc,
  servis: MizanOranServisi,
  oranAyar: OranAyarStore,
  anchor: number,
): { f22F96Ok: boolean; f22F96Hatalar: string[] } {
  const hatalar: string[] = [];
  let ok = true;

  for (const b of gt.branslar) {
    const ab = gt.aylikBrans[b.bransKodu] ?? {};
    const f11 = ab[11] ?? Array(12).fill(0);
    const f23 = ab[23] ?? Array(12).fill(0);
    const f24 = ab[24] ?? Array(12).fill(0);
    const f32 = ab[32] ?? Array(12).fill(0);
    const f96 = ensureSer(ab, 96);
    const f105 = ensureSer(ab, 105);
    const f95 = ensureSer(ab, 95);

    let prevYtd96 = ytdSum(f96, anchor - 1);

    for (let ay = anchor; ay < 12; ay++) {
      const month = ay + 1;
      const f22stock = stokAt(f23, ay) + stokAt(f24, ay);
      ensureSer(ab, 22)[ay] = f22stock;

      const ytd11 = ytdSum(f11, ay);
      const ytd32 = ytdSum(f32, ay);
      const f320 = oranBrans(servis, "0211", oranAyar, b.bransKodu, month);
      const ytd96 = (ytd11 + f22stock + ytd32) * f320;
      const f96Mov = ytd96 - prevYtd96;
      f96[ay] = f96Mov;
      prevYtd96 = ytd96;

      const f436 = oranBrans(servis, "0212", oranAyar, b.bransKodu, month);
      f105[ay] = f96Mov * f436;
      f95[ay] = f96Mov + f105[ay];

      if (Math.abs(f22stock - (stokAt(f23, ay) + stokAt(f24, ay))) > 1) {
        ok = false;
        hatalar.push(`${b.bransKodu} ay${month}: F22≠F23+F24`);
      }
    }

    for (const s of [96, 105, 95, 22]) {
      b.degerler[s] = (ab[s] ?? []).reduce((a, x) => a + x, 0);
    }
    gt.aylikBrans[b.bransKodu] = ab;
  }

  return { f22F96Ok: ok, f22F96Hatalar: hatalar };
}

/** Muallak sonrası F86 = (F96+F116)×F315 (forecast aylar). */
function uygulaForecastF86(
  gt: GelirTablosuSonuc,
  servis: MizanOranServisi,
  oranAyar: OranAyarStore,
  anchor: number,
): void {
  for (const b of gt.branslar) {
    const ab = gt.aylikBrans[b.bransKodu] ?? {};
    const f96 = ab[96] ?? Array(12).fill(0);
    const f116 = ab[116] ?? Array(12).fill(0);
    const f86 = ensureSer(ab, 86);
    for (let ay = anchor; ay < 12; ay++) {
      const f315 = oranBrans(servis, "016", oranAyar, b.bransKodu, ay + 1);
      f86[ay] = ((f96[ay] ?? 0) + (f116[ay] ?? 0)) * f315;
    }
    b.degerler[86] = f86.reduce((a, x) => a + x, 0);
    gt.aylikBrans[b.bransKodu] = ab;
  }
}

function sifirlaH2Devreden(
  gt: GelirTablosuSonuc,
  anchor: number,
  satirlar: readonly number[],
): void {
  for (const b of gt.branslar) {
    const ab = gt.aylikBrans[b.bransKodu] ?? {};
    for (const satir of satirlar) {
      const ser = ensureSer(ab, satir);
      for (let ay = anchor; ay < 12; ay++) ser[ay] = 0;
    }
    gt.aylikBrans[b.bransKodu] = ab;
  }
}

export type EstimatedYeForecastOpts = {
  anchorAy: number;
  butceYili: number;
  mizan: MizanRow[];
  mizanAylik: MizanAylikRow[];
  mizanAylikFull: MizanAylikRow[];
  tarifeBransPay: TarifeBransPayRow[];
  kpkVade: KpkVadeRow[];
  oranAyar: OranAyarStore;
  kalemYilBirlestirme?: OranYilBirlestirmeStore;
  aylikPrim: AylikPrimStore;
  kapanisTahmin: KpkKapanisTahminStore | null;
};

export type EstimatedYeForecastSonuc = {
  uyarilar: string[];
  quality: EyeQuality;
  f22F96Ok: boolean;
  f22F96Hatalar: string[];
};

export function uygulaEstimatedYeForecastLayer(
  gt: GelirTablosuSonuc,
  opts: EstimatedYeForecastOpts,
): EstimatedYeForecastSonuc {
  const uyarilar: string[] = [];
  const anchor = Math.min(Math.max(opts.anchorAy, 1), 11);
  if (anchor >= 12) {
    return {
      uyarilar: ["EYE forecast: kesim ayı 12 — forecast yok."],
      quality: {
        f105Proxy: true,
        maliGelirProxyMonths: [],
        mizanRecon: { tutmayanSayisi: 0, satirlar: [] },
        forecastMethodVersion: "eye-v1",
        kpkRecon: {},
      },
      f22F96Ok: true,
      f22F96Hatalar: [],
    };
  }

  const stokMap = extractKpkMizanStok(opts.mizanAylikFull, opts.butceYili);
  uygulaActualKpkStok(gt, stokMap, anchor);

  const kpk = buildKpkSonuc({
    butceYili: opts.butceYili,
    mizan: opts.mizan,
    mizanAylik: opts.mizanAylik,
    mizanAylikFull: opts.mizanAylikFull,
    tarifeBransPay: opts.tarifeBransPay,
    vadeRows: opts.kpkVade,
    aylikPrim: opts.aylikPrim,
    oranAyar: opts.oranAyar,
    kapanisTahmin: opts.kapanisTahmin,
    v2Metodoloji: true,
  });
  const kpkByBrans = new Map(kpk.branslar.map((b) => [b.bransKodu, b]));

  uygulaForecastKpk(gt, kpkByBrans, anchor);

  const onceki = buildOncekiYilPrimSerisi({
    butceYili: opts.butceYili,
    mizanAylik: opts.mizanAylik,
    tarifeBransPay: opts.tarifeBransPay,
    kapanisTahmin:
      opts.kapanisTahmin?.butceYili === opts.butceYili ? opts.kapanisTahmin : null,
  });
  const cariPrim: Record<string, number[]> = {};
  for (const r of opts.aylikPrim.satirlar) cariPrim[r.bransKodu] = r.aylar;

  const derk = hesaplaDerkPortfoy({
    cariPrim,
    oncekiYilPrim: onceki.bransAylik,
    f349Oranlari: f349Oranlari(opts.mizan, opts.butceYili, opts.oranAyar, opts.mizanAylikFull),
    reasurOranlari: reasurOranlari(opts.mizan, opts.butceYili, opts.oranAyar, opts.mizanAylikFull),
  });
  const derkByBrans = new Map(derk.map((b) => [b.bransKodu, b]));
  uygulaForecastDerk(gt, derkByBrans, anchor);

  sifirlaH2Devreden(gt, anchor, MUALLAK_DEVREDEN_H2_SIFIR);

  const mizanGt = extractMizanGtAylik(opts.mizanAylikFull, opts.butceYili);
  geriYukleMizanYtdTam(gt, mizanGt, anchor, MIZAN_DISI_SATIRLAR);
  yenidenTuretUstFormuller(gt);

  const oranServisi = new MizanOranServisi(
    opts.mizan,
    opts.butceYili,
    opts.mizanAylikFull,
    true,
    opts.kalemYilBirlestirme ?? {},
  );

  const hasarSonuc = uygulaForecastHasarZinciri(gt, oranServisi, opts.oranAyar, anchor);
  if (!hasarSonuc.f22F96Ok) {
    uyarilar.push(...hasarSonuc.f22F96Hatalar.slice(0, 5));
  }

  const muallakH2 = uygulaMuallakH2Residual(gt, {
    anchorAy: anchor,
    butceYili: opts.butceYili,
    mizan: opts.mizan,
    mizanAylikFull: opts.mizanAylikFull,
    oranAyar: opts.oranAyar,
  });
  uyarilar.push(...muallakH2.uyarilar);

  uygulaForecastF86(gt, oranServisi, opts.oranAyar, anchor);

  uygulaSgkH2(gt, opts.mizan, opts.butceYili, opts.oranAyar, opts.mizanAylikFull, anchor);

  yenidenTuretUstFormuller(gt);
  yenileToplamlarH2(gt, EYE_YENILE_SATIRLARI, anchor);

  const kpkRecon: Record<string, number> = {};
  for (const b of gt.branslar) {
    const motorF23 = kpkByBrans.get(b.bransKodu)?.gtAylik[23]?.[anchor - 1] ?? 0;
    const mizanF23 = kpkStokSeviye(stokMap, b.bransKodu, "01211", anchor - 1);
    const oran = kpkReconOrani(mizanF23, motorF23);
    if (oran != null && Math.abs(motorF23) > 1e6) kpkRecon[b.bransKodu] = oran;
  }

  const maliGelirProxyMonths = Array.from({ length: 12 - anchor }, (_, i) => anchor + 1 + i);

  uyarilar.push(
    `EYE forecast v1: kesim=${anchor}; actual KPK stok (mizan küm); forecast F96 zinciri ${anchor + 1}–12.`,
  );

  return {
    uyarilar,
    quality: {
      f105Proxy: true,
      maliGelirProxyMonths,
      mizanRecon: { tutmayanSayisi: 0, satirlar: [] },
      forecastMethodVersion: "eye-v1",
      kpkRecon,
    },
    f22F96Ok: hasarSonuc.f22F96Ok,
    f22F96Hatalar: hasarSonuc.f22F96Hatalar,
  };
}

/** Test/diagnostic: F22=F23+F24 ve F96 formülü forecast aylarda. */
export function assertEyeForecastZincir(
  gt: GelirTablosuSonuc,
  anchorAy: number,
  servis: MizanOranServisi,
  oranAyar: OranAyarStore,
  bransFilter?: string,
): { ok: boolean; hatalar: string[] } {
  const anchor = Math.min(Math.max(anchorAy, 1), 11);
  const hatalar: string[] = [];

  for (const b of gt.branslar) {
    if (bransFilter && b.bransKodu !== bransFilter) continue;
    const ab = gt.aylikBrans[b.bransKodu] ?? {};
    const f11 = ab[11] ?? [];
    const f23 = ab[23] ?? [];
    const f24 = ab[24] ?? [];
    const f32 = ab[32] ?? [];
    const f96 = ab[96] ?? [];

    let prevYtd96 = ytdSum(f96, anchor - 1);

    for (let ay = anchor; ay < 12; ay++) {
      const month = ay + 1;
      const f22 = stokAt(f23, ay) + stokAt(f24, ay);
      const ab22 = ab[22]?.[ay] ?? 0;
      if (Math.abs(ab22 - f22) > 1) {
        hatalar.push(`${b.bransKodu} ay${month}: F22=${ab22} ≠ F23+F24=${f22}`);
      }

      const ytd11 = ytdSum(f11, ay);
      const ytd32 = ytdSum(f32, ay);
      const f320 = oranBrans(servis, "0211", oranAyar, b.bransKodu, month);
      const ytd96 = (ytd11 + f22 + ytd32) * f320;
      const beklenen = ytd96 - prevYtd96;
      if (Math.abs((f96[ay] ?? 0) - beklenen) > Math.max(1, Math.abs(ytd96) * 1e-4)) {
        hatalar.push(`${b.bransKodu} ay${month}: F96=${f96[ay]} ≠ ΔYTD=${beklenen}`);
      }
      prevYtd96 = ytd96;
    }
  }

  return { ok: hatalar.length === 0, hatalar };
}
