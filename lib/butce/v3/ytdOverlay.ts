import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import type { MizanAylikRow } from "../types";
import { extractMizanGtAylik, ytdToplam } from "./mizanGtExtract";
import { V3_DEFAULT_YTD_ANCHOR } from "./metodoloji";
import type { V3KalibrasyonSatir } from "./types";

/** Yıllık tarife hedefini korumak için H2 ölçeklenen satırlar. */
const RESCALE_TO_ANNUAL = new Set<number>([11]);

/** Kullanıcı girdisi — YTD mizandan gelmez (yalnızca mali gelir). */
const MIZAN_DISI_SATIRLAR = new Set<number>([38]);

/** Kalibrasyon raporu. */
const KALIBRASYON_SATIRLARI: ReadonlyArray<{ satir: number; ad: string }> = [
  { satir: 11, ad: "Brüt yazılan prim (60001)" },
  { satir: 21, ad: "KPK değişimi (601)" },
  { satir: 96, ad: "Brüt ödenen hasar (61001)" },
  { satir: 114, ad: "Muallak (611)" },
  { satir: 115, ad: "Brüt muallak değişim (61101)" },
  { satir: 164, ad: "Dengeleme (613 / 024)" },
  { satir: 177, ad: "Üretim komisyon (61401)" },
  { satir: 9, ad: "Teknik gelir (F9)" },
  { satir: 94, ad: "Teknik gider (F94)" },
  { satir: 9003, ad: "Safi TKZ" },
];

function yenileToplamlar(gt: GelirTablosuSonuc, satirlar: readonly number[]): void {
  for (const satir of satirlar) {
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

export function detectYtdAnchorAy(
  mizanAylikFull: MizanAylikRow[],
  butceYili: number,
  preferredAy: number = V3_DEFAULT_YTD_ANCHOR,
): { anchorAy: number; maxAvailable: number | null; preferredUsed: boolean } {
  const preferred = Math.min(Math.max(preferredAy, 1), 11);
  let maxAvailable: number | null = null;
  const months = new Set<number>();
  for (const r of mizanAylikFull) {
    if (r.yil !== butceYili) continue;
    if (String(r.hesap) !== "0111") continue;
    if (Math.abs(r.tutar) < 1) continue;
    if (r.ay >= 1 && r.ay <= 11) months.add(r.ay);
  }
  if (months.size > 0) maxAvailable = Math.max(...months);
  if (maxAvailable == null) return { anchorAy: preferred, maxAvailable: null, preferredUsed: true };
  if (months.has(preferred)) return { anchorAy: preferred, maxAvailable, preferredUsed: true };
  return { anchorAy: Math.min(maxAvailable, preferred), maxAvailable, preferredUsed: false };
}

/**
 * Anchor ayına kadar: mizan-aylik-full birebir (şirket + branş).
 * Sonrası: motor projeksiyonu (F11 H2 rescale).
 */
export function uygulaYtdOverlay(
  gt: GelirTablosuSonuc,
  mizanAylikFull: MizanAylikRow[],
  butceYili: number,
  anchorAy: number,
): { gt: GelirTablosuSonuc; kalibrasyon: V3KalibrasyonSatir[] } {
  const anchor = Math.min(Math.max(anchorAy, 1), 11);
  const mizan = extractMizanGtAylik(mizanAylikFull, butceYili);
  const kalibrasyon: V3KalibrasyonSatir[] = [];

  if (mizan.sirketSatir.size === 0) {
    return { gt, kalibrasyon };
  }

  const ytdOnce = new Map<number, number>();
  for (const { satir } of KALIBRASYON_SATIRLARI) {
    ytdOnce.set(satir, ytdToplam(gt.aylikToplam[satir], anchor));
  }

  const kilitleSatirlar = new Set<number>();
  for (const [satir] of mizan.sirketSatir) {
    if (!MIZAN_DISI_SATIRLAR.has(satir)) kilitleSatirlar.add(satir);
  }

  // 1) Şirket toplamı — YTD ayları mizandan (TÜM branşlar)
  for (const [satir, mizanSer] of mizan.sirketSatir) {
    if (MIZAN_DISI_SATIRLAR.has(satir)) continue;
    if (!gt.aylikToplam[satir]) gt.aylikToplam[satir] = Array(12).fill(0);
    const ser = [...gt.aylikToplam[satir]!];
    for (let ay = 0; ay < anchor; ay++) ser[ay] = mizanSer[ay] ?? 0;
    gt.aylikToplam[satir] = ser;
    gt.toplam[satir] = ser.reduce((a, x) => a + x, 0);
  }

  // 2) Branş kırılımı — mizanda olan branşlar
  for (const b of gt.branslar) {
    const bm = mizan.bransSatir.get(b.bransKodu);
    if (!bm) continue;
    const ab = gt.aylikBrans[b.bransKodu] ?? {};

    for (const [satir, mizanSer] of bm) {
      if (MIZAN_DISI_SATIRLAR.has(satir)) continue;
      const ser = [...(ab[satir] ?? Array(12).fill(0))];
      for (let ay = 0; ay < anchor; ay++) ser[ay] = mizanSer[ay] ?? 0;
      ab[satir] = ser;
    }

    // F11 H2 rescale (yıllık hedef)
    if (ab[11] && RESCALE_TO_ANNUAL.has(11)) {
      const ser = [...ab[11]!];
      const yillikHedef = b.degerler[11] ?? gt.toplam[11] ?? 0;
      const ytdGercek = ser.slice(0, anchor).reduce((a, x) => a + x, 0);
      const kalan = yillikHedef - ytdGercek;
      const mevcutKalan = ser.slice(anchor).reduce((a, x) => a + x, 0);
      if (kalan < 0) {
        for (let ay = anchor; ay < 12; ay++) ser[ay] = 0;
      } else if (mevcutKalan > 0) {
        const carpan = kalan / mevcutKalan;
        for (let ay = anchor; ay < 12; ay++) ser[ay] = (ser[ay] ?? 0) * carpan;
      } else if (kalan !== 0) {
        const n = 12 - anchor;
        for (let ay = anchor; ay < 12; ay++) ser[ay] = kalan / n;
      }
      ab[11] = ser;
    }

    for (const satir of gt.satirlar.map((s) => s.satir)) {
      const s = ab[satir];
      if (s) b.degerler[satir] = s.reduce((a, x) => a + x, 0);
    }
    gt.aylikBrans[b.bransKodu] = ab;
  }

  // F11 şirket H2 branş toplamından
  if (gt.aylikToplam[11]) {
    const top = [...gt.aylikToplam[11]!];
    for (let ay = anchor; ay < 12; ay++) {
      let t = 0;
      for (const bb of gt.branslar) t += gt.aylikBrans[bb.bransKodu]?.[11]?.[ay] ?? 0;
      top[ay] = t;
    }
    gt.aylikToplam[11] = top;
    gt.toplam[11] = top.reduce((a, x) => a + x, 0);
  }

  // Branş rollup sonrası YTD şirket satırlarını mizana geri kilitle
  yenileToplamlar(gt, [...kilitleSatirlar]);
  for (const [satir, mizanSer] of mizan.sirketSatir) {
    if (MIZAN_DISI_SATIRLAR.has(satir)) continue;
    if (!gt.aylikToplam[satir]) continue;
    const ser = [...gt.aylikToplam[satir]!];
    for (let ay = 0; ay < anchor; ay++) ser[ay] = mizanSer[ay] ?? 0;
    gt.aylikToplam[satir] = ser;
    gt.toplam[satir] = ser.reduce((a, x) => a + x, 0);
  }

  for (const { satir, ad } of KALIBRASYON_SATIRLARI) {
    const ytdTahmin = ytdOnce.get(satir) ?? 0;
    const ytdGercek = ytdToplam(gt.aylikToplam[satir], anchor);
    const sapma =
      Math.abs(ytdTahmin) > 1 ? ((ytdGercek - ytdTahmin) / Math.abs(ytdTahmin)) * 100 : null;
    kalibrasyon.push({
      satir,
      ad,
      ytdTahmin,
      ytdGercek,
      sapmaPct: sapma,
      uygulananCarpan: ytdTahmin !== 0 ? ytdGercek / ytdTahmin : 1,
    });
  }

  return { gt, kalibrasyon };
}
