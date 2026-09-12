/**
 * Bütçe V2 vs 2026 mizan — hesap / Safi TKZ karşılaştırması (Mart & Temmuz YTD)
 * npx tsx scripts/butce-v2-mizan-karsilastir.ts
 */
import { readFileSync } from "fs";
import { buildV2GelirTablosu } from "../lib/butce/v2/buildV2GelirTablosu";
import { alignTarifeHedefleri, v3DefaultsStore2026 } from "../lib/butce/v3/defaults";
import { primHedefFromTarifeAna } from "../lib/butce/v3/primFromToplam";
import { syntheticSatisFromTarife } from "../lib/butce/v3/syntheticSatis";
import { DagitimMotoru } from "../lib/butce/prim/dagitimMotoru";
import { referansYilAgirliklari } from "../lib/butce/config/constants";
import { buildV3GelirTablosu } from "../lib/butce/v3/buildV3GelirTablosu";
import { extractMizanGtAylik, ytdGtPrefix } from "../lib/butce/v3/mizanGtExtract";
import { gtKodToSatir, HESAP_TO_GT } from "../lib/butce/v3/mizanFormatHarita";
import { mizanV3Recon } from "../lib/butce/v3/mizanV3Recon";
import type { GelirTablosuSonuc } from "../lib/butce/gelir/gelirTablosu";
import {
  loadBilancoAylikRows,
  loadKpkKapanisTahmin,
  loadKpkVadeRows,
  loadMizanAylikFullRows,
  loadMizanAylikRows,
  loadMizanRows,
  loadOranAyarPaket,
  loadSatisButceRows,
  loadTarifeBransPayRows,
  loadTarifeMapRows,
  loadUretimRows,
  loadV2Varsayimlar,
} from "../lib/butce/loadData";
import type { MizanAylikRow } from "../lib/butce/types";

const tl = (n: number) => Math.round(n).toLocaleString("tr-TR");
const mn = (n: number) => `${(n / 1e6).toFixed(1)} mn`;

type MizanRowLike = { yil: number; ay: number; hesap: string; bransKodu: string; tutar: number };

/** GT yaprak kodları — kümülatif YTD → aylık incremental. */
function buildKumulMap(rows: MizanRowLike[], yil: number) {
  const kodlar = new Set(rows.filter((r) => r.yil === yil).map((r) => String(r.hesap)));
  const leaves = [...kodlar].filter((k) => ![...kodlar].some((o) => o !== k && o.startsWith(k)));
  const m = new Map<string, number[]>();
  for (const k of leaves) m.set(k, Array(12).fill(0));
  for (const r of rows) {
    if (r.yil !== yil) continue;
    const k = String(r.hesap);
    if (!m.has(k)) continue;
    const ay = Number(r.ay);
    if (ay >= 1 && ay <= 12) m.get(k)![ay - 1] += Number(r.tutar) || 0;
  }
  return m;
}

function ytdIncremental(kumul: Map<string, number[]>, gtKod: string, throughAy: number): number {
  let t = 0;
  for (const [k, ser] of kumul) {
    if (!(k === gtKod || k.startsWith(gtKod))) continue;
    let prev = 0;
    for (let i = 0; i < throughAy; i++) {
      const v = ser[i] ?? 0;
      t += v - prev;
      prev = v;
    }
  }
  return t;
}

function ytdCumulative(kumul: Map<string, number[]>, gtKod: string, ay: number): number {
  let t = 0;
  for (const [k, ser] of kumul) {
    if (!(k === gtKod || k.startsWith(gtKod))) continue;
    t += ser[ay - 1] ?? 0;
  }
  return t;
}

const HESAP_GT: Array<{ hesap: string; gt: string; satir: number; ad: string; kaynak: string }> = [
  { hesap: "601011", gt: "01211", satir: 23, ad: "KPK cari (F23)", kaynak: "KPK motoru" },
  { hesap: "601012", gt: "01212", satir: 24, ad: "Devreden KPK (F24)", kaynak: "KPK motoru" },
  { hesap: "601031", gt: "01231", satir: 29, ad: "KPK SGK cari (F29)", kaynak: "KPK motoru" },
  { hesap: "601032", gt: "01232", satir: 30, ad: "Devreden KPK SGK (F30)", kaynak: "KPK motoru" },
  { hesap: "61401", gt: "0251", satir: 177, ad: "Üretim komisyon (F177)", kaynak: "Teknik oran F275 × prim" },
  { hesap: "61408", gt: "0258", satir: 200, ad: "Diğer faaliyet (F200)", kaynak: "Teknik oran F383 × prim" },
];

const SAFI_BILESENLER = {
  gelir: ["011", "012", "013", "014", "016"] as const,
  gider: ["021", "022", "024", "025"] as const,
};

async function main() {
  const fullRaw = JSON.parse(readFileSync("data/butce/private/mizan-aylik-full.json", "utf8")) as MizanRowLike[];
  const kumul26 = buildKumulMap(fullRaw, 2026);

  const [
    satis, uretim, tarifeMap, tarifeBransPay, mizan, mizanAylik, mizanAylikFull,
    bilancoAylik, oranPaket, kpkVade, kapanisTahmin, v2Saved,
  ] = await Promise.all([
    loadSatisButceRows(), loadUretimRows(), loadTarifeMapRows(), loadTarifeBransPayRows(),
    loadMizanRows(), loadMizanAylikRows(), loadMizanAylikFullRows(), loadBilancoAylikRows(),
    loadOranAyarPaket(), loadKpkVadeRows(), loadKpkKapanisTahmin(), loadV2Varsayimlar(),
  ]);

  const v3def = v3DefaultsStore2026();
  const referansEtiket = v2Saved?.referansEtiket ?? v3def.referansEtiket ?? "Son 2 Yıl Ortalaması (2024-2025)";
  const yilAgirliklari = referansYilAgirliklari(referansEtiket, v2Saved?.yilAgirliklari ?? v3def.yilAgirliklari);
  const tarifeHedefleri = alignTarifeHedefleri(
    v2Saved?.tarifeHedefleri ?? v3def.tarifeHedefleri,
    satis,
  );
  let satisRows = satis;
  if (satisRows.length === 0 && Object.keys(tarifeHedefleri).length > 0) {
    satisRows = syntheticSatisFromTarife(tarifeHedefleri);
  }

  let primOverride: Record<string, number> | undefined;
  let endirektOverride: Record<string, number> | undefined;
  if (Object.keys(tarifeHedefleri).length > 0) {
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
      for (const b of dagitim.bransDirektEndirekt) endirektOverride[b.bransKodu] = b.endirektPrim;
    } else {
      const fb = primHedefFromTarifeAna(tarifeHedefleri, mizan, 2026);
      primOverride = fb.primHedefleri;
      endirektOverride = fb.endirektPrim;
    }
  }

  const varsayimlar = {
    butceYili: 2026,
    tarifeHedefleri,
    referansEtiket,
    yilAgirliklari,
    giderArtisOrani: v2Saved?.giderArtisOrani ?? 0,
    faaliyetGiderButce: v2Saved?.faaliyetGiderButce ?? v3def.faaliyetGiderButce,
    aylikGetiriOrani: v2Saved?.aylikGetiriOrani ?? v3def.aylikGetiriOrani,
  };

  const sonuc = buildV2GelirTablosu({
    varsayimlar,
    satisRows,
    primHedefleriOverride: primOverride,
    endirektPrimOverride: endirektOverride,
    uretim,
    tarifeMap,
    tarifeBransPay,
    mizan,
    mizanAylik,
    mizanAylikFull,
    bilancoAylik,
    oranAyar: oranPaket.ayarlar,
    kalemYilBirlestirme: oranPaket.kalemYilBirlestirme,
    kpkVade,
    kapanisTahmin,
  });

  const v3Sonuc = buildV3GelirTablosu({
    varsayimlar: { ...v3def, tarifeHedefleri },
    satisRows,
    uretim,
    tarifeMap,
    tarifeBransPay,
    mizan,
    mizanAylik,
    mizanAylikFull,
    bilancoAylik,
    oranAyar: oranPaket.ayarlar,
    kpkVade,
    kapanisTahmin,
  });

  const gt = sonuc.gt;
  const gtV3 = v3Sonuc.gt;
  const ytdGt = (g: GelirTablosuSonuc, satir: number, throughAy: number) =>
    (g.aylikToplam[satir] ?? []).slice(0, throughAy).reduce((a, x) => a + x, 0);
  const ytdV2 = (satir: number, throughAy: number) => ytdGt(gt, satir, throughAy);
  const ytdV3 = (satir: number, throughAy: number) => ytdGt(gtV3, satir, throughAy);

  const { sirketGt } = extractMizanGtAylik(mizanAylikFull, 2026);
  const mizanHesapYtd = (hesap: string, ay: number) => {
    const gtKod = HESAP_TO_GT[hesap];
    return gtKod ? ytdGtPrefix(sirketGt, gtKod, ay) : 0;
  };

  const mizanSafi = (throughAy: number) => {
    let t = 0;
    for (const p of SAFI_BILESENLER.gelir) t += ytdIncremental(kumul26, p, throughAy);
    for (const p of SAFI_BILESENLER.gider) t += ytdIncremental(kumul26, p, throughAy);
    return t;
  };

  console.log("=== BÜTÇE V2 vs MİZAN — 2026 YTD karşılaştırma ===");
  console.log(`Prim hedef kaynağı: ${v2Saved ? "v2-varsayimlar" : "v3 defaults seed"} | satis=${satis.length} sentetik=${satisRows.length !== satis.length}`);
  console.log(`Tarife map=${tarifeMap.length} bransPay=${tarifeBransPay.length} | prim branş=${Object.keys(primOverride ?? {}).length}`);
  console.log(`Brüt prim hedefi (yıllık): ${tl(gt.brutPrimToplam)}`);

  for (const ay of [3, 7] as const) {
    console.log(`\n--- ${ay === 3 ? "MART" : "TEMMUZ"} sonu YTD (Ocak–${ay === 3 ? "Mart" : "Temmuz"} incremental toplam) ---`);
    console.log(
      `${"Hesap".padEnd(8)} ${"GT".padEnd(6)} ${"Satır".padStart(5)}  ${"Mizan".padStart(16)}  ${"V2 Bütçe".padStart(16)}  ${"V3".padStart(12)}  ${"V2−Mizan".padStart(12)}`,
    );
    console.log("-".repeat(95));

    for (const h of HESAP_GT) {
      const mz = mizanHesapYtd(h.hesap, ay);
      const v2 = ytdV2(h.satir, ay);
      const v3 = ytdV3(h.satir, ay);
      const fark = v2 - mz;
      const pctF = mz !== 0 ? ` (${((fark / Math.abs(mz)) * 100).toFixed(1)}%)` : "";
      console.log(
        `${h.hesap.padEnd(8)} ${h.gt.padEnd(6)} ${String(h.satir).padStart(5)}  ${tl(mz).padStart(16)}  ${tl(v2).padStart(16)}  ${tl(v3).padStart(12)}  ${tl(fark).padStart(12)}${pctF}`,
      );
    }

    const recon = mizanV3Recon(gtV3, mizanAylikFull, 2026, ay);
    const v2Safi = ytdV2(9003, ay);
    const v3Safi = ytdV3(9003, ay);
    const farkSafi = v2Safi - recon.safiTkzMizan;
    console.log("-".repeat(95));
    console.log(
      `${"SAFİ TKZ".padEnd(8)} ${"".padEnd(6)} ${"9003".padStart(5)}  ${tl(recon.safiTkzMizan).padStart(16)}  ${tl(v2Safi).padStart(16)}  ${tl(v3Safi).padStart(12)}  ${tl(farkSafi).padStart(12)} (${mn(farkSafi)})`,
    );
    console.log(`  (Mizan kolonu = format7 gerçekleşme; V3 = mizan kilidi + H2 projeksiyon)`);

    // KPK rollup kontrolü
    const mzKpk21 = ytdIncremental(kumul26, "012", ay);
    const v2Kpk21 = ytdV2(21, ay);
    console.log(
      `\n  KPK toplam (012→F21): mizan ${tl(mzKpk21)} | V2 ${tl(v2Kpk21)} | fark ${tl(v2Kpk21 - mzKpk21)}`,
    );
    console.log(
      `  Brüt prim (0111):     mizan ${tl(ytdIncremental(kumul26, "0111", ay))} | V2 F11 ${tl(ytdV2(11, ay))}`,
    );
  }

  // Mart TKZ kök neden analizi
  console.log("\n=== MART TKZ — kök neden dökümü (V2 YTD Mart) ===");
  const bilesenler: Array<{ ad: string; satir: number; gt?: string }> = [
    { ad: "Brüt prim F11", satir: 11, gt: "0111" },
    { ad: "KPK F21", satir: 21, gt: "012" },
    { ad: "  F23 cari KPK", satir: 23, gt: "01211" },
    { ad: "  F24 devreden", satir: 24, gt: "01212" },
    { ad: "  F29 SGK cari", satir: 29, gt: "01231" },
    { ad: "  F30 SGK devr.", satir: 30, gt: "01232" },
    { ad: "DERK F31", satir: 31, gt: "013" },
    { ad: "Hasar net F95", satir: 95, gt: "021" },
    { ad: "Muallak F114", satir: 114, gt: "022" },
    { ad: "Dengeleme F164", satir: 164, gt: "024" },
    { ad: "Komisyon F177", satir: 177, gt: "0251" },
    { ad: "Faaliyet F200", satir: 200, gt: "0258" },
    { ad: "Teknik faaliyet 9006", satir: 9006 },
    { ad: "Matematik F202", satir: 202 },
  ];

  let v2Gelir = 0;
  let v2Gider = 0;
  for (const b of bilesenler) {
    const v2 = ytdV2(b.satir, 3);
    const mz = b.gt ? ytdIncremental(kumul26, b.gt, 3) : NaN;
    const katki = [10, 21, 31, 83, 86].includes(b.satir)
      ? "gelir"
      : [95, 114, 157, 164, 9006, 202].includes(b.satir) || b.satir === 177 || b.satir === 200
        ? "gider"
        : "—";
    if (katki === "gelir") v2Gelir += v2;
    if (katki === "gider") v2Gider += v2;
    console.log(
      `  ${b.ad.padEnd(22)} V2=${tl(v2).padStart(14)}${b.gt ? `  mizan=${tl(mz).padStart(14)}  Δ=${tl(v2 - mz).padStart(12)}` : ""}`,
    );
  }
  console.log(`\n  V2 Teknik gelir bileşen (9001 proxy): ~${tl(ytdV2(9001, 3))}`);
  console.log(`  V2 Teknik gider bileşen (9002 proxy): ~${tl(ytdV2(9002, 3))}`);
  console.log(`  V2 Safi TKZ (9003):                  ${tl(ytdV2(9003, 3))}  vs mizan ${tl(mizanSafi(3))}`);

  // Aylık Safi TKZ profili
  console.log("\n=== Safi TKZ aylık profil (V2 vs mizan incremental) ===");
  console.log(`${"Ay".padEnd(6)} ${"Mizan".padStart(14)} ${"V2".padStart(14)} ${"Küm.V2".padStart(14)} ${"Küm.Mizan".padStart(14)}`);
  let kumV2 = 0;
  let kumMz = 0;
  const safiYtd = (throughAy: number) => mizanSafi(throughAy);
  for (let i = 0; i < 7; i++) {
    const v2 = gt.aylikToplam[9003]?.[i] ?? 0;
    kumV2 += v2;
    const mz = safiYtd(i + 1) - safiYtd(i);
    kumMz += mz;
    const ayAd = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem"][i]!;
    console.log(
      `${ayAd.padEnd(6)} ${tl(mz).padStart(14)} ${tl(v2).padStart(14)} ${tl(kumV2).padStart(14)} ${tl(kumMz).padStart(14)}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
