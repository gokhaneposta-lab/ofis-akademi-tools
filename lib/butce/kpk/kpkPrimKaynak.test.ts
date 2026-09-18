/**

 * KPK prim kaynağı — Faz 1 senaryo testleri.

 * node --import tsx --test lib/butce/kpk/kpkPrimKaynak.test.ts

 */

import { describe, it } from "node:test";

import assert from "node:assert/strict";

import type { MizanAylikRow } from "../types";

import { buildKpkPrimGecmisi } from "./kpkPrimGecmisi";

import { kpkTutari } from "./kpkTarih";

import {

  buildEyeCariPrimSerisi,

  cariPrimFromAylikPrim,

  resolveKpkPrimGirdisi,

} from "./kpkPrimKaynak";

import { buildOncekiYilPrimSerisi } from "./oncekiYilPrimTahmin";

import { resolveEyeForecastPrimMotor } from "../eye/resolveEyeForecastPrimMotor";



function mizanRow(yil: number, ay: number, brans: string, kumul: number): MizanAylikRow {

  return { yil, ay, hesap: "0111", bransKodu: brans, tutar: kumul };

}



function h2Seri701(anchor: number, h2Values: number[]): Record<string, number[]> {

  const ser = Array(12).fill(0);

  for (let i = 0; i < h2Values.length; i++) ser[anchor + i] = h2Values[i]!;

  return { "701": ser };

}



describe("kpkPrimKaynak", () => {

  it("BUTCE: 12 ay budget prim kullanılır", () => {

    const budget = {

      butceYili: 2026,

      referansYil: 2025,

      kaynak: "test",

      genelOranlar: Array(12).fill(1 / 12),

      guncellemeIso: "",

      satirlar: [{ bransKodu: "701", aylar: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], toplam: 78 }],

    };

    const r = resolveKpkPrimGirdisi({

      butceYili: 2026,

      aylikPrim: budget,

      primKaynak: { mod: "butce" },

    });

    assert.equal(r.mod, "butce");

    assert.deepEqual(r.cariPrim["701"], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

  });



  it("EYE anchor=8: Oca-Ağu mizan + Eyl-Ara motor forecast", () => {

    const full: MizanAylikRow[] = [];

    let k2026 = 0;

    for (let m = 1; m <= 8; m++) {

      k2026 += 100;

      full.push(mizanRow(2026, m, "701", k2026));

    }

    const h2 = h2Seri701(8, [110, 120, 130, 140]);

    const eye = buildEyeCariPrimSerisi({

      butceYili: 2026,

      anchorAy: 8,

      mizanAylikFull: full,

      bransKodlari: ["701"],

      h2ForecastPrim: h2,

    });

    assert.equal(eye.h2Blocked, false);

    assert.equal(eye.seri["701"]![0], 100);

    assert.equal(eye.seri["701"]![7], 100);

    assert.equal(eye.seri["701"]![8], 110);

    assert.equal(eye.seri["701"]![11], 140);

  });



  it("EYE anchor=8: motor yok → H2 sıfır, blocked", () => {

    const full: MizanAylikRow[] = [];

    let k2026 = 0;

    for (let m = 1; m <= 8; m++) {

      k2026 += 100;

      full.push(mizanRow(2026, m, "701", k2026));

    }

    const eye = buildEyeCariPrimSerisi({

      butceYili: 2026,

      anchorAy: 8,

      mizanAylikFull: full,

      bransKodlari: ["701"],

    });

    assert.equal(eye.h2Blocked, true);

    assert.equal(eye.seri["701"]![8], 0);

    assert.equal(eye.seri["701"]![11], 0);

    const motor = resolveEyeForecastPrimMotor({
      butceYili: 2026,
      anchorAy: 8,
      mizanAylikFull: full,
      tarifeMap: [],
      bransKodlari: ["701"],
    });

    assert.equal(motor.durum, "blocked");

  });



  it("EYE anchor=11: Oca-Kas actual + Ara forecast", () => {

    const full: MizanAylikRow[] = [];

    let k = 0;

    for (let m = 1; m <= 11; m++) {

      k += 50;

      full.push(mizanRow(2026, m, "701", k));

    }

    const h2 = h2Seri701(11, [99]);

    const eye = buildEyeCariPrimSerisi({

      butceYili: 2026,

      anchorAy: 11,

      mizanAylikFull: full,

      bransKodlari: ["701"],

      h2ForecastPrim: h2,

    });

    for (let i = 0; i < 11; i++) assert.equal(eye.seri["701"]![i], 50);

    assert.equal(eye.seri["701"]![11], 99);

  });



  it("EYE anchor=12: 12 ay actual", () => {

    const full: MizanAylikRow[] = [];

    let k = 0;

    for (let m = 1; m <= 12; m++) {

      k += 10;

      full.push(mizanRow(2026, m, "701", k));

    }

    const eye = buildEyeCariPrimSerisi({

      butceYili: 2026,

      anchorAy: 12,

      mizanAylikFull: full,

      bransKodlari: ["701"],

    });

    assert.deepEqual(eye.seri["701"], Array(12).fill(10));

  });



  it("BUTCE_YPLUS1: 2027 cari budget + 2026 Y-1 EYE override", () => {

    const full: MizanAylikRow[] = [];

    let k26 = 0;

    for (let m = 1; m <= 11; m++) {

      k26 += 100;

      full.push(mizanRow(2026, m, "701", k26));

    }

    const eye2026 = buildEyeCariPrimSerisi({

      butceYili: 2026,

      anchorAy: 11,

      mizanAylikFull: full,

      bransKodlari: ["701"],

      h2ForecastPrim: h2Seri701(11, [480]),

    }).seri;

    const budget2027 = {

      butceYili: 2027,

      referansYil: 2026,

      kaynak: "test",

      genelOranlar: Array(12).fill(1 / 12),

      guncellemeIso: "",

      satirlar: [{ bransKodu: "701", aylar: Array(12).fill(200), toplam: 2400 }],

    };

    const r = resolveKpkPrimGirdisi({

      butceYili: 2027,

      aylikPrim: budget2027,

      primKaynak: { mod: "butce_yplus1", oncekiYilEyePrim: eye2026 },

      mizanAylikFull: full,

    });

    assert.deepEqual(r.cariPrim["701"], Array(12).fill(200));

    assert.deepEqual(r.oncekiYilPrimOverride!["701"], eye2026["701"]);



    const onceki = buildOncekiYilPrimSerisi({

      butceYili: 2027,

      mizanAylik: full,

      tarifeBransPay: [],

    }).bransAylik;

    const gecmisiBudgetPath = buildKpkPrimGecmisi({

      butceYili: 2027,

      oncekiYilPrim: onceki,

      cariPrim: r.cariPrim,

      mizanAylikFull: full,

    });

    const gecmisiEyePath = buildKpkPrimGecmisi({

      butceYili: 2027,

      oncekiYilPrim: onceki,

      cariPrim: r.cariPrim,

      mizanAylikFull: full,

      oncekiYilPrimOverride: r.oncekiYilPrimOverride,

    });

    const y2026BudgetPick = gecmisiBudgetPath["701"]!.filter((x) => x.yil === 2026);

    const y2026Eye = gecmisiEyePath["701"]!.filter((x) => x.yil === 2026);

    assert.ok(y2026Eye.length >= 12, "EYE Y-1 tam 12 cohort");

    assert.notDeepEqual(

      y2026BudgetPick.map((x) => x.prim),

      y2026Eye.map((x) => x.prim),

      "kısmi mizan pickSeri ≠ EYE 12 ay",

    );

    assert.equal(y2026Eye[11]!.ay, 12);

    assert.equal(y2026Eye[11]!.prim, 480);

  });



  it("rollingStok deterministik", () => {

    const prim = [{ yil: 2026, ay: 6, prim: 1_000_000 }];

    const vade = 365;

    const a = kpkTutari(1_000_000, 2026, 6, vade, 2026, 8);

    const b = kpkTutari(1_000_000, 2026, 6, vade, 2026, 8);

    assert.equal(a, b);

    assert.ok(a > 0);

  });

});


