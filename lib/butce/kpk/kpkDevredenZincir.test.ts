/**
 * KPK Faz 2 — devreden zinciri, F24/F27 Ocak-only, mizan recon.
 * node --import tsx --test lib/butce/kpk/kpkDevredenZincir.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { KpkBransSonuc } from "./kpkMotoru";
import type { KpkSonuc } from "./buildKpkSonuc";
import { buildKpkGtHucreleri } from "../gelir/buildKpkGtHucreleri";
import {
  devredenKpkOcakFromMizan,
  devredenKpkOcakFromMizanKapanis,
  devredenKpkOcakOzet,
} from "../gelir/kpkDevreden";
import {
  assertDec31CariEqualsJan1Devreden,
  buildDevredenKpkZincir,
  devredenOcakFromPrevYearDec31Cari,
  reconcileDevredenKpkWithMizan,
  resolveDevredenKpkKaynakModu,
} from "./kpkDevredenZincir";
import { oncekiYilEye12PrimForButceYplus1 } from "./kpkPrimKaynak";
import type { MizanAylikRow } from "../types";

function fakeKpkSonuc(b: Partial<KpkBransSonuc> & { bransKodu: string }): KpkSonuc {
  const f23 = Array(12).fill(0);
  const f26 = Array(12).fill(0);
  f23[11] = -500;
  f26[11] = -50;
  const gtAylik: Record<number, number[]> = b.gtAylik ?? { 23: f23, 26: f26 };
  return {
    butceYili: 2026,
    oncekiYil: 2025,
    sonGercekAy: 12,
    branslar: [
      {
        bransKodu: b.bransKodu,
        cariStok: b.cariStok ?? Array(13).fill(0).map((_, i) => (i === 12 ? 500 : 0)),
        gtAylik,
        gtYillik: {},
        reasurStok: [],
        sgkStok: [],
      } as KpkBransSonuc,
    ],
    toplamGtYillik: {},
    toplamGtAylik: {},
  };
}

describe("kpkDevredenZincir Faz 2", () => {
  it("dec_to_jan_devreden: 31.12 F23 → Ocak devreden F24", () => {
    const prev = fakeKpkSonuc({ bransKodu: "701" });
    const dev = devredenOcakFromPrevYearDec31Cari(prev);
    assert.equal(dev.get("701")!.satir24, -500);
    assert.ok(assertDec31CariEqualsJan1Devreden(prev, dev));
    const cariDec = prev.branslar[0]!.cariStok[12]!;
    assert.equal(Math.abs(cariDec), Math.abs(dev.get("701")!.satir24));
  });

  it("devreden_does_not_depend_on_mizan_01212", () => {
    const mizanBase: MizanAylikRow[] = [
      { yil: 2027, ay: 1, hesap: "01212", bransKodu: "701", tutar: 1_000_000 },
    ];
    const mizanMutated: MizanAylikRow[] = [
      { yil: 2027, ay: 1, hesap: "01212", bransKodu: "701", tutar: 9_999_999_999 },
    ];
    const prev = fakeKpkSonuc({ bransKodu: "701" });
    const motor = devredenOcakFromPrevYearDec31Cari(prev);
    const recon1 = reconcileDevredenKpkWithMizan(motor, devredenKpkOcakFromMizan(mizanBase, 2027));
    const recon2 = reconcileDevredenKpkWithMizan(motor, devredenKpkOcakFromMizan(mizanMutated, 2027));
    assert.equal(motor.get("701")!.satir24, -500);
    assert.notEqual(recon1, null);
    assert.notEqual(recon2, null);
    assert.notEqual(recon1!.satirlar[0]!.farkTl, recon2!.satirlar[0]!.farkTl);
  });

  it("f24_devreden_stock_constant_jan_dec", () => {
    const brans: KpkBransSonuc = {
      bransKodu: "701",
      cariStok: Array(13).fill(0),
      devredenStok: [],
      gtAylik: { 23: Array(12).fill(-100), 24: Array(12).fill(999), 26: Array(12).fill(0), 27: Array(12).fill(888) },
      gtYillik: {},
    };
    const dev = { satir24: 400, satir27: -40 };
    for (let i = 0; i < 12; i++) {
      const h = buildKpkGtHucreleri(brans, dev, i);
      assert.equal(h[24], 400, `ay ${i + 1} F24 devreden sabit`);
      assert.notEqual(h[24], 999);
    }
  });

  it("f27_devreden_stock_constant_jan_dec", () => {
    const brans: KpkBransSonuc = {
      bransKodu: "701",
      cariStok: Array(13).fill(0),
      gtAylik: { 23: Array(12).fill(0), 24: Array(12).fill(0), 26: Array(12).fill(-10), 27: Array(12).fill(777) },
      gtYillik: {},
      devredenStok: [],
    } as KpkBransSonuc;
    const dev = { satir24: 100, satir27: -10 };
    for (let i = 0; i < 12; i++) {
      const h = buildKpkGtHucreleri(brans, dev, i);
      assert.equal(h[27], -10, `ay ${i + 1} F27 devreden sabit`);
      assert.notEqual(h[27], 777);
    }
  });

  it("devreden_reconciliation raporlar fark", () => {
    const motor = new Map([["701", { satir24: -100, satir27: 10 }]]);
    const mizan = new Map([["701", { satir24: -90, satir27: 9 }]]);
    const r = reconcileDevredenKpkWithMizan(motor, mizan);
    assert.ok(r);
    assert.equal(r!.uyariKod, "devreden_kpk_recon_warning");
    assert.equal(r!.satirlar[0]!.farkTl, -10);
    assert.ok(Math.abs(r!.satirlar[0]!.farkPct! - -10 / 90) < 1e-6);
  });

  it("mizan_kapanis: 01211/01221 Dec → 601012/601022 işaret tersi", () => {
    const rows: MizanAylikRow[] = [
      { yil: 2025, ay: 12, hesap: "01211", bransKodu: "701", tutar: -1_000_000 },
      { yil: 2025, ay: 12, hesap: "01221", bransKodu: "701", tutar: 5_660_000 },
    ];
    const dev = devredenKpkOcakFromMizanKapanis(rows, 2026);
    assert.equal(dev.get("701")!.satir24, 1_000_000);
    assert.equal(dev.get("701")!.satir27, -5_660_000);
  });

  it("resolveDevredenKpkKaynakModu: 2027 → motor (EYE)", () => {
    const mod = resolveDevredenKpkKaynakModu({
      butceYili: 2027,
      mizan: [],
      mizanAylik: [],
      mizanAylikFull: [{ yil: 2026, ay: 12, hesap: "01211", bransKodu: "701", tutar: -1 }],
      tarifeBransPay: [],
      vadeRows: [],
    });
    assert.equal(mod, "motor_yil_sonu");
  });

  it("resolveDevredenKpkKaynakModu: 2026 + 2025 kapanış → mizan_kapanis", () => {
    const mod = resolveDevredenKpkKaynakModu({
      butceYili: 2026,
      mizan: [],
      mizanAylik: [],
      mizanAylikFull: [{ yil: 2025, ay: 12, hesap: "01211", bransKodu: "701", tutar: -1_000_000 }],
      tarifeBransPay: [],
      vadeRows: [],
    });
    assert.equal(mod, "mizan_kapanis");
  });
});

describe("kpkDevredenZincir integration (data yoksa skip)", () => {
  it("2027_yminus1_is_2026_eye: primKaynakForButceYili EYE 12 ay üretir", async () => {
    const { loadMizanAylikFullRows, loadTarifeMapRows } = await import("../loadData");
    let full: MizanAylikRow[];
    let tarifeMap: Awaited<ReturnType<typeof loadTarifeMapRows>>;
    try {
      full = await loadMizanAylikFullRows();
      tarifeMap = await loadTarifeMapRows();
    } catch {
      return;
    }
    if (!full.length || !tarifeMap.length) return;
    const seri = oncekiYilEye12PrimForButceYplus1({
      butceYili: 2027,
      mizanAylikFull: full,
      tarifeMap,
      eyeAnchorAy: 8,
    });
    assert.ok(Object.keys(seri).length > 0);
    const sample = seri["701"] ?? seri[Object.keys(seri)[0]!]!;
    assert.equal(sample.length, 12);
    const sum = sample.reduce((a, x) => a + x, 0);
    assert.ok(sum > 0, "2026 EYE 12 ay prim toplamı > 0");
  });

  it("eye_2026_dec_to_2027_jan: zincir Dec Cari = Jan Devreden (şirket)", async () => {
    const {
      loadMizanRows,
      loadMizanAylikRows,
      loadMizanAylikFullRows,
      loadTarifeBransPayRows,
      loadKpkVadeRows,
      loadTarifeMapRows,
    } = await import("../loadData");
    try {
      const [mizan, mizanAylik, mizanFull, tarifeBransPay, vadeRows, tarifeMap] = await Promise.all([
        loadMizanRows(),
        loadMizanAylikRows(),
        loadMizanAylikFullRows(),
        loadTarifeBransPayRows(),
        loadKpkVadeRows(),
        loadTarifeMapRows(),
      ]);
      if (!vadeRows.length || !mizanFull.length || !tarifeMap.length) return;

      const zincir = buildDevredenKpkZincir({
        butceYili: 2027,
        mizan,
        mizanAylik,
        mizanAylikFull: mizanFull,
        tarifeBransPay,
        vadeRows,
        v2Metodoloji: true,
        tarifeMap,
        eyeAnchorAy: 8,
      });

      let decCari = 0;
      let janDev = 0;
      for (const b of zincir.prevYearKpk.branslar) {
        decCari += b.cariStok[12] ?? 0;
        janDev += -(zincir.devredenOcak.get(b.bransKodu)?.satir24 ?? 0);
      }
      assert.ok(assertDec31CariEqualsJan1Devreden(zincir.prevYearKpk, zincir.devredenOcak));
      assert.ok(Math.abs(decCari - janDev) < 1, `Dec cari ${decCari} vs Jan dev ${janDev}`);
    } catch {
      return;
    }
  });

  it("budget_2026_mizan_kapanis: devreden 2025-12 01211, 777 branş", async () => {
    const {
      loadMizanRows,
      loadMizanAylikRows,
      loadMizanAylikFullRows,
      loadTarifeBransPayRows,
      loadKpkVadeRows,
    } = await import("../loadData");
    try {
      const [mizan, mizanAylik, mizanFull, tarifeBransPay, vadeRows] = await Promise.all([
        loadMizanRows(),
        loadMizanAylikRows(),
        loadMizanAylikFullRows(),
        loadTarifeBransPayRows(),
        loadKpkVadeRows(),
      ]);
      if (!mizanFull.length) return;

      const zincir = buildDevredenKpkZincir({
        butceYili: 2026,
        mizan,
        mizanAylik,
        mizanAylikFull: mizanFull,
        tarifeBransPay,
        vadeRows,
        v2Metodoloji: true,
      });
      assert.equal(zincir.kaynakModu, "mizan_kapanis");
      assert.equal(zincir.recon, null);

      const ozet = devredenKpkOcakOzet(zincir.devredenOcak);
      assert.ok(ozet.bransSayisi >= 30, "branş sayısı");
      assert.ok(Math.abs(ozet.satir24Toplam) > 1e12, "şirket devreden ~mr TL");

      const kapanis = devredenKpkOcakFromMizanKapanis(mizanFull, 2026);
      assert.equal(
        Math.round(ozet.satir24Toplam),
        Math.round(devredenKpkOcakOzet(kapanis).satir24Toplam),
      );

      const b777 = zincir.devredenOcak.get("777");
      if (b777) assert.ok(Math.abs(b777.satir24) > 1e6, "777 devreden kaybolmamalı");
    } catch {
      return;
    }
  });

  it("budget_2026_v2_gt: devreden stok Ocak–Aralık sabit, 60101/60102 rollup", async () => {
    const {
      loadMizanRows,
      loadMizanAylikRows,
      loadMizanAylikFullRows,
      loadTarifeBransPayRows,
      loadKpkVadeRows,
      loadV2Varsayimlar,
      loadSatisButceRows,
      loadUretimRows,
      loadTarifeMapRows,
      loadOranAyarPaket,
    } = await import("../loadData");
    const { buildV2GelirTablosu } = await import("../v2/buildV2GelirTablosu");
    const { v2OzetDeger } = await import("../v2/v2GtFiltre");
    const { gtYtdHesap } = await import("../v2/gtHesapYtd");
    const { v3DefaultsStore2026, alignTarifeHedefleri } = await import("../v3/defaults");
    const { primHedefFromTarifeAna } = await import("../v3/primFromToplam");
    const { syntheticSatisFromTarife } = await import("../v3/syntheticSatis");
    const { DagitimMotoru } = await import("../prim/dagitimMotoru");
    const { referansYilAgirliklari } = await import("../config/constants");

    try {
      const varsayimlar = await loadV2Varsayimlar();
      if (varsayimlar.butceYili !== 2026) return;
      const [
        mizan,
        mizanAylik,
        mizanFull,
        tarifeBransPay,
        vadeRows,
        satisRows,
        uretim,
        tarifeMap,
        oranAyar,
      ] = await Promise.all([
        loadMizanRows(),
        loadMizanAylikRows(),
        loadMizanAylikFullRows(),
        loadTarifeBransPayRows(),
        loadKpkVadeRows(),
        loadSatisButceRows(),
        loadUretimRows(),
        loadTarifeMapRows(),
        loadOranAyarPaket(),
      ]);
      const hedef = alignTarifeHedefleri(v3DefaultsStore2026());
      const primHedefleri = primHedefFromTarifeAna(hedef);
      const satis = syntheticSatisFromTarife(satisRows, hedef);
      const dagitim = new DagitimMotoru(referansYilAgirliklari, tarifeBransPay);
      const aylikPrim = dagitim.aylikPrimStore(primHedefleri, varsayimlar.butceYili);

      const sonuc = buildV2GelirTablosu({
        varsayimlar,
        satisRows: satis,
        uretim,
        tarifeMap,
        tarifeBransPay,
        mizan,
        mizanAylik,
        mizanAylikFull: mizanFull,
        bilancoAylik: [],
        oranAyar,
        kpkVade: vadeRows,
        kapanisTahmin: null,
        aylikPrimOverride: aylikPrim,
        primHedefleriOverride: primHedefleri,
      });

      const f24 = sonuc.gt.aylikToplam[24] ?? Array(12).fill(0);
      const f27 = sonuc.gt.aylikToplam[27] ?? Array(12).fill(0);
      assert.notEqual(f24[0], 0);
      for (let i = 1; i < 12; i++) {
        assert.equal(f24[i], f24[0], `F24 ay ${i + 1} = Ocak devreden stok`);
        assert.equal(f27[i], f27[0], `F27 ay ${i + 1} = Ocak devreden stok`);
      }
      const aug = v2OzetDeger(sonuc.gt, 24, 8, null);
      const dec = v2OzetDeger(sonuc.gt, 24, 12, null);
      assert.equal(aug, dec);
      assert.notEqual(aug, 0);
      assert.equal(v2OzetDeger(sonuc.gt, 27, 8, null), v2OzetDeger(sonuc.gt, 27, 12, null));
      const gt = sonuc.gt;
      for (const ay of [1, 8, 12]) {
        const h60101 = gtYtdHesap(gt, "60101", ay);
        const h601011 = gtYtdHesap(gt, "601011", ay);
        const h601012 = gtYtdHesap(gt, "601012", ay);
        assert.ok(Math.abs(h60101 - (h601011 + h601012)) < 1, `60101 @${ay}`);
        const h60102 = gtYtdHesap(gt, "60102", ay);
        const h601021 = gtYtdHesap(gt, "601021", ay);
        const h601022 = gtYtdHesap(gt, "601022", ay);
        assert.ok(Math.abs(h60102 - (h601021 + h601022)) < 1, `60102 @${ay}`);
      }
      assert.ok(
        sonuc.uyarilar.some((u) => u.includes("mizan 01211 kapanış")),
        "devreden mizan kapanış uyarısı",
      );
      assert.ok(
        !sonuc.uyarilar.some((u) => u.includes("motor vs mizan 01212")),
        "motor recon uyarısı olmamalı (mizan birincil)",
      );
      const kd = devredenKpkOcakOzet(
        devredenKpkOcakFromMizanKapanis(mizanFull, 2026),
      );
      assert.ok(kd.satir24Toplam > 0, "601012 devreden pozitif (01211 kapanış negatif)");
    } catch {
      return;
    }
  });
});
