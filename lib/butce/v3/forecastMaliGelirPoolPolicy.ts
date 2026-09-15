/**
 * F38 H2 forecast — yield-bearing asset pool × aylık user yield.
 * GT netNakit / collection pattern kullanılmaz; havuz sabit (bileşik yok).
 */
import type { BilancoAylikRow } from "../types";
import {
  FORECAST_MALI_GELIR_POOL_POLICY_CONFIG,
  type ForecastMaliGelirPoolPolicyConfig,
  type MaliGelirPoolItemDef,
} from "./forecastMaliGelirPoolPolicyConfig";

export type MaliGelirPoolItem = {
  id: string;
  label: string;
  hesapPattern: string;
  tutar: number;
};

export type MaliGelirPoolAnalysis = {
  anchorMonth: number;
  anchorYear: number;
  poolItems: MaliGelirPoolItem[];
  totalPool: number;
  monthlyYieldRates: number[];
  selectedMethod: "yield_bearing_pool";
  selectionReason: string;
  uyarilar: string[];
};

function normHesap(hesap: string): string {
  return String(hesap).replace(/\D/g, "");
}

function bilancoByHesap(
  rows: BilancoAylikRow[],
  yil: number,
  ay: number,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of rows) {
    if (r.yil !== yil || r.ay !== ay) continue;
    const h = normHesap(r.hesap);
    if (!h) continue;
    map.set(h, (map.get(h) ?? 0) + Math.abs(Number(r.tutar) || 0));
  }
  return map;
}

function isExcluded(h: string, excluded: readonly string[]): boolean {
  return excluded.some((p) => h === p || h.startsWith(p));
}

/** Parent+child çift sayımını önler — yalnız yaprak kodlar. */
function leafCodes(byHesap: Map<string, number>, candidates: string[]): string[] {
  return candidates.filter((h) => !candidates.some((o) => o !== h && o.startsWith(h)));
}

function sumPrefixLeaves(byHesap: Map<string, number>, prefix: string): number {
  const candidates = [...byHesap.keys()].filter((h) => h === prefix || h.startsWith(prefix));
  return leafCodes(byHesap, candidates).reduce((a, h) => a + (byHesap.get(h) ?? 0), 0);
}

function sumExact(byHesap: Map<string, number>, codes: readonly string[]): number {
  let s = 0;
  for (const c of codes) s += byHesap.get(c) ?? 0;
  return s;
}

function resolveItemAmount(
  byHesap: Map<string, number>,
  item: MaliGelirPoolItemDef,
  excluded: readonly string[],
): { tutar: number; pattern: string } {
  if (item.match.type === "prefix") {
    let total = 0;
    const patterns: string[] = [];
    for (const prefix of item.match.codes) {
      const candidates = [...byHesap.keys()].filter(
        (h) => (h === prefix || h.startsWith(prefix)) && !isExcluded(h, excluded),
      );
      const leaves = leafCodes(byHesap, candidates);
      for (const h of leaves) total += byHesap.get(h) ?? 0;
      if (leaves.length) patterns.push(`${prefix}* (${leaves.length} yaprak)`);
      else patterns.push(`${prefix}*`);
    }
    return { tutar: total, pattern: patterns.join(" + ") };
  }
  const present = item.match.codes.filter((c) => (byHesap.get(c) ?? 0) > 0);
  return {
    tutar: sumExact(byHesap, item.match.codes),
    pattern: present.length ? present.join(", ") : item.match.codes.join(", "),
  };
}

export function resolveYieldBearingPool(opts: {
  butceYili: number;
  anchorAy: number;
  bilancoAylik: BilancoAylikRow[];
  config?: ForecastMaliGelirPoolPolicyConfig;
}): MaliGelirPoolAnalysis {
  const config = opts.config ?? FORECAST_MALI_GELIR_POOL_POLICY_CONFIG;
  const anchor = Math.min(Math.max(opts.anchorAy, 1), 12);
  const uyarilar: string[] = [];
  const byHesap = bilancoByHesap(opts.bilancoAylik, opts.butceYili, anchor);

  if (byHesap.size === 0) {
    uyarilar.push(
      `${opts.butceYili} ay ${anchor} bilanço satırı yok — yield-bearing pool 0.`,
    );
  }

  const poolItems: MaliGelirPoolItem[] = [];
  for (const def of config.poolItems) {
    const { tutar, pattern } = resolveItemAmount(byHesap, def, config.excludedPrefixes);
    poolItems.push({
      id: def.id,
      label: def.label,
      hesapPattern: pattern,
      tutar,
    });
    if (tutar <= 0) {
      uyarilar.push(`${def.label}: anchor stok 0 (${pattern}).`);
    }
  }

  const totalPool = poolItems.reduce((a, p) => a + p.tutar, 0);

  return {
    anchorMonth: anchor,
    anchorYear: opts.butceYili,
    poolItems,
    totalPool,
    monthlyYieldRates: [],
    selectedMethod: config.selectionMethod,
    selectionReason: config.selectionReason,
    uyarilar,
  };
}

/**
 * H2 mali gelir: sabit anchor pool × aylık yield (bileşik / netNakit yok).
 * @returns 12 aylık seri; yalnız tahminBaslangicIdx..11 dolu.
 */
export function buildMaliGelirForecastFromPool(opts: {
  totalPool: number;
  aylikGetiriOrani: number[];
  tahminBaslangicIdx: number;
}): { maliGelirAylik: number[]; uyarilar: string[] } {
  const uyarilar: string[] = [];
  const start = Math.min(Math.max(opts.tahminBaslangicIdx, 0), 11);
  const getiri = Array.from({ length: 12 }, (_, i) => {
    const g = opts.aylikGetiriOrani[i];
    return Number.isFinite(g) ? g : 0;
  });

  const maliGelirAylik = Array(12).fill(0);
  if (opts.totalPool <= 0) {
    uyarilar.push("Yield-bearing pool 0 — H2 mali gelir tahmini 0.");
    return { maliGelirAylik, uyarilar };
  }

  for (let i = start; i < 12; i++) {
    maliGelirAylik[i] = opts.totalPool * getiri[i]!;
  }

  return { maliGelirAylik, uyarilar };
}

export function computeMaliGelirPoolPolicy(opts: {
  butceYili: number;
  anchorAy: number;
  bilancoAylik: BilancoAylikRow[];
  aylikGetiriOrani: number[];
  tahminBaslangicIdx: number;
  config?: ForecastMaliGelirPoolPolicyConfig;
}): {
  analysis: MaliGelirPoolAnalysis;
  maliGelirAylik: number[];
  uyarilar: string[];
} {
  const analysis = resolveYieldBearingPool({
    butceYili: opts.butceYili,
    anchorAy: opts.anchorAy,
    bilancoAylik: opts.bilancoAylik,
    config: opts.config,
  });
  analysis.monthlyYieldRates = [...opts.aylikGetiriOrani];

  const forecast = buildMaliGelirForecastFromPool({
    totalPool: analysis.totalPool,
    aylikGetiriOrani: opts.aylikGetiriOrani,
    tahminBaslangicIdx: opts.tahminBaslangicIdx,
  });

  return {
    analysis,
    maliGelirAylik: forecast.maliGelirAylik,
    uyarilar: [...analysis.uyarilar, ...forecast.uyarilar],
  };
}
