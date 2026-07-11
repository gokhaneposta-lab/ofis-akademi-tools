/**
 * Branş bazında pazar yoğunlaşması (HHI) — aylık prim paylarından.
 */

import { HD_ANA_BRANS_SIRASI, HAYAT_ANA_BRANS_SIRASI } from "./tsbBransDegisim";
import type { TsbKanalField, TsbPrimRow, TsbSektorSegment } from "./tsbPrimDashboard";
import {
  channelPremium,
  isTsbToplamSirketKodu,
  prevMonthPeriod,
  rowMatchesSegment,
} from "./tsbPrimDashboard";

export type PazarPaySatir = {
  sirketKodu: number;
  sirketAdi: string;
  prim: number;
  payYuzde: number;
};

export type PazarHhiTrendNokta = {
  donem: string;
  hhi: number;
};

export type PazarYogunlasmaPaket = {
  donem: string;
  anaBransH: string;
  hhi: number;
  yorum: string;
  top5: PazarPaySatir[];
  tumSirketler: PazarPaySatir[];
  katilimci: number;
  sektorPrim: number;
  trend: PazarHhiTrendNokta[];
};

/** HHI = Σ (pay_i %)² — tek oyuncu 10.000, tam rekabet → 0'a yakın. */
export function hhiFromPayYuzdeleri(payYuzdeleri: readonly number[]): number {
  return payYuzdeleri.reduce((s, p) => s + p * p, 0);
}

export function hhiYorum(hhi: number): { etiket: string; aciklama: string } {
  if (hhi >= 2500) {
    return {
      etiket: "Yüksek yoğunlaşma",
      aciklama: "Pazar az sayıda şirkette toplanmış; rekabet sınırlı olabilir.",
    };
  }
  if (hhi >= 1500) {
    return {
      etiket: "Orta yoğunlaşma",
      aciklama: "Birkaç büyük oyuncu belirgin paya sahip.",
    };
  }
  return {
    etiket: "Düşük yoğunlaşma",
    aciklama: "Üretim daha dağınık; rekabet yoğun.",
  };
}

function kumulatifBransPrim(
  rows: TsbPrimRow[],
  donem: string,
  sirketKodu: number,
  anaBransH: string,
  segment: TsbSektorSegment,
  channel: TsbKanalField,
): number {
  let sum = 0;
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (r.sirketKodu !== sirketKodu) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (r.anaBransH !== anaBransH) continue;
    sum += channelPremium(r, channel);
  }
  return sum;
}

function aylikBransPrim(
  rows: TsbPrimRow[],
  donem: string,
  sirketKodu: number,
  anaBransH: string,
  segment: TsbSektorSegment,
  channel: TsbKanalField,
): number {
  const kumBu = kumulatifBransPrim(rows, donem, sirketKodu, anaBransH, segment, channel);
  const prevAy = prevMonthPeriod(donem);
  if (!prevAy || prevAy.slice(0, 4) !== donem.slice(0, 4)) return kumBu;
  const kumPrev = kumulatifBransPrim(rows, prevAy, sirketKodu, anaBransH, segment, channel);
  return kumBu - kumPrev;
}

function sirketPrimleriBransAylik(
  rows: TsbPrimRow[],
  donem: string,
  anaBransH: string,
  segment: TsbSektorSegment,
  channel: TsbKanalField,
): PazarPaySatir[] {
  const adlar = new Map<number, string>();
  const kodlar = new Set<number>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    if (r.anaBransH !== anaBransH) continue;
    kodlar.add(r.sirketKodu);
    if (r.sirketAdi) adlar.set(r.sirketKodu, r.sirketAdi);
  }

  const primler: { sirketKodu: number; sirketAdi: string; prim: number }[] = [];
  for (const kod of kodlar) {
    const prim = aylikBransPrim(rows, donem, kod, anaBransH, segment, channel);
    if (prim <= 0) continue;
    primler.push({
      sirketKodu: kod,
      sirketAdi: adlar.get(kod) ?? `Şirket ${kod}`,
      prim,
    });
  }

  const sektorPrim = primler.reduce((a, x) => a + x.prim, 0);
  if (sektorPrim <= 0) return [];

  return primler
    .map((p) => ({
      ...p,
      payYuzde: (p.prim / sektorPrim) * 100,
    }))
    .sort((a, b) => b.prim - a.prim);
}

export function hhiForBransDonem(
  rows: TsbPrimRow[],
  donem: string,
  anaBransH: string,
  segment: TsbSektorSegment,
  channel: TsbKanalField,
): { hhi: number; satirlar: PazarPaySatir[]; sektorPrim: number } | null {
  const satirlar = sirketPrimleriBransAylik(rows, donem, anaBransH, segment, channel);
  if (satirlar.length === 0) return null;
  const sektorPrim = satirlar.reduce((a, x) => a + x.prim, 0);
  const hhi = hhiFromPayYuzdeleri(satirlar.map((s) => s.payYuzde));
  return { hhi, satirlar, sektorPrim };
}

export function buildPazarYogunlasmaPaket(
  rows: TsbPrimRow[],
  sortedDonemler: string[],
  donem: string,
  anaBransH: string,
  segment: TsbSektorSegment,
  channel: TsbKanalField,
  trendAy = 12,
): PazarYogunlasmaPaket | null {
  const bu = hhiForBransDonem(rows, donem, anaBransH, segment, channel);
  if (!bu) return null;

  const idx = sortedDonemler.indexOf(donem);
  const start = idx < 0 ? 0 : Math.max(0, idx - trendAy + 1);
  const slice = idx < 0 ? [donem] : sortedDonemler.slice(start, idx + 1);
  const trend: PazarHhiTrendNokta[] = [];
  for (const d of slice) {
    const p = hhiForBransDonem(rows, d, anaBransH, segment, channel);
    if (p) trend.push({ donem: d, hhi: p.hhi });
  }

  const { etiket } = hhiYorum(bu.hhi);
  return {
    donem,
    anaBransH,
    hhi: bu.hhi,
    yorum: etiket,
    top5: bu.satirlar.slice(0, 5),
    tumSirketler: bu.satirlar,
    katilimci: bu.satirlar.length,
    sektorPrim: bu.sektorPrim,
    trend,
  };
}

/** Segment için sıralı ana branş listesi (sektör raporu sırasına yakın). */
export function anaBransSecenekleri(
  rows: TsbPrimRow[],
  donem: string,
  segment: TsbSektorSegment,
): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    set.add(r.anaBransH);
  }
  const sabit = segment === "hayatdisi" ? HD_ANA_BRANS_SIRASI : HAYAT_ANA_BRANS_SIRASI;
  const sirali: string[] = [];
  for (const s of sabit) {
    if (set.has(s)) sirali.push(s);
  }
  for (const b of [...set].sort((a, b) => a.localeCompare(b, "tr"))) {
    if (!sirali.includes(b)) sirali.push(b);
  }
  return sirali;
}

export function varsayilanAnaBrans(secenekler: string[]): string {
  const tercih = ["KARA ARAÇLARI", "HAYAT", "KAZA", "HASTALIK SAĞLIK"];
  for (const t of tercih) {
    if (secenekler.includes(t)) return t;
  }
  return secenekler[0] ?? "";
}
