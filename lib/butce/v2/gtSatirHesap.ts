import gtHaritaRaw from "../data/gt_excel_harita.json";
import { GT_TO_MIZAN_HESAP } from "../oran/aylikMizanBridge";

type Harita = { tum_satirlar: Array<{ satir: number; kod?: string | null }> };

/** GT satır kodunun mizan karşılığı (haritada olmayan yaygın kodlar). */
const EK_GT_TO_MIZAN: Readonly<Record<string, string>> = {
  "014": "60301",
  "0251": "61401",
  "0253": "61403",
  "0254": "61404",
  "0255": "61405",
  "0256": "61406",
};

const SATIR_GT_KOD: ReadonlyMap<number, string> = (() => {
  const m = new Map<number, string>();
  for (const c of (gtHaritaRaw as Harita).tum_satirlar) {
    const kod = String(c.kod ?? "").trim();
    if (kod) m.set(c.satir, kod);
  }
  return m;
})();

export function gtKodForSatir(satir: number): string {
  return SATIR_GT_KOD.get(satir) ?? "";
}

/** Şirket mizan hesabı — örn. 60001 (Brüt yazılan prim). */
export function mizanHesapForSatir(satir: number): string {
  const gt = gtKodForSatir(satir);
  if (!gt) return "";
  return GT_TO_MIZAN_HESAP[gt] ?? EK_GT_TO_MIZAN[gt] ?? gt;
}

/** Branşlı GT hesap — örn. 7010111. */
export function bransHesapForSatir(bransKodu: string, satir: number): string {
  const gt = gtKodForSatir(satir);
  if (!gt || !/^7\d{2}$/.test(bransKodu)) return "";
  return `${bransKodu}${gt}`;
}
