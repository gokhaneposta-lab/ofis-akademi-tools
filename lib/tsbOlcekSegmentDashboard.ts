import type { OlcekSegmentHarfi, OlcekSegmentSirketKayit } from "./tsbOlcekSegment";
import type { OlcekSegmentCache, OlcekSegmentDonemPool } from "./tsbOlcekSegmentCache";
import type { SegmentSkorPool } from "./tsbSirketSegmentSkor";

const tlFmt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

export function formatOlcekTl(value: number | undefined | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${tlFmt.format(value)} TL`;
}

export function sonFinDonemPoolData(
  cache: OlcekSegmentCache | null,
  pool: SegmentSkorPool,
): { donem: string; poolData: OlcekSegmentDonemPool } | null {
  if (!cache?.sonFinDonem) return null;
  const poolData = cache.byDonem[cache.sonFinDonem]?.[pool];
  if (!poolData) return null;
  return { donem: cache.sonFinDonem, poolData };
}

export function filtreOlcekSegmentTablosu(
  sirketler: OlcekSegmentSirketKayit[],
  segment: OlcekSegmentHarfi | "tumu",
): OlcekSegmentSirketKayit[] {
  const list =
    segment === "tumu" ? [...sirketler] : sirketler.filter((s) => s.olcekSegment === segment);
  if (segment === "tumu") {
    return list.sort((a, b) => a.olcekSirasi - b.olcekSirasi || a.sirketKodu - b.sirketKodu);
  }
  return list.sort((a, b) => a.segmentSirasi - b.segmentSirasi || a.sirketKodu - b.sirketKodu);
}

export function segmentSirasiMetin(s: OlcekSegmentSirketKayit): string {
  return `${s.segmentSirasi} / ${s.segmentPeerSayisi}`;
}

export function sektorSirasiMetin(s: OlcekSegmentSirketKayit): string {
  return `${s.olcekSirasi} / ${s.peerSayisi}`;
}
