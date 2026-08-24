import { GT_TO_MIZAN_HESAP } from "./aylikMizanBridge";
import { normHesapKodu } from "./hesapAgregasyon";
import { normalizeBransKodu } from "../textUtils";
import type { MizanAylikRow, MizanRow } from "../types";

/** YE oran pay/baz'ı mizan hesabı bekler; aylık GT'de 0251/02571 olarak gelir. */
const YE_GT_OVERLAY = new Set(["0251", "02571"]);

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
  const out: MizanRow[] = [];
  for (const r of best.values()) {
    const hesap = String(r.hesap).replace(/\.0$/, "");
    const bransKodu = normalizeBransKodu(r.bransKodu);
    const row: MizanRow = { yil: r.yil, hesap, bransKodu, tutar: r.tutar };
    out.push(row);
    if (YE_GT_OVERLAY.has(hesap)) {
      const mapped = GT_TO_MIZAN_HESAP[hesap];
      if (mapped && mapped !== hesap) {
        out.push({ ...row, hesap: mapped });
      }
    }
  }
  return out;
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
