import { MIZAN_AYLIK_HESAP_BRUT } from "../config/constants";
import { normalizeBransKodu } from "../textUtils";
import type { MizanAylikRow } from "../types";
import { isTamYilKumul } from "../prim/mizanAylikOranlari";
import { kumuldenAylikArtis, normalizeAylikOranlar, varsayilanAylikDagilim } from "../prim/primDagilim";

function kumulDizisi(
  rows: MizanAylikRow[],
  yil: number,
  brans: string,
  hesap: string,
): number[] {
  const map = new Map<number, number>();
  for (const r of rows) {
    if (r.yil !== yil || normalizeBransKodu(r.bransKodu) !== brans) continue;
    if (String(r.hesap) !== hesap) continue;
    const ay = r.ay;
    if (ay >= 1 && ay <= 12) map.set(ay, r.tutar);
  }
  return Array.from({ length: 12 }, (_, i) => map.get(i + 1) ?? 0);
}

function bransOranFromYil(
  rows: MizanAylikRow[],
  yil: number,
  brans: string,
): number[] | null {
  const kumul = kumulDizisi(rows, yil, brans, MIZAN_AYLIK_HESAP_BRUT);
  if (!kumul.some((v) => v > 0)) return null;
  if (!isTamYilKumul(kumul)) return null;
  const aylik = kumuldenAylikArtis(kumul);
  const sum = aylik.reduce((a, b) => a + Math.max(0, b), 0);
  if (sum <= 0) return null;
  return normalizeAylikOranlar(aylik);
}

/** YTD kümülatiften aylık artış (Aralık şartı yok). Normalize edilmez. */
function ytdAylikArtis(
  rows: MizanAylikRow[],
  yil: number,
  brans: string,
  anchorAy: number,
): number[] | null {
  const kumul = kumulDizisi(rows, yil, brans, MIZAN_AYLIK_HESAP_BRUT);
  const aylik = kumuldenAylikArtis(kumul);
  const anchor = Math.min(Math.max(anchorAy, 1), 11);
  const out = Array.from({ length: 12 }, () => 0);
  let sum = 0;
  for (let i = 0; i < anchor; i++) {
    const v = Math.max(0, aylik[i] ?? 0);
    out[i] = v;
    sum += v;
  }
  if (sum <= 0) return null;
  return out;
}

/**
 * Bütçe yılı YTD mevsimselliği + geçmiş tam yıl blend.
 * YTD ayına kadar gerçekleşme payı korunur; kalan aylar geçmiş ortalamaya göre tamamlanır.
 */
export function aylikMevsimOranlari(
  rows: MizanAylikRow[],
  butceYili: number,
  brans: string,
  ytdAnchorAy: number,
  gecmisYillar: number[],
): number[] {
  const gecmisOranlar: number[][] = [];
  for (const y of gecmisYillar) {
    const kumul = kumulDizisi(rows, y, brans, MIZAN_AYLIK_HESAP_BRUT);
    if (!isTamYilKumul(kumul)) continue;
    const o = bransOranFromYil(rows, y, brans);
    if (o) gecmisOranlar.push(o);
  }

  const gecmisOrt =
    gecmisOranlar.length > 0
      ? normalizeAylikOranlar(
          Array.from({ length: 12 }, (_, i) => {
            const vals = gecmisOranlar.map((l) => l[i] ?? 0);
            return vals.reduce((a, b) => a + b, 0) / vals.length;
          }),
        )
      : varsayilanAylikDagilim();

  const ytdRaw = ytdAylikArtis(rows, butceYili, brans, ytdAnchorAy);
  if (!ytdRaw || ytdAnchorAy < 1) return gecmisOrt;

  const anchor = Math.min(Math.max(ytdAnchorAy, 1), 11);
  const ytdSum = ytdRaw.slice(0, anchor).reduce((a, b) => a + b, 0);
  const gecmisYtd = gecmisOrt.slice(0, anchor).reduce((a, b) => a + b, 0);
  const gecmisH2 = gecmisOrt.slice(anchor).reduce((a, b) => a + b, 0);
  if (ytdSum <= 0 || gecmisYtd <= 0 || gecmisH2 <= 0) return gecmisOrt;

  const impliedAnnual = ytdSum / gecmisYtd;
  const out = Array.from({ length: 12 }, () => 0);
  for (let i = 0; i < anchor; i++) out[i] = (ytdRaw[i] ?? 0) / impliedAnnual;
  const ytdPay = out.slice(0, anchor).reduce((a, b) => a + b, 0);
  const kalanPay = Math.max(0, 1 - ytdPay);
  for (let i = anchor; i < 12; i++) {
    out[i] = ((gecmisOrt[i] ?? 0) / gecmisH2) * kalanPay;
  }
  return normalizeAylikOranlar(out);
}

export function genelMevsimOranlari(
  rows: MizanAylikRow[],
  butceYili: number,
  ytdAnchorAy: number,
  gecmisYillar: number[],
): number[] {
  const branslar = [...new Set(rows.map((r) => normalizeBransKodu(r.bransKodu)))].filter(
    (b) => b && b !== "TOPLAM" && /^7\d{2}$/.test(b),
  );
  if (branslar.length === 0) return varsayilanAylikDagilim();

  const lists = branslar.map((b) =>
    aylikMevsimOranlari(rows, butceYili, b, ytdAnchorAy, gecmisYillar),
  );
  return normalizeAylikOranlar(
    Array.from({ length: 12 }, (_, i) => {
      const vals = lists.map((l) => l[i] ?? 0);
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    }),
  );
}
