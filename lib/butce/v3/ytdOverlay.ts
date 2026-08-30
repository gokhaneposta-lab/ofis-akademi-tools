import { normalizeBransKodu } from "../textUtils";
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import type { MizanAylikRow } from "../types";
import { V3_DEFAULT_YTD_ANCHOR, V3_YTD_KILIT_SATIRLARI } from "./metodoloji";
import type { V3KalibrasyonSatir } from "./types";

/** GT kodu → GT satır no — YTD overlay yaprakları. */
const GT_KOD_TO_SATIR: Readonly<Record<string, number>> = {
  "0111": 11,
  "0112": 19,
  "0113": 20,
  "0211": 96,
  "0212": 105,
  "016": 86,
};

/** Yıllık tarife hedefini korumak için H2 ölçeklenen satırlar. */
const RESCALE_TO_ANNUAL = new Set<number>([11]);

function kumulToIncremental(kumul: number[]): number[] {
  const out: number[] = [];
  let prev = 0;
  for (let i = 0; i < 12; i++) {
    const v = kumul[i] ?? 0;
    out.push(v - prev);
    prev = v;
  }
  return out;
}

type YtdGercek = {
  bransAylik: Map<string, Map<number, number[]>>;
  ytdToplam: Map<number, number>;
};

function extractYtdGercek(
  mizanAylikFull: MizanAylikRow[],
  butceYili: number,
  anchorAy: number,
): YtdGercek {
  const kumulIdx = new Map<string, number>();
  const branslar = new Set<string>();
  const kodlar = Object.keys(GT_KOD_TO_SATIR);

  for (const r of mizanAylikFull) {
    if (r.yil !== butceYili) continue;
    const h = String(r.hesap);
    if (!(h in GT_KOD_TO_SATIR)) continue;
    const b = normalizeBransKodu(r.bransKodu);
    if (!b || b === "TOPLAM" || !/^7\d{2}$/.test(b)) continue;
    const ay = r.ay;
    if (ay < 1 || ay > 12) continue;
    branslar.add(b);
    const k = `${b}|${h}|${ay}`;
    kumulIdx.set(k, (kumulIdx.get(k) ?? 0) + (Number(r.tutar) || 0));
  }

  const bransAylik = new Map<string, Map<number, number[]>>();
  const ytdToplam = new Map<number, number>();

  for (const brans of branslar) {
    const satirMap = new Map<number, number[]>();
    for (const gtKod of kodlar) {
      const satir = GT_KOD_TO_SATIR[gtKod]!;
      const kumul = Array.from({ length: 12 }, (_, i) => kumulIdx.get(`${brans}|${gtKod}|${i + 1}`) ?? 0);
      if (!kumul.some((v) => Math.abs(v) > 0)) continue;
      satirMap.set(satir, kumulToIncremental(kumul));
    }
    if (satirMap.size > 0) bransAylik.set(brans, satirMap);
  }

  for (const satir of new Set(Object.values(GT_KOD_TO_SATIR))) {
    let ytd = 0;
    for (const [, sm] of bransAylik) {
      const ser = sm.get(satir);
      if (!ser) continue;
      for (let ay = 0; ay < anchorAy; ay++) ytd += ser[ay] ?? 0;
    }
    ytdToplam.set(satir, ytd);
  }

  const ytd96 = ytdToplam.get(96) ?? 0;
  const ytd105 = ytdToplam.get(105) ?? 0;
  ytdToplam.set(95, ytd96 + ytd105);

  return { bransAylik, ytdToplam };
}

/**
 * Bütçe yılı için 0111 (brüt prim) verisi olan en yüksek ay (1–11).
 * Temmuz henüz yoksa mevcut max kullanılır.
 */
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

  if (maxAvailable == null) {
    return { anchorAy: preferred, maxAvailable: null, preferredUsed: true };
  }
  if (months.has(preferred)) {
    return { anchorAy: preferred, maxAvailable, preferredUsed: true };
  }
  return {
    anchorAy: Math.min(maxAvailable, preferred),
    maxAvailable,
    preferredUsed: false,
  };
}

const PARENT_FORMULAS: ReadonlyArray<[number, readonly number[]]> = [
  [10, [11, 19, 20]],
  [95, [96, 105]],
  // F38 mali gelir V2'de F9'a gömülmez; TKZ'ye ayrı eklenir.
  [9, [10, 21, 31, 83, 86]],
  [94, [95, 114, 157, 164, 176, 217, 202]],
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

function yenidenHesaplaUstToplamlar(gt: GelirTablosuSonuc): void {
  for (const b of gt.branslar) {
    const ab = gt.aylikBrans[b.bransKodu];
    if (!ab) continue;
    for (const [hedef, parts] of PARENT_FORMULAS) {
      const ser = Array.from({ length: 12 }, (_, ay) =>
        parts.reduce((s, p) => s + (ab[p]?.[ay] ?? 0), 0),
      );
      ab[hedef] = ser;
      b.degerler[hedef] = ser.reduce((a, x) => a + x, 0);
    }
  }
  yenileToplamlar(
    gt,
    PARENT_FORMULAS.map(([s]) => s),
  );
}

/**
 * YTD anchor ayına kadar gerçekleşmeyi GT sonucuna yazar.
 * Prim (F11): H2 yıllık hedefe ölçeklenir.
 * Hasar (F96/F105): H2 V2 projeksiyonu kalır.
 */
export function uygulaYtdOverlay(
  gt: GelirTablosuSonuc,
  mizanAylikFull: MizanAylikRow[],
  butceYili: number,
  anchorAy: number,
): { gt: GelirTablosuSonuc; kalibrasyon: V3KalibrasyonSatir[] } {
  const anchor = Math.min(Math.max(anchorAy, 1), 11);
  const ytd = extractYtdGercek(mizanAylikFull, butceYili, anchor);
  const kalibrasyon: V3KalibrasyonSatir[] = [];

  if (ytd.bransAylik.size === 0) {
    return { gt, kalibrasyon };
  }

  const satirAd: Record<number, string> = {
    11: "Brüt yazılan prim",
    19: "Reasüransa devredilen prim",
    96: "Brüt ödenen hasar (-)",
    105: "Ödenen hasarda reasürör payı",
    95: "Ödenen hasarlar (net)",
  };

  const kalemSatirlari = [...V3_YTD_KILIT_SATIRLARI, 95] as const;
  for (const satir of kalemSatirlari) {
    let ytdTahmin = 0;
    for (let ay = 0; ay < anchor; ay++) {
      ytdTahmin += gt.aylikToplam[satir]?.[ay] ?? 0;
    }
    const ytdGercek = ytd.ytdToplam.get(satir) ?? 0;
    const sapma =
      Math.abs(ytdTahmin) > 1 ? ((ytdGercek - ytdTahmin) / Math.abs(ytdTahmin)) * 100 : null;
    kalibrasyon.push({
      satir,
      ad: satirAd[satir] ?? `F${satir}`,
      ytdTahmin,
      ytdGercek,
      sapmaPct: sapma,
      uygulananCarpan: ytdTahmin !== 0 ? ytdGercek / ytdTahmin : 1,
    });
  }

  const overlaySatirlari = [...new Set(Object.values(GT_KOD_TO_SATIR))];

  for (const b of gt.branslar) {
    const sm = ytd.bransAylik.get(b.bransKodu);
    if (!sm) continue;
    const bransAylik = gt.aylikBrans[b.bransKodu] ?? {};

    for (const satir of overlaySatirlari) {
      const gercekSer = sm.get(satir);
      if (!gercekSer) continue;

      const yeniSer = [...(bransAylik[satir] ?? Array(12).fill(0))];
      let ytdGercekBrans = 0;
      for (let ay = 0; ay < anchor; ay++) {
        yeniSer[ay] = gercekSer[ay] ?? 0;
        ytdGercekBrans += yeniSer[ay] ?? 0;
      }
      if (Math.abs(ytdGercekBrans) < 1) continue;

      if (RESCALE_TO_ANNUAL.has(satir)) {
        const yillikHedef = b.degerler[satir] ?? 0;
        const kalan = yillikHedef - ytdGercekBrans;
        const mevcutKalan = yeniSer.slice(anchor).reduce((a, x) => a + x, 0);
        if (kalan < 0) {
          for (let ay = anchor; ay < 12; ay++) yeniSer[ay] = 0;
        } else if (mevcutKalan > 0) {
          const carpan = kalan / mevcutKalan;
          for (let ay = anchor; ay < 12; ay++) {
            yeniSer[ay] = (yeniSer[ay] ?? 0) * carpan;
          }
        } else if (kalan !== 0) {
          const n = 12 - anchor;
          for (let ay = anchor; ay < 12; ay++) yeniSer[ay] = kalan / n;
        }
      }

      bransAylik[satir] = yeniSer;
      b.degerler[satir] = yeniSer.reduce((a, x) => a + x, 0);
    }

    gt.aylikBrans[b.bransKodu] = bransAylik;
  }

  yenileToplamlar(gt, overlaySatirlari);
  yenidenHesaplaUstToplamlar(gt);

  return { gt, kalibrasyon };
}
