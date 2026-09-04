/**
 * GT alt kodu → Excel F satır no — mizan-aylik-full overlay için tam harita.
 * gt_excel_harita + gt_tam_harita birleşimi.
 */

import gtExcelRaw from "../data/gt_excel_harita.json";
import gtTamRaw from "../data/gt_tam_harita.json";

type HaritaSatir = { satir: number; kod: string | null; alt_satirlar?: number[] };

const gtExcel = gtExcelRaw as { tum_satirlar: HaritaSatir[] };
const gtTam = gtTamRaw as { tahmin_alani: HaritaSatir[] };

/** GT kod → F satır (excel harita öncelikli). */
export const GT_KOD_TO_SATIR: Readonly<Record<string, number>> = (() => {
  const map: Record<string, number> = {};
  for (const row of gtTam.tahmin_alani) {
    if (row.kod) map[row.kod] = row.satir;
  }
  for (const row of gtExcel.tum_satirlar) {
    if (row.kod) map[row.kod] = row.satir;
  }
  return map;
})();

/** Üst satır = alt satırların toplamı (gt_tam_harita alt_satirlar). */
export const GT_PARENT_ROLLUPS: ReadonlyArray<readonly [number, readonly number[]]> = (() => {
  const out: Array<[number, readonly number[]]> = [];
  for (const row of gtTam.tahmin_alani) {
    if (row.alt_satirlar && row.alt_satirlar.length > 0) {
      out.push([row.satir, row.alt_satirlar]);
    }
  }
  return out;
})();

/** Mizan kod kümesinde yaprak (en derin) kodları seç — çift sayımı önler. */
export function yaprakGtKodlari(kodlar: Iterable<string>): Set<string> {
  const arr = [...new Set(kodlar)];
  const leaves = new Set<string>();
  for (const k of arr) {
    const childVar = arr.some((other) => other !== k && other.startsWith(k));
    if (!childVar) leaves.add(k);
  }
  return leaves;
}

export function kumulToIncremental(kumul: number[]): number[] {
  const out: number[] = [];
  let prev = 0;
  for (let i = 0; i < 12; i++) {
    const v = kumul[i] ?? 0;
    out.push(v - prev);
    prev = v;
  }
  return out;
}
