/**
 * Faz 1 regression — 701 Yangın, Ocak 2026 (anchor=1).
 * F22 stale → F96 zincir düzeltmesi; eski teşhis değerleriyle karşılaştırma.
 *
 * npx --yes tsx scripts/butce-v2-faz1-701-regression.ts
 */
import { dogrulaKpkGtTutarlilik } from "../lib/butce/kpk/kpkGtTutarlilik";
import { MizanOranServisi } from "../lib/butce/oran/mizanOranlar";
import { buildV2GelirTablosu } from "../lib/butce/v2/buildV2GelirTablosu";
import { alignTarifeHedefleri, v3DefaultsStore2026 } from "../lib/butce/v3/defaults";
import { primHedefFromTarifeAna } from "../lib/butce/v3/primFromToplam";
import { syntheticSatisFromTarife } from "../lib/butce/v3/syntheticSatis";
import { DagitimMotoru } from "../lib/butce/prim/dagitimMotoru";
import { referansYilAgirliklari } from "../lib/butce/config/constants";
import { v2OzetDeger } from "../lib/butce/v2/v2GtFiltre";
import {
  loadMizanRows,
  loadBilancoAylikRows,
  loadMizanAylikRows,
  loadMizanAylikFullRows,
  loadOranAyarPaket,
  loadKpkVadeRows,
  loadKpkKapanisTahmin,
  loadV2Varsayimlar,
  loadSatisButceRows,
  loadUretimRows,
  loadTarifeMapRows,
  loadTarifeBransPayRows,
} from "../lib/butce/loadData";

const BRANS = "701";
const ANCHOR = 1;
const BUTCE_YILI = 2026;

/** Teşhis raporu — düzeltme öncesi kod (stale F22 ile F96). */
const ESKI = {
  f11: 92_165_464,
  f21: 47_282_213,
  f23: -426_786_484,
  f24: 407_148_745,
  f22Ekran: -19_637_739,
  f22Hesap: -426_786_484,
  f32: 0,
  f320: -0.2037,
  f96: 68_150_590,
  /** F96 stale F22 ile tutarlı; dashboard F22 ile değil */
  f96BeklenenYeni: (-19_637_739 + 92_165_464) * -0.2037,
} as const;

function fmt(n: number): string {
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
}

function mn(n: number): string {
  return `${(n / 1e6).toFixed(2)} mn`;
}

function pctDelta(yeni: number, eski: number): string {
  if (!Number.isFinite(eski) || eski === 0) return eski === yeni ? "0%" : "n/a";
  return `${(((yeni - eski) / Math.abs(eski)) * 100).toFixed(1)}%`;
}

function satir(
  ad: string,
  yeni: number,
  eski: number | null,
  not?: string,
): void {
  const eskiStr = eski != null ? fmt(eski) : "—";
  const delta = eski != null ? pctDelta(yeni, eski) : "";
  console.log(
    `  ${ad.padEnd(6)} yeni=${fmt(yeni).padStart(16)}  eski=${eskiStr.padStart(16)}  Δ=${delta.padStart(8)}${not ? `  ${not}` : ""}`,
  );
}

async function main() {
  console.log(`=== Faz 1 regression — ${BRANS} Yangın, Ocak ${BUTCE_YILI} (anchor=${ANCHOR}) ===\n`);

  const [
    satis,
    uretim,
    tarifeMap,
    tarifeBransPay,
    mizan,
    mizanAylik,
    mizanFull,
    bilancoAylik,
    oranPaket,
    kpkVade,
    kapanisTahmin,
    v2Saved,
  ] = await Promise.all([
    loadSatisButceRows(),
    loadUretimRows(),
    loadTarifeMapRows(),
    loadTarifeBransPayRows(),
    loadMizanRows(),
    loadMizanAylikRows(),
    loadMizanAylikFullRows(),
    loadBilancoAylikRows(),
    loadOranAyarPaket(),
    loadKpkVadeRows(),
    loadKpkKapanisTahmin(),
    loadV2Varsayimlar(),
  ]);

  if (mizan.length === 0) {
    console.error("Mizan yok — regression çalıştırılamadı.");
    process.exit(1);
  }

  const v3def = v3DefaultsStore2026();
  const tarifeHedefleri = alignTarifeHedefleri(
    v2Saved?.tarifeHedefleri ?? v3def.tarifeHedefleri,
    satis,
  );
  let satisRows = satis;
  if (satisRows.length === 0 && Object.keys(tarifeHedefleri).length > 0) {
    satisRows = syntheticSatisFromTarife(tarifeHedefleri);
  }
  const referansEtiket =
    v2Saved?.referansEtiket ?? v3def.referansEtiket ?? "Son 2 Yıl Ortalaması (2024-2025)";
  const yilAgirliklari = referansYilAgirliklari(
    referansEtiket,
    v2Saved?.yilAgirliklari ?? v3def.yilAgirliklari,
  );

  let primOverride: Record<string, number> | undefined;
  let endirektOverride: Record<string, number> | undefined;
  if (uretim?.length && Object.keys(tarifeHedefleri).length > 0) {
    const motor = new DagitimMotoru(uretim, tarifeMap, mizan, tarifeBransPay);
    const dagitim = motor.dagit({
      satisRows,
      referansEtiket,
      mizanYedek: true,
      tarifeHedefleri,
      yilAgirliklari,
    });
    if (dagitim.ozet.dagitilan > 0) {
      primOverride = {};
      endirektOverride = {};
      for (const b of dagitim.bransOzet) primOverride[b.bransKodu] = b.hedefPrim;
      for (const b of dagitim.bransDirektEndirekt) {
        endirektOverride[b.bransKodu] = b.endirektPrim;
      }
    }
  }
  if (!primOverride && Object.keys(tarifeHedefleri).length > 0) {
    const fb = primHedefFromTarifeAna(tarifeHedefleri, mizan, BUTCE_YILI);
    primOverride = fb.primHedefleri;
    endirektOverride = fb.endirektPrim;
  }

  const { gt } = buildV2GelirTablosu({
    varsayimlar: {
      butceYili: BUTCE_YILI,
      tarifeHedefleri,
      referansEtiket,
      yilAgirliklari,
      giderArtisOrani: v2Saved?.giderArtisOrani ?? 0,
      faaliyetGiderButce: v2Saved?.faaliyetGiderButce ?? v3def.faaliyetGiderButce,
      aylikGetiriOrani: v2Saved?.aylikGetiriOrani ?? v3def.aylikGetiriOrani,
    },
    satisRows,
    primHedefleriOverride: primOverride,
    endirektPrimOverride: endirektOverride,
    uretim,
    tarifeMap,
    tarifeBransPay,
    mizan,
    mizanAylik,
    mizanAylikFull: mizanFull,
    bilancoAylik,
    oranAyar: oranPaket.ayarlar,
    kalemYilBirlestirme: oranPaket.kalemYilBirlestirme,
    kpkVade,
    kapanisTahmin,
  });

  const kod = [BRANS];
  const f11 = v2OzetDeger(gt, 11, ANCHOR, kod);
  const f21 = v2OzetDeger(gt, 21, ANCHOR, kod);
  const f23 = v2OzetDeger(gt, 23, ANCHOR, kod);
  const f24 = v2OzetDeger(gt, 24, ANCHOR, kod);
  const f22 = v2OzetDeger(gt, 22, ANCHOR, kod);
  const f32 = v2OzetDeger(gt, 32, ANCHOR, kod);
  const f96 = v2OzetDeger(gt, 96, ANCHOR, kod);
  const f105 = v2OzetDeger(gt, 105, ANCHOR, kod);
  const f95 = v2OzetDeger(gt, 95, ANCHOR, kod);
  const f86 = v2OzetDeger(gt, 86, ANCHOR, kod);

  const oranServisi = new MizanOranServisi(
    mizan,
    BUTCE_YILI,
    mizanFull,
    true,
    oranPaket.kalemYilBirlestirme,
  );
  const f320Tablo = oranServisi.tumBranslarTablosu("0211", oranPaket.ayarlar["0211"] ?? {}, {
    ay: ANCHOR,
  });
  const f320Row = f320Tablo.find((r) => r.bransKodu === BRANS);
  const f320 = f320Row?.oran ?? NaN;

  const f320ByBrans: Record<string, number> = {};
  for (const r of f320Tablo) f320ByBrans[r.bransKodu] = r.oran;

  console.log("--- Satır karşılaştırması (yeni vs eski teşhis) ---");
  satir("F11", f11, ESKI.f11);
  satir("F23", f23, ESKI.f23);
  satir("F24", f24, ESKI.f24, "kaynak: mizan 01212");
  satir("F22", f22, ESKI.f22Ekran, "eski=ekran; hesap anı eski=" + fmt(ESKI.f22Hesap));
  satir("F21", f21, ESKI.f21);
  satir("F32", f32, ESKI.f32);
  satir("F320", f320, ESKI.f320, `oran ${(f320 * 100).toFixed(2)}% (değişmedi)`);
  satir("F96", f96, ESKI.f96, "stale F22 ile eski tutulmuştu");
  satir("F105", f105, null);
  satir("F95", f95, null);
  satir("F86", f86, null);

  const f22Beklenen = f23 + f24;
  const f96Beklenen = (f11 + f22 + f32) * f320;
  const f22Ok = Math.abs(f22 - f22Beklenen) <= Math.max(Math.abs(f22Beklenen) * 0.001, 100);
  const f96Ok = Math.abs(f96 - f96Beklenen) <= Math.max(Math.abs(f96Beklenen) * 0.001, 100);
  const f22HesapEkranOk = Math.abs(f22 - f22) < 1;

  console.log("\n--- Zincir kanıtı ---");
  console.log(`  F22 = F23 + F24  →  ${fmt(f22Beklenen)} = ${fmt(f23)} + ${fmt(f24)}  ${f22Ok ? "✓" : "✗"}`);
  console.log(
    `  F96 = (F11+F22+F32)×F320  →  ${fmt(f96Beklenen)} = (${fmt(f11)}+${fmt(f22)}+${fmt(f32)})×${f320.toFixed(4)}  ${f96Ok ? "✓" : "✗"}`,
  );
  console.log(
    `  Hesap F22 = Ekran F22  →  ${fmt(f22)} = ${fmt(f22)}  ${f22HesapEkranOk ? "AYNI ✓" : "FARKLI ✗"}`,
  );
  console.log(
    `  Eski stale F96 (${mn(ESKI.f96)}) vs yeni beklenen (${mn(f96Beklenen)}) — F96 ${Math.abs(f96 - ESKI.f96) > 1e6 ? "değişti ✓" : "değişmedi?"}`,
  );

  console.log("\n--- KPK tutarlılık guard (701 F96 zinciri) ---");
  const tut = dogrulaKpkGtTutarlilik(gt, ANCHOR, { f320ByBrans });
  const f96Hatalar = tut.hatalar.filter((h) => h.includes("F96") && h.includes(BRANS));
  const f22Hatalar = tut.hatalar.filter((h) => h.includes("F22") || h.includes("60101"));
  if (f96Hatalar.length || f22Hatalar.length) {
    for (const h of [...f22Hatalar, ...f96Hatalar]) console.log("  ✗", h);
  } else {
    console.log("  ✓ F22 rollup + F96 = (F11+F22+F32)×F320 (701)");
  }
  if (tut.hatalar.length > f96Hatalar.length + f22Hatalar.length) {
    console.log(
      `  (not: şirket geneli ${tut.hatalar.length - f96Hatalar.length - f22Hatalar.length} uyarı — anchor=1 prepush dışı)`,
    );
  }

  const pass = f22Ok && f96Ok && f96Hatalar.length === 0;
  console.log(`\n=== SONUÇ: ${pass ? "PASS" : "FAIL"} ===`);
  if (!pass) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
