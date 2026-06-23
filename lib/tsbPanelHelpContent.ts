/** Panel bazlı “Nasıl okunur?” maddeleri — `TsbPageLayout` + collapsible yardım. */

export type TsbPanelHelpEntry = {
  href: string;
  items: readonly string[];
};

export const TSB_PANEL_HELP: readonly TsbPanelHelpEntry[] = [
  {
    href: "/sigorta/finansal-karsilastirma",
    items: [
      "Önce havuz seçin: hayat dışı veya hayat–emeklilik. Sonra çeyreği (ör. 2026-1) belirleyin.",
      "Sol sütun odak şirketiniz; sağ sütun sektör toplamı veya seçtiğiniz başka bir şirket.",
      "TL satırları tutar, oran satırları yüzdedir. Δ sütunu bir önceki yılın aynı çeyreğine göre farkı gösterir.",
      "Sektör toplamı = havuzdaki tüm şirketlerin toplamı (ortalama değil).",
    ],
  },
  {
    href: "/sigorta/olcek-segmentasyon",
    items: [
      "Dönem seçici yok — sınıflandırma her zaman son finansal çeyreğe (GT/BL) göredir.",
      "Şirket grubu: hayat dışı (HD) ve hayat–emeklilik ayrı havuzlarda segmentlenir.",
      "Brüt prim, özsermaye ve toplam aktif ölçek skorunun girdileridir (%50 / %30 / %20).",
      "A+…D segment filtresi ile o gruptaki tüm şirketleri görebilirsiniz; sektör sırası = havuz geneli, segment sırası = aynı harf içinde.",
    ],
  },
  {
    href: "/sigorta/hasar-prim-orani",
    items: [
      "Hasar/prim (H/P): gerçekleşen hasarın kazanılmış prime oranı. Düşük oran genelde daha iyi teknik sonuç demektir.",
      "Bu paneldeki «Branş» gelir tablosu dilimidir (GT — bransAp). Prim panellerindeki «Ana branş (TSB)» farklı bir sınıflandırmadır.",
      "Grafikte yeşil/mavi sütunlar şirketin brüt/net H/P değeri; gri kesik çizgi sektör brüt H/P referansıdır.",
      "Tabloda DERK dahil/hariç dört varyant vardır. Sıra tablosunda YoY artış kırmızı, düşüş yeşil gösterilir.",
    ],
  },
  {
    href: "/sigorta/kanal-prim",
    items: [
      "Hayat dışı ile hayat–emeklilik şirketleri ayrı listelenir; karışık okumayın.",
      "Dönem = ay (ör. 2026-05). Kanal filtresi tabloyu daraltır; «Genel toplam» tüm kanalları birleştirir.",
      "Ana branş (TSB) veya tarife grubu ile ürün dilimini seçin. «Tüm branşlar» = seçili havuzdaki genel toplam.",
      "Sıra: küçük numara daha iyi. Bu yıl sıra rengi = geçen yıla göre iyileşme (yeşil), aynı (sarı), düşüş (kırmızı).",
    ],
  },
  {
    href: "/sigorta/kanal-dagilim",
    items: [
      "Odak şirketin kanal paylarını (merkez, acente, banka…) sektör dağılımı ile yan yana görürsünüz.",
      "Grafikte sol koyu çubuk = şirket, sağ açık çubuk = sektör; her kanal kendi renk zemininde. Her ikisi de kendi toplam primine göre %100 dağılım gösterir.",
      "«Kanalda %» = o kanalda şirket priminin sektör primine oranı (pazar payı gibi düşünün).",
    ],
  },
  {
    href: "/sigorta/brans-degisim",
    items: [
      "Sol blok odak şirket; sağ blok sektör toplamı veya seçtiğiniz kıyas şirketi.",
      "Değişim % ve Δ pp bir önceki yılın aynı ayına göredir.",
      "Pay sütunu her zaman odak şirket ÷ sektör mantığındadır.",
    ],
  },
  {
    href: "/sigorta/brans-sira",
    items: [
      "Her satırda branş/tarife, şirket primi, sektör ağırlığı ve sıra bilgisi yan yana.",
      "Δ sıra: yeşil = sıra iyileşti (daha küçük numara), kırmızı = kötüleşti.",
    ],
  },
  {
    href: "/sigorta/prim-trend-12",
    items: [
      "Seçilen bitiş ayından geriye en fazla 12 ay gösterilir.",
      "Yeşil çizgi odak şirket, kırmızı çizgi sektör toplamıdır.",
      "Alttaki sütunlar aylık üretim farkını gösterir (kümülatif trendden türetilir).",
    ],
  },
] as const;

export function tsbPanelHelpForHref(href: string): readonly string[] {
  return TSB_PANEL_HELP.find((e) => e.href === href)?.items ?? [];
}
