/**
 * Yatırım geliri — segment / karşılaştırma KPI (MALI sayfası).
 * Tanım: `docs/tsb-kpi-tanimlari.md` §4.3
 */

export type TsbGelirTidyRowLike = {
  donem: string;
  tabloTip: string;
  bransAp: string;
  sirketTipi?: string;
  sirketKodu: number;
  sirketAdi?: string;
  hesapKodu: string | number;
  deger: number | null | undefined;
};

const BRANS_MALI = "MALI";
const TABLO_GT = "GT";

/** MALI üst grup ve düzeltme kalemleri (string `hesapKodu` ile eşleşir). */
const K66 = "66";
const SUB66 = ["664", "665", "666"] as const;
const ADDEND = ["671", "672", "674", "675", "677"] as const;

function normKod(k: string | number): string {
  return String(k).trim();
}

function sumForKod(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  sirketKodu: number,
  hesapKodu: string,
): number {
  let s = 0;
  for (const r of rows) {
    if (r.donem !== donem || r.sirketKodu !== sirketKodu) continue;
    if (r.tabloTip !== TABLO_GT || r.bransAp !== BRANS_MALI) continue;
    if (normKod(r.hesapKodu) !== hesapKodu) continue;
    s += Number(r.deger) || 0;
  }
  return s;
}

/**
 * `gelir-tidy` satırlarından, tek şirket + çeyrek için:
 *
 * `(66 − 664 − 665 − 666) + (671 + 672 + 674 + 675 + 677)`
 *
 * Tüm `deger` değerleri tidy’deki işaretiyle kullanılır. Satır yoksa ilgili kod **0**.
 */
export function yatirimGeliriSegmentKpiFromRows(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  sirketKodu: number,
): number {
  const v66 = sumForKod(rows, donem, sirketKodu, K66);
  let sub = 0;
  for (const k of SUB66) sub += sumForKod(rows, donem, sirketKodu, k);
  let rest = 0;
  for (const k of ADDEND) rest += sumForKod(rows, donem, sirketKodu, k);
  return v66 - sub + rest;
}
