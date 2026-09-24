import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MizanAylikRow, MizanRow } from "../types";
import {
  buildDevredenMuallakZincir,
  devredenMuallakOcakFromMizan,
} from "./muallakDevreden";

describe("devreden muallak zinciri", () => {
  it("kapanmış yılda cari 02211/02221 ters işaretle devreder", () => {
    const full: MizanAylikRow[] = [
      { yil: 2025, ay: 12, hesap: "02211", bransKodu: "701", tutar: -5_280 },
      { yil: 2025, ay: 12, hesap: "02221", bransKodu: "701", tutar: 2_190 },
      // Eski devreden satırlar kaynak olmamalı.
      { yil: 2025, ay: 12, hesap: "02212", bransKodu: "701", tutar: 3_669 },
      { yil: 2025, ay: 12, hesap: "02222", bransKodu: "701", tutar: -1_455 },
    ];
    assert.deepEqual(devredenMuallakOcakFromMizan(full, 2026).get("701"), {
      satir126: 5_280,
      satir147: -2_190,
    });
  });

  it("Aralık yoksa son gerçek prim ve yılsonu oranıyla EYE üretir", () => {
    const mizan: MizanRow[] = [
      { yil: 2025, hesap: "60001", bransKodu: "701", tutar: 1_000 },
      { yil: 2025, hesap: "611011", bransKodu: "701", tutar: -200 },
      { yil: 2025, hesap: "611021", bransKodu: "701", tutar: 100 },
    ];
    const full: MizanAylikRow[] = [
      { yil: 2026, ay: 8, hesap: "0111", bransKodu: "701", tutar: 800 },
    ];
    const sonuc = buildDevredenMuallakZincir({
      butceYili: 2027,
      mizan,
      mizanAylikFull: full,
      oranAyar: {},
    });
    assert.equal(sonuc.kaynakModu, "eye_yil_sonu");
    assert.equal(sonuc.eyeAnchorAy, 8);
    const dev = sonuc.devredenOcak.get("701")!;
    assert.ok(Math.abs(dev.satir126 - 240) < 0.01);
    assert.ok(Math.abs(dev.satir147 + 120) < 0.01);
  });
});
