import { KPK_SGK_KPK_CARI_ORAN } from "../config/constants";
import type { KpkBransSonuc } from "../kpk/kpkMotoru";
import type { KpkDevredenOcak } from "./kpkDevreden";

/** GT KPK bloğu satır numaraları (F21–F30). */
export type KpkGtHucreleri = Record<number, number>;

/**
 * Tek ay için final KPK GT hücreleri — Excel sırası: yapraklar → rollup.
 * F24/F27 devreden (tüm branş); F29/F30 yalnızca 715 (SGK KPK).
 */
export function buildKpkGtHucreleri(
  kpkBrans: KpkBransSonuc,
  kpkDev: KpkDevredenOcak | undefined,
  ayIndex: number,
): KpkGtHucreleri {
  const gt = kpkBrans.gtAylik;
  const sgk715 = kpkBrans.bransKodu === "715";
  const f23 = gt[23]?.[ayIndex] ?? 0;
  const f24 = kpkDev != null ? kpkDev.satir24 : (gt[24]?.[ayIndex] ?? 0);
  const f26 = gt[26]?.[ayIndex] ?? 0;
  const f27 = kpkDev != null ? kpkDev.satir27 : (gt[27]?.[ayIndex] ?? 0);
  /** 601031: Trafik cari KPK tutarının %8 SGK payı, GT gider işaretiyle. */
  const f29 = sgk715 ? -f23 * KPK_SGK_KPK_CARI_ORAN : (gt[29]?.[ayIndex] ?? 0);
  const f30 =
    sgk715 && kpkDev != null ? kpkDev.satir30 : sgk715 ? (gt[30]?.[ayIndex] ?? 0) : 0;
  const f22 = f23 + f24;
  const f25 = f26 + f27;
  const f28 = f29 + f30;
  const f21 = f22 + f25 + f28;
  return { 21: f21, 22: f22, 23: f23, 24: f24, 25: f25, 26: f26, 27: f27, 28: f28, 29: f29, 30: f30 };
}
