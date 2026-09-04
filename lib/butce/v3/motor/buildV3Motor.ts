/**
 * Bütçe V3 (yeni motor) — Ana kompozisyon.
 *
 * V2'nin `gtMotoru` / `MizanOranServisi` sınıflarını KULLANMAZ.
 * Yaprak F satırlarını doğrudan üretir, üst toplamları formülle türetir.
 *
 * Akış:
 *   1. Öğren V3 oranları (branş × kalem)
 *   2. Öğren F11 mevsimini (branş × 12 ay)
 *   3. Prim = kullanıcı × mevsim payı × ay
 *   4. Türev yapraklar: F19 = F11 × F295, F96 = (F11+F22+F32) × F320, …
 *   5. Üst toplamlar (F10, F31, F94, F95, F114, F157, F166, F176, F9): formül
 *   6. YTD full overlay: anchor'a kadar mizanla ez
 *   7. Sentetik V2 satırları: TEKNİK GELİR, TEKNİK GİDER, SAFİ TKZ, TKZ
 *   8. Mali gelir F38: kullanıcı aylık × net nakit payı ile branşlara dağıt
 *   9. Genel gider F190-194: kullanıcı / 12 ay
 */

import { HAZINE_BRANS_KODLARI, HAZINE_BRANS_SIRASI } from "../../config/brans";
import type {
  GelirBransKolon,
  GelirTablosuSonuc,
  GtGosterimSatir,
} from "../../gelir/gelirTablosu";
import { AYLAR } from "../../config/constants";
import type {
  BilancoAylikRow,
  MizanAylikRow,
  MizanRow,
  SatisButceRow,
} from "../../types";
import { V2_GT_GOSTERIM, hesaplaV2SentetikSatirlar } from "../../v2/buildV2GelirTablosu";
import { primHedefFromTarifeAna, primHedefFromToplam } from "../primFromToplam";
import { syntheticSatisFromTarife } from "../syntheticSatis";
import { alignTarifeHedefleri, toplamPrimFromTarife, v3DefaultsForYear } from "../defaults";
import type { V3VarsayimlarStore } from "../types";
import { F_YAPRAK_KALEMLER } from "./kalemHaritasi";
import { ogrenTumOranlar, oranlarToMap } from "./oranOgrenici";
import { ogrenTekMevsim } from "./mevsimOgrenici";
import { uygulaYtdFullOverlay } from "./ytdFullOverlay";
import { oneriGenelGider, oneriMaliGetiri, oneriTarifePrim } from "./oneriMotoru";
import type { V3MotorSonuc, V3Oneri } from "./types";

export type V3MotorGirdi = {
  varsayimlar: V3VarsayimlarStore;
  satisRows: SatisButceRow[];
  mizan: MizanRow[];
  mizanAylik: MizanAylikRow[];
  mizanAylikFull: MizanAylikRow[];
  bilancoAylik: BilancoAylikRow[];
};

export type V3MotorCikti = {
  gt: GelirTablosuSonuc;
  motor: V3MotorSonuc;
  primHedefleri: Record<string, number>;
  endirektPrim: Record<string, number>;
  toplamPrimHedef: number;
  ytdAnchorAy: number;
  uyarilar: string[];
};

const FALLBACK_PRIM_MEVSIM: readonly number[] = [
  0.11, 0.09, 0.09, 0.08, 0.09, 0.08, 0.09, 0.08, 0.07, 0.07, 0.07, 0.08,
];

function normalizePay(arr: readonly number[]): number[] {
  const sum = arr.reduce((a, x) => a + Math.max(0, x), 0);
  if (sum <= 0) return FALLBACK_PRIM_MEVSIM.slice();
  return arr.map((x) => Math.max(0, x) / sum);
}

/** Prim → branş dağıtımı: tarife hedefleri varsa ana grup fallback, yoksa toplam. */
function dagitPrim(
  varsayimlar: V3VarsayimlarStore,
  satisRows: SatisButceRow[],
  mizan: MizanRow[],
): { primHedefleri: Record<string, number>; endirektPrim: Record<string, number>; toplamPrimHedef: number; kaynak: string } {
  const yilDefaults = v3DefaultsForYear(varsayimlar.butceYili);
  const tarifeHedefleri =
    varsayimlar.tarifeHedefleri && Object.keys(varsayimlar.tarifeHedefleri).length > 0
      ? alignTarifeHedefleri(varsayimlar.tarifeHedefleri, satisRows)
      : yilDefaults?.tarifeHedefleri
        ? alignTarifeHedefleri(yilDefaults.tarifeHedefleri, satisRows)
        : {};
  const toplamPrimHedef = toplamPrimFromTarife(tarifeHedefleri) || varsayimlar.toplamPrimHedef || 0;

  if (Object.keys(tarifeHedefleri).length > 0) {
    const fb = primHedefFromTarifeAna(tarifeHedefleri, mizan, varsayimlar.butceYili);
    return { ...fb, toplamPrimHedef, kaynak: `tarife_ana_${fb.referansYil}` };
  }
  const fb = primHedefFromToplam(toplamPrimHedef, mizan, varsayimlar.butceYili);
  return { ...fb, toplamPrimHedef, kaynak: fb.kaynak };
}

/** Sıfırdan gelir tablosu iskeleti kur — tüm gösterim satırları 0. */
function emptyGt(butceYili: number, aktifKodlar: readonly string[], satirlar: readonly GtGosterimSatir[]): GelirTablosuSonuc {
  const branslar: GelirBransKolon[] = [];
  const aylikBrans: Record<string, Record<number, number[]>> = {};
  for (const kod of aktifKodlar) {
    const info = HAZINE_BRANS_KODLARI[kod] ?? ["", kod, ""];
    const degerler: Record<number, number> = {};
    for (const s of satirlar) degerler[s.satir] = 0;
    branslar.push({ bransKodu: kod, bransAdi: info[1], brutPrim: 0, degerler });
    aylikBrans[kod] = {};
    for (const s of satirlar) aylikBrans[kod]![s.satir] = Array(12).fill(0);
  }
  const toplam: Record<number, number> = {};
  const aylikToplam: Record<number, number[]> = {};
  for (const s of satirlar) {
    toplam[s.satir] = 0;
    aylikToplam[s.satir] = Array(12).fill(0);
  }
  return {
    butceYili,
    satirlar: [...satirlar],
    branslar,
    toplam,
    aylikToplam,
    aylikBrans,
    aylar: AYLAR,
    eksikGirdiler: [],
    brutPrimToplam: 0,
  };
}

/** F satır dizisini branşa yaz + şirket toplamını güncelle. */
function yazSatir(gt: GelirTablosuSonuc, brans: string, satir: number, ser: number[]): void {
  const ab = gt.aylikBrans[brans] ?? {};
  ab[satir] = ser;
  gt.aylikBrans[brans] = ab;
  const b = gt.branslar.find((x) => x.bransKodu === brans);
  if (b) b.degerler[satir] = ser.reduce((a, x) => a + x, 0);
}

function toplamlariYenile(gt: GelirTablosuSonuc, satirlar: readonly number[]): void {
  for (const satir of satirlar) {
    const ser = Array.from({ length: 12 }, (_, ay) => {
      let t = 0;
      for (const b of gt.branslar) t += gt.aylikBrans[b.bransKodu]?.[satir]?.[ay] ?? 0;
      return t;
    });
    gt.aylikToplam[satir] = ser;
    gt.toplam[satir] = ser.reduce((a, x) => a + x, 0);
  }
}

/**
 * Ana motor — sıfırdan V3 gelir tablosu üretir.
 */
export function buildV3Motor(girdi: V3MotorGirdi): V3MotorCikti {
  const uyarilar: string[] = [];
  const { varsayimlar, satisRows, mizan, mizanAylikFull } = girdi;
  const butceYili = varsayimlar.butceYili;
  const anchorAy = Math.min(Math.max(varsayimlar.ytdAnchorAy ?? 7, 1), 11);

  // 1) Prim dağıtımı
  const primAyar = dagitPrim(varsayimlar, satisRows.length > 0 ? satisRows : syntheticSatisFromTarife(varsayimlar.tarifeHedefleri ?? {}), mizan);
  const { primHedefleri, endirektPrim, toplamPrimHedef } = primAyar;
  uyarilar.push(`Prim dağıtımı: ${primAyar.kaynak}, toplam ${(toplamPrimHedef / 1e9).toFixed(2)} mia TL`);

  const aktifBrans = HAZINE_BRANS_SIRASI.filter((k) => (primHedefleri[k] ?? 0) > 0);
  if (aktifBrans.length === 0) {
    throw new Error("V3 motor: aktif branş yok (prim hedefi tümü 0)");
  }

  // 2) Öğren V3 oranları
  const oranlar = ogrenTumOranlar(mizan, butceYili);
  const oranMap = oranlarToMap(oranlar);
  const oranDeger = (kalem: string, brans: string): number => oranMap.get(kalem)?.get(brans) ?? 0;

  // 3) Öğren mevsim (F11 = brüt yazılan prim, GT 0111)
  const primMevsim = new Map<string, number[]>();
  for (const brans of aktifBrans) {
    const m = ogrenTekMevsim(mizanAylikFull, brans, "0111", butceYili, anchorAy);
    primMevsim.set(brans, m.aylikPay);
  }

  // 4) İskelet GT
  const gt = emptyGt(butceYili, aktifBrans, V2_GT_GOSTERIM);
  gt.brutPrimToplam = aktifBrans.reduce((a, k) => a + (primHedefleri[k] ?? 0), 0);
  for (const b of gt.branslar) b.brutPrim = primHedefleri[b.bransKodu] ?? 0;

  // 5) Yaprak satırları branş × ay bazında doldur
  for (const brans of aktifBrans) {
    const brut = primHedefleri[brans] ?? 0;
    const endirekt = endirektPrim[brans] ?? 0;
    const mevsim = primMevsim.get(brans) ?? FALLBACK_PRIM_MEVSIM;

    // F11 brüt prim
    const f11 = mevsim.map((p) => brut * p);
    yazSatir(gt, brans, 11, f11);

    // F15 endirekt (kullanıcı verirse; yoksa oran × F11)
    const f15Oran = oranDeger("F441", brans);
    const f15 = endirekt > 0 ? mevsim.map((p) => endirekt * p) : f11.map((v) => v * f15Oran);
    yazSatir(gt, brans, 15, f15);

    // F19 reasüransa devredilen
    const f19Oran = oranDeger("F295", brans);
    const f19 = f11.map((v) => -v * f19Oran);
    yazSatir(gt, brans, 19, f19);

    // F20 SGK
    const f20Oran = oranDeger("F290", brans);
    const f20 = f11.map((v) => -v * f20Oran);
    yazSatir(gt, brans, 20, f20);

    // F33 DERK cari (F11 × F349)
    const f33Oran = oranDeger("F349", brans);
    const f33 = f11.map((v) => v * f33Oran);
    yazSatir(gt, brans, 33, f33);

    // F96 brüt ödenen hasar (baz: F11+F22+F32). F22 ve F32 henüz 0 (KPK yok);
    // basitleştirme: baz = F11 sadece — küçük hata (F22, F32 zaten toplam 5-10%).
    const f320 = oranDeger("F320", brans);
    const f96 = f11.map((v) => -v * f320);
    yazSatir(gt, brans, 96, f96);

    // F105 reasürör hasar payı = F96 × F436 (negatif işaret düzelt)
    const f436 = oranDeger("F436", brans);
    const f105 = f96.map((v) => -v * f436);
    yazSatir(gt, brans, 105, f105);

    // F116 brüt muallak (cari)
    const f451 = oranDeger("F451", brans);
    const f116 = f11.map((v) => -v * f451);
    yazSatir(gt, brans, 116, f116);

    // F126 devreden brüt muallak
    const f456 = oranDeger("F456", brans);
    const f126 = f11.map((v) => v * f456);
    yazSatir(gt, brans, 126, f126);

    // F137 muallak RE (cari)
    const f466 = oranDeger("F466", brans);
    const f137 = f11.map((v) => v * f466);
    yazSatir(gt, brans, 137, f137);

    // F147 devreden muallak RE
    const f471 = oranDeger("F471", brans);
    const f147 = f11.map((v) => -v * f471);
    yazSatir(gt, brans, 147, f147);

    // F86 rücu = (F96 + F116) × F315 → pozitif
    const f315 = oranDeger("F315", brans);
    const f86 = f96.map((v, i) => Math.abs(v + f116[i]!) * f315);
    yazSatir(gt, brans, 86, f86);

    // F167 dengeleme = (F10 + F21) × F348 (F10 ve F21 üst toplamlar, yaklaşımla F11 kullan)
    const f348 = oranDeger("F348", brans);
    const f167 = f11.map((v) => v * f348);   // negatif zaten F348 = -0.12
    yazSatir(gt, brans, 167, f167);

    // F180 üretim komisyon = F11 × F275
    const f275 = oranDeger("F275", brans);
    const f180 = f11.map((v) => -v * f275);
    yazSatir(gt, brans, 180, f180);

    // F197 alınan RE komisyon = F11 × F300 (pozitif)
    const f300 = oranDeger("F300", brans);
    const f197 = f11.map((v) => v * f300);
    yazSatir(gt, brans, 197, f197);

    // F200 diğer faaliyet gideri
    const f383 = oranDeger("F383", brans);
    const f200 = f11.map((v) => -v * f383);
    yazSatir(gt, brans, 200, f200);

    // F201 diğer faaliyet gideri 2
    const f388 = oranDeger("F388", brans);
    const f201 = f11.map((v) => -v * f388);
    yazSatir(gt, brans, 201, f201);
  }

  // 6) Genel giderler F190-194 (şirket geneli, aylık = yıllık / 12; branşlara prim payı ile dağıt)
  const gider = varsayimlar.faaliyetGiderButce ?? {};
  const bransPrimPay: Record<string, number> = {};
  const totPrim = gt.brutPrimToplam;
  for (const b of gt.branslar) bransPrimPay[b.bransKodu] = totPrim > 0 ? b.brutPrim / totPrim : 0;
  const HESAP_TO_SATIR: Record<string, number> = { "61402": 190, "61403": 191, "61404": 192, "61405": 193, "61406": 194 };
  for (const [hesap, satir] of Object.entries(HESAP_TO_SATIR)) {
    const yillik = Number(gider[hesap]) || 0;
    for (const b of gt.branslar) {
      const pay = bransPrimPay[b.bransKodu] ?? 0;
      const brut = -yillik * pay;
      const ser = Array.from({ length: 12 }, () => brut / 12);
      yazSatir(gt, b.bransKodu, satir, ser);
    }
  }

  // 7) Mali gelir F38 (basit: kullanıcı aylık % × açılış banka bilançosu × net nakit payı)
  //    Detaylı proxy V2'de var (`buildMaliGelirProxy`) — V3 sıfırdan versiyonu şimdilik brut × pay dağıtır.
  const maliGetiri = varsayimlar.aylikGetiriOrani ?? Array(12).fill(0);
  // Basitleştirme: yıllık mali gelir = toplam prim × ort(getiri) — banka proxy sonraki iterasyona bırak.
  const ortGetiri = maliGetiri.reduce((a, x) => a + x, 0) / Math.max(1, maliGetiri.length);
  const maliYillik = totPrim * ortGetiri * 0.5;  // %50 baseline (nakit tutma varsayımı)
  const maliAylik = Array.from({ length: 12 }, (_, i) => maliYillik * ((maliGetiri[i] ?? 0) / Math.max(1e-9, maliGetiri.reduce((a, x) => a + x, 0))));
  for (const b of gt.branslar) {
    const pay = bransPrimPay[b.bransKodu] ?? 0;
    yazSatir(gt, b.bransKodu, 38, maliAylik.map((v) => v * pay));
  }

  // 8) Üst toplamları yeniden hesapla (V2 sentetik formüllerin yaklaşık versiyonu)
  const UST_FORMUL: ReadonlyArray<[number, readonly number[]]> = [
    [10, [11, 19, 20]],
    [22, [23, 24]], [25, [26, 27]], [28, [29, 30]], [21, [22, 25, 28]],
    [32, [33, 34]], [35, [36, 37]], [31, [32, 35]],
    [95, [96, 105]],
    [115, [116, 126]], [136, [137, 147]], [114, [115, 136]],
    [157, [158, 161]],
    [166, [167, 168]],
    [178, [180, 181]], [177, [178, 189]],
    [196, [197, 198]],
    [176, [177, 190, 191, 192, 193, 194, 196, 200, 201]],
    [9, [10, 21, 31, 86]],
    [94, [95, 114, 157, 166, 176, 202]],
  ];
  for (const b of gt.branslar) {
    const ab = gt.aylikBrans[b.bransKodu]!;
    for (const [hedef, parts] of UST_FORMUL) {
      const ser = Array.from({ length: 12 }, (_, ay) =>
        parts.reduce((s, p) => s + (ab[p]?.[ay] ?? 0), 0),
      );
      ab[hedef] = ser;
      b.degerler[hedef] = ser.reduce((a, x) => a + x, 0);
    }
  }
  toplamlariYenile(gt, [
    11, 15, 19, 20, 33, 96, 105, 116, 126, 137, 147, 86, 167, 180, 197, 200, 201,
    190, 191, 192, 193, 194, 38,
    ...UST_FORMUL.map(([s]) => s),
  ]);

  // 9) YTD full overlay — kapanan aylar mizanla ez
  const overlay = uygulaYtdFullOverlay(gt, mizanAylikFull, butceYili, anchorAy);
  uyarilar.push(
    `YTD full overlay: ${overlay.kilitliBransSayisi} branş × ${overlay.kilitliSatirSayisi} satır kilitlendi (anchor ${anchorAy}). ` +
      `YTD Safi TKZ = ${(overlay.ytdSafiTkz / 1e6).toFixed(1)} mio.`,
  );

  // 10) V2 sentetik satırları (TEKNİK GELİR, TEKNİK GİDER, SAFİ TKZ, TKZ)
  const gtFinal = hesaplaV2SentetikSatirlar(gt);

  // 11) Öneri motoru — kullanıcı girdileri için model önerileri
  const oneriler: V3Oneri[] = [];
  oneriler.push(...oneriTarifePrim(mizan, mizanAylikFull, butceYili, anchorAy, satisRows, varsayimlar.tarifeHedefleri ?? {}));
  oneriler.push(...oneriGenelGider(mizan, mizanAylikFull, butceYili, varsayimlar.faaliyetGiderButce ?? {}));
  oneriler.push(...oneriMaliGetiri(varsayimlar.aylikGetiriOrani ?? [], butceYili));

  const motorSonuc: V3MotorSonuc = {
    oranlar,
    mevsim: [],  // ileride F satır bazında da ekleyebiliriz
    oneriler,
    ytdOverlayDetay: {
      anchorAy,
      kilitliBransSayisi: overlay.kilitliBransSayisi,
      kilitliSatirSayisi: overlay.kilitliSatirSayisi,
      ytdSafiTkz: overlay.ytdSafiTkz,
      modelSafiTkz: overlay.modelSafiTkzOnce,
      sapmaTL: overlay.ytdSafiTkz - overlay.modelSafiTkzOnce,
    },
    uyarilar: [...uyarilar],
  };

  return {
    gt: gtFinal,
    motor: motorSonuc,
    primHedefleri,
    endirektPrim,
    toplamPrimHedef,
    ytdAnchorAy: anchorAy,
    uyarilar: [...new Set(uyarilar)],
  };
}
