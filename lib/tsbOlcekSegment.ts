/**
 * Ölçek segmenti — yalnızca büyüklük (prim, özsermaye, aktif).
 * Performans skorundan (`tsbSirketSegmentSkor.ts`) ayrıdır.
 *
 * Dağılım: A+ %10 · A %20 · B %40 · C %20 · D %10 (skora göre sıralı).
 * Doküman: `docs/tsb-kpi-tanimlari.md` §6.5
 */

import type { TsbGelirTidyRowLike } from "./tsbYatirimGeliriKpi";
import {
  buildGelirTidyDonemLookup,
  hamMetrikFromLookup,
  segmentPeerSirketKodlari,
  type SegmentSkorPool,
} from "./tsbSirketSegmentSkor";

export type OlcekSegmentHarfi = "A+" | "A" | "B" | "C" | "D";

export type OlcekSegmentKpiTanim = {
  id: string;
  labelTr: string;
  agirlik: number;
  ham: (m: { brutPrim: number; ozsermaye: number; toplamAktif: number }) => number;
};

/** Brüt prim %50 · özsermaye %30 · toplam aktif %20 */
export const OLCEK_SEGMENT_KPI: readonly OlcekSegmentKpiTanim[] = [
  {
    id: "brut_prim",
    labelTr: "Brüt prim",
    agirlik: 0.5,
    ham: (m) => m.brutPrim,
  },
  {
    id: "ozsermaye",
    labelTr: "Özsermaye",
    agirlik: 0.3,
    ham: (m) => m.ozsermaye,
  },
  {
    id: "toplam_aktif",
    labelTr: "Toplam aktif",
    agirlik: 0.2,
    ham: (m) => m.toplamAktif,
  },
] as const;

export type OlcekSegmentBilesen = {
  kpiId: string;
  labelTr: string;
  hamDeger: number;
  puan: number;
  agirlik: number;
};

export type OlcekSegmentHam = {
  brutPrim: number;
  ozsermaye: number;
  toplamAktif: number;
};

export type SirketOlcekSegmentSonuc = {
  donem: string;
  sirketKodu: number;
  pool: SegmentSkorPool;
  olcekSkoru: number;
  /** Havuz genelinde ölçek skoru sırası (1 = en büyük) */
  olcekSirasi: number;
  olcekSegmenti: OlcekSegmentHarfi;
  olcekSegmentAdiTr: string;
  /** Aynı segment harfi (A+, A, …) içinde ölçek skoru sırası */
  segmentSirasi: number;
  /** Aynı segment harfindeki şirket sayısı */
  segmentPeerSayisi: number;
  bilesenler: OlcekSegmentBilesen[];
  ham: OlcekSegmentHam;
  peerSayisi: number;
};

function minMaxPuan0_100(xs: number[], xi: number): number {
  const finite = xs.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return 50;
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  if (max <= min) return 50;
  const p = ((xi - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, p));
}

/** Skora göre sıra (1 = en yüksek ölçek skoru) → A+ … D */
export function olcekSegmentHarfiFromSira(sira: number, peerSayisi: number): OlcekSegmentHarfi {
  const n = Math.max(1, peerSayisi);
  const s = Math.max(1, sira);
  if (s <= Math.ceil(n * 0.1)) return "A+";
  if (s <= Math.ceil(n * 0.3)) return "A";
  if (s <= Math.ceil(n * 0.7)) return "B";
  if (s <= Math.ceil(n * 0.9)) return "C";
  return "D";
}

export function olcekSegmentAdiTr(harf: OlcekSegmentHarfi): string {
  switch (harf) {
    case "A+":
      return "Üst ölçek (A+) — en büyük %10";
    case "A":
      return "Büyük ölçek (A)";
    case "B":
      return "Orta ölçek (B)";
    case "C":
      return "Küçük-orta ölçek (C)";
    case "D":
      return "Küçük ölçek (D) — en küçük %10";
  }
}

/** Dashboard rozet ve kartları için kısa ad. */
export function olcekSegmentKisaAdi(harf: OlcekSegmentHarfi): string {
  switch (harf) {
    case "A+":
      return "Üst Ölçek";
    case "A":
      return "Büyük Ölçek";
    case "B":
      return "Orta Ölçek";
    case "C":
      return "Küçük-Orta Ölçek";
    case "D":
      return "Küçük Ölçek";
  }
}

export type OlcekSegmentSirketKayit = {
  sirketKodu: number;
  sirketAdi: string;
  olcekSkoru: number;
  /** Sektör havuzunda ölçek skoru sırası */
  olcekSirasi: number;
  olcekSegment: OlcekSegmentHarfi;
  olcekSegmentAdi: string;
  /** Aynı ölçek segmenti içinde sıra */
  segmentSirasi: number;
  segmentPeerSayisi: number;
  peerSayisi: number;
  /** Ölçek skoru girdileri (son finansal çeyrek TL) */
  brutPrim?: number;
  ozsermaye?: number;
  toplamAktif?: number;
};

export function olcekSegmentSirketKayit(
  sonuc: SirketOlcekSegmentSonuc,
  sirketAdi: string,
): OlcekSegmentSirketKayit {
  return {
    sirketKodu: sonuc.sirketKodu,
    sirketAdi,
    olcekSkoru: sonuc.olcekSkoru,
    olcekSirasi: sonuc.olcekSirasi,
    olcekSegment: sonuc.olcekSegmenti,
    olcekSegmentAdi: olcekSegmentKisaAdi(sonuc.olcekSegmenti),
    segmentSirasi: sonuc.segmentSirasi,
    segmentPeerSayisi: sonuc.segmentPeerSayisi,
    peerSayisi: sonuc.peerSayisi,
    brutPrim: sonuc.ham.brutPrim,
    ozsermaye: sonuc.ham.ozsermaye,
    toplamAktif: sonuc.ham.toplamAktif,
  };
}

/** Seçili şirketle aynı ölçek segmentindeki peer kodları. */
export function olcekSegmentEsleri(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  pool: SegmentSkorPool,
  sirketKodu: number,
): {
  segment: OlcekSegmentHarfi | null;
  kodlar: number[];
  sirket: SirketOlcekSegmentSonuc | null;
} {
  const havuz = olcekSegmentHavuzuFromRows(rows, donem, pool);
  const sirket = havuz.find((x) => x.sirketKodu === sirketKodu) ?? null;
  if (!sirket) return { segment: null, kodlar: [], sirket: null };
  const kodlar = havuz.filter((x) => x.olcekSegmenti === sirket.olcekSegmenti).map((x) => x.sirketKodu);
  return { segment: sirket.olcekSegmenti, kodlar, sirket };
}

function hamFromLookup(
  lookup: ReturnType<typeof buildGelirTidyDonemLookup>,
  sirketKodu: number,
): OlcekSegmentHam {
  const m = hamMetrikFromLookup(lookup, sirketKodu);
  return {
    brutPrim: m.brutPrim,
    ozsermaye: m.ozsermaye,
    toplamAktif: m.toplamAktif,
  };
}

function olcekSkoruHesapla(
  ham: OlcekSegmentHam,
  hamList: OlcekSegmentHam[],
  kpiler: readonly OlcekSegmentKpiTanim[],
): { skor: number; bilesenler: OlcekSegmentBilesen[] } {
  const bilesenler: OlcekSegmentBilesen[] = [];
  let skor = 0;
  let wKullanilan = 0;

  for (const def of kpiler) {
    const hamDeger = def.ham(ham);
    const seri = hamList.map((m) => def.ham(m));
    const xs = seri.filter((v) => Number.isFinite(v));
    if (!Number.isFinite(hamDeger) || xs.length === 0) {
      bilesenler.push({
        kpiId: def.id,
        labelTr: def.labelTr,
        hamDeger,
        puan: 50,
        agirlik: def.agirlik,
      });
      skor += def.agirlik * 50;
      wKullanilan += def.agirlik;
      continue;
    }
    const puan = minMaxPuan0_100(xs, hamDeger);
    skor += def.agirlik * puan;
    wKullanilan += def.agirlik;
    bilesenler.push({
      kpiId: def.id,
      labelTr: def.labelTr,
      hamDeger,
      puan,
      agirlik: def.agirlik,
    });
  }

  const olcekSkoru = wKullanilan > 0 ? skor / wKullanilan : 50;
  return { skor: Math.max(0, Math.min(100, olcekSkoru)), bilesenler };
}

/** Havuzdaki tüm şirketler için ölçek skoru + sıra + segment (skora göre azalan). */
export function olcekSegmentHavuzuFromRows(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  pool: SegmentSkorPool,
  kpiler: readonly OlcekSegmentKpiTanim[] = OLCEK_SEGMENT_KPI,
): SirketOlcekSegmentSonuc[] {
  const peers = segmentPeerSirketKodlari(rows, donem, pool);
  if (peers.length === 0) return [];

  const lookup = buildGelirTidyDonemLookup(rows, donem);
  const hamList = peers.map((k) => hamFromLookup(lookup, k));

  const ara = peers.map((sirketKodu, i) => {
    const ham = hamList[i]!;
    const { skor, bilesenler } = olcekSkoruHesapla(ham, hamList, kpiler);
    return { sirketKodu, ham, olcekSkoru: skor, bilesenler };
  });

  ara.sort((a, b) => b.olcekSkoru - a.olcekSkoru || a.sirketKodu - b.sirketKodu);

  const peerSayisi = ara.length;
  const withSegment = ara.map((row, idx) => {
    const olcekSirasi = idx + 1;
    const olcekSegmenti = olcekSegmentHarfiFromSira(olcekSirasi, peerSayisi);
    return { ...row, olcekSirasi, olcekSegmenti };
  });

  const segmentRank = new Map<number, { segmentSirasi: number; segmentPeerSayisi: number }>();
  const bySegment = new Map<OlcekSegmentHarfi, typeof withSegment>();
  for (const row of withSegment) {
    const list = bySegment.get(row.olcekSegmenti) ?? [];
    list.push(row);
    bySegment.set(row.olcekSegmenti, list);
  }
  for (const list of bySegment.values()) {
    list.sort((a, b) => b.olcekSkoru - a.olcekSkoru || a.sirketKodu - b.sirketKodu);
    list.forEach((row, i) => {
      segmentRank.set(row.sirketKodu, { segmentSirasi: i + 1, segmentPeerSayisi: list.length });
    });
  }

  return withSegment.map((row) => {
    const sr = segmentRank.get(row.sirketKodu)!;
    return {
      donem,
      sirketKodu: row.sirketKodu,
      pool,
      olcekSkoru: row.olcekSkoru,
      olcekSirasi: row.olcekSirasi,
      olcekSegmenti: row.olcekSegmenti,
      olcekSegmentAdiTr: olcekSegmentAdiTr(row.olcekSegmenti),
      segmentSirasi: sr.segmentSirasi,
      segmentPeerSayisi: sr.segmentPeerSayisi,
      bilesenler: row.bilesenler,
      ham: row.ham,
      peerSayisi,
    };
  });
}

/** Tek şirket — havuzda yoksa `null`. */
export function sirketOlcekSegmentFromRows(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  sirketKodu: number,
  pool: SegmentSkorPool,
): SirketOlcekSegmentSonuc | null {
  const havuz = olcekSegmentHavuzuFromRows(rows, donem, pool);
  return havuz.find((x) => x.sirketKodu === sirketKodu) ?? null;
}
