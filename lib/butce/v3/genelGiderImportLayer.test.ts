/**
 * Genel gider import layer — H2 GT + YTD koruma.
 * node --import tsx --test lib/butce/v3/genelGiderImportLayer.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import { buildFaaliyetGiderSonuc } from "../gelir/faaliyetGiderGt";
import type { FaaliyetGiderRow, MizanRow } from "../types";
import {
  filterGenelGiderForecastRows,
  uygulaGenelGiderImportLayer,
} from "./genelGiderImportLayer";

function bosGt(): GelirTablosuSonuc {
  const ytdF190 = -100_000;
  const motorH2 = -50_000;
  return {
    butceYili: 2026,
    satirlar: [],
    branslar: [
      { bransKodu: "711", bransAdi: "T1", brutPrim: 0, degerler: { 190: ytdF190 + motorH2 } },
      { bransKodu: "712", bransAdi: "T2", brutPrim: 0, degerler: { 190: 0 } },
    ],
    toplam: { 190: ytdF190 + motorH2 },
    aylikToplam: {
      190: [
        -10_000, -10_000, -10_000, -10_000, -10_000, -10_000, -10_000, -10_000,
        motorH2, motorH2, motorH2, motorH2,
      ],
    },
    aylikBrans: {
      "711": {
        190: [
          -10_000, -10_000, -10_000, -10_000, -10_000, -10_000, -10_000, -10_000,
          motorH2, motorH2, motorH2, motorH2,
        ],
      },
      "712": { 190: Array(12).fill(0) },
    },
    uyarilar: [],
    eksikGirdiler: [],
  };
}

const mizanF368: MizanRow[] = [
  { yil: 2025, hesap: "61402", bransKodu: "711", tutar: -600 },
  { yil: 2025, hesap: "61402", bransKodu: "712", tutar: -400 },
];

describe("genelGiderImportLayer", () => {
  it("H2 aylık değer doğrudan importtan gelir (yıllık/12 değil)", () => {
    const rows: FaaliyetGiderRow[] = [
      { butceYili: 2026, hesap: "61402", altHesapKodu: "61402215649", ay: 9, tutar: 1_000_000 },
      { butceYili: 2026, hesap: "61402", altHesapKodu: "61402215678", ay: 9, tutar: 500_000 },
    ];
    const forecast = filterGenelGiderForecastRows(rows, 2026, 8);
    assert.equal(forecast.length, 2);
    assert.equal(forecast.reduce((s, r) => s + r.tutar, 0), 1_500_000);

    const gt = bosGt();
    const sonuc = uygulaGenelGiderImportLayer(gt, {
      butceYili: 2026,
      anchorAy: 8,
      importRows: rows,
      mizan: mizanF368,
    });
    assert.equal(sonuc.uygulandi, true);
    const eylulIdx = 8;
    const eylulToplam = gt.aylikToplam[190]![eylulIdx]!;
    assert.ok(Math.abs(eylulToplam + 1_500_000) < 1, `eylül=${eylulToplam}`);
  });

  it("YTD actual ayları import tarafından ezilmez", () => {
    const gt = bosGt();
    const ocakOnce = gt.aylikToplam[190]![0]!;
    const rows: FaaliyetGiderRow[] = [
      { butceYili: 2026, hesap: "61402", altHesapKodu: "61402215649", ay: 1, tutar: 9_999_999 },
      { butceYili: 2026, hesap: "61402", altHesapKodu: "61402215649", ay: 9, tutar: 100 },
    ];
    uygulaGenelGiderImportLayer(gt, {
      butceYili: 2026,
      anchorAy: 8,
      importRows: rows,
      mizan: mizanF368,
    });
    assert.equal(gt.aylikToplam[190]![0], ocakOnce);
    assert.ok(Math.abs(gt.aylikToplam[190]![8]! + 100) < 1);
  });

  it("F190–194 ana hesap toplamları doğru (61403 → F191)", () => {
    const rows: FaaliyetGiderRow[] = [
      { butceYili: 2026, hesap: "61403", altHesapKodu: "61403123456", ay: 10, tutar: 200_000 },
    ];
    const fg = buildFaaliyetGiderSonuc({
      butceYili: 2026,
      rows,
      mizan: mizanF368,
      aktifBransKodlari: ["711", "712"],
      v2Metodoloji: true,
    });
    assert.ok(fg);
    const f191 = fg!.reduce((s, b) => s + (b.gtYillik[191] ?? 0), 0);
    assert.ok(Math.abs(f191 + 200_000) < 1);
  });

  it("F368 branş dağılımı korunur", () => {
    const rows: FaaliyetGiderRow[] = [
      { butceYili: 2026, hesap: "61402", altHesapKodu: "61402215649", ay: 9, tutar: 1000 },
    ];
    const fg = buildFaaliyetGiderSonuc({
      butceYili: 2026,
      rows,
      mizan: mizanF368,
      aktifBransKodlari: ["711", "712"],
    });
    const g711 = Math.abs(fg!.find((b) => b.bransKodu === "711")!.gtYillik[190] ?? 0);
    const g712 = Math.abs(fg!.find((b) => b.bransKodu === "712")!.gtYillik[190] ?? 0);
    assert.ok(Math.abs(g711 - 600) < 0.01);
    assert.ok(Math.abs(g712 - 400) < 0.01);
  });

  it("empty import mevcut GT davranışını bozmaz", () => {
    const gt = bosGt();
    const before = [...gt.aylikToplam[190]!];
    const sonuc = uygulaGenelGiderImportLayer(gt, {
      butceYili: 2026,
      anchorAy: 8,
      importRows: [],
      mizan: mizanF368,
    });
    assert.equal(sonuc.uygulandi, false);
    assert.deepEqual(gt.aylikToplam[190], before);
  });
});
