/**
 * Rolling KPK vs mizan — gerçek prim
 * npx tsx scripts/_kpk-rolling-validate.ts
 */
import { readFileSync } from "fs";
import { buildKpkSonuc } from "../lib/butce/kpk/buildKpkSonuc";
import { gercekPrimFromMizan } from "../lib/butce/v2/gercekPrimFromMizan";
import {
  loadKpkVadeRows,
  loadMizanAylikFullRows,
  loadMizanAylikRows,
  loadMizanRows,
  loadOranAyarPaket,
  loadTarifeBransPayRows,
} from "../lib/butce/loadData";
import { normalizeBransKodu } from "../lib/butce/textUtils";
import type { MizanAylikRow } from "../lib/butce/types";

const BUTCE = 2026;

function mizanF23YtdExact(full: MizanAylikRow[], brans: string, ay: number): number {
  const ser = Array(12).fill(0);
  for (const r of full) {
    if (Number(r.yil) !== BUTCE) continue;
    if (normalizeBransKodu(r.bransKodu) !== brans) continue;
    if (String(r.hesap) !== "01211") continue;
    const a = Number(r.ay);
    if (a >= 1 && a <= 12) ser[a - 1] += Number(r.tutar) || 0;
  }
  return ser[ay - 1] ?? 0;
}

async function main() {
  const full = JSON.parse(
    readFileSync("data/butce/private/mizan-aylik-full.json", "utf8"),
  ) as MizanAylikRow[];

  const [mizan, mizanAylik, mizanFull, vade, oranPaket, tarifePay] = await Promise.all([
    loadMizanRows(),
    loadMizanAylikRows(),
    loadMizanAylikFullRows(),
    loadKpkVadeRows(),
    loadOranAyarPaket(),
    loadTarifeBransPayRows(),
  ]);

  const prim = gercekPrimFromMizan(mizanFull, BUTCE);
  const kpk = buildKpkSonuc({
    butceYili: BUTCE,
    mizan,
    mizanAylik,
    mizanAylikFull: mizanFull,
    tarifeBransPay: tarifePay,
    vadeRows: vade,
    aylikPrim: prim.aylikPrim,
    oranAyar: oranPaket.ayarlar,
    v2Metodoloji: true,
  });

  for (const anchor of [3, 7]) {
    console.log(`\n=== Mart=${anchor === 3} Temmuz=${anchor === 7} — rolling F23 vs mizan (exact 01211 kumul YTD) ===`);
    const rows: Array<{ brans: string; v2: number; mz: number; gap: number; pct: number | null }> = [];
    let tv2 = 0;
    let tmz = 0;
    for (const b of kpk.branslar) {
      const f23ytd = b.gtAylik[23]![anchor - 1] ?? 0;
      const mz = mizanF23YtdExact(full, b.bransKodu, anchor);
      if (Math.abs(mz) > 1e5 || Math.abs(f23ytd) > 1e5) {
        rows.push({
          brans: b.bransKodu,
          v2: f23ytd,
          mz,
          gap: mz - f23ytd,
          pct: mz ? (100 * (mz - f23ytd)) / Math.abs(mz) : null,
        });
        tv2 += f23ytd;
        tmz += mz;
      }
    }
    rows.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
    for (const r of rows.slice(0, 8)) {
      console.log(
        `${r.brans} V2=${(r.v2 / 1e6).toFixed(1)} mn mizan=${(r.mz / 1e6).toFixed(1)} mn gap=${(r.gap / 1e6).toFixed(1)} mn ${r.pct?.toFixed(0) ?? "-"}%`,
      );
    }
    console.log(
      `TOPLAM: V2=${(tv2 / 1e6).toFixed(1)} mn mizan=${(tmz / 1e6).toFixed(1)} mn sapma=${(((tmz - tv2) / Math.abs(tmz)) * 100).toFixed(1)}%`,
    );

    for (const brans of ["717", "715"]) {
      const b = kpk.branslar.find((x) => x.bransKodu === brans);
      if (!b) continue;
      const v2 = b.gtAylik[23]![anchor - 1] ?? 0;
      const mz = mizanF23YtdExact(full, brans, anchor);
      const st0 = b.cariStok[0] ?? 0;
      const stN = b.cariStok[anchor] ?? 0;
      console.log(
        `  ${brans}: stok[0]=${(st0 / 1e6).toFixed(1)} stok[${anchor}]=${(stN / 1e6).toFixed(1)} F23ytd=${(v2 / 1e6).toFixed(1)} (st0-stN=${((st0 - stN) / 1e6).toFixed(1)}) mizanYTD=${(mz / 1e6).toFixed(1)} mn`,
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
