/**
 * V3 mali gelir (603 / F38): YTD mizandan, kalan aylar anchor ay banka bakiyesinden proxy.
 * Bilanço satırları (102/100/10) GT ile aynı mizan yüklemesinden gelir (bilanco-aylik.json).
 */
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import type { BilancoAylikRow } from "../types";
import {
  buildMaliGelirForecastFromBank,
  resolveAnchorBanka,
} from "../v2/maliGelirProxy";
import { NET_NAK_GT_SATIRLARI, payFromNetNakitMap } from "../v2/netNakitPay";

const MALI_GELIR_SATIRI = 38;

export type V3MaliGelirRollingSonuc = {
  anchorAy: number;
  ytdAySayisi: number;
  tahminBaslangicAy: number;
  anchorBanka: number;
  anchorBankaKaynak: string;
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
 * Overlay sonrası: 1..anchor YTD mizanda kalır; anchor+1..12 anchor banka + getiri proxy.
 * anchorAy: kilitli son ay (1=Ocak … 9=Eylül → Ocak–Eylül mizan, Ekim–Aralık tahmin).
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
    return {
      anchorAy: anchor,
      ytdAySayisi: anchor,
      tahminBaslangicAy: 13,
      anchorBanka: 0,
      anchorBankaKaynak: "—",
      ytdMaliGelir,
      tahminMaliGelir: 0,
      yillikMaliGelir: ytdMaliGelir,
      uyarilar: ["Tüm aylar mizandan — mali gelir tahmini yok."],
    };
  }

  const bank = resolveAnchorBanka({
    butceYili: opts.butceYili,
    anchorAy: anchor,
    bilancoAylik: opts.bilancoAylik,
  });
  if (bank.uyari) uyarilar.push(bank.uyari);

  const { maliGelirAylik: tahminHam, uyarilar: forecastUyarilar } =
    buildMaliGelirForecastFromBank({
      aylikToplam: gt.aylikToplam,
      aylikGetiriOrani: opts.aylikGetiriOrani,
      acilisBanka: bank.tutar,
      tahminBaslangicIdx,
    });
  uyarilar.push(...forecastUyarilar);

  dagitTahminAylari(gt, tahminHam, tahminBaslangicIdx);

  const sirketSer = gt.aylikToplam[MALI_GELIR_SATIRI] ?? Array(12).fill(0);
  const tahminMaliGelir = sirketSer.slice(tahminBaslangicIdx).reduce((a, x) => a + x, 0);
  const yillikMaliGelir = sirketSer.reduce((a, x) => a + x, 0);

  uyarilar.push(
    `603 (F38): ${anchor} ay YTD mizan (${Math.round(ytdMaliGelir).toLocaleString("tr-TR")} TL); ` +
      `${tahminBaslangicIdx + 1}–12. aylar ${bank.kaynakEtiket} üzerinden proxy ` +
      `(${Math.round(tahminMaliGelir).toLocaleString("tr-TR")} TL).`,
  );

  return {
    anchorAy: anchor,
    ytdAySayisi: anchor,
    tahminBaslangicAy: tahminBaslangicIdx + 1,
    anchorBanka: bank.tutar,
    anchorBankaKaynak: bank.kaynakEtiket,
    ytdMaliGelir,
    tahminMaliGelir,
    yillikMaliGelir,
    uyarilar,
  };
}
