import type { TsbKanalField, TsbPrimRow, TsbSektorSegment } from "./tsbPrimDashboard";
import {
  ANA_BRANS_FILTER_TRAFIK_HARIC,
  channelPremium,
  isHayatEmeklilikSirket,
  isHayatdisiSirket,
  isTsbToplamSirketKodu,
  prevYearPeriod,
  rowMatchesAnaBransFilter,
  rowMatchesSegment,
} from "./tsbPrimDashboard";
import { HAYAT_ANA_BRANS_SIRASI, HD_ANA_BRANS_SIRASI } from "./tsbBransDegisim";

function sortAnaBransSirasi(mevcut: Set<string>, sabitSira: readonly string[]): string[] {
  const out: string[] = [];
  for (const s of sabitSira) {
    if (mevcut.has(s)) out.push(s);
  }
  const diger = [...mevcut].filter((b) => !out.includes(b));
  diger.sort((a, b) => a.localeCompare(b, "tr"));
  return [...out, ...diger];
}

/** Prim > 0 olanlar arasında yarışma sıralaması (eşit primde aynı sıra, sonraki atlama) */
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

function aggregateBranchByCompany(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  anaBransH: string,
  segment: TsbSektorSegment,
): Map<number, number> {
  const m = new Map<number, number>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (r.anaBransH !== anaBransH) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    const v = channelPremium(r, channel);
    m.set(r.sirketKodu, (m.get(r.sirketKodu) ?? 0) + v);
  }
  return m;
}

/** Segmentte birleşik portföy primi; `anaBransFilter` null ise tüm ana branşlar */
function aggregatePortfolioByCompany(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  segment: TsbSektorSegment,
  anaBransFilter: string | null = null,
): Map<number, number> {
  const m = new Map<number, number>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (!rowMatchesAnaBransFilter(r, anaBransFilter)) continue;
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
  donemBu: string;
  donemOnceki: string;
  hayatdisiBranslar: BransSiraSatir[];
  /** Kara Araçları Sorumluluk hariç hayat dışı birleşik portföy */
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
): BransSiraOzet | null {
  const donemOnceki = prevYearPeriod(donemBu);
  if (!donemOnceki) return null;

  const hdSet = new Set<string>();
  const haySet = new Set<string>();
  for (const r of rows) {
    if (r.donem !== donemBu && r.donem !== donemOnceki) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    if (rowMatchesSegment(r, "hayatdisi")) hdSet.add(r.anaBransH);
    if (rowMatchesSegment(r, "hayat")) haySet.add(r.anaBransH);
  }

  const hdSirali = sortAnaBransSirasi(hdSet, HD_ANA_BRANS_SIRASI);
  const haySirali = sortAnaBransSirasi(haySet, HAYAT_ANA_BRANS_SIRASI);

  const hayatdisiBranslar = hdSirali.map((b) => {
    const bu = aggregateBranchByCompany(rows, donemBu, channel, b, "hayatdisi");
    const oc = aggregateBranchByCompany(rows, donemOnceki, channel, b, "hayatdisi");
    return buildSatir(b, "hayatdisi", bu, oc, sirketKodu);
  });

  const hayatBranslar = haySirali.map((b) => {
    const bu = aggregateBranchByCompany(rows, donemBu, channel, b, "hayat");
    const oc = aggregateBranchByCompany(rows, donemOnceki, channel, b, "hayat");
    return buildSatir(b, "hayat", bu, oc, sirketKodu);
  });

  const portHdBuTh = aggregatePortfolioByCompany(
    rows,
    donemBu,
    channel,
    "hayatdisi",
    ANA_BRANS_FILTER_TRAFIK_HARIC,
  );
  const portHdOcTh = aggregatePortfolioByCompany(
    rows,
    donemOnceki,
    channel,
    "hayatdisi",
    ANA_BRANS_FILTER_TRAFIK_HARIC,
  );
  const hayatdisiTrafikHaricPortfoy = buildSatir("TRAFİK HARİÇ TOPLAM", "hayatdisi", portHdBuTh, portHdOcTh, sirketKodu);

  const portHdBu = aggregatePortfolioByCompany(rows, donemBu, channel, "hayatdisi", null);
  const portHdOc = aggregatePortfolioByCompany(rows, donemOnceki, channel, "hayatdisi", null);
  const hayatdisiPortfoy = buildSatir("HAYATDIŞI PORTFÖY (tüm branşlar)", "hayatdisi", portHdBu, portHdOc, sirketKodu);

  const portHyBu = aggregatePortfolioByCompany(rows, donemBu, channel, "hayat", null);
  const portHyOc = aggregatePortfolioByCompany(rows, donemOnceki, channel, "hayat", null);
  const hayatPortfoy = buildSatir("HAYAT & EMEKLİLİK PORTFÖY (tüm branşlar)", "hayat", portHyBu, portHyOc, sirketKodu);

  return {
    donemBu,
    donemOnceki,
    hayatdisiBranslar,
    hayatdisiTrafikHaricPortfoy,
    hayatdisiPortfoy,
    hayatBranslar,
    hayatPortfoy,
  };
}

/** Şirket seçici: seçilen dönemde HD veya hayat üretimi olan tüm şirketler, toplam prim sırası */
export function listSirketlerSiraOzeti(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
): { kod: number; ad: string; toplam: number }[] {
  const m = new Map<number, { ad: string; toplam: number }>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    if (!isHayatdisiSirket(r) && !isHayatEmeklilikSirket(r)) continue;
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
