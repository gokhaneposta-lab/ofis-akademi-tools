/**
 * GT üst satır rollup — yalnızca KPK / DERK / muallak / prim / hasar ağacı.
 * 61401 (F177), 614071 (F196), genel gider yaprakları mizandan gelir; rollup ile EZİLMEZ.
 */
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";

/** Güvenli rollup: alt yapraklar dolu olduğunda ebeveyn türetilir. */
export const GT_YAPRAK_ROLLUP_FORMUL: ReadonlyArray<[number, readonly number[]]> = [
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
];

export const GT_YAPRAK_ROLLUP_PARENTS = new Set(GT_YAPRAK_ROLLUP_FORMUL.map(([h]) => h));

/**
 * Mizandan doğrudan kilitlenen satırlar — rollup sonrası YTD geri yüklenir.
 * (Komisyon, faaliyet gideri, brüt hasar/prim yaprakları.)
 */
export const MIZAN_DOGRUDAN_YAPRAK = new Set<number>([
  11, 19, 20, 86, 38, 96, 105, 177, 196, 200, 201, 190, 191, 192, 193, 194, 202,
  23, 24, 26, 27, 29, 30, 33, 34, 36, 37, 116, 126, 137, 147, 167,
]);

/** @deprecated Tam ağaç rollup — komisyon satırlarını sıfırlar; kullanma. */
export const GT_UST_FORMUL = GT_YAPRAK_ROLLUP_FORMUL;

export const GT_ROLLUP_PARENTS = GT_YAPRAK_ROLLUP_PARENTS;

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

export function yenidenTuretUstFormuller(
  gt: GelirTablosuSonuc,
  formul: ReadonlyArray<[number, readonly number[]]> = GT_YAPRAK_ROLLUP_FORMUL,
): void {
  for (const b of gt.branslar) {
    const ab = gt.aylikBrans[b.bransKodu];
    if (!ab) continue;
    for (const [hedef, parts] of formul) {
      const ser = Array.from({ length: 12 }, (_, ay) =>
        parts.reduce((s, p) => s + (ab[p]?.[ay] ?? 0), 0),
      );
      ab[hedef] = ser;
      b.degerler[hedef] = ser.reduce((a, x) => a + x, 0);
    }
  }
  yenileToplamlar(gt, formul.map(([h]) => h));
}

/** Rollup sonrası mizan YTD yapraklarını branş serilerine geri yükle. */
export function geriYukleMizanYtdYapraklar(
  gt: GelirTablosuSonuc,
  bransSatir: Map<string, Map<number, number[]>>,
  anchorAy: number,
): void {
  const anchor = Math.min(Math.max(anchorAy, 1), 11);
  for (const b of gt.branslar) {
    const bm = bransSatir.get(b.bransKodu);
    if (!bm) continue;
    const ab = gt.aylikBrans[b.bransKodu] ?? {};
    for (const [satir, mizanSer] of bm) {
      if (!MIZAN_DOGRUDAN_YAPRAK.has(satir)) continue;
      const ser = [...(ab[satir] ?? Array(12).fill(0))];
      for (let ay = 0; ay < anchor; ay++) ser[ay] = mizanSer[ay] ?? 0;
      ab[satir] = ser;
      b.degerler[satir] = ser.reduce((a, x) => a + x, 0);
    }
    gt.aylikBrans[b.bransKodu] = ab;
  }
}

type MizanSatirHarita = {
  bransSatir: Map<string, Map<number, number[]>>;
  sirketSatir: Map<number, number[]>;
};

/**
 * Rollup sonrası Ocak–anchor YTD: mizandaki tüm satırları branş + şirket düzeyinde geri yükle.
 * Üst satırlar (60101/F22, 610/F95…) branş rollup ile ezilmesin diye H2 adımından sonra da çağrılır.
 */
export function geriYukleMizanYtdTam(
  gt: GelirTablosuSonuc,
  mizan: MizanSatirHarita,
  anchorAy: number,
  disiSatirlar: ReadonlySet<number> = new Set(),
): void {
  const anchor = Math.min(Math.max(anchorAy, 1), 11);

  for (const b of gt.branslar) {
    const bm = mizan.bransSatir.get(b.bransKodu);
    if (!bm) continue;
    const ab = gt.aylikBrans[b.bransKodu] ?? {};
    for (const [satir, mizanSer] of bm) {
      if (disiSatirlar.has(satir)) continue;
      const ser = [...(ab[satir] ?? Array(12).fill(0))];
      for (let ay = 0; ay < anchor; ay++) ser[ay] = mizanSer[ay] ?? 0;
      ab[satir] = ser;
      b.degerler[satir] = ser.reduce((a, x) => a + x, 0);
    }
    gt.aylikBrans[b.bransKodu] = ab;
  }

  for (const [satir, mizanSer] of mizan.sirketSatir) {
    if (disiSatirlar.has(satir)) continue;
    if (!gt.aylikToplam[satir]) gt.aylikToplam[satir] = Array(12).fill(0);
    const ser = [...gt.aylikToplam[satir]!];
    for (let ay = 0; ay < anchor; ay++) ser[ay] = mizanSer[ay] ?? 0;
    gt.aylikToplam[satir] = ser;
    gt.toplam[satir] = ser.reduce((a, x) => a + x, 0);
  }
}
