/**
 * Hasar / Prim (H/P) dashboard — TSB gelir tablosu pivot mantığı.
 */

import {
  hasarPrimOranlariDetayFromLookup,
  hasarPrimOranlariDetaySektorFromLookup,
  type HasarPrimOranlariDetay,
} from "./tsbHasarPrimOrani";
import { listSirketleriGelirDonemForPool, oncekiYilDonem } from "./tsbFinansalKarsilastirmaData";
import {
  buildGelirTidyDonemLookup,
  segmentPeerSirketKodlari,
  type SegmentSkorPool,
} from "./tsbSirketSegmentSkor";
import type { TsbGelirTidyRowLike } from "./tsbYatirimGeliriKpi";
import type { HpKirisumModu } from "./tsbHpTarifeBrans";

const GT = "GT";
const MALI = "MALI";
const HAYAT = "HAYAT";
const EMEKLILIK = "EMEKLİLİK";
const HAYATDISI = "HAYATDISI";

const BRANS_SIRASI_HD = [
  HAYATDISI,
  "KAZA",
  "HASTALIK-SAĞLIK",
  "KASKO",
  "TRAFİK",
  "YANGIN VE DOĞAL AFETLER",
  "NAKLİYAT",
  "GENEL SORUMLULUK",
  "KREDİ",
  "KEFALET",
  "HUKUKSAL KORUMA",
  "FİNANSAL KAYIPLAR",
  "KARA ARAÇLARI",
  "HAVA ARAÇLARI",
  "SU ARAÇLARI",
  "KARA ARAÇLARI SORUMLULUK",
  "HAVA ARAÇLARI SORUMLULUK",
  "SU ARAÇLARI SORUMLULUK",
  "MÜHENDİSLİK SİGORTALARI",
  "GENEL ZARARLAR",
  "DEV. DEST. TARIM SİGORTALARI",
  "DESTEK",
] as const;

const BRANS_SIRASI_HAYAT = [HAYAT, EMEKLILIK] as const;

export type HasarPrimKiyasHedef = { mod: "sektor" } | { mod: "sirket"; sirketKodu: number };

export type HasarPrimBransSecenek = { value: string; label: string };

export type HasarPrimKirisum = {
  mod: HpKirisumModu;
  bransAp: string;
  /** Tarife modunda görünen etiket */
  gorunenAd: string;
};

export type HasarPrimTabloSatir = {
  sirketKodu: number;
  sirketAdi: string;
  hp: HasarPrimOranlariDetay;
  sira: number;
};

export type HasarPrimKiyasOzet = {
  hp: HasarPrimOranlariDetay;
  baslik: string;
  peerSayisi: number;
};

export type HasarPrimTrendNokta = {
  donem: string;
  brutDerkDahil: number | null;
  netDerkDahil: number | null;
  brutDerkHaric: number | null;
  netDerkHaric: number | null;
};

function bransLabel(value: string): string {
  if (value === HAYATDISI) return "Genel (hayat dışı)";
  return value;
}

/** Havuz + dönem için branş listesi (`MALI` hariç). */
export function listHpBransApForPool(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  pool: SegmentSkorPool,
): HasarPrimBransSecenek[] {
  const set = new Set<string>();
  for (const r of rows) {
    if (r.donem !== donem || r.tabloTip !== GT) continue;
    if (r.bransAp === MALI) continue;
    if (pool === "HD") {
      if (r.bransAp === HAYAT || r.bransAp === EMEKLILIK) continue;
    } else {
      if (r.bransAp !== HAYAT && r.bransAp !== EMEKLILIK) continue;
    }
    set.add(r.bransAp);
  }

  const sirali: string[] =
    pool === "HD"
      ? BRANS_SIRASI_HD.filter((b) => set.has(b))
      : BRANS_SIRASI_HAYAT.filter((b) => set.has(b));
  const siraliSet = new Set(sirali);
  const kalan = [...set].filter((b) => !siraliSet.has(b)).sort();
  return [...sirali, ...kalan].map((value) => ({ value, label: bransLabel(value) }));
}

function hpSiralamaDegeri(hp: HasarPrimOranlariDetay): number {
  return hp.brutHasarPrimOrani ?? Number.POSITIVE_INFINITY;
}

export function buildHasarPrimTablosu(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  pool: SegmentSkorPool,
  bransAp: string,
): HasarPrimTabloSatir[] {
  const lookup = buildGelirTidyDonemLookup(rows, donem);
  const sirketler = listSirketleriGelirDonemForPool(rows, donem, pool);
  const satirlar: HasarPrimTabloSatir[] = [];

  for (const { kod, ad } of sirketler) {
    if (!lookup.has(kod)) continue;
    const hp = hasarPrimOranlariDetayFromLookup(lookup, kod, { bransAp });
    if (hp.kazanilmisPrimBrut === 0 && hp.gerceklesenHasarBrut === 0) continue;
    satirlar.push({ sirketKodu: kod, sirketAdi: ad, hp, sira: 0 });
  }

  satirlar.sort((a, b) => hpSiralamaDegeri(a.hp) - hpSiralamaDegeri(b.hp));
  satirlar.forEach((s, i) => {
    s.sira = i + 1;
  });
  return satirlar;
}

export function hasarPrimKiyasOzet(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  pool: SegmentSkorPool,
  bransAp: string,
  kiyas: HasarPrimKiyasHedef,
  sirketListesi: { kod: number; ad: string }[],
): HasarPrimKiyasOzet {
  const lookup = buildGelirTidyDonemLookup(rows, donem);
  const peers = segmentPeerSirketKodlari(rows, donem, pool).filter((k) => lookup.has(k));

  if (kiyas.mod === "sektor") {
    return {
      hp: hasarPrimOranlariDetaySektorFromLookup(lookup, peers, { bransAp }),
      baslik: `Sektör toplamı (n = ${peers.length})`,
      peerSayisi: peers.length,
    };
  }
  const ad = sirketListesi.find((s) => s.kod === kiyas.sirketKodu)?.ad ?? `Şirket ${kiyas.sirketKodu}`;
  return {
    hp: hasarPrimOranlariDetayFromLookup(lookup, kiyas.sirketKodu, { bransAp }),
    baslik: ad,
    peerSayisi: 1,
  };
}

export function buildHasarPrimTrend(
  rows: Iterable<TsbGelirTidyRowLike>,
  donemler: string[],
  sirketKodu: number,
  bransAp: string,
): HasarPrimTrendNokta[] {
  const out: HasarPrimTrendNokta[] = [];
  for (const donem of donemler) {
    const lookup = buildGelirTidyDonemLookup(rows, donem);
    const hp = hasarPrimOranlariDetayFromLookup(lookup, sirketKodu, { bransAp });
    out.push({
      donem,
      brutDerkDahil: hp.brutHasarPrimOrani,
      netDerkDahil: hp.netHasarPrimOrani,
      brutDerkHaric: hp.brutDerkHaric,
      netDerkHaric: hp.netDerkHaric,
    });
  }
  return out;
}

/** Sektör toplamı brüt H/P (DERK dahil) — trend grafiği referans çizgisi. */
export function buildHasarPrimSektorTrend(
  rows: Iterable<TsbGelirTidyRowLike>,
  donemler: string[],
  pool: SegmentSkorPool,
  bransAp: string,
): { donem: string; brutDerkDahil: number | null }[] {
  const out: { donem: string; brutDerkDahil: number | null }[] = [];
  for (const donem of donemler) {
    const lookup = buildGelirTidyDonemLookup(rows, donem);
    const peers = segmentPeerSirketKodlari(rows, donem, pool).filter((k) => lookup.has(k));
    const hp = hasarPrimOranlariDetaySektorFromLookup(lookup, peers, { bransAp });
    out.push({ donem, brutDerkDahil: hp.brutHasarPrimOrani });
  }
  return out;
}

/** Son N çeyrek (dönem indeksinden geriye). */
export function sonNCeyrekDonemler(tumDonemler: string[], sonDonem: string, n: number): string[] {
  const idx = tumDonemler.indexOf(sonDonem);
  if (idx < 0) return [];
  const start = Math.max(0, idx - n + 1);
  return tumDonemler.slice(start, idx + 1);
}

export function hpPpFark(bu: number | null, onceki: number | null): number | null {
  if (bu === null || onceki === null || !Number.isFinite(bu) || !Number.isFinite(onceki)) return null;
  return (bu - onceki) * 100;
}

export { oncekiYilDonem };
