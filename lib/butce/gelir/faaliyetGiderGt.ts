import { faaliyetImportHesapGtSatir, FAALIYET_IMPORT_GT_SATIRLARI } from "../config/faaliyetGiderMap";
import { MizanOranServisi } from "../oran/mizanOranlar";
import { normalizeBransKodu } from "../textUtils";
import type { FaaliyetGiderRow, MizanRow, OranAyarStore } from "../types";

export { FAALIYET_IMPORT_GT_SATIRLARI as FAALIYET_GT_SATIRLARI };

export type FaaliyetGiderBransSonuc = {
  bransKodu: string;
  gtYillik: Record<number, number>;
  gtAylik: Record<number, number[]>;
};

function bosAylik(): number[] {
  return Array.from({ length: 12 }, () => 0);
}

function branchShares(
  mizan: MizanRow[],
  butceYili: number,
  oranAyar: OranAyarStore,
  aktifBransKodlari: readonly string[],
): Record<string, number> {
  const aktifSet = new Set(aktifBransKodlari.map(normalizeBransKodu));
  const servis = new MizanOranServisi(mizan, butceYili);
  const tablo = servis.tumBranslarTablosu("F368", oranAyar["F368"] ?? {});
  const out: Record<string, number> = {};
  let toplam = 0;
  for (const r of tablo) {
    if (!aktifSet.has(r.bransKodu)) continue;
    const o = Math.abs(r.oran);
    if (o > 0) {
      out[r.bransKodu] = o;
      toplam += o;
    }
  }
  if (toplam > 0) {
    for (const k of Object.keys(out)) out[k] = out[k]! / toplam;
    return out;
  }
  // Mizan yoksa veya F368 sıfırsa: aktif branşlara eşit dağıt (tek branşa yığma)
  const n = aktifBransKodlari.length;
  if (n === 0) return {};
  const pay = 1 / n;
  for (const kod of aktifBransKodlari) out[normalizeBransKodu(kod)] = pay;
  return out;
}

/** Şirket geneli 614xx aylık tutarları → branş GT hücreleri (F368 payı ile). */
export function buildFaaliyetGiderSonuc(opts: {
  butceYili: number;
  rows: FaaliyetGiderRow[];
  mizan: MizanRow[];
  oranAyar?: OranAyarStore;
  /** Gelir tablosunda prim hedefi olan branşlar — F368 payı bunlar arasında normalize edilir. */
  aktifBransKodlari: readonly string[];
}): FaaliyetGiderBransSonuc[] | null {
  const filtered = opts.rows.filter((r) => r.butceYili === opts.butceYili);
  if (filtered.length === 0) return null;

  const aktifBrans = opts.aktifBransKodlari.map(normalizeBransKodu);
  if (aktifBrans.length === 0) return null;

  const shares = branchShares(opts.mizan, opts.butceYili, opts.oranAyar ?? {}, aktifBrans);

  const byBrans = new Map<string, FaaliyetGiderBransSonuc>();
  for (const kod of aktifBrans) {
    byBrans.set(kod, { bransKodu: kod, gtYillik: {}, gtAylik: {} });
  }

  for (const row of filtered) {
    const gtSatir = faaliyetImportHesapGtSatir(row.hesap);
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

    // Branş boş / şirket geneli → F368 oranlarıyla tüm aktif branşlara dağıt
    for (const [bransKodu, pay] of Object.entries(shares)) {
      const payli = gtTutar * pay;
      const b = byBrans.get(bransKodu);
      if (!b) continue;
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
