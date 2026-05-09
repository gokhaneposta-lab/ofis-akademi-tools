import type { TsbKanalField, TsbPrimRow, TsbSektorSegment } from "./tsbPrimDashboard";
import {
  channelPremium,
  isTsbToplamSirketKodu,
  rowMatchesAnaBransFilter,
  rowMatchesSegment,
} from "./tsbPrimDashboard";

const BRIDGE_MAX_ETIKET = 14;

function sumCompanyPremiumByAnaBrans(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  segment: TsbSektorSegment,
  anaBransH: string | null,
  sirketKodu: number,
): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (!rowMatchesAnaBransFilter(r, anaBransH)) continue;
    if (r.sirketKodu !== sirketKodu) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    const v = channelPremium(r, channel);
    const k = r.anaBransH;
    m.set(k, (m.get(k) ?? 0) + v);
  }
  return m;
}

function sirketAdiFromRows(rows: TsbPrimRow[], sirketKodu: number): string {
  for (const r of rows) {
    if (r.sirketKodu === sirketKodu && r.sirketAdi) return r.sirketAdi;
  }
  return "";
}

export type PrimWaterfallDelta = {
  label: string;
  delta: number;
};

export type PrimWaterfallModel = {
  sirketKodu: number;
  sirketAdi: string;
  donemBaslangic: string;
  donemBitis: string;
  kanal: TsbKanalField;
  segment: TsbSektorSegment;
  toplamBaslangic: number;
  toplamBitis: number;
  deltas: PrimWaterfallDelta[];
};

/**
 * Şirket toplam priminin iki dönem arasındaki farkını ana branş deltaslarına böler.
 * Grafik okunabilirliği için mutlak değere göre sıralanır; küçük kalemler "Diğer branşlar (net)" altında birleşir.
 */
export function buildPrimWaterfall(
  rows: TsbPrimRow[],
  donemBaslangic: string,
  donemBitis: string,
  channel: TsbKanalField,
  segment: TsbSektorSegment,
  anaBransH: string | null,
  sirketKodu: number,
): PrimWaterfallModel | null {
  if (donemBaslangic === donemBitis) return null;

  const mapO = sumCompanyPremiumByAnaBrans(rows, donemBaslangic, channel, segment, anaBransH, sirketKodu);
  const mapB = sumCompanyPremiumByAnaBrans(rows, donemBitis, channel, segment, anaBransH, sirketKodu);

  let toplamBaslangic = 0;
  for (const v of mapO.values()) toplamBaslangic += v;
  let toplamBitis = 0;
  for (const v of mapB.values()) toplamBitis += v;

  const keys = new Set<string>([...mapO.keys(), ...mapB.keys()]);
  const raw: { label: string; delta: number }[] = [];
  for (const k of keys) {
    const d = (mapB.get(k) ?? 0) - (mapO.get(k) ?? 0);
    if (d === 0) continue;
    raw.push({ label: k, delta: d });
  }
  raw.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  let deltas: PrimWaterfallDelta[];
  if (raw.length <= BRIDGE_MAX_ETIKET) {
    deltas = raw;
  } else {
    const head = raw.slice(0, BRIDGE_MAX_ETIKET);
    const tailDelta = raw.slice(BRIDGE_MAX_ETIKET).reduce((s, x) => s + x.delta, 0);
    deltas = tailDelta === 0 ? head : [...head, { label: "Diğer branşlar (net)", delta: tailDelta }];
  }

  return {
    sirketKodu,
    sirketAdi: sirketAdiFromRows(rows, sirketKodu),
    donemBaslangic,
    donemBitis,
    kanal: channel,
    segment,
    toplamBaslangic,
    toplamBitis,
    deltas,
  };
}
