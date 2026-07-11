import type { AylikPrimStore, KpkVadeRow, MizanRow, OranAyarStore } from "../types";
import { MizanOranServisi } from "../oran/mizanOranlar";
import { normalizeBransKodu } from "../textUtils";
import { buildOncekiYilPrimSerisi } from "./oncekiYilPrimTahmin";
import { hesaplaKpkPortfoy, type KpkBransSonuc } from "./kpkMotoru";
import type { MizanAylikRow, TarifeBransPayRow, KpkKapanisTahminStore } from "../types";

export type KpkSonuc = {
  butceYili: number;
  oncekiYil: number;
  sonGercekAy: number;
  branslar: KpkBransSonuc[];
  toplamGtYillik: Record<number, number>;
  toplamGtAylik: Record<number, number[]>;
};

function reasurOranlari(
  mizan: MizanRow[],
  butceYili: number,
  oranAyar: OranAyarStore,
): Record<string, number> {
  const servis = new MizanOranServisi(mizan, butceYili);
  const tablo = servis.tumBranslarTablosu("0112", oranAyar["0112"] ?? {});
  const out: Record<string, number> = {};
  for (const r of tablo) {
    out[r.bransKodu] = Math.abs(r.oran);
  }
  return out;
}

function sgkPrimOranlari(
  mizan: MizanRow[],
  butceYili: number,
  oranAyar: OranAyarStore,
): Record<string, number> {
  const servis = new MizanOranServisi(mizan, butceYili);
  const tablo = servis.tumBranslarTablosu("0113", oranAyar["0113"] ?? {});
  const out: Record<string, number> = {};
  for (const r of tablo) {
    if (r.bransKodu === "715") out[r.bransKodu] = Math.abs(r.oran);
  }
  return out;
}

export function buildKpkSonuc(opts: {
  butceYili: number;
  mizan: MizanRow[];
  mizanAylik: MizanAylikRow[];
  tarifeBransPay: TarifeBransPayRow[];
  vadeRows: KpkVadeRow[];
  aylikPrim?: AylikPrimStore | null;
  oranAyar?: OranAyarStore;
  kapanisTahmin?: KpkKapanisTahminStore | null;
}): KpkSonuc {
  const onceki = buildOncekiYilPrimSerisi({
    butceYili: opts.butceYili,
    mizanAylik: opts.mizanAylik,
    tarifeBransPay: opts.tarifeBransPay,
    kapanisTahmin: opts.kapanisTahmin,
  });

  const cariPrim: Record<string, number[]> = {};
  if (opts.aylikPrim) {
    for (const r of opts.aylikPrim.satirlar) {
      cariPrim[normalizeBransKodu(r.bransKodu)] = r.aylar;
    }
  }

  const reas = reasurOranlari(opts.mizan, opts.butceYili, opts.oranAyar ?? {});
  const sgk = sgkPrimOranlari(opts.mizan, opts.butceYili, opts.oranAyar ?? {});

  const branslar = hesaplaKpkPortfoy({
    butceYili: opts.butceYili,
    cariPrim,
    oncekiYilPrim: onceki.bransAylik,
    vadeRows: opts.vadeRows,
    reasurOranlari: reas,
    sgkPrimOranlari: sgk,
  });

  const toplamGtYillik: Record<number, number> = {};
  const toplamGtAylik: Record<number, number[]> = {};

  for (const b of branslar) {
    for (const [satir, val] of Object.entries(b.gtYillik)) {
      const s = Number(satir);
      toplamGtYillik[s] = (toplamGtYillik[s] ?? 0) + val;
    }
    for (const [satir, arr] of Object.entries(b.gtAylik)) {
      const s = Number(satir);
      if (!toplamGtAylik[s]) toplamGtAylik[s] = Array.from({ length: 12 }, () => 0);
      for (let i = 0; i < 12; i++) toplamGtAylik[s]![i] += arr[i] ?? 0;
    }
  }

  return {
    butceYili: opts.butceYili,
    oncekiYil: onceki.oncekiYil,
    sonGercekAy: onceki.sonGercekAy,
    branslar,
    toplamGtYillik,
    toplamGtAylik,
  };
}

export function kpkHucreOverride(brans: KpkBransSonuc): Record<number, number> {
  return { ...brans.gtYillik };
}
