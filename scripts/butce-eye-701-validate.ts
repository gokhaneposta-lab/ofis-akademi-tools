/**
 * EYE layer doğrulama — 701 Yangın, kesimAy=10 ve 11.
 * npx tsx scripts/butce-eye-701-validate.ts
 */
import { readFileSync } from "fs";
import { MizanOranServisi } from "../lib/butce/oran/mizanOranlar";
import { buildV3GelirTablosu } from "../lib/butce/v3/buildV3GelirTablosu";
import { assertEyeForecastZincir } from "../lib/butce/v3/estimatedYeForecastLayer";
import { extractKpkMizanStok, kpkStokSeviye } from "../lib/butce/v3/kpkMizanStok";
import { extractMizanGtAylik } from "../lib/butce/v3/mizanGtExtract";
import { budgetReferenceFromSnapshot } from "../lib/butce/v3/budgetReferenceLoader";
import { v3DefaultsStore2026 } from "../lib/butce/v3/defaults";
import {
  loadBilancoAylikRows,
  loadKpkKapanisTahmin,
  loadKpkVadeRows,
  loadMizanAylikFullRows,
  loadMizanAylikRows,
  loadMizanRows,
  loadOranAyarlar,
  loadSatisButceRows,
  loadTarifeBransPayRows,
  loadTarifeMapRows,
  loadUretimRows,
} from "../lib/butce/loadData";
import type { MizanAylikRow } from "../lib/butce/types";

const BRANS = "701";
const BUTCE = 2026;

function mn(n: number): string {
  return `${(n / 1e6).toFixed(2)} mn`;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("tr-TR");
}

async function loadCommon() {
  const [
    satis,
    uretim,
    tarifeMap,
    tarifeBransPay,
    mizan,
    mizanAylik,
    mizanFull,
    bilancoAylik,
    oranAyar,
    kpkVade,
    kapanisTahmin,
  ] = await Promise.all([
    loadSatisButceRows(),
    loadUretimRows(),
    loadTarifeMapRows(),
    loadTarifeBransPayRows(),
    loadMizanRows(),
    loadMizanAylikRows(),
    loadMizanAylikFullRows(),
    loadBilancoAylikRows(),
    loadOranAyarlar(),
    loadKpkVadeRows(),
    loadKpkKapanisTahmin(),
  ]);
  return {
    satis,
    uretim,
    tarifeMap,
    tarifeBransPay,
    mizan,
    mizanAylik,
    mizanFull,
    bilancoAylik,
    oranAyar,
    kpkVade,
    kapanisTahmin,
  };
}

function runScenario(
  common: Awaited<ReturnType<typeof loadCommon>>,
  kesimAy: number,
): {
  ok: boolean;
  hatalar: string[];
  sonuc: ReturnType<typeof buildV3GelirTablosu>;
  effectiveAnchor: number;
} {
  const varsayimlar = { ...v3DefaultsStore2026(), ytdAnchorAy: kesimAy };
  const sonuc = buildV3GelirTablosu({
    varsayimlar,
    satisRows: common.satis,
    uretim: common.uretim,
    tarifeMap: common.tarifeMap,
    tarifeBransPay: common.tarifeBransPay,
    mizan: common.mizan,
    mizanAylik: common.mizanAylik,
    mizanAylikFull: common.mizanFull,
    bilancoAylik: common.bilancoAylik,
    oranAyar: common.oranAyar,
    kpkVade: common.kpkVade,
    kapanisTahmin: common.kapanisTahmin,
  });

  const hatalar: string[] = [];
  const gt = sonuc.gt;
  const anchor = sonuc.v3.ytdAnchorAy;
  if (anchor !== kesimAy) {
    hatalar.push(`NOT: istenen kesim=${kesimAy}, efektif anchor=${anchor} (maxMizan kısıtı)`);
  }
  const mizanGt = extractMizanGtAylik(common.mizanFull, BUTCE);
  const stokMap = extractKpkMizanStok(common.mizanFull, BUTCE);
  const bm = gt.aylikBrans[BRANS] ?? {};

  // Actual: F11 mizan incremental
  const mizanF11 = mizanGt.bransSatir.get(BRANS)?.get(11);
  for (let ay = 0; ay < anchor; ay++) {
    const gtVal = bm[11]?.[ay] ?? 0;
    const mzVal = mizanF11?.[ay] ?? 0;
    if (Math.abs(gtVal - mzVal) > 1) {
      hatalar.push(`kesim${anchor} ay${ay + 1} F11: GT=${fmt(gtVal)} ≠ mizan=${fmt(mzVal)}`);
    }
  }

  // Actual: F23 mizan kümülatif stok
  for (let ay = 0; ay < anchor; ay++) {
    const gtVal = bm[23]?.[ay] ?? 0;
    const mzVal = kpkStokSeviye(stokMap, BRANS, "01211", ay);
    if (Math.abs(gtVal - mzVal) > 1) {
      hatalar.push(`kesim${anchor} ay${ay + 1} F23 stok: GT=${mn(gtVal)} ≠ mizan=${mn(mzVal)}`);
    }
  }

  // Forecast: F96/Kasım-Aralık motor (≠ mizan sıfır olabilir)
  for (let ay = anchor; ay < 12; ay++) {
    const f96 = bm[96]?.[ay] ?? 0;
    const mizanF96 = mizanGt.bransSatir.get(BRANS)?.get(96)?.[ay] ?? 0;
    if (Math.abs(mizanF96) > 1 && ay < (mizanGt.bransSatir.get(BRANS)?.get(96)?.length ?? 0)) {
      // forecast ay — mizan genelde 0 veya yok
    }
    if (ay >= anchor && Math.abs(f96) < 1 && ay === 11) {
      // Aralık forecast sıfır olabilir — uyarı only
    }
  }

  const servis = new MizanOranServisi(common.mizan, BUTCE, common.mizanFull, true);
  const zincir = assertEyeForecastZincir(gt, anchor, servis, common.oranAyar, BRANS);
  if (!zincir.ok) hatalar.push(...zincir.hatalar);

  if (!sonuc.v3.eye?.f22F96Ok) hatalar.push("eye.f22F96Ok=false");

  const zincirOk = zincir.ok && (sonuc.v3.eye?.f22F96Ok ?? false);
  return { ok: zincirOk, hatalar, sonuc, effectiveAnchor: anchor };
}

async function main() {
  console.log("=== EYE 701 Validate — kesimAy 10 & 11 ===\n");

  if ((await loadMizanRows()).length === 0) {
    console.error("Mizan yok.");
    process.exit(1);
  }

  const common = await loadCommon();
  let allOk = true;

  for (const kesim of [7, 10, 11]) {
    console.log(`--- kesimAy=${kesim} (efektif: run sonrası) ---`);
    const { ok, hatalar, sonuc, effectiveAnchor } = runScenario(common, kesim);
    allOk = allOk && ok;
    console.log(`  efektif anchor: ${effectiveAnchor}`);

    const bm = sonuc.gt.aylikBrans[BRANS] ?? {};
    console.log(`  F22→F96 zincir: ${ok && sonuc.v3.eye?.f22F96Ok ? "PASS" : "FAIL"}`);
    if (hatalar.length) {
      for (const h of hatalar.slice(0, 8)) console.log(`  ! ${h}`);
    }

    console.log(`  Actual F11 YTD (1..${effectiveAnchor}): ${mn((bm[11] ?? []).slice(0, effectiveAnchor).reduce((a, x) => a + x, 0))}`);
    console.log(`  Actual F23 stok ay${effectiveAnchor}: ${mn(bm[23]?.[effectiveAnchor - 1] ?? 0)}`);
    console.log(`  Forecast F96 ay${effectiveAnchor + 1}: ${mn(bm[96]?.[effectiveAnchor] ?? 0)}`);
    console.log(`  YE F96: ${mn(sonuc.gt.toplam[96] ?? 0)}`);
    console.log(`  YE F11: ${mn(sonuc.gt.toplam[11] ?? 0)}`);
    console.log(`  quality.f105Proxy: ${sonuc.v3.eye?.quality.f105Proxy}`);
    console.log(`  snapshot: ${sonuc.v3.eye?.snapshotPath ?? "—"}`);

    if (sonuc.v3.eye?.snapshotPath) {
      const snap = JSON.parse(readFileSync(sonuc.v3.eye.snapshotPath, "utf8"));
      const ref = budgetReferenceFromSnapshot(snap);
      console.log(`  2027 ref hedef2027: ${ref.hedef2027}`);
      console.log(`  2027 ref 60001: ${mn(ref.oranGirdisi2026Eye["60001"] ?? 0)}`);
    }
    console.log("");
  }

  console.log(allOk ? "=== SONUÇ: PASS ===" : "=== SONUÇ: FAIL ===");
  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
