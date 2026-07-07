import { faaliyetHesapGtSatir, FAALIYET_GT_SATIRLARI } from "../config/faaliyetGiderMap";
import { MizanOranServisi } from "../oran/mizanOranlar";
import { normalizeBransKodu } from "../textUtils";
import type { FaaliyetGiderRow, MizanRow, OranAyarStore } from "../types";

export { FAALIYET_GT_SATIRLARI };

export type FaaliyetGiderBransSonuc = {
  bransKodu: string;
  gtYillik: Record<number, number>;
  gtAylik: Record<number, number[]>;
};

function bosAylik(): number[] {
  return Array.from({ length: 12 }, () => 0);
}

function branchShares(mizan: MizanRow[], butceYili: number, oranAyar: OranAyarStore): Record<string, number> {
  const servis = new MizanOranServisi(mizan, butceYili);
  const tablo = servis.tumBranslarTablosu("F368", oranAyar["F368"] ?? {});
  const out: Record<string, number> = {};
  let toplam = 0;
  for (const r of tablo) {
    const o = Math.abs(r.oran);
    if (o > 0) {
      out[r.bransKodu] = o;
      toplam += o;
    }
  }
  if (toplam <= 0) return out;
  for (const k of Object.keys(out)) out[k] = out[k]! / toplam;
  return out;
}

/** Şirket geneli 614xx aylık tutarları → branş GT hücreleri (F368 payı ile). */
export function buildFaaliyetGiderSonuc(opts: {
  butceYili: number;
  rows: FaaliyetGiderRow[];
  mizan: MizanRow[];
  oranAyar?: OranAyarStore;
  bransKodlari: string[];
}): FaaliyetGiderBransSonuc[] | null {
  const filtered = opts.rows.filter((r) => r.butceYili === opts.butceYili);
  if (filtered.length === 0) return null;

  const shares = branchShares(opts.mizan, opts.butceYili, opts.oranAyar ?? {});
  const bransSet = new Set(opts.bransKodlari.map(normalizeBransKodu));

  const byBrans = new Map<string, FaaliyetGiderBransSonuc>();
  for (const kod of bransSet) {
    byBrans.set(kod, { bransKodu: kod, gtYillik: {}, gtAylik: {} });
  }

  for (const row of filtered) {
    const gtSatir = faaliyetHesapGtSatir(row.hesap);
    if (gtSatir == null) continue;

    const gtTutar = -Math.abs(row.tutar);
    const ayIdx = row.ay - 1;

    if (row.bransKodu && /^7\d\d$/.test(row.bransKodu)) {
      const kod = normalizeBransKodu(row.bransKodu);
      if (!byBrans.has(kod)) byBrans.set(kod, { bransKodu: kod, gtYillik: {}, gtAylik: {} });
      const b = byBrans.get(kod)!;
      if (!b.gtAylik[gtSatir]) b.gtAylik[gtSatir] = bosAylik();
      b.gtAylik[gtSatir]![ayIdx] += gtTutar;
      b.gtYillik[gtSatir] = (b.gtYillik[gtSatir] ?? 0) + gtTutar;
      continue;
    }

    for (const [bransKodu, pay] of Object.entries(shares)) {
      if (!bransSet.has(bransKodu)) continue;
      const payli = gtTutar * pay;
      const b = byBrans.get(bransKodu)!;
      if (!b.gtAylik[gtSatir]) b.gtAylik[gtSatir] = bosAylik();
      b.gtAylik[gtSatir]![ayIdx] += payli;
      b.gtYillik[gtSatir] = (b.gtYillik[gtSatir] ?? 0) + payli;
    }
  }

  return [...byBrans.values()].filter((b) => Object.keys(b.gtYillik).length > 0);
}

export function faaliyetGiderHucreOverride(brans: FaaliyetGiderBransSonuc): Record<number, number> {
  return { ...brans.gtYillik };
}
