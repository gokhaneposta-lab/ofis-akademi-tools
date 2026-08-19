import { HAZINE_BRANS_SIRASI } from "../config/brans";
import { bransGrubu } from "../v2/buildGtFormatGrid";
import type { OranDuzenleme } from "./oranMetodoloji";
import {
  birlestirDuzenlemeler,
  oranDuzenleme,
  V2_GRUP_FALLBACK_KALEMLER,
  V2_HASAR_BLOK_KALEMLER,
  V2_KUCUK_BAZ_ESIK_TL,
  V2_KURAL_KALEMLER,
} from "./oranMetodoloji";
import type { KalemOranSonuc } from "./oranMotoru";

export function tarifeGrupUyeleri(brans: string): string[] {
  const grup = bransGrubu(brans);
  return HAZINE_BRANS_SIRASI.filter((k) => bransGrubu(k) === grup);
}

export function duzenlemelerFromEtkinDetay(detay: KalemOranSonuc): OranDuzenleme[] {
  const out: OranDuzenleme[] = [];
  if (!detay.torpuUygulandi) {
    out.push(oranDuzenleme("standart"));
    return out;
  }
  out.push(oranDuzenleme("standart"));
  for (const b of detay.bilesenler) {
    for (const yp of b.yilParcalari) {
      if (yp.dislendi && yp.neden.includes(">")) {
        out.push(
          oranDuzenleme("torpu_yil_dislama", {
            yil: yp.yil,
            detay: yp.neden ? `(${yp.neden})` : undefined,
          }),
        );
      }
      if (yp.dislendi && yp.neden === "baz/prim yok") {
        out.push(
          oranDuzenleme("torpu_yil_dislama", {
            yil: yp.yil,
            detay: "(payda yok)",
          }),
        );
      }
    }
    if (Math.abs(b.hamOran - b.torpuOran) > 1e-9) {
      out.push(oranDuzenleme("torpu_sinir"));
    }
  }
  return birlestirDuzenlemeler(out);
}

export type V2OranBaglam = {
  kalemKodu: string;
  brans: string;
  ay: number;
  /** Son referans yılı baz tutarı (TL). */
  sonBaz: number;
  hasarBlokGrupModu: boolean;
};

export function kucukBazMi(sonBaz: number, kalemKodu: string): boolean {
  if (!V2_GRUP_FALLBACK_KALEMLER.has(kalemKodu)) return false;
  return Math.abs(sonBaz) < V2_KUCUK_BAZ_ESIK_TL;
}

export function v2HasarBlokGrupGerekli(
  sonBazByKalem: Map<string, number>,
  brans: string,
): boolean {
  for (const k of V2_HASAR_BLOK_KALEMLER) {
    const baz = sonBazByKalem.get(`${k}|${brans}`) ?? 0;
    if (kucukBazMi(baz, k)) return true;
  }
  return false;
}

export function kuralDuzenlemeleri(kalemKodu: string): OranDuzenleme[] {
  const aciklama = V2_KURAL_KALEMLER[kalemKodu];
  if (!aciklama) return [];
  return [oranDuzenleme("kural_sabit", { detay: aciklama })];
}

export function grupFallbackDuzenlemesi(grup: string, hasarBlok: boolean): OranDuzenleme {
  return oranDuzenleme(hasarBlok ? "hasar_grup_tutarli" : "kucuk_baz_grup", { grup });
}
