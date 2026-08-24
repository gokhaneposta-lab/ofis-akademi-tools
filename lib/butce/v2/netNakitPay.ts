/**
 * Net nakit akışı payı — 603 / F38 / 014 dağılımı.
 * Net nakit = net yazılan prim + net ödenen hasar (hasar işaretli negatif).
 * Negatif net nakit (hasar ≥ prim) → pay 0.
 */

/** GT: F10 (net yazılan prim) + F95 (net ödenen hasar). */
export const NET_NAK_GT_SATIRLARI = [10, 95] as const;

/** Mizan: 60001+60002 (net prim) + 61001+61002 (net hasar). */
export const NET_NAK_MIZAN_HESAPLARI = ["60001", "60002", "61001", "61002"] as const;

export function pozitifNetNakit(net: number): number {
  return net > 0 ? net : 0;
}

/** Branş net nakitlerinden (ham) pay map üretir; negatifler 0. */
export function payFromNetNakitMap(
  netByBrans: Map<string, number> | Record<string, number>,
): Map<string, number> {
  const entries =
    netByBrans instanceof Map ? [...netByBrans.entries()] : Object.entries(netByBrans);
  let toplam = 0;
  const pozitif = new Map<string, number>();
  for (const [k, v] of entries) {
    const p = pozitifNetNakit(Number(v) || 0);
    pozitif.set(k, p);
    toplam += p;
  }
  const shares = new Map<string, number>();
  for (const [k, p] of pozitif) {
    shares.set(k, toplam > 0 ? p / toplam : 0);
  }
  return shares;
}
