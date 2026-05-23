/** Panel bazlı “Nasıl okunur?” maddeleri — `TsbPageLayout` + collapsible yardım. */

export type TsbPanelHelpEntry = {
  href: string;
  items: readonly string[];
};

export const TSB_PANEL_HELP: readonly TsbPanelHelpEntry[] = [
  {
    href: "/sigorta/finansal-karsilastirma",
    items: [
      "Havuz (hayat dışı / hayat–emeklilik) ve çeyrek seçin; sol sütun odak şirket, sağ sütun sektör toplamı veya başka bir şirket.",
      "TL satırları tutarları, oran satırları yüzde gösterir; Δ sütunu önceki yılın aynı çeyreğine göre değişimi.",
      "Sektör toplamı havuzdaki tüm şirketlerin birleşik tutarlarından hesaplanır (ortalama değil).",
    ],
  },
  {
    href: "/sigorta/hasar-prim-orani",
    items: [
      "Hasar/prim (H/P) oranı: gerçekleşen hasarın kazanılmış prime oranı; genelde düşük oran daha iyi teknik sonuç anlamına gelir.",
      "Branş veya tarife grubu ile kırılımı daraltın; odak şirket tabloda vurgulanır, grafikte sütunlarla izlenir.",
      "Grafik: yeşil/mavi sütunlar şirket brüt/net H/P; gri kesik çizgi sektör brüt H/P. Tabloda DERK dahil/hariç dört varyant vardır.",
      "Sektör sıralaması brüt H/P (DERK dahil) artan; YoY Δ artışı kırmızı (kötüleşme), düşüşü yeşil.",
    ],
  },
  {
    href: "/sigorta/kanal-prim",
    items: [
      "Hayat dışı ve hayat–emeklilik şirketleri ayrı bloklarda listelenir.",
      "Dönem, kanal ve ana branş / tarife grubu ile tabloyu daraltın; sıra ve pay sütunları sektör içindeki konumu gösterir.",
    ],
  },
  {
    href: "/sigorta/kanal-dagilim",
    items: [
      "Odak şirketin kanal paylarını aynı dönemde sektör dağılımı ile karşılaştırın.",
      "Kanal seçimi ve branş/tarife daraltması tablodaki pay yüzdelerini günceller.",
    ],
  },
  {
    href: "/sigorta/brans-degisim",
    items: [
      "Sol blok odak şirket, sağ blok sektör toplamı veya seçtiğiniz başka bir şirket.",
      "Önceki yılın aynı ayı ile prim ve pazar payı (pp) değişimini okuyun; pay her zaman odak şirket · sektör bazındadır.",
    ],
  },
  {
    href: "/sigorta/brans-sira",
    items: [
      "Branş veya tarife satırında şirket primi, sektör ağırlığı ve sıra bilgisi yan yana.",
      "Δ sıra: iyileşme yeşil, kötüleşme kırmızı (düşük sıra daha iyi).",
    ],
  },
  {
    href: "/sigorta/prim-trend-12",
    items: [
      "Seçilen bitiş ayına kadar geriye en fazla 12 ay; kırmızı çizgi sektör, yeşil çizgi odak şirket.",
      "Alttaki sütunlar aylık üretim farkını (kümülatif çizgiden türetilmiş) gösterir.",
    ],
  },
] as const;

export function tsbPanelHelpForHref(href: string): readonly string[] {
  return TSB_PANEL_HELP.find((e) => e.href === href)?.items ?? [];
}
