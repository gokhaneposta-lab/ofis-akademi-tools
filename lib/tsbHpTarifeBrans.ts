/**
 * Prim tarife grubu → gelir tablosu `bransAp` (TSB H/P pivot sayfa adları).
 * GT yalnızca branş diliminde; tarife seçimi eşleşen `bransAp` üzerinden hesaplanır.
 */

import type { TsbGelirTidyRowLike } from "./tsbYatirimGeliriKpi";
import type { SegmentSkorPool } from "./tsbSirketSegmentSkor";

const GT = "GT";
const HAYAT = "HAYAT";
const EMEKLILIK = "EMEKLİLİK";

/** Tarife grubu → gelir-tidy / Excel H/P sayfası */
export const HP_TARIFE_TO_BRANS_AP: Readonly<Record<string, string>> = {
  KASKO: "KASKO",
  TRAFİK: "TRAFİK",
  YANGIN: "YANGIN VE DOĞAL AFETLER",
  DASK: "YANGIN VE DOĞAL AFETLER",
  NAKLİYAT: "NAKLİYAT",
  "FERDİ KAZA": "KAZA",
  "DİĞER KAZA": "KAZA",
  SAĞLIK: "HASTALIK-SAĞLIK",
  HAYAT: "HAYAT",
  MÜHENDİSLİK: "MÜHENDİSLİK SİGORTALARI",
  TARSİM: "DEV. DEST. TARIM SİGORTALARI",
};

const TARIFE_SIRASI_HD = [
  "KASKO",
  "TRAFİK",
  "YANGIN",
  "DASK",
  "NAKLİYAT",
  "FERDİ KAZA",
  "DİĞER KAZA",
  "SAĞLIK",
  "MÜHENDİSLİK",
  "TARSİM",
] as const;

const TARIFE_SIRASI_HAYAT = ["HAYAT"] as const;

export type HpKirisumModu = "bransAp" | "tarifeGrubu";

export type HpTarifeSecenek = {
  value: string;
  label: string;
  bransAp: string;
};

export function bransApForHpTarife(tarifeGrubu: string): string | null {
  return HP_TARIFE_TO_BRANS_AP[tarifeGrubu] ?? null;
}

function bransApPoolUyumlu(bransAp: string, pool: SegmentSkorPool): boolean {
  if (pool === "HD") return bransAp !== HAYAT && bransAp !== EMEKLILIK;
  return bransAp === HAYAT || bransAp === EMEKLILIK;
}

function bransApDonemdeVar(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  bransAp: string,
): boolean {
  for (const r of rows) {
    if (r.donem === donem && r.tabloTip === GT && r.bransAp === bransAp) return true;
  }
  return false;
}

/** Havuz + dönem için tarife grubu listesi (GT dilimi mevcut olanlar). */
export function listHpTarifeGrubuForPool(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  pool: SegmentSkorPool,
): HpTarifeSecenek[] {
  const sirali = pool === "HD" ? TARIFE_SIRASI_HD : TARIFE_SIRASI_HAYAT;
  const out: HpTarifeSecenek[] = [];
  const seen = new Set<string>();

  for (const tarife of sirali) {
    const bransAp = bransApForHpTarife(tarife);
    if (!bransAp || !bransApPoolUyumlu(bransAp, pool)) continue;
    if (!bransApDonemdeVar(rows, donem, bransAp)) continue;
    if (seen.has(tarife)) continue;
    seen.add(tarife);
    out.push({ value: tarife, label: tarife, bransAp });
  }

  for (const [tarife, bransAp] of Object.entries(HP_TARIFE_TO_BRANS_AP)) {
    if (seen.has(tarife)) continue;
    if (!bransApPoolUyumlu(bransAp, pool)) continue;
    if (!bransApDonemdeVar(rows, donem, bransAp)) continue;
    seen.add(tarife);
    out.push({ value: tarife, label: tarife, bransAp });
  }

  return out.sort((a, b) => a.label.localeCompare(b.label, "tr"));
}

export function hpTarifeNotu(tarifeGrubu: string): string | null {
  if (tarifeGrubu === "DASK" || tarifeGrubu === "YANGIN") {
    return "YANGIN ve DASK aynı GT diliminde (Yangın ve Doğal Afetler); H/P aynıdır.";
  }
  if (tarifeGrubu === "FERDİ KAZA" || tarifeGrubu === "DİĞER KAZA") {
    return "Ferdî/Diğer Kaza tarifeleri GT’de KAZA branş diliminde toplanır.";
  }
  return null;
}
