import type { TsbKanalField, TsbPrimRow, TsbSektorSegment } from "./tsbPrimDashboard";
import {
  channelPremium,
  isTsbToplamSirketKodu,
  prevYearPeriod,
  rowMatchesSegment,
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

function sumBranch(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  anaBransH: string,
  segment: TsbSektorSegment,
  sirketKodu: number | null,
): number {
  let sum = 0;
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (r.anaBransH !== anaBransH) continue;
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
  donemBu: string;
  donemOnceki: string;
  hayatdisiBranslar: BransDegisimSatir[];
  hayatdisiToplam: BransDegisimSatir;
  hayatBranslar: BransDegisimSatir[];
  hayatToplam: BransDegisimSatir;
  genelToplam: BransDegisimSatir;
};

function buildSatir(
  anaBransH: string,
  grup: TsbSektorSegment,
  rows: TsbPrimRow[],
  donemOnceki: string,
  donemBu: string,
  channel: TsbKanalField,
  sirketKodu: number,
): BransDegisimSatir {
  const sektorPrimOnceki = sumBranch(rows, donemOnceki, channel, anaBransH, grup, null);
  const sektorPrimBu = sumBranch(rows, donemBu, channel, anaBransH, grup, null);
  const sirketPrimOnceki = sumBranch(rows, donemOnceki, channel, anaBransH, grup, sirketKodu);
  const sirketPrimBu = sumBranch(rows, donemBu, channel, anaBransH, grup, sirketKodu);

  const payOncekiYuzde =
    sektorPrimOnceki > 0 ? (sirketPrimOnceki / sektorPrimOnceki) * 100 : 0;
  const payBuYuzde = sektorPrimBu > 0 ? (sirketPrimBu / sektorPrimBu) * 100 : 0;

  return {
    anaBransH,
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
): BransDegisimOzet | null {
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

  const hayatdisiBranslar = hdSirali.map((b) =>
    buildSatir(b, "hayatdisi", rows, donemOnceki, donemBu, channel, sirketKodu),
  );
  const hayatBranslar = haySirali.map((b) =>
    buildSatir(b, "hayat", rows, donemOnceki, donemBu, channel, sirketKodu),
  );

  const hayatdisiToplam = aggregateToplam(hayatdisiBranslar, "hayatdisi", "HAYATDIŞI TOPLAM");
  const hayatToplam = aggregateToplam(hayatBranslar, "hayat", "HAYAT & EMEKLİLİK TOPLAM");
  const tum = [...hayatdisiBranslar, ...hayatBranslar];
  const genelToplam = aggregateToplam(tum, "hayatdisi", "GENEL TOPLAM");

  return {
    donemBu,
    donemOnceki,
    hayatdisiBranslar,
    hayatdisiToplam,
    hayatBranslar,
    hayatToplam,
    genelToplam,
  };
}

/** Şirket seçimi: seçilen dönemde hayat dışı üretimi olan şirketler (kanala göre) */
export function listSirketlerBransDashboard(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
): { kod: number; ad: string; toplam: number }[] {
  const m = new Map<number, { ad: string; toplam: number }>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, "hayatdisi")) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
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
