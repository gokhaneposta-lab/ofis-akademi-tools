import type { TsbBranchLookupMap } from "./tsbBranchLookup";
import { tarifeGrubuFromRow } from "./tsbBranchLookup";
import type { TsbKanalField, TsbPrimRow, TsbSektorSegment } from "./tsbPrimDashboard";
import {
  channelPremium,
  isTsbToplamSirketKodu,
  rowMatchesAnaBransFilter,
  rowMatchesSegment,
} from "./tsbPrimDashboard";

const BRIDGE_MAX_ANA_BRANS = 14;
const BRIDGE_MAX_TARIFE = 18;

export type PrimWaterfallGrup = "anaBransH" | "tarifeGrubu";

function sumCompanyPremiumByGrup(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  segment: TsbSektorSegment,
  anaBransH: string | null,
  sirketKodu: number,
  grup: PrimWaterfallGrup,
  lookup: TsbBranchLookupMap | null,
): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (!rowMatchesAnaBransFilter(r, anaBransH)) continue;
    if (r.sirketKodu !== sirketKodu) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    const v = channelPremium(r, channel);
    const k =
      grup === "anaBransH"
        ? r.anaBransH
        : tarifeGrubuFromRow(r.bransKodu, r.tarifeGrubu, lookup);
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
  grup: PrimWaterfallGrup;
  toplamBaslangic: number;
  toplamBitis: number;
  deltas: PrimWaterfallDelta[];
};

/**
 * Şirket toplam priminin iki dönem arasındaki farkını ana branş veya tarife grubu deltaslarına böler.
 */
export function buildPrimWaterfall(
  rows: TsbPrimRow[],
  donemBaslangic: string,
  donemBitis: string,
  channel: TsbKanalField,
  segment: TsbSektorSegment,
  anaBransH: string | null,
  sirketKodu: number,
  grup: PrimWaterfallGrup,
  lookup: TsbBranchLookupMap | null,
): PrimWaterfallModel | null {
  if (donemBaslangic === donemBitis) return null;

  const mapO = sumCompanyPremiumByGrup(rows, donemBaslangic, channel, segment, anaBransH, sirketKodu, grup, lookup);
  const mapB = sumCompanyPremiumByGrup(rows, donemBitis, channel, segment, anaBransH, sirketKodu, grup, lookup);

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

  const maxEtiket = grup === "tarifeGrubu" ? BRIDGE_MAX_TARIFE : BRIDGE_MAX_ANA_BRANS;
  const digerEtiket =
    grup === "tarifeGrubu" ? "Diğer tarife grupları (net)" : "Diğer ana branşlar (net)";

  let deltas: PrimWaterfallDelta[];
  if (raw.length <= maxEtiket) {
    deltas = raw;
  } else {
    const head = raw.slice(0, maxEtiket);
    const tailDelta = raw.slice(maxEtiket).reduce((s, x) => s + x.delta, 0);
    deltas = tailDelta === 0 ? head : [...head, { label: digerEtiket, delta: tailDelta }];
  }

  return {
    sirketKodu,
    sirketAdi: sirketAdiFromRows(rows, sirketKodu),
    donemBaslangic,
    donemBitis,
    kanal: channel,
    segment,
    grup,
    toplamBaslangic,
    toplamBitis,
    deltas,
  };
}
