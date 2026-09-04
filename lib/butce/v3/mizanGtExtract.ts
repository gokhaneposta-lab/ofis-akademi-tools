/**
 * mizan-aylik-full → branş × GT kod × ay (artış) ve F satır serileri.
 * YTD kilidi: anchor ayına kadar motor yerine bu veri kullanılır.
 */
import { normalizeBransKodu } from "../textUtils";
import type { MizanAylikRow } from "../types";
import {
  GT_KOD_TO_SATIR,
  kumulToIncremental,
  yaprakGtKodlari,
} from "./gtKodHaritasi";

export type MizanGtAylik = {
  /** GT kod → 12 aylık artış (tüm branşlar). */
  sirketGt: Map<string, number[]>;
  /** branş → GT kod → 12 aylık artış. */
  bransGt: Map<string, Map<string, number[]>>;
  /** F satır → 12 aylık artış (rollup sonrası, şirket). */
  sirketSatir: Map<number, number[]>;
  /** branş → F satır → 12 aylık artış. */
  bransSatir: Map<string, Map<number, number[]>>;
};

function kumulGtByBrans(
  rows: MizanAylikRow[],
  butceYili: number,
): Map<string, Map<string, number[]>> {
  /** branş → GT kod → 12 aylık kümülatif (tüm satırlar). */
  const raw = new Map<string, Map<string, number[]>>();
  for (const r of rows) {
    if (Number(r.yil) !== butceYili) continue;
    const gtKod = String(r.hesap);
    if (!gtKod) continue;
    const b = normalizeBransKodu(r.bransKodu);
    if (!b || !/^7\d{2}$/.test(b)) continue;
    const ay = Number(r.ay);
    if (ay < 1 || ay > 12) continue;
    if (!raw.has(b)) raw.set(b, new Map());
    const gm = raw.get(b)!;
    if (!gm.has(gtKod)) gm.set(gtKod, Array(12).fill(0));
    gm.get(gtKod)![ay - 1] += Number(r.tutar) || 0;
  }

  /** Yaprak seçimi branş içinde — 703'ün 025810101 yaprakları 715'in 0258101'ini dışlamaz. */
  const out = new Map<string, Map<string, number[]>>();
  for (const [b, gm] of raw) {
    const yapraklar = yaprakGtKodlari(gm.keys());
    const leafMap = new Map<string, number[]>();
    for (const [gtKod, kumul] of gm) {
      if (yapraklar.has(gtKod)) leafMap.set(gtKod, kumul);
    }
    out.set(b, leafMap);
  }
  return out;
}

/** Yaprak GT kümülatif → F satır aylık artış (GT prefix toplamı, çift sayım yok). */
function gtMapToSatirMap(gtMap: Map<string, number[]>): Map<number, number[]> {
  const leafInc = new Map<string, number[]>();
  for (const [gtKod, kumul] of gtMap) leafInc.set(gtKod, kumulToIncremental(kumul));

  const bySatir = new Map<number, number[]>();
  for (const [gtKod, satir] of Object.entries(GT_KOD_TO_SATIR)) {
    const ser = Array(12).fill(0);
    let found = false;
    for (const [leaf, inc] of leafInc) {
      if (leaf !== gtKod && !leaf.startsWith(gtKod)) continue;
      found = true;
      for (let i = 0; i < 12; i++) ser[i] += inc[i] ?? 0;
    }
    if (found) bySatir.set(satir, ser);
  }
  return bySatir;
}

function toIncrementalGt(gm: Map<string, number[]>): Map<string, number[]> {
  const out = new Map<string, number[]>();
  for (const [k, kumul] of gm) out.set(k, kumulToIncremental(kumul));
  return out;
}

/** mizan-aylik-full'dan GT + F satır aylık artış serileri üret. */
export function extractMizanGtAylik(
  rows: MizanAylikRow[],
  butceYili: number,
): MizanGtAylik {
  const bransKumul = kumulGtByBrans(rows, butceYili);

  // Şirket GT kümülatif = branş toplamı
  const sirketKumul = new Map<string, number[]>();
  for (const gm of bransKumul.values()) {
    for (const [gtKod, kumul] of gm) {
      if (!sirketKumul.has(gtKod)) sirketKumul.set(gtKod, Array(12).fill(0));
      const acc = sirketKumul.get(gtKod)!;
      for (let i = 0; i < 12; i++) acc[i] += kumul[i] ?? 0;
    }
  }

  const sirketGt = toIncrementalGt(sirketKumul);
  const bransGt = new Map<string, Map<string, number[]>>();
  for (const [b, gm] of bransKumul) bransGt.set(b, toIncrementalGt(gm));

  const sirketSatir = gtMapToSatirMap(sirketKumul);
  const bransSatir = new Map<string, Map<number, number[]>>();
  for (const [b, gm] of bransKumul) bransSatir.set(b, gtMapToSatirMap(gm));

  return { sirketGt, bransGt, sirketSatir, bransSatir };
}

/** Ocak..anchorYtd (1-indexed ay) toplam artış. */
export function ytdToplam(ser: number[] | undefined, anchorAy: number): number {
  if (!ser?.length) return 0;
  const n = Math.min(Math.max(anchorAy, 1), 12);
  return ser.slice(0, n).reduce((a, x) => a + x, 0);
}

/** GT kod prefix altındaki yaprakların YTD toplamı. */
export function ytdGtPrefix(
  gtMap: Map<string, number[]>,
  prefix: string,
  anchorAy: number,
): number {
  let t = 0;
  for (const [k, ser] of gtMap) {
    if (k === prefix || k.startsWith(prefix)) t += ytdToplam(ser, anchorAy);
  }
  return t;
}
