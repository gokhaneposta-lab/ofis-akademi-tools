/**
 * mizan-aylik-full GT 0111 → branş × 12 aylık incremental prim.
 */
import { kumuldenAylikArtis } from "../prim/primDagilim";
import { normalizeBransKodu } from "../textUtils";
import type { MizanAylikRow } from "../types";

function maxAyFromKumul(kumul: number[]): number {
  for (let i = 11; i >= 0; i--) {
    if (Math.abs(kumul[i] ?? 0) > 1e-9) return i + 1;
  }
  return 0;
}

/** Kümülatif YTD → incremental; maxAy sonrası 0 (negatif tail yok). */
function kumulToIncrementalThroughMaxAy(kumul: number[], maxAy: number): number[] {
  const out = Array(12).fill(0);
  let prev = 0;
  const n = Math.min(Math.max(maxAy, 0), 12);
  for (let i = 0; i < n; i++) {
    const v = kumul[i] ?? 0;
    out[i] = v - prev;
    prev = v;
  }
  return out;
}

export function bransAylikPrimMizan0111(
  mizanAylikFull: MizanAylikRow[],
  yil: number,
): Record<string, number[]> {
  const kumulByBrans = new Map<string, number[]>();
  for (const r of mizanAylikFull) {
    if (Number(r.yil) !== yil) continue;
    if (String(r.hesap) !== "0111") continue;
    const b = normalizeBransKodu(r.bransKodu);
    if (!/^7\d{2}$/.test(b)) continue;
    const ay = Number(r.ay);
    if (ay < 1 || ay > 12) continue;
    if (!kumulByBrans.has(b)) kumulByBrans.set(b, Array(12).fill(0));
    kumulByBrans.get(b)![ay - 1] += Number(r.tutar) || 0;
  }
  const out: Record<string, number[]> = {};
  for (const [b, kumul] of kumulByBrans) {
    const maxAy = maxAyFromKumul(kumul);
    out[b] =
      maxAy >= 12
        ? kumuldenAylikArtis(kumul)
        : kumulToIncrementalThroughMaxAy(kumul, maxAy);
  }
  return out;
}

export function sumIncrementalYtd(ser: number[] | undefined, anchorAy: number): number {
  if (!ser?.length || anchorAy <= 0) return 0;
  const n = Math.min(Math.max(anchorAy, 0), 12);
  let s = 0;
  for (let i = 0; i < n; i++) s += ser[i] ?? 0;
  return s;
}

export function sumIncrementalRange(ser: number[] | undefined, fromIdx: number, toIdxInclusive: number): number {
  if (!ser?.length) return 0;
  let s = 0;
  for (let i = fromIdx; i <= toIdxInclusive && i < 12; i++) s += ser[i] ?? 0;
  return s;
}
