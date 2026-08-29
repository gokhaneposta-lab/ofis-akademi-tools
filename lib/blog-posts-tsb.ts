/**
 * TSB dashboard SEO blog kümesi — sigortacıların TSB yerine Ofis Akademi'den takip etmesi için.
 */
import type { BlogPost } from "./blog-posts";

const OG_IMAGE = "/og/tsb-sektor";

const HUB_SLUG = "tsb-prim-istatistikleri-nasil-takip-edilir";
const HP_SLUG = "tsb-hasar-prim-orani-dashboard-rehberi";
const KANAL_SLUG = "tsb-kanal-brans-prim-rehberi";

const COMMON_KEYWORDS = [
  "TSB",
  "TSB prim",
  "TSB istatistikleri",
  "Türkiye Sigortalar Birliği",
  "sigorta sektör verileri",
  "TSB dashboard",
  "sigorta prim istatistikleri",
  "TSB finansal",
];

const clusterLinks = (exclude: string) =>
  ({
    type: "links" as const,
    title: "TSB dashboard rehberleri",
    items: [
      { label: "TSB prim istatistikleri nasıl takip edilir?", href: `/blog/${HUB_SLUG}` },
      { label: "TSB hasar/prim oranı dashboard rehberi", href: `/blog/${HP_SLUG}` },
      { label: "Kanal ve branş prim verilerini okumak", href: `/blog/${KANAL_SLUG}` },
      { label: "TSB dashboard hub", href: "/sigorta/tsb" },
      { label: "Kanal bazlı prim paneli", href: "/sigorta/kanal-prim" },
      { label: "Hasar/prim oranı paneli", href: "/sigorta/hasar-prim-orani" },
      { label: "Finansal karşılaştırma paneli", href: "/sigorta/finansal-karsilastirma" },
    ].filter((x) => !x.href.endsWith(`/${exclude}`) && x.href !== `/blog/${exclude}`),
  });

export const BLOG_POSTS_TSB: BlogPost[] = [
  {
    slug: HUB_SLUG,
    title: "TSB Prim İstatistikleri Nasıl Takip Edilir? — Ücretsiz Dashboard Rehberi",
    description:
      "TSB aylık prim ve çeyreklik finansal verilerini Excel indirmeden takip edin. Ofis Akademi TSB dashboard grubu: kanal, branş, H/P ve finansal karşılaştırma panelleri rehberi.",
    date: "2026-05-24",
    guideHref: "/sigorta/tsb",
    guideName: "TSB sektör verileri hub",
    image: OG_IMAGE,
    keywords: [
      ...COMMON_KEYWORDS,
      "TSB prim takip",
      "TSB prim verileri",
      "sigorta dashboard",
      "TSB kanal prim",
      "TSB branş prim",
    ],
    faqs: [
      {
        question: "TSB verilerini neden dashboard'dan takip etmeliyim?",
        answer:
          "Resmi TSB tabloları ham Excel/PDF formatındadır; şirket–sektör kıyası, kanal payı ve branş sırası için pivot kurmanız gerekir. Dashboard'lar bu işi önceden yapılmış filtre ve grafiklerle sunar.",
      },
      {
        question: "Hangi panel ne işe yarar?",
        answer:
          "Kanal prim ve dağılım aylık üretim ve kanal mix için; branş değişim ve sıra pazar payı için; finansal karşılaştırma çeyreklik GT/BL için; hasar/prim oranı teknik performans için; son 12 ay trend mevsimsellik için kullanılır.",
      },
      {
        question: "Veriler ücretsiz mi?",
        answer: "Evet. TSB kamuya açık istatistiklerinden türetilir; Ofis Akademi'de kayıt olmadan kullanılabilir.",
      },
    ],
    content: [
      {
        type: "p",
        text: "Sigorta sektöründe çalışıyorsanız Türkiye Sigortalar Birliği (TSB) istatistikleri masaüstünüzün vazgeçilmezidir: aylık prim üretimi, çeyreklik gelir tablosu, hasar/prim oranları… Ancak her ay Excel indirip pivot kurmak, toplantı öncesi «acaba sektörde kaçıncıyız?» sorusuna hızlı cevap vermekte yavaşlatır.",
      },
      {
        type: "p",
        text: "Ofis Akademi TSB dashboard grubu bu veriyi tarayıcıda, filtrelenebilir panellerle sunar. Kaynak yine TSB'dir; fark, karşılaştırmalı görünüm ve hazır KPI setidir. Bu yazıda hangi paneli ne zaman kullanacağınızı ve hub'a nasıl gireceğinizi özetliyoruz.",
      },
      { type: "h3", text: "Dashboard grubunda neler var?" },
      {
        type: "ul",
        items: [
          "Kanal bazlı prim — merkez, acente, banka, broker üretimi, sıra ve pay",
          "Kanal dağılımı — şirket vs sektör kanal mix'i",
          "Branş değişim — yıllık prim ve pazar payı değişimi",
          "Branş sıra — sektör içi konum tablosu",
          "Son 12 ay prim trendi — aylık şirket/sektör çizgisi",
          "Finansal karşılaştırma — çeyreklik GT/BL KPI",
          "Hasar/prim oranı — branş bazlı H/P",
        ],
      },
      { type: "h3", text: "Hayat dışı ve hayat–emeklilik ayrımı" },
      {
        type: "p",
        text: "TSB şirketleri farklı havuzlarda raporlanır. Panellerde önce havuz seçersiniz; hayat dışı (HD) ile hayat–emeklilik karıştırılmaz. Kodu 3 ile başlayan şirketler hayat/emeklilik havuzundadır.",
      },
      {
        type: "callout",
        variant: "info",
        title: "Hızlı başlangıç",
        text: "Hub sayfasından veri durumu bandında son prim ayı ve son finansal çeyreği kontrol edin; ardından ihtiyacınıza göre ilgili panele geçin.",
      },
      clusterLinks(HUB_SLUG),
    ],
  },
  {
    slug: HP_SLUG,
    title: "TSB Hasar / Prim Oranı (H/P) Dashboard — Branş Bazlı Karşılaştırma Rehberi",
    description:
      "TSB gelir tablosundan brüt/net hasar/prim oranı nasıl okunur? Sektör sıralaması, branş filtresi ve finansal KPI rehberi ile birlikte Ofis Akademi H/P paneli.",
    date: "2026-05-24",
    guideHref: "/sigorta/hasar-prim-orani",
    guideName: "Hasar / Prim oranı paneli",
    image: OG_IMAGE,
    keywords: [
      ...COMMON_KEYWORDS,
      "TSB hasar prim",
      "hasar prim oranı",
      "loss ratio",
      "TSB H/P",
      "sigorta teknik sonuç",
    ],
    faqs: [
      {
        question: "H/P panelindeki branş prim panelindeki branşla aynı mı?",
        answer:
          "Hayır. H/P GT bransAp dilimini (KASKO, TRAFİK, KAZA gibi geniş gruplar) kullanır. Prim panelleri TSB ana branş (anaBransH) dilimini kullanır — daha ince sınıflandırma.",
      },
      {
        question: "Brüt mü net H/P mi daha önemli?",
        answer:
          "Brüt portföyün genel teknik görünümünü; net şirketin reasürans sonrası gerçek maruziyetini gösterir. İkisini birlikte okuyun.",
      },
    ],
    content: [
      {
        type: "p",
        text: "Hasar/prim oranı (loss ratio), sigortacılığın en temel teknik göstergesidir: toplanan primin ne kadarının hasara gittiğini ölçer. TSB çeyreklik gelir tablosu verilerinden branş bazında H/P hesaplanır ve sektör içi sıralama yapılabilir.",
      },
      { type: "h3", text: "Ofis Akademi H/P panelinde neler var?" },
      {
        type: "ul",
        items: [
          "Brüt ve net H/P — DERK dahil/hariç varyantlar",
          "Branş veya tarife grubu filtresi (GT dilimi)",
          "Sektör brüt H/P referans çizgisi",
          "Branş sıralama tablosu ve çeyreklik trend",
        ],
      },
      {
        type: "p",
        text: "Finans & Sigorta bölümündeki H/P hesaplayıcısı formülü öğretir; TSB paneli ise gerçek sektör verisiyle canlı kıyas sağlar. İkisini birlikte kullanmak hem kavram hem pratik açıdan faydalıdır.",
      },
      {
        type: "links",
        title: "İlgili sayfalar",
        items: [
          { label: "Hasar/prim oranı dashboard", href: "/sigorta/hasar-prim-orani" },
          { label: "H/P hesaplayıcı (rehber)", href: "/finans-sigorta/hasar-prim-orani" },
          { label: "Finansal karşılaştırma", href: "/sigorta/finansal-karsilastirma" },
        ],
      },
      clusterLinks(HP_SLUG),
    ],
  },
  {
    slug: KANAL_SLUG,
    title: "TSB Kanal ve Branş Prim Verileri Nasıl Okunur? — Sigortacılar İçin Rehber",
    description:
      "TSB aylık prim istatistiğinde kanal (merkez, acente, banka) ve branş kırılımı nasıl yorumlanır? Kanal dağılımı, branş sıra ve pazar payı panelleri rehberi.",
    date: "2026-05-24",
    guideHref: "/sigorta/kanal-prim",
    guideName: "Kanal bazlı prim paneli",
    image: OG_IMAGE,
    keywords: [
      ...COMMON_KEYWORDS,
      "TSB kanal prim",
      "TSB kanal dağılımı",
      "TSB branş prim",
      "sigorta acente prim",
      "pazar payı sigorta",
    ],
    faqs: [
      {
        question: "Kanal payı ile kanalda pazar payı farkı nedir?",
        answer:
          "Kanal payı: şirketin toplam priminde o kanalın ağırlığı (%). Kanalda %: o kanaldaki şirket primi ÷ sektörün o kanaldaki primi — rekabet konumunuz.",
      },
      {
        question: "Ana branş ile tarife grubu filtresi ne zaman kullanılır?",
        answer:
          "Ana branş TSB'nin standart üst sınıflandırmasıdır. Tarife grubu (TRAFİK, KASKO, DASK…) daha dar ürün dilimi için alternatif filtre sağlar.",
      },
    ],
    content: [
      {
        type: "p",
        text: "TSB aylık prim istatistiği satış kanalı (merkez, acente, banka, broker) ve branş/tarife kırılımında üretimi yayımlar. Strateji ve satış ekipleri için asıl soru genelde «hangi kanalda büyüyoruz, sektöre göre geride miyiz?» sorusudur.",
      },
      { type: "h3", text: "Kanal prim paneli" },
      {
        type: "p",
        text: "Şirket listesi, prim tutarı, sektör toplamı, pay ve sıra tek tabloda. Sıra rengi geçen yılın aynı ayına göre iyileşme/kötüleşme gösterir. Kanal filtresi tabloyu daraltır.",
      },
      { type: "h3", text: "Kanal dağılım paneli" },
      {
        type: "p",
        text: "Mix analizi için: şirketin kanal dağılımı ile sektör dağılımı yan yana. Acente ağırlıklı profil ile banka ağırlıklı sektör farkını grafikte görürsünüz.",
      },
      { type: "h3", text: "Branş değişim ve sıra" },
      {
        type: "p",
        text: "Branş değişim yıllık prim ve pay farkını; branş sıra sektör içi konumu verir. Pazar payı toplantıları ve bütçe revizyonu için uygundur.",
      },
      {
        type: "links",
        title: "Panellere doğrudan git",
        items: [
          { label: "Kanal bazlı prim", href: "/sigorta/kanal-prim" },
          { label: "Kanal dağılımı", href: "/sigorta/kanal-dagilim" },
          { label: "Branş değişim", href: "/sigorta/brans-degisim" },
          { label: "Branş sıra", href: "/sigorta/brans-sira" },
        ],
      },
      clusterLinks(KANAL_SLUG),
    ],
  },
];
