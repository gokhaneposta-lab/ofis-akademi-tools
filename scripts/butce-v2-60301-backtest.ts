/**
 * 2025 gerçekleşen Aylık GT (kümülatif → aylık delta) + bilanço stok
 * ile V2 mali gelir proxy'yi koştur; Σ 60301 ile sapmayı raporla.
 *
 * Not: Excel NET yılıçi kümülatiftir (ay 3 = 01+02+03).
 * GT akışları kumuldenAylikArtis ile aylığa çevrilir.
 * Bilanço 1xx ay sonu stok seviyesidir (delta değil).
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { kumuldenAylikArtis } from "../lib/butce/prim/primDagilim";
import { resolveAcilisBanka, buildMaliGelirProxy } from "../lib/butce/v2/maliGelirProxy";
import type { BilancoAylikRow, MizanAylikRow, MizanRow } from "../lib/butce/types";

const PRIVATE = join(process.cwd(), "data", "butce", "private");

function loadJson<T>(name: string): T {
  const p = join(PRIVATE, name);
  if (!existsSync(p)) throw new Error(`Yok: ${p}`);
  return JSON.parse(readFileSync(p, "utf8")) as T;
}

function pct(n: number): string {
  if (!Number.isFinite(n)) return "n/a";
  return `${(n * 100).toFixed(2)}%`;
}

function tl(n: number): string {
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
}

/** Branş×ay kümülatif GT kodunu şirket toplam aylık delta dizisine çevir. */
function gtKodAylikDelta(
  full: MizanAylikRow[],
  yil: number,
  kodlar: string[],
): number[] {
  const kodSet = new Set(kodlar);
  // brans|kod -> kumul[12]
  const maps = new Map<string, number[]>();
  for (const r of full) {
    if (r.yil !== yil) continue;
    const kod = String(r.hesap);
    if (!kodSet.has(kod)) continue;
    const key = `${r.bransKodu}|${kod}`;
    let arr = maps.get(key);
    if (!arr) {
      arr = Array(12).fill(0);
      maps.set(key, arr);
    }
    if (r.ay >= 1 && r.ay <= 12) arr[r.ay - 1] = Number(r.tutar) || 0;
  }
  const sum = Array(12).fill(0);
  for (const kumul of maps.values()) {
    const aylik = kumuldenAylikArtis(kumul);
    for (let i = 0; i < 12; i++) sum[i] += Math.abs(aylik[i]!);
  }
  return sum;
}

/** 0141 yıl sonu kümülatif (Δ ayların toplamı = Dec) — gerçekleşen mali gelir. */
function gercek60301(
  mizan: MizanRow[],
  full: MizanAylikRow[],
  yil: number,
): { mizanYilsonu: number; gt0141Aralik: number; gt0141AylikToplam: number } {
  const mizanYilsonu = mizan
    .filter((r) => r.yil === yil && String(r.hesap).replace(/\D/g, "").startsWith("60301"))
    .reduce((a, r) => a + (Number(r.tutar) || 0), 0);

  let gt0141Aralik = 0;
  const byBrans = new Map<string, number[]>();
  for (const r of full) {
    if (r.yil !== yil || String(r.hesap) !== "0141") continue;
    let arr = byBrans.get(r.bransKodu);
    if (!arr) {
      arr = Array(12).fill(0);
      byBrans.set(r.bransKodu, arr);
    }
    if (r.ay >= 1 && r.ay <= 12) arr[r.ay - 1] = Number(r.tutar) || 0;
  }
  let gt0141AylikToplam = 0;
  for (const kumul of byBrans.values()) {
    gt0141Aralik += kumul[11] ?? 0;
    for (const d of kumuldenAylikArtis(kumul)) gt0141AylikToplam += d;
  }
  return { mizanYilsonu, gt0141Aralik, gt0141AylikToplam };
}

function implyMonthlyYield(
  proxyBaseFlows: Record<number, number[]>,
  acilis: number,
  hedefYillik: number,
): number {
  // Basit bisection: sabit aylık getiri → maliGelirYillik ≈ hedef
  let lo = 0;
  let hi = 0.15;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    const p = buildMaliGelirProxy({
      aylikToplam: proxyBaseFlows,
      aylikGetiriOrani: Array(12).fill(mid),
      acilisBanka: acilis,
      acilisKaynak: "102/100",
    });
    if (p.maliGelirYillik > hedefYillik) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

function main() {
  const mizan = loadJson<MizanRow[]>("mizan-tidy.json");
  const full = loadJson<MizanAylikRow[]>("mizan-aylik-full.json");
  const bilanco = loadJson<BilancoAylikRow[]>("bilanco-aylik-tidy.json");

  const yil = 2025;
  const g = gercek60301(mizan, full, yil);
  console.log("=== 2025 gerçekleşen mali gelir (60301 / 0141) ===");
  console.log("mizan-tidy Σ 60301 (köprü, yılsonu):", tl(g.mizanYilsonu));
  console.log("GT 0141 Aralık kümülatif (Σ branş):", tl(g.gt0141Aralik));
  console.log("GT 0141 aylık delta toplamı:", tl(g.gt0141AylikToplam));
  console.log(
    "(kontrol) kümülatif−delta tutarlı mı?",
    Math.abs(g.gt0141Aralik - g.gt0141AylikToplam) < 1 ? "EVET" : "HAYIR",
  );

  const hedef = Math.abs(g.mizanYilsonu || g.gt0141Aralik);
  if (hedef <= 0) throw new Error("2025 60301/0141 bulunamadı");

  // Proxy GT satır eşlemesi — gerçekleşen GT kodlarından
  const flows: Record<number, number[]> = {
    11: gtKodAylikDelta(full, yil, ["0111"]), // brüt yazılan (60001) — alt kırılım 01111/12 çift sayım
    105: gtKodAylikDelta(full, yil, ["0212"]),
    86: gtKodAylikDelta(full, yil, ["016"]),
    96: gtKodAylikDelta(full, yil, ["0211"]),
    177: gtKodAylikDelta(full, yil, ["0251"]),
    19: gtKodAylikDelta(full, yil, ["0112"]),
    190: gtKodAylikDelta(full, yil, ["0252"]),
    191: gtKodAylikDelta(full, yil, ["0253"]),
    192: gtKodAylikDelta(full, yil, ["0254"]),
    193: gtKodAylikDelta(full, yil, ["0255"]),
    194: gtKodAylikDelta(full, yil, ["0256"]),
  };

  console.log("\n=== 2025 aylık akışlar (kümülatiften delta, mutlak) ===");
  for (const [satir, arr] of Object.entries(flows)) {
    console.log(`  F${satir} yıllık Σ:`, tl(arr.reduce((a, b) => a + b, 0)));
  }

  const acilis = resolveAcilisBanka({
    butceYili: yil,
    bilancoAylik: bilanco,
    mizan,
  });
  console.log("\n=== Açılış banka (2024 sonu stok) ===");
  console.log(tl(acilis.tutar), acilis.kaynak);

  // Senaryo A: sabit %3/ay (V2 varsayılan)
  const sA = buildMaliGelirProxy({
    aylikToplam: flows,
    aylikGetiriOrani: Array(12).fill(0.03),
    acilisBanka: acilis.tutar,
    acilisKaynak: acilis.kaynak,
  });
  // Senaryo B: sabit %2 / %4
  const sB = buildMaliGelirProxy({
    aylikToplam: flows,
    aylikGetiriOrani: Array(12).fill(0.02),
    acilisBanka: acilis.tutar,
    acilisKaynak: acilis.kaynak,
  });
  const sC = buildMaliGelirProxy({
    aylikToplam: flows,
    aylikGetiriOrani: Array(12).fill(0.04),
    acilisBanka: acilis.tutar,
    acilisKaynak: acilis.kaynak,
  });
  // Senaryo D: hedef 60301'i tutturan sabit aylık getiri (tersine çözüm)
  const gImplied = implyMonthlyYield(flows, acilis.tutar, hedef);
  const sD = buildMaliGelirProxy({
    aylikToplam: flows,
    aylikGetiriOrani: Array(12).fill(gImplied),
    acilisBanka: acilis.tutar,
    acilisKaynak: acilis.kaynak,
  });

  function report(label: string, p: typeof sA) {
    const sapma = p.maliGelirYillik / hedef - 1;
    console.log(
      `${label}: proxy=${tl(p.maliGelirYillik)} | gerçekleşen=${tl(hedef)} | sapma=${pct(sapma)} | negatifAylar=${p.negatifBakiyeAylar.join(",") || "-"}`,
    );
  }

  console.log("\n=== Proxy vs 60301 ===");
  report("A) sabit %3/ay", sA);
  report("B) sabit %2/ay", sB);
  report("C) sabit %4/ay", sC);
  console.log(
    `D) 60301'i tutturan sabit aylık getiri ≈ ${pct(gImplied)} → proxy=${tl(sD.maliGelirYillik)} (doğrulama sapma ${pct(sD.maliGelirYillik / hedef - 1)})`,
  );

  console.log("\n=== A senaryosu ay detay (negatif flag) ===");
  for (const a of sA.aylar) {
    if (a.negatifBakiye || a.ay <= 3 || a.ay === 12) {
      console.log(
        `${a.ayAd}: baş=${tl(a.ayBasiBanka)} net=${tl(a.netNakit)} mg=${tl(a.maliGelir)} son=${tl(a.aySonuBanka)}${a.negatifBakiye ? " NEG" : ""}`,
      );
    }
  }
}

main();
