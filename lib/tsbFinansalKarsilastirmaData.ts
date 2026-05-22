/**
 * Excel “Sektör Karşılaştırma” yapısına yakın tablo:
 * satırlar = KPI, sütunlar = (bu dönem · 1 yıl önce · Δ) × (şirket · sektör toplamı).
 * Üstte havuz seçici: HD (hayat dışı) veya hayat–emeklilik.
 * Kaynak: `public/data/tsb/gelir-tidy/{donem}.json` (+ `index.json`) — tanımlar `docs/tsb-kpi-tanimlari.md`.
 */

import { GELIR_SYNTHETIC_HESAP_KODU } from "./tsbGelirSyntheticCodes";
import {
  hasarPrimOranlariFromLookup,
  hasarPrimOranlariSektorFromLookup,
  type HasarPrimOranlari,
} from "./tsbHasarPrimOrani";
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

import {
  faaliyetGiderFromLookup,
  genelGiderFromLookup,
  personelGiderFromLookup,
  safiTeknikKzFromLookup,
  teknikKarZararFromLookup,
} from "./tsbGelirGtOzet";

export type FinansalKiyaslamaSatirFormat = "tl" | "yuzde" | "oran";

export type FinansalKiyaslamaSatirTanim =
  | {
      kind?: "kpi";
      id: string;
      label: string;
      format: FinansalKiyaslamaSatirFormat;
    }
  | {
      kind: "spacer";
      id: string;
    };

/** Finansal karşılaştırma tablosu — görünen etiketler ve sıra. */
export const FINANSAL_KIYASLAMA_SATIRLARI: readonly FinansalKiyaslamaSatirTanim[] = [
  { id: "prim", label: "BRÜT PRİM", format: "tl" },
  { id: "prim_trafik_haric", label: "TRAFİK HARİÇ BRÜT PRİM", format: "tl" },
  { id: "safi_teknik", label: "SAFÎ TEKNİK KAR / ZARAR", format: "tl" },
  { id: "faaliyet_gider", label: "FAALİYET GİDERLERİ", format: "tl" },
  { id: "genel_gider", label: "GENEL GİDERLER", format: "tl" },
  { id: "personel_gider", label: "PERSONEL GİDERLERİ", format: "tl" },
  { id: "yatirim", label: "YATIRIM GELİRİ", format: "tl" },
  { id: "mali_kar", label: "MALÎ KAR", format: "tl" },
  { id: "teknik_kar_zarar", label: "TEKNİK KAR / ZARAR", format: "tl" },
  { id: "vergi_oncesi_kar", label: "VERGİ ÖNCESİ KAR", format: "tl" },
  { id: "net_kar", label: "NET KAR", format: "tl" },
  { kind: "spacer", id: "__spacer_gelir_bilanco" },
  { id: "ozsermaye", label: "ÖZSERMAYE", format: "tl" },
  { id: "teknik_karsilik", label: "TEKNİK KARŞILIKLAR", format: "tl" },
  { id: "oran_safi_prim", label: "SAFİ TEKNİK / PRİM", format: "yuzde" },
  { id: "oran_vok_oz", label: "VÖK / ÖZSERMAYE", format: "oran" },
  { id: "oran_yat_oz", label: "YATIRIM GELİRİ / ÖZSERMAYE", format: "oran" },
  { id: "oran_oz_aktif", label: "ÖZSERMAYE / TOPLAM AKTİF", format: "yuzde" },
  { id: "oran_yuk_aktif", label: "YÜKÜMLÜLÜK (3+4) / TOPLAM AKTİF", format: "yuzde" },
  { id: "oran_fin_aktif", label: "NAKİT + FİNANSAL VARLIK / TOPLAM AKTİF", format: "yuzde" },
  { id: "oran_cari", label: "CARİ ORAN", format: "oran" },
  { id: "oran_nakit_kisa", label: "NAKİT ORAN", format: "oran" },
  { id: "oran_vok_yatirim", label: "VÖK / YATIRIM GELİRİ", format: "oran" },
  { id: "brut_hp", label: "BRÜT H/P", format: "yuzde" },
  { id: "net_hp", label: "NET H/P", format: "yuzde" },
] as const;

export type FinansalKiyaslamaHamOlcum = {
  donemKar690: number;
  donemNetKar692: number;
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

  const personelGider = personelGiderFromLookup(lookup, sk);
  const genelGider = genelGiderFromLookup(lookup, sk);
  const teknikKarZarar = teknikKarZararFromLookup(lookup, sk);
  const maliKarSentetik = g(MALI, GELIR_SYNTHETIC_HESAP_KODU.maliKar);
  const teknikKarsilik3545 = bl(PASIF, "35") + bl(PASIF, "45");
  const faaliyet614 = faaliyetGiderFromLookup(lookup, sk);
  const donemKar690 = g(MALI, "690");
  const donemNetKar692 = g(MALI, "692");
  const safiTeknikKz = safiTeknikKzFromLookup(lookup, sk);

  return {
    donemKar690,
    donemNetKar692,
    ozsermaye: h.ozsermaye,
    brutPrim: h.brutPrim,
    primTrafikHaric,
    faaliyet614,
    personelGider,
    genelGider,
    yatirimSegment: h.yatirimGeliriSegment,
    teknikKarZarar,
    safiTeknikKz,
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

function sumFinite(xs: number[]): number {
  return xs.filter((x) => Number.isFinite(x)).reduce((a, b) => a + b, 0);
}

function aggregateSektorHamOlcumleri(list: FinansalKiyaslamaHamOlcum[]): FinansalKiyaslamaHamOlcum | null {
  if (list.length === 0) return null;
  const s = (fn: (x: FinansalKiyaslamaHamOlcum) => number) => sumFinite(list.map(fn));
  return {
    donemKar690: s((x) => x.donemKar690),
    donemNetKar692: s((x) => x.donemNetKar692),
    ozsermaye: s((x) => x.ozsermaye),
    brutPrim: s((x) => x.brutPrim),
    primTrafikHaric: s((x) => x.primTrafikHaric),
    faaliyet614: s((x) => x.faaliyet614),
    personelGider: s((x) => x.personelGider),
    genelGider: s((x) => x.genelGider),
    yatirimSegment: s((x) => x.yatirimSegment),
    teknikKarZarar: s((x) => x.teknikKarZarar),
    safiTeknikKz: s((x) => x.safiTeknikKz),
    teknikKarsilik3545: s((x) => x.teknikKarsilik3545),
    maliKarSentetik: s((x) => x.maliKarSentetik),
    vok: s((x) => x.vok),
    toplamAktif: s((x) => x.toplamAktif),
    yuk34: s((x) => x.yuk34),
    aktif1: s((x) => x.aktif1),
    pasif3: s((x) => x.pasif3),
    nakit10: s((x) => x.nakit10),
    finansal11: s((x) => x.finansal11),
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

export type FinansalKiyasHedef =
  | { mod: "sektor" }
  | { mod: "sirket"; sirketKodu: number };

function oranlarFromSkorHam(
  m: ReturnType<typeof hamMetrikFromLookup> | null,
): FinansalKiyaslamaSektorOranlar | null {
  if (!m) return null;
  return {
    safiPrim: m.oranSafiPrim,
    vokOz: m.oranVokOzsermaye,
    yatOz: m.oranYatirimOzsermaye,
    ozAktif: m.oranOzAktif,
    yukAktif: m.oranYukAktif,
    finAktif: m.oranFinAktif,
    cari: null,
    nakitKisa: null,
    vokYatirim: m.yatirimGeliriSegment !== 0 ? m.vok / m.yatirimGeliriSegment : null,
  };
}

export type FinansalKiyaslamaDonemPaketi = {
  donem: string;
  pool: SegmentSkorPool;
  sirketHam: FinansalKiyaslamaHamOlcum | null;
  sirketSkorHam: ReturnType<typeof hamMetrikFromLookup> | null;
  sirketHp: HasarPrimOranlari;
  kiyasHam: FinansalKiyaslamaHamOlcum | null;
  kiyasSkorHam: ReturnType<typeof hamMetrikFromLookup> | null;
  kiyasOran: FinansalKiyaslamaSektorOranlar | null;
  kiyasHp: HasarPrimOranlari;
  kiyasMod: FinansalKiyasHedef["mod"];
  peerSayisi: number;
};

export function finansalKiyaslamaDonemPaketi(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  sirketKodu: number,
  pool: SegmentSkorPool,
  kiyasHedef: FinansalKiyasHedef = { mod: "sektor" },
): FinansalKiyaslamaDonemPaketi {
  const lookup = buildGelirTidyDonemLookup(rows, donem);
  const peers = segmentPeerSirketKodlari(rows, donem, pool).filter((k) => lookup.has(k));
  const peerHams = peers
    .map((pk) => hamOlcumFromLookup(lookup, pk))
    .filter((x): x is FinansalKiyaslamaHamOlcum => x !== null);
  const sektorHam = aggregateSektorHamOlcumleri(peerHams);
  const sektorOran = peerHams.length > 0 ? sektorOranlarFromPeerHams(peerHams) : null;
  const sektorHp = hasarPrimOranlariSektorFromLookup(lookup, peers);

  const sirketHam = hamOlcumFromLookup(lookup, sirketKodu);
  const sirketSkorHam = lookup.has(sirketKodu) ? hamMetrikFromLookup(lookup, sirketKodu) : null;
  const sirketHp = hasarPrimOranlariFromLookup(lookup, sirketKodu);

  const kiyasHam =
    kiyasHedef.mod === "sektor"
      ? sektorHam
      : hamOlcumFromLookup(lookup, kiyasHedef.sirketKodu);
  const kiyasSkorHam =
    kiyasHedef.mod === "sektor"
      ? null
      : lookup.has(kiyasHedef.sirketKodu)
        ? hamMetrikFromLookup(lookup, kiyasHedef.sirketKodu)
        : null;
  const kiyasOran =
    kiyasHedef.mod === "sektor" ? sektorOran : oranlarFromSkorHam(kiyasSkorHam);
  const kiyasHp =
    kiyasHedef.mod === "sektor"
      ? sektorHp
      : hasarPrimOranlariFromLookup(lookup, kiyasHedef.sirketKodu);

  return {
    donem,
    pool,
    sirketHam,
    sirketSkorHam,
    sirketHp,
    kiyasHam,
    kiyasSkorHam,
    kiyasOran,
    kiyasHp,
    kiyasMod: kiyasHedef.mod,
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

export function finansalKiyaslamaSatirSayisal(
  satirId: string,
  sirketHam: FinansalKiyaslamaHamOlcum | null,
  kiyasHam: FinansalKiyaslamaHamOlcum | null,
  sirketSkorHam: ReturnType<typeof hamMetrikFromLookup> | null,
  kiyasOran: FinansalKiyaslamaSektorOranlar | null,
  kiyasSkorHam: ReturnType<typeof hamMetrikFromLookup> | null,
  sirketHp: HasarPrimOranlari,
  kiyasHp: HasarPrimOranlari,
): { sirket: number | null; kiyas: number | null } {
  const yok = { sirket: null, kiyas: null };

  const pickHam = (key: keyof FinansalKiyaslamaHamOlcum) => ({
    sirket: sirketHam ? sirketHam[key] : null,
    kiyas: kiyasHam ? kiyasHam[key] : null,
  });

  const pickSkorOran = (
    skorKey: keyof ReturnType<typeof hamMetrikFromLookup>,
    oranKey: keyof FinansalKiyaslamaSektorOranlar,
  ) => ({
    sirket: sirketSkorHam ? sirketSkorHam[skorKey] : null,
    kiyas:
      kiyasSkorHam != null
        ? (kiyasSkorHam[skorKey] as number | null)
        : (kiyasOran?.[oranKey] ?? null),
  });

  switch (satirId) {
    case "vergi_oncesi_kar":
      return pickHam("donemKar690");
    case "net_kar":
      return pickHam("donemNetKar692");
    case "ozsermaye":
      return pickHam("ozsermaye");
    case "prim":
      return pickHam("brutPrim");
    case "brut_hp":
      return {
        sirket: sirketHp.brutHasarPrimOrani,
        kiyas: kiyasHp.brutHasarPrimOrani,
      };
    case "net_hp":
      return {
        sirket: sirketHp.netHasarPrimOrani,
        kiyas: kiyasHp.netHasarPrimOrani,
      };
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
    case "oran_safi_prim":
      return pickSkorOran("oranSafiPrim", "safiPrim");
    case "oran_vok_oz":
      return pickSkorOran("oranVokOzsermaye", "vokOz");
    case "oran_yat_oz":
      return pickSkorOran("oranYatirimOzsermaye", "yatOz");
    case "oran_oz_aktif":
      return pickSkorOran("oranOzAktif", "ozAktif");
    case "oran_yuk_aktif":
      return pickSkorOran("oranYukAktif", "yukAktif");
    case "oran_fin_aktif":
      return pickSkorOran("oranFinAktif", "finAktif");
    case "oran_cari":
      return {
        sirket:
          sirketHam && sirketHam.pasif3 !== 0 ? sirketHam.aktif1 / sirketHam.pasif3 : null,
        kiyas:
          kiyasSkorHam != null
            ? kiyasHam && kiyasHam.pasif3 !== 0
              ? kiyasHam.aktif1 / kiyasHam.pasif3
              : null
            : (kiyasOran?.cari ?? null),
      };
    case "oran_nakit_kisa":
      return {
        sirket:
          sirketHam && sirketHam.pasif3 !== 0 ? sirketHam.nakit10 / sirketHam.pasif3 : null,
        kiyas:
          kiyasSkorHam != null
            ? kiyasHam && kiyasHam.pasif3 !== 0
              ? kiyasHam.nakit10 / kiyasHam.pasif3
              : null
            : (kiyasOran?.nakitKisa ?? null),
      };
    case "oran_vok_yatirim":
      return {
        sirket:
          sirketHam && sirketHam.yatirimSegment !== 0
            ? sirketHam.vok / sirketHam.yatirimSegment
            : null,
        kiyas:
          kiyasSkorHam != null
            ? kiyasHam && kiyasHam.yatirimSegment !== 0
              ? kiyasHam.vok / kiyasHam.yatirimSegment
              : null
            : (kiyasOran?.vokYatirim ?? null),
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
  if (format === "yuzde" || format === "oran") {
    return `${new Intl.NumberFormat("tr-TR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(v * 100)}%`;
  }
  return "—";
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
  if (degisimFormat === "puanFark" || degisimFormat === "oranFark") {
    return `${sign}${new Intl.NumberFormat("tr-TR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(v * 100)} pp`;
  }
  return "—";
}
