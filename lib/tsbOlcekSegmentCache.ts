/**
 * Ölçek segmenti önbellek tipleri ve istemci-güvenli yardımcılar.
 * Sunucu yazma/okuma: `tsbOlcekSegmentCache.server.ts`
 */

import {
  olcekSegmentKisaAdi,
  type OlcekSegmentHarfi,
  type OlcekSegmentSirketKayit,
} from "./tsbOlcekSegment";
import type { SegmentSkorPool } from "./tsbSirketSegmentSkor";

export type OlcekSegmentKpiOzet = {
  segment: OlcekSegmentHarfi;
  kpi: string;
  ortalama: number | null;
  medyan: number | null;
  sirketSayisi: number;
};

export type OlcekSegmentDonemPool = {
  peerSayisi: number;
  segmentDagilimi: Record<OlcekSegmentHarfi, number>;
  sirketler: OlcekSegmentSirketKayit[];
  segmentOzetleri: OlcekSegmentKpiOzet[];
};

export type OlcekSegmentCache = {
  guncellemeIso: string;
  donemler: string[];
  sonFinDonem: string;
  hubOzet: {
    HD: number;
    HAYAT_EMEKLILIK: number;
  };
  byDonem: Record<string, Partial<Record<SegmentSkorPool, OlcekSegmentDonemPool>>>;
};

export function resolveOlcekFinDonem(primDonem: string, gelirDonemler: string[]): string | null {
  if (gelirDonemler.includes(primDonem)) return primDonem;
  const sorted = [...gelirDonemler].sort();
  let best: string | null = null;
  for (const d of sorted) {
    if (d <= primDonem) best = d;
  }
  return best ?? sorted[sorted.length - 1] ?? null;
}

export function olcekSegmentKayitFromCache(
  cache: OlcekSegmentCache | null,
  donem: string,
  pool: SegmentSkorPool,
  sirketKodu: number,
): OlcekSegmentSirketKayit | null {
  if (!cache) return null;
  const finDonem = resolveOlcekFinDonem(donem, cache.donemler);
  if (!finDonem) return null;
  const poolData = cache.byDonem[finDonem]?.[pool];
  if (!poolData) return null;
  return poolData.sirketler.find((s) => s.sirketKodu === sirketKodu) ?? null;
}

export function olcekSegmentPeerKodlariFromCache(
  cache: OlcekSegmentCache | null,
  donem: string,
  pool: SegmentSkorPool,
  sirketKodu: number,
): { segment: OlcekSegmentHarfi | null; kodlar: number[]; kayit: OlcekSegmentSirketKayit | null } {
  const kayit = olcekSegmentKayitFromCache(cache, donem, pool, sirketKodu);
  if (!kayit) return { segment: null, kodlar: [], kayit: null };
  const finDonem = resolveOlcekFinDonem(donem, cache?.donemler ?? []);
  if (!finDonem || !cache) return { segment: kayit.olcekSegment, kodlar: [], kayit };
  const poolData = cache.byDonem[finDonem]?.[pool];
  if (!poolData) return { segment: kayit.olcekSegment, kodlar: [], kayit };
  const kodlar = poolData.sirketler
    .filter((s) => s.olcekSegment === kayit.olcekSegment)
    .map((s) => s.sirketKodu);
  return { segment: kayit.olcekSegment, kodlar, kayit };
}

export function primSegmentToOlcekPool(segment: "hayatdisi" | "hayat"): SegmentSkorPool {
  return segment === "hayatdisi" ? "HD" : "HAYAT_EMEKLILIK";
}

export const OLCEK_SEGMENT_HUB_LEGEND: { harf: OlcekSegmentHarfi; ad: string }[] = [
  { harf: "A+", ad: olcekSegmentKisaAdi("A+") },
  { harf: "A", ad: olcekSegmentKisaAdi("A") },
  { harf: "B", ad: olcekSegmentKisaAdi("B") },
  { harf: "C", ad: olcekSegmentKisaAdi("C") },
  { harf: "D", ad: olcekSegmentKisaAdi("D") },
];

export const OLCEK_SEGMENT_CACHE_URL = "/data/tsb/olcek-segment.json";
