import {
  finansalPeerSirketKodlari,
  hamOlcumFromLookup,
  type FinansalKarsilastirmaPool,
  type FinansalKiyaslamaHamOlcum,
} from "./tsbFinansalKarsilastirmaData";
import {
  hasarPrimOranlariSektorFromLookup,
  type HasarPrimOranlari,
} from "./tsbHasarPrimOrani";
import {
  aggregateByCompany,
  countSirketlerSegmentDonem,
  prevYearPeriod,
  type TsbPrimRow,
} from "./tsbPrimDashboard";
import {
  buildGelirTidyDonemLookup,
  type GelirTidyDonemLookup,
} from "./tsbSirketSegmentSkor";
import type { TsbGelirTidyRowLike } from "./tsbYatirimGeliriKpi";

export type SektorGorunumuPool = "HD" | "HAYAT_EMEKLILIK" | "SEKTOR";

export type SektorGorunumuSnapshot = {
  pool: SektorGorunumuPool;
  sirketSayisi: number;
  brutPrim: number;
  safiTeknik: number;
  yatirimGeliri: number;
  teknikKar: number;
  /** Faaliyet giderleri (genelde eksi) — VÖK bileşeni */
  faaliyetGideri: number;
  /** Vergi öncesi kâr */
  vok: number;
  netKar: number;
  ozsermaye: number;
  aktifToplami: number;
  teknikKarsilik: number;
  brutHp: number | null;
  netHp: number | null;
  safiPrim: number | null;
  netKarOzsermaye: number | null;
  netKarAktif: number | null;
  brutPrimOzsermaye: number | null;
  ozsermayeAktif: number | null;
  vokOzsermaye: number | null;
};

export type SektorGorunumuDonem = {
  donem: string;
  HD: SektorGorunumuSnapshot;
  HAYAT_EMEKLILIK: SektorGorunumuSnapshot;
  SEKTOR: SektorGorunumuSnapshot;
};

export type SektorGorunumuIlk10 = {
  grup: "ILK_10" | "DIGER" | "TOPLAM";
  sirketSayisi: number;
  brutPrim: number;
  brutHp: number | null;
  ozsermayeAktif: number | null;
  brutPrimOzsermaye: number | null;
  netKarOzsermaye: number | null;
};

export type SektorGorunumuPaket = {
  secili: SektorGorunumuDonem;
  onceki: SektorGorunumuDonem | null;
  trend: SektorGorunumuDonem[];
  ilk10: SektorGorunumuIlk10[];
  ilk10Onceki: SektorGorunumuIlk10[];
};

const safeRatio = (pay: number, payda: number): number | null =>
  Number.isFinite(pay) && Number.isFinite(payda) && payda !== 0 ? pay / payda : null;

function emptyHam(): FinansalKiyaslamaHamOlcum {
  return {
    donemKar690: 0,
    donemNetKar692: 0,
    ozsermaye: 0,
    brutPrim: 0,
    primTrafikHaric: 0,
    faaliyet614: 0,
    personelGider: 0,
    genelGider: 0,
    yatirimSegment: 0,
    teknikKarZarar: 0,
    safiTeknikKz: 0,
    teknikKarsilik3545: 0,
    vok: 0,
    toplamAktif: 0,
    yuk34: 0,
    aktif1: 0,
    pasif3: 0,
    nakit10: 0,
    finansal11: 0,
  };
}

function sumHams(list: readonly FinansalKiyaslamaHamOlcum[]): FinansalKiyaslamaHamOlcum {
  const out = emptyHam();
  for (const ham of list) {
    for (const key of Object.keys(out) as (keyof FinansalKiyaslamaHamOlcum)[]) {
      const value = ham[key];
      if (Number.isFinite(value)) out[key] += value;
    }
  }
  return out;
}

function snapshotFrom(
  pool: SektorGorunumuPool,
  hams: readonly FinansalKiyaslamaHamOlcum[],
  hp: HasarPrimOranlari,
): SektorGorunumuSnapshot {
  const h = sumHams(hams);
  return {
    pool,
    sirketSayisi: hams.length,
    brutPrim: h.brutPrim,
    safiTeknik: h.safiTeknikKz,
    yatirimGeliri: h.yatirimSegment,
    teknikKar: h.teknikKarZarar,
    faaliyetGideri: h.faaliyet614,
    vok: h.vok,
    netKar: h.donemNetKar692,
    ozsermaye: h.ozsermaye,
    aktifToplami: h.toplamAktif,
    teknikKarsilik: h.teknikKarsilik3545,
    brutHp: hp.brutHasarPrimOrani,
    netHp: hp.netHasarPrimOrani,
    safiPrim: safeRatio(h.safiTeknikKz, h.brutPrim),
    netKarOzsermaye: safeRatio(h.donemNetKar692, h.ozsermaye),
    netKarAktif: safeRatio(h.donemNetKar692, h.toplamAktif),
    brutPrimOzsermaye: safeRatio(h.brutPrim, h.ozsermaye),
    ozsermayeAktif: safeRatio(h.ozsermaye, h.toplamAktif),
    vokOzsermaye: safeRatio(h.vok, h.ozsermaye),
  };
}

function poolData(
  rows: readonly TsbGelirTidyRowLike[],
  donem: string,
  pool: FinansalKarsilastirmaPool,
  lookup: GelirTidyDonemLookup,
): { peers: number[]; hams: FinansalKiyaslamaHamOlcum[]; hp: HasarPrimOranlari } {
  const peers = finansalPeerSirketKodlari(rows, donem, pool).filter((kod) => lookup.has(kod));
  const hams = peers
    .map((kod) => hamOlcumFromLookup(lookup, kod))
    .filter((ham): ham is FinansalKiyaslamaHamOlcum => ham !== null);
  return { peers, hams, hp: hasarPrimOranlariSektorFromLookup(lookup, peers) };
}

export function buildSektorGorunumuDonem(
  rows: readonly TsbGelirTidyRowLike[],
  donem: string,
): SektorGorunumuDonem {
  const lookup = buildGelirTidyDonemLookup(rows, donem);
  const hd = poolData(rows, donem, "HD", lookup);
  const he = poolData(rows, donem, "HAYAT_EMEKLILIK", lookup);
  const toplamPeers = [...new Set([...hd.peers, ...he.peers])];
  const toplamHams = [...hd.hams, ...he.hams];
  const toplamHp = hasarPrimOranlariSektorFromLookup(lookup, toplamPeers);
  return {
    donem,
    HD: snapshotFrom("HD", hd.hams, hd.hp),
    HAYAT_EMEKLILIK: snapshotFrom("HAYAT_EMEKLILIK", he.hams, he.hp),
    SEKTOR: snapshotFrom("SEKTOR", toplamHams, toplamHp),
  };
}

function buildIlk10(
  rows: readonly TsbGelirTidyRowLike[],
  donem: string | null,
): SektorGorunumuIlk10[] {
  if (!donem) return [];
  const lookup = buildGelirTidyDonemLookup(rows, donem);
  const peers = finansalPeerSirketKodlari(rows, donem, "HD").filter((kod) => lookup.has(kod));
  const ranked = peers
    .map((kod) => ({ kod, ham: hamOlcumFromLookup(lookup, kod) }))
    .filter(
      (x): x is { kod: number; ham: FinansalKiyaslamaHamOlcum } =>
        x.ham !== null,
    )
    .sort((a, b) => b.ham.brutPrim - a.ham.brutPrim);
  const ilk = ranked.slice(0, 10);
  const diger = ranked.slice(10);
  const groups = [
    { grup: "ILK_10" as const, rows: ilk },
    { grup: "DIGER" as const, rows: diger },
    { grup: "TOPLAM" as const, rows: ranked },
  ];

  return groups.map(({ grup, rows: groupRows }) => {
    const hams = groupRows.map((x) => x.ham);
    const h = sumHams(hams);
    const hp = hasarPrimOranlariSektorFromLookup(
      lookup,
      groupRows.map((x) => x.kod),
    );
    return {
      grup,
      sirketSayisi: groupRows.length,
      brutPrim: h.brutPrim,
      brutHp: hp.brutHasarPrimOrani,
      ozsermayeAktif: safeRatio(h.ozsermaye, h.toplamAktif),
      brutPrimOzsermaye: safeRatio(h.brutPrim, h.ozsermaye),
      netKarOzsermaye: safeRatio(h.donemNetKar692, h.ozsermaye),
    };
  });
}

export function buildSektorGorunumuPaket(
  rows: readonly TsbGelirTidyRowLike[],
  seciliDonem: string,
  oncekiDonem: string | null,
  trendDonemler: readonly string[],
): SektorGorunumuPaket {
  return {
    secili: buildSektorGorunumuDonem(rows, seciliDonem),
    onceki: oncekiDonem ? buildSektorGorunumuDonem(rows, oncekiDonem) : null,
    trend: trendDonemler.map((donem) => buildSektorGorunumuDonem(rows, donem)),
    ilk10: buildIlk10(rows, seciliDonem),
    ilk10Onceki: buildIlk10(rows, oncekiDonem),
  };
}

/** Seçili çeyreğin aynı çeyreğini geçmiş beş yılda karşılaştırır (YtD uyumu korunur). */
export function sektorGorunumuTrendDonemleri(
  tumDonemler: readonly string[],
  seciliDonem: string,
  yilSayisi = 5,
): string[] {
  const match = seciliDonem.match(/^(\d{4})-([1-4])$/);
  if (!match) return [seciliDonem];
  const yil = Number(match[1]);
  const ceyrek = match[2];
  const mevcut = new Set(tumDonemler);
  const out: string[] = [];
  for (let y = yil - yilSayisi + 1; y <= yil; y += 1) {
    const donem = `${y}-${ceyrek}`;
    if (mevcut.has(donem)) out.push(donem);
  }
  return out;
}

export type SektorPrimSnapshot = {
  donem: string;
  HD: number;
  HAYAT_EMEKLILIK: number;
  SEKTOR: number;
  sirketSayisiHd: number;
  sirketSayisiHe: number;
  sirketSayisi: number;
};

const PRIM_DARALTMA_TUMU = { kind: "anaBransH" as const, anaBransH: null };

function sumCompanyMap(map: Map<number, { toplam: number }>): number {
  let s = 0;
  for (const v of map.values()) s += v.toplam;
  return s;
}

/** prim-tidy brüt prim üretimi (kanal: genel toplam, daraltma yok). */
export function buildSektorPrimDonem(
  rows: readonly TsbPrimRow[],
  donem: string,
): SektorPrimSnapshot {
  const list = rows as TsbPrimRow[];
  const hd = sumCompanyMap(aggregateByCompany(list, donem, "genelToplam", PRIM_DARALTMA_TUMU, "hayatdisi"));
  const he = sumCompanyMap(aggregateByCompany(list, donem, "genelToplam", PRIM_DARALTMA_TUMU, "hayat"));
  const sirketSayisiHd = countSirketlerSegmentDonem(list, donem, "hayatdisi");
  const sirketSayisiHe = countSirketlerSegmentDonem(list, donem, "hayat");
  return {
    donem,
    HD: hd,
    HAYAT_EMEKLILIK: he,
    SEKTOR: hd + he,
    sirketSayisiHd,
    sirketSayisiHe,
    sirketSayisi: sirketSayisiHd + sirketSayisiHe,
  };
}

/** Seçili ayın aynı ayını geçmiş yıllarda karşılaştırır (YTD uyumu). */
export function sektorPrimTrendDonemleri(
  tumDonemler: readonly string[],
  seciliDonem: string,
  yilSayisi = 5,
): string[] {
  const match = seciliDonem.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (!match) return [seciliDonem];
  const yil = Number(match[1]);
  const ay = match[2];
  const mevcut = new Set(tumDonemler);
  const out: string[] = [];
  for (let y = yil - yilSayisi + 1; y <= yil; y += 1) {
    const donem = `${y}-${ay}`;
    if (mevcut.has(donem)) out.push(donem);
  }
  return out;
}

export function buildSektorPrimPaket(
  rows: readonly TsbPrimRow[],
  seciliDonem: string,
  tumDonemler: readonly string[],
): { secili: SektorPrimSnapshot; onceki: SektorPrimSnapshot | null; trend: SektorPrimSnapshot[] } {
  const oncekiDonem = prevYearPeriod(seciliDonem);
  const oncekiVar = oncekiDonem !== null && tumDonemler.includes(oncekiDonem);
  return {
    secili: buildSektorPrimDonem(rows, seciliDonem),
    onceki: oncekiVar && oncekiDonem ? buildSektorPrimDonem(rows, oncekiDonem) : null,
    trend: sektorPrimTrendDonemleri(tumDonemler, seciliDonem).map((d) => buildSektorPrimDonem(rows, d)),
  };
}
