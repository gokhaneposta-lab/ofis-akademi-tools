/**
 * F436 forecast rate policy unit tests.
 * node --import tsx --test lib/butce/v3/forecastReinsuranceRatePolicy.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeReinsuranceRatePolicy } from "./forecastReinsuranceRatePolicy";
import type { MizanAylikRow, MizanRow } from "../types";

function row(
  yil: number,
  ay: number,
  hesap: string,
  brans: string,
  tutar: number,
): MizanAylikRow {
  return { yil, ay, hesap, bransKodu: brans, tutar };
}

describe("forecastReinsuranceRatePolicy", () => {
  it("branş bazlı YTD F436 — 701 ve 703 farklı oran", () => {
    const full: MizanAylikRow[] = [
      // 701: YTD 0211=-100, 0212=+80 → -80%
      row(2026, 8, "0211", "701", -100),
      row(2026, 8, "0212", "701", 80),
      // 703: YTD 0211=-200, 0212=+60 → -30%
      row(2026, 8, "0211", "703", -200),
      row(2026, 8, "0212", "703", 60),
    ];
    const mizan: MizanRow[] = [];
    const bundle = computeReinsuranceRatePolicy({
      mizan,
      mizanAylikFull: full,
      butceYili: 2026,
      anchorAy: 8,
      oranAyar: {},
      bransKodlari: ["701", "703"],
    });

    const r701 = bundle.byBrans.get("701")!;
    const r703 = bundle.byBrans.get("703")!;
    assert.ok(Math.abs(r701.selectedForecastRatePct - -80) < 0.1);
    assert.ok(Math.abs(r703.selectedForecastRatePct - -30) < 0.1);
    assert.notEqual(r701.selectedForecastRate, r703.selectedForecastRate);
    assert.equal(r701.selectionMethod, "ytd");
  });

  it("H2 override map yalnızca gerçek branşları içerir", () => {
    const full: MizanAylikRow[] = [
      row(2026, 8, "0211", "701", -100),
      row(2026, 8, "0212", "701", 77.89),
    ];
    const bundle = computeReinsuranceRatePolicy({
      mizan: [],
      mizanAylikFull: full,
      butceYili: 2026,
      anchorAy: 8,
      oranAyar: {},
      bransKodlari: ["701"],
    });
    assert.ok(bundle.forecastOranByBrans.has("701"));
    assert.ok(!bundle.forecastOranByBrans.has("SIRKET"));
    assert.ok(Math.abs(bundle.forecastOranByBrans.get("701")! - -0.7789) < 0.001);
  });

  it("şirket rollup YTD ayrı hesaplanır", () => {
    const full: MizanAylikRow[] = [
      row(2026, 8, "0211", "701", -100),
      row(2026, 8, "0212", "701", 80),
      row(2026, 8, "0211", "703", -100),
      row(2026, 8, "0212", "703", 20),
    ];
    const bundle = computeReinsuranceRatePolicy({
      mizan: [],
      mizanAylikFull: full,
      butceYili: 2026,
      anchorAy: 8,
      oranAyar: {},
      bransKodlari: ["701", "703"],
      annualPrimByBrans: { "701": 1, "703": 1 },
    });
    const sirket = bundle.byBrans.get("SIRKET")!;
    // (80+20)/(-200) = -50%
    assert.ok(Math.abs(sirket.ytdRatePct - -50) < 0.1);
  });
});
