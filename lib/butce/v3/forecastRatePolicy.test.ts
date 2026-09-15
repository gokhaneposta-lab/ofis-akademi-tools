/**
 * Forecast rate policy unit tests.
 * node --import tsx --test lib/butce/v3/forecastRatePolicy.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyzeForecastRate,
  buildMonthlyRateSeries,
  type MonthlyRatePoint,
} from "./forecastRatePolicy";
import { FORECAST_RATE_POLICY_CONFIG } from "./forecastRatePolicyConfig";

/** prim/pay TL cinsinden; dahili olarak mn formatına çevrilir (buildMonthlyRateSeries ile uyumlu). */
function seriesFromMonthly(
  rows: Array<{ prim: number; pay: number }>,
): MonthlyRatePoint[] {
  let pp = 0;
  let pk = 0;
  const out: MonthlyRatePoint[] = [];
  for (let i = 0; i < rows.length; i++) {
    const primAyTl = rows[i]!.prim;
    const payAyTl = rows[i]!.pay;
    pp += primAyTl;
    pk += payAyTl;
    out.push({
      ay: i + 1,
      primAy: primAyTl / 1e6,
      payAy: payAyTl / 1e6,
      oranAyPct: primAyTl !== 0 ? Math.round((payAyTl / primAyTl) * 10000) / 100 : 0,
      oranYtdPct: pp !== 0 ? Math.round((pk / pp) * 10000) / 100 : 0,
    });
  }
  return out;
}

describe("forecastRatePolicy", () => {
  it("a) tek ay şoklu: historical=42%, YTD=98% → raw YTD seçilmez", () => {
    const primAy = 100_000_000;
    const normalPay = 19_000_000;
    const shockPay = 650_000_000;
    const rows = [
      { prim: primAy, pay: normalPay },
      { prim: primAy, pay: normalPay },
      { prim: primAy, pay: normalPay },
      { prim: primAy, pay: shockPay },
      { prim: primAy, pay: normalPay },
      { prim: primAy, pay: normalPay },
      { prim: primAy, pay: normalPay },
      { prim: primAy, pay: normalPay },
    ];
    const series = seriesFromMonthly(rows);
    const ytdPct = series[series.length - 1]!.oranYtdPct;
    assert.ok(ytdPct > 90, `YTD beklenen ~98+, gelen ${ytdPct}`);

    const analysis = analyzeForecastRate(series, 0.42, "61001", "TEST", FORECAST_RATE_POLICY_CONFIG);

    assert.equal(analysis.oneOffShockSignal, "YUKSEK");
    assert.ok(
      Math.abs(analysis.selectedForecastRatePct) < Math.abs(analysis.current2026Rate) - 10,
      `Seçilen (${analysis.selectedForecastRatePct}%) raw YTD (${analysis.current2026Rate}%)'den belirgin düşük olmalı`,
    );
    assert.notEqual(analysis.selectedForecastRatePct, analysis.current2026Rate);
  });

  it("b) sürekli yüksek trend: YTD=98%, son 3 ay yüksek, şok yok → recent/YTD ağırlığı", () => {
    const primAy = 100_000_000;
    const pays = [85, 88, 90, 92, 94, 96, 98, 100].map((p) => ({
      prim: primAy,
      pay: (primAy * p) / 100,
    }));
    const series = seriesFromMonthly(pays);
    const analysis = analyzeForecastRate(series, 0.42, "61001", "TEST", FORECAST_RATE_POLICY_CONFIG);

    assert.equal(analysis.oneOffShockSignal, "DUSUK");
    assert.equal(analysis.persistenceSignal, "YUKSEK");
    assert.ok(
      Math.abs(analysis.selectedForecastRatePct) > Math.abs(analysis.historicalRate) + 15,
      `Seçilen (${analysis.selectedForecastRatePct}%) tarihselden (${analysis.historicalRate}%) yüksek olmalı`,
    );
    assert.match(analysis.selectionReason, /persistence=YUKSEK/);
  });

  it("buildMonthlyRateSeries boş branş filtresi şirket toplamı döner", () => {
    const full = [
      { yil: 2026, ay: 1, hesap: "0111", bransKodu: "701", tutar: 100e6 },
      { yil: 2026, ay: 1, hesap: "0211", bransKodu: "701", tutar: -50e6 },
    ] as import("../types").MizanAylikRow[];
    const s = buildMonthlyRateSeries(full, 2026, 1, "61001", null);
    assert.equal(s.length, 1);
    assert.equal(s[0]!.oranAyPct, -50);
  });
});
