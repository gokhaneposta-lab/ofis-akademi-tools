import { bransAdi } from "../config/brans";
import { ORAN_REFERANS_VARSAYILAN } from "../config/constants";
import { MizanOranServisi, oranKalemListesi } from "../oran/mizanOranlar";
import type { OranAyarStore } from "../types";

export type V2TeknikOranSatir = {
  kalem: string;
  ad: string;
  yilOran: Record<string, number | null>;
  sistemOran: number;
  uygulanan: number;
  manuel: boolean;
  referans: string;
};

export type V2TeknikOranTablo = {
  bransKodu: string;
  bransAdi: string;
  bransKodlari: string[];
  agregasyon: boolean;
  ay: number;
  yillar: number[];
  satirlar: V2TeknikOranSatir[];
};

function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

function kalemAy(kalem: string, ay: number): number {
  return kalem === "F349" ? 12 : ay;
}

function normalizeKodlar(branslar: readonly string[]): string[] {
  return [...new Set(branslar.filter((k) => /^7\d{2}$/.test(k)))];
}

function grupAyar(
  ayarlar: OranAyarStore,
  kalem: string,
  kodlar: readonly string[],
): { manuel: boolean; referans: string; oran: number | null } {
  if (kodlar.length === 0) {
    return { manuel: false, referans: ORAN_REFERANS_VARSAYILAN, oran: null };
  }
  const hepsiManuel = kodlar.every((k) => ayarlar[kalem]?.[k]?.manuel);
  if (!hepsiManuel) {
    return { manuel: false, referans: ORAN_REFERANS_VARSAYILAN, oran: null };
  }
  const ilk = ayarlar[kalem]?.[kodlar[0]!]?.oran ?? 0;
  const ayni = kodlar.every((k) => Math.abs((ayarlar[kalem]?.[k]?.oran ?? 0) - ilk) < 1e-8);
  return {
    manuel: true,
    referans: "manuel",
    oran: ayni ? ilk : null,
  };
}

export function buildV2TeknikOranTablo(
  servis: MizanOranServisi,
  branslar: string | readonly string[],
  ayarlar: OranAyarStore,
  ay = 12,
): V2TeknikOranTablo {
  const kodlar = normalizeKodlar(Array.isArray(branslar) ? branslar : [branslar]);
  const yillar = servis.yillar.slice(-4);
  const satirlar: V2TeknikOranSatir[] = [];
  const agregasyon = kodlar.length > 1;
  const etiketKod = kodlar[0] ?? "";

  for (const { kod, ad } of oranKalemListesi()) {
    const oranAy = kalemAy(kod, ay);
    const ayar = grupAyar(ayarlar, kod, kodlar);
    const sistemOran = servis.grupOrani(kod, kodlar, ORAN_REFERANS_VARSAYILAN, oranAy);
    const uygulanan =
      ayar.manuel && ayar.oran != null
        ? ayar.oran
        : servis.grupOrani(kod, kodlar, ayar.referans, oranAy);

    const yilOran: Record<string, number | null> = {};
    for (const yil of yillar) {
      const olcum = servis.grupYilOlcum(kod, kodlar, yil, oranAy);
      yilOran[String(yil)] = olcum?.oran == null ? null : round6(olcum.oran);
    }

    satirlar.push({
      kalem: kod,
      ad,
      yilOran,
      sistemOran: round6(sistemOran),
      uygulanan: round6(uygulanan),
      manuel: ayar.manuel && ayar.oran != null,
      referans: ayar.referans,
    });
  }

  return {
    bransKodu: agregasyon ? kodlar.join("+") : etiketKod,
    bransAdi: agregasyon
      ? kodlar.map((k) => `${k} ${bransAdi(k)}`).join(" + ")
      : bransAdi(etiketKod),
    bransKodlari: kodlar,
    agregasyon,
    ay,
    yillar,
    satirlar,
  };
}
