/**
 * Devreden muallak (611012 / 611022): önceki yıl Aralık mizan branş tutarı → yalnızca Ocak.
 * Şubat–Aralık GT satır 126 / 147 = 0 (F456/F471 × prim kullanılmaz).
 */
import { normalizeBransKodu } from "../textUtils";
import type { MizanAylikRow } from "../types";

export type MuallakDevredenOcak = {
  /** GT F126 — 611012 devreden muallak (Ocak hareketi). */
  satir126: number;
  /** GT F147 — 611022 devreden RE payı (Ocak hareketi). */
  satir147: number;
};

const GT_DEVREDEN = [
  { gtKod: "02212", key: "satir126" as const },
  { gtKod: "02222", key: "satir147" as const },
] as const;

/**
 * Önceki yıl Aralık kapanış mizanından branş bazlı devreden muallak tutarları.
 * mizan-aylik-full: kümülatif YTD (ay=12) branş GT kodu.
 */
export function devredenMuallakOcakFromMizan(
  mizanAylikFull: MizanAylikRow[],
  butceYili: number,
): Map<string, MuallakDevredenOcak> {
  const oncekiYil = butceYili - 1;
  const raw = new Map<string, Partial<MuallakDevredenOcak>>();

  for (const { gtKod, key } of GT_DEVREDEN) {
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

  const out = new Map<string, MuallakDevredenOcak>();
  for (const [b, v] of raw) {
    out.set(b, {
      satir126: v.satir126 ?? 0,
      satir147: v.satir147 ?? 0,
    });
  }
  return out;
}

export function devredenMuallakOcakOzet(map: Map<string, MuallakDevredenOcak>): {
  satir126Toplam: number;
  satir147Toplam: number;
  bransSayisi: number;
} {
  let satir126Toplam = 0;
  let satir147Toplam = 0;
  for (const v of map.values()) {
    satir126Toplam += v.satir126;
    satir147Toplam += v.satir147;
  }
  return { satir126Toplam, satir147Toplam, bransSayisi: map.size };
}
