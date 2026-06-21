import type { TsbBranchLookupMap } from "./tsbBranchLookup";
import { tarifeGrubuFromRow } from "./tsbBranchLookup";
import type { TsbKanalField, TsbPrimDaraltma, TsbPrimRow, TsbSektorSegment } from "./tsbPrimDashboard";
import type { OlcekSegmentHarfi } from "./tsbOlcekSegment";
import {
  ANA_BRANS_FILTER_TRAFIK_HARIC,
  channelPremium,
  countSirketlerSegmentDonem,
  isTsbToplamSirketKodu,
  prevYearPeriod,
  rowMatchesPrimDaraltma,
  rowMatchesSegment,
  sirketSegmentFromKodu,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC,
  TSB_ANA_BRANS_TRAFIK_SORUMLULUK,
  TSB_TARIFE_GRUBU_TRAFIK,
} from "./tsbPrimDashboard";

/** Klasik sektör raporu sırasına yakın hayat dışı ana branşlar (TSB `anaBransH`) */
export const HD_ANA_BRANS_SIRASI: string[] = [
  "KAZA",
  "HASTALIK SAĞLIK",
  "KARA ARAÇLARI",
  "RAYLI ARAÇLARI",
  "HAVA ARAÇLARI",
  "SU ARAÇLARI",
  "NAKLİYAT",
  "YANGIN DOĞAL AFET",
  "GENEL ZARARLAR",
  "KARA ARAÇLARI SORUMLULUK",
  "HAVA ARAÇLARI SORUMLULUK",
  "SU ARAÇLARI SORUMLULUK",
  "GENEL SORUMLULUK",
  "KREDİ",
  "KEFALET",
  "FİNANSAL KAYIP",
  "HUKUKSAL KORUMA",
  "DESTEK",
];

/** Hayat–emeklilik segmentinde önce ana “HAYAT” satırı, sonra diğer ana branşlar */
export const HAYAT_ANA_BRANS_SIRASI: string[] = ["HAYAT", "HASTALIK SAĞLIK", "KAZA"];

export type BransDegisimKiyasHedef =
  | { mod: "sektor" }
  | { mod: "olcek"; sirketKodlari: readonly number[]; segment: OlcekSegmentHarfi }
  | { mod: "sirket"; sirketKodu: number };

type KiyasPrimFiltre =
  | { kind: "sektor" }
  | { kind: "olcek"; kodlar: readonly number[] }
  | { kind: "sirket"; kod: number };

function sortAnaBransSirasi(mevcut: Set<string>, sabitSira: readonly string[]): string[] {
  const out: string[] = [];
  for (const s of sabitSira) {
    if (mevcut.has(s)) out.push(s);
  }
  const diger = [...mevcut].filter((b) => !out.includes(b));
  diger.sort((a, b) => a.localeCompare(b, "tr"));
  return [...out, ...diger];
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

function sumGrupKey(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  segment: TsbSektorSegment,
  key: string,
  grupModu: "anaBransH" | "tarifeGrubu",
  lookup: TsbBranchLookupMap | null,
  filtre: KiyasPrimFiltre,
): number {
  let sum = 0;
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (grupModu === "anaBransH") {
      if (r.anaBransH !== key) continue;
    } else if (tarifeGrubuFromRow(r.bransKodu, r.tarifeGrubu, lookup) !== key) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    if (filtre.kind === "sirket" && r.sirketKodu !== filtre.kod) continue;
    if (filtre.kind === "olcek" && !filtre.kodlar.includes(r.sirketKodu)) continue;
    sum += channelPremium(r, channel);
  }
  return sum;
}

function degisimYuzde(onceki: number, bu: number): number | null {
  if (onceki === 0) return bu === 0 ? 0 : null;
  return ((bu - onceki) / Math.abs(onceki)) * 100;
}

export type BransDegisimSatir = {
  anaBransH: string;
  grup: TsbSektorSegment;
  sirketPrimOnceki: number;
  sirketPrimBu: number;
  sirketDegisim: number | null;
  /** Sağ blok: sektör toplamı veya kıyas şirketi primi */
  sektorPrimOnceki: number;
  sektorPrimBu: number;
  sektorDegisim: number | null;
  /** Sol şirketin tam sektör havuzundaki branş payı (%) */
  payOncekiYuzde: number;
  payBuYuzde: number;
  payDegisimPp: number;
};

export type BransDegisimOzet = {
  kirisumModu: "anaBransH" | "tarifeGrubu";
  donemBu: string;
  donemOnceki: string;
  tabloHavuzu: TsbSektorSegment;
  kiyasMod: "sektor" | "olcek" | "sirket";
  peerSayisi: number;
  kiyasOlcekSegment?: OlcekSegmentHarfi;
  branslar: BransDegisimSatir[];
  /** Yalnızca hayat dışı havuzunda */
  trafikHaricToplam: BransDegisimSatir | null;
  toplam: BransDegisimSatir;
};

function buildSatir(
  etiket: string,
  grup: TsbSektorSegment,
  rows: TsbPrimRow[],
  donemOnceki: string,
  donemBu: string,
  channel: TsbKanalField,
  sirketKodu: number,
  grupModu: "anaBransH" | "tarifeGrubu",
  lookup: TsbBranchLookupMap | null,
  kiyasFiltre: KiyasPrimFiltre,
): BransDegisimSatir {
  const sektorPayOnceki = sumGrupKey(rows, donemOnceki, channel, grup, etiket, grupModu, lookup, { kind: "sektor" });
  const sektorPayBu = sumGrupKey(rows, donemBu, channel, grup, etiket, grupModu, lookup, { kind: "sektor" });
  const sirketPrimOnceki = sumGrupKey(rows, donemOnceki, channel, grup, etiket, grupModu, lookup, {
    kind: "sirket",
    kod: sirketKodu,
  });
  const sirketPrimBu = sumGrupKey(rows, donemBu, channel, grup, etiket, grupModu, lookup, {
    kind: "sirket",
    kod: sirketKodu,
  });
  const kiyasPrimOnceki = sumGrupKey(rows, donemOnceki, channel, grup, etiket, grupModu, lookup, kiyasFiltre);
  const kiyasPrimBu = sumGrupKey(rows, donemBu, channel, grup, etiket, grupModu, lookup, kiyasFiltre);

  const payOncekiYuzde = sektorPayOnceki > 0 ? (sirketPrimOnceki / sektorPayOnceki) * 100 : 0;
  const payBuYuzde = sektorPayBu > 0 ? (sirketPrimBu / sektorPayBu) * 100 : 0;

  return {
    anaBransH: etiket,
    grup,
    sirketPrimOnceki,
    sirketPrimBu,
    sirketDegisim: degisimYuzde(sirketPrimOnceki, sirketPrimBu),
    sektorPrimOnceki: kiyasPrimOnceki,
    sektorPrimBu: kiyasPrimBu,
    sektorDegisim: degisimYuzde(kiyasPrimOnceki, kiyasPrimBu),
    payOncekiYuzde,
    payBuYuzde,
    payDegisimPp: payBuYuzde - payOncekiYuzde,
  };
}

function aggregateToplam(
  satirlar: BransDegisimSatir[],
  grup: TsbSektorSegment,
  etiket: string,
  rows: TsbPrimRow[],
  donemOnceki: string,
  donemBu: string,
  channel: TsbKanalField,
  grupModu: "anaBransH" | "tarifeGrubu",
  lookup: TsbBranchLookupMap | null,
  keys: string[],
): BransDegisimSatir {
  let sirketPrimOnceki = 0;
  let sirketPrimBu = 0;
  let kiyasPrimOnceki = 0;
  let kiyasPrimBu = 0;
  for (const s of satirlar) {
    sirketPrimOnceki += s.sirketPrimOnceki;
    sirketPrimBu += s.sirketPrimBu;
    kiyasPrimOnceki += s.sektorPrimOnceki;
    kiyasPrimBu += s.sektorPrimBu;
  }

  let sektorPayOnceki = 0;
  let sektorPayBu = 0;
  for (const key of keys) {
    sektorPayOnceki += sumGrupKey(rows, donemOnceki, channel, grup, key, grupModu, lookup, { kind: "sektor" });
    sektorPayBu += sumGrupKey(rows, donemBu, channel, grup, key, grupModu, lookup, { kind: "sektor" });
  }

  const payOncekiYuzde = sektorPayOnceki > 0 ? (sirketPrimOnceki / sektorPayOnceki) * 100 : 0;
  const payBuYuzde = sektorPayBu > 0 ? (sirketPrimBu / sektorPayBu) * 100 : 0;

  return {
    anaBransH: etiket,
    grup,
    sirketPrimOnceki,
    sirketPrimBu,
    sirketDegisim: degisimYuzde(sirketPrimOnceki, sirketPrimBu),
    sektorPrimOnceki: kiyasPrimOnceki,
    sektorPrimBu: kiyasPrimBu,
    sektorDegisim: degisimYuzde(kiyasPrimOnceki, kiyasPrimBu),
    payOncekiYuzde,
    payBuYuzde,
    payDegisimPp: payBuYuzde - payOncekiYuzde,
  };
}

export function buildBransDegisimTablosu(
  rows: TsbPrimRow[],
  donemBu: string,
  channel: TsbKanalField,
  sirketKodu: number,
  daraltma: TsbPrimDaraltma,
  kiyasHedef: BransDegisimKiyasHedef = { mod: "sektor" },
): BransDegisimOzet | null {
  const donemOnceki = prevYearPeriod(donemBu);
  if (!donemOnceki) return null;

  const tabloHavuzu = sirketSegmentFromKodu(rows, sirketKodu);
  let kiyasFiltre: KiyasPrimFiltre;
  let peerSayisi: number;
  let kiyasOlcekSegment: OlcekSegmentHarfi | undefined;

  if (kiyasHedef.mod === "sektor") {
    kiyasFiltre = { kind: "sektor" };
    peerSayisi = countSirketlerSegmentDonem(rows, donemBu, tabloHavuzu);
  } else if (kiyasHedef.mod === "olcek") {
    kiyasFiltre = { kind: "olcek", kodlar: kiyasHedef.sirketKodlari };
    peerSayisi = kiyasHedef.sirketKodlari.length;
    kiyasOlcekSegment = kiyasHedef.segment;
  } else {
    kiyasFiltre = { kind: "sirket", kod: kiyasHedef.sirketKodu };
    peerSayisi = 1;
  }

  const grupModu = daraltma.kind;
  const lookup = daraltma.kind === "tarifeGrubu" ? daraltma.lookup : null;

  let sirali: string[];

  if (grupModu === "anaBransH") {
    const keySet = collectAnaBransKeys(rows, donemOnceki, donemBu, tabloHavuzu);
    const sabitSira = tabloHavuzu === "hayatdisi" ? HD_ANA_BRANS_SIRASI : HAYAT_ANA_BRANS_SIRASI;
    sirali = narrowAnaKeys(sortAnaBransSirasi(keySet, sabitSira), daraltma);
  } else {
    const keySet = collectTarifeKeys(rows, donemOnceki, donemBu, tabloHavuzu, lookup);
    sirali = narrowTarifeKeys([...keySet].sort((a, b) => a.localeCompare(b, "tr")), daraltma);
  }

  const branslar = sirali.map((b) =>
    buildSatir(b, tabloHavuzu, rows, donemOnceki, donemBu, channel, sirketKodu, grupModu, lookup, kiyasFiltre),
  );

  const trafikHaricToplam =
    tabloHavuzu === "hayatdisi"
      ? grupModu === "anaBransH"
        ? aggregateToplam(
            branslar.filter((s) => s.anaBransH !== TSB_ANA_BRANS_TRAFIK_SORUMLULUK),
            "hayatdisi",
            "TRAFİK HARİÇ TOPLAM",
            rows,
            donemOnceki,
            donemBu,
            channel,
            grupModu,
            lookup,
            branslar.filter((s) => s.anaBransH !== TSB_ANA_BRANS_TRAFIK_SORUMLULUK).map((s) => s.anaBransH),
          )
        : aggregateToplam(
            branslar.filter((s) => s.anaBransH !== TSB_TARIFE_GRUBU_TRAFIK),
            "hayatdisi",
            "TRAFİK HARİÇ TOPLAM",
            rows,
            donemOnceki,
            donemBu,
            channel,
            grupModu,
            lookup,
            branslar.filter((s) => s.anaBransH !== TSB_TARIFE_GRUBU_TRAFIK).map((s) => s.anaBransH),
          )
      : null;

  const toplamEtiket =
    tabloHavuzu === "hayatdisi" ? "HAYATDIŞI TOPLAM" : "HAYAT & EMEKLİLİK TOPLAM";

  const toplam = aggregateToplam(
    branslar,
    tabloHavuzu,
    toplamEtiket,
    rows,
    donemOnceki,
    donemBu,
    channel,
    grupModu,
    lookup,
    branslar.map((s) => s.anaBransH),
  );

  return {
    kirisumModu: grupModu,
    donemBu,
    donemOnceki,
    tabloHavuzu,
    kiyasMod: kiyasHedef.mod,
    peerSayisi,
    kiyasOlcekSegment,
    branslar,
    trafikHaricToplam,
    toplam,
  };
}

export type BransPayDilim = { etiket: string; sirketPay: number; sektorPay: number };

/** Tablodaki branş/tarife satırlarından “bu dönem” üretim payları (şirket portföyü vs sektör) */
export function buildBransPaySnapshot(tablo: BransDegisimOzet): BransPayDilim[] {
  const detay = tablo.branslar;
  const ts = detay.reduce((a, x) => a + x.sektorPrimBu, 0);
  const tk = detay.reduce((a, x) => a + x.sirketPrimBu, 0);
  if (ts <= 0 && tk <= 0) return [];
  const raw = detay.map((x) => ({
    etiket: x.anaBransH,
    sirketPay: tk > 0 ? (x.sirketPrimBu / tk) * 100 : 0,
    sektorPay: ts > 0 ? (x.sektorPrimBu / ts) * 100 : 0,
  }));
  raw.sort((a, b) => b.sektorPay - a.sektorPay);
  return raw;
}
