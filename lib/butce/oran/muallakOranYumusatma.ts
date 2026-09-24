import { HAZINE_BRANS_KODLARI, HAZINE_BRANS_SIRASI } from "../config/brans";
import type { MizanOranServisi } from "./mizanOranlar";

export const MUALLAK_YUMUSATMA_K_TL = 200_000_000;
export const MUALLAK_YUMUSATMA_CAP = 1.5;

function median(xs: number[]): number {
  if (xs.length === 0) return 1;
  const a = [...xs].sort((x, y) => x - y);
  const i = Math.floor(a.length / 2);
  return a.length % 2 ? a[i]! : (a[i - 1]! + a[i]!) / 2;
}

/** F451/02211: küçük bazlı oranı güvenilir branşların aylık eğrisine yaklaştırır. */
export function buildMuallakYumusatilmisOranlar(
  servis: MizanOranServisi,
  hamByAy: ReadonlyMap<number, ReadonlyMap<string, number>>,
): Map<number, Map<string, number>> {
  const kodlar = HAZINE_BRANS_SIRASI.filter((k) => k in HAZINE_BRANS_KODLARI);
  const yillar = servis.kalemAgirlikliYillar("02211");
  const baz = new Map<string, number>();

  for (const brans of kodlar) {
    for (let ay = 1; ay <= 12; ay++) {
      let toplam = 0;
      let agirlik = 0;
      for (const y of yillar) {
        const olcum = servis.yilOlcum("02211", brans, y.yil, ay);
        if (olcum?.oran == null) continue;
        toplam += Math.abs(olcum.baz) * y.agirlik;
        agirlik += y.agirlik;
      }
      baz.set(`${brans}|${ay}`, agirlik > 0 ? toplam / agirlik : 0);
    }
  }

  const seasonal = new Map<number, number>();
  for (let ay = 1; ay <= 12; ay++) {
    const oranlar: number[] = [];
    for (const brans of kodlar) {
      const m = Math.abs(hamByAy.get(ay)?.get(brans) ?? 0);
      const d = Math.abs(hamByAy.get(12)?.get(brans) ?? 0);
      const b = baz.get(`${brans}|${ay}`) ?? 0;
      if (b < 25_000_000 || d < 0.01 || d > 1.5 || m > 3) continue;
      oranlar.push(m / d);
    }
    seasonal.set(ay, median(oranlar));
  }

  const out = new Map<number, Map<string, number>>();
  for (let ay = 1; ay <= 12; ay++) {
    const month = new Map<string, number>();
    for (const brans of kodlar) {
      const ham = hamByAy.get(ay)?.get(brans) ?? 0;
      const dec = hamByAy.get(12)?.get(brans) ?? 0;
      if (Math.abs(ham) < 1e-12 && Math.abs(dec) < 1e-12) {
        month.set(brans, 0);
        continue;
      }
      const hedef = -Math.abs(dec) * (seasonal.get(ay) ?? 1);
      const tarihselBaz = baz.get(`${brans}|${ay}`) ?? 0;
      const guven = tarihselBaz / (tarihselBaz + MUALLAK_YUMUSATMA_K_TL);
      const blended = guven * ham + (1 - guven) * hedef;
      const limit = Math.max(Math.abs(dec), Math.abs(hedef) * MUALLAK_YUMUSATMA_CAP);
      month.set(brans, Math.max(-limit, Math.min(limit, blended)));
    }
    out.set(ay, month);
  }
  return out;
}
