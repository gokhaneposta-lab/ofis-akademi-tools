/**
 * 2026 Estimated YE — versioned JSON snapshot (eye-v1).
 */
import { createHash } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import { v2HesapAgacTumSatirlar } from "../v2/v2GtHesapAgac";
import { V2_SENTETIK, V2_SENTETIK_FORMULLER } from "../v2/v2SentetikFormul";
import { GT_YAPRAK_ROLLUP_FORMUL } from "./gtUstRollup";
import type { EyeQuality, EyeSnapshotV1, V3VarsayimlarStore } from "./types";

const YAPRAK_SATIRLAR = new Set([
  11, 19, 20, 23, 24, 26, 27, 29, 30, 33, 34, 36, 37,
  96, 105, 116, 126, 137, 147, 158, 161, 177, 178, 189,
  190, 191, 192, 193, 194, 200, 201, 202, 38,
]);

function rollupParents(): Set<number> {
  return new Set(GT_YAPRAK_ROLLUP_FORMUL.map(([h]) => h));
}

function yillikSer(ser: number[] | undefined): number {
  return ser?.reduce((a, x) => a + x, 0) ?? 0;
}

function buildOranGirdisi(gt: GelirTablosuSonuc): Record<string, number> {
  return {
    "60001": gt.toplam[11] ?? 0,
    "60101": gt.toplam[22] ?? 0,
    "60201": gt.toplam[32] ?? 0,
    "61001": gt.toplam[96] ?? 0,
    "603": gt.toplam[38] ?? 0,
    "61101": gt.toplam[115] ?? 0,
  };
}

export function buildEyeSnapshotV1(opts: {
  gt: GelirTablosuSonuc;
  butceYili: number;
  kesimAy: number;
  kesimKaynak: "auto" | "manual";
  maxMizanAy: number | null;
  varsayimlar: V3VarsayimlarStore;
  quality: EyeQuality;
}): EyeSnapshotV1 {
  const { gt, butceYili, kesimAy, quality } = opts;
  const rollupSet = rollupParents();
  const agacSatirlar = new Set(v2HesapAgacTumSatirlar());

  const yaprakGT: EyeSnapshotV1["yaprakGT"] = {};
  const rollupGT: EyeSnapshotV1["rollupGT"] = {};
  const sentetik: EyeSnapshotV1["sentetik"] = {};

  for (const b of gt.branslar) {
    const ab = gt.aylikBrans[b.bransKodu] ?? {};
    const yaprak: Record<string, number[]> = {};
    const rollup: Record<string, number[]> = {};

    for (const [satirStr, ser] of Object.entries(ab)) {
      const satir = Number(satirStr);
      if (!agacSatirlar.has(satir) && !YAPRAK_SATIRLAR.has(satir) && !rollupSet.has(satir)) continue;
      const key = String(satir);
      if (rollupSet.has(satir)) rollup[key] = [...(ser ?? [])];
      else if (YAPRAK_SATIRLAR.has(satir) || agacSatirlar.has(satir)) yaprak[key] = [...(ser ?? [])];
    }
    if (Object.keys(yaprak).length) yaprakGT[b.bransKodu] = yaprak;
    if (Object.keys(rollup).length) rollupGT[b.bransKodu] = rollup;
  }

  const sirketRollup: Record<string, number[]> = {};
  for (const [satirStr, ser] of Object.entries(gt.aylikToplam)) {
    const satir = Number(satirStr);
    if (rollupSet.has(satir)) sirketRollup[String(satir)] = [...(ser ?? [])];
  }

  for (const [hedef, formul] of Object.entries(V2_SENTETIK_FORMULLER)) {
    const satir = Number(hedef);
    sentetik[String(satir)] = gt.aylikToplam[satir] ?? Array(12).fill(0);
  }
  sentetik[String(V2_SENTETIK.teknikGelirSafi)] = gt.aylikToplam[V2_SENTETIK.teknikGelirSafi] ?? [];
  sentetik[String(V2_SENTETIK.teknikGiderSafi)] = gt.aylikToplam[V2_SENTETIK.teknikGiderSafi] ?? [];
  sentetik[String(V2_SENTETIK.safiTkz)] = gt.aylikToplam[V2_SENTETIK.safiTkz] ?? [];
  sentetik[String(V2_SENTETIK.tkz)] = gt.aylikToplam[V2_SENTETIK.tkz] ?? [];

  const assumptionsPayload = JSON.stringify({
    tarifeHedefleri: opts.varsayimlar.tarifeHedefleri ?? {},
    aylikGetiriOrani: opts.varsayimlar.aylikGetiriOrani,
    faaliyetGiderButce: opts.varsayimlar.faaliyetGiderButce,
  });

  return {
    meta: {
      schemaVersion: "eye-v1",
      butceYili,
      kesimAy,
      kesimKaynak: opts.kesimKaynak,
      maxMizanAy: opts.maxMizanAy,
      uretimTarihi: new Date().toISOString(),
      forecastMethodVersion: "eye-v1",
    },
    assumptions: {
      tarifeHedefleri: opts.varsayimlar.tarifeHedefleri ?? {},
      aylikGetiriOrani: opts.varsayimlar.aylikGetiriOrani,
      faaliyetGiderButce: opts.varsayimlar.faaliyetGiderButce,
      varsayimHash: createHash("sha256").update(assumptionsPayload).digest("hex").slice(0, 16),
    },
    branslar: gt.branslar.map((b) => b.bransKodu),
    sirket: {
      rollupGT: sirketRollup,
      sentetik,
      yillik: Object.fromEntries(
        Object.entries(gt.toplam).map(([k, v]) => [k, v]),
      ),
    },
    yaprakGT,
    rollupGT,
    sentetik,
    oranGirdisi: {
      "2026EyeYillik": buildOranGirdisi(gt),
    },
    quality,
    hedef2027: null,
  };
}

export function writeEyeSnapshotFile(
  snapshot: EyeSnapshotV1,
  outDir = "data/butce/out",
): string {
  mkdirSync(outDir, { recursive: true });
  const fname = `${snapshot.meta.butceYili}-EYE-${snapshot.meta.kesimAy}-v1.json`;
  const path = join(outDir, fname);
  writeFileSync(path, JSON.stringify(snapshot, null, 2), "utf8");
  return path;
}

/** Snapshot yıllık GT satır toplamı (branş birleşik). */
export function eyeYillikSatir(snapshot: EyeSnapshotV1, satir: number): number {
  let t = 0;
  for (const bm of Object.values(snapshot.yaprakGT)) {
    const ser = bm[String(satir)];
    if (ser) t += yillikSer(ser);
  }
  for (const bm of Object.values(snapshot.rollupGT)) {
    const ser = bm[String(satir)];
    if (ser) t += yillikSer(ser);
  }
  return t;
}
