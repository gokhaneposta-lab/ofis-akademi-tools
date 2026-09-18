/**

 * KPK motoru — senaryo-aware aylık brüt prim serisi (Faz 1).

 * rollingStok girdisi; devreden / GT okuma bu modülde yok.

 */

import type {
  AylikPrimStore,
  MizanAylikRow,
  TarifeBransPayRow,
  TarifeMapRow,
} from "../types";
import { resolveEyeForecastPrimMotor } from "../eye/resolveEyeForecastPrimMotor";
import { detectYtdAnchorAy } from "../v3/ytdOverlay";

import { kumuldenAylikArtis } from "../prim/primDagilim";

import { normalizeBransKodu } from "../textUtils";



/** Senaryo modu — davranış business rule Faz 1 ile hizalı. */

export type KpkPrimKaynakModu = "butce" | "eye" | "butce_yplus1";



export type KpkPrimKaynakOpts =

  | { mod: "butce" }

  | {

      mod: "eye";

      /** Kesim ayı 1–12; 12 = tam yıl actual. */

      anchorAy: number;

      /**

       * Bağımsız EYE forecast motorundan H2 aylık prim (12 eleman; actual aylar yok sayılır).

       * Yoksa H2 = 0 (sessiz fallback yok).

       */

      h2ForecastPrim?: Record<string, number[]>;

    }

  | {

      mod: "butce_yplus1";

      /** Önceki yıl EYE tam 12 aylık seri (Actual+Forecast). */

      oncekiYilEyePrim: Record<string, number[]>;

    };



export type BuildEyeCariPrimSonuc = {

  seri: Record<string, number[]>;

  /** H2 forecast motoru sağlanmadı (anchor < 12). */

  h2Blocked: boolean;

  uyarilar: string[];

};



/** mizan-aylik-full GT 0111 → branş × 12 aylık incremental prim. */

export function bransAylikPrimMizan0111(

  mizanAylikFull: MizanAylikRow[],

  yil: number,

): Record<string, number[]> {

  const kumulByBrans = new Map<string, number[]>();

  for (const r of mizanAylikFull) {

    if (Number(r.yil) !== yil) continue;

    if (String(r.hesap) !== "0111") continue;

    const b = normalizeBransKodu(r.bransKodu);

    if (!/^7\d{2}$/.test(b)) continue;

    const ay = Number(r.ay);

    if (ay < 1 || ay > 12) continue;

    if (!kumulByBrans.has(b)) kumulByBrans.set(b, Array(12).fill(0));

    kumulByBrans.get(b)![ay - 1] += Number(r.tutar) || 0;

  }

  const out: Record<string, number[]> = {};

  for (const [b, kumul] of kumulByBrans) {

    out[b] = kumuldenAylikArtis(kumul);

  }

  return out;

}



/** AylikPrimStore → cariPrim map. */

export function cariPrimFromAylikPrim(store: AylikPrimStore | null | undefined): Record<string, number[]> {

  const out: Record<string, number[]> = {};

  if (!store) return out;

  for (const r of store.satirlar) {

    out[normalizeBransKodu(r.bransKodu)] = [...r.aylar];

  }

  return out;

}



/**

 * 2026 EYE tam 12 aylık cari prim.

 * Actual: mizan 0111. H2: yalnızca `h2ForecastPrim` (bağımsız motor).

 */

export function buildEyeCariPrimSerisi(opts: {

  butceYili: number;

  anchorAy: number;

  mizanAylikFull: MizanAylikRow[];

  bransKodlari?: string[];

  h2ForecastPrim?: Record<string, number[]>;

}): BuildEyeCariPrimSonuc {

  const anchor = Math.min(Math.max(opts.anchorAy, 1), 12);

  const mizan = bransAylikPrimMizan0111(opts.mizanAylikFull, opts.butceYili);

  const branslar =

    opts.bransKodlari ?? Object.keys(mizan);



  const uyarilar: string[] = [];

  const out: Record<string, number[]> = {};



  if (anchor >= 12) {

    for (const b of branslar) out[b] = [...(mizan[b] ?? Array(12).fill(0))];

    return { seri: out, h2Blocked: false, uyarilar };

  }



  const hasH2 =

    opts.h2ForecastPrim != null &&

    Object.keys(opts.h2ForecastPrim).length > 0 &&

    branslar.some((b) => {

      const fc = opts.h2ForecastPrim![b];

      if (!fc?.length) return false;

      for (let i = anchor; i < 12; i++) if ((fc[i] ?? 0) !== 0) return true;

      return false;

    });



  if (!hasH2) {

    uyarilar.push(

      "EYE KPK prim: H2 forecast motor çıktısı yok — forecast aylar 0 (GT F11 / bütçe rescale kullanılmıyor).",

    );

  }



  for (const b of branslar) {

    const ser = Array(12).fill(0);

    const mz = mizan[b] ?? Array(12).fill(0);

    for (let i = 0; i < anchor; i++) ser[i] = mz[i] ?? 0;

    const fc = opts.h2ForecastPrim?.[b];

    if (fc?.length === 12) {

      for (let i = anchor; i < 12; i++) ser[i] = fc[i] ?? 0;

    }

    out[b] = ser;

  }



  return { seri: out, h2Blocked: !hasH2, uyarilar };

}



/** 2027 bütçe: önceki yıl EYE 12 ay serisi (motor + mizan). */

export function buildOncekiYilEyePrimForButceYplus1(opts: {

  butceYili: number;

  anchorAy: number;

  mizanAylikFull: MizanAylikRow[];

  mizanAylik: MizanAylikRow[];

  tarifeBransPay: TarifeBransPayRow[];

  bransKodlari: string[];

  h2ForecastPrimOncekiYil?: Record<string, number[]>;

}): BuildEyeCariPrimSonuc {

  const oncekiYil = opts.butceYili - 1;

  return buildEyeCariPrimSerisi({

    butceYili: oncekiYil,

    anchorAy: opts.anchorAy,

    mizanAylikFull: opts.mizanAylikFull,

    bransKodlari: opts.bransKodlari,

    h2ForecastPrim: opts.h2ForecastPrimOncekiYil,

  });

}



export type ResolveKpkPrimSonuc = {

  cariPrim: Record<string, number[]>;

  /** Y-1 için pickSeri yerine zorunlu seri (butce_yplus1). */

  oncekiYilPrimOverride?: Record<string, number[]>;

  mod: KpkPrimKaynakModu;

  uyarilar: string[];

};



export function resolveKpkPrimGirdisi(opts: {

  butceYili: number;

  aylikPrim?: AylikPrimStore | null;

  primKaynak?: KpkPrimKaynakOpts;

  mizanAylikFull?: MizanAylikRow[];

  mizanAylik?: MizanAylikRow[];

  tarifeBransPay?: TarifeBransPayRow[];

  bransKodlari?: string[];

}): ResolveKpkPrimSonuc {

  const mod = opts.primKaynak?.mod ?? "butce";

  const mizanFull = opts.mizanAylikFull ?? [];

  const uyarilar: string[] = [];



  if (mod === "butce") {

    return { mod, cariPrim: cariPrimFromAylikPrim(opts.aylikPrim), uyarilar };

  }



  if (mod === "eye") {

    const anchorAy = opts.primKaynak.anchorAy;

    const built = buildEyeCariPrimSerisi({

      butceYili: opts.butceYili,

      anchorAy,

      mizanAylikFull: mizanFull,

      bransKodlari: opts.bransKodlari,

      h2ForecastPrim: opts.primKaynak.h2ForecastPrim,

    });

    uyarilar.push(...built.uyarilar);

    return { mod, cariPrim: built.seri, uyarilar };

  }



  const brans =

    opts.bransKodlari ?? Object.keys(cariPrimFromAylikPrim(opts.aylikPrim));

  const provided =

    opts.primKaynak.mod === "butce_yplus1" ? opts.primKaynak.oncekiYilEyePrim : {};

  let oncekiYilEyePrim: Record<string, number[]>;

  if (Object.keys(provided).length > 0) {

    oncekiYilEyePrim = provided;

  } else {

    const y1 = buildOncekiYilEyePrimForButceYplus1({

      butceYili: opts.butceYili,

      anchorAy: 11,

      mizanAylikFull: mizanFull,

      mizanAylik: opts.mizanAylik ?? [],

      tarifeBransPay: opts.tarifeBransPay ?? [],

      bransKodlari: brans,

    });

    oncekiYilEyePrim = y1.seri;

    uyarilar.push(...y1.uyarilar);

  }



  return {

    mod: "butce_yplus1",

    cariPrim: cariPrimFromAylikPrim(opts.aylikPrim),

    oncekiYilPrimOverride: oncekiYilEyePrim,

    uyarilar,

  };

}



/** Otomatik mod: 2027 bütçe yılı → butce_yplus1 (2026 mizan varsa). */

export function defaultKpkPrimKaynakModu(

  butceYili: number,

  mizanAylikFull: MizanAylikRow[],

): KpkPrimKaynakModu {

  if (butceYili === 2027) {

    const y2026 = bransAylikPrimMizan0111(mizanAylikFull, 2026);

    if (Object.values(y2026).some((s) => s.some((v) => v > 0))) return "butce_yplus1";

  }

  return "butce";

}

/** Yıl sonu kapanış prim senaryosu (Faz 1 + Faz 2 devreden). */
export function primKaynakForYearEndClose(opts: {
  butceYili: number;
  forDevredenIntoYear: number;
  mizanAylikFull: MizanAylikRow[];
  tarifeMap?: TarifeMapRow[];
  eyeAnchorAy?: number;
}): KpkPrimKaynakOpts {
  const y = opts.butceYili;
  if (y === 2026 && opts.forDevredenIntoYear === 2027) {
    const anchor =
      opts.eyeAnchorAy ??
      detectYtdAnchorAy(opts.mizanAylikFull, 2026, 8).anchorAy;
    if (opts.tarifeMap?.length) {
      const motor = resolveEyeForecastPrimMotor({
        butceYili: 2026,
        anchorAy: anchor,
        mizanAylikFull: opts.mizanAylikFull,
        tarifeMap: opts.tarifeMap,
      });
      return {
        mod: "eye",
        anchorAy: anchor,
        h2ForecastPrim:
          motor.durum !== "blocked" ? motor.h2ForecastPrimByBrans : undefined,
      };
    }
    return { mod: "eye", anchorAy: anchor };
  }
  return { mod: "butce" };
}

export function oncekiYilEye12PrimForButceYplus1(opts: {
  butceYili: number;
  mizanAylikFull: MizanAylikRow[];
  tarifeMap?: TarifeMapRow[];
  eyeAnchorAy?: number;
}): Record<string, number[]> {
  const oncekiYil = opts.butceYili - 1;
  const primKaynak = primKaynakForYearEndClose({
    butceYili: oncekiYil,
    forDevredenIntoYear: opts.butceYili,
    mizanAylikFull: opts.mizanAylikFull,
    tarifeMap: opts.tarifeMap,
    eyeAnchorAy: opts.eyeAnchorAy,
  });
  if (primKaynak.mod !== "eye") return {};
  const built = buildEyeCariPrimSerisi({
    butceYili: oncekiYil,
    anchorAy: primKaynak.anchorAy,
    mizanAylikFull: opts.mizanAylikFull,
    h2ForecastPrim: primKaynak.h2ForecastPrim,
  });
  return built.seri;
}

export function primKaynakForButceYili(opts: {
  butceYili: number;
  mizanAylikFull: MizanAylikRow[];
  tarifeMap?: TarifeMapRow[];
  eyeAnchorAy?: number;
}): KpkPrimKaynakOpts | undefined {
  if (opts.butceYili !== 2027 || !opts.tarifeMap?.length) return undefined;
  const oncekiYilEyePrim = oncekiYilEye12PrimForButceYplus1(opts);
  if (Object.keys(oncekiYilEyePrim).length === 0) return undefined;
  return { mod: "butce_yplus1", oncekiYilEyePrim };
}


