/**
 * Excel “Sektör Karşılaştırma” yapısına yakın tablo:
 * satırlar = KPI, sütunlar = (bu dönem · 1 yıl önce · Δ) × (şirket · sektör).
 * Üstte havuz seçici: HD (hayat dışı) veya hayat–emeklilik.
 * Kaynak: `public/data/tsb/gelir-tidy/{donem}.json` (+ `index.json`) — tanımlar `docs/tsb-kpi-tanimlari.md`.
 */

import { GELIR_SYNTHETIC_HESAP_KODU } from "./tsbGelirSyntheticCodes";
import type { TsbGelirTidyRowLike } from "./tsbYatirimGeliriKpi";
import {
  buildGelirTidyDonemLookup,
  gelirTidyCell,
  hamMetrikFromLookup,
  segmentPeerSirketKodlari,
  type GelirTidyDonemLookup,
  type SegmentSkorPool,
} from "./tsbSirketSegmentSkor";

const GT = "GT";
const BL = "BL";
const MALI = "MALI";
const HAYATDISI = "HAYATDISI";
const PASIF = "Pasif";
const AKTIF = "Aktif";
const TRAFIK = "TRAFİK";

/** `docs/tsb-kpi-tanimlari.md` §4 — genel gider kalemleri (HAYATDISI) */
const GENEL_GIDER_HESAP_KODLARI = [
  "61402",
  "63602",
  "65202",
  "61403",
  "63603",
  "65203",
  "61404",
  "63604",
  "65204",
  "61405",
  "63605",
  "65205",
  "61406",
  "63606",
  "65206",
] as const;

const PERSONEL_GIDER_HESAP_KODLARI = ["61402", "63602", "65202"] as const;

export type FinansalKiyaslamaSatirFormat = "tl" | "yuzde" | "oran";

export type FinansalKiyaslamaSatirTanim = {
  id: string;
  label: string;
  kaynakNotu?: string;
  format: FinansalKiyaslamaSatirFormat;
};

export type FinansalKiyaslamaHamOlcum = {
  donemKar690: number;
  ozsermaye: number;
  brutPrim: number;
  primTrafikHaric: number;
  faaliyet614: number;
  personelGider: number;
  genelGider: number;
  yatirimSegment: number;
  teknikKarZarar: number;
  safiTeknikKz: number;
  teknikKarsilik3545: number;
  maliKarSentetik: number;
  vok: number;
  toplamAktif: number;
  yuk34: number;
  aktif1: number;
  pasif3: number;
  nakit10: number;
  finansal11: number;
};

export type FinansalKiyaslamaSektorOranlar = {
  safiPrim: number | null;
  vokOz: number | null;
  yatOz: number | null;
  ozAktif: number | null;
  yukAktif: number | null;
  finAktif: number | null;
  cari: number | null;
  nakitKisa: number | null;
  vokYatirim: number | null;
};

export function uniqueSortedGelirDonemler(rows: Iterable<TsbGelirTidyRowLike>): string[] {
  const s = new Set<string>();
  for (const r of rows) {
    if (r.donem) s.add(r.donem);
  }
  return [...s].sort();
}

export function listSirketleriGelirDonemForPool(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  pool: SegmentSkorPool,
): { kod: number; ad: string }[] {
  const kodlar = new Set(segmentPeerSirketKodlari(rows, donem, pool));
  const adlar = new Map<number, string>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!kodlar.has(r.sirketKodu)) continue;
    if (!adlar.has(r.sirketKodu)) {
      adlar.set(r.sirketKodu, (r.sirketAdi ?? "").trim() || `Şirket ${r.sirketKodu}`);
    }
  }
  return [...adlar.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([kod, ad]) => ({ kod, ad }));
}

/** `"2026-1"` → `"2025-1"` (yoksa `null`); biçim `YYYY-Q` değilse `null`. */
export function oncekiYilDonem(donem: string): string | null {
  const m = donem.match(/^(\d{4})-([1-4])$/);
  if (!m) return null;
  const yil = Number(m[1]);
  if (!Number.isFinite(yil)) return null;
  return `${yil - 1}-${m[2]}`;
}

function hamOlcumFromLookup(lookup: GelirTidyDonemLookup, sk: number): FinansalKiyaslamaHamOlcum | null {
  if (!lookup.has(sk)) return null;
  const h = hamMetrikFromLookup(lookup, sk);
  const g = (br: string, hk: string) => gelirTidyCell(lookup, sk, GT, br, hk);
  const bl = (ap: string, hk: string) => gelirTidyCell(lookup, sk, BL, ap, hk);

  const brutTrafik = g(TRAFIK, "60001");
  const primTrafikHaric = h.brutPrim - brutTrafik;

  let personelGider = 0;
  for (const kod of PERSONEL_GIDER_HESAP_KODLARI) {
    personelGider += g(HAYATDISI, kod);
  }
  let genelGider = 0;
  for (const kod of GENEL_GIDER_HESAP_KODLARI) {
    genelGider += g(HAYATDISI, kod);
  }

  const teknikKarZarar = g(HAYATDISI, GELIR_SYNTHETIC_HESAP_KODU.teknikKarZarar);
  const maliKarSentetik = g(MALI, GELIR_SYNTHETIC_HESAP_KODU.maliKar);
  const teknikKarsilik3545 = bl(PASIF, "35") + bl(PASIF, "45");
  const faaliyet614 = g(HAYATDISI, "614");
  const donemKar690 = g(MALI, "690");

  return {
    donemKar690,
    ozsermaye: h.ozsermaye,
    brutPrim: h.brutPrim,
    primTrafikHaric,
    faaliyet614,
    personelGider,
    genelGider,
    yatirimSegment: h.yatirimGeliriSegment,
    teknikKarZarar,
    safiTeknikKz: h.safiTeknikKz,
    teknikKarsilik3545,
    maliKarSentetik,
    vok: h.vok,
    toplamAktif: h.toplamAktif,
    yuk34: h.toplamYukPasif34,
    aktif1: bl(AKTIF, "1"),
    pasif3: bl(PASIF, "3"),
    nakit10: bl(AKTIF, "10"),
    finansal11: bl(AKTIF, "11"),
  };
}

function meanFinite(xs: number[]): number | null {
  const ok = xs.filter((x) => Number.isFinite(x));
  if (ok.length === 0) return null;
  return ok.reduce((a, b) => a + b, 0) / ok.length;
}

function aggregateSektorHamOlcumleri(list: FinansalKiyaslamaHamOlcum[]): FinansalKiyaslamaHamOlcum | null {
  if (list.length === 0) return null;
  const m = (fn: (x: FinansalKiyaslamaHamOlcum) => number) => meanFinite(list.map(fn)) ?? 0;
  return {
    donemKar690: m((x) => x.donemKar690),
    ozsermaye: m((x) => x.ozsermaye),
    brutPrim: m((x) => x.brutPrim),
    primTrafikHaric: m((x) => x.primTrafikHaric),
    faaliyet614: m((x) => x.faaliyet614),
    personelGider: m((x) => x.personelGider),
    genelGider: m((x) => x.genelGider),
    yatirimSegment: m((x) => x.yatirimSegment),
    teknikKarZarar: m((x) => x.teknikKarZarar),
    safiTeknikKz: m((x) => x.safiTeknikKz),
    teknikKarsilik3545: m((x) => x.teknikKarsilik3545),
    maliKarSentetik: m((x) => x.maliKarSentetik),
    vok: m((x) => x.vok),
    toplamAktif: m((x) => x.toplamAktif),
    yuk34: m((x) => x.yuk34),
    aktif1: m((x) => x.aktif1),
    pasif3: m((x) => x.pasif3),
    nakit10: m((x) => x.nakit10),
    finansal11: m((x) => x.finansal11),
  };
}

function sektorOranlarFromPeerHams(list: FinansalKiyaslamaHamOlcum[]): FinansalKiyaslamaSektorOranlar {
  const sum = (fn: (x: FinansalKiyaslamaHamOlcum) => number) => list.reduce((a, x) => a + fn(x), 0);
  const sumPrim = sum((x) => x.brutPrim);
  const sumSafi = sum((x) => x.safiTeknikKz);
  const sumVok = sum((x) => x.vok);
  const sumOz = sum((x) => x.ozsermaye);
  const sumYat = sum((x) => x.yatirimSegment);
  const sumAktif = sum((x) => x.toplamAktif);
  const sumYuk = sum((x) => x.yuk34);
  const sumFin11 = sum((x) => x.nakit10 + x.finansal11);
  const sumA1 = sum((x) => x.aktif1);
  const sumP3 = sum((x) => x.pasif3);
  const sumN10 = sum((x) => x.nakit10);
  return {
    safiPrim: sumPrim !== 0 ? sumSafi / sumPrim : null,
    vokOz: sumOz !== 0 ? sumVok / sumOz : null,
    yatOz: sumOz !== 0 ? sumYat / sumOz : null,
    ozAktif: sumAktif !== 0 ? sumOz / sumAktif : null,
    yukAktif: sumAktif !== 0 ? sumYuk / sumAktif : null,
    finAktif: sumAktif !== 0 ? sumFin11 / sumAktif : null,
    cari: sumP3 !== 0 ? sumA1 / sumP3 : null,
    nakitKisa: sumP3 !== 0 ? sumN10 / sumP3 : null,
    vokYatirim: sumYat !== 0 ? sumVok / sumYat : null,
  };
}

export type FinansalKiyaslamaDonemPaketi = {
  donem: string;
  pool: SegmentSkorPool;
  sirketHam: FinansalKiyaslamaHamOlcum | null;
  sektorHam: FinansalKiyaslamaHamOlcum | null;
  sektorOran: FinansalKiyaslamaSektorOranlar | null;
  sirketSkorHam: ReturnType<typeof hamMetrikFromLookup> | null;
  peerSayisi: number;
};

export function finansalKiyaslamaDonemPaketi(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  sirketKodu: number,
  pool: SegmentSkorPool,
): FinansalKiyaslamaDonemPaketi {
  const lookup = buildGelirTidyDonemLookup(rows, donem);
  const peers = segmentPeerSirketKodlari(rows, donem, pool).filter((k) => lookup.has(k));
  const peerHams = peers
    .map((pk) => hamOlcumFromLookup(lookup, pk))
    .filter((x): x is FinansalKiyaslamaHamOlcum => x !== null);
  const sektorHam = aggregateSektorHamOlcumleri(peerHams);
  const sektorOran = peerHams.length > 0 ? sektorOranlarFromPeerHams(peerHams) : null;
  const sirketHam = hamOlcumFromLookup(lookup, sirketKodu);
  const sirketSkorHam = lookup.has(sirketKodu) ? hamMetrikFromLookup(lookup, sirketKodu) : null;
  return {
    donem,
    pool,
    sirketHam,
    sektorHam,
    sektorOran,
    sirketSkorHam,
    peerSayisi: peerHams.length,
  };
}

/** Δ (değişim): TL/sayı → yüzde değişim, yüzde/oran → mutlak fark (puan/oran farkı). */
export function finansalKiyaslamaDegisim(
  bu: number | null,
  onceki: number | null,
  format: FinansalKiyaslamaSatirFormat,
): { deger: number | null; format: "yuzdeDegisim" | "puanFark" | "oranFark" } {
  if (bu === null || onceki === null || !Number.isFinite(bu) || !Number.isFinite(onceki)) {
    return { deger: null, format: format === "yuzde" ? "puanFark" : format === "oran" ? "oranFark" : "yuzdeDegisim" };
  }
  if (format === "yuzde") {
    return { deger: bu - onceki, format: "puanFark" };
  }
  if (format === "oran") {
    return { deger: bu - onceki, format: "oranFark" };
  }
  if (onceki === 0) {
    return { deger: null, format: "yuzdeDegisim" };
  }
  return { deger: (bu - onceki) / Math.abs(onceki), format: "yuzdeDegisim" };
}

/** Tablo satırları (Excel Sektör Karşılaştırma sırasına yakın). */
export const FINANSAL_KIYASLAMA_SATIRLARI: readonly FinansalKiyaslamaSatirTanim[] = [
  {
    id: "vergi_oncesi_kar",
    label: "Vergi öncesi kar (yaklaşık)",
    kaynakNotu: "GT · MALI · 690 — “Dönem karı veya zararı”",
    format: "tl",
  },
  { id: "ozsermaye", label: "Özsermaye (dönem sonu)", kaynakNotu: "BL · Pasif · 5", format: "tl" },
  { id: "prim", label: "Brüt prim", kaynakNotu: "GT · HAYATDISI · 60001", format: "tl" },
  {
    id: "tarsim_prim",
    label: "TARSİM prim",
    kaynakNotu: "prim-tidy / kanal kırılımı ile ileride",
    format: "tl",
  },
  {
    id: "prim_trafik_haric",
    label: "Trafik hariç brüt prim",
    kaynakNotu: "HAYATDISI 60001 − TRAFİK 60001 (`docs/tsb-kpi-tanimlari.md` §3.2)",
    format: "tl",
  },
  { id: "faaliyet_gider", label: "Faaliyet giderleri", kaynakNotu: "GT · HAYATDISI · 614", format: "tl" },
  {
    id: "genel_gider",
    label: "Genel giderler (özet kodlar toplamı)",
    kaynakNotu: "§4 — 61402…65206",
    format: "tl",
  },
  {
    id: "personel_gider",
    label: "Personel giderleri",
    kaynakNotu: "61402 + 63602 + 65202",
    format: "tl",
  },
  {
    id: "personel_sayi",
    label: "Personel sayısı",
    kaynakNotu: "TSB ayrı tablo — yakında",
    format: "tl",
  },
  {
    id: "yatirim",
    label: "Yatırım geliri (segment)",
    kaynakNotu: "§4.3 — MALI",
    format: "tl",
  },
  {
    id: "teknik_kar_zarar",
    label: "Teknik kar / zarar",
    kaynakNotu: "Sentetik __SYN_TKN_KZ__ · HAYATDISI",
    format: "tl",
  },
  { id: "safi_teknik", label: "Safî teknik kar / zarar", kaynakNotu: "§4.2", format: "tl" },
  {
    id: "teknik_karsilik",
    label: "Teknik karşılıklar (üst grup)",
    kaynakNotu: "BL · Pasif · 35 + 45",
    format: "tl",
  },
  { id: "mali_kar", label: "Malî kar (sentetik)", kaynakNotu: "__SYN_MALI_KAR__ · MALI", format: "tl" },
  { id: "vok", label: "VÖK", kaynakNotu: "§4.1", format: "tl" },
  { id: "oran_safi_prim", label: "Safî teknik / prim", format: "yuzde" },
  { id: "oran_vok_oz", label: "VÖK / özsermaye", format: "oran" },
  { id: "oran_yat_oz", label: "Yatırım (segment) / özsermaye", format: "oran" },
  { id: "oran_oz_aktif", label: "Özsermaye / toplam aktif", format: "yuzde" },
  { id: "oran_yuk_aktif", label: "Yükümlülük (3+4) / toplam aktif", format: "yuzde" },
  { id: "oran_fin_aktif", label: "(Nakit 10 + Finansal 11) / toplam aktif", format: "yuzde" },
  { id: "oran_cari", label: "Cari oran (kaba)", kaynakNotu: "Aktif 1 / Pasif 3", format: "oran" },
  { id: "oran_nakit_kisa", label: "Nakit / kısa vadeli yük.", kaynakNotu: "Aktif 10 / Pasif 3", format: "oran" },
  { id: "oran_vok_yatirim", label: "VÖK / yatırım (segment)", format: "oran" },
  {
    id: "hasar_prim",
    label: "Hasar / prim",
    kaynakNotu: "Hasar üretimi tidy ile ileride",
    format: "yuzde",
  },
  {
    id: "hp_brut",
    label: "HP brüt (hayat)",
    kaynakNotu: "Hayat havuzu — ayrı panel",
    format: "tl",
  },
  {
    id: "hp_net",
    label: "HP net (hayat)",
    kaynakNotu: "Hayat havuzu — ayrı panel",
    format: "tl",
  },
] as const;

export function finansalKiyaslamaSatirSayisal(
  satirId: string,
  sirketHam: FinansalKiyaslamaHamOlcum | null,
  sektorHam: FinansalKiyaslamaHamOlcum | null,
  sirketSkorHam: ReturnType<typeof hamMetrikFromLookup> | null,
  sektorOran: FinansalKiyaslamaSektorOranlar | null,
): { sirket: number | null; sektorHd: number | null } {
  const yok = { sirket: null, sektorHd: null };

  const pickHam = (key: keyof FinansalKiyaslamaHamOlcum) => ({
    sirket: sirketHam ? sirketHam[key] : null,
    sektorHd: sektorHam ? sektorHam[key] : null,
  });

  switch (satirId) {
    case "vergi_oncesi_kar":
      return pickHam("donemKar690");
    case "ozsermaye":
      return pickHam("ozsermaye");
    case "prim":
      return pickHam("brutPrim");
    case "tarsim_prim":
    case "personel_sayi":
    case "hasar_prim":
    case "hp_brut":
    case "hp_net":
      return yok;
    case "prim_trafik_haric":
      return pickHam("primTrafikHaric");
    case "faaliyet_gider":
      return pickHam("faaliyet614");
    case "genel_gider":
      return pickHam("genelGider");
    case "personel_gider":
      return pickHam("personelGider");
    case "yatirim":
      return pickHam("yatirimSegment");
    case "teknik_kar_zarar":
      return pickHam("teknikKarZarar");
    case "safi_teknik":
      return pickHam("safiTeknikKz");
    case "teknik_karsilik":
      return pickHam("teknikKarsilik3545");
    case "mali_kar":
      return pickHam("maliKarSentetik");
    case "vok":
      return pickHam("vok");
    case "oran_safi_prim":
      return {
        sirket: sirketSkorHam?.oranSafiPrim ?? null,
        sektorHd: sektorOran?.safiPrim ?? null,
      };
    case "oran_vok_oz":
      return {
        sirket: sirketSkorHam?.oranVokOzsermaye ?? null,
        sektorHd: sektorOran?.vokOz ?? null,
      };
    case "oran_yat_oz":
      return {
        sirket: sirketSkorHam?.oranYatirimOzsermaye ?? null,
        sektorHd: sektorOran?.yatOz ?? null,
      };
    case "oran_oz_aktif":
      return {
        sirket: sirketSkorHam?.oranOzAktif ?? null,
        sektorHd: sektorOran?.ozAktif ?? null,
      };
    case "oran_yuk_aktif":
      return {
        sirket: sirketSkorHam?.oranYukAktif ?? null,
        sektorHd: sektorOran?.yukAktif ?? null,
      };
    case "oran_fin_aktif":
      return {
        sirket: sirketSkorHam?.oranFinAktif ?? null,
        sektorHd: sektorOran?.finAktif ?? null,
      };
    case "oran_cari":
      return {
        sirket:
          sirketHam && sirketHam.pasif3 !== 0 ? sirketHam.aktif1 / sirketHam.pasif3 : null,
        sektorHd: sektorOran?.cari ?? null,
      };
    case "oran_nakit_kisa":
      return {
        sirket:
          sirketHam && sirketHam.pasif3 !== 0 ? sirketHam.nakit10 / sirketHam.pasif3 : null,
        sektorHd: sektorOran?.nakitKisa ?? null,
      };
    case "oran_vok_yatirim":
      return {
        sirket:
          sirketHam && sirketHam.yatirimSegment !== 0
            ? sirketHam.vok / sirketHam.yatirimSegment
            : null,
        sektorHd: sektorOran?.vokYatirim ?? null,
      };
    default:
      return yok;
  }
}

export function formatFinansalHucre(
  v: number | null,
  format: FinansalKiyaslamaSatirFormat,
): string {
  if (v === null || !Number.isFinite(v)) return "—";
  if (format === "tl") {
    return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(v);
  }
  if (format === "yuzde") {
    return `${new Intl.NumberFormat("tr-TR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(v * 100)}%`;
  }
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 3,
    minimumFractionDigits: 3,
  }).format(v);
}

export function formatFinansalDegisim(
  v: number | null,
  degisimFormat: "yuzdeDegisim" | "puanFark" | "oranFark",
): string {
  if (v === null || !Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : "";
  if (degisimFormat === "yuzdeDegisim") {
    return `${sign}${new Intl.NumberFormat("tr-TR", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    }).format(v * 100)}%`;
  }
  if (degisimFormat === "puanFark") {
    return `${sign}${new Intl.NumberFormat("tr-TR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(v * 100)} pp`;
  }
  return `${sign}${new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 3,
    minimumFractionDigits: 3,
  }).format(v)}`;
}
