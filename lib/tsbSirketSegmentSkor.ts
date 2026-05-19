/**
 * Tek şirket için çoklu KPI → sektör (HD) içi min–max normalize → ağırlıklı segment skoru.
 * KPI listesi ve ağırlıklar: `docs/tsb-kpi-tanimlari.md` §6.1
 *
 * Büyük `gelir-tidy` dosyalarında her şirket için tüm satırları tekrar taramamak için
 * `buildGelirTidyDonemLookup` ile tek geçişte indeks kurulur.
 */

import type { TsbGelirTidyRowLike } from "./tsbYatirimGeliriKpi";
import { isTsbToplamSirketKodu, sirketKoduHayatEmeklilikPrefix } from "./tsbPrimDashboard";

const GT = "GT";
const BL = "BL";
const HAYATDISI = "HAYATDISI";
const MALI = "MALI";
const AKTIF = "Aktif";
const PASIF = "Pasif";

function normKod(k: string | number): string {
  return String(k).trim();
}

/** `sirketKodu` → (`tabloTip|bransAp|hesapKodu` → toplam `deger`) */
export type GelirTidyDonemLookup = Map<number, Map<string, number>>;

function cellKey(tabloTip: string, bransAp: string, hesapKodu: string | number): string {
  return `${tabloTip}|${bransAp}|${normKod(hesapKodu)}`;
}

/** Tek `donem` için tüm şirketleri tek satır taramasında indeksler (732k satır için gerekli). */
export function buildGelirTidyDonemLookup(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
): GelirTidyDonemLookup {
  const m = new Map<number, Map<string, number>>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    const sk = r.sirketKodu;
    if (!Number.isFinite(sk)) continue;
    let inner = m.get(sk);
    if (!inner) {
      inner = new Map();
      m.set(sk, inner);
    }
    const k = cellKey(r.tabloTip, r.bransAp, r.hesapKodu);
    inner.set(k, (inner.get(k) ?? 0) + (Number(r.deger) || 0));
  }
  return m;
}

/** Tek hücre okuma — `buildGelirTidyDonemLookup` çıktısı üzerinde KPI türetimi için. */
export function gelirTidyCell(
  lookup: GelirTidyDonemLookup,
  sirketKodu: number,
  tabloTip: string,
  bransAp: string,
  hesapKodu: string | number,
): number {
  return lookup.get(sirketKodu)?.get(cellKey(tabloTip, bransAp, hesapKodu)) ?? 0;
}

function sumGtHayatdisiLookup(
  lookup: GelirTidyDonemLookup,
  sirketKodu: number,
  hesapKodu: string,
): number {
  return gelirTidyCell(lookup, sirketKodu, GT, HAYATDISI, hesapKodu);
}

function sumGtMaliLookup(lookup: GelirTidyDonemLookup, sirketKodu: number, hesapKodu: string): number {
  return gelirTidyCell(lookup, sirketKodu, GT, MALI, hesapKodu);
}

/** VÖK: HAYATDISI 60–65 + MALI 66–68 (`docs/tsb-kpi-tanimlari.md` §4.1) */
export function vokFromLookup(lookup: GelirTidyDonemLookup, sirketKodu: number): number {
  const h60 = ["60", "61", "62", "63", "64", "65"] as const;
  const m66 = ["66", "67", "68"] as const;
  let s = 0;
  for (const k of h60) s += sumGtHayatdisiLookup(lookup, sirketKodu, k);
  for (const k of m66) s += sumGtMaliLookup(lookup, sirketKodu, k);
  return s;
}

export function vokFromRows(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  sirketKodu: number,
): number {
  return vokFromLookup(buildGelirTidyDonemLookup(rows, donem), sirketKodu);
}

function blTekLookup(
  lookup: GelirTidyDonemLookup,
  sirketKodu: number,
  bransAp: string,
  hesapKodu: string,
): number {
  return gelirTidyCell(lookup, sirketKodu, BL, bransAp, hesapKodu);
}

export type SirketSegmentHamMetrik = {
  sirketKodu: number;
  /** HAYATDISI `60001` */
  brutPrim: number;
  /** §4.3 */
  yatirimGeliriSegment: number;
  /** §4.2 */
  safiTeknikKz: number;
  /** §4.1 */
  vok: number;
  /** Pasif `5` */
  ozsermaye: number;
  /** Aktif `1` + `2` */
  toplamAktif: number;
  /** Pasif `3` + `4` */
  toplamYukPasif34: number;
  /** Aktif `10` + `11` (nakit ve nakit benzerleri + finansal varlıklar; ayrı alt gruplar, çift sayım yok) */
  nakitVeFinansalAktif10_11: number;
  brutPrimLog10: number;
  oranSafiPrim: number | null;
  oranVokOzsermaye: number | null;
  oranYatirimOzsermaye: number | null;
  oranOzAktif: number | null;
  oranYukAktif: number | null;
  oranFinAktif: number | null;
};

export function hamMetrikFromLookup(lookup: GelirTidyDonemLookup, sirketKodu: number): SirketSegmentHamMetrik {
  const c = (tt: string, br: string, hk: string) => gelirTidyCell(lookup, sirketKodu, tt, br, hk);
  const brutPrim = c(GT, HAYATDISI, "60001");
  const yatirimGeliriSegment =
    (c(GT, MALI, "66") - c(GT, MALI, "664") - c(GT, MALI, "665") - c(GT, MALI, "666")) +
    (c(GT, MALI, "671") +
      c(GT, MALI, "672") +
      c(GT, MALI, "674") +
      c(GT, MALI, "675") +
      c(GT, MALI, "677"));
  const safiTeknikKz =
    (c(GT, HAYATDISI, "60") - c(GT, HAYATDISI, "603")) +
    (c(GT, HAYATDISI, "61") -
      c(GT, HAYATDISI, "61402") -
      c(GT, HAYATDISI, "61403") -
      c(GT, HAYATDISI, "61404") -
      c(GT, HAYATDISI, "61405") -
      c(GT, HAYATDISI, "61406"));
  const vok = vokFromLookup(lookup, sirketKodu);
  const ozsermaye = blTekLookup(lookup, sirketKodu, PASIF, "5");
  const toplamAktif =
    blTekLookup(lookup, sirketKodu, AKTIF, "1") + blTekLookup(lookup, sirketKodu, AKTIF, "2");
  const toplamYukPasif34 =
    blTekLookup(lookup, sirketKodu, PASIF, "3") + blTekLookup(lookup, sirketKodu, PASIF, "4");
  const nakitVeFinansalAktif10_11 =
    blTekLookup(lookup, sirketKodu, AKTIF, "10") + blTekLookup(lookup, sirketKodu, AKTIF, "11");
  const brutPrimLog10 = Math.log10(Math.max(brutPrim, 1e-9));
  const oranSafiPrim = brutPrim !== 0 ? safiTeknikKz / brutPrim : null;
  const oranVokOzsermaye = ozsermaye !== 0 ? vok / ozsermaye : null;
  const oranYatirimOzsermaye = ozsermaye !== 0 ? yatirimGeliriSegment / ozsermaye : null;
  const oranOzAktif = toplamAktif !== 0 ? ozsermaye / toplamAktif : null;
  const oranYukAktif = toplamAktif !== 0 ? toplamYukPasif34 / toplamAktif : null;
  const oranFinAktif = toplamAktif !== 0 ? nakitVeFinansalAktif10_11 / toplamAktif : null;
  return {
    sirketKodu,
    brutPrim,
    yatirimGeliriSegment,
    safiTeknikKz,
    vok,
    ozsermaye,
    toplamAktif,
    toplamYukPasif34,
    nakitVeFinansalAktif10_11,
    brutPrimLog10,
    oranSafiPrim,
    oranVokOzsermaye,
    oranYatirimOzsermaye,
    oranOzAktif,
    oranYukAktif,
    oranFinAktif,
  };
}

export type SegmentSkorBilesen = {
  kpiId: string;
  /** 0–100, sektör (peer) min–max; tanımsız → `null` */
  puan: number | null;
  agirlik: number;
  /** Ham değer (oran veya log10 prim) */
  hamDeger: number | null;
  yuksekIyi: boolean;
};

/** Segment skoru peer kümesi: hayat dışı (HD) ve hayat/emeklilik (H, E, kod 3…) ayrı skorlanır. */
export type SegmentSkorPool = "HD" | "HAYAT_EMEKLILIK";

export type SirketSegmentSkorSonuc = {
  donem: string;
  sirketKodu: number;
  pool: SegmentSkorPool;
  /** 0–100, ağırlıklı toplam */
  segmentSkoru: number;
  ham: SirketSegmentHamMetrik;
  bilesenler: SegmentSkorBilesen[];
  peerSayisi: number;
};

export type SirketSegmentSkorOpts = {
  kpiler?: readonly SegmentSkorKpiTanim[];
  pool?: SegmentSkorPool;
};

function rowMatchesSegmentPool(r: TsbGelirTidyRowLike, pool: SegmentSkorPool): boolean {
  if (!Number.isFinite(r.sirketKodu) || isTsbToplamSirketKodu(r.sirketKodu)) return false;
  const t = String(r.sirketTipi ?? "").trim().toUpperCase();
  const p3 = sirketKoduHayatEmeklilikPrefix(r.sirketKodu);
  if (pool === "HAYAT_EMEKLILIK") return p3 || t === "H" || t === "E";
  return !p3 && t === "HD";
}

/**
 * Aynı `donem` için segment peer listesi (tidy’de en az bir satırı olan şirket kodları).
 * - **HD:** `sirketTipi === "HD"` ve kod 3… değil (`tsbPrimDashboard.isHayatdisiSirket` ile uyumlu).
 * - **HAYAT_EMEKLILIK:** kod 3… veya tip **H** / **E** (`isHayatEmeklilikSirket` ile uyumlu).
 */
export function segmentPeerSirketKodlari(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  pool: SegmentSkorPool,
): number[] {
  const set = new Set<number>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegmentPool(r, pool)) continue;
    set.add(r.sirketKodu);
  }
  return [...set].sort((a, b) => a - b);
}

export type SegmentSkorKpiTanim = {
  id: string;
  labelTr: string;
  agirlik: number;
  /** `true`: yüksek ham = iyi; `false`: düşük ham = iyi (ör. kaldıraç) */
  yuksekIyi: boolean;
  /** Ham metrikten sayı çekme */
  ham: (m: SirketSegmentHamMetrik) => number | null;
};

/** Varsayılan KPI seti — ağırlıklar toplamı **1** (`docs/tsb-kpi-tanimlari.md` §6.1) */
export const SEGMENT_SKOR_KPI_VARSAYILAN: readonly SegmentSkorKpiTanim[] = [
  {
    id: "prim_olcek_log10",
    labelTr: "Brüt prim ölçeği (log₁₀)",
    agirlik: 0.35,
    yuksekIyi: true,
    ham: (m) => m.brutPrimLog10,
  },
  {
    id: "safi_prim",
    labelTr: "SAFİ teknik K/Z ÷ brüt prim",
    agirlik: 0.05,
    yuksekIyi: true,
    ham: (m) => m.oranSafiPrim,
  },
  {
    id: "vok_ozsermaye",
    labelTr: "VÖK ÷ özsermaye",
    agirlik: 0.2,
    yuksekIyi: true,
    ham: (m) => m.oranVokOzsermaye,
  },
  {
    id: "yatirim_ozsermaye",
    labelTr: "Yatırım geliri (segment) ÷ özsermaye",
    agirlik: 0.1,
    yuksekIyi: true,
    ham: (m) => m.oranYatirimOzsermaye,
  },
  {
    id: "oz_aktif",
    labelTr: "Özsermaye ÷ toplam aktif",
    agirlik: 0.05,
    yuksekIyi: true,
    ham: (m) => m.oranOzAktif,
  },
  {
    id: "yuk_aktif",
    labelTr: "Yükümlülük (3+4) ÷ toplam aktif",
    agirlik: 0.1,
    yuksekIyi: false,
    ham: (m) => m.oranYukAktif,
  },
  {
    id: "fin_aktif",
    labelTr: "(Nakit ve nakit benzerleri (10) + Finansal varlıklar (11)) ÷ toplam aktif",
    agirlik: 0.15,
    yuksekIyi: true,
    ham: (m) => m.oranFinAktif,
  },
] as const;

function minMaxPuan0_100(xs: number[], xi: number, yuksekIyi: boolean): number {
  const finite = xs.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return 50;
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  let p: number;
  if (max <= min) p = 50;
  else p = ((xi - min) / (max - min)) * 100;
  if (!yuksekIyi) p = 100 - p;
  return Math.max(0, Math.min(100, p));
}

/** @deprecated Aynı anlama gelir: `segmentPeerSirketKodlari(rows, donem, "HD")` */
export function hdSirketKodlariFromGelirTidy(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
): number[] {
  return segmentPeerSirketKodlari(rows, donem, "HD");
}

export type SegmentTertileHarfi = "A" | "B" | "C";

/** Skora göre sıralı havuzda üst/orta/alt üçte birlik → segment harfi ve adı. */
export function tertileSegmentEtiketleri(
  sirketSkorlari: readonly { sirketKodu: number; segmentSkoru: number }[],
): Map<number, { harf: SegmentTertileHarfi; segmentAdiTr: string; sira: number }> {
  const sorted = [...sirketSkorlari].sort((a, b) => b.segmentSkoru - a.segmentSkoru);
  const size = Math.max(1, Math.ceil(sorted.length / 3));
  const map = new Map<number, { harf: SegmentTertileHarfi; segmentAdiTr: string; sira: number }>();
  sorted.forEach((row, i) => {
    const sira = i + 1;
    let harf: SegmentTertileHarfi;
    let segmentAdiTr: string;
    if (sira <= size) {
      harf = "A";
      segmentAdiTr = "Üst segment (A) — üst üçte birlik";
    } else if (sira <= 2 * size) {
      harf = "B";
      segmentAdiTr = "Orta segment (B)";
    } else {
      harf = "C";
      segmentAdiTr = "Alt segment (C) — alt üçte birlik";
    }
    map.set(row.sirketKodu, { harf, segmentAdiTr, sira });
  });
  return map;
}

/**
 * Hedef şirketin segment skoru: peer kümesi = aynı dönem + aynı **pool** (HD veya Hayat/Emeklilik).
 * Her KPI için peer’lar üzerinde min–max → 0–100; ağırlıklı ortalama = **segment skoru** (0–100).
 */
export function sirketSegmentSkoruFromRows(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  sirketKodu: number,
  opts: SirketSegmentSkorOpts = {},
): SirketSegmentSkorSonuc | null {
  const kpiler = opts.kpiler ?? SEGMENT_SKOR_KPI_VARSAYILAN;
  const pool = opts.pool ?? "HD";
  const peers = segmentPeerSirketKodlari(rows, donem, pool);
  if (!peers.includes(sirketKodu)) return null;

  const lookup = buildGelirTidyDonemLookup(rows, donem);
  const hamList = peers.map((k) => hamMetrikFromLookup(lookup, k));
  const idx = peers.indexOf(sirketKodu);
  const ham = hamList[idx]!;

  const bilesenler: SegmentSkorBilesen[] = [];
  let skor = 0;
  let wKullanilan = 0;

  for (const def of kpiler) {
    const hamDeger = def.ham(ham);
    const seri = hamList.map((m) => def.ham(m));
    const peerHam = seri.map((v) => (v === null || v === undefined || !Number.isFinite(v) ? NaN : v));

    if (hamDeger === null || hamDeger === undefined || !Number.isFinite(hamDeger)) {
      bilesenler.push({
        kpiId: def.id,
        puan: null,
        agirlik: def.agirlik,
        hamDeger: null,
        yuksekIyi: def.yuksekIyi,
      });
      continue;
    }

    const xs = peerHam.filter((v) => Number.isFinite(v));
    if (xs.length === 0) {
      bilesenler.push({
        kpiId: def.id,
        puan: null,
        agirlik: def.agirlik,
        hamDeger: hamDeger,
        yuksekIyi: def.yuksekIyi,
      });
      continue;
    }

    const puan = minMaxPuan0_100(xs, hamDeger, def.yuksekIyi);
    skor += def.agirlik * puan;
    wKullanilan += def.agirlik;
    bilesenler.push({
      kpiId: def.id,
      puan,
      agirlik: def.agirlik,
      hamDeger: hamDeger,
      yuksekIyi: def.yuksekIyi,
    });
  }

  const segmentSkoru = wKullanilan > 0 ? skor / wKullanilan : 50;

  return {
    donem,
    sirketKodu,
    pool,
    segmentSkoru: Math.max(0, Math.min(100, segmentSkoru)),
    ham,
    bilesenler,
    peerSayisi: peers.length,
  };
}
