/**
 * Forecast rate policy — 701 + şirket entegrasyon doğrulama.
 * npx tsx scripts/butce-forecast-rate-policy-validate.ts
 */
import { buildV3GelirTablosu } from "../lib/butce/v3/buildV3GelirTablosu";
import { v3DefaultsStore2026 } from "../lib/butce/v3/defaults";
import { syntheticSatisFromTarife } from "../lib/butce/v3/syntheticSatis";
import { alignTarifeHedefleri } from "../lib/butce/v3/defaults";
import {
  loadBilancoAylikRows,
  loadKpkKapanisTahmin,
  loadKpkVadeRows,
  loadMizanAylikFullRows,
  loadMizanAylikRows,
  loadMizanRows,
  loadOranAyarPaket,
  loadSatisButceRows,
  loadTarifeBransPayRows,
  loadTarifeMapRows,
  loadUretimRows,
} from "../lib/butce/loadData";
import type { ForecastRateAnalysis } from "../lib/butce/v3/forecastRatePolicy";
import type { ReinsuranceRateAnalysis } from "../lib/butce/v3/forecastReinsuranceRatePolicy";

function findAnalysis(
  list: ForecastRateAnalysis[] | undefined,
  kalem: "61001" | "611011",
  brans: string,
): ForecastRateAnalysis | undefined {
  return list?.find((a) => a.kalem === kalem && a.brans === brans);
}

function check(
  name: string,
  a: ForecastRateAnalysis | undefined,
  expectRawNotSelected: boolean,
): { name: string; pass: boolean; detail: string } {
  if (!a) return { name, pass: false, detail: "analiz bulunamadı" };
  const rawNotSelected =
    Math.abs(a.selectedForecastRatePct - a.current2026Rate) > 5;
  const pass = expectRawNotSelected ? rawNotSelected : true;
  return {
    name,
    pass,
    detail: [
      `historical=${a.historicalRate}%`,
      `YTD=${a.current2026Rate}%`,
      `adjusted=${a.adjustedRate}%`,
      `recent3=${a.recent3MonthRate}%`,
      `selected=${a.selectedForecastRatePct}%`,
      `oneOff=${a.oneOffShockSignal}`,
      `persist=${a.persistenceSignal}`,
      `carry=${a.carry2026To2027Strength}`,
      `reason=${a.selectionReason}`,
    ].join(" | "),
  };
}

async function main() {
  const def = v3DefaultsStore2026();
  const [
    full,
    mizan,
    mizanAylik,
    satis,
    uretim,
    tarifeMap,
    tarifeBransPay,
    bilanco,
    oranPaket,
    kpkVade,
    kapanis,
  ] = await Promise.all([
    loadMizanAylikFullRows(),
    loadMizanRows(),
    loadMizanAylikRows(),
    loadSatisButceRows(),
    loadUretimRows(),
    loadTarifeMapRows(),
    loadTarifeBransPayRows(),
    loadBilancoAylikRows(),
    loadOranAyarPaket(),
    loadKpkVadeRows(),
    loadKpkKapanisTahmin(),
  ]);

  const tarifeHedefleri = alignTarifeHedefleri(def.tarifeHedefleri ?? {}, satis);
  const satisRows =
    satis.length > 0 ? satis : syntheticSatisFromTarife(tarifeHedefleri);

  const sonuc = buildV3GelirTablosu({
    varsayimlar: {
      butceYili: 2026,
      toplamPrimHedef: def.toplamPrimHedef ?? 0,
      tarifeHedefleri,
      aylikGetiriOrani: def.aylikGetiriOrani ?? [],
      faaliyetGiderButce: def.faaliyetGiderButce ?? {},
      ytdAnchorAy: 8,
      referansEtiket: def.referansEtiket,
    },
    satisRows,
    uretim,
    tarifeMap,
    tarifeBransPay,
    mizan,
    mizanAylik,
    mizanAylikFull: full,
    bilancoAylik: bilanco,
    oranAyar: oranPaket.ayarlar,
    kpkVade,
    kapanisTahmin: kapanis,
  });

  const fa = sonuc.v3.eye?.forecastRateAnalysis;
  const ra = sonuc.v3.eye?.reinsuranceRateAnalysis;
  const gt = sonuc.gt;
  const anchor = 8;

  function ytdSum(ser: number[] | undefined): number {
    return (ser ?? []).slice(0, anchor).reduce((a, x) => a + x, 0);
  }

  function checkF436(
    name: string,
    analysis: ReinsuranceRateAnalysis | undefined,
  ): { name: string; pass: boolean; detail: string } {
    if (!analysis) return { name, pass: false, detail: "F436 analiz bulunamadı" };
    const mizanYtdOk = Math.abs(analysis.ytdRatePct - analysis.selectedForecastRatePct) < 0.5;
    const methodOk = analysis.selectionMethod === "ytd";
    const pass = mizanYtdOk && methodOk;
    const ytdF105Note =
      analysis.brans === "701"
        ? `YTD_F105_kilit=${(ytdSum(gt.aylikBrans["701"]?.[105]) / 1e6).toFixed(2)}mn`
        : "rollup=0212/0211 tüm branş";
    return {
      name,
      pass,
      detail: [
        `YTD=${analysis.ytdRatePct}%`,
        `selected=${analysis.selectedForecastRatePct}%`,
        `motor=${analysis.motorRatePct}%`,
        `method=${analysis.selectionMethod}`,
        ytdF105Note,
        `reason=${analysis.selectionReason}`,
      ].join(" | "),
    };
  }

  const pool = sonuc.v3.eye?.maliGelirPoolAnalysis;
  const f38Ytd = ytdSum(gt.aylikToplam[38]);
  const f38H2 = (gt.aylikToplam[38] ?? []).slice(anchor).reduce((a, x) => a + x, 0);
  const f38Ye = (gt.aylikToplam[38] ?? []).reduce((a, x) => a + x, 0);

  const tests = [
    check(
      "701 Hasar",
      findAnalysis(fa, "61001", "701"),
      true,
    ),
    check(
      "Şirket Hasar",
      findAnalysis(fa, "61001", "SIRKET"),
      false,
    ),
    check(
      "701 Muallak",
      findAnalysis(fa, "611011", "701"),
      true,
    ),
    check(
      "Şirket Muallak",
      findAnalysis(fa, "611011", "SIRKET"),
      true,
    ),
    checkF436("701 F436 YTD", ra?.find((r) => r.brans === "701")),
    checkF436("Şirket F436 rollup", ra?.find((r) => r.brans === "SIRKET")),
    (() => {
      const a701 = ra?.find((r) => r.brans === "701");
      const aS = ra?.find((r) => r.brans === "SIRKET");
      const pass = a701 != null && aS != null && a701.selectedForecastRate !== aS.selectedForecastRate;
      return {
        name: "701 ≠ Şirket F436",
        pass,
        detail: `701=${a701?.selectedForecastRatePct}% şirket=${aS?.selectedForecastRatePct}%`,
      };
    })(),
    (() => {
      const pass =
        pool != null &&
        pool.selectedMethod === "yield_bearing_pool" &&
        pool.totalPool > 0 &&
        pool.poolItems.some((p) => p.id === "banka") &&
        pool.poolItems.some((p) => p.id === "sukuk") &&
        pool.poolItems.some((p) => p.id === "fon");
      return {
        name: "F38 pool policy aktif",
        pass,
        detail: pool
          ? `method=${pool.selectedMethod} total=${(pool.totalPool / 1e6).toFixed(2)}mn items=${pool.poolItems.map((p) => `${p.id}:${(p.tutar / 1e6).toFixed(1)}`).join(",")}`
          : "poolAnalysis yok",
      };
    })(),
    (() => {
      const rolling = sonuc.v3.maliGelirRolling;
      const pass = rolling != null && f38H2 > 0 && f38Ye > f38Ytd;
      return {
        name: "F38 YTD+H2 EYE",
        pass,
        detail: `YTD=${(f38Ytd / 1e6).toFixed(2)}mn H2=${(f38H2 / 1e6).toFixed(2)}mn YE=${(f38Ye / 1e6).toFixed(2)}mn rollingH2=${rolling ? (rolling.tahminMaliGelir / 1e6).toFixed(2) : "?"}mn`,
      };
    })(),
  ];

  console.log("\n=== FORECAST RATE POLICY VALIDATION ===\n");
  console.log(`forecastMethodVersion: ${sonuc.v3.eye?.quality.forecastMethodVersion}`);
  console.log(`f22F96Ok: ${sonuc.v3.eye?.f22F96Ok}\n`);

  for (const t of tests) {
    console.log(`${t.pass ? "PASS" : "FAIL"} — ${t.name}`);
    console.log(`  ${t.detail}\n`);
  }

  const allPass = tests.every((t) => t.pass);
  console.log(allPass ? "ALL PASS" : "SOME FAIL");
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
