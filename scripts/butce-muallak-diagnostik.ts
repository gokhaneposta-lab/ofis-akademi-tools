/**
 * 611 muallak YTD vs H2 vs mizan diagnostik.
 * npx tsx scripts/butce-muallak-diagnostik.ts
 */
import { buildV3GelirTablosu } from "../lib/butce/v3/buildV3GelirTablosu";
import { v3DefaultsStore2026 } from "../lib/butce/v3/defaults2026";
import { extractMizanGtAylik } from "../lib/butce/v3/mizanGtExtract";
import { MizanOranServisi } from "../lib/butce/oran/mizanOranlar";
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
  loadV3Varsayimlar,
} from "../lib/butce/loadData";

const tl = (n: number) => Math.round(n).toLocaleString("tr-TR");

async function main() {
  const defaults2026 = v3DefaultsStore2026();
  const saved = await loadV3Varsayimlar();
  const varsayimlar = saved?.butceYili === 2026 ? { ...defaults2026, ...saved } : defaults2026;

  const [
    satisRows,
    mizan,
    mizanAylik,
    mizanAylikFull,
    bilancoAylik,
    kpkVade,
    kapanisTahmin,
    tarifeBransPay,
    tarifeMap,
    uretim,
    oranAyar,
  ] = await Promise.all([
    loadSatisButceRows(),
    loadMizanRows(),
    loadMizanAylikRows(),
    loadMizanAylikFullRows(),
    loadBilancoAylikRows(),
    loadKpkVadeRows(),
    loadKpkKapanisTahmin(),
    loadTarifeBransPayRows(),
    loadTarifeMapRows(),
    loadUretimRows(),
    loadOranAyarlar(),
  ]);

  const sonuc = buildV3GelirTablosu({
    varsayimlar,
    satisRows,
    mizan,
    mizanAylik,
    mizanAylikFull,
    bilancoAylik,
    kpkVade,
    kapanisTahmin,
    tarifeBransPay,
    tarifeMap,
    uretim,
    oranAyar,
  });

  const gt = sonuc.gt;
  const anchor = sonuc.ytdAnchorAy ?? 7;
  console.log(`Anchor ay: ${anchor}`);
  console.log(`TKZ (9003): ${tl(gt.toplam[9003] ?? 0)}`);
  console.log(`Teknik gider (9002): ${tl(gt.toplam[9002] ?? 0)}`);
  console.log();

  const satirlar = [
    [114, "611"],
    [115, "61101"],
    [116, "611011"],
    [126, "611012"],
    [136, "61102"],
    [137, "611021"],
    [147, "611022"],
  ] as const;

  console.log("Satir | YTD mizan/kilit | H2 projeksiyon | Yıllık toplam");
  console.log("-".repeat(70));
  for (const [satir, ad] of satirlar) {
    const ser = gt.aylikToplam[satir] ?? [];
    const ytd = ser.slice(0, anchor).reduce((a, x) => a + x, 0);
    const h2 = ser.slice(anchor).reduce((a, x) => a + x, 0);
    const tot = ser.reduce((a, x) => a + x, 0);
    console.log(`${ad.padEnd(8)} | ${tl(ytd).padStart(16)} | ${tl(h2).padStart(16)} | ${tl(tot)}`);
  }

  const miz = extractMizanGtAylik(mizanAylikFull, 2026);
  const m611 = miz.sirketSatir.get(114);
  if (m611) {
    const ytd = m611.slice(0, anchor).reduce((a, x) => a + x, 0);
    console.log(`\nMizan ham 611 YTD (1-${anchor}): ${tl(ytd)}`);
    console.log("Mizan aylık 611:", m611.map((x) => tl(x)).join(" | "));
  } else {
    console.log("\nMizan 611 satırı bulunamadı.");
  }

  console.log("\nV3 aylık 611:", (gt.aylikToplam[114] ?? []).map((x) => tl(x)).join(" | "));

  const k611 = sonuc.kalibrasyon?.find((x) => x.satir === 114);
  if (k611) {
    console.log(`\nKalibrasyon 611: motor YTD ${tl(k611.ytdTahmin)} → mizan YTD ${tl(k611.ytdGercek)} (${k611.sapmaPct?.toFixed(1)}%)`);
  }

  const servis = new MizanOranServisi(mizan, 2026, mizanAylikFull, true);
  for (const kod of ["02211", "F325"] as const) {
    const tablo = servis.tumBranslarTablosu(kod, oranAyar[kod] ?? {}, { ay: 12 });
    const avg =
      tablo.length > 0 ? tablo.reduce((s, r) => s + Math.abs(r.oran), 0) / tablo.length : 0;
    console.log(`\n${kod} ort oran (Aralık): ${(avg * 100).toFixed(2)}% (${tablo.length} branş)`);
  }

  const primYillik = gt.toplam[11] ?? 0;
  const f451 = servis.tumBranslarTablosu("02211", oranAyar["02211"] ?? {}, { ay: 12 });
  let tahmini611011 = 0;
  for (const b of gt.branslar) {
    const prim = b.degerler[11] ?? 0;
    const oran = f451.find((r) => r.bransKodu === b.bransKodu)?.oran ?? 0;
    tahmini611011 += prim * oran;
  }
  console.log(`\nPrim 60001 yıllık: ${tl(primYillik)}`);
  console.log(`Branş bazlı Σ(prim×F451) 611011 tahmini: ${tl(tahmini611011)}`);
  console.log(`611011 V3 gerçek: ${tl(gt.toplam[116] ?? 0)}`);

  // Geçmiş yıl 611 oranları
  for (const yil of [2024, 2025]) {
    let pay = 0;
    let baz = 0;
    for (const r of mizan) {
      if (r.yil !== yil) continue;
      const h = String(r.hesap);
      if (h === "611011") pay += r.tutar;
      if (h === "60001") baz += r.tutar;
    }
    if (baz !== 0) {
      console.log(`${yil} mizan 611011/60001 oran: ${((pay / baz) * 100).toFixed(2)}% (611011=${tl(pay)}, 60001=${tl(baz)})`);
    }
  }

  // Ham mizan hesap kodu (0111 şirket) — kümülatif → artış
  console.log("\n=== Ham mizan 2026 (branş 0111) kümülatif → aylık artış ===");
  const hesaplar = ["611", "61101", "611011", "611012", "61102", "611021", "611022"];
  for (const h of hesaplar) {
    const kum = Array(12).fill(0);
    for (const r of mizanAylikFull) {
      if (r.yil !== 2026) continue;
      const bk = String(r.bransKodu ?? "").trim();
      if (bk && bk !== "0111") continue;
      if (String(r.hesap) !== h) continue;
      kum[r.ay - 1] += Number(r.tutar) || 0;
    }
    const inc: number[] = [];
    let prev = 0;
    for (let i = 0; i < 12; i++) {
      inc.push(kum[i] - prev);
      prev = kum[i];
    }
    const ytd7 = inc.slice(0, 7).reduce((a, x) => a + x, 0);
    console.log(`${h}: YTD7 artış=${tl(ytd7)} | aylık artış: ${inc.map((x) => tl(x)).join(" ")}`);
  }

  // GT extract satır bazlı
  console.log("\n=== extractMizanGtAylik satır serileri ===");
  for (const [satir, ad] of satirlar) {
    const ser = miz.sirketSatir.get(satir);
    if (!ser) continue;
    const ytd7 = ser.slice(0, 7).reduce((a, x) => a + x, 0);
    console.log(`satir ${satir} (${ad}): YTD7=${tl(ytd7)}`);
  }

  for (const yil of [2024, 2025]) {
    let t611 = 0;
    for (const r of mizan) {
      if (r.yil !== yil) continue;
      if (String(r.hesap) === "611") t611 += r.tutar;
    }
    console.log(`${yil} mizan 611 tam yıl: ${tl(t611)}`);
  }

  // GT extract aylık 611011 / 611012
  console.log("\n=== Mizan extract aylık (611011/611012/611) ===");
  for (const [satir, ad] of [[116, "611011"], [126, "611012"], [114, "611"]] as const) {
    const ser = miz.sirketSatir.get(satir);
    if (ser) console.log(`${ad}: ${ser.map((x) => tl(x)).join(" | ")}`);
  }

  // Tüm branşlardan 02211 yaprak toplamı (0111 hariç)
  console.log("\n=== GT kod branş toplamı (tüm branşlar) ===");
  for (const c of ["02211", "02212", "022"]) {
    const kum = Array(12).fill(0);
    for (const r of mizanAylikFull) {
      if (r.yil !== 2026) continue;
      if (String(r.hesap) !== c) continue;
      const bk = String(r.bransKodu ?? "").trim();
      if (bk && bk !== "0111") continue;
      kum[r.ay - 1] += Number(r.tutar) || 0;
    }
    const inc: number[] = [];
    let prev = 0;
    for (let i = 0; i < 12; i++) {
      inc.push(kum[i] - prev);
      prev = kum[i];
    }
    console.log(`${c}: küm=${kum.map((x) => tl(x)).join(" | ")}`);
    console.log(`     art=${inc.map((x) => tl(x)).join(" | ")}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
