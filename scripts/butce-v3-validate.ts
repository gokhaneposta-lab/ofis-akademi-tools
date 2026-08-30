/**
 * Bütçe V3 doğrulama — yerel private veri varsa çalıştırın.
 * npx tsx scripts/butce-v3-validate.ts
 */
import { writePrivateFile } from "../lib/butce/storage";
import { BUTCE_V3_VARSAYIMLAR_JSON } from "../lib/butce/paths";
import { buildV3GelirTablosu } from "../lib/butce/v3/buildV3GelirTablosu";
import { v3DefaultsStore2026 } from "../lib/butce/v3/defaults2026";
import { V3_V2_SORUN_OZETI } from "../lib/butce/v3/metodoloji";
import {
  butceDataDurumu,
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
  console.log("=== Bütçe V3 Validate ===\n");
  console.log("V2 sorun özeti:");
  for (const s of V3_V2_SORUN_OZETI) console.log(`  - ${s}`);

  const durum = await butceDataDurumu();
  console.log("\nVeri durumu:", {
    hasMizan: durum.hasMizan,
    hasMizanAylik: durum.hasMizanAylik,
    hasSatisButce: durum.hasSatisButce,
    hasTarifeBransPay: durum.hasTarifeBransPay,
    butceYili: durum.butceYili,
  });

  if (!durum.hasMizan) {
    console.log("\nBLOCKED: data/butce/private/mizan-tidy.json yok.");
    console.log("Import: npm run butce:import-mizan -- <BUTCE_MAP.xlsx>");
    console.log("       npm run butce:import-aylik-gt -- <Aylık GT.xlsx>");
    process.exit(0);
  }

  const defaults2026 = v3DefaultsStore2026();
  const saved = await loadV3Varsayimlar();
  const varsayimlar =
    saved?.butceYili === 2026 && saved.toplamPrimHedef > 0
      ? {
          ...defaults2026,
          ...saved,
          tarifeHedefleri: saved.tarifeHedefleri ?? defaults2026.tarifeHedefleri,
          faaliyetGiderButce: {
            ...defaults2026.faaliyetGiderButce,
            ...saved.faaliyetGiderButce,
          },
          aylikGetiriOrani:
            saved.aylikGetiriOrani?.length === 12
              ? saved.aylikGetiriOrani
              : defaults2026.aylikGetiriOrani,
        }
      : defaults2026;

  if (!saved) {
    try {
      await writePrivateFile(
        BUTCE_V3_VARSAYIMLAR_JSON,
        JSON.stringify({ ...defaults2026, guncellemeIso: new Date().toISOString() }),
      );
      console.log("Seeded v3-varsayimlar.json (2026 defaults).");
    } catch (e) {
      console.log("Seed yazılamadı:", e instanceof Error ? e.message : e);
    }
  }

  const [
    satis,
    uretim,
    tarifeMap,
    tarifeBransPay,
    mizan,
    mizanAylik,
    mizanAylikFull,
    bilancoAylik,
    oranAyar,
    kpkVade,
    kapanisTahmin,
  ] = await Promise.all([
    loadSatisButceRows(),
    loadUretimRows(),
    loadTarifeMapRows(),
    loadTarifeBransPayRows(),
    loadMizanRows(),
    loadMizanAylikRows(),
    loadMizanAylikFullRows(),
    loadBilancoAylikRows(),
    loadOranAyarlar(),
    loadKpkVadeRows(),
    loadKpkKapanisTahmin(),
  ]);

  const sonuc = buildV3GelirTablosu({
    varsayimlar,
    satisRows: satis,
    uretim,
    tarifeMap,
    tarifeBransPay,
    mizan,
    mizanAylik,
    mizanAylikFull,
    bilancoAylik,
    oranAyar,
    kpkVade,
    kapanisTahmin,
  });

  const toplamPrim = varsayimlar.toplamPrimHedef;
  const f11 = sonuc.gt.toplam[11] ?? 0;
  const f96 = sonuc.gt.toplam[96] ?? 0;
  const f95 = sonuc.gt.toplam[95] ?? 0;
  const f38 = sonuc.gt.toplam[38] ?? 0;
  const gg = sonuc.gt.toplam[9004] ?? 0;
  const safi = sonuc.gt.toplam[9003] ?? 0;
  const tkz = sonuc.gt.toplam[9005] ?? 0;

  console.log(`\nBütçe yılı: ${varsayimlar.butceYili}`);
  console.log(`Toplam prim hedef: ${tl(toplamPrim)}`);
  console.log(`Brüt prim GT (F11): ${tl(f11)}`);
  console.log(`Brüt ödenen hasar (F96): ${tl(f96)}`);
  console.log(`Net ödenen hasar (F95): ${tl(f95)}`);
  console.log(`Mali gelir (F38): ${tl(f38)}`);
  console.log(`Genel gider (9004): ${tl(gg)}`);
  console.log(`Safi TKZ (9003): ${tl(safi)}`);
  console.log(`TKZ (9005): ${tl(tkz)}`);
  console.log(`Prim kaynak: ${sonuc.v3.primKaynak}`);
  console.log(`YTD anchor ay: ${sonuc.v3.ytdAnchorAy}`);

  const bransSirali = [...sonuc.gt.branslar]
    .filter((b) => (b.brutPrim ?? 0) > 0)
    .sort((a, b) => (b.brutPrim ?? 0) - (a.brutPrim ?? 0))
    .slice(0, 8);
  console.log("\nBranş prim (ilk 8):");
  for (const b of bransSirali) {
    console.log(`  ${b.bransKodu} ${b.bransAdi}: ${tl(b.brutPrim)}`);
  }

  if (sonuc.v3.kalibrasyon.length > 0) {
    console.log("\nYTD kalibrasyon:");
    for (const k of sonuc.v3.kalibrasyon) {
      console.log(
        `  ${k.ad}: tahmin=${tl(k.ytdTahmin)} gerçek=${tl(k.ytdGercek)} sapma=${k.sapmaPct?.toFixed(1) ?? "n/a"}%`,
      );
    }
  }

  if (sonuc.uyarilar.length > 0) {
    console.log("\nUyarılar:");
    for (const u of [...new Set(sonuc.uyarilar)].slice(0, 16)) console.log(`  • ${u}`);
  }

  const fark = Math.abs(f11 - toplamPrim);
  if (toplamPrim > 0 && fark > toplamPrim * 0.02) {
    console.error(`\nFAIL: F11 (${f11}) vs hedef (${toplamPrim}) fark > %2`);
    process.exit(1);
  }

  const giderHedef = Object.values(varsayimlar.faaliyetGiderButce).reduce((a, v) => a + v, 0);
  if (giderHedef > 0 && Math.abs(Math.abs(gg) - giderHedef) > giderHedef * 0.05) {
    console.log(
      `\nNOTE: genel gider GT ${tl(gg)} vs bütçe ${tl(giderHedef)} (işaret/dağıtım farkı olabilir).`,
    );
  }

  console.log("\nOK — V3 hesaplama tamamlandı.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
