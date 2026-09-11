import { kumuldenAylikArtis } from "../prim/primDagilim";
import { normalizeBransKodu } from "../textUtils";
import type { MizanAylikRow } from "../types";

/** Tek yazım ayı brüt prim (aylık artış). */
export type KpkPrimAy = {
  yil: number;
  ay: number;
  prim: number;
};

/** mizan-aylik-full GT 0111 kümülatif → branş aylık artış. */
function bransPrimFromMizanFull(rows: MizanAylikRow[], yil: number, brans: string): number[] {
  const kumul = Array(12).fill(0);
  for (const r of rows) {
    if (Number(r.yil) !== yil) continue;
    if (normalizeBransKodu(r.bransKodu) !== brans) continue;
    if (String(r.hesap) !== "0111") continue;
    const ay = Number(r.ay);
    if (ay >= 1 && ay <= 12) kumul[ay - 1] += Number(r.tutar) || 0;
  }
  return kumuldenAylikArtis(kumul);
}

function bransPrimFromMizanAylik(rows: MizanAylikRow[], yil: number, brans: string): number[] {
  return bransPrimFromMizanFull(rows, yil, brans);
}

function seriToPrimAy(yil: number, aylar: number[]): KpkPrimAy[] {
  const out: KpkPrimAy[] = [];
  for (let i = 0; i < 12; i++) {
    const prim = aylar[i] ?? 0;
    if (prim > 0) out.push({ yil, ay: i + 1, prim });
  }
  return out;
}

/**
 * 601011 rolling stok için branş × (yil, ay) prim geçmişi.
 * Vade süresince aktif kalabilecek poliçeler: önceki yıl(lar) + bütçe yılı aylık prim.
 */
function pickSeri(
  mizanFull: MizanAylikRow[],
  mizanAylik: MizanAylikRow[],
  fallback: Record<string, number[]>,
  yil: number,
  brans: string,
): number[] {
  const fromFull = bransPrimFromMizanFull(mizanFull, yil, brans);
  if (fromFull.some((v) => v > 0)) return fromFull;
  const fromAylik = bransPrimFromMizanAylik(mizanAylik, yil, brans);
  if (fromAylik.some((v) => v > 0)) return fromAylik;
  return fallback[brans] ?? Array(12).fill(0);
}

export function buildKpkPrimGecmisi(opts: {
  butceYili: number;
  oncekiYilPrim: Record<string, number[]>;
  cariPrim: Record<string, number[]>;
  mizanAylik?: MizanAylikRow[];
  mizanAylikFull?: MizanAylikRow[];
}): Record<string, KpkPrimAy[]> {
  const { butceYili, oncekiYilPrim, cariPrim, mizanAylik = [], mizanAylikFull = [] } = opts;
  const oncekiYil = butceYili - 1;
  const ikiYilOnce = butceYili - 2;

  const branslar = new Set<string>([
    ...Object.keys(oncekiYilPrim),
    ...Object.keys(cariPrim),
  ]);

  const out: Record<string, KpkPrimAy[]> = {};

  for (const brans of branslar) {
    const kayitlar: KpkPrimAy[] = [];

    const ikiSeri = pickSeri(mizanAylikFull, mizanAylik, {}, ikiYilOnce, brans);
    if (ikiSeri.some((v) => v > 0)) kayitlar.push(...seriToPrimAy(ikiYilOnce, ikiSeri));

    const oncekiSeri = pickSeri(mizanAylikFull, mizanAylik, oncekiYilPrim, oncekiYil, brans);
    if (oncekiSeri.some((v) => v > 0)) kayitlar.push(...seriToPrimAy(oncekiYil, oncekiSeri));

    const cari = cariPrim[brans];
    if (cari?.some((v) => v > 0)) kayitlar.push(...seriToPrimAy(butceYili, cari));

    if (kayitlar.length > 0) out[brans] = kayitlar;
  }

  return out;
}
