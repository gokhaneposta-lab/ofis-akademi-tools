/**
 * F38 yield-bearing pool policy unit tests.
 * node --import tsx --test lib/butce/v3/forecastMaliGelirPoolPolicy.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import type { BilancoAylikRow } from "../types";
import {
  buildMaliGelirForecastFromPool,
  resolveYieldBearingPool,
} from "./forecastMaliGelirPoolPolicy";

function bl(yil: number, ay: number, hesap: string, tutar: number): BilancoAylikRow {
  return { yil, ay, hesap, tutar };
}

describe("forecastMaliGelirPoolPolicy", () => {
  const baseBilanco: BilancoAylikRow[] = [
    bl(2026, 8, "102", 500_000_000),
    bl(2026, 8, "10202121070101", 1_450_000_000),
    bl(2026, 8, "11199111", 855_000_000),
    bl(2026, 8, "11206108", 430_000_000),
    bl(2026, 8, "11206207", 308_000_000),
    // excluded
    bl(2026, 8, "12003111010101", 516_000_000),
    bl(2026, 8, "1060111801", 252_500_000),
    bl(2026, 8, "122982", 878_490_000),
    bl(2026, 8, "1280121301", 364_100_000),
  ];

  it("pool: banka + sukuk + fon yaprakları doğru toplanır", () => {
    const pool = resolveYieldBearingPool({
      butceYili: 2026,
      anchorAy: 8,
      bilancoAylik: baseBilanco,
    });
    const bank = pool.poolItems.find((p) => p.id === "banka")!;
    const sukuk = pool.poolItems.find((p) => p.id === "sukuk")!;
    const fon = pool.poolItems.find((p) => p.id === "fon")!;
    assert.equal(bank.tutar, 1_450_000_000);
    assert.equal(sukuk.tutar, 855_000_000);
    assert.equal(fon.tutar, 738_000_000);
    assert.equal(pool.totalPool, 3_043_000_000);
  });

  it("receivable exclusion: 106/120/122/128 pool'a girmez", () => {
    const onlyReceivables = [
      bl(2026, 8, "12003111010101", 516_000_000),
      bl(2026, 8, "1060111801", 252_500_000),
      bl(2026, 8, "122982", 878_490_000),
      bl(2026, 8, "1280121301", 364_100_000),
    ];
    const pool = resolveYieldBearingPool({
      butceYili: 2026,
      anchorAy: 8,
      bilancoAylik: onlyReceivables,
    });
    assert.equal(pool.totalPool, 0);
    const withMix = resolveYieldBearingPool({
      butceYili: 2026,
      anchorAy: 8,
      bilancoAylik: baseBilanco,
    });
    assert.equal(withMix.totalPool, 3_043_000_000);
  });

  it("anchor dinamik: anchor=6 Haziran stoklarını kullanır", () => {
    const bilanco = [
      bl(2026, 6, "10202121070101", 100_000_000),
      bl(2026, 8, "10202121070101", 999_000_000),
      bl(2026, 6, "11199111", 200_000_000),
      bl(2026, 8, "11199111", 888_000_000),
      bl(2026, 6, "11206108", 50_000_000),
      bl(2026, 6, "11206207", 50_000_000),
    ];
    const p6 = resolveYieldBearingPool({ butceYili: 2026, anchorAy: 6, bilancoAylik: bilanco });
    const p8 = resolveYieldBearingPool({ butceYili: 2026, anchorAy: 8, bilancoAylik: bilanco });
    assert.equal(p6.totalPool, 400_000_000);
    assert.equal(p8.totalPool, 999_000_000 + 888_000_000);
  });

  it("H2 forecast: sabit pool × aylık yield, netNakit/bileşik yok", () => {
    const pool = 6_326_000_000;
    const yields = Array(12).fill(0.02);
    yields[8] = 0.0238;
    yields[9] = 0.0228;
    yields[10] = 0.0218;
    yields[11] = 0.0208;
    const { maliGelirAylik } = buildMaliGelirForecastFromPool({
      totalPool: pool,
      aylikGetiriOrani: yields,
      tahminBaslangicIdx: 8,
    });
    assert.equal(maliGelirAylik[7], 0);
    assert.equal(maliGelirAylik[8], pool * 0.0238);
    assert.equal(maliGelirAylik[9], pool * 0.0228);
    const h2 = maliGelirAylik.slice(8).reduce((a, x) => a + x, 0);
    assert.ok(Math.abs(h2 - pool * (0.0238 + 0.0228 + 0.0218 + 0.0208)) < 1);
    // Bileşik olsaydı H2 daha büyük olurdu
    assert.ok(h2 < pool * 0.1);
  });

  it("yield input: her ay farklı oran uygulanır", () => {
    const yields = Array(12).fill(0);
    yields[8] = 0.03;
    yields[9] = 0.01;
    const { maliGelirAylik } = buildMaliGelirForecastFromPool({
      totalPool: 1_000_000,
      aylikGetiriOrani: yields,
      tahminBaslangicIdx: 8,
    });
    assert.equal(maliGelirAylik[8], 30_000);
    assert.equal(maliGelirAylik[9], 10_000);
  });

  it("MTM / hisse stokları pool config'de yok", () => {
    const bilanco = [
      bl(2026, 8, "11206108", 100),
      bl(2026, 8, "112061", 500),
      bl(2026, 8, "11199111", 200),
    ];
    const pool = resolveYieldBearingPool({
      butceYili: 2026,
      anchorAy: 8,
      bilancoAylik: bilanco,
    });
    assert.equal(pool.poolItems.length, 3);
    assert.equal(pool.poolItems.find((p) => p.id === "fon")!.tutar, 100);
    assert.ok(!pool.poolItems.some((p) => p.id.includes("mtm")));
  });

  it("collection pattern: H2 gelir hesabı GT proxy / bank roll kullanmaz", () => {
    const poolSrc = readFileSync(
      join(process.cwd(), "lib/butce/v3/forecastMaliGelirPoolPolicy.ts"),
      "utf8",
    );
    assert.ok(!poolSrc.includes("V2_PROXY_GT"));
    assert.ok(!poolSrc.includes("netNakitPay"));
    assert.ok(!poolSrc.includes("buildMaliGelirForecastFromBank"));

    const rollingSrc = readFileSync(
      join(process.cwd(), "lib/butce/v3/maliGelirRolling.ts"),
      "utf8",
    );
    assert.ok(rollingSrc.includes("computeMaliGelirPoolPolicy"));
    assert.ok(!rollingSrc.includes("buildMaliGelirForecastFromBank"));
    assert.ok(!rollingSrc.includes("buildMaliGelirProxy"));
  });

  it("double count guard: forecast GT verisi gerektirmez", () => {
    const { maliGelirAylik, uyarilar } = buildMaliGelirForecastFromPool({
      totalPool: 100,
      aylikGetiriOrani: Array(12).fill(0.02),
      tahminBaslangicIdx: 8,
    });
    assert.equal(maliGelirAylik[8], 2);
    assert.equal(uyarilar.length, 0);
  });
});
