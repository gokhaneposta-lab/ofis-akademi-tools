import type { TsbKanalField, TsbPrimRow, TsbSektorSegment } from "./tsbPrimDashboard";
import {
  channelPremium,
  isTsbToplamSirketKodu,
  rowMatchesAnaBransFilter,
  rowMatchesSegment,
} from "./tsbPrimDashboard";

function sumSectorPremium(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  anaBransH: string | null,
  segment: TsbSektorSegment,
): number {
  let s = 0;
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (!rowMatchesAnaBransFilter(r, anaBransH)) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    s += channelPremium(r, channel);
  }
  return s;
}

function sumCompanyPremium(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  anaBransH: string | null,
  segment: TsbSektorSegment,
  sirketKodu: number,
): number {
  let s = 0;
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (!rowMatchesAnaBransFilter(r, anaBransH)) continue;
    if (r.sirketKodu !== sirketKodu) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    s += channelPremium(r, channel);
  }
  return s;
}

export type PrimTrend12Nokta = {
  donem: string;
  sektor: number;
  sirket: number;
  /** Şirket priminin sektör içindeki payı (%) */
  payYuzde: number;
};

/** `donemBitis` dahil, geriye doğru en fazla 12 ay (veri yoksa daha kısa). */
export function buildSon12AyPrimTrend(
  rows: TsbPrimRow[],
  sortedDonemler: string[],
  donemBitis: string,
  channel: TsbKanalField,
  anaBransH: string | null,
  segment: TsbSektorSegment,
  sirketKodu: number,
): PrimTrend12Nokta[] | null {
  const idx = sortedDonemler.indexOf(donemBitis);
  if (idx < 0) return null;
  const start = Math.max(0, idx - 11);
  const slice = sortedDonemler.slice(start, idx + 1);
  return slice.map((donem) => {
    const sektor = sumSectorPremium(rows, donem, channel, anaBransH, segment);
    const sirket = sumCompanyPremium(rows, donem, channel, anaBransH, segment, sirketKodu);
    return {
      donem,
      sektor,
      sirket,
      payYuzde: sektor > 0 ? (sirket / sektor) * 100 : 0,
    };
  });
}
