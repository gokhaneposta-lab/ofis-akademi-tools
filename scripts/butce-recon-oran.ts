/**
 * Reconciliation: GT köprüsüyle sentezlenen mizan ile orijinal (BUTCE_MAP) mizandan
 * hesaplanan teknik oranları kalem×branş bazında karşılaştırır.
 * Referans: data/butce/private/mizan-tidy.legacy.json (orijinal upload yedeği).
 * Kullanım: npx tsx scripts/butce-recon-oran.ts
 */
import { existsSync, readFileSync } from "fs";
import { MizanOranServisi, oranKalemListesi } from "../lib/butce/oran/mizanOranlar";
import { reconstructMizanFromGt } from "./butce-gt-bridge.mjs";

const GT = process.argv[2] ?? "C:/Users/g.yildirim/Desktop/Aylık GT ve Bilanço.xlsx";
const LEGACY = "data/butce/private/mizan-tidy.legacy.json";

if (!existsSync(LEGACY)) {
  console.error(`Referans yok: ${LEGACY} (orijinal mizan yedeği gerekli)`);
  process.exit(1);
}

const orig = JSON.parse(readFileSync(LEGACY, "utf8"));
const { rows: recon, yillar } = reconstructMizanFromGt(GT);
console.log("recon yıllar:", yillar.join(","), "| satır:", recon.length);

const butceYili = 2027;
const A = new MizanOranServisi(orig, butceYili);
const B = new MizanOranServisi(recon, butceYili);

const worst: { kod: string; maxd: number; where: string; oa: number; ob: number }[] = [];
for (const { kod } of oranKalemListesi()) {
  let ta, tb;
  try {
    ta = A.tumBranslarTablosu(kod);
    tb = B.tumBranslarTablosu(kod);
  } catch {
    continue;
  }
  const mb = new Map(tb.map((r) => [r.bransKodu, r.oran]));
  let maxd = 0, where = "", oa = 0, ob = 0;
  for (const r of ta) {
    const b = mb.get(r.bransKodu) ?? 0;
    const d = Math.abs(r.oran - b);
    if (d > maxd) { maxd = d; where = r.bransKodu; oa = r.oran; ob = b; }
  }
  worst.push({ kod, maxd, where, oa, ob });
}
worst.sort((a, b) => b.maxd - a.maxd);
console.log("\nmaxΔoran  kalem        @branş   (orijinal -> recon)");
for (const w of worst) {
  console.log(
    w.maxd.toFixed(6).padStart(10),
    w.kod.padEnd(12),
    w.where.padEnd(6),
    `${w.oa.toFixed(4)} -> ${w.ob.toFixed(4)}`,
  );
}
const maxAll = worst[0]?.maxd ?? 0;
console.log(`\nGenel max Δoran: ${maxAll.toFixed(6)} ${maxAll < 0.01 ? "✓ (birebir kabul)" : "⚠ incele"}`);
