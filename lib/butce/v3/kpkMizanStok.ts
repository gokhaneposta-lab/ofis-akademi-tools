/**
 * Mizan-aylik-full → KPK yaprak GT kodları için ay sonu stok seviyesi serisi.
 * Ham hücre = YTD kümülatif GL bakiye (601011 / 601012 …).
 */
import { normalizeBransKodu } from "../textUtils";
import type { MizanAylikRow } from "../types";

export const KPK_STOK_GT_KODLARI = ["01211", "01212", "01221", "01222", "01231", "01232"] as const;

export type KpkStokGtKod = (typeof KPK_STOK_GT_KODLARI)[number];

const GT_KOD_TO_SATIR: Record<KpkStokGtKod, number> = {
  "01211": 23,
  "01212": 24,
  "01221": 26,
  "01222": 27,
  "01231": 29,
  "01232": 30,
};

/** branş → GT kod → 12 aylık kümülatif stok (indeks 0 = Ocak). */
export function extractKpkMizanStok(
  rows: MizanAylikRow[],
  butceYili: number,
): Map<string, Map<string, number[]>> {
  const out = new Map<string, Map<string, number[]>>();

  for (const r of rows) {
    if (Number(r.yil) !== butceYili) continue;
    const gtKod = String(r.hesap);
    if (!KPK_STOK_GT_KODLARI.includes(gtKod as KpkStokGtKod)) continue;
    const b = normalizeBransKodu(r.bransKodu);
    if (!/^7\d{2}$/.test(b)) continue;
    const ay = Number(r.ay);
    if (ay < 1 || ay > 12) continue;

    if (!out.has(b)) out.set(b, new Map());
    const gm = out.get(b)!;
    if (!gm.has(gtKod)) gm.set(gtKod, Array(12).fill(0));
    gm.get(gtKod)![ay - 1] += Number(r.tutar) || 0;
  }

  return out;
}

export function kpkStokSatirFromGtKod(gtKod: string): number | null {
  return (GT_KOD_TO_SATIR as Record<string, number>)[gtKod] ?? null;
}

/** Branş × ay için stok seviyesi; yoksa 0. */
export function kpkStokSeviye(
  stokMap: Map<string, Map<string, number[]>>,
  brans: string,
  gtKod: KpkStokGtKod,
  ayIndex: number,
): number {
  return stokMap.get(brans)?.get(gtKod)?.[ayIndex] ?? 0;
}

/** Motor stok vs mizan stok recon oranı (|mizan−motor|/|motor|). */
export function kpkReconOrani(mizanStok: number, motorStok: number): number | null {
  if (Math.abs(motorStok) < 1) return Math.abs(mizanStok) < 1 ? 0 : null;
  return Math.abs(mizanStok - motorStok) / Math.abs(motorStok);
}
