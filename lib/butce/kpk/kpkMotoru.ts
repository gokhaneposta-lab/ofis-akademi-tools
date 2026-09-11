import { normalizeBransKodu } from "../textUtils";
import type { KpkVadeRow } from "../types";
import { kpkTutari } from "./kpkTarih";
import type { KpkPrimAy } from "./kpkPrimGecmisi";

export const KPK_GT_SATIRLARI = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] as const;

export type KpkBransSonuc = {
  bransKodu: string;
  /** Ay sonu stok: ay 0 = açılış, ay 1–12 = Ocak–Aralık sonu (rolling aktif KPK). */
  cariStok: number[];
  /** Devreden stok motoru kullanmaz; F24 mizan Ocak devralması ile override edilir. */
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

/** Vade süresince hâlâ aktif tüm yazım aylarından KPK stoku. */
function rollingStok(
  primGecmisi: KpkPrimAy[],
  brans: string,
  vade: Map<string, number>,
  degerlemeYil: number,
  degerlemeAy: number,
): number {
  let sum = 0;
  for (const { yil, ay, prim } of primGecmisi) {
    if (prim <= 0) continue;
    sum += kpkTutari(prim, yil, ay, vadeGun(vade, brans, ay), degerlemeYil, degerlemeAy);
  }
  return sum;
}

function rollingStokSerisi(
  primGecmisi: KpkPrimAy[],
  brans: string,
  vade: Map<string, number>,
  degerlemeYil: number,
): number[] {
  const out: number[] = [];
  for (let m = 0; m <= 12; m++) {
    out.push(rollingStok(primGecmisi, brans, vade, degerlemeYil, m));
  }
  return out;
}

/** SGK KPK payı — yalnızca 715; brüt KPK hareketi × SGK prim oranı. */
function sgkKpk(brans: string, brutHareket: number, sgkPrimOrani: number): number {
  if (brans !== "715" || brutHareket === 0 || sgkPrimOrani === 0) return 0;
  return brutHareket * Math.abs(sgkPrimOrani);
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
    // 601011 GT hareketi bütçe yılında sıfır bazlı başlar (601012 Ocak devralma ayrı).
    // Aralık rolling stok seviyesi Ocak F23'e baz olarak girmez; aksi halde stok
    // eriyince F23 pozitif (601011 yanlış işaret), F26 (601021) negatif olur.
    const oncekiCari = m === 1 ? 0 : cariStok[m - 1]!;
    const dCari = cariStok[m]! - oncekiCari;
    const dDev = devStok[m]! - devStok[m - 1]!;

    const f23 = -dCari;
    const f24 = -dDev;
    const f26 = -f23 * reasOran;
    const f27 = -f24 * reasOran;
    const f29 = -sgkKpk(brans, f23, sgkPrimOrani);
    const f30 = -sgkKpk(brans, f24, sgkPrimOrani);

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
  primGecmisi: KpkPrimAy[];
  vadeRows: KpkVadeRow[];
  reasurOrani: number;
  sgkPrimOrani?: number;
}): KpkBransSonuc {
  const brans = normalizeBransKodu(opts.bransKodu);
  const vade = vadeMap(opts.vadeRows);
  const reas = Math.max(0, Math.min(1, Math.abs(opts.reasurOrani)));
  const sgk = opts.sgkPrimOrani ?? 0;

  const cariStok = rollingStokSerisi(opts.primGecmisi, brans, vade, opts.butceYili);
  const devredenStok = Array.from({ length: 13 }, () => 0);

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
  primGecmisi: Record<string, KpkPrimAy[]>;
  vadeRows: KpkVadeRow[];
  reasurOranlari: Record<string, number>;
  sgkPrimOranlari?: Record<string, number>;
}): KpkBransSonuc[] {
  const out: KpkBransSonuc[] = [];
  for (const [bransKodu, gecmisi] of Object.entries(opts.primGecmisi)) {
    if (!gecmisi.some((r) => r.prim > 0)) continue;
    out.push(
      hesaplaKpkBrans({
        bransKodu,
        butceYili: opts.butceYili,
        primGecmisi: gecmisi,
        vadeRows: opts.vadeRows,
        reasurOrani: opts.reasurOranlari[bransKodu] ?? 0,
        sgkPrimOrani: opts.sgkPrimOranlari?.[bransKodu] ?? 0,
      }),
    );
  }
  return out.sort((a, b) => a.bransKodu.localeCompare(b.bransKodu));
}
