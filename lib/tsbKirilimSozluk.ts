/** TSB panellerinde "branş" / "ana branş" kavramları — kullanıcı referans tablosu. */

export type TsbKirilimSatir = {
  kavram: string;
  veriKaynagi: string;
  hangiPaneller: string;
  ornek: string;
  not?: string;
};

export const TSB_KIRILIM_TABLOSU: readonly TsbKirilimSatir[] = [
  {
    kavram: "Ana branş (TSB)",
    veriKaynagi: "Aylık prim istatistiği · `anaBransH`",
    hangiPaneller:
      "Kanal prim, Kanal dağılım, Branş değişim, Branş sıra, Son 12 ay prim",
    ornek: "KAZA, KASKO, KARA ARAÇLARI SORUMLULUK",
    not: "TSB’nin prim tablolarındaki üst branş sınıflandırmasıdır.",
  },
  {
    kavram: "Branş (gelir tablosu)",
    veriKaynagi: "Çeyreklik gelir tablosu · `bransAp`",
    hangiPaneller: "Hasar / prim oranı, Finansal karşılaştırma",
    ornek: "HAYATDISI, TRAFİK, KASKO, YANGIN",
    not: "GT sayfa adıdır; prim panellerindeki ana branş listesiyle birebir aynı değildir.",
  },
  {
    kavram: "Tarife grubu",
    veriKaynagi: "Prim istatistiği + branş eşleme tablosu",
    hangiPaneller: "Tüm prim panelleri (alternatif daraltma)",
    ornek: "TRAFİK, DASK, KASKO, SAĞLIK",
    not: "Ana branş yerine tarife dilimiyle filtrelemek için kullanılır.",
  },
] as const;

/** TSB şirket kodu 3xxx = hayat / emeklilik havuzu (kullanıcıya açıklama). */
export const TSB_HAVUZ_ACIKLAMA = {
  hayatdisi:
    "Hayat dışı havuz: şirket tipi HD olan şirketler. Kodu 3000–3999 ile başlayan hayat/emeklilik şirketleri bu grupta yer almaz.",
  hayat:
    "Hayat & emeklilik havuz: şirket kodu 3 ile başlayanlar veya TSB tipi H (hayat) / E (emeklilik) olan şirketler.",
} as const;

export const TSB_TUM_BRANS_LABEL = {
  hayatdisi: "Tüm branşlar (hayat dışı)",
  hayat: "Tüm branşlar (hayat & emeklilik)",
} as const;
