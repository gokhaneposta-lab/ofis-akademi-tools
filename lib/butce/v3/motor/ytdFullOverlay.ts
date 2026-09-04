/**
 * Bütçe V3 (yeni motor) — YTD FULL overlay.
 *
 * Anchor ayına kadar (varsayılan 7 = Temmuz) `mizan-aylik-full.json` içindeki
 * TÜM yaprak GT kodları branş × ay bazında gelir tablosuna birebir yazılır.
 * Ondan sonra üst toplam satırları (F10, F31, F94, F95, F114, F136, F157,
 * F166, F176, F177, F9) yeniden hesaplanır — dolayısıyla Ocak–Anchor arası
 * Safi TKZ ve TKZ muhasebe gerçeği ile birebir tutar.
 *
 * H2 (Anchor+1..Aralık): motor projeksiyonu bozulmaz.
 *
 * V3'ün eski `ytdOverlay.ts` (F11/F96/F105 sadece) yerine geçer.
 */

import type { GelirTablosuSonuc } from "../../gelir/gelirTablosu";
import type { MizanAylikRow } from "../../types";
import { normalizeBransKodu } from "../../textUtils";
import { F_YAPRAK_KALEMLER, GT_KOD_TO_F_SATIR, YTD_UST_TOPLAM_SATIRLAR } from "./kalemHaritasi";

/** Prim (F11) için: yıllık hedef sabit; kalan H2 aylara mevsimle dağıtılır. */
const H2_RESCALE_SATIRLAR = new Set<number>([11]);

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

/** Bir GT kodunun branş × ay aylık artışı (2026 için). */
function bransSatirAylik(
  rows: MizanAylikRow[],
  yil: number,
): Map<string, Map<number, number[]>> {
  const kumulByBransSatir = new Map<string, Map<number, number[]>>();
  for (const r of rows) {
    if (Number(r.yil) !== yil) continue;
    const h = String(r.hesap);
    if (!(h in GT_KOD_TO_F_SATIR)) continue;
    const satir = GT_KOD_TO_F_SATIR[h]!;
    const b = normalizeBransKodu(r.bransKodu);
    if (!b || !/^7\d{2}$/.test(b)) continue;
    const ay = Number(r.ay);
    if (ay < 1 || ay > 12) continue;
    if (!kumulByBransSatir.has(b)) kumulByBransSatir.set(b, new Map());
    const satirMap = kumulByBransSatir.get(b)!;
    if (!satirMap.has(satir)) satirMap.set(satir, Array(12).fill(0));
    satirMap.get(satir)![ay - 1] = Number(r.tutar) || 0;
  }

  // Kümülatiften aylığa çevir
  const out = new Map<string, Map<number, number[]>>();
  for (const [b, sm] of kumulByBransSatir) {
    const oSm = new Map<number, number[]>();
    for (const [satir, kumul] of sm) oSm.set(satir, kumulToIncremental(kumul));
    out.set(b, oSm);
  }
  return out;
}

/**
 * Anchor'a kadar mizandan kilitle; sonrası motor projeksiyonu.
 * @param gt Motor tarafından üretilmiş gelir tablosu (yerinde değiştirilir).
 * @param mizanAylikFull Bütçe yılına ait aylık mizan (`hesap` = GT alt kodu).
 * @param butceYili
 * @param anchorAy 1..11
 */
export function uygulaYtdFullOverlay(
  gt: GelirTablosuSonuc,
  mizanAylikFull: MizanAylikRow[],
  butceYili: number,
  anchorAy: number,
): {
  kilitliBransSayisi: number;
  kilitliSatirSayisi: number;
  ytdSafiTkz: number;
  modelSafiTkzOnce: number;
} {
  const anchor = Math.min(Math.max(anchorAy, 1), 11);
  const bransAylik = bransSatirAylik(mizanAylikFull, butceYili);

  if (bransAylik.size === 0) {
    return { kilitliBransSayisi: 0, kilitliSatirSayisi: 0, ytdSafiTkz: 0, modelSafiTkzOnce: 0 };
  }

  const overlaySatirlar = new Set<number>();
  for (const kalem of F_YAPRAK_KALEMLER) {
    if (kalem.gtKod && GT_KOD_TO_F_SATIR[kalem.gtKod] === kalem.satir) {
      overlaySatirlar.add(kalem.satir);
    }
  }

  let kilitliBransSayisi = 0;
  let kilitliSatirSayisi = 0;
  let modelSafiTkzOnce = 0;

  for (const b of gt.branslar) {
    const sm = bransAylik.get(b.bransKodu);
    if (!sm) continue;
    kilitliBransSayisi++;
    const bransAyMap = gt.aylikBrans[b.bransKodu] ?? {};

    for (const satir of overlaySatirlar) {
      const gercek = sm.get(satir);
      if (!gercek) continue;

      const yeniSer = [...(bransAyMap[satir] ?? Array(12).fill(0))];
      // Safi TKZ öncesi hesap için model değeri
      modelSafiTkzOnce += yeniSer.slice(0, anchor).reduce((a, x) => a + x, 0);

      for (let ay = 0; ay < anchor; ay++) yeniSer[ay] = gercek[ay] ?? 0;

      if (H2_RESCALE_SATIRLAR.has(satir)) {
        // Yıllık hedef sabit → H2'de kalan tutar için mevcut mevsime göre ölçekle
        const yillikHedef = b.degerler[satir] ?? 0;
        const ytdGercek = yeniSer.slice(0, anchor).reduce((a, x) => a + x, 0);
        const kalan = yillikHedef - ytdGercek;
        const mevcutKalan = yeniSer.slice(anchor).reduce((a, x) => a + x, 0);
        if (kalan <= 0) {
          for (let ay = anchor; ay < 12; ay++) yeniSer[ay] = 0;
        } else if (mevcutKalan > 0) {
          const carpan = kalan / mevcutKalan;
          for (let ay = anchor; ay < 12; ay++) yeniSer[ay] = (yeniSer[ay] ?? 0) * carpan;
        } else {
          const n = 12 - anchor;
          for (let ay = anchor; ay < 12; ay++) yeniSer[ay] = kalan / n;
        }
      }

      bransAyMap[satir] = yeniSer;
      b.degerler[satir] = yeniSer.reduce((a, x) => a + x, 0);
      kilitliSatirSayisi++;
    }
    gt.aylikBrans[b.bransKodu] = bransAyMap;
  }

  // Üst toplam satırlarını (F9, F94, F95, F31…) branş bazında ve şirket toplamında yeniden hesapla.
  yenileToplamlar(gt, [...overlaySatirlar, ...YTD_UST_TOPLAM_SATIRLAR]);
  yenidenTuretUstFormuller(gt);

  // YTD Safi TKZ = Ocak..anchor arasında (TEKNİK GELİR + TEKNİK GİDER - GENEL_GIDER)
  // Basitçe: F9 - F94 (V2 sentetik değil, ham GT üzerinden)
  let ytdSafiTkz = 0;
  for (let ay = 0; ay < anchor; ay++) {
    const f9 = gt.aylikToplam[9]?.[ay] ?? 0;
    const f94 = gt.aylikToplam[94]?.[ay] ?? 0;
    ytdSafiTkz += f9 + f94;
  }

  return { kilitliBransSayisi, kilitliSatirSayisi, ytdSafiTkz, modelSafiTkzOnce };
}

/** Verilen satırların şirket toplamlarını branş toplamından yeniden derle. */
function yenileToplamlar(gt: GelirTablosuSonuc, satirlar: readonly number[]): void {
  const tekilSatirlar = [...new Set(satirlar)];
  for (const satir of tekilSatirlar) {
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
 * Ana Excel formül üstü toplamları (F10, F31, F94, F95, F114, F136, F166, F176, F9).
 * gt_excel_harita.json'daki toplam formüllerinin sabit versiyonu — burada tekrar
 * çözmemek için elle kısa liste tutuyoruz.
 */
const UST_FORMUL: ReadonlyArray<[number, readonly number[]]> = [
  [10, [11, 19, 20]],                        // Net yazılan prim
  [22, [23, 24]],                            // Brüt KPK değişimi
  [25, [26, 27]],                             // KPK RE değişimi
  [28, [29, 30]],                             // KPK SGK değişimi
  [21, [22, 25, 28]],                         // KPK toplam
  [32, [33, 34]],                             // Brüt DERK
  [35, [36, 37]],                             // DERK RE
  [31, [32, 35]],                             // DERK
  [95, [96, 105]],                            // Net ödenen hasar
  [115, [116, 126]],                          // Brüt muallak değişim
  [136, [137, 147]],                          // Muallak RE değişim
  [114, [115, 136]],                          // Muallak toplam
  [157, [158, 161]],                          // İkramiye
  [166, [167, 168]],                          // Dengeleme
  [178, [180, 181]],                          // Üretim komisyon alt
  [177, [178, 189]],                          // Üretim komisyon
  [196, [197, 198]],                          // Alınan RE komisyon
  [176, [177, 190, 191, 192, 193, 194, 196, 200, 201]], // Faaliyet giderleri toplamı (V2 ile aynı liste)
  [9, [10, 21, 31, 86]],                      // TEKNİK GELİR (F38 hariç, V2 ile aynı)
  [94, [95, 114, 157, 166, 176, 202]],         // TEKNİK GİDER
];

function yenidenTuretUstFormuller(gt: GelirTablosuSonuc): void {
  for (const b of gt.branslar) {
    const ab = gt.aylikBrans[b.bransKodu];
    if (!ab) continue;
    for (const [hedef, parts] of UST_FORMUL) {
      const ser = Array.from({ length: 12 }, (_, ay) =>
        parts.reduce((s, p) => s + (ab[p]?.[ay] ?? 0), 0),
      );
      ab[hedef] = ser;
      b.degerler[hedef] = ser.reduce((a, x) => a + x, 0);
    }
  }
  // Şirket toplamı
  const hedefler = UST_FORMUL.map(([s]) => s);
  yenileToplamlar(gt, hedefler);
}
