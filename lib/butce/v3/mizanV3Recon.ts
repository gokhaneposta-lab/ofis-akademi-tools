/**
 * Mizan ↔ Bütçe V3 karşılaştırması — hesap hiyerarşisi, sapma, alt kalem drill-down.
 */
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import type { MizanAylikRow } from "../types";
import { extractMizanGtAylik, ytdGtPrefix, ytdToplam } from "./mizanGtExtract";
import {
  FORMAT7_SATIRLAR,
  GT_TO_HESAP,
  HESAP_TO_GT,
  hesapCocuklari,
  gtKodToSatir,
} from "./mizanFormatHarita";

export type MizanReconSatir = {
  hesapKodu: string;
  gtKod: string;
  ad: string;
  /** Mizan gerçekleşme (Ocak–anchor YTD). */
  mizanYtd: number;
  /** V3 motor + overlay sonucu. */
  v3Ytd: number;
  fark: number;
  sapmaPct: number | null;
  /** |fark| > eşik. */
  tutmuyor: boolean;
  /** F satır no (varsa). */
  satir: number | null;
  children: MizanReconSatir[];
};

export type MizanReconSonuc = {
  anchorAy: number;
  butceYili: number;
  kokler: MizanReconSatir[];
  tutmayanSayisi: number;
  safiTkzMizan: number;
  safiTkzV3: number;
  ozet: string[];
};

const TOLERANS_TL = 50_000;

function v3YtdSatir(gt: GelirTablosuSonuc, satir: number, anchorAy: number): number {
  return ytdToplam(gt.aylikToplam[satir], anchorAy);
}

/** Mizan YTD: hesap kodu → gt prefix toplamı (yaprak GT). */
function mizanYtdHesap(
  sirketGt: Map<string, number[]>,
  hesapKodu: string,
  anchorAy: number,
): number {
  if (hesapKodu === "614") return mizanYtd614Teknik(sirketGt, anchorAy);
  const gt = HESAP_TO_GT[hesapKodu];
  if (gt) return ytdGtPrefix(sirketGt, gt, anchorAy);
  // Üst hesap: çocuk hesapları topla
  const kids = hesapCocuklari(hesapKodu);
  if (kids.length === 0) return 0;
  return kids.reduce((s, k) => s + mizanYtdHesap(sirketGt, k, anchorAy), 0);
}

function v3YtdHesap(
  gt: GelirTablosuSonuc,
  hesapKodu: string,
  anchorAy: number,
  cache: Map<string, number>,
): number {
  if (cache.has(hesapKodu)) return cache.get(hesapKodu)!;
  if (hesapKodu === "614") {
    const val = v3YtdSatir(gt, 9006, anchorAy);
    cache.set(hesapKodu, val);
    return val;
  }
  const gtKod = HESAP_TO_GT[hesapKodu];
  let val = 0;
  if (gtKod) {
    const satir = gtKodToSatir(gtKod);
    if (satir != null) val = v3YtdSatir(gt, satir, anchorAy);
  }
  if (val === 0) {
    const kids = hesapCocuklari(hesapKodu);
    if (kids.length > 0) {
      val = kids.reduce((s, k) => s + v3YtdHesap(gt, k, anchorAy, cache), 0);
    }
  }
  cache.set(hesapKodu, val);
  return val;
}

function hesapAdi(kod: string): string {
  const row = FORMAT7_SATIRLAR.find((r) => r.hesapKodu === kod);
  return row?.hesapAdi ?? kod;
}

function reconNode(
  gt: GelirTablosuSonuc,
  sirketGt: Map<string, number[]>,
  hesapKodu: string,
  anchorAy: number,
  v3Cache: Map<string, number>,
  derinlik: number,
  maxDerinlik: number,
): MizanReconSatir {
  const gtKod = HESAP_TO_GT[hesapKodu] ?? "";
  const mizanYtd = mizanYtdHesap(sirketGt, hesapKodu, anchorAy);
  const v3Ytd = v3YtdHesap(gt, hesapKodu, anchorAy, v3Cache);
  const fark = mizanYtd - v3Ytd;
  const sapmaPct =
    Math.abs(v3Ytd) > TOLERANS_TL ? (fark / Math.abs(v3Ytd)) * 100 : null;
  const tutmuyor = Math.abs(fark) > TOLERANS_TL;

  const children: MizanReconSatir[] = [];
  if (derinlik < maxDerinlik) {
    for (const k of hesapCocuklari(hesapKodu)) {
      children.push(reconNode(gt, sirketGt, k, anchorAy, v3Cache, derinlik + 1, maxDerinlik));
    }
  }

  return {
    hesapKodu,
    gtKod,
    ad: hesapAdi(hesapKodu),
    mizanYtd,
    v3Ytd,
    fark,
    sapmaPct,
    tutmuyor,
    satir: gtKod ? gtKodToSatir(gtKod) : null,
    children,
  };
}

function flattenTutmayan(nodes: MizanReconSatir[]): MizanReconSatir[] {
  const out: MizanReconSatir[] = [];
  const walk = (n: MizanReconSatir) => {
    if (n.tutmuyor && n.children.length === 0) out.push(n);
    else if (n.tutmuyor && n.children.every((c) => !c.tutmuyor)) out.push(n);
    for (const c of n.children) walk(c);
  };
  for (const n of nodes) walk(n);
  return out;
}

/** Teknik gelir kök hesapları (603 hariç). */
const TEKNIK_GELIR_HESAPLAR = ["600", "601", "602", "604", "605"] as const;
/** 614 altında teknik faaliyet (genel gider hariç). */
const TEKNIK_614_COCUK = ["61401", "61407", "61408", "61409"] as const;

/** Teknik gelir / gider kök hesapları — format7 üst seviye. */
const RECON_KOKLER = [
  ...TEKNIK_GELIR_HESAPLAR,
  "610", "611", "612", "613", "614", "615",
] as const;

function mizanYtd614Teknik(sirketGt: Map<string, number[]>, anchorAy: number): number {
  return TEKNIK_614_COCUK.reduce((s, h) => s + mizanYtdHesap(sirketGt, h, anchorAy), 0);
}

/**
 * Mizan gerçekleşme ile V3 YTD karşılaştırması.
 * @param maxDerinlik Alt hesap drill-down (611 → 61101 → 611011 …).
 */
export function mizanV3Recon(
  gt: GelirTablosuSonuc,
  mizanAylikFull: MizanAylikRow[],
  butceYili: number,
  anchorAy: number,
  maxDerinlik = 4,
): MizanReconSonuc {
  const anchor = Math.min(Math.max(anchorAy, 1), 12);
  const { sirketGt } = extractMizanGtAylik(mizanAylikFull, butceYili);
  const v3Cache = new Map<string, number>();

  const kokler = RECON_KOKLER.map((h) =>
    reconNode(gt, sirketGt, h, anchor, v3Cache, 0, maxDerinlik),
  );

  const teknikGelirM = TEKNIK_GELIR_HESAPLAR.reduce(
    (s, h) => s + mizanYtdHesap(sirketGt, h, anchor),
    0,
  );
  const teknikGiderM =
    (["610", "611", "612", "613", "615"] as const).reduce(
      (s, h) => s + mizanYtdHesap(sirketGt, h, anchor),
      0,
    ) + mizanYtd614Teknik(sirketGt, anchor);
  const safiTkzMizan = teknikGelirM + teknikGiderM;
  const safiTkzV3 = v3YtdSatir(gt, 9003, anchor);

  const tutmayan = flattenTutmayan(kokler);
  const ozet: string[] = [];
  ozet.push(
    `Mizan Safi TKZ (600–605 + 610–615, 603/genel gider hariç): ${Math.round(safiTkzMizan).toLocaleString("tr-TR")} TL`,
  );
  ozet.push(`V3 Safi TKZ (9003): ${Math.round(safiTkzV3).toLocaleString("tr-TR")} TL`);
  if (Math.abs(safiTkzMizan - safiTkzV3) > TOLERANS_TL) {
    ozet.push(
      `Safi TKZ sapması: ${Math.round(safiTkzMizan - safiTkzV3).toLocaleString("tr-TR")} TL`,
    );
  }
  for (const t of tutmayan.slice(0, 12)) {
    ozet.push(
      `${t.hesapKodu} ${t.ad}: mizan=${Math.round(t.mizanYtd).toLocaleString("tr-TR")} v3=${Math.round(t.v3Ytd).toLocaleString("tr-TR")} Δ=${Math.round(t.fark).toLocaleString("tr-TR")}`,
    );
  }

  return {
    anchorAy: anchor,
    butceYili,
    kokler,
    tutmayanSayisi: tutmayan.length,
    safiTkzMizan,
    safiTkzV3,
    ozet,
  };
}

/** API/UI için düz liste (tutmayan yaprak + üst sapmalar). */
export function reconTutmayanListe(sonuc: MizanReconSonuc): MizanReconSatir[] {
  return flattenTutmayan(sonuc.kokler).sort((a, b) => Math.abs(b.fark) - Math.abs(a.fark));
}
