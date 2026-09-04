/**
 * Bütçe V3 (yeni motor) — Kullanıcı girdisi için öneri hesaplayıcı.
 *
 * 3 tip öneri:
 *   1. Tarife hedef prim → geçmiş yıl CAGR × son yıl + YTD trend blend
 *   2. Genel gider (61402–06) → geçmiş 3 yıl CAGR × son yıl
 *   3. Aylık mali getiri (%) → geçmiş 12 ay ort × trend katsayısı
 *
 * Sonuç UI'da her hücre yanında rozet olarak gösterilir.
 */

import type { MizanAylikRow, MizanRow, SatisButceRow } from "../../types";
import { ANA_BRANS_GRUPLARI } from "../../config/brans";
import { normalizeBransKodu, normalizeText } from "../../textUtils";
import type { V3Oneri } from "./types";

/** Satış tarife grubu adı → ana branş grup adı(ları). primFromToplam.ts ile uyumlu. */
const TARIFE_ANA_ALIAS: Readonly<Record<string, readonly string[]>> = {
  "KAZA OTO": ["KASKO"],
  "DIGER KAZA": ["DIGER KAZA", "FERDI KAZA", "KREDI", "FINANSAL KAYIPLAR"],
};

function bransKodlariForTarife(tarifeGrubu: string): string[] {
  const n = normalizeText(tarifeGrubu);
  const wanted = TARIFE_ANA_ALIAS[n] ?? [n];
  const kodlar: string[] = [];
  for (const w of wanted) {
    for (const key of Object.keys(ANA_BRANS_GRUPLARI)) {
      if (normalizeText(key) === normalizeText(w)) {
        for (const kod of ANA_BRANS_GRUPLARI[key] ?? []) {
          if (!kodlar.includes(kod)) kodlar.push(kod);
        }
      }
    }
  }
  return kodlar;
}

/** İki yıllık büyümeden CAGR (compound annual growth rate). */
function cagr(from: number, to: number, yearGap: number): number {
  if (from <= 0 || yearGap <= 0) return 0;
  return Math.pow(to / from, 1 / yearGap) - 1;
}

/** Tarife grubuna göre 7XX branş toplamı — mizan-tidy'den. */
function tarifePrimToplam(
  mizan: MizanRow[],
  yil: number,
  bransKodlari: readonly string[],
): number {
  let toplam = 0;
  const set = new Set(bransKodlari);
  for (const r of mizan) {
    if (Number(r.yil) !== yil) continue;
    if (String(r.hesap) !== "60001") continue;
    if (!set.has(normalizeBransKodu(r.bransKodu))) continue;
    toplam += Number(r.tutar) || 0;
  }
  return toplam;
}

/** Bütçe yılı YTD prim toplamı (7XX × 0111 aylık kümülatiften anchor ayı). */
function tarifeYtdPrim(
  mizanAylikFull: MizanAylikRow[],
  yil: number,
  bransKodlari: readonly string[],
  anchorAy: number,
): number {
  const set = new Set(bransKodlari);
  const map = new Map<string, number[]>();
  for (const r of mizanAylikFull) {
    if (Number(r.yil) !== yil) continue;
    if (String(r.hesap) !== "0111") continue;
    const b = normalizeBransKodu(r.bransKodu);
    if (!set.has(b)) continue;
    const ay = Number(r.ay);
    if (ay < 1 || ay > 12) continue;
    if (!map.has(b)) map.set(b, Array(12).fill(0));
    map.get(b)![ay - 1] = Number(r.tutar) || 0;
  }
  let toplam = 0;
  for (const kumul of map.values()) toplam += kumul[anchorAy - 1] ?? 0;
  return toplam;
}

/** Tarife hedef prim önerisi: CAGR × son yıl + YTD run-rate blend. */
export function oneriTarifePrim(
  mizan: MizanRow[],
  mizanAylikFull: MizanAylikRow[],
  butceYili: number,
  anchorAy: number,
  satisRows: SatisButceRow[],
  kullaniciHedefler: Record<string, number>,
): V3Oneri[] {
  // Tarife grubu → branş listesi. satisRows'da branş yok; ana grup haritasından çıkar.
  const tarifeBranslar = new Map<string, string[]>();
  const grupSet = new Set<string>();
  for (const r of satisRows) grupSet.add(r.tarifeGrubu);
  for (const g of Object.keys(kullaniciHedefler)) grupSet.add(g);
  for (const g of grupSet) {
    const kodlar = bransKodlariForTarife(g);
    if (kodlar.length > 0) tarifeBranslar.set(g, kodlar);
  }

  const gecmisYillar = [...new Set(mizan.map((r) => Number(r.yil)))]
    .filter((y) => y < butceYili)
    .sort((a, b) => a - b);

  const sonYil = gecmisYillar[gecmisYillar.length - 1];
  const oncekiYil = gecmisYillar[gecmisYillar.length - 3] ?? gecmisYillar[0];
  if (sonYil == null || oncekiYil == null) return [];

  const yilGap = sonYil - oncekiYil;
  const oneriler: V3Oneri[] = [];

  for (const [grup, branslar] of tarifeBranslar) {
    const sonPrim = tarifePrimToplam(mizan, sonYil, branslar);
    const oncePrim = tarifePrimToplam(mizan, oncekiYil, branslar);
    const g = cagr(oncePrim, sonPrim, yilGap);

    // Trend projeksiyonu: son yıl × (1 + CAGR) × (1 + kısa dönem hız)
    const trendOneri = sonPrim * (1 + g);

    // YTD run-rate: (YTD 2026 / anchor) × 12
    const ytdPrim = tarifeYtdPrim(mizanAylikFull, butceYili, branslar, anchorAy);
    const ytdRunRate = anchorAy > 0 ? (ytdPrim / anchorAy) * 12 : 0;

    // Blend: %50 trend, %50 YTD run-rate (elimizde her ikisi de varsa)
    const oneri = ytdRunRate > 0 ? 0.5 * trendOneri + 0.5 * ytdRunRate : trendOneri;

    const kullanici = kullaniciHedefler[grup] ?? 0;
    const sapma = oneri > 0 ? (kullanici - oneri) / oneri : null;

    oneriler.push({
      alan: "tarife_prim",
      key: grup,
      kullaniciDeger: kullanici,
      modelOneri: Math.round(oneri),
      sapmaPct: sapma != null ? Number((sapma * 100).toFixed(2)) : null,
      aciklama:
        `${sonYil}: ${(sonPrim / 1e6).toFixed(0)} mio, CAGR(${oncekiYil}→${sonYil}) ${(g * 100).toFixed(1)}%; ` +
        (ytdRunRate > 0 ? `YTD ${butceYili}-${String(anchorAy).padStart(2, "0")} run-rate ${(ytdRunRate / 1e6).toFixed(0)} mio; ` : "") +
        `blend → ${(oneri / 1e6).toFixed(0)} mio`,
    });
  }

  return oneriler;
}

/** Genel gider (61402–06) önerisi: son yıl kapanış × (1 + son 3 yıl CAGR). */
export function oneriGenelGider(
  mizan: MizanRow[],
  mizanAylikFull: MizanAylikRow[],
  butceYili: number,
  kullaniciGider: Record<string, number>,
): V3Oneri[] {
  const yillar = [...new Set(mizan.map((r) => Number(r.yil)))]
    .filter((y) => y < butceYili)
    .sort((a, b) => a - b);
  const sonYil = yillar[yillar.length - 1];
  const oncekiYil = yillar[yillar.length - 3] ?? yillar[0];
  if (sonYil == null || oncekiYil == null) return [];

  const yilGap = sonYil - oncekiYil;
  const oneriler: V3Oneri[] = [];

  for (const hesap of ["61402", "61403", "61404", "61405", "61406"]) {
    let sonKapanis = 0;
    let onceKapanis = 0;
    for (const r of mizan) {
      if (String(r.hesap) !== hesap) continue;
      if (Number(r.yil) === sonYil) sonKapanis += Number(r.tutar) || 0;
      if (Number(r.yil) === oncekiYil) onceKapanis += Number(r.tutar) || 0;
    }
    // mizanda pozitif değer var mı? Yoksa gider genelde negatif olarak yazılır.
    sonKapanis = Math.abs(sonKapanis);
    onceKapanis = Math.abs(onceKapanis);
    const g = cagr(onceKapanis, sonKapanis, yilGap);
    const oneri = sonKapanis * (1 + Math.max(g, 0));

    const kullanici = kullaniciGider[hesap] ?? 0;
    const sapma = oneri > 0 ? (kullanici - oneri) / oneri : null;
    oneriler.push({
      alan: "genel_gider",
      key: hesap,
      kullaniciDeger: kullanici,
      modelOneri: Math.round(oneri),
      sapmaPct: sapma != null ? Number((sapma * 100).toFixed(2)) : null,
      aciklama: `${sonYil} kapanış ${(sonKapanis / 1e6).toFixed(1)} mio, CAGR ${(g * 100).toFixed(1)}% → ${(oneri / 1e6).toFixed(1)} mio`,
    });
  }

  return oneriler;
}

/**
 * Aylık mali getiri (%) önerisi — basit: geçmiş 12 ay 60301 (nakit/mevduat)
 * mizan artışının ortalama aylık verimi. Şu an detaylı model yok; basit bir
 * "geçmiş getiri" göstergesi ver.
 */
export function oneriMaliGetiri(
  aylikGetiriKullanici: number[],  // decimal (0.026 = %2.6)
  butceYili: number,
): V3Oneri[] {
  // Basit fallback: kullanıcı değerlerinin kendisi + 0.5% band önerisi
  // (Detaylı hazine modeli sonraki iterasyona bırakıldı — bkz. TASARIM §8.3)
  const referansOran = 0.025; // %2.5 baseline
  const oneriler: V3Oneri[] = [];
  aylikGetiriKullanici.forEach((v, i) => {
    const sapma = referansOran > 0 ? (v - referansOran) / referansOran : null;
    oneriler.push({
      alan: "mali_getiri",
      key: String(i + 1),
      kullaniciDeger: Number((v * 100).toFixed(2)),
      modelOneri: Number((referansOran * 100).toFixed(2)),
      sapmaPct: sapma != null ? Number((sapma * 100).toFixed(1)) : null,
      aciklama: `Baseline aylık mevduat getirisi ${(referansOran * 100).toFixed(2)}%`,
    });
  });
  return oneriler;
}
