import { MIZAN_AYLIK_HESAP_BRUT } from "../config/constants";
import { normalizeBransKodu } from "../textUtils";
import type { MizanAylikRow } from "../types";
import { kumuldenAylikArtis, normalizeAylikOranlar, varsayilanAylikDagilim } from "./primDagilim";

function ortalamaOranlar(lists: number[][]): number[] {
  if (lists.length === 0) return varsayilanAylikDagilim();
  if (lists.length === 1) return lists[0];
  const avg = Array.from({ length: 12 }, (_, i) => {
    const vals = lists.map((l) => l[i] ?? 0);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  });
  return normalizeAylikOranlar(avg);
}

/** Branş için 1..12 kümülatif tutar dizisi (eksik aylar 0). */
function kumulDizisi(
  rows: MizanAylikRow[],
  yil: number,
  brans: string,
  hesap: string,
): number[] {
  const map = new Map<number, number>();
  for (const r of rows) {
    if (r.yil !== yil || normalizeBransKodu(r.bransKodu) !== brans) continue;
    if (String(r.hesap) !== hesap) continue;
    const ay = r.ay;
    if (ay >= 1 && ay <= 12) map.set(ay, r.tutar);
  }
  return Array.from({ length: 12 }, (_, i) => map.get(i + 1) ?? 0);
}

function bransAylikOranlari(
  rows: MizanAylikRow[],
  yillar: number[],
  brans: string,
  hesap = MIZAN_AYLIK_HESAP_BRUT,
): number[] | null {
  const oranlar: number[][] = [];
  for (const yil of yillar) {
    const kumul = kumulDizisi(rows, yil, brans, hesap);
    if (kumul.every((v) => v === 0)) continue;
    const aylik = kumuldenAylikArtis(kumul);
    const sum = aylik.reduce((a, b) => a + Math.max(0, b), 0);
    if (sum <= 0) continue;
    oranlar.push(normalizeAylikOranlar(aylik));
  }
  if (oranlar.length === 0) return null;
  return ortalamaOranlar(oranlar);
}

export type MizanAylikOranSonuc = {
  genelOranlar: number[];
  bransOranlari: Record<string, number[]>;
  kaynak: "mizan_aylik" | "varsayilan";
  referansYillar: number[];
  hesap: string;
};

/**
 * MIZAN aylık kümülatif brüt prim (kod 0111) → branş bazlı aylık pay oranları.
 * Yıllık primi 12'ye eşit bölmüyor; geçmiş aylık üretim payını uygular.
 */
export function aylikOranlariFromMizan(
  rows: MizanAylikRow[],
  referansYillar: number[],
  hesap = MIZAN_AYLIK_HESAP_BRUT,
): MizanAylikOranSonuc {
  if (rows.length === 0 || referansYillar.length === 0) {
    return {
      genelOranlar: varsayilanAylikDagilim(),
      bransOranlari: {},
      kaynak: "varsayilan",
      referansYillar: [],
      hesap,
    };
  }

  const bransSet = new Set<string>();
  for (const r of rows) {
    if (String(r.hesap) !== hesap) continue;
    if (referansYillar.includes(r.yil)) bransSet.add(normalizeBransKodu(r.bransKodu));
  }

  const bransOranlari: Record<string, number[]> = {};
  const genelKumul = Array.from({ length: 12 }, () => 0);

  for (const brans of bransSet) {
    const oran = bransAylikOranlari(rows, referansYillar, brans, hesap);
    if (oran) bransOranlari[brans] = oran;
    for (const yil of referansYillar) {
      const kumul = kumulDizisi(rows, yil, brans, hesap);
      const aylik = kumuldenAylikArtis(kumul);
      for (let i = 0; i < 12; i++) genelKumul[i] += Math.max(0, aylik[i]);
    }
  }

  const genelOranlar =
    genelKumul.some((v) => v > 0)
      ? normalizeAylikOranlar(genelKumul)
      : varsayilanAylikDagilim();

  const kaynak =
    Object.keys(bransOranlari).length > 0 || genelKumul.some((v) => v > 0)
      ? "mizan_aylik"
      : "varsayilan";

  return {
    genelOranlar,
    bransOranlari,
    kaynak,
    referansYillar,
    hesap,
  };
}
