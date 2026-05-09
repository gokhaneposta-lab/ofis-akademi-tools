import type { TsbBranchLookupMap } from "./tsbBranchLookup";
import { tarifeGrubuFromRow } from "./tsbBranchLookup";
import type { TsbKanalField, TsbPrimRow, TsbSektorSegment } from "./tsbPrimDashboard";
import {
  channelPremium,
  isTsbToplamSirketKodu,
  rowMatchesAnaBransFilter,
  rowMatchesSegment,
} from "./tsbPrimDashboard";

export type PrimTrendFiltreModu = "anaBransH" | "tarifeGrubu";

export type PrimTrendFilter =
  | { kind: "anaBransH"; anaBransH: string | null }
  | { kind: "tarifeGrubu"; tarifeGrubu: string | null; lookup: TsbBranchLookupMap | null };

function rowMatchesTrendFilter(r: TsbPrimRow, filter: PrimTrendFilter): boolean {
  if (filter.kind === "anaBransH") return rowMatchesAnaBransFilter(r, filter.anaBransH);
  const tg = tarifeGrubuFromRow(r.bransKodu, r.tarifeGrubu, filter.lookup);
  if (filter.tarifeGrubu === null) return true;
  return tg === filter.tarifeGrubu;
}

/** Seçilen segmentte, ilgili dönemde görünen tarife grupları (satır + lookup). */
export function uniqueTarifeGruplariForSegment(
  rows: TsbPrimRow[],
  donem: string,
  segment: TsbSektorSegment,
  lookup: TsbBranchLookupMap | null,
): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    set.add(tarifeGrubuFromRow(r.bransKodu, r.tarifeGrubu, lookup));
  }
  return [...set].sort((a, b) => a.localeCompare(b, "tr"));
}

function sumSectorPremium(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  segment: TsbSektorSegment,
  filter: PrimTrendFilter,
): number {
  let s = 0;
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (!rowMatchesTrendFilter(r, filter)) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    s += channelPremium(r, channel);
  }
  return s;
}

function sumCompanyPremium(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  segment: TsbSektorSegment,
  filter: PrimTrendFilter,
  sirketKodu: number,
): number {
  let s = 0;
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (!rowMatchesTrendFilter(r, filter)) continue;
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
  segment: TsbSektorSegment,
  sirketKodu: number,
  filter: PrimTrendFilter,
): PrimTrend12Nokta[] | null {
  const idx = sortedDonemler.indexOf(donemBitis);
  if (idx < 0) return null;
  const start = Math.max(0, idx - 11);
  const slice = sortedDonemler.slice(start, idx + 1);
  return slice.map((donem) => {
    const sektor = sumSectorPremium(rows, donem, channel, segment, filter);
    const sirket = sumCompanyPremium(rows, donem, channel, segment, filter, sirketKodu);
    return {
      donem,
      sektor,
      sirket,
      payYuzde: sektor > 0 ? (sirket / sektor) * 100 : 0,
    };
  });
}
