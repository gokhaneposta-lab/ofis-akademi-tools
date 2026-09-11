/**
 * 701 Yangın — 2025-08 … 2026-07 prim talonu + Temmuz sonu KPK
 * npx tsx scripts/_701-kpk-talon.ts
 */
import { readFileSync } from "fs";
import { buildKpkSonuc } from "../lib/butce/kpk/buildKpkSonuc";
import { buildKpkPrimGecmisi } from "../lib/butce/kpk/kpkPrimGecmisi";
import { hesaplaKpkBrans } from "../lib/butce/kpk/kpkMotoru";
import { kpkKalanOrani, kpkTutari, policyEnd, policyStart, valuationDate } from "../lib/butce/kpk/kpkTarih";
import { buildOncekiYilPrimSerisi } from "../lib/butce/kpk/oncekiYilPrimTahmin";
import { gercekPrimFromMizan } from "../lib/butce/v2/gercekPrimFromMizan";
import { kumuldenAylikArtis } from "../lib/butce/prim/primDagilim";
import {
  loadKpkVadeRows,
  loadMizanAylikFullRows,
  loadMizanAylikRows,
  loadMizanRows,
  loadOranAyarPaket,
  loadTarifeBransPayRows,
} from "../lib/butce/loadData";
import { normalizeBransKodu } from "../lib/butce/textUtils";
import type { MizanAylikRow } from "../lib/butce/types";

const BRANS = "701";
const BUTCE = 2026;
const DEGERLEME_AY = 7;

const AY_AD = ["", "Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function fmt(n: number): string {
  if (Math.abs(n) < 1) return "0";
  return Math.round(n).toLocaleString("tr-TR");
}

function fmtMn(n: number): string {
  return `${(n / 1e6).toFixed(2)} mn`;
}

function bransPrimAylik(rows: MizanAylikRow[], yil: number, brans: string): number[] {
  const kumul = Array(12).fill(0);
  for (const r of rows) {
    if (Number(r.yil) !== yil) continue;
    if (normalizeBransKodu(r.bransKodu) !== brans) continue;
    if (String(r.hesap) !== "0111") continue;
    const ay = Number(r.ay);
    if (ay >= 1 && ay <= 12) kumul[ay - 1] += Number(r.tutar) || 0;
  }
  return kumuldenAylikArtis(kumul);
}

function mizanGtKumul(rows: MizanAylikRow[], yil: number, brans: string, gt: string, ay: number): number {
  let s = 0;
  for (const r of rows) {
    if (Number(r.yil) !== yil) continue;
    if (normalizeBransKodu(r.bransKodu) !== brans) continue;
    if (String(r.hesap) !== gt) continue;
    if (Number(r.ay) === ay) s += Number(r.tutar) || 0;
  }
  return s;
}

function vadeGun701(vadeRows: Awaited<ReturnType<typeof loadKpkVadeRows>>, ay: number): number {
  const row = vadeRows.find((r) => normalizeBransKodu(r.bransKodu) === BRANS && r.ay === ay);
  return row?.vadeGun ?? 365;
}

function kalanGunDetay(yil: number, ay: number, vade: number, degerlemeYil: number, degerlemeAy: number) {
  const start = policyStart(yil, ay);
  const end = policyEnd(yil, ay, vade);
  const val = valuationDate(degerlemeYil, degerlemeAy);
  const oran = kpkKalanOrani(yil, ay, vade, degerlemeYil, degerlemeAy);
  const totalGun = (end.getTime() - start.getTime()) / 86_400_000;
  const kalanGun = oran > 0 ? (end.getTime() - val.getTime()) / 86_400_000 : 0;
  const gecenGun = totalGun - kalanGun;
  return { oran, kalanGun: Math.max(0, kalanGun), gecenGun: Math.max(0, gecenGun), totalGun, vade };
}

async function main() {
  const mizanFull = JSON.parse(
    readFileSync("data/butce/private/mizan-aylik-full.json", "utf8"),
  ) as MizanAylikRow[];

  const [mizan, mizanAylik, mizanFullLoaded, vade, oranPaket, tarifePay] = await Promise.all([
    loadMizanRows(),
    loadMizanAylikRows(),
    loadMizanAylikFullRows(),
    loadKpkVadeRows(),
    loadOranAyarPaket(),
    loadTarifeBransPayRows(),
  ]);

  const primPaket = gercekPrimFromMizan(mizanFull, BUTCE);
  const onceki = buildOncekiYilPrimSerisi({
    butceYili: BUTCE,
    mizanAylik,
    tarifeBransPay: tarifePay,
    kapanisTahmin: null,
  });

  const cari701 = primPaket.aylikPrim.satirlar.find((s) => s.bransKodu === BRANS)?.aylar ?? Array(12).fill(0);
  const onceki701 = onceki.bransAylik[BRANS] ?? bransPrimAylik(mizanFull, BUTCE - 1, BRANS);
  const ikiOnce701 = bransPrimAylik(mizanFull, BUTCE - 2, BRANS);

  const primGecmisi = buildKpkPrimGecmisi({
    butceYili: BUTCE,
    oncekiYilPrim: onceki.bransAylik,
    cariPrim: Object.fromEntries(
      primPaket.aylikPrim.satirlar.map((s) => [s.bransKodu, s.aylar]),
    ),
    mizanAylik,
    mizanAylikFull: mizanFull,
  });

  const kpk701 = buildKpkSonuc({
    butceYili: BUTCE,
    mizan,
    mizanAylik,
    mizanAylikFull: mizanFull,
    tarifeBransPay: tarifePay,
    vadeRows: vade,
    aylikPrim: primPaket.aylikPrim,
    oranAyar: oranPaket.ayarlar,
    v2Metodoloji: true,
  }).branslar.find((b) => b.bransKodu === BRANS);

  const bransMotor = hesaplaKpkBrans({
    bransKodu: BRANS,
    butceYili: BUTCE,
    primGecmisi: primGecmisi[BRANS] ?? [],
    vadeRows: vade,
    reasurOrani: 0,
  });

  console.log("=== 701 YANGIN — veri kaynağı ===");
  console.log(`Prim kaynağı: mizan-aylik-full GT 0111 (kümülatif → aylık artış)`);
  console.log(`2025 prim serisi: ${onceki701.some((v) => v > 0) ? "mizan 2025 0111" : "oncekiYilPrimTahmin fallback"}`);
  console.log(`2024 prim serisi: ${ikiOnce701.some((v) => v > 0) ? "mizan 2024 0111" : "yok"}`);
  console.log(`2026 prim serisi: mizan 2026 0111 (maxAy=${primPaket.maxAy})`);
  console.log("");

  // Talon months: 2025-08 .. 2026-07
  type Row = {
    donem: string;
    yil: number;
    ay: number;
    prim: number;
    primKaynak: string;
    vadeGun: number;
    kalanOran: number;
    kalanGun: number;
    kpkTemmuz: number;
    gunlukPrim: number;
    kpk15GunEsdeger: number;
  };

  const rows: Row[] = [];
  const months: Array<{ yil: number; ay: number }> = [];
  for (let ay = 8; ay <= 12; ay++) months.push({ yil: 2025, ay });
  for (let ay = 1; ay <= 7; ay++) months.push({ yil: 2026, ay });

  for (const { yil, ay } of months) {
    let prim = 0;
    let primKaynak = "";
    if (yil === 2025) {
      prim = onceki701[ay - 1] ?? 0;
      primKaynak = "mizan 2025 0111";
    } else {
      prim = cari701[ay - 1] ?? 0;
      primKaynak = "mizan 2026 0111";
    }
    const v = vadeGun701(vade, ay);
    const det = kalanGunDetay(yil, ay, v, BUTCE, DEGERLEME_AY);
    const kpk = kpkTutari(prim, yil, ay, v, BUTCE, DEGERLEME_AY);
    const gunlukPrim = prim / det.totalGun;
    rows.push({
      donem: `${yil}-${String(ay).padStart(2, "0")}`,
      yil,
      ay,
      prim,
      primKaynak,
      vadeGun: v,
      kalanOran: det.oran,
      kalanGun: det.kalanGun,
      kpkTemmuz: kpk,
      gunlukPrim,
      kpk15GunEsdeger: gunlukPrim * 15,
    });
  }

  const toplamPrim = rows.reduce((a, r) => a + r.prim, 0);
  const toplamKpk = rows.reduce((a, r) => a + r.kpkTemmuz, 0);

  console.log("=== TALON: 2025-08 … 2026-07 — Temmuz 2026 sonu KPK stoku (motor) ===");
  console.log(
    "Dönem".padEnd(10) +
      "Brüt Prim".padStart(14) +
      "Vade".padStart(7) +
      "Kalan gün".padStart(11) +
      "Kalan %".padStart(9) +
      "KPK Tem".padStart(14) +
      "15gün≈".padStart(12),
  );
  console.log("-".repeat(77));
  for (const r of rows) {
    console.log(
      r.donem.padEnd(10) +
        fmt(r.prim).padStart(14) +
        String(Math.round(r.vadeGun)).padStart(7) +
        r.kalanGun.toFixed(0).padStart(11) +
        `${(r.kalanOran * 100).toFixed(1)}%`.padStart(9) +
        fmt(r.kpkTemmuz).padStart(14) +
        fmt(r.kpk15GunEsdeger).padStart(12),
    );
  }
  console.log("-".repeat(77));
  console.log(
    "TOPLAM".padEnd(10) +
      fmt(toplamPrim).padStart(14) +
      "".padStart(7) +
      "".padStart(11) +
      "".padStart(9) +
      fmt(toplamKpk).padStart(14),
  );

  const stokTem = bransMotor.cariStok[DEGERLEME_AY] ?? 0;
  console.log("");
  console.log("Rolling stok toplamı (Temmuz sonu, motor):", fmtMn(stokTem));
  console.log("Talon KPK toplamı (aktif cohortlar):", fmtMn(toplamKpk));
  console.log("Fark (≤2024 cohortlar dahil değil):", fmtMn(stokTem - toplamKpk));

  console.log("");
  console.log("=== Ocak 2026 — 601011 (F23) ===");
  const f23Ocak = bransMotor.gtAylik[23]?.[0] ?? 0;
  const f23Subat = bransMotor.gtAylik[23]?.[1] ?? 0;
  const cariStokOcak = bransMotor.cariStok[1] ?? 0;
  const cariStokAcilis = bransMotor.cariStok[0] ?? 0;
  console.log("Motor 601011 Ocak sonu (F23 seviye):", fmtMn(f23Ocak));
  console.log("Motor 601011 Şubat sonu (F23 seviye):", fmtMn(f23Subat));
  console.log("Rolling stok 31-Oca:", fmtMn(cariStokOcak));
  console.log("Rolling stok 31-Ara (açılış):", fmtMn(cariStokAcilis));
  console.log("Mizan 01211 YTD Ocak (601011 kümülatif):", fmtMn(mizanGtKumul(mizanFull, BUTCE, BRANS, "01211", 1)));

  console.log("");
  console.log("=== Temmuz 2026 — mizan mutabakat ===");
  const f23Ytd = bransMotor.gtAylik[23]?.[6] ?? 0;
  const mz01211 = mizanGtKumul(mizanFull, BUTCE, BRANS, "01211", 7);
  const mz01212 = mizanGtKumul(mizanFull, BUTCE, BRANS, "01212", 7);
  console.log("Motor 601011 Temmuz sonu (F23 seviye):", fmtMn(f23Ytd));
  console.log("Mizan 01211 YTD Temmuz (601011):", fmtMn(mz01211));
  console.log("Mizan 01212 YTD Temmuz (601012):", fmtMn(mz01212));
  console.log("Motor rolling stok 31-Tem:", fmtMn(stokTem));

  // Highlight Aug 2025 and Jul 2026
  const aug25 = rows.find((r) => r.donem === "2025-08")!;
  const jul26 = rows.find((r) => r.donem === "2026-07")!;
  console.log("");
  console.log("=== Kontrol noktaları ===");
  console.log(
    `2025-08 prim ${fmtMn(aug25.prim)} → Tem sonu KPK ${fmtMn(aug25.kpkTemmuz)} (${aug25.kalanGun.toFixed(0)} gün kalan, ${(aug25.kalanOran * 100).toFixed(1)}% of prim)`,
  );
  console.log(
    `2026-07 prim ${fmtMn(jul26.prim)} → Tem sonu KPK ${fmtMn(jul26.kpkTemmuz)} (${jul26.kalanGun.toFixed(0)} gün kalan, ${(jul26.kalanOran * 100).toFixed(1)}% of prim)`,
  );
  console.log(
    `15 günlük prim eşdeğeri (Tem yazım): ${fmtMn(jul26.kpk15GunEsdeger)} — motor KPK / (prim/365) = ${(jul26.kpkTemmuz / (jul26.prim / 365)).toFixed(0)} gün`,
  );

  // prim geçmişi list
  console.log("");
  console.log("=== Motor prim geçmişi (701) — buildKpkPrimGecmisi ===");
  for (const k of primGecmisi[BRANS] ?? []) {
    console.log(`  ${k.yil}-${String(k.ay).padStart(2, "0")}: ${fmtMn(k.prim)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
