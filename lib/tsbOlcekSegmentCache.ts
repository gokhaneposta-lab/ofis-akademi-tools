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
  if (gelirDonemler.length === 0) return null;
  if (gelirDonemler.includes(primDonem)) return primDonem;

  const prim = parsePrimOrFinDonemRef(primDonem);
  if (!prim) return gelirDonemler[gelirDonemler.length - 1] ?? null;

  const primEndKey = prim.y * 12 + prim.endMonth;

  let best: string | null = null;
  let bestEndKey = -1;

  for (const fd of gelirDonemler) {
    const fin = parseFinCeyrekDonem(fd);
    if (!fin) continue;
    const finEndKey = fin.y * 12 + fin.endMonth;
    if (finEndKey <= primEndKey && finEndKey >= bestEndKey) {
      bestEndKey = finEndKey;
      best = fd;
    }
  }

  return best ?? gelirDonemler[gelirDonemler.length - 1] ?? null;
}

/** Finansal çeyrek `YYYY-Q` → çeyrek son ay (Q1→3 … Q4→12). */
function parseFinCeyrekDonem(donem: string): { y: number; endMonth: number } | null {
  const m = donem.match(/^(\d{4})-([1-4])$/);
  if (!m) return null;
  const q = Number(m[2]);
  if (!Number.isFinite(q) || q < 1 || q > 4) return null;
  return { y: Number(m[1]), endMonth: q * 3 };
}

/** Prim ayı `YYYY-MM` veya fin çeyreği `YYYY-Q`. */
function parsePrimOrFinDonemRef(donem: string): { y: number; endMonth: number } | null {
  const fin = parseFinCeyrekDonem(donem);
  if (fin) return fin;
  const m = donem.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (!m) return null;
  return { y: Number(m[1]), endMonth: Number(m[2]) };
}

export function olcekSegmentKayitFromCache(
  cache: OlcekSegmentCache | null,
  donem: string,
  pool: SegmentSkorPool,
  sirketKodu: number,
): OlcekSegmentSirketKayit | null {
  const finDonem = cache ? resolveOlcekFinDonem(donem, cache.donemler) : null;
  if (!cache || !finDonem) return null;
  const poolData = cache.byDonem[finDonem]?.[pool];
  if (!poolData) return null;
  return poolData.sirketler.find((s) => s.sirketKodu === sirketKodu) ?? null;
}

/** Prim/ay döneminden eşleşen finansal çeyrek — rozet ve kıyas tutarlılığı için. */
export function olcekFinDonemForPrimDonem(
  cache: OlcekSegmentCache | null,
  primDonem: string,
): string | null {
  if (!cache) return null;
  return resolveOlcekFinDonem(primDonem, cache.donemler);
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
