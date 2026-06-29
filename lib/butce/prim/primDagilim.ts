import { AYLAR } from "../config/constants";

/** Varsayılan aylık paylar (toplam 1) — üretim/MIZAN yoksa. */
export function varsayilanAylikDagilim(): number[] {
  return [0.07, 0.075, 0.085, 0.09, 0.09, 0.085, 0.08, 0.075, 0.085, 0.09, 0.09, 0.085];
}

export function normalizeAylikOranlar(oranlar: number[]): number[] {
  const sum = oranlar.reduce((a, o) => a + Math.max(0, o), 0);
  if (sum <= 0) return varsayilanAylikDagilim();
  return oranlar.map((o) => Math.max(0, o) / sum);
}

/** Kümülatif 12 ay → aylık artış (Ocak…Aralık). */
export function kumuldenAylikArtis(kumul: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < 12; i++) {
    const cur = kumul[i] ?? 0;
    const prev = i > 0 ? (kumul[i - 1] ?? 0) : 0;
    out.push(cur - prev);
  }
  return out;
}

export function dagitAylik(yillikPrim: number, aylikOranlar: number[]): number[] {
  const oran = normalizeAylikOranlar(aylikOranlar);
  return oran.map((o) => yillikPrim * o);
}

export type AylikPrimSatir = {
  bransKodu: string;
  aylar: number[];
  toplam: number;
};

export function createAylikDagilimTablosu(
  primHedefleri: Record<string, number>,
  aylikOranlarBrans: Record<string, number[]> | null,
  genelOranlar: number[],
): AylikPrimSatir[] {
  const rows: AylikPrimSatir[] = [];
  for (const [bransKodu, yillik] of Object.entries(primHedefleri)) {
    if (yillik <= 0) continue;
    const oran =
      aylikOranlarBrans?.[bransKodu] && aylikOranlarBrans[bransKodu].some((x) => x > 0)
        ? aylikOranlarBrans[bransKodu]
        : genelOranlar;
    const aylar = dagitAylik(yillik, oran);
    rows.push({
      bransKodu,
      aylar,
      toplam: aylar.reduce((a, b) => a + b, 0),
    });
  }
  return rows;
}

export function aylikTabloToMatrix(rows: AylikPrimSatir[]): Record<string, number | string>[] {
  return rows.map((r) => {
    const row: Record<string, number | string> = { bransKodu: r.bransKodu, Toplam: r.toplam };
    AYLAR.forEach((ay, i) => {
      row[ay] = r.aylar[i];
    });
    return row;
  });
}
