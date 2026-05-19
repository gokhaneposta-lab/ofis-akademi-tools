/**
 * SAFİ teknik kar/zarar — `docs/tsb-kpi-tanimlari.md` §4.2
 */

import type { TsbGelirTidyRowLike } from "./tsbYatirimGeliriKpi";

const TABLO_GT = "GT";
const BRANS = "HAYATDISI";

function normKod(k: string | number): string {
  return String(k).trim();
}

function sumHayatdisi(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  sirketKodu: number,
  hesapKodu: string,
): number {
  let s = 0;
  for (const r of rows) {
    if (r.donem !== donem || r.sirketKodu !== sirketKodu) continue;
    if (r.tabloTip !== TABLO_GT || r.bransAp !== BRANS) continue;
    if (normKod(r.hesapKodu) !== hesapKodu) continue;
    s += Number(r.deger) || 0;
  }
  return s;
}

/**
 * SAFİ_TEKNİK = (60 − 603) + (61 − 61402 − 61403 − 61404 − 61405 − 61406)
 * Tüm `deger` değerleri tidy’deki işaretiyle; satır yoksa ilgili kod **0**.
 */
export function safiTeknikKzFromRows(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  sirketKodu: number,
): number {
  const d60 = sumHayatdisi(rows, donem, sirketKodu, "60");
  const d603 = sumHayatdisi(rows, donem, sirketKodu, "603");
  const d61 = sumHayatdisi(rows, donem, sirketKodu, "61");
  const g614 = ["61402", "61403", "61404", "61405", "61406"] as const;
  let g = 0;
  for (const k of g614) g += sumHayatdisi(rows, donem, sirketKodu, k);
  return d60 - d603 + (d61 - g);
}
