/**
 * 61408 (GT 0258 / F200) — mizan vs Bütçe V3 karşılaştırma
 * npx tsx scripts/butce-61408-kontrol.ts
 */
import { readFileSync } from "fs";
import { buildV3GelirTablosu } from "../lib/butce/v3/buildV3GelirTablosu";
import { v3DefaultsStore2026 } from "../lib/butce/v3/defaults2026";
import { extractMizanGtAylik, ytdToplam } from "../lib/butce/v3/mizanGtExtract";
import { GT_KOD_TO_SATIR } from "../lib/butce/v3/gtKodHaritasi";
import { HESAP_TO_GT } from "../lib/butce/v3/mizanFormatHarita";
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
const AY_AD = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

type FullRow = { yil: number; ay: number; hesap: string; bransKodu: string; tutar: number };

function yaprakKodlar(rows: FullRow[], yil: number): Set<string> {
  const kodlar = new Set(
    rows.filter((r) => r.yil === yil).map((r) => String(r.hesap)),
  );
  const leaves = new Set<string>();
  for (const k of kodlar) {
    if (![...kodlar].some((o) => o !== k && o.startsWith(k))) leaves.add(k);
  }
  return leaves;
}

/** Manuel mizan: branş × hesap='0258' kümülatif ay7 toplamı (Excel mizan görünümü). */
function mizan0258KumulAy7(full: FullRow[], yil: number, ay: number): number {
  let t = 0;
  for (const r of full) {
    if (r.yil !== yil || r.ay !== ay || String(r.hesap) !== "0258") continue;
    t += Number(r.tutar) || 0;
  }
  return t;
}

async function main() {
  const yil = 2026;
  const anchorAy = 7;
  const full = JSON.parse(readFileSync("data/butce/private/mizan-aylik-full.json", "utf8")) as FullRow[];

  const gt61408 = HESAP_TO_GT["61408"] ?? "?";
  const satir61408 = GT_KOD_TO_SATIR[gt61408] ?? GT_KOD_TO_SATIR["0258"];

  console.log("=== 61408 eşleme ===");
  console.log(`  Muhasebe 61408 → GT ${gt61408} → F${satir61408 ?? "?"}`);

  const mizanKumulAy7 = mizan0258KumulAy7(full, yil, anchorAy);
  const extracted = extractMizanGtAylik(full, yil);
  const mizanSer = extracted.sirketSatir.get(satir61408 ?? 200);
  const mizanIncYtd = ytdToplam(mizanSer, anchorAy);

  console.log("\n=== ŞİRKET TOPLAM — 61408 / GT 0258 ===");
  console.log(`  Mizan Excel (branş×0258, ay7 kümülatif): ${tl(mizanKumulAy7)}`);
  console.log(`  extract → F200 incremental YTD:          ${tl(mizanIncYtd)}`);

  const [
    satis, uretim, tarifeMap, tarifeBransPay, mizan, mizanAylik, mizanAylikFull,
    bilancoAylik, oranAyar, kpkVade, kapanisTahmin,
  ] = await Promise.all([
    loadSatisButceRows(), loadUretimRows(), loadTarifeMapRows(), loadTarifeBransPayRows(),
    loadMizanRows(), loadMizanAylikRows(), loadMizanAylikFullRows(), loadBilancoAylikRows(),
    loadOranAyarlar(), loadKpkVadeRows(), loadKpkKapanisTahmin(),
  ]);

  const sonuc = buildV3GelirTablosu({
    varsayimlar: v3DefaultsStore2026(),
    satisRows: satis, uretim, tarifeMap, tarifeBransPay, mizan, mizanAylik, mizanAylikFull,
    bilancoAylik, oranAyar, kpkVade, kapanisTahmin,
  });

  const v3Ser = sonuc.gt.aylikToplam[satir61408 ?? 200];
  const v3Ytd = ytdToplam(v3Ser, anchorAy);

  console.log(`  Bütçe V3 F200 YTD:                         ${tl(v3Ytd)}`);
  console.log(`  Fark (mizan kümülatif − V3 YTD):           ${tl(mizanKumulAy7 - v3Ytd)}`);

  console.log("\n=== AYLIK KIRILIM V3 (artış) ===");
  console.log("  Ay       V3");
  for (let i = 0; i < anchorAy; i++) {
    const v = v3Ser?.[i] ?? 0;
    console.log(`  ${AY_AD[i]!.padEnd(4)} ${tl(v).padStart(14)}`);
  }

  // Branş kırılımı — en büyük sapmalar
  const bransSapma: Array<{ brans: string; mizan: number; v3: number; fark: number }> = [];
  for (const [brans, bm] of extracted.bransSatir) {
    const m = ytdToplam(bm.get(satir61408 ?? 200), anchorAy);
    let v = 0;
    for (let i = 0; i < anchorAy; i++) {
      v += sonuc.gt.aylikBrans[brans]?.[satir61408 ?? 200]?.[i] ?? 0;
    }
    const f = m - v;
    if (Math.abs(f) > 1) bransSapma.push({ brans, mizan: m, v3: v, fark: f });
  }
  bransSapma.sort((a, b) => Math.abs(b.fark) - Math.abs(a.fark));

  console.log("\n=== BRANŞ SAPMASI (|fark| > 0, ilk 10) ===");
  if (bransSapma.length === 0) {
    console.log("  Tüm branşlar birebir.");
  } else {
    for (const r of bransSapma.slice(0, 10)) {
      console.log(
        `  ${r.brans}: mizan=${tl(r.mizan)} v3=${tl(r.v3)} Δ=${tl(r.fark)}`,
      );
    }
    if (bransSapma.length > 10) console.log(`  … +${bransSapma.length - 10} branş daha`);
  }

  const recon61408 = sonuc.v3.mizanTutmayan?.find((x) => x.hesapKodu === "61408");
  console.log("\n=== RECON (mizanV3Recon) ===");
  if (recon61408) {
    console.log(`  61408 TUTMUYOR: mizan=${tl(recon61408.mizanYtd)} v3=${tl(recon61408.v3Ytd)} Δ=${tl(recon61408.fark)}`);
  } else {
    console.log("  61408 recon: tutarlı (tolerans 50.000 TL içinde).");
  }

  const ok = Math.abs(mizanKumulAy7 - v3Ytd) <= 50_000;
  console.log(`\n${ok ? "OK" : "FAIL"} — 61408 mizan (${tl(mizanKumulAy7)}) ↔ V3 (${tl(v3Ytd)}) ${ok ? "tutuyor" : "SAPIYOR"}.`);
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
