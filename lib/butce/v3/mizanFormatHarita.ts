/**
 * gt_sirket_format.json ↔ GT kod ↔ F satır köprüsü.
 * Mizan karşılaştırması ve hesap ağacı için tek kaynak.
 */
import formatRaw from "../data/gt_sirket_format.json";
import { GT_KOD_TO_SATIR } from "./gtKodHaritasi";

export type FormatSatir = { gtKod: string; hesapKodu: string; hesapAdi: string };

const FORMAT7 = (formatRaw as { format7: FormatSatir[] }).format7;

export const FORMAT7_SATIRLAR: readonly FormatSatir[] = FORMAT7;

/** GT kod → muhasebe hesap kodu. */
export const GT_TO_HESAP: Readonly<Record<string, string>> = (() => {
  const m: Record<string, string> = {};
  for (const r of FORMAT7) {
    if (r.gtKod && r.hesapKodu) m[r.gtKod] = r.hesapKodu;
  }
  return m;
})();

/** Muhasebe hesap → GT kod (ilk eşleşme). */
export const HESAP_TO_GT: Readonly<Record<string, string>> = (() => {
  const m: Record<string, string> = {};
  for (const r of FORMAT7) {
    if (r.gtKod && r.hesapKodu && !(r.hesapKodu in m)) m[r.hesapKodu] = r.gtKod;
  }
  return m;
})();

/** Doğrudan çocuk hesap kodları (format7 ağacı). */
export function hesapCocuklari(parent: string): string[] {
  const all = [...new Set(FORMAT7.map((r) => r.hesapKodu).filter(Boolean))];
  return all.filter((c) => {
    if (c === parent || !c.startsWith(parent)) return false;
    return !all.some(
      (e) => e !== parent && e !== c && e.startsWith(parent) && c.startsWith(e) && e.length > parent.length,
    );
  });
}

/** Doğrudan çocuk GT kodları. */
export function gtCocuklari(parent: string): string[] {
  const all = [...new Set(FORMAT7.map((r) => r.gtKod).filter(Boolean))];
  return all.filter((c) => {
    if (c === parent || !c.startsWith(parent)) return false;
    return !all.some(
      (e) => e !== parent && e !== c && e.startsWith(parent) && c.startsWith(e) && e.length > parent.length,
    );
  });
}

/** GT kod → Excel F satır no (gt_tam_harita; yoksa null). */
export function gtKodToSatir(gtKod: string): number | null {
  return GT_KOD_TO_SATIR[gtKod] ?? null;
}

/** Karşılaştırma için üst düzey hesaplar. */
export const RECON_KOK_HESAPLAR = [
  "600", "601", "602", "605", "603",
  "610", "611", "613", "614", "61401", "61402",
] as const;
