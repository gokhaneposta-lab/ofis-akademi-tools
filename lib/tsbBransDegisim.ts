import type { TsbBranchLookupMap } from "./tsbBranchLookup";
import { tarifeGrubuFromRow } from "./tsbBranchLookup";
import type { TsbKanalField, TsbPrimDaraltma, TsbPrimRow, TsbSektorSegment } from "./tsbPrimDashboard";
import {
  ANA_BRANS_FILTER_TRAFIK_HARIC,
  channelPremium,
  isTsbToplamSirketKodu,
  prevYearPeriod,
  rowMatchesPrimDaraltma,
  rowMatchesSegment,
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
  sirketKodu: number | null,
): number {
  let sum = 0;
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (grupModu === "anaBransH") {
      if (r.anaBransH !== key) continue;
    } else if (tarifeGrubuFromRow(r.bransKodu, r.tarifeGrubu, lookup) !== key) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    if (sirketKodu !== null && r.sirketKodu !== sirketKodu) continue;
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
  sektorPrimOnceki: number;
  sektorPrimBu: number;
  sektorDegisim: number | null;
  payOncekiYuzde: number;
  payBuYuzde: number;
  payDegisimPp: number;
};

export type BransDegisimOzet = {
  kirisumModu: "anaBransH" | "tarifeGrubu";
  donemBu: string;
  donemOnceki: string;
  hayatdisiBranslar: BransDegisimSatir[];
  /** Hayat dışı: TRAFİK / MTPL hariç ara toplam (ana branş veya tarife kırılımı) */
  hayatdisiTrafikHaricToplam: BransDegisimSatir | null;
  hayatdisiToplam: BransDegisimSatir;
  hayatBranslar: BransDegisimSatir[];
  hayatToplam: BransDegisimSatir;
  genelToplam: BransDegisimSatir;
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
): BransDegisimSatir {
  const sektorPrimOnceki = sumGrupKey(rows, donemOnceki, channel, grup, etiket, grupModu, lookup, null);
  const sektorPrimBu = sumGrupKey(rows, donemBu, channel, grup, etiket, grupModu, lookup, null);
  const sirketPrimOnceki = sumGrupKey(rows, donemOnceki, channel, grup, etiket, grupModu, lookup, sirketKodu);
  const sirketPrimBu = sumGrupKey(rows, donemBu, channel, grup, etiket, grupModu, lookup, sirketKodu);

  const payOncekiYuzde =
    sektorPrimOnceki > 0 ? (sirketPrimOnceki / sektorPrimOnceki) * 100 : 0;
  const payBuYuzde = sektorPrimBu > 0 ? (sirketPrimBu / sektorPrimBu) * 100 : 0;

  return {
    anaBransH: etiket,
    grup,
    sirketPrimOnceki,
    sirketPrimBu,
    sirketDegisim: degisimYuzde(sirketPrimOnceki, sirketPrimBu),
    sektorPrimOnceki,
    sektorPrimBu,
    sektorDegisim: degisimYuzde(sektorPrimOnceki, sektorPrimBu),
    payOncekiYuzde,
    payBuYuzde,
    payDegisimPp: payBuYuzde - payOncekiYuzde,
  };
}

function aggregateToplam(
  satirlar: BransDegisimSatir[],
  grup: TsbSektorSegment,
  etiket: string,
): BransDegisimSatir {
  let sirketPrimOnceki = 0;
  let sirketPrimBu = 0;
  let sektorPrimOnceki = 0;
  let sektorPrimBu = 0;
  for (const s of satirlar) {
    sirketPrimOnceki += s.sirketPrimOnceki;
    sirketPrimBu += s.sirketPrimBu;
    sektorPrimOnceki += s.sektorPrimOnceki;
    sektorPrimBu += s.sektorPrimBu;
  }
  const payOncekiYuzde =
    sektorPrimOnceki > 0 ? (sirketPrimOnceki / sektorPrimOnceki) * 100 : 0;
  const payBuYuzde = sektorPrimBu > 0 ? (sirketPrimBu / sektorPrimBu) * 100 : 0;
  return {
    anaBransH: etiket,
    grup,
    sirketPrimOnceki,
    sirketPrimBu,
    sirketDegisim: degisimYuzde(sirketPrimOnceki, sirketPrimBu),
    sektorPrimOnceki,
    sektorPrimBu,
    sektorDegisim: degisimYuzde(sektorPrimOnceki, sektorPrimBu),
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
): BransDegisimOzet | null {
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

  const hayatdisiBranslar = hdSirali.map((b) =>
    buildSatir(b, "hayatdisi", rows, donemOnceki, donemBu, channel, sirketKodu, grupModu, lookup),
  );
  const hayatBranslar = haySirali.map((b) =>
    buildSatir(b, "hayat", rows, donemOnceki, donemBu, channel, sirketKodu, grupModu, lookup),
  );

  const hayatdisiTrafikHaricToplam =
    grupModu === "anaBransH"
      ? aggregateToplam(
          hayatdisiBranslar.filter((s) => s.anaBransH !== TSB_ANA_BRANS_TRAFIK_SORUMLULUK),
          "hayatdisi",
          "TRAFİK HARİÇ TOPLAM",
        )
      : aggregateToplam(
          hayatdisiBranslar.filter((s) => s.anaBransH !== TSB_TARIFE_GRUBU_TRAFIK),
          "hayatdisi",
          "TRAFİK HARİÇ TOPLAM",
        );

  const hayatdisiToplam = aggregateToplam(hayatdisiBranslar, "hayatdisi", "HAYATDIŞI TOPLAM");
  const hayatToplam = aggregateToplam(hayatBranslar, "hayat", "HAYAT & EMEKLİLİK TOPLAM");
  const tum = [...hayatdisiBranslar, ...hayatBranslar];
  const genelToplam = aggregateToplam(tum, "hayatdisi", "GENEL TOPLAM");

  return {
    kirisumModu: grupModu,
    donemBu,
    donemOnceki,
    hayatdisiBranslar,
    hayatdisiTrafikHaricToplam,
    hayatdisiToplam,
    hayatBranslar,
    hayatToplam,
    genelToplam,
  };
}

export type BransPayDilim = { etiket: string; sirketPay: number; sektorPay: number };

/** Tablodaki branş/tarife satırlarından “bu dönem” üretim payları (şirket portföyü vs sektör) */
export function buildBransPaySnapshot(tablo: BransDegisimOzet): BransPayDilim[] {
  const detay = [...tablo.hayatdisiBranslar, ...tablo.hayatBranslar];
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
