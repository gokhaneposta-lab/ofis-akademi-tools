/**
 * F436 Forecast Rate Policy — H2 F105 = H2 F96 × selected F436.
 * YTD F105 mizan kilidi değişmez; yalnızca H2 oran seçimi.
 */
import { MizanOranServisi } from "../oran/mizanOranlar";
import type { MizanAylikRow, MizanRow, OranAyarStore } from "../types";
import {
  FORECAST_REINSURANCE_RATE_POLICY_CONFIG,
  type ForecastReinsuranceRatePolicyConfig,
  type ReinsuranceSelectionMethod,
} from "./forecastReinsuranceRatePolicyConfig";

const PAY_GT = "0212";
const BAZ_GT = "0211";

export type ReinsuranceRateAnalysis = {
  brans: string;
  historicalRate: number;
  historicalRatePct: number;
  ytdRate: number;
  ytdRatePct: number;
  recent3Rate: number;
  recent3RatePct: number;
  motorRate: number;
  motorRatePct: number;
  selectedForecastRate: number;
  selectedForecastRatePct: number;
  selectionMethod: ReinsuranceSelectionMethod;
  selectionReason: string;
};

export type ReinsuranceRatePolicyBundle = {
  byBrans: Map<string, ReinsuranceRateAnalysis>;
  /** H2 F436 override — yalnızca gerçek branş kodları (7xx). */
  forecastOranByBrans: Map<string, number>;
};

function pct(n: number): number {
  return Math.round(n * 10000) / 100;
}

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

function sumGt(
  full: MizanAylikRow[],
  yil: number,
  ay: number,
  hesap: string,
  brans?: string,
): number {
  let v = 0;
  for (const r of full) {
    if (r.yil !== yil || r.ay !== ay) continue;
    if (brans && r.bransKodu !== brans) continue;
    if (String(r.hesap) !== hesap) continue;
    v += r.tutar;
  }
  return v;
}

function ytdRateFromMizan(
  full: MizanAylikRow[],
  yil: number,
  anchorAy: number,
  brans?: string,
): number | null {
  const pay = sumGt(full, yil, anchorAy, PAY_GT, brans);
  const baz = sumGt(full, yil, anchorAy, BAZ_GT, brans);
  if (Math.abs(baz) < 1) return null;
  return pay / baz;
}

/** Aylık artış oranı serisi (0212/0211 movement). */
function monthlyRateSeries(
  full: MizanAylikRow[],
  yil: number,
  maxAy: number,
  brans?: string,
): number[] {
  let ppPay = 0;
  let ppBaz = 0;
  const rates: number[] = [];
  for (let ay = 1; ay <= maxAy; ay++) {
    const payYtd = sumGt(full, yil, ay, PAY_GT, brans);
    const bazYtd = sumGt(full, yil, ay, BAZ_GT, brans);
    const payAy = payYtd - ppPay;
    const bazAy = bazYtd - ppBaz;
    rates.push(Math.abs(bazAy) >= 1 ? payAy / bazAy : 0);
    ppPay = payYtd;
    ppBaz = bazYtd;
  }
  return rates;
}

function recent3Rate(full: MizanAylikRow[], yil: number, anchorAy: number, brans?: string): number {
  const pool = monthlyRateSeries(full, yil, anchorAy, brans);
  const last3 = pool.slice(-3);
  return last3.length ? avg(last3) : 0;
}

function weightedCompanyMotor(
  servis: MizanOranServisi,
  oranAyar: OranAyarStore,
  bransKodlari: string[],
  annualPrimByBrans: Record<string, number>,
): number {
  let wSum = 0;
  let oSum = 0;
  for (const b of bransKodlari) {
    const w = Math.abs(annualPrimByBrans[b] ?? 0);
    if (w <= 0) continue;
    wSum += w;
    oSum += branchMotorRate(servis, oranAyar, b) * w;
  }
  return wSum > 0 ? oSum / wSum : 0;
}

function branchMotorRate(
  servis: MizanOranServisi,
  oranAyar: OranAyarStore,
  brans: string,
): number {
  const tablo = servis.tumBranslarTablosu("0212", oranAyar["0212"] ?? {}, { ay: 12 });
  return tablo.find((r) => r.bransKodu === brans)?.oran ?? 0;
}

function resolveMethod(brans: string, cfg: ForecastReinsuranceRatePolicyConfig): ReinsuranceSelectionMethod {
  return cfg.branchOverrides[brans] ?? cfg.defaultSelectionMethod;
}

function selectRate(
  method: ReinsuranceSelectionMethod,
  ctx: { ytd: number | null; recent3: number; historical: number; motor: number },
): { rate: number; reason: string } {
  switch (method) {
    case "ytd":
      if (ctx.ytd != null) {
        return { rate: ctx.ytd, reason: "anchor YTD 0212/0211 mizan oranı" };
      }
      return { rate: ctx.motor, reason: "YTD hesaplanamadı → motor fallback" };
    case "recent3":
      if (ctx.recent3 !== 0 || ctx.ytd != null) {
        return { rate: ctx.recent3 !== 0 ? ctx.recent3 : ctx.ytd!, reason: "son 3 ay aylık 0212/0211 ort." };
      }
      return { rate: ctx.motor, reason: "recent3 boş → motor fallback" };
    case "historical":
      return { rate: ctx.historical, reason: "tarihsel motor blend (0212 excel_gt ay=12)" };
    case "motor":
      return { rate: ctx.motor, reason: "mevcut motor F436 (excel_gt ay=12)" };
  }
}

function analyzeBrans(
  full: MizanAylikRow[],
  servis: MizanOranServisi,
  oranAyar: OranAyarStore,
  butceYili: number,
  anchorAy: number,
  brans: string | null,
  cfg: ForecastReinsuranceRatePolicyConfig,
): ReinsuranceRateAnalysis {
  const label = brans ?? "SIRKET";
  const ytd = ytdRateFromMizan(full, butceYili, anchorAy, brans ?? undefined);
  const r3 = recent3Rate(full, butceYili, anchorAy, brans ?? undefined);
  const motor = brans ? branchMotorRate(servis, oranAyar, brans) : 0;
  const historical = motor;

  const method = brans ? resolveMethod(brans, cfg) : "ytd";
  const picked = selectRate(method, { ytd, recent3: r3, historical, motor });

  return {
    brans: label,
    historicalRate: historical,
    historicalRatePct: pct(historical),
    ytdRate: ytd ?? 0,
    ytdRatePct: ytd != null ? pct(ytd) : 0,
    recent3Rate: r3,
    recent3RatePct: pct(r3),
    motorRate: motor,
    motorRatePct: pct(motor),
    selectedForecastRate: picked.rate,
    selectedForecastRatePct: pct(picked.rate),
    selectionMethod: method,
    selectionReason: picked.reason,
  };
}

export function computeReinsuranceRatePolicy(opts: {
  mizan: MizanRow[];
  mizanAylikFull: MizanAylikRow[];
  butceYili: number;
  anchorAy: number;
  oranAyar: OranAyarStore;
  bransKodlari: string[];
  annualPrimByBrans?: Record<string, number>;
  cfg?: ForecastReinsuranceRatePolicyConfig;
}): ReinsuranceRatePolicyBundle {
  const cfg = opts.cfg ?? FORECAST_REINSURANCE_RATE_POLICY_CONFIG;
  const servis = new MizanOranServisi(opts.mizan, opts.butceYili, opts.mizanAylikFull, true);

  const byBrans = new Map<string, ReinsuranceRateAnalysis>();
  const forecastOranByBrans = new Map<string, number>();

  for (const brans of opts.bransKodlari) {
    const analysis = analyzeBrans(
      opts.mizanAylikFull,
      servis,
      opts.oranAyar,
      opts.butceYili,
      opts.anchorAy,
      brans,
      cfg,
    );
    byBrans.set(brans, analysis);
    forecastOranByBrans.set(brans, analysis.selectedForecastRate);
  }

  const sirketYtd = ytdRateFromMizan(opts.mizanAylikFull, opts.butceYili, opts.anchorAy);
  const sirketR3 = recent3Rate(opts.mizanAylikFull, opts.butceYili, opts.anchorAy);
  const sirketMotor = weightedCompanyMotor(
    servis,
    opts.oranAyar,
    opts.bransKodlari,
    opts.annualPrimByBrans ?? {},
  );
  const sirketPick = selectRate("ytd", {
    ytd: sirketYtd,
    recent3: sirketR3,
    historical: sirketMotor,
    motor: sirketMotor,
  });
  byBrans.set("SIRKET", {
    brans: "SIRKET",
    historicalRate: sirketMotor,
    historicalRatePct: pct(sirketMotor),
    ytdRate: sirketYtd ?? 0,
    ytdRatePct: sirketYtd != null ? pct(sirketYtd) : 0,
    recent3Rate: sirketR3,
    recent3RatePct: pct(sirketR3),
    motorRate: sirketMotor,
    motorRatePct: pct(sirketMotor),
    selectedForecastRate: sirketPick.rate,
    selectedForecastRatePct: pct(sirketPick.rate),
    selectionMethod: "ytd",
    selectionReason: sirketPick.reason,
  });

  return { byBrans, forecastOranByBrans };
}
