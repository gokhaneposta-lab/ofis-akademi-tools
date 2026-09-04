/**
 * V3 yeni motor doğrulama scripti.
 *
 * Kontroller:
 *   1. Motor çalışıyor mu (import + build)
 *   2. YTD (Ocak-Temmuz 2026) Safi TKZ değerleri mizanla tutarlı mı
 *   3. Ağu-Ara projeksiyonu makul mü (F320, F451 vs.)
 *   4. Ana kalemler için model önerileri
 *
 * Kullanım: npx tsx scripts/butce-v3-motor-dogrula.ts
 */

import {
  loadBilancoAylikRows,
  loadMizanAylikFullRows,
  loadMizanAylikRows,
  loadMizanRows,
  loadSatisButceRows,
  loadV3Varsayimlar,
} from "../lib/butce/loadData";
import { buildV3Motor } from "../lib/butce/v3/motor/buildV3Motor";
import { v3DefaultsForYear } from "../lib/butce/v3/defaults";

async function main() {
  console.log("=== V3 Yeni Motor Doğrulama ===\n");

  const saved = await loadV3Varsayimlar();
  const butceYili = saved?.butceYili ?? 2026;
  const yilDefaults = v3DefaultsForYear(butceYili);
  const varsayimlar = saved ?? yilDefaults!;

  console.log(`Bütçe yılı: ${butceYili}`);
  console.log(`Anchor ayı: ${varsayimlar.ytdAnchorAy ?? 7}`);
  console.log(`Toplam prim hedef: ${(varsayimlar.toplamPrimHedef / 1e9).toFixed(2)} mia TL`);

  const [satisRows, mizan, mizanAylik, mizanAylikFull, bilancoAylik] = await Promise.all([
    loadSatisButceRows(),
    loadMizanRows(),
    loadMizanAylikRows(),
    loadMizanAylikFullRows(),
    loadBilancoAylikRows(),
  ]);

  console.log(`\nVeri: mizan ${mizan.length}, aylık-full ${mizanAylikFull.length}, satis ${satisRows.length}`);

  const t0 = Date.now();
  const sonuc = buildV3Motor({
    varsayimlar,
    satisRows,
    mizan,
    mizanAylik,
    mizanAylikFull,
    bilancoAylik,
  });
  const ms = Date.now() - t0;
  console.log(`Motor süresi: ${ms} ms`);

  console.log("\n=== Uyarılar ===");
  for (const u of sonuc.uyarilar) console.log(` - ${u}`);

  console.log("\n=== YTD Overlay Detay ===");
  const yt = sonuc.motor.ytdOverlayDetay;
  console.log(`Kilitli branş: ${yt.kilitliBransSayisi}, satır: ${yt.kilitliSatirSayisi}`);
  console.log(`YTD Safi TKZ (mizandan): ${(yt.ytdSafiTkz / 1e6).toFixed(1)} mio`);
  console.log(`Model YTD Safi TKZ (öncesi): ${(yt.modelSafiTkz / 1e6).toFixed(1)} mio`);
  console.log(`Sapma (mizan − model): ${(yt.sapmaTL / 1e6).toFixed(1)} mio`);

  console.log("\n=== Şirket toplam GT (12 ay) ===");
  const f = (satir: number) => sonuc.gt.toplam[satir] ?? 0;
  console.log(`F11 Brüt prim:       ${(f(11) / 1e9).toFixed(2)} mia`);
  console.log(`F19 Reasüransa dev:  ${(f(19) / 1e9).toFixed(2)} mia`);
  console.log(`F10 Net prim:        ${(f(10) / 1e9).toFixed(2)} mia`);
  console.log(`F96 Brüt hasar:      ${(f(96) / 1e9).toFixed(2)} mia`);
  console.log(`F105 Hasar RE payı:  ${(f(105) / 1e9).toFixed(2)} mia`);
  console.log(`F95 Net hasar:       ${(f(95) / 1e9).toFixed(2)} mia`);
  console.log(`F116 Brüt muallak:   ${(f(116) / 1e9).toFixed(2)} mia`);
  console.log(`F86 Rücu:            ${(f(86) / 1e9).toFixed(2)} mia`);
  console.log(`F9 TEKNİK GELİR:     ${(f(9) / 1e9).toFixed(2)} mia`);
  console.log(`F94 TEKNİK GİDER:    ${(f(94) / 1e9).toFixed(2)} mia`);
  console.log(`9003 Safi TKZ:       ${(f(9003) / 1e9).toFixed(2)} mia`);
  console.log(`9005 TKZ:            ${(f(9005) / 1e9).toFixed(2)} mia`);

  console.log("\n=== Ay bazlı Safi TKZ (12 ay + YTD 7 ay) ===");
  const stkzAy = sonuc.gt.aylikToplam[9003] ?? [];
  for (let i = 0; i < 12; i++) {
    console.log(`  ${String(i + 1).padStart(2, "0")}: ${(stkzAy[i]! / 1e6).toFixed(1)} mio`);
  }
  const ytdSum = stkzAy.slice(0, 7).reduce((a, x) => a + x, 0);
  console.log(`  YTD (Oca-Tem) toplam: ${(ytdSum / 1e6).toFixed(1)} mio`);

  console.log("\n=== V3 Oran örnekleri (Trafik = 714/715/716) ===");
  for (const brans of ["714", "715", "741"]) {
    const branOranlar = sonuc.motor.oranlar.filter((o) => o.bransKodu === brans);
    if (branOranlar.length === 0) continue;
    console.log(`\nBranş ${brans}:`);
    for (const o of branOranlar.slice(0, 8)) {
      console.log(`  ${o.kalemKodu.padEnd(6)} = ${(o.oran * 100).toFixed(2).padStart(7)}% [${o.yontem}, ${o.gozlemSayisi} gözlem]`);
    }
  }

  console.log("\n=== Model önerileri (kullanıcı için) ===");
  for (const oneri of sonuc.motor.oneriler.slice(0, 20)) {
    const sapma = oneri.sapmaPct != null ? `${oneri.sapmaPct.toFixed(1)}%` : "—";
    console.log(`  [${oneri.alan}] ${oneri.key}: kullanıcı=${oneri.kullaniciDeger}, model=${oneri.modelOneri}, sapma=${sapma}`);
    console.log(`      ${oneri.aciklama}`);
  }

  console.log("\n✅ Doğrulama tamamlandı");
}

main().catch((e) => {
  console.error("HATA:", e instanceof Error ? e.stack : e);
  process.exit(1);
});
