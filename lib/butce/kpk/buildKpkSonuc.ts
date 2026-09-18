import type { AylikPrimStore, KpkVadeRow, MizanRow, OranAyarStore } from "../types";
import { MizanOranServisi } from "../oran/mizanOranlar";
import { normalizeBransKodu } from "../textUtils";
import { buildOncekiYilPrimSerisi } from "./oncekiYilPrimTahmin";
import { buildKpkPrimGecmisi } from "./kpkPrimGecmisi";
import { hesaplaKpkPortfoy, type KpkBransSonuc } from "./kpkMotoru";
import {
  defaultKpkPrimKaynakModu,
  resolveKpkPrimGirdisi,
  type KpkPrimKaynakOpts,
} from "./kpkPrimKaynak";
import type {
  MizanAylikRow,
  TarifeBransPayRow,
  KpkKapanisTahminStore,
  TarifeMapRow,
} from "../types";
import { primKaynakForButceYili } from "./kpkPrimKaynak";

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
  mizanAylikFull: MizanAylikRow[] = [],
  v2Metodoloji = false,
): Record<string, number> {
  const servis = new MizanOranServisi(mizan, butceYili, mizanAylikFull, v2Metodoloji);
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
  mizanAylikFull: MizanAylikRow[] = [],
  v2Metodoloji = false,
): Record<string, number> {
  const servis = new MizanOranServisi(mizan, butceYili, mizanAylikFull, v2Metodoloji);
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
  mizanAylikFull?: MizanAylikRow[];
  v2Metodoloji?: boolean;
  /** Faz 1: senaryo-aware prim; yoksa butce (2027 + mizan → butce_yplus1). */
  primKaynak?: KpkPrimKaynakOpts;
  /** EYE / Y-1 eye için anchor (1–12). */
  kpkAnchorAy?: number;
  /** 2027 Y-1 EYE 12 ay serisi için tarife map. */
  tarifeMap?: TarifeMapRow[];
}): KpkSonuc {
  // Tek kapanış store'u farklı bütçe yılına ait olabilir. Örneğin 2027 için
  // kaydedilmiş 2026/04 tahmini, 2026 bütçesinin tam 2025 serisini kesmemeli.
  const kapanisTahmin =
    opts.kapanisTahmin?.butceYili === opts.butceYili &&
    opts.kapanisTahmin.oncekiYil === opts.butceYili - 1
      ? opts.kapanisTahmin
      : null;
  const onceki = buildOncekiYilPrimSerisi({
    butceYili: opts.butceYili,
    mizanAylik: opts.mizanAylik,
    tarifeBransPay: opts.tarifeBransPay,
    kapanisTahmin,
  });

  const mizanFull = opts.mizanAylikFull ?? [];
  let primKaynak: KpkPrimKaynakOpts = opts.primKaynak ?? { mod: "butce" };
  if (!opts.primKaynak) {
    const yplus1 = primKaynakForButceYili({
      butceYili: opts.butceYili,
      mizanAylikFull: mizanFull,
      tarifeMap: opts.tarifeMap,
      eyeAnchorAy: opts.kpkAnchorAy,
    });
    if (yplus1) {
      primKaynak = yplus1;
    } else {
      const auto = defaultKpkPrimKaynakModu(opts.butceYili, mizanFull);
      primKaynak =
        auto === "butce_yplus1" ? { mod: "butce_yplus1", oncekiYilEyePrim: {} } : { mod: "butce" };
    }
  }

  const bransFromPrim = new Set<string>();
  if (opts.aylikPrim) {
    for (const r of opts.aylikPrim.satirlar) bransFromPrim.add(normalizeBransKodu(r.bransKodu));
  }

  const resolved = resolveKpkPrimGirdisi({
    butceYili: opts.butceYili,
    aylikPrim: opts.aylikPrim,
    primKaynak,
    mizanAylikFull: mizanFull,
    mizanAylik: opts.mizanAylik,
    tarifeBransPay: opts.tarifeBransPay,
    bransKodlari: bransFromPrim.size > 0 ? [...bransFromPrim] : undefined,
  });

  const cariPrim = resolved.cariPrim;

  const reas = reasurOranlari(
    opts.mizan,
    opts.butceYili,
    opts.oranAyar ?? {},
    opts.mizanAylikFull ?? [],
    opts.v2Metodoloji ?? false,
  );
  const sgk = sgkPrimOranlari(
    opts.mizan,
    opts.butceYili,
    opts.oranAyar ?? {},
    opts.mizanAylikFull ?? [],
    opts.v2Metodoloji ?? false,
  );

  const primGecmisi = buildKpkPrimGecmisi({
    butceYili: opts.butceYili,
    oncekiYilPrim: onceki.bransAylik,
    cariPrim,
    mizanAylik: opts.mizanAylik,
    mizanAylikFull: mizanFull,
    oncekiYilPrimOverride: resolved.oncekiYilPrimOverride,
  });

  const branslar = hesaplaKpkPortfoy({
    butceYili: opts.butceYili,
    primGecmisi,
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
