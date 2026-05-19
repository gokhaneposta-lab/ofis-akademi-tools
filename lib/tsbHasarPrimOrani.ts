/**
 * Brüt / Net Hasar–Prim oranı — Excel Gelir Tablosu satır 185–186 (TSB özet).
 * `docs/tsb-kpi-tanimlari.md` §5
 */

import { gelirTidyCell, type GelirTidyDonemLookup } from "./tsbSirketSegmentSkor";

const GT = "GT";
const HAYATDISI = "HAYATDISI";

/** Satır 185 — pay (hasar) */
const BRUT_HASAR_KODLARI = ["61001", "611011", "611012", "63001", "631011", "631012"] as const;

/** Satır 185 — payda (prim + teknik karşılık kalemleri) */
const BRUT_PRIM_KODLARI = [
  "60001",
  "601011",
  "601012",
  "60003",
  "601031",
  "601032",
  "602011",
  "602012",
  "62001",
  "621011",
  "621012",
  "622011",
  "622012",
] as const;

/** Satır 186 — pay (net hasar) */
const NET_HASAR_KODLARI = [
  "61001",
  "61002",
  "611011",
  "611021",
  "611012",
  "611022",
  "63001",
  "63002",
  "631011",
  "631021",
  "631012",
  "631022",
] as const;

/** Satır 186 — payda (net prim + karşılıklar) */
const NET_PRIM_KODLARI = [
  "60001",
  "60002",
  "60003",
  "601011",
  "601021",
  "601012",
  "601022",
  "601031",
  "601032",
  "602011",
  "602021",
  "602012",
  "602022",
  "62001",
  "62002",
  "621011",
  "621021",
  "621012",
  "621022",
  "622011",
  "622021",
  "622012",
  "622022",
] as const;

/** 62… / 63… hayat bloğu: tüm `bransAp`; diğer kodlar yalnız `HAYATDISI`. */
function sumGtKodHp(lookup: GelirTidyDonemLookup, sirketKodu: number, hesapKodu: string): number {
  if (hesapKodu.startsWith("62") || hesapKodu.startsWith("63")) {
    const inner = lookup.get(sirketKodu);
    if (!inner) return 0;
    let s = 0;
    for (const [key, val] of inner) {
      if (!key.startsWith(`${GT}|`)) continue;
      const parts = key.split("|");
      if (parts[2] === hesapKodu) s += val;
    }
    return s;
  }
  return gelirTidyCell(lookup, sirketKodu, GT, HAYATDISI, hesapKodu);
}

function sumKodList(lookup: GelirTidyDonemLookup, sk: number, kodlar: readonly string[]): number {
  let s = 0;
  for (const k of kodlar) s += sumGtKodHp(lookup, sk, k);
  return s;
}

/** Excel: `(pay / payda) * -1` */
function hpOran(pay: number, payda: number): number | null {
  if (payda === 0) return null;
  return (pay / payda) * -1;
}

export type HasarPrimOranlari = {
  brutHasarPrimOrani: number | null;
  netHasarPrimOrani: number | null;
};

export function hasarPrimOranlariFromLookup(
  lookup: GelirTidyDonemLookup,
  sirketKodu: number,
): HasarPrimOranlari {
  if (!lookup.has(sirketKodu)) {
    return { brutHasarPrimOrani: null, netHasarPrimOrani: null };
  }
  const brutPay = sumKodList(lookup, sirketKodu, BRUT_HASAR_KODLARI);
  const brutPayda = sumKodList(lookup, sirketKodu, BRUT_PRIM_KODLARI);
  const netPay = sumKodList(lookup, sirketKodu, NET_HASAR_KODLARI);
  const netPayda = sumKodList(lookup, sirketKodu, NET_PRIM_KODLARI);
  return {
    brutHasarPrimOrani: hpOran(brutPay, brutPayda),
    netHasarPrimOrani: hpOran(netPay, netPayda),
  };
}

/** Sektör: tüm peer’larda pay ve payda ayrı toplanır (Σ/Σ), şirket ortalaması değil. */
export function hasarPrimOranlariSektorFromLookup(
  lookup: GelirTidyDonemLookup,
  peerKodlari: number[],
): HasarPrimOranlari {
  let brutPay = 0;
  let brutPayda = 0;
  let netPay = 0;
  let netPayda = 0;
  for (const sk of peerKodlari) {
    if (!lookup.has(sk)) continue;
    brutPay += sumKodList(lookup, sk, BRUT_HASAR_KODLARI);
    brutPayda += sumKodList(lookup, sk, BRUT_PRIM_KODLARI);
    netPay += sumKodList(lookup, sk, NET_HASAR_KODLARI);
    netPayda += sumKodList(lookup, sk, NET_PRIM_KODLARI);
  }
  return {
    brutHasarPrimOrani: hpOran(brutPay, brutPayda),
    netHasarPrimOrani: hpOran(netPay, netPayda),
  };
}
