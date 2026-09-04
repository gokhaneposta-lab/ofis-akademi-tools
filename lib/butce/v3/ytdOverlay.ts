import { normalizeBransKodu } from "../textUtils";
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import type { MizanAylikRow } from "../types";
import {
  GT_KOD_TO_SATIR,
  GT_PARENT_ROLLUPS,
  kumulToIncremental,
  yaprakGtKodlari,
} from "./gtKodHaritasi";
import { V3_DEFAULT_YTD_ANCHOR } from "./metodoloji";
import type { V3KalibrasyonSatir } from "./types";

/** Yıllık tarife hedefini korumak için H2 ölçeklenen satırlar. */
const RESCALE_TO_ANNUAL = new Set<number>([11]);

/** Kullanıcı girdisi — YTD'de mizan yoksa motor değeri kalır. */
const OVERLAY_ATLA_SATIRLAR = new Set<number>([38]);

/** Kalibrasyon raporu için ana kalemler. */
const KALIBRASYON_SATIRLARI: ReadonlyArray<{ satir: number; ad: string }> = [
  { satir: 11, ad: "Brüt yazılan prim" },
  { satir: 21, ad: "KPK değişimi" },
  { satir: 96, ad: "Brüt ödenen hasar (-)" },
  { satir: 105, ad: "Ödenen hasarda reasürör payı" },
  { satir: 95, ad: "Ödenen hasarlar (net)" },
  { satir: 114, ad: "Muallak hasar karş. değişim" },
  { satir: 166, ad: "Dengeleme karşılığı" },
  { satir: 177, ad: "Üretim komisyon gideri (-)" },
  { satir: 9, ad: "Teknik gelir (F9)" },
  { satir: 94, ad: "Teknik gider (F94)" },
];

type BransSatirAylik = Map<string, Map<number, number[]>>;

/**
 * mizan-aylik-full → branş × F satır × 12 aylık artış.
 * Yalnızca yaprak GT kodları; aynı satıra düşen kodlar toplanır.
 */
function extractMizanAylik(
  rows: MizanAylikRow[],
  butceYili: number,
): BransSatirAylik {
  const kodSet = new Set<string>();
  for (const r of rows) {
    if (Number(r.yil) !== butceYili) continue;
    kodSet.add(String(r.hesap));
  }
  const yapraklar = yaprakGtKodlari(kodSet);

  /** brans → satir → ay (0-index) kümülatif */
  const kumul = new Map<string, Map<number, number[]>>();

  for (const r of rows) {
    if (Number(r.yil) !== butceYili) continue;
    const gtKod = String(r.hesap);
    if (!yapraklar.has(gtKod)) continue;
    const satir = GT_KOD_TO_SATIR[gtKod];
    if (satir == null) continue;

    const b = normalizeBransKodu(r.bransKodu);
    if (!b || !/^7\d{2}$/.test(b)) continue;
    const ay = Number(r.ay);
    if (ay < 1 || ay > 12) continue;

    if (!kumul.has(b)) kumul.set(b, new Map());
    const sm = kumul.get(b)!;
    if (!sm.has(satir)) sm.set(satir, Array(12).fill(0));
    sm.get(satir)![ay - 1] += Number(r.tutar) || 0;
  }

  const out: BransSatirAylik = new Map();
  for (const [b, sm] of kumul) {
    const oSm = new Map<number, number[]>();
    for (const [satir, kumulSer] of sm) {
      oSm.set(satir, kumulToIncremental(kumulSer));
    }
    out.set(b, oSm);
  }
  return out;
}

/** Çalışma alanında üst satırları alt satırlardan türet (çok geçişli). */
function rollupParents(workspace: Map<number, number[]>): void {
  for (let pass = 0; pass < 10; pass++) {
    for (const [parent, children] of GT_PARENT_ROLLUPS) {
      const ser = Array.from({ length: 12 }, (_, ay) =>
        children.reduce((s, c) => s + (workspace.get(c)?.[ay] ?? 0), 0),
      );
      workspace.set(parent, ser);
    }
  }
}

/** bransAylik kaydında satır serisi al/oluştur. */
function satirSer(
  ab: Record<number, number[]>,
  satir: number,
): number[] {
  if (!ab[satir]) ab[satir] = Array(12).fill(0);
  return ab[satir]!;
}

/** Record → Map rollup + geri yaz. */
function rollupAylikBrans(ab: Record<number, number[]>): void {
  const ws = new Map<number, number[]>();
  for (const [s, ser] of Object.entries(ab)) ws.set(Number(s), ser);
  rollupParents(ws);
  for (const [s, ser] of ws) ab[s] = ser;
}

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

/**
 * Bütçe yılı için 0111 (brüt prim) verisi olan en yüksek ay (1–11).
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

/**
 * YTD anchor ayına kadar TÜM mizan GT kodlarını kilitle.
 * V2 gtMotoru + KPK sonrası uygulanır; H2 projeksiyonu korunur (F11 hariç rescale).
 */
export function uygulaYtdOverlay(
  gt: GelirTablosuSonuc,
  mizanAylikFull: MizanAylikRow[],
  butceYili: number,
  anchorAy: number,
): { gt: GelirTablosuSonuc; kalibrasyon: V3KalibrasyonSatir[] } {
  const anchor = Math.min(Math.max(anchorAy, 1), 11);
  const mizanAylik = extractMizanAylik(mizanAylikFull, butceYili);
  const kalibrasyon: V3KalibrasyonSatir[] = [];

  if (mizanAylik.size === 0) {
    return { gt, kalibrasyon };
  }

  const gtSatirlari = new Set(gt.satirlar.map((s) => s.satir));
  const overlayEdilen = new Set<number>();

  /** Overlay öncesi YTD — kalibrasyon raporu için. */
  const ytdOnce = new Map<number, number>();
  for (const { satir } of KALIBRASYON_SATIRLARI) {
    let t = 0;
    for (let ay = 0; ay < anchor; ay++) t += gt.aylikToplam[satir]?.[ay] ?? 0;
    ytdOnce.set(satir, t);
  }

  for (const b of gt.branslar) {
    const mizanSm = mizanAylik.get(b.bransKodu);
    if (!mizanSm) continue;

    const bransAylik = gt.aylikBrans[b.bransKodu] ?? {};

    // Mizan yaprakları + rollup ile tüm ara satırları türet
    const ws = new Map<number, number[]>(mizanSm);
    rollupParents(ws);

    // Önce mevcut seriyi koruyarak mizan workspace'i birleştir (YTD ayları)
    for (const [satir, gercekSer] of ws) {
      if (OVERLAY_ATLA_SATIRLAR.has(satir)) continue;
      if (!gercekSer.slice(0, anchor).some((v) => Math.abs(v) > 0.01)) continue;

      const yeniSer = [...satirSer(bransAylik, satir)];
      for (let ay = 0; ay < anchor; ay++) yeniSer[ay] = gercekSer[ay] ?? 0;
      bransAylik[satir] = yeniSer;
      overlayEdilen.add(satir);
    }

    // F9/F94 zinciri: mizandan gelen alt satırlardan üst toplamları yeniden türet
    rollupAylikBrans(bransAylik);

    // F11 yıllık hedef rescale (H2)
    if (bransAylik[11]) {
      const satir = 11;
      const yeniSer = [...bransAylik[11]!];
      if (RESCALE_TO_ANNUAL.has(satir)) {
        const yillikHedef = b.degerler[satir] ?? 0;
        const ytdGercek = yeniSer.slice(0, anchor).reduce((a, x) => a + x, 0);
        const kalan = yillikHedef - ytdGercek;
        const mevcutKalan = yeniSer.slice(anchor).reduce((a, x) => a + x, 0);
        if (kalan < 0) {
          for (let ay = anchor; ay < 12; ay++) yeniSer[ay] = 0;
        } else if (mevcutKalan > 0) {
          const carpan = kalan / mevcutKalan;
          for (let ay = anchor; ay < 12; ay++) yeniSer[ay] = (yeniSer[ay] ?? 0) * carpan;
        } else if (kalan !== 0) {
          const n = 12 - anchor;
          for (let ay = anchor; ay < 12; ay++) yeniSer[ay] = kalan / n;
        }
      }
      bransAylik[satir] = yeniSer;
    }

    for (const satir of gtSatirlari) {
      const ser = bransAylik[satir];
      if (ser) b.degerler[satir] = ser.reduce((a, x) => a + x, 0);
    }

    gt.aylikBrans[b.bransKodu] = bransAylik;
  }

  // F95 = F96 + F105 (rollup kaçırırsa)
  for (const b of gt.branslar) {
    const ab = gt.aylikBrans[b.bransKodu];
    if (!ab) continue;
    if (ab[96] && ab[105]) {
      const ser = Array.from({ length: 12 }, (_, ay) => (ab[96]![ay] ?? 0) + (ab[105]![ay] ?? 0));
      ab[95] = ser;
      b.degerler[95] = ser.reduce((a, x) => a + x, 0);
      overlayEdilen.add(95);
    }
  }

  overlayEdilen.add(9);
  overlayEdilen.add(94);
  overlayEdilen.add(164);
  overlayEdilen.add(165);

  yenileToplamlar(gt, [...overlayEdilen]);

  for (const { satir, ad } of KALIBRASYON_SATIRLARI) {
    const ytdTahmin = ytdOnce.get(satir) ?? 0;
    let ytdGercek = 0;
    for (let ay = 0; ay < anchor; ay++) ytdGercek += gt.aylikToplam[satir]?.[ay] ?? 0;
    const sapma =
      Math.abs(ytdTahmin) > 1 ? ((ytdGercek - ytdTahmin) / Math.abs(ytdTahmin)) * 100 : null;
    kalibrasyon.push({
      satir,
      ad,
      ytdTahmin,
      ytdGercek,
      sapmaPct: sapma,
      uygulananCarpan: 1,
    });
  }

  return { gt, kalibrasyon };
}
