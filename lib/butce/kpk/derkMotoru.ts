/**
 * DERK (602) — KPK motoru ile aynı stok/delta yapısı; cari stok = prim × F349.
 */
import { normalizeBransKodu } from "../textUtils";

export const DERK_GT_SATIRLARI = [31, 32, 33, 34, 35, 36, 37] as const;

export type DerkBransSonuc = {
  bransKodu: string;
  gtYillik: Record<number, number>;
  gtAylik: Record<number, number[]>;
};

function stokSerisiDerk(
  primAylar: number[],
  f349: number,
  cumulativeYazim: boolean,
): number[] {
  const out: number[] = [];
  for (let m = 0; m <= 12; m++) {
    const maxYazim = cumulativeYazim ? Math.min(m, 12) : 12;
    let sum = 0;
    for (let t = 1; t <= maxYazim; t++) {
      sum += (primAylar[t - 1] ?? 0) * f349;
    }
    out.push(sum);
  }
  return out;
}

function gtHareketFromDerkStok(
  cariStok: number[],
  devStok: number[],
  reasOran: number,
): { yillik: Record<number, number>; aylik: Record<number, number[]> } {
  const gtAylik: Record<number, number[]> = {
    33: [], 34: [], 36: [], 37: [],
  };

  for (let m = 1; m <= 12; m++) {
    const dCari = cariStok[m]! - cariStok[m - 1]!;
    const dDev = devStok[m]! - devStok[m - 1]!;
    const f33 = -dCari;
    const f34 = -dDev;
    const f36 = -f33 * reasOran;
    const f37 = -f34 * reasOran;
    gtAylik[33]!.push(f33);
    gtAylik[34]!.push(f34);
    gtAylik[36]!.push(f36);
    gtAylik[37]!.push(f37);
  }

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const f33y = sum(gtAylik[33]!);
  const f34y = sum(gtAylik[34]!);
  const f36y = sum(gtAylik[36]!);
  const f37y = sum(gtAylik[37]!);

  const yillik: Record<number, number> = {
    33: f33y,
    34: f34y,
    36: f36y,
    37: f37y,
    32: f33y + f34y,
    35: f36y + f37y,
    31: f33y + f34y + f36y + f37y,
  };

  const aylik: Record<number, number[]> = { ...gtAylik };
  aylik[32] = gtAylik[33]!.map((v, i) => v + gtAylik[34]![i]!);
  aylik[35] = gtAylik[36]!.map((v, i) => v + gtAylik[37]![i]!);
  aylik[31] = aylik[32]!.map((v, i) => v + aylik[35]![i]!);

  return { yillik, aylik };
}

export function hesaplaDerkBrans(opts: {
  bransKodu: string;
  cariPrimAylar: number[];
  oncekiYilPrimAylar: number[];
  f349Orani: number;
  reasurOrani: number;
}): DerkBransSonuc {
  const brans = normalizeBransKodu(opts.bransKodu);
  const f349 = Math.max(0, opts.f349Orani);
  const reas = Math.max(0, Math.min(1, Math.abs(opts.reasurOrani)));

  const cariStok = stokSerisiDerk(opts.cariPrimAylar, f349, true);
  const devStok = stokSerisiDerk(opts.oncekiYilPrimAylar, f349, false);
  const { yillik, aylik } = gtHareketFromDerkStok(cariStok, devStok, reas);

  return { bransKodu: brans, gtYillik: yillik, gtAylik: aylik };
}

export function hesaplaDerkPortfoy(opts: {
  cariPrim: Record<string, number[]>;
  oncekiYilPrim: Record<string, number[]>;
  f349Oranlari: Record<string, number>;
  reasurOranlari: Record<string, number>;
}): DerkBransSonuc[] {
  const branslar = new Set([
    ...Object.keys(opts.cariPrim),
    ...Object.keys(opts.oncekiYilPrim),
  ]);
  const out: DerkBransSonuc[] = [];
  for (const bransKodu of branslar) {
    const cari = opts.cariPrim[bransKodu];
    const onceki = opts.oncekiYilPrim[bransKodu];
    if (!cari?.some((v) => v > 0) && !onceki?.some((v) => v > 0)) continue;
    out.push(
      hesaplaDerkBrans({
        bransKodu,
        cariPrimAylar: cari ?? Array(12).fill(0),
        oncekiYilPrimAylar: onceki ?? Array(12).fill(0),
        f349Orani: opts.f349Oranlari[bransKodu] ?? 0,
        reasurOrani: opts.reasurOranlari[bransKodu] ?? 0,
      }),
    );
  }
  return out.sort((a, b) => a.bransKodu.localeCompare(b.bransKodu));
}
