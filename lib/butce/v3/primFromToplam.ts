import { ANA_BRANS_GRUPLARI, HAZINE_BRANS_SIRASI } from "../config/brans";
import { MIZAN_HESAP_ENDIREKT } from "../config/constants";
import { normalizeBransKodu, normalizeText } from "../textUtils";
import type { MizanRow } from "../types";

const BRUT_HESAP = "60001";

export type PrimFromToplamSonuc = {
  primHedefleri: Record<string, number>;
  endirektPrim: Record<string, number>;
  kaynak: string;
  referansYil: number;
  brutToplamReferans: number;
};

/** Geçmiş yıl mizandan branş brüt prim paylarını çıkarır. */
function brutPrimByBrans(mizan: MizanRow[], yil: number): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of mizan) {
    if (r.yil !== yil) continue;
    if (r.hesap !== BRUT_HESAP && r.hesap !== "600") continue;
    const b = normalizeBransKodu(r.bransKodu);
    if (!b || b === "TOPLAM") continue;
    map.set(b, (map.get(b) ?? 0) + r.tutar);
  }
  return map;
}

function endirektByBrans(mizan: MizanRow[], yil: number): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of mizan) {
    if (r.yil !== yil) continue;
    if (r.hesap !== MIZAN_HESAP_ENDIREKT) continue;
    const b = normalizeBransKodu(r.bransKodu);
    if (!b || b === "TOPLAM") continue;
    map.set(b, (map.get(b) ?? 0) + r.tutar);
  }
  return map;
}

/**
 * Tek toplam prim hedefini 7xx branşlara dağıtır.
 * Pay: referans yıl brüt prim (60001); endirekt oranı aynı yıldan korunur.
 */
export function primHedefFromToplam(
  toplamPrimHedef: number,
  mizan: MizanRow[],
  butceYili: number,
): PrimFromToplamSonuc {
  const yillar = [...new Set(mizan.map((r) => r.yil))]
    .filter((y) => y < butceYili)
    .sort((a, b) => b - a);
  const referansYil = yillar[0] ?? butceYili - 1;

  const brutRef = brutPrimByBrans(mizan, referansYil);
  let refToplam = 0;
  for (const v of brutRef.values()) refToplam += v;

  const primHedefleri: Record<string, number> = {};
  const endirektPrim: Record<string, number> = {};
  const endRef = endirektByBrans(mizan, referansYil);

  if (refToplam <= 0 || toplamPrimHedef <= 0) {
    for (const kod of HAZINE_BRANS_SIRASI) {
      primHedefleri[kod] = 0;
      endirektPrim[kod] = 0;
    }
    return {
      primHedefleri,
      endirektPrim,
      kaynak: "mizan_yok",
      referansYil,
      brutToplamReferans: 0,
    };
  }

  for (const kod of HAZINE_BRANS_SIRASI) {
    const pay = (brutRef.get(kod) ?? 0) / refToplam;
    const brut = toplamPrimHedef * pay;
    primHedefleri[kod] = brut;
    const brutR = brutRef.get(kod) ?? 0;
    const endR = endRef.get(kod) ?? 0;
    endirektPrim[kod] = brutR > 0 ? brut * (endR / brutR) : 0;
  }

  return {
    primHedefleri,
    endirektPrim,
    kaynak: `mizan_${referansYil}_brans_pay`,
    referansYil,
    brutToplamReferans: refToplam,
  };
}

/**
 * Satış tarife grubu → ana branş grupları (brans.json).
 * KAZA OTO = kasko; DİĞER KAZA kalan kaza/kredi/finansal kalemleri toplar.
 */
const TARIFE_ANA_ALIAS: Readonly<Record<string, readonly string[]>> = {
  "KAZA OTO": ["KASKO"],
  "DIGER KAZA": ["DIGER KAZA", "FERDI KAZA", "KREDI", "FINANSAL KAYIPLAR"],
};

function anaKeysForTarife(tarifeGrubu: string): string[] {
  const n = normalizeText(tarifeGrubu);
  const alias = TARIFE_ANA_ALIAS[n];
  const wanted = alias ?? [n];
  const out: string[] = [];
  for (const w of wanted) {
    for (const key of Object.keys(ANA_BRANS_GRUPLARI)) {
      if (normalizeText(key) === normalizeText(w) && !out.includes(key)) out.push(key);
    }
  }
  return out;
}

function bransKodlariForTarife(tarifeGrubu: string): string[] {
  const keys = anaKeysForTarife(tarifeGrubu);
  const kodlar: string[] = [];
  for (const k of keys) {
    for (const kod of ANA_BRANS_GRUPLARI[k] ?? []) {
      if (!kodlar.includes(kod)) kodlar.push(kod);
    }
  }
  return kodlar;
}

/**
 * Tarife hedeflerini 7xx branşlara dağıtır: ana grup eşlemesi + referans yıl iç-grup mizan payı.
 * tarife-branş pay tablosu yokken TARSİM/TRAFİK mix’ini korur.
 */
export function primHedefFromTarifeAna(
  tarifeHedefleri: Record<string, number>,
  mizan: MizanRow[],
  butceYili: number,
): PrimFromToplamSonuc {
  const yillar = [...new Set(mizan.map((r) => r.yil))]
    .filter((y) => y < butceYili)
    .sort((a, b) => b - a);
  const referansYil = yillar[0] ?? butceYili - 1;
  const brutRef = brutPrimByBrans(mizan, referansYil);
  const endRef = endirektByBrans(mizan, referansYil);

  const primHedefleri: Record<string, number> = {};
  const endirektPrim: Record<string, number> = {};
  for (const kod of HAZINE_BRANS_SIRASI) {
    primHedefleri[kod] = 0;
    endirektPrim[kod] = 0;
  }

  let brutToplamReferans = 0;
  let dagitilan = 0;

  for (const [tarife, hedefRaw] of Object.entries(tarifeHedefleri)) {
    const hedef = Number(hedefRaw) || 0;
    if (hedef <= 0) continue;
    const kodlar = bransKodlariForTarife(tarife);
    if (kodlar.length === 0) continue;

    let grupRef = 0;
    for (const kod of kodlar) grupRef += brutRef.get(kod) ?? 0;
    brutToplamReferans += grupRef;

    if (grupRef > 0) {
      for (const kod of kodlar) {
        const pay = (brutRef.get(kod) ?? 0) / grupRef;
        const brut = hedef * pay;
        primHedefleri[kod] = (primHedefleri[kod] ?? 0) + brut;
        const brutR = brutRef.get(kod) ?? 0;
        const endR = endRef.get(kod) ?? 0;
        endirektPrim[kod] = (endirektPrim[kod] ?? 0) + (brutR > 0 ? brut * (endR / brutR) : 0);
      }
    } else {
      const pay = 1 / kodlar.length;
      for (const kod of kodlar) {
        primHedefleri[kod] = (primHedefleri[kod] ?? 0) + hedef * pay;
      }
    }
    dagitilan += hedef;
  }

  return {
    primHedefleri,
    endirektPrim,
    kaynak: dagitilan > 0 ? `tarife_ana_${referansYil}` : "mizan_yok",
    referansYil,
    brutToplamReferans,
  };
}
