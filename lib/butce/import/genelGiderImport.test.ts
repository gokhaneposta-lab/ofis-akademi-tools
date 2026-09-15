/**
 * Genel gider import core tests.
 * node --import tsx --test lib/butce/import/genelGiderImport.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseGenelGiderFromRawRows,
  resolveAnaHesapFromAlt,
} from "./genelGiderImportCore";
import { buildGenelGiderImportOzet } from "../v3/genelGiderSummary";

describe("genelGiderImportCore", () => {
  it("61402 alt hesapları doğru ana hesaba gruplanır", () => {
    const raw = [
      {
        "Alt Hesap Kodu": "61402215649",
        Ay: 9,
        Tutar: 40_000_000,
        Açıklama: "Personel maaşı",
      },
      {
        "Alt Hesap Kodu": "61402215678",
        Ay: 9,
        Tutar: 5_000_000,
        Açıklama: "Personel yemek",
      },
    ];
    const r = parseGenelGiderFromRawRows(raw, 2026);
    assert.equal(r.errors.length, 0);
    assert.equal(r.rows.length, 2);
    assert.ok(r.rows.every((x) => x.hesap === "61402"));
    assert.equal(r.rows[0]!.altHesapKodu, "61402215649");
    assert.equal(r.rows[1]!.altHesapKodu, "61402215678");

    const ozet = buildGenelGiderImportOzet(r.rows, 2026);
    const ana = ozet.anaHesaplar.find((a) => a.anaHesap === "61402")!;
    assert.equal(ana.yillik, 45_000_000);
    assert.equal(ana.altHesaplar.length, 2);
  });

  it("61402 ve 61403 birbirine karışmaz", () => {
    const raw = [
      { "Alt Hesap Kodu": "61402215649", Ay: 10, Tutar: 100 },
      { "Alt Hesap Kodu": "61403123456", Ay: 10, Tutar: 200 },
    ];
    const r = parseGenelGiderFromRawRows(raw, 2026);
    assert.equal(r.errors.length, 0);
    const ozet = buildGenelGiderImportOzet(r.rows, 2026);
    assert.equal(ozet.anaHesaplar.length, 2);
    assert.equal(ozet.anaHesaplar.find((a) => a.anaHesap === "61402")!.yillik, 100);
    assert.equal(ozet.anaHesaplar.find((a) => a.anaHesap === "61403")!.yillik, 200);
  });

  it("61407 kapsam dışı satır atlanır (uyarı)", () => {
    // Karışık dosya: geçerli 61402 + kapsam dışı 61407 (gerçek Excel import davranışı).
    const raw = [
      { "Alt Hesap Kodu": "61402215649", Ay: 9, Tutar: 100 },
      { "Alt Hesap Kodu": "61407123456", Ay: 1, Tutar: 1000 },
    ];
    const r = parseGenelGiderFromRawRows(raw, 2026);
    assert.equal(r.errors.length, 0);
    assert.ok(r.warnings.some((e) => e.kod === "OUT_OF_SCOPE" && e.mesaj.includes("61407")));
    assert.equal(r.rows.length, 1);
    assert.equal(r.rows[0]!.hesap, "61402");
    assert.equal(r.rows[0]!.altHesapKodu, "61402215649");
  });

  it("duplicate yakalanır", () => {
    const raw = [
      { "Alt Hesap Kodu": "61402215649", Ay: 1, Tutar: 100 },
      { "Alt Hesap Kodu": "61402215649", Ay: 1, Tutar: 200 },
    ];
    const r = parseGenelGiderFromRawRows(raw, 2026);
    assert.ok(r.errors.some((e) => e.kod === "DUPLICATE"));
    assert.equal(r.rows.length, 0);
  });

  it("2027 butceYili satırları ayrı parse edilir", () => {
    const raw = [
      { "Bütçe Yılı": 2027, "Alt Hesap Kodu": "61402215649", Ay: 1, Tutar: 500 },
    ];
    const r = parseGenelGiderFromRawRows(raw, 2027);
    assert.equal(r.errors.length, 0);
    assert.equal(r.rows[0]!.butceYili, 2027);
    assert.equal(resolveAnaHesapFromAlt("61402215649"), "61402");
  });

  it("legacy 5 haneli kod kabul edilir", () => {
    const raw = [{ Hesap: "61402", Ay: 3, Tutar: 1000 }];
    const r = parseGenelGiderFromRawRows(raw, 2026);
    assert.equal(r.errors.length, 0);
    assert.equal(r.rows[0]!.hesap, "61402");
    assert.equal(r.rows[0]!.altHesapKodu, "61402");
  });
});
