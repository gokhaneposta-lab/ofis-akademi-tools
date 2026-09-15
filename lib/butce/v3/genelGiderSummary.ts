import { GENEL_GIDER_ANA_HESAPLAR } from "../config/genelGiderImportConfig";
import { anaHesapAdi } from "../import/genelGiderImportCore";
import type { FaaliyetGiderRow } from "../types";

export type GenelGiderAltSatir = {
  altHesapKodu: string;
  aciklama?: string;
  aylik: number[];
  yillik: number;
};

export type GenelGiderAnaOzet = {
  anaHesap: string;
  ad: string;
  aylik: number[];
  yillik: number;
  altHesaplar: GenelGiderAltSatir[];
};

export type GenelGiderImportOzet = {
  butceYili: number;
  satirSayisi: number;
  altHesapSayisi: number;
  anaHesaplar: GenelGiderAnaOzet[];
};

export function buildGenelGiderImportOzet(
  rows: FaaliyetGiderRow[],
  butceYili: number,
): GenelGiderImportOzet {
  const filtered = rows.filter((r) => r.butceYili === butceYili);
  const byAna = new Map<string, Map<string, GenelGiderAltSatir>>();

  for (const r of filtered) {
    const altKod = r.altHesapKodu ?? r.hesap;
    if (!byAna.has(r.hesap)) byAna.set(r.hesap, new Map());
    const altMap = byAna.get(r.hesap)!;
    if (!altMap.has(altKod)) {
      altMap.set(altKod, {
        altHesapKodu: altKod,
        aciklama: r.hesapAd,
        aylik: Array(12).fill(0),
        yillik: 0,
      });
    }
    const alt = altMap.get(altKod)!;
    if (!alt.aciklama && r.hesapAd) alt.aciklama = r.hesapAd;
    alt.aylik[r.ay - 1] = (alt.aylik[r.ay - 1] ?? 0) + r.tutar;
    alt.yillik += r.tutar;
  }

  const anaHesaplar: GenelGiderAnaOzet[] = [];
  for (const ana of GENEL_GIDER_ANA_HESAPLAR) {
    const altMap = byAna.get(ana);
    if (!altMap) continue;
    const aylik = Array(12).fill(0);
    let yillik = 0;
    const altHesaplar = [...altMap.values()].sort((a, b) =>
      a.altHesapKodu.localeCompare(b.altHesapKodu),
    );
    for (const alt of altHesaplar) {
      for (let i = 0; i < 12; i++) aylik[i] += alt.aylik[i] ?? 0;
      yillik += alt.yillik;
    }
    anaHesaplar.push({
      anaHesap: ana,
      ad: anaHesapAdi(ana),
      aylik,
      yillik,
      altHesaplar,
    });
  }

  return {
    butceYili,
    satirSayisi: filtered.length,
    altHesapSayisi: new Set(filtered.map((r) => r.altHesapKodu ?? r.hesap)).size,
    anaHesaplar,
  };
}
