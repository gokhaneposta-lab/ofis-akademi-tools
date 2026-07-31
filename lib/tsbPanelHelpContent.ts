/** Panel bazlı “Nasıl okunur?” maddeleri — `TsbPageLayout` + collapsible yardım. */

export type TsbPanelHelpEntry = {
  href: string;
  items: readonly string[];
};

export const TSB_PANEL_HELP: readonly TsbPanelHelpEntry[] = [
  {
    href: "/sigorta/finansal-karsilastirma",
    items: [
      "Önce havuz seçin: hayat dışı veya hayat–emeklilik. Sonra çeyreği belirleyin.",
      "Sol sütun odak şirketiniz; sağ sütun sektör toplamı veya seçtiğiniz başka bir şirket.",
      "TL satırları tutar, oran satırları yüzdedir. Δ sütunu bir önceki yılın aynı çeyreğine göre farkı gösterir.",
    ],
  },
  {
    href: "/sigorta/olcek-segmentasyon",
    items: [
      "Şirketler brüt prim, özsermaye ve toplam aktife göre A+…D gruplarına ayrılır.",
      "Hayat dışı ve hayat–emeklilik şirketleri ayrı havuzlarda değerlendirilir.",
      "Segment filtresi ile aynı gruptaki tüm şirketleri listeleyebilirsiniz.",
    ],
  },
  {
    href: "/sigorta/sirket-karne",
    items: [
      "Havuz, prim ayı ve şirketi seçin.",
      "Özet sekmesinde prim, finansal göstergeler, kanal dağılımı ve trend görünür.",
      "Diğer sekmelerden ilgili detay panellerine geçebilirsiniz.",
    ],
  },
  {
    href: "/sigorta/ana-brans-tkz",
    items: [
      "Satırlar TSB ana branş adlarıyla görünür; rakamlar gelir tablosu branşlarından hesaplanır.",
      "Teknik gelir: teknik gelir − tek. olmayan bölümden aktarılan yatırım gelirleri. Teknik gider: teknik gider − genel gider. TKZ: ikisinin toplamı.",
      "Sağ blok sektör toplamı, benzer ölçek ortalaması veya başka bir şirket olabilir.",
    ],
  },
  {
    href: "/sigorta/hasar-prim-orani",
    items: [
      "Hasar/prim (H/P): gerçekleşen hasarın kazanılmış prime oranı. Düşük oran genelde daha iyi teknik sonuç demektir.",
      "Grafikte yeşil/mavi sütunlar şirketin brüt/net H/P değeri; gri kesik çizgi sektör referansıdır.",
      "Tabloda brüt ve net; Devam Eden Riskler Karşılığı (DERK) dahil veya hariç seçenekleri vardır.",
    ],
  },
  {
    href: "/sigorta/kanal-prim",
    items: [
      "Hayat dışı ile hayat–emeklilik şirketleri ayrı listelenir.",
      "Dönem ay bazlıdır. Kanal ve branş filtreleri tabloyu daraltır.",
      "Sıra: küçük numara daha yüksek üretim. Sıra değişimi renklerle gösterilir.",
    ],
  },
  {
    href: "/sigorta/kanal-dagilim",
    items: [
      "Odak şirketin kanal paylarını sektör dağılımı ile yan yana görürsünüz.",
      "Her kanalda şirketin sektör içindeki payı ayrıca gösterilir.",
    ],
  },
  {
    href: "/sigorta/brans-degisim",
    items: [
      "Sol blok odak şirket; sağ blok sektör veya seçtiğiniz kıyas şirketi.",
      "Değişim ve pay farkı bir önceki yılın aynı ayına göredir.",
    ],
  },
  {
    href: "/sigorta/brans-sira",
    items: [
      "Her satırda branş, şirket primi, sektör ağırlığı ve sıra bilgisi yan yana.",
      "Sıra değişimi: yeşil iyileşme, kırmızı kötüleşme.",
    ],
  },
  {
    href: "/sigorta/prim-trend-12",
    items: [
      "Seçilen bitiş ayından geriye en fazla 12 ay gösterilir.",
      "Üst grafik yıl içi birikimli prim; alt grafik aylık üretim. Yeşil odak şirket, gri sektör.",
    ],
  },
  {
    href: "/sigorta/pazar-yogunlasma",
    items: [
      "Yoğunlaşma endeksi (HHI): pazar paylarının karesi toplamı. Yüksek değer = pazar daha az şirkette toplanmış demektir.",
      "Hesap aylık prim üzerinden yapılır; branş ve kanal filtresi değişince endeks de değişir.",
      "URL’de şirket seçiliyse tabloda odak şirket vurgulanır.",
    ],
  },
] as const;

export function tsbPanelHelpForHref(href: string): readonly string[] {
  return TSB_PANEL_HELP.find((e) => e.href === href)?.items ?? [];
}
