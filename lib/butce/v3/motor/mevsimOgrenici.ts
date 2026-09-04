/**
 * Bütçe V3 (yeni motor) — Aylık mevsim öğrenici.
 *
 * Her (branş, GT kodu) için 12 aylık pay eğrisi (toplam = 1) üretir.
 *   1. Geçmiş tam yılların aylık kümülatif farkından ay içi tutar
 *   2. Yıllara göre normalize et (toplama böl)
 *   3. Bütçe yılı YTD (anchor'a kadar) varsa H2 payını `1 − ytdPay` ile ölçekle
 *   4. Fallback: eşit dağıtım (1/12)
 */

import type { MizanAylikRow } from "../../types";
import { normalizeBransKodu } from "../../textUtils";
import type { V3Mevsim } from "./types";

/** Kümülatiften aylık artışa çevirir (mizan-aylik tutar = yıl içi kümül). */
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

function isTamYilKumul(kumul: number[]): boolean {
  // Aralık verisi 0 değilse tam yıl sayılır (basit heuristic)
  return Math.abs(kumul[11] ?? 0) > 1;
}

function normalizeToOne(arr: number[]): number[] {
  const sum = arr.reduce((a, x) => a + Math.max(0, x), 0);
  if (sum <= 0) return arr.map(() => 1 / 12);
  return arr.map((x) => Math.max(0, x) / sum);
}

function esitDagitim(): number[] {
  return Array.from({ length: 12 }, () => 1 / 12);
}

/** Belirli (yil, brans, gtKod) için ay dizisi. */
function ayKumulatif(
  rows: MizanAylikRow[],
  yil: number,
  brans: string,
  gtKod: string,
): number[] {
  const map = new Map<number, number>();
  for (const r of rows) {
    if (Number(r.yil) !== yil) continue;
    if (normalizeBransKodu(r.bransKodu) !== brans) continue;
    if (String(r.hesap) !== gtKod) continue;
    const ay = Number(r.ay);
    if (ay >= 1 && ay <= 12) map.set(ay, Number(r.tutar) || 0);
  }
  return Array.from({ length: 12 }, (_, i) => map.get(i + 1) ?? 0);
}

/**
 * Bir (brans, gtKod) için 12 aylık pay eğrisi üret.
 */
export function ogrenTekMevsim(
  rows: MizanAylikRow[],
  brans: string,
  gtKod: string,
  butceYili: number,
  anchorAy: number,
): V3Mevsim {
  // Geçmiş tam yıllar
  const yillar = [...new Set(rows.map((r) => Number(r.yil)))]
    .filter((y) => y < butceYili)
    .sort((a, b) => a - b);

  const gecmisAyProfilleri: number[][] = [];
  for (const y of yillar) {
    const kumul = ayKumulatif(rows, y, brans, gtKod);
    if (!isTamYilKumul(kumul)) continue;
    const aylik = kumulToIncremental(kumul);
    const norm = normalizeToOne(aylik);
    gecmisAyProfilleri.push(norm);
  }

  let gecmisOrt =
    gecmisAyProfilleri.length > 0
      ? normalizeToOne(
          Array.from({ length: 12 }, (_, i) => {
            const vals = gecmisAyProfilleri.map((l) => l[i] ?? 0);
            return vals.reduce((a, b) => a + b, 0) / vals.length;
          }),
        )
      : esitDagitim();

  // YTD blend
  const ytdKumul = ayKumulatif(rows, butceYili, brans, gtKod);
  const ytdAylik = kumulToIncremental(ytdKumul);
  const anchor = Math.min(Math.max(anchorAy, 1), 11);
  const ytdSum = ytdAylik.slice(0, anchor).reduce((a, x) => a + Math.max(0, x), 0);

  if (ytdSum <= 0) {
    return { bransKodu: brans, fSatir: 0, aylikPay: gecmisOrt, ytdKaynak: gecmisAyProfilleri.length > 0 ? "gecmis_ort" : "esit_dagitim" };
  }

  // impliedAnnual: 2026 YTD gerçekleşme / geçmiş ortalama YTD payı
  const gecmisYtdPay = gecmisOrt.slice(0, anchor).reduce((a, b) => a + b, 0);
  const gecmisH2Pay = gecmisOrt.slice(anchor).reduce((a, b) => a + b, 0);
  if (gecmisYtdPay <= 0 || gecmisH2Pay <= 0) {
    return { bransKodu: brans, fSatir: 0, aylikPay: gecmisOrt, ytdKaynak: "gecmis_ort" };
  }

  const impliedAnnual = ytdSum / gecmisYtdPay;
  const out = Array.from({ length: 12 }, () => 0);
  for (let i = 0; i < anchor; i++) out[i] = Math.max(0, ytdAylik[i] ?? 0) / impliedAnnual;
  const ytdPay = out.slice(0, anchor).reduce((a, b) => a + b, 0);
  const kalanPay = Math.max(0, 1 - ytdPay);
  for (let i = anchor; i < 12; i++) {
    out[i] = ((gecmisOrt[i] ?? 0) / gecmisH2Pay) * kalanPay;
  }

  return {
    bransKodu: brans,
    fSatir: 0,
    aylikPay: normalizeToOne(out),
    ytdKaynak: "ytd_blend",
  };
}
