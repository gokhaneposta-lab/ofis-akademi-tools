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

export function buildV2TeknikOranTablo(
  servis: MizanOranServisi,
  bransKodu: string,
  ayarlar: OranAyarStore,
  ay = 12,
): V2TeknikOranTablo {
  const yillar = servis.yillar.slice(-4);
  const satirlar: V2TeknikOranSatir[] = [];

  for (const { kod, ad } of oranKalemListesi()) {
    const oranAy = kalemAy(kod, ay);
    const ayar = ayarlar[kod]?.[bransKodu] ?? {};
    const referans = ayar.referans ?? ORAN_REFERANS_VARSAYILAN;
    const manuel = ayar.manuel ?? false;
    const sistemOran = servis.bransOrani(kod, bransKodu, ORAN_REFERANS_VARSAYILAN, oranAy);
    const uygulanan =
      manuel && ayar.oran != null
        ? ayar.oran
        : servis.bransOrani(kod, bransKodu, referans, oranAy);

    const yilOran: Record<string, number | null> = {};
    for (const yil of yillar) {
      const olcum = servis.yilOlcum(kod, bransKodu, yil, oranAy);
      yilOran[String(yil)] = olcum?.oran == null ? null : round6(olcum.oran);
    }

    satirlar.push({
      kalem: kod,
      ad,
      yilOran,
      sistemOran: round6(sistemOran),
      uygulanan: round6(uygulanan),
      manuel,
      referans,
    });
  }

  return {
    bransKodu,
    bransAdi: bransAdi(bransKodu),
    ay,
    yillar,
    satirlar,
  };
}
