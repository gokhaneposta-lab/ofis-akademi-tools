/**
 * TSB dashboard sayfaları — indekslenebilir SEO metni ve FAQ (ekranda görünür + JSON-LD).
 */

import type { TsbSeoPageId } from "@/lib/tsbSeo";

export type TsbSeoFaq = { question: string; answer: string };

export type TsbSeoContent = {
  heading: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
  faqs: readonly TsbSeoFaq[];
  blogSlugs?: readonly string[];
};

const COMMON_FAQS: readonly TsbSeoFaq[] = [
  {
    question: "TSB verileri ne sıklıkla güncellenir?",
    answer:
      "Prim panelleri TSB aylık prim istatistikleriyle; finansal karşılaştırma ve hasar/prim oranı panelleri çeyreklik gelir tablosu verileriyle beslenir. Hub sayfasındaki veri durumu bandında son prim dönemi, son finansal çeyrek ve dosya güncelleme tarihi gösterilir.",
  },
  {
    question: "Ofis Akademi TSB verisini resmi siteden farklı mı sunuyor?",
    answer:
      "Kaynak Türkiye Sigortalar Birliği kamuya açık istatistikleridir. Ofis Akademi veriyi birleştirir, filtreler ve karşılaştırmalı dashboard'lara dönüştürür — şirket–sektör kıyası, kanal payı, branş sırası gibi analizler resmi Excel/PDF'lerde tek tıkla yapılamaz.",
  },
  {
    question: "Hayat dışı ile hayat–emeklilik havuzu neden ayrı?",
    answer:
      "TSB şirketleri tip ve kod bazında farklı havuzlarda raporlar. Kodu 3 ile başlayan hayat/emeklilik şirketleri ile hayat dışı (HD) şirketlerin prim ve finansal tabloları karıştırılmamalıdır; panellerde havuz seçimi bu ayrımı korur.",
  },
];

export const TSB_SEO_CONTENT: Record<TsbSeoPageId | "hub", TsbSeoContent> = {
  hub: {
    heading: "TSB prim ve finansal istatistiklerini tek yerden takip edin",
    paragraphs: [
      "Türkiye Sigortalar Birliği (TSB) her ay prim üretimi, her çeyrek finansal tablolar yayımlar. Sektör profesyonelleri için asıl ihtiyaç ham tabloyu indirmek değil; kendi şirketinizi sektörle, kanalı kanalla, branşı branşla hızlı kıyaslamaktır. Ofis Akademi TSB dashboard grubu bu karşılaştırmayı tarayıcıda, filtrelenebilir panellerle sunar.",
      "Prim tarafında kanal bazlı üretim, kanal dağılım payları, branş değişim tablosu, branş sıra özeti ve son 12 ay trendi vardır. Finansal tarafta çeyreklik gelir tablosu ve bilanço KPI karşılaştırması ile branş bazlı hasar/prim (H/P) oranı panelleri bulunur. Tüm paneller hayat dışı ve hayat–emeklilik havuzlarını ayrı tutar.",
      "Veriler TSB kaynaklıdır; resmi yöntem ve tablo tanımları için tsb.org.tr referans alınmalıdır. Dashboard'lar sigorta finans, aktüerya, strateji ve satış yönetimi ekiplerinin aylık/çeyreklik sektör takibini hızlandırmak için tasarlanmıştır.",
    ],
    bullets: [
      "Kanal prim ve dağılım — merkez, acente, banka, broker payları",
      "Branş değişim ve sıra — pazar payı, yıllık değişim, sektör içi konum",
      "Finansal karşılaştırma — GT/BL KPI, şirket vs sektör",
      "Ölçek segmentasyonu — A+…D grupları, şirket listesi",
      "Hasar/prim oranı — branş bazlı teknik performans",
    ],
    faqs: [
      ...COMMON_FAQS,
      {
        question: "Hangi TSB panelini ne zaman kullanmalıyım?",
        answer:
          "Aylık üretim ve kanal takibi için prim panellerini; çeyreklik mali analiz için finansal karşılaştırmayı; teknik sonuç için hasar/prim oranını kullanın. Branş sıra ve değişim tabloları pazar payı toplantıları için uygundur.",
      },
    ],
    blogSlugs: [
      "tsb-prim-istatistikleri-nasil-takip-edilir",
      "tsb-hasar-prim-orani-dashboard-rehberi",
      "tsb-kanal-brans-prim-rehberi",
    ],
  },
  finansalKarsilastirma: {
    heading: "TSB finansal karşılaştırma — gelir tablosu ve bilanço KPI",
    paragraphs: [
      "Bu panel TSB çeyreklik gelir tablosu (GT) ve bilanço (BL) verilerinden türetilmiş KPI'ları gösterir. Odak şirketinizi sektör toplamı veya seçtiğiniz ikinci bir şirketle yan yana kıyaslayabilir; dönemsel değişim (Δ) sütunları bir önceki yılın aynı çeyreğine göre farkı verir.",
      "Hayat dışı ile hayat–emeklilik havuzları ayrı değerlendirilir. Sektör toplamı havuzdaki tüm şirketlerin toplamıdır — ortalama değil. TL satırları tutar, oran satırları yüzdedir; yatırım geliri, teknik sonuç ve öz kaynak yapısını tek ekranda okumak için uygundur.",
      "Excel'de pivot kurmak yerine hazır KPI seti arayan finans ve raporlama ekipleri için pratik bir alternatiftir. Resmi tablo satır tanımları TSB finansal istatistiklerinde yer alır.",
    ],
    faqs: [
      ...COMMON_FAQS.slice(0, 2),
      {
        question: "Finansal karşılaştırma hangi dönemi kullanır?",
        answer: "Çeyreklik GT/BL tidy verisi — örneğin 2026-1 formatında. Hub'daki veri durumu bandında son finansal çeyrek gösterilir.",
      },
    ],
    blogSlugs: ["tsb-prim-istatistikleri-nasil-takip-edilir"],
  },
  olcekSegmentasyon: {
    heading: "TSB ölçek segmentasyonu — A+…D şirket grupları",
    paragraphs: [
      "Sigorta şirketlerini yalnızca performansa göre değil, büyüklük (ölçek) açısından da gruplamak gerekir. Bu panel brüt prim (%50), özsermaye (%30) ve toplam aktif (%20) girdilerini son finansal çeyrek GT/BL verisinden alır; havuz içinde min-max normalize edilmiş ölçek skoruna göre A+ (en büyük %10) … D (en küçük %10) segmentlerine ayırır.",
      "Hayat dışı (HD) ile hayat–emeklilik şirketleri ayrı havuzlarda sınıflandırılır — dönem seçici yoktur, her zaman son finansal çeyrek kullanılır. Tabloda segmentteki tüm şirketler, üç ölçek girdisi ve sektör/segment sıraları listelenir.",
      "Finansal karşılaştırma panelindeki «benzer ölçek» kıyası bu sınıflandırmaya dayanır; hangi şirketlerin A+ veya A segmentinde olduğunu görmek için bu listeyi kullanın.",
    ],
    faqs: [
      ...COMMON_FAQS.slice(0, 2),
      {
        question: "Ölçek segmenti ile performans segmenti aynı mı?",
        answer:
          "Hayır. Ölçek segmenti yalnızca büyüklük (prim, özsermaye, aktif) ile A+…D harflerini üretir. Performans skoru ayrı bir KPI setidir; karıştırılmamalıdır.",
      },
      {
        question: "Neden dönem seçemiyorum?",
        answer:
          "Resmi segment güncellemesi yılda bir (yıl sonu GT/BL) yapılır; panel son finansal çeyreği sabit gösterir. Hub'daki veri durumu bandında son çeyrek yazılıdır.",
      },
    ],
    blogSlugs: ["tsb-prim-istatistikleri-nasil-takip-edilir"],
  },
  sirketKarne: {
    heading: "TSB şirket karne — prim, finansal ve kanal özeti",
    paragraphs: [
      "Tek bir sigorta şirketi için TSB verilerinden derlenmiş panel: Özet sekmesinde aylık ve kümülatif prim, pazar payı, finansal KPI, kanal dağılımı ve 12 ay trend; diğer sekmelerde KPI önizleme ve ilgili panellere filtreli geçiş.",
      "Prim dönemi ay bazlıdır (ör. 2026-05); finansal blok prim ayına eşlenen son finansal çeyreği kullanır. Tüm kırılımlar ana branş (TSB) dilimindedir.",
      "URL paylaşılabilir (?sirket=, ?donem=, ?segment=, ?sekme=). Kısa yol /sigorta/sirket/[kod] aynı karneye yönlendirir.",
    ],
    faqs: [
      ...COMMON_FAQS.slice(0, 2),
      {
        question: "Karne indirilebilir mi?",
        answer: "Hayır. Güncel veri için panele site üzerinden tekrar gelmeniz gerekir; PDF veya yazdır çıktısı sunulmaz.",
      },
    ],
    blogSlugs: ["tsb-prim-istatistikleri-nasil-takip-edilir"],
  },
  hasarPrimOrani: {
    heading: "TSB hasar / prim oranı — branş bazlı teknik istatistik",
    paragraphs: [
      "Hasar/prim (H/P) oranı, gerçekleşen hasarın kazanılmış prime oranıdır; brüt ve net varyantları reasürans etkisini ayırır. Bu paneldeki «Branş» gelir tablosu dilimidir (GT bransAp) — prim panellerindeki «Ana branş (TSB)» farklı bir sınıflandırmadır.",
      "Grafikte şirket brüt/net H/P değerleri sektör brüt H/P referans çizgisiyle karşılaştırılır. Tabloda DERK dahil/hariç dört varyant, branş sıralaması ve çeyreklik trend bulunur. Düşük H/P genelde daha iyi teknik sonuç anlamına gelir; branş ve havuz seçimine dikkat edin.",
      "Aktüerya, underwriting ve portföy yönetimi ekipleri branş bazlı teknik performansı sektörle kıyaslamak için bu paneli kullanabilir.",
    ],
    faqs: [
      ...COMMON_FAQS.slice(0, 2),
      {
        question: "H/P panelindeki branş ile prim panelindeki ana branş aynı mı?",
        answer:
          "Hayır. H/P GT bransAp dilimini (KASKO, TRAFİK, KAZA gibi ~10–12 geniş grup) kullanır. Prim panelleri TSB ana branş (anaBransH) dilimini kullanır — daha ince sınıflandırma. Aynı isimli satırlar karıştırılmamalıdır.",
      },
    ],
    blogSlugs: ["tsb-hasar-prim-orani-dashboard-rehberi"],
  },
  kanalPrim: {
    heading: "TSB kanal bazlı prim üretimi istatistikleri",
    paragraphs: [
      "TSB aylık prim istatistiği merkez, acente, banka, broker ve diğer kanallarda üretimi ayrı raporlar. Bu panel hayat dışı ve hayat–emeklilik şirketlerini ayrı bloklarda listeler; dönem, kanal, ana branş veya tarife grubu ile daraltma yapılır.",
      "Tabloda şirket primi, sektör toplamı, pay yüzdesi ve sektör içi sıra yer alır. Sıra rengi geçen yılın aynı ayına göre iyileşme veya kötüleşmeyi gösterir. Kanal stratejisi ve acente/banka performans toplantıları için uygundur.",
      "Ham TSB Excel'inde pivot kurmak yerine filtreli tablo arayan satış ve dağıtım ekipleri için hazır görünüm sunar.",
    ],
    faqs: [
      ...COMMON_FAQS.slice(0, 2),
      {
        question: "Kanal filtresi «Genel toplam» ne demek?",
        answer: "Tüm kanallardaki primin birleşik toplamını gösterir; kanal kırılımı olmadan şirket ve sektör genel üretimini kıyaslamak için kullanılır.",
      },
    ],
    blogSlugs: ["tsb-kanal-brans-prim-rehberi"],
  },
  kanalDagilim: {
    heading: "TSB kanal dağılımı — şirket ve sektör pay karşılaştırması",
    paragraphs: [
      "Prim hacminden bağımsız olarak kanal mix'inizi sektörle kıyaslamak için tasarlanmış paneldir. Her kanalda sol koyu çubuk şirketin kendi toplam primine göre kanal payını, sağ açık çubuk sektörün payını gösterir — ikisi de kendi içinde %100 dağılımdır.",
      "«Kanalda %» satırı o kanaldaki şirket priminin sektör primine oranıdır; pazar payı gibi düşünülebilir. Acente ağırlıklı bir şirket ile banka ağırlıklı sektör profilini yan yana görmek dağıtım stratejisi analizini hızlandırır.",
      "Kanal başına renk zemininde gruplanmış grafik okunabilirliği artırır. Dönem ve branş/tarife filtresi prim panelleriyle aynı mantıkta çalışır.",
    ],
    faqs: [
      ...COMMON_FAQS.slice(0, 2),
      {
        question: "Kanal payı ile kanalda pazar payı farkı nedir?",
        answer:
          "Kanal payı (%): şirketin toplam priminde o kanalın ağırlığı. Kanalda %: o kanaldaki şirket primi ÷ sektörün o kanaldaki primi — yani o kanaldaki rekabet konumunuz.",
      },
    ],
    blogSlugs: ["tsb-kanal-brans-prim-rehberi"],
  },
  bransDegisim: {
    heading: "TSB branş değişim — yıllık prim ve pazar payı",
    paragraphs: [
      "Branş veya tarife grubu satırında odak şirketin primini sektör toplamı veya seçtiğiniz kıyas şirketiyle yan yana görürsünüz. Değişim % ve Δ pp bir önceki yılın aynı ayına göredir; pay sütunu odak şirket ÷ sektör mantığındadır.",
      "Portföy kayması, büyüyen veya küçülen branşları tespit etmek için kullanılır. Hayat dışı havuzda trafik hariç filtre seçenekleri mevcuttur.",
      "Yıllık bütçe revizyonu ve branş stratejisi toplantılarında TSB resmi tablolarına alternatif hızlı görünüm sağlar.",
    ],
    faqs: [
      ...COMMON_FAQS.slice(0, 2),
      {
        question: "Pay sütunu nasıl hesaplanır?",
        answer: "Odak şirketin ilgili branş/tarife satırındaki primi ÷ aynı satırdaki sektör toplam primi × 100. Pazar payı yüzdesidir.",
      },
    ],
    blogSlugs: ["tsb-kanal-brans-prim-rehberi"],
  },
  bransSira: {
    heading: "TSB branş sıra özeti — sektör içi konum",
    paragraphs: [
      "Her satırda branş/tarife, şirket primi, sektör ağırlığı ve sıra bilgisi yan yana listelenir. Sıra küçük numara = daha iyi konum (daha yüksek prim). Δ sıra geçen yılın aynı ayına göre sıra değişimini gösterir.",
      "Hangi branşlarda güçlü, hangilerinde geride olduğunuzu tek tabloda görmek için uygundur. Sektör ağırlığı sütunu o branşın sektör primindeki payını verir — küçük branşta iyi sıra ile büyük branşta orta sıra farklı strateji gerektirir.",
      "Prim panellerinde ana branş (TSB) dilimi kullanılır; H/P panelindeki GT branşı ile karıştırmayın.",
    ],
    faqs: [
      ...COMMON_FAQS.slice(0, 2),
      {
        question: "Sıra nasıl hesaplanır?",
        answer: "Seçili havuz, dönem ve branş/tarife satırında şirketler prim büyüklüğüne göre sıralanır; 1 en yüksek prim üreten şirkettir.",
      },
    ],
    blogSlugs: ["tsb-kanal-brans-prim-rehberi"],
  },
  primTrend12: {
    heading: "TSB son 12 ay prim trendi",
    paragraphs: [
      "Seçilen bitiş ayından geriye en fazla 12 ay gösterilir. Yeşil çizgi odak şirket, kırmızı çizgi sektör toplamıdır; alttaki sütunlar aylık üretim farkını gösterir.",
      "Mevsimsel dalgalanma, kampanya etkisi veya portföy değişimini trend olarak izlemek için kullanılır. Branş, tarife ve kanal filtresi diğer prim panelleriyle tutarlıdır.",
      "Yıl içi kümülatif değil, aylık üretim odaklıdır — Ocak spike'ı veya yaz düşüşü net görülür.",
    ],
    faqs: [
      ...COMMON_FAQS.slice(0, 2),
      {
        question: "12 ay her zaman dolu mu gelir?",
        answer: "Veri setinde bulunan aylar kadar gösterilir; bitiş ayından geriye en fazla 12 ay, eksik aylar atlanır.",
      },
    ],
    blogSlugs: ["tsb-prim-istatistikleri-nasil-takip-edilir"],
  },
  pazarYogunlasma: {
    heading: "TSB pazar yoğunlaşması — HHI ve top-5 pay",
    paragraphs: [
      "Her ana branş için seçili ayın aylık prim paylarından HHI (Herfindahl–Hirschman) endeksi hesaplanır. Tek oyunculu pazar 10.000'e yaklaşır; paylar dağıldıkça endeks düşer.",
      "Top-5 pay ve tam şirket listesi aynı branş/kanal filtresinde gösterilir. 12 aylık HHI trendi yoğunlaşmanın artıp azaldığını izlemek için kullanılır.",
      "Rekabet analizi, branş stratejisi ve birleşme-düzenleme bağlamında sektör yapısını hızlı okumak için uygundur.",
    ],
    faqs: [
      ...COMMON_FAQS.slice(0, 2),
      {
        question: "HHI nasıl yorumlanır?",
        answer:
          "2.500 üzeri yüksek, 1.500–2.500 orta, 1.500 altı düşük yoğunlaşma olarak gösterilir. Kesin eşikler sektöre göre değişebilir; panel trend ve top-5 pay ile birlikte okunmalıdır.",
      },
    ],
    blogSlugs: ["tsb-kanal-brans-prim-rehberi"],
  },
};

export function tsbSeoContentFor(pageId: TsbSeoPageId | "hub"): TsbSeoContent {
  return TSB_SEO_CONTENT[pageId];
}

export function tsbSeoFaqsFor(pageId: TsbSeoPageId | "hub"): readonly TsbSeoFaq[] {
  return TSB_SEO_CONTENT[pageId].faqs;
}
