import { bransAdi } from "../config/brans";
import { ORAN_REFERANS_VARSAYILAN } from "../config/constants";
import { birlestirDuzenlemeler, oranDuzenleme, V2_KUCUK_BAZ_ESIK_TL, V2_ORAN_METODOLOJI_OZET } from "../oran/oranMetodoloji";
import { oranKalemAciklama } from "../oran/oranKalemAciklama";
import { MizanOranServisi, oranKalemListesi } from "../oran/mizanOranlar";
import type { OranAyarStore } from "../types";

export type V2TeknikOranSatir = {
  kalem: string;
  ad: string;
  hesapAciklamaSatirlari: string[];
  /** Standart dışı düzeltme açıklamaları (audit). */
  duzenlemeNotlari: string[];
  duzenlemeEtiketleri: string[];
  yilOran: Record<string, number | null>;
  guncelDonemOran: number | null;
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
  guncelDonem: { yil: number; ay: number; etiket: string } | null;
  satirlar: V2TeknikOranSatir[];
  metodolojiOzet: string;
  kucukBazEsikTl: number;
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

/**
 * V2 ozet tablosunda fiilen gosterilen / hesapta etkili kalan teknik oranlar.
 * Dinamik hucre eslestirmesi gizli/ara satirlarda tum oranlari eleyebildigi icin
 * burada V2 gosterime ait kullanilan kalemleri acikca tutuyoruz.
 */
const KULLANILAN_ORAN_KODLARI = new Set([
  "0112",
  "016",
  "0211",
  "0212",
  "02211",
  "02212",
  "02221",
  "02222",
  "014",
  "0251",
  "0258",
  "0259",
  "F300",
  "F348",
  "F349",
  "F368",
]);

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
  guncelDonem: { yil: number; ay: number } | null = null,
): V2TeknikOranTablo {
  const kodlar = normalizeKodlar(Array.isArray(branslar) ? branslar : [branslar]);
  const tarihselYillar = guncelDonem
    ? servis.yillar.filter((yil) => yil < guncelDonem.yil)
    : servis.yillar;
  const yillar = tarihselYillar.slice(-4);
  const satirlar: V2TeknikOranSatir[] = [];
  const agregasyon = kodlar.length > 1;
  const etiketKod = kodlar[0] ?? "";
  const guncelDonemEtiket = guncelDonem
    ? `${guncelDonem.yil}-${String(guncelDonem.ay).padStart(2, "0")}`
    : null;

  for (const { kod, ad } of oranKalemListesi()) {
    if (!KULLANILAN_ORAN_KODLARI.has(kod)) continue;
    const oranAy = kalemAy(kod, ay);
    const ayar = grupAyar(ayarlar, kod, kodlar);
    const aciklama = oranKalemAciklama(kod);
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
    const guncelDonemOlcum = guncelDonem
      ? servis.grupYilOlcum(kod, kodlar, guncelDonem.yil, kalemAy(kod, guncelDonem.ay))
      : null;

    const referansOran = ayar.referans ?? ORAN_REFERANS_VARSAYILAN;
    const duzenlemeler = birlestirDuzenlemeler([
      ...(ayar.manuel ? [oranDuzenleme("manuel")] : []),
      ...kodlar.flatMap((br) =>
        servis.bransOranDuzenlemeleri(kod, br, referansOran, oranAy),
      ),
      ...(agregasyon && kodlar.length > 1
        ? [
            oranDuzenleme("standart", {
              detay: "Birden fazla 7xx seçili → Σpay÷Σpayda (branş ortalaması değil).",
            }),
          ]
        : []),
    ]);

    satirlar.push({
      kalem: kod,
      ad,
      hesapAciklamaSatirlari:
        aciklama?.mizanSatirlar.map((satir) => `${satir.etiket}: ${satir.formul}`) ??
        (aciklama?.mizanOranFormul ? [aciklama.mizanOranFormul] : []),
      duzenlemeNotlari: duzenlemeler.map((d) => d.aciklama),
      duzenlemeEtiketleri: [...new Set(duzenlemeler.map((d) => d.etiket))],
      yilOran,
      guncelDonemOran:
        guncelDonemOlcum?.oran == null ? null : round6(guncelDonemOlcum.oran),
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
    guncelDonem: guncelDonemEtiket
      ? { ...guncelDonem!, etiket: guncelDonemEtiket }
      : null,
    satirlar,
    metodolojiOzet: V2_ORAN_METODOLOJI_OZET,
    kucukBazEsikTl: V2_KUCUK_BAZ_ESIK_TL,
  };
}
