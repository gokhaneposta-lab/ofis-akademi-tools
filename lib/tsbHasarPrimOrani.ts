/**
 * Brüt / Net Hasar–Prim oranı — Excel Gelir Tablosu satır 185–186 (TSB özet).
 * DERK dahil / hariç dörtlüsü: TSB H/P pivot (GENEL + branş sayfaları).
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

/** DERK (devam eden riskler) — paydadan çıkarılarak “DERK hariç” H/P üretilir. */
export const DERK_PRIM_KODLARI = ["602011", "602012", "602021", "602022"] as const;

export type HasarPrimBransAp = string;

export type HasarPrimOranlari = {
  brutHasarPrimOrani: number | null;
  netHasarPrimOrani: number | null;
};

export type HasarPrimOranlariDetay = HasarPrimOranlari & {
  brutDerkHaric: number | null;
  netDerkHaric: number | null;
  kazanilmisPrimBrut: number;
  kazanilmisPrimNet: number;
  gerceklesenHasarBrut: number;
  gerceklesenHasarNet: number;
};

export type HasarPrimOranOpts = {
  /** `HAYATDISI` = Excel GENEL; belirli branş adı = o branş sayfası (tek `bransAp` dilimi). */
  bransAp?: HasarPrimBransAp;
};

function isOzetHayatdisi(bransAp: HasarPrimBransAp | undefined): boolean {
  return !bransAp || bransAp === HAYATDISI;
}

/** 62… / 63… hayat bloğu: özet modda tüm `bransAp`; branş modunda yalnız seçilen dilim. */
function sumGtKodHp(
  lookup: GelirTidyDonemLookup,
  sirketKodu: number,
  hesapKodu: string,
  bransAp?: HasarPrimBransAp,
): number {
  if (!isOzetHayatdisi(bransAp)) {
    return gelirTidyCell(lookup, sirketKodu, GT, bransAp!, hesapKodu);
  }
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

function sumKodList(
  lookup: GelirTidyDonemLookup,
  sk: number,
  kodlar: readonly string[],
  bransAp?: HasarPrimBransAp,
): number {
  let s = 0;
  for (const k of kodlar) s += sumGtKodHp(lookup, sk, k, bransAp);
  return s;
}

/** Excel: `(pay / payda) * -1` */
function hpOran(pay: number, payda: number): number | null {
  if (payda === 0) return null;
  return (pay / payda) * -1;
}

function hasarPrimHam(
  lookup: GelirTidyDonemLookup,
  sk: number,
  bransAp?: HasarPrimBransAp,
): {
  brutPay: number;
  brutPayda: number;
  netPay: number;
  netPayda: number;
} {
  const brutPay = sumKodList(lookup, sk, BRUT_HASAR_KODLARI, bransAp);
  const brutPayda = sumKodList(lookup, sk, BRUT_PRIM_KODLARI, bransAp);
  const netPay = sumKodList(lookup, sk, NET_HASAR_KODLARI, bransAp);
  const netPayda = sumKodList(lookup, sk, NET_PRIM_KODLARI, bransAp);
  return { brutPay, brutPayda, netPay, netPayda };
}

export function hasarPrimOranlariDetayFromLookup(
  lookup: GelirTidyDonemLookup,
  sirketKodu: number,
  opts: HasarPrimOranOpts = {},
): HasarPrimOranlariDetay {
  const bransAp = opts.bransAp;
  if (!lookup.has(sirketKodu)) {
    return {
      brutHasarPrimOrani: null,
      netHasarPrimOrani: null,
      brutDerkHaric: null,
      netDerkHaric: null,
      kazanilmisPrimBrut: 0,
      kazanilmisPrimNet: 0,
      gerceklesenHasarBrut: 0,
      gerceklesenHasarNet: 0,
    };
  }
  const { brutPay, brutPayda, netPay, netPayda } = hasarPrimHam(lookup, sirketKodu, bransAp);
  const derkBrut = sumKodList(lookup, sirketKodu, DERK_PRIM_KODLARI.filter((k) =>
    (BRUT_PRIM_KODLARI as readonly string[]).includes(k),
  ), bransAp);
  const derkNet = sumKodList(lookup, sirketKodu, DERK_PRIM_KODLARI, bransAp);
  const brutPaydaDerkHaric = brutPayda - derkBrut;
  const netPaydaDerkHaric = netPayda - derkNet;

  return {
    kazanilmisPrimBrut: brutPayda,
    kazanilmisPrimNet: netPayda,
    gerceklesenHasarBrut: brutPay,
    gerceklesenHasarNet: netPay,
    brutHasarPrimOrani: hpOran(brutPay, brutPayda),
    netHasarPrimOrani: hpOran(netPay, netPayda),
    brutDerkHaric: hpOran(brutPay, brutPaydaDerkHaric),
    netDerkHaric: hpOran(netPay, netPaydaDerkHaric),
  };
}

export function hasarPrimOranlariFromLookup(
  lookup: GelirTidyDonemLookup,
  sirketKodu: number,
  opts: HasarPrimOranOpts = {},
): HasarPrimOranlari {
  const d = hasarPrimOranlariDetayFromLookup(lookup, sirketKodu, opts);
  return {
    brutHasarPrimOrani: d.brutHasarPrimOrani,
    netHasarPrimOrani: d.netHasarPrimOrani,
  };
}

/** Sektör: tüm peer’larda pay ve payda ayrı toplanır (Σ/Σ), şirket ortalaması değil. */
export function hasarPrimOranlariDetaySektorFromLookup(
  lookup: GelirTidyDonemLookup,
  peerKodlari: number[],
  opts: HasarPrimOranOpts = {},
): HasarPrimOranlariDetay {
  let brutPay = 0;
  let brutPayda = 0;
  let netPay = 0;
  let netPayda = 0;
  let derkBrut = 0;
  let derkNet = 0;
  for (const sk of peerKodlari) {
    if (!lookup.has(sk)) continue;
    const h = hasarPrimHam(lookup, sk, opts.bransAp);
    brutPay += h.brutPay;
    brutPayda += h.brutPayda;
    netPay += h.netPay;
    netPayda += h.netPayda;
    derkBrut += sumKodList(
      lookup,
      sk,
      DERK_PRIM_KODLARI.filter((k) => (BRUT_PRIM_KODLARI as readonly string[]).includes(k)),
      opts.bransAp,
    );
    derkNet += sumKodList(lookup, sk, DERK_PRIM_KODLARI, opts.bransAp);
  }
  const brutPaydaDerkHaric = brutPayda - derkBrut;
  const netPaydaDerkHaric = netPayda - derkNet;
  return {
    kazanilmisPrimBrut: brutPayda,
    kazanilmisPrimNet: netPayda,
    gerceklesenHasarBrut: brutPay,
    gerceklesenHasarNet: netPay,
    brutHasarPrimOrani: hpOran(brutPay, brutPayda),
    netHasarPrimOrani: hpOran(netPay, netPayda),
    brutDerkHaric: hpOran(brutPay, brutPaydaDerkHaric),
    netDerkHaric: hpOran(netPay, netPaydaDerkHaric),
  };
}

export function hasarPrimOranlariSektorFromLookup(
  lookup: GelirTidyDonemLookup,
  peerKodlari: number[],
  opts: HasarPrimOranOpts = {},
): HasarPrimOranlari {
  const d = hasarPrimOranlariDetaySektorFromLookup(lookup, peerKodlari, opts);
  return {
    brutHasarPrimOrani: d.brutHasarPrimOrani,
    netHasarPrimOrani: d.netHasarPrimOrani,
  };
}
