import { readFileSync } from "fs";

type Row = { yil: number; ay: number; hesap: string; bransKodu: string; tutar: number };

const full = JSON.parse(readFileSync("data/butce/private/mizan-aylik-full.json", "utf8")) as Row[];
const tl = (n: number) => Math.round(n).toLocaleString("tr-TR");

function is0258(h: string) {
  return h === "0258" || h.startsWith("0258");
}

// Ay 7 kümülatif — branş × hesap
const ay7 = new Map<string, number>();
for (const r of full) {
  if (r.yil !== 2026 || r.ay !== 7) continue;
  const h = String(r.hesap);
  if (!is0258(h)) continue;
  const k = `${r.bransKodu}|${h}`;
  ay7.set(k, (ay7.get(k) ?? 0) + Number(r.tutar));
}

console.log("=== mizan-aylik-full: GT 0258*, ay=7 kümülatif ===");
let kumulTop = 0;
const sorted = [...ay7.entries()].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
for (const [k, v] of sorted) {
  kumulTop += v;
  console.log(`  ${k.padEnd(16)} ${tl(v).padStart(16)}`);
}
console.log(`  TOPLAM (kümülatif Temmuz): ${tl(kumulTop)}`);

// Yaprak + incremental YTD (mevcut extract mantığı)
const kodSet = new Set(full.filter((r) => r.yil === 2026).map((r) => String(r.hesap)));
const leaves = new Set<string>();
for (const k of kodSet) {
  if (![...kodSet].some((o) => o !== k && o.startsWith(k))) leaves.add(k);
}

const kumulByLeaf = new Map<string, number[]>();
for (const k of [...leaves].filter(is0258)) kumulByLeaf.set(k, Array(12).fill(0));

for (const r of full) {
  if (r.yil !== 2026) continue;
  const h = String(r.hesap);
  if (!kumulByLeaf.has(h)) continue;
  const ay = Number(r.ay);
  if (ay >= 1 && ay <= 12) {
    kumulByLeaf.get(h)![ay - 1] += Number(r.tutar) || 0;
  }
}

let incYtd = 0;
for (const [k, kumul] of kumulByLeaf) {
  let prev = 0;
  for (let i = 0; i < 7; i++) {
    const v = kumul[i] ?? 0;
    incYtd += v - prev;
    prev = v;
  }
}
console.log(`\nYaprak 0258* incremental YTD (Ocak–Tem): ${tl(incYtd)}`);

// Sadece hesap=0258 (yaprak olabilir) branş bazlı ay7
const ay7only0258 = new Map<string, number>();
for (const r of full) {
  if (r.yil !== 2026 || r.ay !== 7 || String(r.hesap) !== "0258") continue;
  ay7only0258.set(r.bransKodu, (ay7only0258.get(r.bransKodu) ?? 0) + r.tutar);
}
console.log("\n=== Sadece hesap='0258' (branş × kümülatif ay7) ===");
let s2 = 0;
for (const [b, v] of [...ay7only0258.entries()].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))) {
  s2 += v;
  console.log(`  ${b}0258  ${tl(v).padStart(16)}`);
}
console.log(`  TOPLAM: ${tl(s2)}`);

// Unique hesap kodları 0258 altında
const altKod = [...kodSet].filter(is0258).sort();
console.log("\n0258 ailesi kodlar:", altKod.join(", "));
