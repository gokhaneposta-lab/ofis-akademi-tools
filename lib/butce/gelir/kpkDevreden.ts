/**
 * Devreden KPK (601012 / 601022): kapanış devralma tutarı → yalnızca Ocak.
 *
 * Kaynak: bütçe yılı Ocak mizan kümülatifi (GT 01212 / 01222). Bu, önceki yıl
 * kapanışının yeni yıla devralındığı GL kaydıdır; Şubat–Aralık aylık hareket = 0.
 * (Y-1 Aralık snapshot ile bütçe yılı Ocak tutarı mizan dosyasında farklı olabilir.)
 */
import { normalizeBransKodu } from "../textUtils";
import type { MizanAylikRow } from "../types";

export type KpkDevredenOcak = {
  /** GT F24 — 601012 devreden KPK (Ocak hareketi). */
  satir24: number;
  /** GT F27 — 601022 devreden KPK reasürör payı (Ocak hareketi). */
  satir27: number;
};

const GT_DEVREDEN = [
  { gtKod: "01212", key: "satir24" as const },
  { gtKod: "01222", key: "satir27" as const },
] as const;

/** Devreden KPK yaprak satırları — Ocak dışı aylık hareket = 0. */
export const KPK_DEVREDEN_SATIRLARI = [24, 27] as const;

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
    });
  }
  return out;
}

export function devredenKpkOcakOzet(map: Map<string, KpkDevredenOcak>): {
  satir24Toplam: number;
  satir27Toplam: number;
  bransSayisi: number;
} {
  let satir24Toplam = 0;
  let satir27Toplam = 0;
  for (const v of map.values()) {
    satir24Toplam += v.satir24;
    satir27Toplam += v.satir27;
  }
  return { satir24Toplam, satir27Toplam, bransSayisi: map.size };
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
