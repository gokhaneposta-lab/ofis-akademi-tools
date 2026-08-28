/**
 * VÖK bileşen kimliği golden smoke (read-only).
 * safiTeknik + genelGider + aktarim603 + maliNet ≈ vok
 *
 *   npx --yes tsx scripts/tsb-golden-smoke.ts
 *   npx --yes tsx scripts/tsb-golden-smoke.ts 2026-1 2025-4
 */

import {
  buildSektorGorunumuDonem,
  type SektorGorunumuPool,
  type SektorGorunumuSnapshot,
} from "../lib/tsbSektorGorunumu";
import {
  latestDonemFromList,
  readGelirDonem,
  readGelirIndex,
  readMeta,
} from "./lib/tsb-readonly-helpers";

type PoolCheck = "HD" | "HAYAT_EMEKLILIK" | "SEKTOR";

const DEFAULT_POOLS: PoolCheck[] = ["HD", "HAYAT_EMEKLILIK", "SEKTOR"];

function parseDonemArgs(argv: string[]): string[] {
  const fromCli = argv.filter((a) => /^\d{4}-\d$/.test(a));
  if (fromCli.length > 0) return fromCli;
  const meta = readMeta();
  const index = readGelirIndex();
  const latest = meta?.sonFinansalDonem ?? latestDonemFromList(index);
  const defaults = ["2026-1", latest].filter((d, i, arr) => d && arr.indexOf(d) === i);
  return defaults.length > 0 ? defaults : ["2026-1"];
}

function toleranceFor(vok: number): number {
  return Math.max(0.05, Math.abs(vok) * 1e-8);
}

function checkPool(
  donem: string,
  pool: PoolCheck,
  snap: SektorGorunumuSnapshot,
): { pass: boolean; detail: string } {
  const sum =
    snap.safiTeknik + snap.genelGider + snap.aktarim603 + snap.maliNet;
  const diff = sum - snap.vok;
  const tol = toleranceFor(snap.vok);
  const pass = Math.abs(diff) <= tol;
  const fmt = (n: number) =>
    n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
  const detail = `${donem} ${pool}: bileşen=${fmt(sum)} vok=${fmt(snap.vok)} fark=${fmt(diff)} (tol±${fmt(tol)})`;
  return { pass, detail };
}

function main() {
  const donemler = parseDonemArgs(process.argv.slice(2));
  let failed = 0;

  console.log(`TSB golden smoke — VÖK bileşen kimliği (${donemler.join(", ")})`);
  console.log("");

  for (const donem of donemler) {
    const rows = readGelirDonem(donem);
    if (rows.length === 0) {
      console.log(`FAIL ${donem}: gelir-tidy/${donem}.json yok veya boş`);
      failed += 1;
      continue;
    }
    const paket = buildSektorGorunumuDonem(rows, donem);
    for (const pool of DEFAULT_POOLS) {
      const snap = paket[pool as SektorGorunumuPool];
      const { pass, detail } = checkPool(donem, pool, snap);
      console.log(`${pass ? "PASS" : "FAIL"} ${detail}`);
      if (!pass) failed += 1;
    }
  }

  console.log("");
  if (failed > 0) {
    console.error(`Sonuç: ${failed} kontrol başarısız`);
    process.exit(1);
  }
  console.log("Sonuç: tüm kontroller geçti");
}

main();
