/**
 * Aylık GT mizan satırlarını (0111, 0211, …) oran motorunun beklediği
 * mizan hesap kodlarına (60001, 61001, …) çevirir.
 */
import type { MizanAylikRow, MizanRow } from "../types";
import { normalizeBransKodu } from "../textUtils";

/** GT kodu → mizan hesap (aylikGtBilancoImport BRIDGE_SINGLE tersi + komisyon yaprakları). */
export const GT_TO_MIZAN_HESAP: Readonly<Record<string, string>> = {
  "0111": "60001",
  "01111": "600011",
  "01112": "600012",
  "0112": "60002",
  "0113": "60003",
  "011": "600",
  "0121": "60101",
  "0131": "60201",
  "0141": "60301",
  "0211": "61001",
  "0212": "61002",
  "0221": "61101",
  "0222": "61102",
  "022": "611",
  "02211": "611011",
  "02212": "611012",
  "02221": "611021",
  "02222": "611022",
  "016": "605",
  "0252": "61402",
  "0258": "61408",
  "0259": "61409",
  // YE recon ile doğrulanmış komisyon yaprakları
  "0251101010101": "6140110101",
  "0251101010102": "6140110102",
  "0251199": "61401199",
  "02511": "614011",
};

/** brans_gt eşleşmesi için olduğu gibi bırakılan GT kodları */
const BRANS_GT_PASSTHROUGH = new Set(["02571", "0112"]);

/**
 * Belirli yıl×ay kümülatif snapshot → MizanRow[] (mizan hesap kodlarıyla).
 */
export function aylikKumulatifMizanSnapshot(
  aylik: MizanAylikRow[],
  yil: number,
  ay: number,
): MizanRow[] {
  const out: MizanRow[] = [];
  for (const r of aylik) {
    if (r.yil !== yil || r.ay !== ay) continue;
    const br = normalizeBransKodu(r.bransKodu);
    if (!br || br === "TOPLAM") continue;
    const gt = String(r.hesap);
    const mizanHesap = GT_TO_MIZAN_HESAP[gt];
    if (mizanHesap) {
      out.push({ yil, hesap: mizanHesap, bransKodu: br, tutar: Number(r.tutar) || 0 });
    }
    if (BRANS_GT_PASSTHROUGH.has(gt)) {
      out.push({ yil, hesap: gt, bransKodu: br, tutar: Number(r.tutar) || 0 });
    }
  }
  return out;
}
