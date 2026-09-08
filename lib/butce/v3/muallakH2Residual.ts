/**
 * V3 H2 muallak + RE payı — artık pay (residual) projeksiyonu.
 *
 * YTD mizan kilidi korunur; Ağu–Ara için bağımsız prim×oran yerine
 * yıllık hedef − YTD farkı dağıtılır (Excel V8 bandına yaklaşır).
 */
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import { MizanOranServisi } from "../oran/mizanOranlar";
import type { MizanAylikRow, MizanRow, OranAyarStore } from "../types";

const SATIR_611 = 114;
const SATIR_61101 = 115;
const SATIR_611011 = 116;
const SATIR_611012 = 126;
const SATIR_61102 = 136;
const SATIR_611021 = 137;
const SATIR_611022 = 147;

function ytdToplamSer(ser: number[] | undefined, anchor: number): number {
  if (!ser?.length) return 0;
  return ser.slice(0, anchor).reduce((a, x) => a + x, 0);
}

function bransPaylari(
  gt: GelirTablosuSonuc,
  ytdByBrans: Map<string, number>,
): Map<string, number> {
  const out = new Map<string, number>();
  const ytdTop = [...ytdByBrans.values()].reduce((a, x) => a + x, 0);
  const primTop = gt.branslar.reduce((a, b) => a + Math.abs(b.degerler[11] ?? 0), 0);

  for (const b of gt.branslar) {
    const ytdB = ytdByBrans.get(b.bransKodu) ?? 0;
    if (Math.abs(ytdTop) > 1 && Math.abs(ytdB) > 1) {
      out.set(b.bransKodu, ytdB / ytdTop);
    } else if (primTop > 0) {
      out.set(b.bransKodu, Math.abs(b.degerler[11] ?? 0) / primTop);
    } else {
      out.set(b.bransKodu, 1 / Math.max(1, gt.branslar.length));
    }
  }
  return out;
}

/** H2 aylarına prim mevsimselliği ile dağıt. */
function dagitH2Aylik(
  gt: GelirTablosuSonuc,
  bransKodu: string,
  anchor: number,
  h2Toplam: number,
): number[] {
  const ser = Array(12).fill(0);
  if (Math.abs(h2Toplam) < 1) return ser;

  const primSer = gt.aylikBrans[bransKodu]?.[11];
  let agirlikTop = 0;
  const agirliklar: number[] = [];
  for (let ay = anchor; ay < 12; ay++) {
    const w = Math.abs(primSer?.[ay] ?? 1);
    agirliklar[ay] = w;
    agirlikTop += w;
  }
  if (agirlikTop <= 0) {
    const n = 12 - anchor;
    for (let ay = anchor; ay < 12; ay++) ser[ay] = h2Toplam / n;
    return ser;
  }
  for (let ay = anchor; ay < 12; ay++) {
    ser[ay] = (h2Toplam * (agirliklar[ay] ?? 0)) / agirlikTop;
  }
  return ser;
}

function yazH2Ser(
  gt: GelirTablosuSonuc,
  bransKodu: string,
  satir: number,
  motorSer: number[],
  anchor: number,
): void {
  const ab = gt.aylikBrans[bransKodu] ?? {};
  const ser = [...(ab[satir] ?? Array(12).fill(0))];
  for (let ay = anchor; ay < 12; ay++) ser[ay] = motorSer[ay] ?? 0;
  ab[satir] = ser;
  gt.aylikBrans[bransKodu] = ab;
  const b = gt.branslar.find((x) => x.bransKodu === bransKodu);
  if (b) b.degerler[satir] = ser.reduce((a, x) => a + x, 0);
}

function sifirlaH2Satir(
  gt: GelirTablosuSonuc,
  anchor: number,
  satirlar: readonly number[],
): void {
  for (const b of gt.branslar) {
    const ab = gt.aylikBrans[b.bransKodu] ?? {};
    for (const satir of satirlar) {
      const ser = [...(ab[satir] ?? Array(12).fill(0))];
      for (let ay = anchor; ay < 12; ay++) ser[ay] = 0;
      ab[satir] = ser;
    }
    gt.aylikBrans[b.bransKodu] = ab;
  }
}

/** F325: 61101 ~ −(|F11|+|F22|+|F32|) × |oran| (geniş baz, gider negatif). */
function f325Yillik61101(
  gt: GelirTablosuSonuc,
  servis: MizanOranServisi,
  oranAyar: OranAyarStore,
): number {
  let t = 0;
  for (const b of gt.branslar) {
    const tablo = servis.tumBranslarTablosu("F325", oranAyar["F325"] ?? {}, { ay: 12 });
    const oran = Math.abs(tablo.find((r) => r.bransKodu === b.bransKodu)?.oran ?? 0);
    const baz =
      Math.abs(b.degerler[11] ?? 0) +
      Math.abs(b.degerler[22] ?? 0) +
      Math.abs(b.degerler[32] ?? 0);
    t -= baz * oran;
  }
  return t;
}

/** F466 / 02221: 611021 ~ |F11| × |oran| (RE cari pay, pozitif). */
function f466Yillik61102(
  gt: GelirTablosuSonuc,
  servis: MizanOranServisi,
  oranAyar: OranAyarStore,
): number {
  let t = 0;
  for (const b of gt.branslar) {
    const tablo = servis.tumBranslarTablosu("02221", oranAyar["02221"] ?? {}, { ay: 12 });
    const oran = Math.abs(tablo.find((r) => r.bransKodu === b.bransKodu)?.oran ?? 0);
    t += Math.abs(b.degerler[11] ?? 0) * oran;
  }
  return t;
}

/** Brüt muallak yıllık hedef (61101, negatif gider). */
function hedef61101Yillik(ytd: number, anchor: number, f325Tahmin: number): number {
  const runRate = ytd * (12 / anchor);
  const f325Neg = f325Tahmin > 0 ? -Math.abs(f325Tahmin) : f325Tahmin;
  if (ytd < 0 && f325Neg < 0) return Math.max(runRate, f325Neg);
  return f325Neg < 0 ? f325Neg : runRate;
}

/** RE payı yıllık hedef (61102, pozitif). YTD zaten pro-rata hedefe ulaştıysa H2 büyütme. */
function hedef61102Yillik(ytd: number, anchor: number, f466Tahmin: number): number {
  const runRate = ytd * (12 / anchor);
  let hedef = Math.min(runRate, Math.abs(f466Tahmin));
  if (ytd > 0 && hedef > 0 && ytd >= hedef * (anchor / 12)) {
    hedef = ytd;
  }
  return hedef;
}

export function uygulaMuallakH2Residual(
  gt: GelirTablosuSonuc,
  opts: {
    anchorAy: number;
    butceYili: number;
    mizan: MizanRow[];
    mizanAylikFull: MizanAylikRow[];
    oranAyar: OranAyarStore;
  },
): { uyarilar: string[] } {
  const uyarilar: string[] = [];
  const anchor = Math.min(Math.max(opts.anchorAy, 1), 11);
  if (anchor >= 12) return { uyarilar };

  const servis = new MizanOranServisi(
    opts.mizan,
    opts.butceYili,
    opts.mizanAylikFull,
    true,
  );

  // Eski prim×oran H2 kalıntılarını temizle
  sifirlaH2Satir(gt, anchor, [SATIR_611011, SATIR_611021]);

  // --- Brüt muallak (61101 / 611011) ---
  const ytd61101Sirket = ytdToplamSer(gt.aylikToplam[SATIR_61101], anchor);
  const f325Tahmin = f325Yillik61101(gt, servis, opts.oranAyar);
  const hedef61101 = hedef61101Yillik(ytd61101Sirket, anchor, f325Tahmin);
  const h2_61101 = hedef61101 - ytd61101Sirket;

  const ytd61101Brans = new Map<string, number>();
  for (const b of gt.branslar) {
    ytd61101Brans.set(
      b.bransKodu,
      ytdToplamSer(gt.aylikBrans[b.bransKodu]?.[SATIR_61101], anchor),
    );
  }
  const pay61101 = bransPaylari(gt, ytd61101Brans);

  for (const b of gt.branslar) {
    const pay = pay61101.get(b.bransKodu) ?? 0;
    const h2Brans = h2_61101 * pay;
    const ser116 = dagitH2Aylik(gt, b.bransKodu, anchor, h2Brans);
    yazH2Ser(gt, b.bransKodu, SATIR_611011, ser116, anchor);
  }

  // --- RE payı (61102 / 611021) ---
  const ytd61102Sirket = ytdToplamSer(gt.aylikToplam[SATIR_61102], anchor);
  const f466Tahmin = f466Yillik61102(gt, servis, opts.oranAyar);
  const hedef61102 = hedef61102Yillik(ytd61102Sirket, anchor, f466Tahmin);
  const h2_61102 = hedef61102 - ytd61102Sirket;

  const ytd61102Brans = new Map<string, number>();
  for (const b of gt.branslar) {
    ytd61102Brans.set(
      b.bransKodu,
      ytdToplamSer(gt.aylikBrans[b.bransKodu]?.[SATIR_61102], anchor),
    );
  }
  const pay61102 = bransPaylari(gt, ytd61102Brans);

  for (const b of gt.branslar) {
    const pay = pay61102.get(b.bransKodu) ?? 0;
    const h2Brans = h2_61102 * pay;
    const ser137 = dagitH2Aylik(gt, b.bransKodu, anchor, h2Brans);
    yazH2Ser(gt, b.bransKodu, SATIR_611021, ser137, anchor);
  }

  // Net 611 (114) kontrol — brüt/devreden split sonrası yıllık bandı düzelt
  const ytd611Sirket = ytdToplamSer(gt.aylikToplam[SATIR_611], anchor);
  const run611 = ytd611Sirket * (12 / anchor);
  const f325Net611 = f325Tahmin + hedef61102;
  const hedef611 = Math.max(run611, f325Net611);
  const h2_611Net = hedef611 - ytd611Sirket;

  // RE H2=0 ise tüm net artık pay brüt muallak (611011) tarafına
  if (Math.abs(h2_61102) < 1 && Math.abs(h2_611Net - h2_61101) > 1000) {
    const ytd61101Brans2 = new Map<string, number>();
    for (const b of gt.branslar) {
      ytd61101Brans2.set(
        b.bransKodu,
        ytdToplamSer(gt.aylikBrans[b.bransKodu]?.[SATIR_611011], anchor),
      );
    }
    const pay611011 = bransPaylari(gt, ytd61101Brans2);
    for (const b of gt.branslar) {
      const pay = pay611011.get(b.bransKodu) ?? 0;
      const ser116 = dagitH2Aylik(gt, b.bransKodu, anchor, h2_611Net * pay);
      yazH2Ser(gt, b.bransKodu, SATIR_611011, ser116, anchor);
    }
  }

  const hedef61101Final = ytd61101Sirket + (Math.abs(h2_61102) < 1 ? h2_611Net : h2_61101);

  uyarilar.push(
    `H2 muallak artık pay: 61101 hedef ${Math.round(hedef61101Final).toLocaleString("tr-TR")} (F325 ${Math.round(f325Tahmin).toLocaleString("tr-TR")}, H2 brüt ${Math.round(Math.abs(h2_61102) < 1 ? h2_611Net : h2_61101).toLocaleString("tr-TR")}).`,
  );
  uyarilar.push(
    `H2 RE artık pay: 61102 hedef ${Math.round(hedef61102).toLocaleString("tr-TR")} (F466 ${Math.round(f466Tahmin).toLocaleString("tr-TR")}, H2 ${Math.round(h2_61102).toLocaleString("tr-TR")}).`,
  );
  uyarilar.push(
    `Net 611 yıllık hedef ≈ ${Math.round(hedef611).toLocaleString("tr-TR")} (YTD ${Math.round(ytd611Sirket).toLocaleString("tr-TR")} + H2 ${Math.round(h2_611Net).toLocaleString("tr-TR")}).`,
  );

  return { uyarilar };
}

export const MUALLAK_H2_SATIRLARI = [
  SATIR_611,
  SATIR_61101,
  SATIR_611011,
  SATIR_611012,
  SATIR_61102,
  SATIR_611021,
  SATIR_611022,
] as const;
