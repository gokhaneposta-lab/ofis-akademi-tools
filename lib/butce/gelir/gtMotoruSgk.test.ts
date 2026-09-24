import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SGK_AKTARILAN_PRIM_ORAN } from "../config/constants";
import { GelirTablosuMotoru } from "./gtMotoru";

describe("V2 Trafik SGK hesapları", () => {
  const motor = new GelirTablosuMotoru([], 2026);

  it("60003 yalnızca 715 için brüt primin eksi %8'idir", () => {
    assert.equal(motor.hesaplaBrans("715", 1_000, 0).get(20), -1_000 * SGK_AKTARILAN_PRIM_ORAN);
    for (const brans of ["701", "703", "714"]) {
      assert.equal(motor.hesaplaBrans(brans, 1_000, 0).get(20) ?? 0, 0, brans);
    }
  });

  it("net yazılan prim 60003 dahil doğru toplanır", () => {
    const gt = motor.hesaplaBrans("715", 100, 0);
    assert.equal(gt.get(10), (gt.get(11) ?? 0) + (gt.get(19) ?? 0) + (gt.get(20) ?? 0));
  });
});
