import type { KpkBransSonuc } from "../kpk/kpkMotoru";
import type { KpkDevredenOcak } from "./kpkDevreden";

/** GT KPK bloğu satır numaraları (F21–F30). */
export type KpkGtHucreleri = Record<number, number>;

/**
 * Tek ay için final KPK GT hücreleri — Excel sırası: yapraklar → rollup.
 * F24/F27 mizan devreden; F23/F26/F29 motor rolling stok.
 */
export function buildKpkGtHucreleri(
  kpkBrans: KpkBransSonuc,
  kpkDev: KpkDevredenOcak | undefined,
  ayIndex: number,
): KpkGtHucreleri {
  const gt = kpkBrans.gtAylik;
  const f23 = gt[23]?.[ayIndex] ?? 0;
  const f24 = kpkDev?.satir24 ?? gt[24]?.[ayIndex] ?? 0;
  const f26 = gt[26]?.[ayIndex] ?? 0;
  const f27 = kpkDev?.satir27 ?? gt[27]?.[ayIndex] ?? 0;
  const f29 = gt[29]?.[ayIndex] ?? 0;
  const f30 = gt[30]?.[ayIndex] ?? 0;
  const f22 = f23 + f24;
  const f25 = f26 + f27;
  const f28 = f29 + f30;
  const f21 = f22 + f25 + f28;
  return { 21: f21, 22: f22, 23: f23, 24: f24, 25: f25, 26: f26, 27: f27, 28: f28, 29: f29, 30: f30 };
}
