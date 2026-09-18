/**
 * node --import tsx --test lib/butce/eye/eyeBrutPrimForecast.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { MizanAylikRow, TarifeMapRow } from "../types";
import { buildEyeBrutPrimForecast } from "./eyeBrutPrimForecast";
import { bransAylikPrimMizan0111, sumIncrementalYtd } from "./mizan0111Incremental";
import { resolveEyeForecastPrimMotor } from "./resolveEyeForecastPrimMotor";

function mizanKumul(yil: number, ay: number, brans: string, kumul: number): MizanAylikRow {
  return { yil, ay, hesap: "0111", bransKodu: brans, tutar: kumul };
}

function pushYearIncremental(
  full: MizanAylikRow[],
  yil: number,
  brans: string,
  monthly: number[],
): void {
  let k = 0;
  for (let m = 0; m < monthly.length; m++) {
    k += monthly[m]!;
    full.push(mizanKumul(yil, m + 1, brans, k));
  }
}

const TRAFIK_MAP: TarifeMapRow[] = [
  {
    bransKodu: "714",
    hazineBransAd: "ZKT",
    anaBrans: "KARA",
    sirketBransAd: "TRAFİK",
    tarifeGrubu: "TRAFIK",
  },
  {
    bransKodu: "715",
    hazineBransAd: "ZT",
    anaBrans: "KARA",
    sirketBransAd: "TRAFİK",
    tarifeGrubu: "TRAFIK",
  },
];

/** TRAFİK sentetik: YTD growth +13%, H2 2025 Eyl–Ara branş bazlı. */
function trafikFixture(): MizanAylikRow[] {
  const full: MizanAylikRow[] = [];
  pushYearIncremental(full, 2026, "714", Array(8).fill(169.5));
  pushYearIncremental(full, 2026, "715", Array(8).fill(113));
  pushYearIncremental(full, 2025, "714", [
    ...Array(8).fill(150),
    312,
    324,
    336,
    348,
  ]);
  pushYearIncremental(full, 2025, "715", [
    ...Array(8).fill(100),
    208,
    216,
    224,
    232,
  ]);
  pushYearIncremental(full, 2024, "714", [
    ...Array(8).fill(140),
    280,
    290,
    300,
    310,
  ]);
  pushYearIncremental(full, 2024, "715", [
    ...Array(8).fill(90),
    180,
    190,
    200,
    210,
  ]);
  return full;
}

describe("eyeBrutPrimForecast", () => {
  for (const anchor of [8, 9, 10, 11]) {
    it(`anchor=${anchor}: H2 ay sayısı ${12 - anchor}`, () => {
      const full = trafikFixture();
      const r = buildEyeBrutPrimForecast({
        butceYili: 2026,
        anchorAy: anchor,
        mizanAylikFull: full,
        tarifeMap: TRAFIK_MAP,
        bransKodlari: ["714", "715"],
      });
      assert.ok(r.durum === "ok" || r.durum === "partial");
      const t = r.tarifeSatirlari.find((x) => x.tarifeGrubu === "TRAFIK")!;
      assert.ok(t);
      let h2Count = 0;
      for (let m = anchor; m < 12; m++) {
        if ((t.aylikForecast[m] ?? 0) !== 0) h2Count++;
      }
      assert.equal(h2Count, 12 - anchor);
    });
  }

  it("anchor=12: H2 forecast yok", () => {
    const full = trafikFixture();
    const r = buildEyeBrutPrimForecast({
      butceYili: 2026,
      anchorAy: 12,
      mizanAylikFull: full,
      tarifeMap: TRAFIK_MAP,
    });
    assert.equal(r.durum, "ok");
    assert.equal(r.tarifeSatirlari.length, 0);
    assert.equal(r.h2ForecastPrimByBrans["714"]?.[11] ?? 0, 0);
  });

  it("growth override", () => {
    const full = trafikFixture();
    const auto = buildEyeBrutPrimForecast({
      butceYili: 2026,
      anchorAy: 8,
      mizanAylikFull: full,
      tarifeMap: TRAFIK_MAP,
      bransKodlari: ["714", "715"],
    });
    const over = buildEyeBrutPrimForecast({
      butceYili: 2026,
      anchorAy: 8,
      mizanAylikFull: full,
      tarifeMap: TRAFIK_MAP,
      bransKodlari: ["714", "715"],
      buyumeOverrideByTarife: { TRAFIK: 0.1 },
    });
    const tAuto = auto.tarifeSatirlari[0]!.h2ForecastToplam;
    const tOver = over.tarifeSatirlari[0]!.h2ForecastToplam;
    assert.notEqual(tAuto, tOver);
    assert.equal(over.tarifeSatirlari[0]!.buyumeUygulanan, 0.1);
  });

  it("zero denominator: 2025 YTD=0 → blocked/partial without override", () => {
    const full: MizanAylikRow[] = [];
    pushYearIncremental(full, 2026, "714", [100, 100]);
    const r = buildEyeBrutPrimForecast({
      butceYili: 2026,
      anchorAy: 2,
      mizanAylikFull: full,
      tarifeMap: TRAFIK_MAP,
      bransKodlari: ["714"],
    });
    assert.ok(r.durum === "blocked" || r.durum === "partial");
    assert.ok(r.uyarilar.some((u) => u.kod === "buyume_otomatik_yok"));
  });

  it("historical H2 zero", () => {
    const full: MizanAylikRow[] = [];
    pushYearIncremental(full, 2026, "714", Array(8).fill(100));
    pushYearIncremental(full, 2025, "714", [...Array(8).fill(80), 50, 50, 50, 50]);
    const r = buildEyeBrutPrimForecast({
      butceYili: 2026,
      anchorAy: 8,
      mizanAylikFull: full,
      tarifeMap: TRAFIK_MAP,
      bransKodlari: ["714"],
    });
    assert.ok(r.tarifeSatirlari[0]!.buyumeH2Tarihsel === null);
    assert.ok(r.uyarilar.some((u) => u.kod === "hist_h2_payda_sifir"));
  });

  it("tarife→branş dağılımı", () => {
    const full = trafikFixture();
    const r = buildEyeBrutPrimForecast({
      butceYili: 2026,
      anchorAy: 8,
      mizanAylikFull: full,
      tarifeMap: TRAFIK_MAP,
      bransKodlari: ["714", "715"],
    });
    const sep = (r.h2ForecastPrimByBrans["714"]?.[8] ?? 0) + (r.h2ForecastPrimByBrans["715"]?.[8] ?? 0);
    const tarifeSep = r.tarifeSatirlari[0]!.aylikForecast[8] ?? 0;
    assert.ok(Math.abs(sep - tarifeSep) < 1e-6);
  });

  it("budget independence: butceYillik forecast'i değiştirmez", () => {
    const full = trafikFixture();
    const a = buildEyeBrutPrimForecast({
      butceYili: 2026,
      anchorAy: 8,
      mizanAylikFull: full,
      tarifeMap: TRAFIK_MAP,
      bransKodlari: ["714", "715"],
    });
    const b = buildEyeBrutPrimForecast({
      butceYili: 2026,
      anchorAy: 8,
      mizanAylikFull: full,
      tarifeMap: TRAFIK_MAP,
      bransKodlari: ["714", "715"],
      butceYillikByTarife: { TRAFIK: 9_999_999_999 },
    });
    assert.equal(a.tarifeSatirlari[0]!.h2ForecastToplam, b.tarifeSatirlari[0]!.h2ForecastToplam);
    assert.equal(b.tarifeSatirlari[0]!.butceSapma, b.tarifeSatirlari[0]!.eyeYillik - 9_999_999_999);
  });

  it("actual aylar motor tarafından doldurulmaz (H2 indeksler only)", () => {
    const full = trafikFixture();
    const r = buildEyeBrutPrimForecast({
      butceYili: 2026,
      anchorAy: 8,
      mizanAylikFull: full,
      tarifeMap: TRAFIK_MAP,
      bransKodlari: ["714", "715"],
    });
    for (let i = 0; i < 8; i++) {
      assert.equal(r.h2ForecastPrimByBrans["714"]![i], 0);
      assert.equal(r.h2ForecastPrimByBrans["715"]![i], 0);
    }
    assert.ok((r.h2ForecastPrimByBrans["714"]![8] ?? 0) > 0);
  });

  it("incremental YTD = sum months", () => {
    const full = trafikFixture();
    const inc = bransAylikPrimMizan0111(full, 2026);
    const ytd714 = sumIncrementalYtd(inc["714"], 8);
    const ytd715 = sumIncrementalYtd(inc["715"], 8);
    const r = buildEyeBrutPrimForecast({
      butceYili: 2026,
      anchorAy: 8,
      mizanAylikFull: full,
      tarifeMap: TRAFIK_MAP,
      bransKodlari: ["714", "715"],
    });
    assert.equal(r.tarifeSatirlari[0]!.actualYtd, ytd714 + ytd715);
  });

  it("double count: tarife YTD = branş toplamı", () => {
    const full = trafikFixture();
    const inc = bransAylikPrimMizan0111(full, 2026);
    const r = buildEyeBrutPrimForecast({
      butceYili: 2026,
      anchorAy: 8,
      mizanAylikFull: full,
      tarifeMap: TRAFIK_MAP,
      bransKodlari: ["714", "715"],
    });
    const manual =
      sumIncrementalYtd(inc["714"], 8) + sumIncrementalYtd(inc["715"], 8);
    assert.equal(r.tarifeSatirlari[0]!.actualYtd, manual);
  });

  it("TRAFIK örnek: growth + H2 + resolveEyeForecastPrimMotor", () => {
    const full = trafikFixture();
    const r = resolveEyeForecastPrimMotor({
      butceYili: 2026,
      anchorAy: 8,
      mizanAylikFull: full,
      tarifeMap: TRAFIK_MAP,
      bransKodlari: ["714", "715"],
    });
    const t = r.tarifeSatirlari[0]!;
    assert.ok(Math.abs((t.buyumeOtomatik ?? 0) - 0.13) < 1e-9);
    assert.ok(t.h2ForecastToplam > 0);
    assert.equal(t.eyeYillik, t.actualYtd + t.h2ForecastToplam);
    assert.ok((r.h2ForecastPrimByBrans["715"]?.[11] ?? 0) > 0);
  });
});
