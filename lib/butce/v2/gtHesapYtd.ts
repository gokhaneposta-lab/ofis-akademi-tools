/**
 * GelirTablosuSonuc → muhasebe hesap YTD (format7 ağacı).
 */
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import { kpkStokYtd, KPK_STOK_SEVIYE_SATIRLARI } from "../kpk/kpkMotoru";
import { extractMizanGtAylik, ytdGtPrefix, ytdToplam } from "../v3/mizanGtExtract";
import { hesapCocuklari, gtKodToSatir, HESAP_TO_GT } from "../v3/mizanFormatHarita";
import type { MizanAylikRow } from "../types";

const TEKNIK_614_COCUK = ["61401", "61407", "61408", "61409"] as const;

const KPK_STOK_SEVIYE = new Set<number>(KPK_STOK_SEVIYE_SATIRLARI as unknown as number[]);

export function gtYtdSatir(gt: GelirTablosuSonuc, satir: number, anchorAy: number): number {
  const ser = gt.aylikToplam[satir];
  if (KPK_STOK_SEVIYE.has(satir)) return kpkStokYtd(ser, anchorAy);
  return ytdToplam(ser, anchorAy);
}

function gtYtd614Teknik(gt: GelirTablosuSonuc, anchorAy: number): number {
  return gtYtdSatir(gt, 9006, anchorAy);
}

export function mizanYtdHesapFromFull(
  mizanAylikFull: MizanAylikRow[],
  butceYili: number,
  hesapKodu: string,
  anchorAy: number,
): number {
  const { sirketGt } = extractMizanGtAylik(mizanAylikFull, butceYili);
  return mizanYtdHesap(sirketGt, hesapKodu, anchorAy);
}

export function mizanYtdHesap(
  sirketGt: Map<string, number[]>,
  hesapKodu: string,
  anchorAy: number,
): number {
  if (hesapKodu === "614") {
    return TEKNIK_614_COCUK.reduce((s, h) => s + mizanYtdHesap(sirketGt, h, anchorAy), 0);
  }
  const gt = HESAP_TO_GT[hesapKodu];
  if (gt) return ytdGtPrefix(sirketGt, gt, anchorAy);
  const kids = hesapCocuklari(hesapKodu);
  if (kids.length === 0) return 0;
  return kids.reduce((s, k) => s + mizanYtdHesap(sirketGt, k, anchorAy), 0);
}

export function gtYtdHesap(
  gt: GelirTablosuSonuc,
  hesapKodu: string,
  anchorAy: number,
  cache = new Map<string, number>(),
): number {
  if (cache.has(hesapKodu)) return cache.get(hesapKodu)!;
  if (hesapKodu === "614") {
    const val = gtYtd614Teknik(gt, anchorAy);
    cache.set(hesapKodu, val);
    return val;
  }
  const gtKod = HESAP_TO_GT[hesapKodu];
  let val = 0;
  if (gtKod) {
    const satir = gtKodToSatir(gtKod);
    if (satir != null) val = gtYtdSatir(gt, satir, anchorAy);
  }
  if (val === 0) {
    const kids = hesapCocuklari(hesapKodu);
    if (kids.length > 0) {
      val = kids.reduce((s, k) => s + gtYtdHesap(gt, k, anchorAy, cache), 0);
    }
  }
  cache.set(hesapKodu, val);
  return val;
}
