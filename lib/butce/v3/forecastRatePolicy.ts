/**
 * Forecast Rate Selection / Policy — EYE H2 oran seçimi.
 *
 * Mevcut F320/F451 tarihsel hesaplamayı değiştirmez.
 * Mizan aylık seriden sinyal üretir; deterministik kurallarla forecast oranı seçer.
 */
import { MizanOranServisi } from "../oran/mizanOranlar";
import type { MizanAylikRow, MizanRow, OranAyarStore } from "../types";
import {
  FORECAST_RATE_POLICY_CONFIG,
  type ForecastRatePolicyConfig,
} from "./forecastRatePolicyConfig";

export type ForecastKalem = "61001" | "611011";

export type SignalLevel = "YUKSEK" | "ORTA" | "DUSUK";
export type PersistenceLevel = SignalLevel | "BELIRSIZ";
export type CarryStrength = "ZAYIF" | "ORTA" | "GUCLU";

export type MonthlyRatePoint = {
  ay: number;
  primAy: number;
  payAy: number;
  oranAyPct: number;
  oranYtdPct: number;
};

export type ForecastRateAnalysis = {
  kalem: ForecastKalem;
  brans: string;
  current2026Rate: number;
  historicalRate: number;
  recent3MonthRate: number;
  adjustedRate: number;
  deviation: number;
  volatility: number;
  oneOffShockSignal: SignalLevel;
  persistenceSignal: PersistenceLevel;
  carry2026To2027Strength: CarryStrength;
  selectedForecastRate: number;
  selectedForecastRatePct: number;
  selectionReason: string;
  shockMonths: number[];
  shockSharePct: number;
  ytdVsRecentPp: number;
};

const KALEM_GT: Record<ForecastKalem, { prim: string; pay: string; oranKalem: string }> = {
  "61001": { prim: "0111", pay: "0211", oranKalem: "0211" },
  "611011": { prim: "0111", pay: "02211", oranKalem: "02211" },
};

function pct(n: number): number {
  return Math.round(n * 10000) / 100;
}

function pp(n: number): number {
  return Math.round(n * 100) / 100;
}

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

function stdev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const m = avg(nums);
  return Math.sqrt(nums.reduce((s, x) => s + (x - m) ** 2, 0) / (nums.length - 1));
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

/** Mizan GT aylık serisi — ay sonu YTD farkı (movement). */
export function buildMonthlyRateSeries(
  full: MizanAylikRow[],
  yil: number,
  maxAy: number,
  kalem: ForecastKalem,
  brans: string | null,
): MonthlyRatePoint[] {
  const { prim: primHesap, pay: payHesap } = KALEM_GT[kalem];
  let ppPrim = 0;
  let ppPay = 0;
  const out: MonthlyRatePoint[] = [];

  for (let ay = 1; ay <= maxAy; ay++) {
    const primYtd = sumGt(full, yil, ay, primHesap, brans ?? undefined);
    const payYtd = sumGt(full, yil, ay, payHesap, brans ?? undefined);
    const primAy = primYtd - ppPrim;
    const payAy = payYtd - ppPay;
    out.push({
      ay,
      primAy: primAy / 1e6,
      payAy: payAy / 1e6,
      oranAyPct: primAy !== 0 ? pct(payAy / primAy) : 0,
      oranYtdPct: primYtd !== 0 ? pct(payYtd / primYtd) : 0,
    });
    ppPrim = primYtd;
    ppPay = payYtd;
  }
  return out;
}

function ytdExcluding(
  series: MonthlyRatePoint[],
  excludeAys: number[],
): { primTl: number; payTl: number; oranPct: number } {
  let prim = 0;
  let pay = 0;
  for (const r of series) {
    if (excludeAys.includes(r.ay)) continue;
    prim += r.primAy * 1e6;
    pay += r.payAy * 1e6;
  }
  return { primTl: prim, payTl: pay, oranPct: prim !== 0 ? pct(pay / prim) : 0 };
}

function detectShockMonths(
  series: MonthlyRatePoint[],
  currentYtdPct: number,
  cfg: ForecastRatePolicyConfig,
): number[] {
  const totalPayTl = series.reduce((s, r) => s + r.payAy * 1e6, 0);
  const dominantSign = Math.sign(totalPayTl) || -1;

  const impacts: Array<{ ay: number; impactPp: number; payAbs: number }> = [];

  for (const r of series) {
    if (Math.sign(r.payAy) !== dominantSign && Math.abs(r.payAy) > 1e-9) continue;
    const ex = ytdExcluding(series, [r.ay]);
    const impact = Math.abs(ex.oranPct - currentYtdPct);
    impacts.push({ ay: r.ay, impactPp: impact, payAbs: Math.abs(r.payAy * 1e6) });
  }

  impacts.sort((a, b) => b.payAbs - a.payAbs || b.impactPp - a.impactPp);

  const shocks: number[] = [];
  for (const row of impacts) {
    if (shocks.length >= cfg.shockDetectMaxMonths) break;
    if (
      row.impactPp >= cfg.singleMonthShockImpactPp &&
      row.payAbs >= cfg.shockMinPayAbsTl
    ) {
      shocks.push(row.ay);
    }
  }
  return shocks.sort((a, b) => a - b);
}

function recent3NonShockAvg(series: MonthlyRatePoint[], shockAys: number[]): number {
  const pool = series.filter((r) => !shockAys.includes(r.ay));
  const last3 = pool.slice(-3).map((r) => r.oranAyPct);
  if (last3.length === 0) {
    return avg(series.slice(-3).map((r) => r.oranAyPct));
  }
  return avg(last3);
}

function shockSharePct(series: MonthlyRatePoint[], shockAys: number[]): number {
  const totalPay = series.reduce((s, r) => s + Math.abs(r.payAy), 0);
  if (totalPay <= 0) return 0;
  const shockPay = series
    .filter((r) => shockAys.includes(r.ay))
    .reduce((s, r) => s + Math.abs(r.payAy), 0);
  return pct(shockPay / totalPay);
}

function classifyOneOff(
  shockShare: number,
  ytdPct: number,
  adjustedPct: number,
  cfg: ForecastRatePolicyConfig,
): SignalLevel {
  const gap = Math.abs(ytdPct - adjustedPct);
  if (shockShare >= cfg.shockShareHigh * 100 || gap >= cfg.ytdAdjustedGapHighPp) return "YUKSEK";
  if (shockShare <= cfg.shockShareLow * 100 && gap <= cfg.ytdAdjustedGapLowPp) return "DUSUK";
  return "ORTA";
}

function classifyPersistence(
  ytdPct: number,
  recent3Pct: number,
  historicalPct: number,
  cfg: ForecastRatePolicyConfig,
): PersistenceLevel {
  const ytdVsRecent = Math.abs(ytdPct - recent3Pct);
  const recentVsHist = Math.abs(recent3Pct - historicalPct);

  if (ytdVsRecent >= cfg.ytdVsRecentGapPp && Math.abs(recent3Pct) < Math.abs(ytdPct)) {
    return "DUSUK";
  }

  const sameSign =
    Math.sign(recent3Pct) === Math.sign(historicalPct) ||
    Math.abs(historicalPct) < 1;

  if (recentVsHist >= cfg.persistenceRecentVsHistPp && sameSign) {
    if (Math.abs(recent3Pct) > Math.abs(historicalPct)) return "YUKSEK";
    return "DUSUK";
  }

  if (recentVsHist >= cfg.persistenceRecentVsHistPp / 2) return "ORTA";
  return "BELIRSIZ";
}

function classifyCarry(oneOff: SignalLevel, persistence: PersistenceLevel): CarryStrength {
  if (oneOff === "YUKSEK" && (persistence === "DUSUK" || persistence === "BELIRSIZ")) {
    return "ZAYIF";
  }
  if (oneOff === "DUSUK" && persistence === "YUKSEK") return "GUCLU";
  if (oneOff === "ORTA" || persistence === "ORTA") return "ORTA";
  if (oneOff === "DUSUK" && persistence === "DUSUK") return "ORTA";
  return "ZAYIF";
}

function selectRate(
  inputs: {
    ytdPct: number;
    adjustedPct: number;
    recent3Pct: number;
    historicalPct: number;
    oneOff: SignalLevel;
    persistence: PersistenceLevel;
  },
  cfg: ForecastRatePolicyConfig,
): { rateDecimal: number; reason: string } {
  const toDec = (p: number) => p / 100;

  if (inputs.oneOff === "YUKSEK") {
    const w = cfg.blend.shockHighPersistLow;
    let wAdj = w.adjusted;
    let wRec = w.recent3;
    let wHist = w.historical;
    /** recent3 hâlâ şok/kontamine ise ağırlığı adjusted+hist'e kaydır */
    if (Math.abs(inputs.recent3Pct) > Math.abs(inputs.adjustedPct) * 1.5) {
      wAdj += wRec * 0.55;
      wHist += wRec * 0.25;
      wRec *= 0.2;
    }
    const rate =
      wAdj * toDec(inputs.adjustedPct) +
      wRec * toDec(inputs.recent3Pct) +
      wHist * toDec(inputs.historicalPct);
    return {
      rateDecimal: rate,
      reason: `oneOff=YUKSEK → adjusted(${inputs.adjustedPct}%)×${wAdj.toFixed(2)} + recent3(${inputs.recent3Pct}%)×${wRec.toFixed(2)} + hist(${inputs.historicalPct}%)×${wHist.toFixed(2)}`,
    };
  }

  if (inputs.oneOff === "DUSUK" && inputs.persistence === "YUKSEK") {
    const w = cfg.blend.shockLowPersistHigh;
    const rate =
      w.recent3 * toDec(inputs.recent3Pct) +
      w.ytd * toDec(inputs.ytdPct) +
      w.historical * toDec(inputs.historicalPct);
    return {
      rateDecimal: rate,
      reason: `oneOff=DUSUK + persistence=YUKSEK → recent3(${inputs.recent3Pct}%)×${w.recent3} + YTD(${inputs.ytdPct}%)×${w.ytd} + hist(${inputs.historicalPct}%)×${w.historical}`,
    };
  }

  if (inputs.oneOff === "ORTA" && inputs.persistence === "ORTA") {
    const w = cfg.blend.bothMedium;
    const rate =
      w.historical * toDec(inputs.historicalPct) +
      w.adjusted * toDec(inputs.adjustedPct) +
      w.recent3 * toDec(inputs.recent3Pct);
    return {
      rateDecimal: rate,
      reason: `oneOff=ORTA + persistence=ORTA → hist×${w.historical} + adjusted×${w.adjusted} + recent3×${w.recent3}`,
    };
  }

  const w = cfg.blend.default;
  const rate =
    w.historical * toDec(inputs.historicalPct) +
    w.adjusted * toDec(inputs.adjustedPct) +
    w.recent3 * toDec(inputs.recent3Pct);
  return {
    rateDecimal: rate,
    reason: `varsayılan blend → hist(${inputs.historicalPct}%)×${w.historical} + adjusted(${inputs.adjustedPct}%)×${w.adjusted} + recent3(${inputs.recent3Pct}%)×${w.recent3}`,
  };
}

export function analyzeForecastRate(
  series: MonthlyRatePoint[],
  historicalRateDecimal: number,
  kalem: ForecastKalem,
  brans: string,
  cfg: ForecastRatePolicyConfig = FORECAST_RATE_POLICY_CONFIG,
): ForecastRateAnalysis {
  const ayOran = series.map((r) => r.oranAyPct);
  const currentYtdPct = series[series.length - 1]?.oranYtdPct ?? 0;
  const historicalPct = pct(historicalRateDecimal);
  const shockMonths = detectShockMonths(series, currentYtdPct, cfg);
  /** Son 3 ay — şok ayları hariç (aylık oran ortalaması) */
  const recent3Pct = pp(recent3NonShockAvg(series, shockMonths));
  const volatility = pp(stdev(ayOran));
  const adjusted = ytdExcluding(series, shockMonths);
  const shockShare = shockSharePct(series, shockMonths);

  const oneOff = classifyOneOff(shockShare, currentYtdPct, adjusted.oranPct, cfg);
  const persistence = classifyPersistence(currentYtdPct, recent3Pct, historicalPct, cfg);
  const carry = classifyCarry(oneOff, persistence);

  const { rateDecimal, reason } = selectRate(
    {
      ytdPct: currentYtdPct,
      adjustedPct: adjusted.oranPct,
      recent3Pct,
      historicalPct,
      oneOff,
      persistence,
    },
    cfg,
  );

  return {
    kalem,
    brans,
    current2026Rate: currentYtdPct,
    historicalRate: historicalPct,
    recent3MonthRate: recent3Pct,
    adjustedRate: adjusted.oranPct,
    deviation: pp(currentYtdPct - historicalPct),
    volatility,
    oneOffShockSignal: oneOff,
    persistenceSignal: persistence,
    carry2026To2027Strength: carry,
    selectedForecastRate: rateDecimal,
    selectedForecastRatePct: pct(rateDecimal),
    selectionReason: reason,
    shockMonths,
    shockSharePct: shockShare,
    ytdVsRecentPp: pp(currentYtdPct - recent3Pct),
  };
}

export type ForecastRatePolicyBundle = {
  hasar: Map<string, ForecastRateAnalysis>;
  muallak: Map<string, ForecastRateAnalysis>;
  /** EYE hasar zinciri — branş → seçilmiş oran (decimal, F320 yerine) */
  hasarForecastOran: Map<string, number>;
  /** Muallak yıllık hedef — branş → prim×oran (TL) */
  muallakYillikHedefByBrans: Map<string, number>;
  muallakYillikHedefToplam: number;
};

export function computeForecastRatePolicy(opts: {
  mizan: MizanRow[];
  mizanAylikFull: MizanAylikRow[];
  butceYili: number;
  anchorAy: number;
  oranAyar: OranAyarStore;
  bransKodlari: string[];
  annualPrimByBrans: Record<string, number>;
  cfg?: ForecastRatePolicyConfig;
}): ForecastRatePolicyBundle {
  const cfg = opts.cfg ?? FORECAST_RATE_POLICY_CONFIG;
  const servis = new MizanOranServisi(opts.mizan, opts.butceYili, opts.mizanAylikFull, true);

  const hasar = new Map<string, ForecastRateAnalysis>();
  const muallak = new Map<string, ForecastRateAnalysis>();
  const hasarForecastOran = new Map<string, number>();
  const muallakYillikHedefByBrans = new Map<string, number>();

  const targets = [...opts.bransKodlari, "SIRKET"];

  for (const brans of targets) {
    const bransFilter = brans === "SIRKET" ? null : brans;

    const hasarSeries = buildMonthlyRateSeries(
      opts.mizanAylikFull,
      opts.butceYili,
      opts.anchorAy,
      "61001",
      bransFilter,
    );
    const histHasar =
      brans === "SIRKET"
        ? weightedCompanyOran(
            servis,
            "0211",
            opts.oranAyar,
            opts.anchorAy,
            opts.bransKodlari,
            opts.annualPrimByBrans,
          )
        : branchOran(servis, "0211", opts.oranAyar, brans, opts.anchorAy);

    const hasarAnalysis = analyzeForecastRate(hasarSeries, histHasar, "61001", brans, cfg);
    hasar.set(brans, hasarAnalysis);
    if (brans !== "SIRKET") {
      hasarForecastOran.set(brans, hasarAnalysis.selectedForecastRate);
    }

    const muallakSeries = buildMonthlyRateSeries(
      opts.mizanAylikFull,
      opts.butceYili,
      opts.anchorAy,
      "611011",
      bransFilter,
    );
    const histMuallak =
      brans === "SIRKET"
        ? weightedCompanyOran(
            servis,
            "02211",
            opts.oranAyar,
            opts.anchorAy,
            opts.bransKodlari,
            opts.annualPrimByBrans,
          )
        : branchOran(servis, "02211", opts.oranAyar, brans, opts.anchorAy);

    const muallakAnalysis = analyzeForecastRate(muallakSeries, histMuallak, "611011", brans, cfg);
    muallak.set(brans, muallakAnalysis);

    if (brans !== "SIRKET") {
      const prim = opts.annualPrimByBrans[brans] ?? 0;
      muallakYillikHedefByBrans.set(brans, prim * muallakAnalysis.selectedForecastRate);
    }
  }

  let muallakYillikHedefToplam = 0;
  for (const v of muallakYillikHedefByBrans.values()) muallakYillikHedefToplam += v;

  return {
    hasar,
    muallak,
    hasarForecastOran,
    muallakYillikHedefByBrans,
    muallakYillikHedefToplam,
  };
}

function branchOran(
  servis: MizanOranServisi,
  kalem: string,
  oranAyar: OranAyarStore,
  brans: string,
  ay: number,
): number {
  const tablo = servis.tumBranslarTablosu(kalem, oranAyar[kalem] ?? {}, { ay });
  return tablo.find((r) => r.bransKodu === brans)?.oran ?? 0;
}

/** Şirket tarihsel oran — yıllık prim ağırlıklı branş ortalaması. */
function weightedCompanyOran(
  servis: MizanOranServisi,
  kalem: string,
  oranAyar: OranAyarStore,
  ay: number,
  bransKodlari: string[],
  annualPrimByBrans: Record<string, number>,
): number {
  let wSum = 0;
  let oSum = 0;
  for (const b of bransKodlari) {
    const w = Math.abs(annualPrimByBrans[b] ?? 0);
    if (w <= 0) continue;
    const oran = branchOran(servis, kalem, oranAyar, b, ay);
    wSum += w;
    oSum += oran * w;
  }
  return wSum > 0 ? oSum / wSum : 0;
}

/** Unit test / senaryo için saf seri analizi (mizan gerekmez). */
export function analyzeForecastRateFromMonthly(
  monthlyOranPct: number[],
  ytdPct: number,
  historicalPct: number,
  kalem: ForecastKalem,
  brans: string,
  cfg?: ForecastRatePolicyConfig,
): ForecastRateAnalysis {
  const series: MonthlyRatePoint[] = monthlyOranPct.map((oranAyPct, i) => ({
    ay: i + 1,
    primAy: 100,
    payAy: oranAyPct,
    oranAyPct,
    oranYtdPct: i === monthlyOranPct.length - 1 ? ytdPct : oranAyPct,
  }));
  if (series.length > 0) {
    series[series.length - 1]!.oranYtdPct = ytdPct;
  }
  return analyzeForecastRate(series, historicalPct / 100, kalem, brans, cfg);
}
