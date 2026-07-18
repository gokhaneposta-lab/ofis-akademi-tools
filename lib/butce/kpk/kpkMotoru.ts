import { normalizeBransKodu } from "../textUtils";
import type { KpkVadeRow } from "../types";
import { kpkTutari } from "./kpkTarih";

export const KPK_GT_SATIRLARI = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] as const;

export type KpkBransSonuc = {
  bransKodu: string;
  /** Ay sonu stok: ay 0 = açılış, ay 1–12 = Ocak–Aralık sonu */
  cariStok: number[];
  devredenStok: number[];
  /** GT hücreleri — yıllık toplam hareket */
  gtYillik: Record<number, number>;
  /** GT hücreleri — ay bazlı hareket (indeks 0 = Ocak) */
  gtAylik: Record<number, number[]>;
};

function vadeMap(rows: KpkVadeRow[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    m.set(`${normalizeBransKodu(r.bransKodu)}|${r.ay}`, r.vadeGun);
  }
  return m;
}

function vadeGun(map: Map<string, number>, brans: string, ay: number): number {
  return map.get(`${brans}|${ay}`) ?? 365;
}

function stok(
  primAylar: number[],
  yazimYil: number,
  brans: string,
  vade: Map<string, number>,
  degerlemeYil: number,
  degerlemeAy: number,
  maxYazimAy = 12,
): number {
  let sum = 0;
  for (let t = 1; t <= maxYazimAy; t++) {
    const p = primAylar[t - 1] ?? 0;
    if (p <= 0) continue;
    sum += kpkTutari(p, yazimYil, t, vadeGun(vade, brans, t), degerlemeYil, degerlemeAy);
  }
  return sum;
}

function stokSerisi(
  primAylar: number[],
  yazimYil: number,
  brans: string,
  vade: Map<string, number>,
  degerlemeYil: number,
  cumulativeYazim = true,
): number[] {
  const out: number[] = [];
  for (let m = 0; m <= 12; m++) {
    const maxYazim = cumulativeYazim ? Math.min(m, 12) : 12;
    out.push(stok(primAylar, yazimYil, brans, vade, degerlemeYil, m, maxYazim || 0));
  }
  return out;
}

/** SGK KPK payı — yalnızca 715; brüt KPK × SGK prim oranı. */
function sgkKpk(brans: string, brutKpk: number, sgkPrimOrani: number): number {
  if (brans !== "715" || brutKpk === 0 || sgkPrimOrani === 0) return 0;
  return brutKpk * Math.abs(sgkPrimOrani);
}

function gtHareketFromStok(
  cariStok: number[],
  devStok: number[],
  reasOran: number,
  brans: string,
  sgkPrimOrani: number,
): { yillik: Record<number, number>; aylik: Record<number, number[]> } {
  const gtAylik: Record<number, number[]> = {
    23: [], 24: [], 26: [], 27: [], 29: [], 30: [],
  };

  for (let m = 1; m <= 12; m++) {
    const dCari = cariStok[m]! - cariStok[m - 1]!;
    const dDev = devStok[m]! - devStok[m - 1]!;

    const f23 = -dCari;
    const f24 = -dDev;
    const f26 = Math.abs(f23) * reasOran;
    const f27 = -Math.abs(f24) * reasOran;
    const f29 = -sgkKpk(brans, Math.abs(f23), sgkPrimOrani);
    const f30 = -sgkKpk(brans, Math.abs(f24), sgkPrimOrani);

    gtAylik[23]!.push(f23);
    gtAylik[24]!.push(f24);
    gtAylik[26]!.push(f26);
    gtAylik[27]!.push(f27);
    gtAylik[29]!.push(f29);
    gtAylik[30]!.push(f30);
  }

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const f23y = sum(gtAylik[23]!);
  const f24y = sum(gtAylik[24]!);
  const f26y = sum(gtAylik[26]!);
  const f27y = sum(gtAylik[27]!);
  const f29y = sum(gtAylik[29]!);
  const f30y = sum(gtAylik[30]!);

  const yillik: Record<number, number> = {
    23: f23y,
    24: f24y,
    26: f26y,
    27: f27y,
    29: f29y,
    30: f30y,
    22: f23y + f24y,
    25: f26y + f27y,
    28: f29y + f30y,
    21: f23y + f24y + f26y + f27y + f29y + f30y,
  };

  const aylik: Record<number, number[]> = { ...gtAylik };
  aylik[22] = gtAylik[23]!.map((v, i) => v + gtAylik[24]![i]!);
  aylik[25] = gtAylik[26]!.map((v, i) => v + gtAylik[27]![i]!);
  aylik[28] = gtAylik[29]!.map((v, i) => v + gtAylik[30]![i]!);
  aylik[21] = aylik[22]!.map((v, i) => v + aylik[25]![i]! + aylik[28]![i]!);

  return { yillik, aylik };
}

export function hesaplaKpkBrans(opts: {
  bransKodu: string;
  butceYili: number;
  cariPrimAylar: number[];
  oncekiYilPrimAylar: number[];
  vadeRows: KpkVadeRow[];
  reasurOrani: number;
  sgkPrimOrani?: number;
}): KpkBransSonuc {
  const brans = normalizeBransKodu(opts.bransKodu);
  const vade = vadeMap(opts.vadeRows);
  const reas = Math.max(0, Math.min(1, Math.abs(opts.reasurOrani)));
  const sgk = opts.sgkPrimOrani ?? 0;

  const cariStok = stokSerisi(
    opts.cariPrimAylar,
    opts.butceYili,
    brans,
    vade,
    opts.butceYili,
    true,
  );
  const devredenStok = stokSerisi(
    opts.oncekiYilPrimAylar,
    opts.butceYili - 1,
    brans,
    vade,
    opts.butceYili,
    false,
  );

  const { yillik, aylik } = gtHareketFromStok(cariStok, devredenStok, reas, brans, sgk);

  return {
    bransKodu: brans,
    cariStok,
    devredenStok,
    gtYillik: yillik,
    gtAylik: aylik,
  };
}

export function hesaplaKpkPortfoy(opts: {
  butceYili: number;
  cariPrim: Record<string, number[]>;
  oncekiYilPrim: Record<string, number[]>;
  vadeRows: KpkVadeRow[];
  reasurOranlari: Record<string, number>;
  sgkPrimOranlari?: Record<string, number>;
}): KpkBransSonuc[] {
  const branslar = new Set([
    ...Object.keys(opts.cariPrim),
    ...Object.keys(opts.oncekiYilPrim),
  ]);
  const out: KpkBransSonuc[] = [];
  for (const bransKodu of branslar) {
    const cari = opts.cariPrim[bransKodu];
    const onceki = opts.oncekiYilPrim[bransKodu];
    if (!cari?.some((v) => v > 0) && !onceki?.some((v) => v > 0)) continue;
    out.push(
      hesaplaKpkBrans({
        bransKodu,
        butceYili: opts.butceYili,
        cariPrimAylar: cari ?? Array.from({ length: 12 }, () => 0),
        oncekiYilPrimAylar: onceki ?? Array.from({ length: 12 }, () => 0),
        vadeRows: opts.vadeRows,
        reasurOrani: opts.reasurOranlari[bransKodu] ?? 0,
        sgkPrimOrani: opts.sgkPrimOranlari?.[bransKodu] ?? 0,
      }),
    );
  }
  return out.sort((a, b) => a.bransKodu.localeCompare(b.bransKodu));
}
