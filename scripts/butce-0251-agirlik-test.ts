/**
 * 0251 (F275) yıl ağırlığı → V2 grup fallback yolunda GT oranı etkisini doğrular.
 * Kullanım: npx tsx scripts/butce-0251-agirlik-test.ts
 */
import { GelirTablosuMotoru } from "../lib/butce/gelir/gtMotoru";
import { MizanOranServisi } from "../lib/butce/oran/mizanOranlar";
import type { MizanRow } from "../lib/butce/types";

const BUTCE_YILI = 2027;
const BRANS = "710"; // küçük baz senaryosu için yeterli

function mizanSatir(
  yil: number,
  brans: string,
  hesap: string,
  tutar: number,
): MizanRow {
  return { yil, bransKodu: brans, hesap, tutar };
}

/** Branş bazı < 500k → V2 grup fallback devreye girer. */
function kucukBazMizan(): MizanRow[] {
  const rows: MizanRow[] = [];
  for (const yil of [2022, 2023, 2024, 2025]) {
    const oran = yil === 2025 ? -0.2 : -0.08;
    const baz = 200_000;
    rows.push(mizanSatir(yil, BRANS, "60001", baz));
    rows.push(mizanSatir(yil, BRANS, "61401", baz * oran));
    rows.push(mizanSatir(yil, "720", "60001", 800_000));
    rows.push(mizanSatir(yil, "720", "61401", 800_000 * -0.1));
  }
  return rows;
}

const varsayilan: [number, number][] = [
  [1, 0.5],
  [2, 0.25],
  [3, 0.15],
  [4, 0.1],
];
const ozel: [number, number][] = [
  [1, 0.85],
  [2, 0.1],
  [3, 0.05],
];

function f275Oran(
  mizan: MizanRow[],
  birlestirme: Record<string, [number, number][]>,
): number {
  const servis = new MizanOranServisi(mizan, BUTCE_YILI, [], true, birlestirme);
  return servis.bransOrani("0251", BRANS, "excel_gt", 12);
}

function satir180(
  mizan: MizanRow[],
  birlestirme: Record<string, [number, number][]>,
  brutPrim: number,
): number {
  const motor = new GelirTablosuMotoru(mizan, BUTCE_YILI, {}, [], true, birlestirme);
  return motor.hesaplaBrans(BRANS, brutPrim, 0, {}, 12).get(180) ?? 0;
}

const mizan = kucukBazMizan();
const oranDef = f275Oran(mizan, {});
const oranOzel = f275Oran(mizan, { "0251": ozel });
const gtDef = satir180(mizan, {}, 1_000_000);
const gtOzel = satir180(mizan, { "0251": ozel }, 1_000_000);

console.log("0251 / F275 — branş", BRANS, "(V2 grup fallback, baz < 500k)");
console.log("  varsayılan ağırlık F275:", oranDef.toFixed(6));
console.log("  özel ağırlık (85/10/5) F275:", oranOzel.toFixed(6));
console.log("  Δ F275:", (oranOzel - oranDef).toFixed(6));
console.log("  GT satır 180 (brüt prim 1M):", gtDef.toFixed(0), "→", gtOzel.toFixed(0));
console.log("  Δ GT 180:", (gtOzel - gtDef).toFixed(0));

const ok = Math.abs(oranOzel - oranDef) > 1e-6 && Math.abs(gtOzel - gtDef) > 1;
console.log(ok ? "\n✓ Ağırlık değişimi F275 ve 61401 GT satırını etkiliyor" : "\n✗ Beklenen fark yok — incele");
