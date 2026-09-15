/**
 * V3 mali gelir (603 / F38): YTD mizandan, H2 yield-bearing pool × aylık user yield.
 * GT netNakit / collection pattern H2'de kullanılmaz.
 */
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import type { BilancoAylikRow } from "../types";
import { computeMaliGelirPoolPolicy } from "./forecastMaliGelirPoolPolicy";
import type { MaliGelirPoolAnalysis } from "./forecastMaliGelirPoolPolicy";
import { NET_NAK_GT_SATIRLARI, payFromNetNakitMap } from "../v2/netNakitPay";

const MALI_GELIR_SATIRI = 38;

export type V3MaliGelirRollingSonuc = {
  anchorAy: number;
  ytdAySayisi: number;
  tahminBaslangicAy: number;
  /** @deprecated anchorBanka — geriye uyumluluk; totalPool ile aynı. */
  anchorBanka: number;
  anchorBankaKaynak: string;
  poolAnalysis: MaliGelirPoolAnalysis;
  ytdMaliGelir: number;
  tahminMaliGelir: number;
  yillikMaliGelir: number;
  uyarilar: string[];
};

function dagitTahminAylari(
  gt: GelirTablosuSonuc,
  tahminAylik: number[],
  tahminBaslangicIdx: number,
): void {
  const netByBrans = new Map<string, number>();
  for (const b of gt.branslar) {
    let net = 0;
    for (const s of NET_NAK_GT_SATIRLARI) net += b.degerler[s] ?? 0;
    netByBrans.set(b.bransKodu, net);
  }
  const paylar = payFromNetNakitMap(netByBrans);
  const payToplam = [...paylar.values()].reduce((a, p) => a + p, 0);
  const brutToplam = gt.branslar.reduce((a, b) => a + b.brutPrim, 0);

  const sirketSer = [...(gt.aylikToplam[MALI_GELIR_SATIRI] ?? Array(12).fill(0))];
  for (let i = tahminBaslangicIdx; i < 12; i++) {
    sirketSer[i] = tahminAylik[i] ?? 0;
  }
  gt.aylikToplam[MALI_GELIR_SATIRI] = sirketSer;
  gt.toplam[MALI_GELIR_SATIRI] = sirketSer.reduce((a, x) => a + x, 0);

  for (const b of gt.branslar) {
    const pay =
      payToplam > 0
        ? (paylar.get(b.bransKodu) ?? 0)
        : brutToplam > 0
          ? b.brutPrim / brutToplam
          : 0;
    const mevcut = [...(gt.aylikBrans[b.bransKodu]?.[MALI_GELIR_SATIRI] ?? Array(12).fill(0))];
    for (let i = tahminBaslangicIdx; i < 12; i++) {
      mevcut[i] = (tahminAylik[i] ?? 0) * pay;
    }
    if (!gt.aylikBrans[b.bransKodu]) gt.aylikBrans[b.bransKodu] = {};
    gt.aylikBrans[b.bransKodu]![MALI_GELIR_SATIRI] = mevcut;
    b.degerler[MALI_GELIR_SATIRI] = mevcut.reduce((a, x) => a + x, 0);
  }
}

/**
 * Overlay sonrası: 1..anchor YTD mizanda kalır; anchor+1..12 yield-bearing pool × user yield.
 */
export function uygulaMaliGelirRolling(
  gt: GelirTablosuSonuc,
  opts: {
    butceYili: number;
    anchorAy: number;
    bilancoAylik: BilancoAylikRow[];
    aylikGetiriOrani: number[];
  },
): V3MaliGelirRollingSonuc {
  const anchor = Math.min(Math.max(opts.anchorAy, 1), 11);
  const tahminBaslangicIdx = anchor;
  const uyarilar: string[] = [];

  const ytdSer = gt.aylikToplam[MALI_GELIR_SATIRI] ?? Array(12).fill(0);
  const ytdMaliGelir = ytdSer.slice(0, anchor).reduce((a, x) => a + x, 0);

  if (tahminBaslangicIdx >= 12) {
    const emptyPool = computeMaliGelirPoolPolicy({
      butceYili: opts.butceYili,
      anchorAy: anchor,
      bilancoAylik: opts.bilancoAylik,
      aylikGetiriOrani: opts.aylikGetiriOrani,
      tahminBaslangicIdx: 12,
    }).analysis;
    return {
      anchorAy: anchor,
      ytdAySayisi: anchor,
      tahminBaslangicAy: 13,
      anchorBanka: 0,
      anchorBankaKaynak: "—",
      poolAnalysis: emptyPool,
      ytdMaliGelir,
      tahminMaliGelir: 0,
      yillikMaliGelir: ytdMaliGelir,
      uyarilar: ["Tüm aylar mizandan — mali gelir tahmini yok."],
    };
  }

  const { analysis: poolAnalysis, maliGelirAylik: tahminHam, uyarilar: poolUyarilar } =
    computeMaliGelirPoolPolicy({
      butceYili: opts.butceYili,
      anchorAy: anchor,
      bilancoAylik: opts.bilancoAylik,
      aylikGetiriOrani: opts.aylikGetiriOrani,
      tahminBaslangicIdx,
    });
  uyarilar.push(...poolUyarilar);

  dagitTahminAylari(gt, tahminHam, tahminBaslangicIdx);

  const sirketSer = gt.aylikToplam[MALI_GELIR_SATIRI] ?? Array(12).fill(0);
  const tahminMaliGelir = sirketSer.slice(tahminBaslangicIdx).reduce((a, x) => a + x, 0);
  const yillikMaliGelir = sirketSer.reduce((a, x) => a + x, 0);

  const poolEtiket = poolAnalysis.poolItems
    .filter((p) => p.tutar > 0)
    .map((p) => `${p.label} ${Math.round(p.tutar).toLocaleString("tr-TR")}`)
    .join("; ");

  uyarilar.push(
    `603 (F38): ${anchor} ay YTD mizan (${Math.round(ytdMaliGelir).toLocaleString("tr-TR")} TL); ` +
      `${tahminBaslangicIdx + 1}–12. aylar yield-bearing pool (${Math.round(poolAnalysis.totalPool).toLocaleString("tr-TR")} TL) × aylık yield ` +
      `(${Math.round(tahminMaliGelir).toLocaleString("tr-TR")} TL). ${poolEtiket}`,
  );

  return {
    anchorAy: anchor,
    ytdAySayisi: anchor,
    tahminBaslangicAy: tahminBaslangicIdx + 1,
    anchorBanka: poolAnalysis.totalPool,
    anchorBankaKaynak: `${opts.butceYili} ay ${anchor} yield-bearing pool`,
    poolAnalysis,
    ytdMaliGelir,
    tahminMaliGelir,
    yillikMaliGelir,
    uyarilar,
  };
}
