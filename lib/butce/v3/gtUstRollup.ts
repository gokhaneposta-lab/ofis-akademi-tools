/**
 * GT üst satır rollup formülleri — yaprak mizan kilidi sonrası F21, F31, F114… türetimi.
 */
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";

/** gt_excel_harita / ytdFullOverlay ile uyumlu üst formüller. */
export const GT_UST_FORMUL: ReadonlyArray<[number, readonly number[]]> = [
  [10, [11, 19, 20]],
  [22, [23, 24]],
  [25, [26, 27]],
  [28, [29, 30]],
  [21, [22, 25, 28]],
  [32, [33, 34]],
  [35, [36, 37]],
  [31, [32, 35]],
  [95, [96, 105]],
  [115, [116, 126]],
  [136, [137, 147]],
  [114, [115, 136]],
  [157, [158, 161]],
  [166, [167, 168]],
  [178, [180, 181]],
  [177, [178, 189]],
  [196, [197, 198]],
  [176, [177, 190, 191, 192, 193, 194, 196, 200, 201]],
  [9, [10, 21, 31, 86]],
  [94, [95, 114, 157, 166, 176, 202]],
];

export const GT_ROLLUP_PARENTS = new Set(GT_UST_FORMUL.map(([h]) => h));

export function yenileToplamlar(gt: GelirTablosuSonuc, satirlar: readonly number[]): void {
  const tekil = [...new Set(satirlar)];
  for (const satir of tekil) {
    const ser = Array.from({ length: 12 }, (_, ay) => {
      let t = 0;
      for (const b of gt.branslar) {
        t += gt.aylikBrans[b.bransKodu]?.[satir]?.[ay] ?? 0;
      }
      return t;
    });
    gt.aylikToplam[satir] = ser;
    gt.toplam[satir] = ser.reduce((a, x) => a + x, 0);
    for (const b of gt.branslar) {
      const s = gt.aylikBrans[b.bransKodu]?.[satir];
      if (s) b.degerler[satir] = s.reduce((a, x) => a + x, 0);
    }
  }
}

/** Branş bazında üst formülleri yeniden hesapla, ardından şirket toplamı. */
export function yenidenTuretUstFormuller(gt: GelirTablosuSonuc): void {
  for (const b of gt.branslar) {
    const ab = gt.aylikBrans[b.bransKodu];
    if (!ab) continue;
    for (const [hedef, parts] of GT_UST_FORMUL) {
      const ser = Array.from({ length: 12 }, (_, ay) =>
        parts.reduce((s, p) => s + (ab[p]?.[ay] ?? 0), 0),
      );
      ab[hedef] = ser;
      b.degerler[hedef] = ser.reduce((a, x) => a + x, 0);
    }
  }
  yenileToplamlar(
    gt,
    GT_UST_FORMUL.map(([h]) => h),
  );
}
