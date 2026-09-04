/**
 * Mizan 600/601/602… kontrol + V3 Safi TKZ karşılaştırma
 * npx tsx scripts/butce-mizan-600-kontrol.ts
 */
import { readFileSync } from "fs";
import { buildV3GelirTablosu } from "../lib/butce/v3/buildV3GelirTablosu";
import { v3DefaultsStore2026 } from "../lib/butce/v3/defaults2026";
import {
  loadBilancoAylikRows,
  loadKpkKapanisTahmin,
  loadKpkVadeRows,
  loadMizanAylikFullRows,
  loadMizanAylikRows,
  loadMizanRows,
  loadOranAyarlar,
  loadSatisButceRows,
  loadTarifeBransPayRows,
  loadTarifeMapRows,
  loadUretimRows,
} from "../lib/butce/loadData";

const tl = (n: number) => Math.round(n).toLocaleString("tr-TR");

function sumHesap(
  rows: Array<{ yil: number; ay?: number; hesap: string; tutar: number }>,
  yil: number,
  prefix: string,
  ay?: number,
  exact = false,
): number {
  let t = 0;
  for (const r of rows) {
    if (Number(r.yil) !== yil) continue;
    if (ay != null && Number(r.ay) !== ay) continue;
    const h = String(r.hesap);
    const match = exact ? h === prefix : h === prefix || h.startsWith(prefix);
    if (match) t += Number(r.tutar) || 0;
  }
  return t;
}

async function main() {
  const mizan = JSON.parse(readFileSync("data/butce/private/mizan-tidy.json", "utf8"));
  const aylik = JSON.parse(readFileSync("data/butce/private/mizan-aylik-tidy.json", "utf8"));
  const full = JSON.parse(readFileSync("data/butce/private/mizan-aylik-full.json", "utf8"));

  console.log("=== MİZAN-TIDY (muhasebe hesap) — 2026 yılsonu kümülatif ===");
  for (const p of ["600", "601", "602", "603", "610", "611", "613", "614", "61401"]) {
    console.log(`  ${p.padEnd(6)} Σ (prefix): ${tl(sumHesap(mizan, 2026, p))}`);
    console.log(`  ${p.padEnd(6)} = (exact):  ${tl(sumHesap(mizan, 2026, p, undefined, true))}`);
  }

  console.log("\n=== MİZAN-AYLIK-TIDY — 2026 Temmuz (ay=7) kümülatif YTD ===");
  for (const p of ["600", "601", "602", "603", "610", "611", "613", "614", "61401"]) {
    console.log(`  ${p.padEnd(6)} Σ: ${tl(sumHesap(aylik, 2026, p, 7))}`);
  }

  // Safi TKZ mizan formülü (muhasebe): 600+601+602+603+605 − (610+611+613+614+…) — basitleştirilmiş
  const teknikGelirMu = sumHesap(aylik, 2026, "600", 7) + sumHesap(aylik, 2026, "601", 7)
    + sumHesap(aylik, 2026, "602", 7) + sumHesap(aylik, 2026, "603", 7)
    + sumHesap(aylik, 2026, "605", 7);
  const teknikGiderMu = sumHesap(aylik, 2026, "610", 7) + sumHesap(aylik, 2026, "611", 7)
    + sumHesap(aylik, 2026, "613", 7) + sumHesap(aylik, 2026, "614", 7);
  console.log("\n=== Mizan ham toplam (600–605 vs 610–614, Temmuz YTD) ===");
  console.log(`  Teknik gelir (600+601+602+603+605): ${tl(teknikGelirMu)}`);
  console.log(`  Teknik gider (610+611+613+614):     ${tl(teknikGiderMu)}`);
  console.log(`  Safi TKZ (basit fark):              ${tl(teknikGelirMu + teknikGiderMu)}`);

  console.log("\n=== MİZAN-AYLIK-FULL (GT kod) — 2026 Temmuz ===");
  for (const p of ["011", "0111", "012", "0121", "021", "022", "024", "0251"]) {
    console.log(`  ${p.padEnd(6)} Σ: ${tl(sumHesap(full, 2026, p, 7))}`);
  }

  const [
    satis, uretim, tarifeMap, tarifeBransPay, mizanRows, mizanAylik, mizanAylikFull,
    bilancoAylik, oranAyar, kpkVade, kapanisTahmin,
  ] = await Promise.all([
    loadSatisButceRows(), loadUretimRows(), loadTarifeMapRows(), loadTarifeBransPayRows(),
    loadMizanRows(), loadMizanAylikRows(), loadMizanAylikFullRows(), loadBilancoAylikRows(),
    loadOranAyarlar(), loadKpkVadeRows(), loadKpkKapanisTahmin(),
  ]);

  const sonuc = buildV3GelirTablosu({
    varsayimlar: v3DefaultsStore2026(),
    satisRows: satis,
    uretim,
    tarifeMap,
    tarifeBransPay,
    mizan: mizanRows,
    mizanAylik,
    mizanAylikFull,
    bilancoAylik,
    oranAyar,
    kpkVade,
    kapanisTahmin,
  });

  // YTD Temmuz toplamı (ay 0..6 sum)
  const ytdSum = (satir: number) => {
    const ser = sonuc.gt.aylikToplam[satir] ?? [];
    return ser.slice(0, 7).reduce((a, x) => a + x, 0);
  };

  console.log("\n=== BÜTÇE V3 — Temmuz YTD (Ocak–Temmuz toplam) ===");
  console.log(`  F11 brüt prim:        ${tl(ytdSum(11))}`);
  console.log(`  F9 teknik gelir:      ${tl(ytdSum(9))}`);
  console.log(`  F94 teknik gider:     ${tl(ytdSum(94))}`);
  console.log(`  Safi TKZ (9003):      ${tl(ytdSum(9003))}`);
  console.log(`  F38 mali gelir:       ${tl(ytdSum(38))}`);
  console.log(`  TKZ (9005):           ${tl(ytdSum(9005))}`);
  console.log(`  F21 KPK:              ${tl(ytdSum(21))}`);
  console.log(`  F114 muallak:         ${tl(ytdSum(114))}`);
  console.log(`  F177 komisyon:        ${tl(ytdSum(177))}`);
  console.log(`  F166 dengeleme:       ${tl(ytdSum(166))}`);

  // Veri yapısı keşfi
  const yrsMizan = [...new Set(mizan.map((r: { yil: number }) => r.yil))].sort();
  const yrsAylik = [...new Set(aylik.map((r: { yil: number }) => r.yil))].sort();
  console.log("\n=== VERİ YAPISI ===");
  console.log(`  mizan-tidy yıllar: ${yrsMizan.join(", ")} (600/601 burada muhasebe kodu)`);
  console.log(`  mizan-aylik-tidy yıllar: ${yrsAylik.join(", ")}`);
  console.log(`  mizan-aylik-full: GT kodu (0111, 0121…) — 2026 Temmuz burada`);

  const y26ay7 = aylik.filter((r: { yil: number; ay: number }) => r.yil === 2026 && r.ay === 7);
  if (y26ay7.length > 0) {
    const kodlar = [...new Set(y26ay7.map((r: { hesap: string }) => String(r.hesap)))].slice(0, 10);
    console.log(`  aylik-tidy 2026-07 örnek hesap: ${kodlar.join(", ")}`);
  } else {
    console.log("  aylik-tidy'de 2026 Temmuz YOK — 600/601 muhasebe kodu ile YTD kontrol edilemez");
  }

  // 2025 yılsonu mizan-tidy ile 600/601 örneği (format göster)
  console.log("\n=== 2025 mizan-tidy örnek (600 ailesi) ===");
  for (const p of ["600", "601", "602", "611", "61401"]) {
    console.log(`  ${p}: ${tl(sumHesap(mizan, 2025, p))}`);
  }

  // 2026 Temmuz — aylik-tidy GT kodları (600=011, 601=012 bridge)
  const rows2607 = aylik.filter((r: { yil: number; ay: number }) => r.yil === 2026 && r.ay === 7);
  const kodlar2607 = [...new Set(rows2607.map((r: { hesap: string }) => String(r.hesap)))];
  const leaves2607 = kodlar2607.filter(
    (k) => !kodlar2607.some((o) => o !== k && o.startsWith(k)),
  );
  const sumLeaf = (prefix: string) => {
    let t = 0;
    for (const r of rows2607) {
      const h = String(r.hesap);
      if (!leaves2607.includes(h)) continue;
      if (h === prefix || h.startsWith(prefix)) t += Number(r.tutar) || 0;
    }
    return t;
  };
  console.log("\n=== 2026 Temmuz YTD — mizan-aylik-tidy (yaprak GT, muhasebe karşılığı) ===");
  console.log("  (600→011 prim, 601→012 KPK, 610→021 hasar, 611→022 muallak, 614→025 gider)");
  for (const [muh, gt] of [
    ["600/011", "011"],
    ["601/012", "012"],
    ["602/013", "013"],
    ["603/014", "014"],
    ["610/021", "021"],
    ["611/022", "022"],
    ["613/024", "024"],
    ["614/025", "025"],
    ["61401/0251", "0251"],
  ] as const) {
    console.log(`  ${muh.padEnd(12)} ${tl(sumLeaf(gt))}`);
  }
  const tg = sumLeaf("011") + sumLeaf("012") + sumLeaf("013") + sumLeaf("014");
  const tgd = sumLeaf("021") + sumLeaf("022") + sumLeaf("024") + sumLeaf("025");
  console.log(`\n  Mizan Safi TKZ (yaprak GT gelir+gider): ${tl(tg + tgd)}`);
  console.log("  NOT: aylik-tidy 2026'da yalnızca prim kodları var; hasar/KPK/gider → aylik-full");

  // mizan-aylik-full: yaprak + incremental Ocak-Temmuz
  const fullRows = full as Array<{ yil: number; ay: number; hesap: string; tutar: number }>;
  const allKod = new Set(
    fullRows.filter((r) => r.yil === 2026).map((r) => String(r.hesap)),
  );
  const fullLeaves = [...allKod].filter(
    (k) => ![...allKod].some((o) => o !== k && o.startsWith(k)),
  );
  const kumulByKodAy = new Map<string, number[]>();
  for (const k of fullLeaves) kumulByKodAy.set(k, Array(12).fill(0));
  for (const r of fullRows) {
    if (r.yil !== 2026) continue;
    const k = String(r.hesap);
    if (!kumulByKodAy.has(k)) continue;
    const ay = Number(r.ay);
    if (ay >= 1 && ay <= 12) kumulByKodAy.get(k)![ay - 1] += Number(r.tutar) || 0;
  }
  const ytdInc = (prefix: string) => {
    let t = 0;
    for (const [k, kumul] of kumulByKodAy) {
      if (!(k === prefix || k.startsWith(prefix))) continue;
      let prev = 0;
      for (let i = 0; i < 7; i++) {
        const v = kumul[i] ?? 0;
        t += v - prev;
        prev = v;
      }
    }
    return t;
  };
  console.log("\n=== 2026 Ocak–Temmuz incremental — mizan-aylik-full (yaprak) ===");
  for (const [muh, gt] of [
    ["600/011", "011"],
    ["601/012", "012"],
    ["610/021", "021"],
    ["611/022", "022"],
    ["613/024", "024"],
    ["61401/0251", "0251"],
  ] as const) {
    console.log(`  ${muh.padEnd(12)} ${tl(ytdInc(gt))}`);
  }
  const safiFull =
    ytdInc("011") + ytdInc("012") + ytdInc("013") + ytdInc("014") + ytdInc("016")
    + ytdInc("021") + ytdInc("022") + ytdInc("024") + ytdInc("025");
  console.log(`  Mizan Safi TKZ (full, basit GT gelir+gider): ${tl(safiFull)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
