/** Probe: 2026 aylık 0111 kapsamı. npx tsx scripts/butce-v3-probe-ytd.ts */
import { loadMizanAylikFullRows } from "../lib/butce/loadData";

async function main() {
  const rows = await loadMizanAylikFullRows();
  const byAy = new Map<number, number>();
  for (const r of rows) {
    if (r.yil !== 2026 || String(r.hesap) !== "0111") continue;
    byAy.set(r.ay, (byAy.get(r.ay) ?? 0) + Math.abs(r.tutar));
  }
  console.log("2026 0111 by month:");
  for (let a = 1; a <= 12; a++) {
    const t = byAy.get(a) ?? 0;
    console.log(`  ${a}: ${t > 0 ? Math.round(t).toLocaleString("tr-TR") : "—"}`);
  }
  const maxAy = [...byAy.entries()].filter(([, v]) => v > 0).map(([a]) => a);
  console.log("available months:", maxAy.sort((a, b) => a - b).join(",") || "none");
  console.log("max:", maxAy.length ? Math.max(...maxAy) : null);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
