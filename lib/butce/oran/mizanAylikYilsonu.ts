import { normHesapKodu } from "./hesapAgregasyon";
import { normalizeBransKodu } from "../textUtils";
import type { MizanAylikRow, MizanRow } from "../types";

/**
 * MIZAN_AY (kümülatif) → yılsonu snapshot: her yıl×branş×hesap için en son ay.
 * Aylık GT import: hesap = GT kodu (02571), branş = 701 — yıllık bridge MIZAN'da yok.
 */
export function yilsonuMizanFromAylik(rows: MizanAylikRow[]): MizanRow[] {
  const best = new Map<string, MizanAylikRow>();
  for (const r of rows) {
    const br = normalizeBransKodu(r.bransKodu);
    if (!br || br === "TOPLAM") continue;
    const k = `${r.yil}|${br}|${normHesapKodu(r.hesap)}`;
    const cur = best.get(k);
    if (!cur || r.ay > cur.ay) best.set(k, r);
  }
  return [...best.values()].map(({ yil, hesap, bransKodu, tutar }) => ({
    yil,
    hesap: String(hesap).replace(/\.0$/, ""),
    bransKodu: normalizeBransKodu(bransKodu),
    tutar,
  }));
}

/** Yıllık MIZAN + aylık GT yılsonu; aynı anahtarda aylık satır öncelikli (02571 vb.). */
export function mergeMizanYillikVeAylik(yillik: MizanRow[], aylikFull: MizanAylikRow[]): MizanRow[] {
  const snap = yilsonuMizanFromAylik(aylikFull);
  if (snap.length === 0) return yillik;

  const key = (r: MizanRow) => `${r.yil}|${normalizeBransKodu(r.bransKodu)}|${normHesapKodu(r.hesap)}`;
  const map = new Map<string, MizanRow>();
  for (const r of yillik) map.set(key(r), r);
  for (const r of snap) map.set(key(r), r);
  return [...map.values()];
}
