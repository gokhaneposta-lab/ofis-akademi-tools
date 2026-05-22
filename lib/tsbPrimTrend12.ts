import type {
  TsbKanalField,
  TsbPrimDaraltma,
  TsbPrimDaraltmaModu,
  TsbPrimRow,
  TsbSektorSegment,
} from "./tsbPrimDashboard";
import {
  channelPremium,
  isTsbToplamSirketKodu,
  rowMatchesPrimDaraltma,
  rowMatchesSegment,
} from "./tsbPrimDashboard";

export type PrimTrendFiltreModu = TsbPrimDaraltmaModu;
export type PrimTrendFilter = TsbPrimDaraltma;

export { uniqueTarifeGruplariForSegment } from "./tsbPrimDashboard";

function sumSectorPremium(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  segment: TsbSektorSegment,
  filter: TsbPrimDaraltma,
): number {
  let s = 0;
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (!rowMatchesPrimDaraltma(r, filter)) continue;
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
  filter: TsbPrimDaraltma,
  sirketKodu: number,
): number {
  let s = 0;
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (!rowMatchesPrimDaraltma(r, filter)) continue;
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
  /** Şirket priminin sektör içindeki payı (%) — kümülatif prim üzerinden */
  payYuzde: number;
};

/** Takvim yılı içi kümülatif prim serisinden ay ay üretim (o ayın primi). */
export type PrimTrendAylikNokta = {
  donem: string;
  sektorAylik: number;
  sirketAylik: number;
  /** Aylık prim üzerinden şirket payı (%) */
  payYuzde: number;
};

function isYeniTakvimYili(oncekiDonem: string, donem: string): boolean {
  return oncekiDonem.slice(0, 4) !== donem.slice(0, 4);
}

/** Kümülatif seriyi aylık üretime çevirir (Ocak veya yıl değişiminde değer = o ay kümülatifi). */
export function kumulatifSeridenAylikUretim(seri: PrimTrend12Nokta[]): PrimTrendAylikNokta[] {
  return seri.map((p, i) => {
    const prev = i > 0 ? seri[i - 1] : null;
    const yilBasi = prev === null || isYeniTakvimYili(prev.donem, p.donem);
    const sektorAylik = yilBasi ? p.sektor : p.sektor - prev!.sektor;
    const sirketAylik = yilBasi ? p.sirket : p.sirket - prev!.sirket;
    return {
      donem: p.donem,
      sektorAylik,
      sirketAylik,
      payYuzde: sektorAylik > 0 ? (sirketAylik / sektorAylik) * 100 : 0,
    };
  });
}

/** `donemBitis` dahil, geriye doğru en fazla 12 ay (veri yoksa daha kısa). */
export function buildSon12AyPrimTrend(
  rows: TsbPrimRow[],
  sortedDonemler: string[],
  donemBitis: string,
  channel: TsbKanalField,
  segment: TsbSektorSegment,
  sirketKodu: number,
  filter: TsbPrimDaraltma,
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
