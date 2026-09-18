/**
 * Devreden KPK (601012 / 601022): önceki yıl kapanış → bütçe yılı boyunca sabit açılış stoku.
 *
 * Bütçe (kapanmış önceki yıl): 31.12 mizan 01211/01221 Cari → devreden (`devredenKpkOcakFromMizanKapanis`);
 * GT F24/F27 = muhasebe işareti tersi (601012 / 601022).
 * EYE / açık yıl: 31.12 motor Cari → `kpkDevredenZincir` motor dalı (işaret motor F23 ile hizalı).
 * `devredenKpkOcakFromMizan`: Ocak 01212 recon (GT stok karşılaştırma).
 */
import { normalizeBransKodu } from "../textUtils";
import type { MizanAylikRow } from "../types";

export type KpkDevredenOcak = {
  /** GT F24 / 601012 — devreden KPK stok seviyesi (Ocak–Aralık sabit). */
  satir24: number;
  /** GT F27 / 601022 — devreden RE KPK stok seviyesi (Ocak–Aralık sabit). */
  satir27: number;
  /** GT F30 / 601032 — devreden KPK SGK stok seviyesi (Ocak–Aralık sabit). */
  satir30: number;
};

const GT_DEVREDEN = [
  { gtKod: "01212", key: "satir24" as const },
  { gtKod: "01222", key: "satir27" as const },
  { gtKod: "01232", key: "satir30" as const },
] as const;

/** Önceki yıl Aralık kapanış — Cari KPK stok (F23/F26/F29). */
const GT_KAPANIS_CARI = [
  { gtKod: "01211", key: "f23Dec" as const },
  { gtKod: "01221", key: "f26Dec" as const },
  { gtKod: "01231", key: "f29Dec" as const },
] as const;

/** mizan-aylik-full: Y−1 Aralık 01211 satırı var mı (en az bir branş, |tutar|>0). */
export function hasKpkMizanKapanis(mizanAylikFull: MizanAylikRow[], butceYili: number): boolean {
  const oncekiYil = butceYili - 1;
  for (const r of mizanAylikFull) {
    if (Number(r.yil) !== oncekiYil) continue;
    if (Number(r.ay) !== 12) continue;
    if (String(r.hesap) !== "01211") continue;
    const b = normalizeBransKodu(r.bransKodu);
    if (!/^7\d{2}$/.test(b)) continue;
    if (Math.abs(Number(r.tutar) || 0) > 1) return true;
  }
  return false;
}

/**
 * Önceki yıl 31.12 mizan Cari KPK (01211) → Ocak devreden GT girişi (F24/F27).
 * 601012 = −01211@31.12, 601022 = −01221@31.12, 601032 = −01231@31.12.
 */
export function devredenKpkOcakFromMizanKapanis(
  mizanAylikFull: MizanAylikRow[],
  butceYili: number,
): Map<string, KpkDevredenOcak> {
  const oncekiYil = butceYili - 1;
  const raw = new Map<string, { f23Dec?: number; f26Dec?: number; f29Dec?: number }>();

  for (const { gtKod, key } of GT_KAPANIS_CARI) {
    for (const r of mizanAylikFull) {
      if (Number(r.yil) !== oncekiYil) continue;
      if (Number(r.ay) !== 12) continue;
      if (String(r.hesap) !== gtKod) continue;
      const b = normalizeBransKodu(r.bransKodu);
      if (!/^7\d{2}$/.test(b)) continue;
      if (!raw.has(b)) raw.set(b, {});
      const row = raw.get(b)!;
      row[key] = (row[key] ?? 0) + (Number(r.tutar) || 0);
    }
  }

  const out = new Map<string, KpkDevredenOcak>();
  for (const [b, v] of raw) {
    const f23Dec = v.f23Dec ?? 0;
    const f26Dec = v.f26Dec ?? 0;
    const f29Dec = v.f29Dec ?? 0;
    if (Math.abs(f23Dec) < 1 && Math.abs(f26Dec) < 1 && Math.abs(f29Dec) < 1) continue;
    const satir24 = -f23Dec;
    const satir27 = -f26Dec;
    const satir30 = b === "715" ? -f29Dec : 0;
    out.set(b, { satir24, satir27, satir30 });
  }
  return out;
}

/** Devreden KPK yaprak satırları — stok seviyesi (buildKpkGtHucreleri yıl boyunca taşır). */
export const KPK_DEVREDEN_SATIRLARI = [24, 27, 30] as const;

/**
 * Bütçe yılı Ocak mizanından branş bazlı devreden KPK tutarları (kapanış devralma).
 * mizan-aylik-full: kümülatif YTD (ay=1) branş GT kodu.
 */
export function devredenKpkOcakFromMizan(
  mizanAylikFull: MizanAylikRow[],
  butceYili: number,
): Map<string, KpkDevredenOcak> {
  const raw = new Map<string, Partial<KpkDevredenOcak>>();

  for (const { gtKod, key } of GT_DEVREDEN) {
    for (const r of mizanAylikFull) {
      if (Number(r.yil) !== butceYili) continue;
      if (Number(r.ay) !== 1) continue;
      if (String(r.hesap) !== gtKod) continue;
      const b = normalizeBransKodu(r.bransKodu);
      if (!/^7\d{2}$/.test(b)) continue;
      if (!raw.has(b)) raw.set(b, {});
      const row = raw.get(b)!;
      row[key] = (row[key] ?? 0) + (Number(r.tutar) || 0);
    }
  }

  const out = new Map<string, KpkDevredenOcak>();
  for (const [b, v] of raw) {
    out.set(b, {
      satir24: v.satir24 ?? 0,
      satir27: v.satir27 ?? 0,
      satir30: v.satir30 ?? 0,
    });
  }
  return out;
}

export function devredenKpkOcakOzet(map: Map<string, KpkDevredenOcak>): {
  satir24Toplam: number;
  satir27Toplam: number;
  satir30Toplam: number;
  bransSayisi: number;
} {
  let satir24Toplam = 0;
  let satir27Toplam = 0;
  let satir30Toplam = 0;
  for (const v of map.values()) {
    satir24Toplam += v.satir24;
    satir27Toplam += v.satir27;
    satir30Toplam += v.satir30;
  }
  return { satir24Toplam, satir27Toplam, satir30Toplam, bransSayisi: map.size };
}

/** Ocak = tutar, Şubat–Aralık = 0. */
export function ocakOnlyAylikSeri(tutar: number): number[] {
  return Array.from({ length: 12 }, (_, i) => (i === 0 ? tutar : 0));
}

/** F24/F27 düzeltmesi sonrası KPK üst satırlarını branş aylık serisinden türet. */
export function turetKpkUstSatirlar(bransAylik: Record<number, number[]>): void {
  const get = (s: number) => bransAylik[s] ?? Array.from({ length: 12 }, () => 0);
  const add = (a: number[], b: number[]) => a.map((v, i) => v + (b[i] ?? 0));
  bransAylik[22] = add(get(23), get(24));
  bransAylik[25] = add(get(26), get(27));
  bransAylik[28] = add(get(29), get(30));
  bransAylik[21] = add(add(get(22), get(25)), get(28));
}
