import type { TsbBranchLookupMap } from "./tsbBranchLookup";
import { tarifeGrubuFromRow } from "./tsbBranchLookup";
import { HAYAT_ANA_BRANS_SIRASI, HD_ANA_BRANS_SIRASI } from "./tsbBransDegisim";
import type { TsbKanalField, TsbPrimDaraltma, TsbPrimRow, TsbSektorSegment } from "./tsbPrimDashboard";
import {
  ANA_BRANS_FILTER_TRAFIK_HARIC,
  channelPremium,
  isHayatEmeklilikSirket,
  isHayatdisiSirket,
  isTsbToplamSirketKodu,
  prevYearPeriod,
  rowMatchesPrimDaraltma,
  rowMatchesSegment,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC,
  TSB_ANA_BRANS_TRAFIK_SORUMLULUK,
  TSB_TARIFE_GRUBU_TRAFIK,
} from "./tsbPrimDashboard";

function sortAnaBransSirasi(mevcut: Set<string>, sabitSira: readonly string[]): string[] {
  const out: string[] = [];
  for (const s of sabitSira) {
    if (mevcut.has(s)) out.push(s);
  }
  const diger = [...mevcut].filter((b) => !out.includes(b));
  diger.sort((a, b) => a.localeCompare(b, "tr"));
  return [...out, ...diger];
}

function competitionRanks(primByKod: Map<number, number>): Map<number, number> {
  const ranked = [...primByKod.entries()].filter(([, p]) => p > 0).sort((a, b) => b[1] - a[1]);
  const ranks = new Map<number, number>();
  let rank = 1;
  for (let i = 0; i < ranked.length; i++) {
    const [, prim] = ranked[i];
    if (i > 0 && prim < ranked[i - 1][1]) rank = i + 1;
    ranks.set(ranked[i][0], rank);
  }
  return ranks;
}

function collectAnaBransKeys(
  rows: TsbPrimRow[],
  donemOnceki: string,
  donemBu: string,
  segment: TsbSektorSegment,
): Set<string> {
  const set = new Set<string>();
  for (const r of rows) {
    if (r.donem !== donemBu && r.donem !== donemOnceki) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    set.add(r.anaBransH);
  }
  return set;
}

function collectTarifeKeys(
  rows: TsbPrimRow[],
  donemOnceki: string,
  donemBu: string,
  segment: TsbSektorSegment,
  lookup: TsbBranchLookupMap | null,
): Set<string> {
  const set = new Set<string>();
  for (const r of rows) {
    if (r.donem !== donemBu && r.donem !== donemOnceki) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    set.add(tarifeGrubuFromRow(r.bransKodu, r.tarifeGrubu, lookup));
  }
  return set;
}

function narrowAnaKeys(keys: string[], daraltma: Extract<TsbPrimDaraltma, { kind: "anaBransH" }>): string[] {
  const f = daraltma.anaBransH;
  if (f === null || f === "") return keys;
  if (f === ANA_BRANS_FILTER_TRAFIK_HARIC) return keys.filter((k) => k !== TSB_ANA_BRANS_TRAFIK_SORUMLULUK);
  return keys.filter((k) => k === f);
}

function narrowTarifeKeys(keys: string[], daraltma: Extract<TsbPrimDaraltma, { kind: "tarifeGrubu" }>): string[] {
  if (daraltma.tarifeGrubu === null) return keys;
  if (daraltma.tarifeGrubu === TARIFE_GRUBU_FILTER_TRAFIK_HARIC) {
    return keys.filter((k) => k !== TSB_TARIFE_GRUBU_TRAFIK);
  }
  return keys.filter((k) => k === daraltma.tarifeGrubu);
}

function aggregateGrupKeyByCompany(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  segment: TsbSektorSegment,
  key: string,
  grupModu: "anaBransH" | "tarifeGrubu",
  lookup: TsbBranchLookupMap | null,
): Map<number, number> {
  const m = new Map<number, number>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (grupModu === "anaBransH") {
      if (r.anaBransH !== key) continue;
    } else if (tarifeGrubuFromRow(r.bransKodu, r.tarifeGrubu, lookup) !== key) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    const v = channelPremium(r, channel);
    m.set(r.sirketKodu, (m.get(r.sirketKodu) ?? 0) + v);
  }
  return m;
}

function aggregatePortfolioByCompany(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  segment: TsbSektorSegment,
  daraltma: TsbPrimDaraltma,
): Map<number, number> {
  const m = new Map<number, number>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (!rowMatchesPrimDaraltma(r, daraltma)) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    const v = channelPremium(r, channel);
    m.set(r.sirketKodu, (m.get(r.sirketKodu) ?? 0) + v);
  }
  return m;
}

export type BransSiraSatir = {
  anaBransH: string;
  grup: TsbSektorSegment;
  prim: number;
  siraBu: number | null;
  katilimciBu: number;
  siraOnceki: number | null;
  katilimciOnceki: number;
  /** Pozitif = sıra kötüleşti (sayı arttı), negatif = iyileşti */
  siraDelta: number | null;
};

export type BransSiraOzet = {
  kirisumModu: "anaBransH" | "tarifeGrubu";
  donemBu: string;
  donemOnceki: string;
  hayatdisiBranslar: BransSiraSatir[];
  hayatdisiTrafikHaricPortfoy: BransSiraSatir;
  hayatdisiPortfoy: BransSiraSatir;
  hayatBranslar: BransSiraSatir[];
  hayatPortfoy: BransSiraSatir;
};

function buildSatir(
  etiket: string,
  grup: TsbSektorSegment,
  primByBu: Map<number, number>,
  primByOnceki: Map<number, number>,
  sirketKodu: number,
): BransSiraSatir {
  const prim = primByBu.get(sirketKodu) ?? 0;
  const ranksBu = competitionRanks(primByBu);
  const ranksOnceki = competitionRanks(primByOnceki);
  const katilimciBu = [...primByBu.values()].filter((p) => p > 0).length;
  const katilimciOnceki = [...primByOnceki.values()].filter((p) => p > 0).length;
  const siraBu = prim > 0 ? ranksBu.get(sirketKodu) ?? null : null;
  const primO = primByOnceki.get(sirketKodu) ?? 0;
  const siraOnceki = primO > 0 ? ranksOnceki.get(sirketKodu) ?? null : null;
  let siraDelta: number | null = null;
  if (siraBu !== null && siraOnceki !== null) siraDelta = siraBu - siraOnceki;
  return {
    anaBransH: etiket,
    grup,
    prim,
    siraBu,
    katilimciBu,
    siraOnceki,
    katilimciOnceki,
    siraDelta,
  };
}

export function buildBransSiraTablosu(
  rows: TsbPrimRow[],
  donemBu: string,
  channel: TsbKanalField,
  sirketKodu: number,
  daraltma: TsbPrimDaraltma,
): BransSiraOzet | null {
  const donemOnceki = prevYearPeriod(donemBu);
  if (!donemOnceki) return null;

  const grupModu = daraltma.kind;
  const lookup = daraltma.kind === "tarifeGrubu" ? daraltma.lookup : null;

  let hdSirali: string[];
  let haySirali: string[];

  if (grupModu === "anaBransH") {
    const hdSet = collectAnaBransKeys(rows, donemOnceki, donemBu, "hayatdisi");
    const haySet = collectAnaBransKeys(rows, donemOnceki, donemBu, "hayat");
    hdSirali = narrowAnaKeys(sortAnaBransSirasi(hdSet, HD_ANA_BRANS_SIRASI), daraltma);
    haySirali = narrowAnaKeys(sortAnaBransSirasi(haySet, HAYAT_ANA_BRANS_SIRASI), daraltma);
  } else {
    const hdSet = collectTarifeKeys(rows, donemOnceki, donemBu, "hayatdisi", lookup);
    const haySet = collectTarifeKeys(rows, donemOnceki, donemBu, "hayat", lookup);
    hdSirali = narrowTarifeKeys([...hdSet].sort((a, b) => a.localeCompare(b, "tr")), daraltma);
    haySirali = narrowTarifeKeys([...haySet].sort((a, b) => a.localeCompare(b, "tr")), daraltma);
  }

  const hayatdisiBranslar = hdSirali.map((b) => {
    const bu = aggregateGrupKeyByCompany(rows, donemBu, channel, "hayatdisi", b, grupModu, lookup);
    const oc = aggregateGrupKeyByCompany(rows, donemOnceki, channel, "hayatdisi", b, grupModu, lookup);
    return buildSatir(b, "hayatdisi", bu, oc, sirketKodu);
  });

  const hayatBranslar = haySirali.map((b) => {
    const bu = aggregateGrupKeyByCompany(rows, donemBu, channel, "hayat", b, grupModu, lookup);
    const oc = aggregateGrupKeyByCompany(rows, donemOnceki, channel, "hayat", b, grupModu, lookup);
    return buildSatir(b, "hayat", bu, oc, sirketKodu);
  });

  const trafikHaricDaraltma: TsbPrimDaraltma = { kind: "anaBransH", anaBransH: ANA_BRANS_FILTER_TRAFIK_HARIC };

  const tarifeTrafikHaricDaraltma: TsbPrimDaraltma = {
    kind: "tarifeGrubu",
    tarifeGrubu: TARIFE_GRUBU_FILTER_TRAFIK_HARIC,
    lookup,
  };

  const hayatdisiTrafikHaricPortfoy =
    grupModu === "anaBransH"
      ? buildSatir(
          "TRAFİK HARİÇ TOPLAM",
          "hayatdisi",
          aggregatePortfolioByCompany(rows, donemBu, channel, "hayatdisi", trafikHaricDaraltma),
          aggregatePortfolioByCompany(rows, donemOnceki, channel, "hayatdisi", trafikHaricDaraltma),
          sirketKodu,
        )
      : buildSatir(
          "TRAFİK HARİÇ TOPLAM",
          "hayatdisi",
          aggregatePortfolioByCompany(rows, donemBu, channel, "hayatdisi", tarifeTrafikHaricDaraltma),
          aggregatePortfolioByCompany(rows, donemOnceki, channel, "hayatdisi", tarifeTrafikHaricDaraltma),
          sirketKodu,
        );

  const hayatdisiPortfoy = buildSatir(
    grupModu === "anaBransH" ? "HAYATDIŞI PORTFÖY (tüm branşlar)" : "HAYATDIŞI (daraltma kapsamı)",
    "hayatdisi",
    aggregatePortfolioByCompany(rows, donemBu, channel, "hayatdisi", daraltma),
    aggregatePortfolioByCompany(rows, donemOnceki, channel, "hayatdisi", daraltma),
    sirketKodu,
  );

  const hayatPortfoy = buildSatir(
    grupModu === "anaBransH" ? "HAYAT & EMEKLİLİK PORTFÖY (tüm branşlar)" : "HAYAT–EMEKLİLİK (daraltma kapsamı)",
    "hayat",
    aggregatePortfolioByCompany(rows, donemBu, channel, "hayat", daraltma),
    aggregatePortfolioByCompany(rows, donemOnceki, channel, "hayat", daraltma),
    sirketKodu,
  );

  return {
    kirisumModu: grupModu,
    donemBu,
    donemOnceki,
    hayatdisiBranslar,
    hayatdisiTrafikHaricPortfoy,
    hayatdisiPortfoy,
    hayatBranslar,
    hayatPortfoy,
  };
}

export function listSirketlerSiraOzeti(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  daraltma: TsbPrimDaraltma,
): { kod: number; ad: string; toplam: number }[] {
  const m = new Map<number, { ad: string; toplam: number }>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    if (!isHayatdisiSirket(r) && !isHayatEmeklilikSirket(r)) continue;
    if (!rowMatchesPrimDaraltma(r, daraltma)) continue;
    const v = channelPremium(r, channel);
    const cur = m.get(r.sirketKodu);
    if (!cur) {
      m.set(r.sirketKodu, { ad: r.sirketAdi, toplam: v });
    } else {
      cur.toplam += v;
      if (r.sirketAdi) cur.ad = r.sirketAdi;
    }
  }
  const arr = [...m.entries()].map(([kod, { ad, toplam }]) => ({ kod, ad, toplam }));
  arr.sort((a, b) => b.toplam - a.toplam);
  return arr;
}
