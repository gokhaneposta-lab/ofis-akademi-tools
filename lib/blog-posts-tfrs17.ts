/**
 * IFRS 17 / TFRS 17 — Ofis Akademi eğitim blog kümesi.
 *
 * Küme yapısı (topic cluster):
 *  - Hub: "tfrs-17-yeni-sigorta-mali-tablosu-rehberi" (ana rehber; slug geçmişe uyumlu kaldı)
 *  - Uydu 1: "ifrs-17-csm-nedir"
 *  - Uydu 2: "ifrs-17-gelir-tablosu-nasil-okunur"
 *  - Uydu 3: "ifrs-17-excel-modeli-basit-ornek"
 *
 * Tüm yazılar eğitim amaçlıdır; TMS/TFRS, KGK düzenlemeleri ve şirket
 * muhasebe/aktüerya politikalarının yerine geçmez. Rakamlar hayalidir.
 */
import type { BlogPost } from "./blog-posts";

const OG_IMAGE = "/og/tfrs-17-excel";
const EXCEL_PREVIEW = "/og/tfrs-17-excel?variant=preview";

const HUB_SLUG = "tfrs-17-yeni-sigorta-mali-tablosu-rehberi";
const CSM_SLUG = "ifrs-17-csm-nedir";
const GELIR_SLUG = "ifrs-17-gelir-tablosu-nasil-okunur";
const EXCEL_SLUG = "ifrs-17-excel-modeli-basit-ornek";
const PAA_SLUG = "ifrs-17-paa-basitlestirilmis-yaklasim";
const RA_SLUG = "ifrs-17-risk-ayarlamasi-nedir";

const COMMON_KEYWORDS = [
  "IFRS 17",
  "IFRS 17 nedir",
  "TFRS 17",
  "ifrs 17 csm",
  "csm nedir",
  "ifrs 17 excel",
  "ifrs 17 hesaplama",
  "ifrs 17 örnek",
  "sigorta muhasebesi",
  "sigorta bilançosu",
  "sigorta gelir tablosu",
];

const clusterLinks = (exclude: string) =>
  ({
    type: "links" as const,
    title: "IFRS 17 serisi — diğer yazılar",
    items: [
      { label: "IFRS 17 rehberi (hub)", href: `/blog/${HUB_SLUG}` },
      { label: "IFRS 17 CSM nedir? (örnekli)", href: `/blog/${CSM_SLUG}` },
      { label: "IFRS 17 gelir tablosu nasıl okunur?", href: `/blog/${GELIR_SLUG}` },
      { label: "IFRS 17 Excel modeli — basit örnek", href: `/blog/${EXCEL_SLUG}` },
      { label: "IFRS 17 PAA (Basitleştirilmiş Yaklaşım)", href: `/blog/${PAA_SLUG}` },
      { label: "IFRS 17 Risk Ayarlaması (RA) nedir?", href: `/blog/${RA_SLUG}` },
    ].filter((x) => !x.href.endsWith(`/${exclude}`)),
  });

export const BLOG_POSTS_TFRS17: BlogPost[] = [
  /* ============================================================
   *  HUB — Ana rehber (mevcut slug korundu; başlık ve giriş yenilendi)
   * ============================================================ */
  {
    slug: HUB_SLUG,
    title:
      "IFRS 17 Nedir? Türkiye'de TFRS 17 ve Yeni Sigorta Mali Tablosu — Excel Örnek + Ücretsiz Şablon",
    description:
      "IFRS 17 (Türkiye'de TFRS 17) sigorta mali tablolarını nasıl değiştirdi? CSM, LIC, LRC özeti; 1.200 TL primden 240 TL CSM'e basit Excel örneği ve indirilebilir şablonla anlatım.",
    date: "2026-04-19",
    guideHref: "/finans-sigorta",
    guideName: "Finans & Sigorta metrikleri",
    image: OG_IMAGE,
    keywords: [
      ...COMMON_KEYWORDS,
      "IFRS 17 Excel şablonu",
      "sözleşme grubu",
      "LIC",
      "LRC",
      "IFRS 17 Türkiye",
    ],
    faqs: [
      {
        question: "IFRS 17 nedir, kısaca?",
        answer:
          "IFRS 17, sigorta sözleşmelerinin muhasebeleştirilmesi için uluslararası standarttır; Türkiye'de TFRS 17 olarak uygulanır. Sözleşmeleri gruplar halinde güncel tahminlerle ölçer, beklenen kârı (CSM) hizmet süresine yayar ve gelir tablosunda hizmet sunumuyla orantılı bir gelir tanıma mantığı getirir.",
      },
      {
        question: "IFRS 17 ile TFRS 17 farklı mı?",
        answer:
          "Özde aynı standarttır. IFRS 17, IASB tarafından yayımlanan uluslararası metin; TFRS 17 ise Kamu Gözetimi Kurumu tarafından Türkçe olarak yayımlanan ve Türkiye'de uygulanan versiyonudur.",
      },
      {
        question: "CSM (Sözleşme Hizmet Marjı) nedir?",
        answer:
          "Basitçe: beklenen kârın henüz kazanılmamış kısmıdır. Poliçe kesildiğinde bilançoda yükümlülüğün bileşeni olarak durur, hizmet sunuldukça parça parça gelire yazılır. Bu yüzden 'ertelenmiş kâr' kısa özeti olarak düşünülebilir.",
      },
      {
        question: "IFRS 17 için Excel şablonu var mı?",
        answer:
          "Evet, bu sayfanın sonunda üç sayfalık (basit örnek, KPI şablonu, feragat) ücretsiz Excel dosyası indirebilirsiniz. Formüllü hazırdır; eğitim ve sunum provası içindir, muhasebe sistemi yerine geçmez.",
      },
      {
        question: "Prim tahsilatı doğrudan gelir tablosuna mı gider?",
        answer:
          "Genel olarak hayır. Tahsilat nakit/alacak tarafını, sigortacılık geliri ise hizmet sunumu ile orantılı tanımayı etkiler. Bu yüzden çeyreklik prim üretimi ile IFRS 17 hizmet geliri her zaman aynı yönde zıplamaz.",
      },
      {
        question: "Bu yazıdaki rakamlar gerçek şirket verisi mi?",
        answer:
          "Hayır. Tüm rakamlar bilinçli olarak yuvarlatılmış ve hayalidir; yalnızca satır ve oran mantığını göstermek içindir. Gerçek ölçüm iskonto, kapsam birimleri, ölçüm modeli (GMM/PAA/VFA) ve zarar bileşeni gibi unsurları kapsar.",
      },
    ],
    content: [
      {
        type: "snippet",
        question: "IFRS 17 nedir? (Kısa cevap)",
        answer:
          "IFRS 17, sigorta sözleşmelerini sözleşme grupları düzeyinde, güncel tahminlerle ölçen ve beklenen kârın bir kısmını CSM adı verilen hesapta saklayıp hizmet süresine yayan uluslararası muhasebe standardıdır. Türkiye'de TFRS 17 olarak uygulanır ve 2023'ten itibaren sigorta mali tablolarının görünümünü değiştirmiştir.",
      },
      {
        type: "callout",
        variant: "warning",
        title: "Önemli not",
        text:
          "Bu yazı eğitim amaçlıdır; TMS/TFRS, KGK düzenlemeleri veya şirketinizin aktüerya ve muhasebe politikalarının yerine geçmez. Rakamlar hayalidir.",
      },
      {
        type: "p",
        text:
          "Sigorta şirketinde satıştan hasara, tahsilattan yenilemeye kadar günlük iş operasyonel verilerle döner; mali tablolar ise aynı faaliyetin farklı bir dilde özetidir. IFRS 17 bu özeti yeniden düzenler: sözleşmeleri gruplar halinde değerlendirir, yükümlülükleri güncel tahminlerle ölçer ve beklenen kârın bir kısmını CSM ile hizmet süresine yayar. Bu rehber, sigorta çalışanı gözüyle 'tabloda ne arıyorum?' sorusuna odaklanır.",
      },

      { type: "h3", text: "IFRS 17 ile TFRS 17 arasındaki fark nedir?" },
      {
        type: "snippet",
        question: "Kısaca",
        answer:
          "İkisi aynı standardı ifade eder: IFRS 17 IASB'ın yayımladığı uluslararası metindir, TFRS 17 ise KGK tarafından Türkçe yayımlanan ve Türkiye'de uygulanan versiyondur.",
      },
      {
        type: "p",
        text:
          "Yazının devamında 'IFRS 17' diye geçeceğiz; bölümler TFRS 17 kapsamında Türkiye uygulaması için de aynen geçerlidir.",
      },

      { type: "h3", text: "Neden tablo değişti?" },
      {
        type: "snippet",
        question: "Kısaca",
        answer:
          "Eski uygulamada brüt prim üretimi ve teknik karşılıklar daha doğrudan okunabiliyordu. IFRS 17, sözleşmeleri gruplayıp güncel tahminlerle ölçerek beklenen kârı CSM üzerinden hizmet süresine yayar; aynı poliçe portföyü farklı satır başlıklarıyla ve farklı zamanlamayla görünür.",
      },

      { type: "h3", text: "Poliçe ve risk süresi: hangi zaman ekseni?" },
      {
        type: "p",
        text:
          "Poliçe başladığında risk üstlenilir; süre boyunca prim (veya taksitler) tahsil edilebilir; hasar oluşabilir; sözleşme yenilenir veya sona erer. IFRS 17 mali tablosu, bu olayların parasal yansımalarını dönemlere dağıtır.",
      },
      { type: "diagram", variant: "tfrs17-policy-coverage" },

      { type: "h3", text: "Tahsilat (nakit) ile gelir tablosu aynı şey değildir" },
      {
        type: "snippet",
        question: "Kısaca",
        answer:
          "Prim tahsilatı bilançoda nakit/alacağı etkiler; IFRS 17 hizmet geliri ise hizmet sunumu ve yükümlülük ölçümü ile ilişkilendirilir. Bu yüzden rekor tahsilat çeyreğinde bile gelir tablosu aynı oranda zıplamayabilir.",
      },
      { type: "diagram", variant: "tfrs17-premium-flow" },

      { type: "h3", text: "Üç kısa kavram: LIC, LRC ve CSM" },
      {
        type: "ul",
        items: [
          "LIC (Liability for Incurred Claims): Oluşmuş iddia ve olaylarla ilgili yükümlülüğün güncel tahmini. Klasik 'muallak hasar' yaklaşımına yakın, IBNR ve düzeltmeler modelde ayrıntılanır.",
          "LRC (Liability for Remaining Coverage): Henüz sunulmamış hizmete ait kalan kapsam yükümlülüğü. Klasik 'kazanılmamış prim karşılığı' fikrinin IFRS 17 ölçüm karşılığıdır, ama birebir aynı rakam olmayabilir.",
          "CSM (Contractual Service Margin): Beklenen kârın henüz kazanılmamış kısmı. Hizmet sunuldukça itfa olur; bazı olumsuz durumlarda azalır veya biterse zarar bileşeni devreye girer.",
        ],
      },
      {
        type: "p",
        text:
          "CSM'yi daha ayrıntılı incelemek için seride ayrı bir yazı var; örnekli anlatımı okuyabilirsiniz.",
      },
      {
        type: "links",
        title: "Derinleştir",
        items: [
          { label: "IFRS 17 CSM nedir? — örnekli anlatım", href: `/blog/${CSM_SLUG}` },
          { label: "IFRS 17 gelir tablosu nasıl okunur?", href: `/blog/${GELIR_SLUG}` },
        ],
      },

      { type: "h3", text: "CSM'yi tek seferde anlamak: basit rakamlar" },
      {
        type: "snippet",
        question: "Kısaca",
        answer:
          "CSM'yi 'ertelenmiş beklenen kâr' olarak düşünebilirsiniz: poliçe kesildiğinde hesaplanan beklenen kâr, hizmet süresince parça parça gelire yazılır. Aşağıdaki örnek bu fikri sayıyla gösterir; gerçek ölçüm iskonto ve kapsam birimleri ile daha karmaşıktır.",
      },
      {
        type: "table",
        caption: "IFRS 17 basit örnek (hayali tutarlar, TL)",
        headers: ["Kalem", "Tutar"],
        rows: [
          ["Prim", "1.200"],
          ["Beklenen maliyet (özet)", "960"],
          ["Beklenen kâr (başlangıç CSM)", "240 (= 1.200 − 960)"],
          ["Hizmet süresi", "12 ay"],
          ["Her ay gelire yansıyan itfa (eşit dağılım varsayımı)", "20 (= 240 ÷ 12)"],
        ],
      },
      {
        type: "p",
        text:
          "Bu örnekte 240 TL beklenen kâr poliçe kesildiği gün tek seferde gelir tablosuna düşmez; her ay yaklaşık 20 TL'lik pay hizmet sunumuyla ilişkilendirilir. Şirket kârı böylece 'düzgünleşmiş' görünür — ama gerçek itfa eğrisi her zaman düz çizgi değildir.",
      },
      { type: "diagram", variant: "tfrs17-csm-bars" },

      { type: "h3", text: "İşinize ne değişti? (Rapor ve dashboard gözüyle)" },
      {
        type: "ul",
        items: [
          "Satış primi rekoru kırdığı çeyrekte, IFRS 17 hizmet geliri aynı hızda zıplamayabilir — dashboard'da 'brüt prim' ile 'IFRS hizmet geliri' ayrı izlenmelidir.",
          "Hasar operasyonu aynı kalırken 'teknik sonuç' ile 'CSM itfa' satırı farklı dönemlerde hareket edebilir; toplantıda ikisinin aynı şey olmadığını netleştirin.",
          "Yönetim raporunda 'CSM roll-forward' tablosu görürseniz, yukarıdaki 240→20 mantığının kurumsal versiyonunu okuyorsunuz demektir.",
          "Excel şablonumuzdaki KPI sayfası, kendi şirket dilinizle bu tür bir takibi denemeniz için boş çerçeve sunar.",
        ],
      },

      {
        type: "download",
        title: "IFRS 17 örnek model — Excel indir (ücretsiz)",
        description:
          "Üç sayfalık eğitim dosyası: formüllü basit CSM örneği (1.200 / 960 / 240 / 12 ay × 20 TL), manuel doldurulacak KPI şablonu ve feragat metni. Muhasebe sistemi yerine geçmez; iç eğitim ve sunum provası içindir.",
        href: "/downloads/tfrs-17-ornek-model.xlsx",
        fileName: "tfrs-17-ornek-model.xlsx",
        buttonLabel: "Excel şablonunu indir (.xlsx)",
        previewSrc: EXCEL_PREVIEW,
        previewAlt: "IFRS 17 örnek Excel modelinin önizlemesi: prim, beklenen maliyet ve CSM tablosu",
      },

      {
        type: "callout",
        variant: "info",
        title: "Operasyonel KPI ile köprü",
        text:
          "Hasar/prim, kazanılmış prim, tahsilat oranı gibi göstergeler işi yönetmek içindir; IFRS 17 tablosu bu göstergelerin yükümlülük ölçümü ve CSM itfasıyla zamanlanmış finansal ifadesidir. Ofis Akademi Finans & Sigorta bölümünde teknik karşılık ve prim metriklerine ait kısa hesaplayıcılar vardır.",
      },

      { type: "h3", text: "Hayali özet bilanço ve gelir tablosu (illüstratif)" },
      {
        type: "p",
        text:
          "Aşağıdaki tablolar gerçek bir şirkete ait değildir; yalnızca 'hangi tür kalemler yan yana gelebilir?' sorusuna örnek teşkil eder. Başlıklar TMS/TFRS dipnotlarıyla birebir örtüşmeyebilir.",
      },
      {
        type: "table",
        caption: "Tablo 1 — Hayali özet bilanço (milyon TL)",
        headers: ["Kalem (özet)", "Dönem sonu"],
        rows: [
          ["Nakit ve nakit benzerleri", "420"],
          ["Sigorta alacakları (brüt, özet)", "280"],
          ["Reasürans ile ilgili varlıklar (özet)", "95"],
          ["Diğer finansal varlıklar (özet)", "1.050"],
          ["Toplam varlıklar (özet)", "3.200"],
          ["Sigorta sözleşmelerinden doğan yükümlülükler (LIC+LRC+CSM etkileri dahil özet)", "2.150"],
          ["Reasürans ile ilgili yükümlülükler (özet)", "140"],
          ["Diğer teknik ve finansal yükümlülükler (özet)", "410"],
          ["Toplam yükümlülükler (özet)", "2.700"],
          ["Özkaynak (özet)", "500"],
        ],
      },
      {
        type: "table",
        caption: "Tablo 2 — Hayali özet gelir tablosu (tek dönem, milyon TL)",
        headers: ["Kalem (özet)", "Dönem"],
        rows: [
          ["Sigortacılık geliri (hizmet sonucu, özet)", "890"],
          ["Teknik giderler ve yükümlülük düzeltmeleri (özet)", "720"],
          ["Brüt teknik sonuç (özet)", "170"],
          ["Yatırım ve diğer gelir/gider (özet)", "40"],
          ["Vergi öncesi kâr (özet)", "95"],
        ],
      },
      {
        type: "p",
        text:
          "Gerçek raporlarda satır sayısı çok daha fazladır; CSM açılışı, düzeltmeler, risk ayarlaması ve faiz etkileri dipnotlarda ayrıntılanır. Gelir tablosunun nasıl okunacağına dair ayrı bir yazı var:",
      },
      {
        type: "links",
        title: "Uydu yazı",
        items: [
          { label: "IFRS 17 gelir tablosu nasıl okunur? (örneklerle)", href: `/blog/${GELIR_SLUG}` },
        ],
      },

      { type: "h3", text: "Resmi kaynak ve iç eğitim" },
      {
        type: "p",
        text:
          "IFRS 17 metni (IASB) ve KGK'nın yayımladığı TFRS 17, bağlayıcı referanstır. Şirket içi aktüerya el kitabı ve finans kontrol departmanının IFRS 17 mapping dokümanı (operasyonel rapor satırı → muhasebe hesabı) en doğru iş yeri kaynağınızdır.",
      },

      { type: "h3", text: "Özet" },
      {
        type: "p",
        text:
          "IFRS 17, sigorta faaliyetini sözleşme grupları üzerinden ölçerek bilanço ve gelir tablosunu yeniden düzenler. Poliçe ve tahsilat operasyonel gerçekliktir; tablo ise bu gerçekliğin yükümlülük ölçümü, kalan kapsam ve CSM itfasıyla zamanlanmış finansal yansımasıdır. Hayali tablolarımız satır mantığını göstermek içindir — gerçek rakamlar için her zaman resmi finansal rapora ve dipnotlara başvurun.",
      },

      {
        type: "links",
        title: "Finans & Sigorta — ilgili başlıklar",
        items: [
          { label: "Finans & Sigorta ana hub", href: "/finans-sigorta" },
          { label: "Kazanılmış prim", href: "/finans-sigorta/kazanilmis-prim" },
          { label: "KPK (kazanılmamış prim karşılığı)", href: "/finans-sigorta/kazanilmamis-prim-karsiligi" },
          { label: "Muallak hasar karşılığı", href: "/finans-sigorta/muallak-hasar-karsiligi" },
          { label: "Hasar / prim oranı", href: "/finans-sigorta/hasar-prim-orani" },
        ],
      },
      clusterLinks(HUB_SLUG),
    ],
  },

  /* ============================================================
   *  UYDU 1 — CSM Nedir?
   * ============================================================ */
  {
    slug: CSM_SLUG,
    title: "IFRS 17 CSM Nedir? Sözleşme Hizmet Marjı — Excel Örnekli Basit Anlatım",
    description:
      "IFRS 17 Sözleşme Hizmet Marjı (CSM) nedir, nasıl hesaplanır ve gelire nasıl yayılır? Basit 1.200 / 960 / 240 örneği, aylık itfa, unlocking mantığı ve Excel şablonu.",
    date: "2026-04-19",
    guideHref: `/blog/${HUB_SLUG}`,
    guideName: "IFRS 17 ana rehber",
    image: OG_IMAGE,
    keywords: [
      ...COMMON_KEYWORDS,
      "IFRS 17 CSM hesaplama",
      "CSM itfa",
      "CSM unlocking",
      "sözleşme hizmet marjı",
    ],
    faqs: [
      {
        question: "CSM tek cümleyle nedir?",
        answer:
          "CSM, bir sigorta sözleşmesi grubundan beklenen kârın, hizmet sunuldukça gelire yayılmak üzere bilançoda tutulan kısmıdır.",
      },
      {
        question: "CSM nasıl hesaplanır?",
        answer:
          "Başlangıçta = Primlerin bugünkü değeri − Beklenen nakit çıkışlarının (hasar, gider) bugünkü değeri − Risk ayarlaması. Sonraki dönemlerde faiz birikimi, yeni sözleşmeler, varsayım değişiklikleri (unlocking) ve itfa ile güncellenir.",
      },
      {
        question: "CSM negatif olabilir mi?",
        answer:
          "Hayır. Hesap CSM'yi negatife indirecek kadar olumsuzsa aradaki fark gelir tablosuna zarar bileşeni olarak yansıtılır; CSM sıfıra yapışır.",
      },
      {
        question: "CSM, kazanılmamış prim (UPR) ile aynı mı?",
        answer:
          "Hayır. UPR prim tabanlı ve nominaldir; CSM ise beklenen kâr tabanlı, iskonto edilmiş ve güncel tahminlerle yenilenen bir ölçümdür. Aynı portföy için farklı rakamlar verebilirler.",
      },
    ],
    content: [
      {
        type: "snippet",
        question: "IFRS 17 CSM nedir? (Kısa cevap)",
        answer:
          "CSM (Contractual Service Margin), bir sigorta sözleşmesi grubundan beklenen kârın henüz kazanılmamış kısmıdır. Sözleşme başlangıcında hesaplanır, hizmet süresince kapsam birimleriyle orantılı olarak gelire yansıtılır; olumsuz varsayım değişikliklerinde önce CSM tüketilir, sıfıra inerse fark 'zarar bileşeni' olarak doğrudan gelir tablosuna düşer.",
      },
      {
        type: "callout",
        variant: "warning",
        title: "Not",
        text:
          "Bu sayfa eğitim amaçlıdır; gerçek CSM ölçümü iskonto eğrisi, risk ayarlaması, kapsam birimleri (coverage units) ve ölçüm modeli (GMM/PAA/VFA) gibi unsurlara göre değişir.",
      },
      { type: "h3", text: "Bir sözleşme grubunda CSM'yi tek cümlede özetleyelim" },
      {
        type: "p",
        text:
          "Sözleşme grubundan kazanılması beklenen 'saf kâr' tutarı, hizmet sunumuyla orantılı olarak gelire itfa edilir. Yani IFRS 17, beklenen kârı poliçe kesildiği gün gelir yazmaz; hizmet süresine dağıtır.",
      },

      { type: "h3", text: "Basit örnek: 1.200 / 960 / 240 / 12 ay" },
      {
        type: "table",
        caption: "Hayali CSM hesaplaması (TL)",
        headers: ["Kalem", "Tutar", "Açıklama"],
        rows: [
          ["Prim (bugünkü değer varsayılıyor)", "1.200", "Tek ödeme"],
          ["Beklenen nakit çıkışı (hasar + gider)", "960", "Beklenen maliyet"],
          ["Risk ayarlaması (basit varsayım)", "0", "Eğitim için ihmal edildi"],
          ["Başlangıç CSM", "240", "= 1.200 − 960 − 0"],
          ["Hizmet süresi", "12 ay", "Eşit kapsam birimi varsayımı"],
          ["Aylık itfa", "20", "= 240 ÷ 12"],
        ],
      },
      {
        type: "p",
        text:
          "Sözleşme grubu 240 TL beklenen kâr ile başlar; her ay 20 TL IFRS 17 hizmet gelirine eklenir. Gerçek hayatta iskonto ve değişen varsayımlar yüzünden bu çizgi düz değildir.",
      },
      { type: "diagram", variant: "tfrs17-csm-bars" },

      { type: "h3", text: "CSM nasıl hareket eder? (Roll-forward özet)" },
      {
        type: "ul",
        items: [
          "Açılış CSM",
          "+ Yeni sözleşmelerin CSM'si",
          "+ Faiz birikimi (iskonto etkisiyle zamanla büyüme)",
          "± Varsayım değişikliği düzeltmesi (unlocking) — ör. hasar beklentisi yükseldiyse CSM azalır",
          "− Dönem itfası (gelire yazılan kısım)",
          "= Kapanış CSM",
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Kilit nokta",
        text:
          "Varsayım değişiklikleri önce CSM'yi etkiler; CSM pozitif kaldıkça gelir tablosu 'sakin' görünür. CSM bittiğinde aradaki fark zarar bileşeni olarak doğrudan gelir tablosuna düşer — bu yüzden CSM yöneticiler için 'tampon' gibi düşünülür.",
      },

      { type: "h3", text: "CSM ile UPR (kazanılmamış prim) farkı" },
      {
        type: "table",
        caption: "CSM vs UPR (hızlı karşılaştırma)",
        headers: ["Özellik", "CSM (IFRS 17)", "UPR (klasik)"],
        rows: [
          ["Tabanı", "Beklenen kâr", "Prim"],
          ["İskonto", "Evet", "Hayır"],
          ["Güncel tahminler", "Evet (her dönem)", "Nadiren yenilenir"],
          ["Unlocking", "Evet (varsayım değişirse)", "Hayır"],
          ["Gelire yayılma kriteri", "Kapsam birimleri", "Zamanla orantılı (çoğunlukla)"],
        ],
      },

      {
        type: "download",
        title: "CSM hesaplama Excel şablonu — ücretsiz",
        description:
          "Basit örnek sayfası + manuel doldurulacak KPI (roll-forward) sayfası. Formüller açık; kendi portföyünüzle deneyebilirsiniz.",
        href: "/downloads/tfrs-17-ornek-model.xlsx",
        fileName: "tfrs-17-ornek-model.xlsx",
        buttonLabel: "CSM örnek şablonunu indir (.xlsx)",
        previewSrc: EXCEL_PREVIEW,
        previewAlt: "CSM örnek şablonu önizlemesi",
      },

      clusterLinks(CSM_SLUG),
    ],
  },

  /* ============================================================
   *  UYDU 2 — Gelir Tablosu Nasıl Okunur?
   * ============================================================ */
  {
    slug: GELIR_SLUG,
    title: "IFRS 17 Gelir Tablosu Nasıl Okunur? Sigorta Çalışanı İçin Satır Satır Rehber",
    description:
      "IFRS 17 sonrası sigortacılık geliri, sigorta hizmet gideri ve finansman gelir/giderleri nasıl okunur? Hayali örnek tablo ve operasyonel KPI ile bağlantılar.",
    date: "2026-04-19",
    guideHref: `/blog/${HUB_SLUG}`,
    guideName: "IFRS 17 ana rehber",
    image: OG_IMAGE,
    keywords: [
      ...COMMON_KEYWORDS,
      "IFRS 17 gelir tablosu",
      "insurance service result",
      "sigorta hizmet gideri",
      "insurance finance income",
    ],
    faqs: [
      {
        question: "IFRS 17 gelir tablosunda 'Sigortacılık geliri' brüt prim midir?",
        answer:
          "Hayır. Sigortacılık geliri, dönemde sunulan hizmetle ilişkilendirilmiş tanıma; beklenen hasar ve gider + risk ayarlaması azalışı + CSM itfası bileşenlerini içerir. Brüt prim üretimi ayrı bir operasyonel göstergedir.",
      },
      {
        question: "'Hizmet sonucu' ile 'net kâr' aynı mı?",
        answer:
          "Hayır. Hizmet sonucu = Sigortacılık geliri − Sigorta hizmet gideri. Finansman (iskonto/faiz) etkileri ve yatırım sonuçları ayrı satırlardadır; net kâr bunların toplamından sonra çıkar.",
      },
      {
        question: "Reasürans satırı nerede görünür?",
        answer:
          "IFRS 17 gelir tablosunda genellikle 'Reasürans ile ilgili gelir/gider' ayrı bir satır grubunda görünür; brüt hizmet sonucundan sonra net hizmet sonucuna taşır.",
      },
    ],
    content: [
      {
        type: "snippet",
        question: "IFRS 17 gelir tablosu kısaca nasıl kurulur?",
        answer:
          "En üstte 'Sigortacılık geliri' (hizmet sunumuyla orantılı tanıma) ve 'Sigorta hizmet gideri' (hasar, gider, zarar bileşeni) yer alır; farkı 'Sigorta hizmet sonucu' (Insurance Service Result) verir. Altta 'Sigorta finansman gelir/gideri' (iskonto birikimi, faiz etkisi) ve reasürans etkileri net hizmet sonucunu oluşturur; yatırım sonucu ve diğer kalemler eklenerek net kâra ulaşılır.",
      },

      { type: "h3", text: "Satır başı özet" },
      {
        type: "table",
        caption: "IFRS 17 gelir tablosu — basit illüstrasyon (hayali, milyon TL)",
        headers: ["Satır", "Tutar", "Nereden gelir?"],
        rows: [
          ["Sigortacılık geliri (Insurance revenue)", "890", "CSM itfa + beklenen hasar/gider + risk düz."],
          ["Sigorta hizmet gideri (Insurance service expenses)", "-720", "Oluşan hasar, gider, zarar bileşeni, düzeltmeler"],
          ["Sigorta hizmet sonucu (brüt)", "170", "Üst iki satırın farkı"],
          ["Reasürans geliri/gideri (net)", "-10", "Reasürans sözleşmelerinin etkisi"],
          ["Net sigorta hizmet sonucu", "160", ""],
          ["Sigorta finansman gelir/gideri", "-25", "İskonto birikimi, iskonto oranı değişimi"],
          ["Yatırım gelir/gideri (özet)", "40", "Finansal varlıkların getirisi"],
          ["Vergi öncesi kâr (özet)", "95", ""],
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Okuma ipucu",
        text:
          "Çeyreklik trendde 'Sigortacılık geliri'nin zıpladığını ama 'Hizmet sonucu'nun aynı oranda artmadığını görebilirsiniz. Bunun nedeni genelde hasar beklentisinin veya zarar bileşeninin gideri yukarı çekmesidir.",
      },

      { type: "h3", text: "Operasyonel KPI ile köprü" },
      {
        type: "ul",
        items: [
          "Brüt prim üretimi ↗ ama sigortacılık geliri yatay → Yeni sözleşmeler ağırlıklı; CSM birikiyor, gelire henüz yansımadı.",
          "Hasar/prim oranı kötü ama hizmet sonucu iyi → Beklentilerle uyumlu; CSM itfa sürüyor, sürpriz yok.",
          "Hasar/prim iyi ama hizmet sonucu zayıf → Finansman gideri veya zarar bileşeni bastırıyor olabilir; dipnotları okuyun.",
        ],
      },

      {
        type: "links",
        title: "Bağlantılı metrikler (Ofis Akademi Finans & Sigorta)",
        items: [
          { label: "Kazanılmış prim", href: "/finans-sigorta/kazanilmis-prim" },
          { label: "Hasar / prim oranı", href: "/finans-sigorta/hasar-prim-orani" },
          { label: "Birleşik oran (combined ratio)", href: "/finans-sigorta/birlesik-oran" },
        ],
      },

      {
        type: "download",
        title: "IFRS 17 şablonu — gelir tablosu ile birlikte kullanın",
        description:
          "Şablondaki KPI sayfası, CSM hareketini takip etmenize yardım eder; bu yazıdaki gelir tablosu satırlarıyla birlikte okunduğunda hizmet sonucu daha anlamlı hale gelir.",
        href: "/downloads/tfrs-17-ornek-model.xlsx",
        fileName: "tfrs-17-ornek-model.xlsx",
        buttonLabel: "Excel şablonunu indir (.xlsx)",
        previewSrc: EXCEL_PREVIEW,
        previewAlt: "IFRS 17 gelir tablosu destek şablonu önizlemesi",
      },

      clusterLinks(GELIR_SLUG),
    ],
  },

  /* ============================================================
   *  UYDU 3 — Excel Modeli Basit Örnek
   * ============================================================ */
  {
    slug: EXCEL_SLUG,
    title: "IFRS 17 Excel Modeli: Basit Örnek (Ücretsiz Şablon + Adım Adım Anlatım)",
    description:
      "IFRS 17 için basit bir Excel modeli: Prim, beklenen maliyet, CSM ve aylık itfa. Formüller, KPI roll-forward çerçevesi ve ücretsiz indirilebilir şablon.",
    date: "2026-04-19",
    guideHref: `/blog/${HUB_SLUG}`,
    guideName: "IFRS 17 ana rehber",
    image: OG_IMAGE,
    keywords: [
      ...COMMON_KEYWORDS,
      "IFRS 17 Excel modeli",
      "ifrs 17 excel şablonu",
      "csm excel",
      "csm roll forward excel",
    ],
    faqs: [
      {
        question: "Bu Excel gerçek bir IFRS 17 modeli mi?",
        answer:
          "Hayır. Şablon eğitim amaçlıdır; iskonto, kapsam birimleri, risk ayarlaması ve reasürans gibi unsurlar basitleştirilmiştir. Amaç fikirleri göstermektir.",
      },
      {
        question: "Kendi portföyüm için nasıl uyarlarım?",
        answer:
          "KPI sayfasındaki sütunları kendi dönem/ürün dilinizle doldurun: açılış CSM, yeni sözleşmeler, faiz, unlocking, itfa, kapanış. Roll-forward mantığı aynıdır; formülleri kendi varsayımlarınızla değiştirin.",
      },
    ],
    content: [
      {
        type: "snippet",
        question: "IFRS 17 Excel modelinde ne var?",
        answer:
          "Üç sayfa: (1) Basit örnek — 1.200 TL prim, 960 TL beklenen maliyet, 240 TL başlangıç CSM ve 12 ay boyunca eşit itfa, formüllerle; (2) KPI şablonu — CSM roll-forward (açılış, yeni, faiz, unlocking, itfa, kapanış); (3) Feragat.",
      },

      { type: "h3", text: "Sayfa 1 — Basit örnek (formüllü)" },
      {
        type: "formula",
        label: "Başlangıç CSM",
        formula: "= Prim − Beklenen maliyet  (örnek: 1.200 − 960 = 240)",
      },
      {
        type: "formula",
        label: "Aylık itfa (eşit dağılım varsayımı)",
        formula: "= Başlangıç CSM ÷ Hizmet süresi (ay)  (240 ÷ 12 = 20)",
      },
      {
        type: "p",
        text:
          "Şablondaki B6 ve B8 hücreleri formül içerir; üstteki girdileri değiştirirseniz (prim, maliyet, ay) tablo otomatik güncellenir.",
      },

      { type: "h3", text: "Sayfa 2 — KPI (CSM roll-forward) şablonu" },
      {
        type: "table",
        caption: "Dönem bazlı doldurulacak sütunlar (örnek)",
        headers: [
          "Dönem",
          "Açılış CSM",
          "Yeni sözleşmeler",
          "Faiz",
          "Unlocking (±)",
          "İtfa",
          "Kapanış CSM",
          "Not",
        ],
        rows: [
          ["Q1", "—", "—", "—", "—", "—", "—", "örnek satır"],
          ["Q2", "—", "—", "—", "—", "—", "—", "örnek satır"],
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Pratik ipucu",
        text:
          "Kapanış = Açılış + Yeni + Faiz ± Unlocking − İtfa. Bir çeyrekte 'unlocking' sütununun büyüklüğü, varsayım değişikliklerinizin şiddetini gösterir; yönetim sunumunda bu sayıyı ayrıca anlatmak değerlidir.",
      },

      {
        type: "download",
        title: "IFRS 17 Excel modelini indirin",
        description:
          "Üç sayfalık eğitim dosyası — formüller açıktır, kendi sayılarınızla deneyebilirsiniz. Lisans: eğitim ve dahili kullanım.",
        href: "/downloads/tfrs-17-ornek-model.xlsx",
        fileName: "tfrs-17-ornek-model.xlsx",
        buttonLabel: "Şablonu indir (.xlsx)",
        previewSrc: EXCEL_PREVIEW,
        previewAlt: "IFRS 17 Excel modelinin önizlemesi",
      },

      { type: "h3", text: "Sonraki adım" },
      {
        type: "ul",
        items: [
          "Şablondaki girdileri kendi bir ürün grubunuzun 1 dönemlik verisiyle doldurun.",
          "Roll-forward sayfasını 4 çeyrek boyunca doldurun — örüntü hemen görünür hale gelir.",
          "CSM tanımı ve gelir tablosu satırlarıyla bağlantıyı kurmak için serinin diğer yazılarını okuyun.",
        ],
      },

      clusterLinks(EXCEL_SLUG),
    ],
  },

  /* ============================================================
   *  UYDU 4 — IFRS 17 PAA (Basitleştirilmiş Yaklaşım)
   * ============================================================ */
  {
    slug: PAA_SLUG,
    title:
      "IFRS 17 PAA (Basitleştirilmiş Yaklaşım) Nedir? Kısa Vadeli Sigortalar İçin Rehber",
    description:
      "IFRS 17'nin PAA (Premium Allocation Approach) modeli: hangi sözleşmelerde kullanılır, LRC nasıl ölçülür, GMM'den farkları nelerdir? Hayali örnekle adım adım.",
    date: "2026-04-19",
    guideHref: `/blog/${HUB_SLUG}`,
    guideName: "IFRS 17 ana rehber",
    image: OG_IMAGE,
    keywords: [
      ...COMMON_KEYWORDS,
      "ifrs 17 paa",
      "premium allocation approach",
      "tfrs 17 paa",
      "ifrs 17 basitleştirilmiş yaklaşım",
      "paa nedir",
      "paa gmm farkı",
      "kısa vadeli sigorta muhasebesi",
      "kasko ifrs 17",
    ],
    faqs: [
      {
        question: "PAA nedir, kısaca?",
        answer:
          "PAA (Premium Allocation Approach), IFRS 17'de kısa vadeli sigorta sözleşmeleri için izin verilen basitleştirilmiş ölçüm modelidir. Kalan kapsama yükümlülüğünü (LRC), tahsil edilmemiş primden hareketle hesaplar; CSM ayrı bir hesap olarak takip edilmez.",
      },
      {
        question: "PAA hangi sözleşmelerde kullanılabilir?",
        answer:
          "Kapsama süresi 1 yıl veya daha kısa olan sözleşmelerde PAA doğrudan uygulanabilir. 1 yıldan uzun sözleşmelerde ancak sonucun GMM ile 'makul ölçüde' benzer olacağı ispatlanabiliyorsa kullanılabilir. Türkiye'de kasko, trafik, konut, sağlık gibi yıllık ürünler tipik PAA adaylarıdır.",
      },
      {
        question: "PAA ile GMM arasındaki temel fark nedir?",
        answer:
          "GMM, yükümlülüğü gelecekteki nakit akışları + risk ayarlaması + CSM olarak üç bileşende tutar. PAA ise LRC'yi tahsil edilmemiş prim benzeri bir mantıkla (UPR'ye yakın) ölçer ve CSM'i ayrıca taşımaz. Muallak hasar tarafı (LIC) her iki modelde de güncel tahminlerle ölçülür.",
      },
      {
        question: "PAA'da CSM var mı?",
        answer:
          "Hayır, PAA'da CSM ayrı bir kalem olarak izlenmez. Beklenen kâr, hizmet süresine yayılmış olarak dolaylı yoldan LRC'nin erimesi ile gelire yansır. Bu nedenle PAA kullanan şirketlerin mali tablolarında 'CSM' satırı görülmez.",
      },
      {
        question: "Zarar bileşeni (loss component) PAA'da nasıl işler?",
        answer:
          "Eğer poliçe grubunun kapsama süresi boyunca zarar yapacağı bariz ise (örneğin hasar/prim beklentisi çok yüksek), PAA'da da zarar bileşeni ayrılır ve gelir tablosunda hemen gider olarak kaydedilir. Bu, yüksek hasarlı branşlarda önemli bir sinyaldir.",
      },
    ],
    content: [
      {
        type: "snippet",
        question: "PAA nedir? (Kısa cevap)",
        answer:
          "PAA (Premium Allocation Approach / Prim Dağıtım Yaklaşımı), IFRS 17'nin kısa vadeli (≤1 yıl) sigorta sözleşmeleri için izin verdiği basitleştirilmiş ölçüm modelidir. Yükümlülüğü tahsil edilmemiş primden yola çıkarak ölçer, CSM'i ayrı taşımaz — kasko, trafik, konut, sağlık gibi yıllık branşlarda yaygın kullanılır.",
      },
      {
        type: "callout",
        variant: "warning",
        title: "Önemli not",
        text:
          "Rakamlar hayalidir; iskonto, reasürans, yönetim gideri gibi bileşenler basitleştirilmiştir. Bu yazı eğitim amaçlıdır, muhasebe/aktüerya politikalarının yerine geçmez.",
      },
      {
        type: "p",
        text:
          "IFRS 17 tek bir ölçüm modeli dayatmaz; üç model sunar: Genel Ölçüm Modeli (GMM), Değişken Ücret Yaklaşımı (VFA) ve Prim Dağıtım Yaklaşımı (PAA). PAA, özellikle Türkiye'deki elementer sigorta portföyü (kasko, trafik, konut, sağlık) için en pratik olan modeldir çünkü mevcut TFRS 4 / KPK mantığına en yakın olanıdır.",
      },

      { type: "h3", text: "Hangi sözleşmelerde PAA kullanılır?" },
      {
        type: "diagram",
        variant: "tfrs17-paa-vs-gmm",
      },
      {
        type: "ul",
        items: [
          "Kapsama süresi 1 yıl veya daha kısa → PAA otomatik uygulanabilir.",
          "Kapsama süresi 1 yıldan uzun → Ancak PAA sonucunun GMM'e 'makul ölçüde yakın' olacağı ispatlanırsa kullanılabilir.",
          "Zararlı (onerous) olduğu daha başlangıçta belli olan sözleşme grupları → Zarar bileşeni ayrılır, yine PAA uygulanabilir ama gider hemen kaydedilir.",
        ],
      },

      { type: "h3", text: "PAA ile GMM farkı — tek bakışta" },
      {
        type: "table",
        caption: "PAA vs GMM özeti",
        headers: ["Unsur", "PAA", "GMM"],
        rows: [
          ["Kapsama süresi", "≤1 yıl (tipik)", "Çoğunlukla >1 yıl"],
          ["LRC ölçümü", "Tahsil edilmemiş primden (UPR benzeri)", "Nakit akışları + RA + CSM"],
          ["CSM", "Ayrı taşınmaz", "Ayrı hesap, hizmet süresine yayılır"],
          ["İskonto", "Genelde zorunlu değil (opsiyonel)", "Zorunlu, güncel piyasa oranı"],
          ["Risk ayarlaması (RA)", "Yalnızca LIC'de", "Hem LRC hem LIC'de"],
          ["Kullanım yoğunluğu (TR)", "Yüksek — elementer portföy", "Düşük — hayat, uzun vadeli"],
        ],
      },

      { type: "h3", text: "PAA ile LRC nasıl ölçülür? (hayali örnek)" },
      {
        type: "snippet",
        question: "LRC ne demek?",
        answer:
          "Liability for Remaining Coverage — kalan kapsama yükümlülüğü. Yani 'poliçe hâlâ devam ediyor, bu süre için şirket üstlenmiş olduğu yükümlülüğün muhasebedeki karşılığı'. PAA'da UPR'ye benzer şekilde ölçülür.",
      },
      {
        type: "p",
        text:
          "Örneğimiz: 1 yıllık bir kasko poliçesi. Prim 1.200 TL (KDV ve diğer gider hariç), kapsama süresi 12 ay. Şirket primi peşin tahsil ediyor. PAA altında başlangıç LRC = 1.200 TL. Her ay kapsamanın 1/12'si sunuldukça LRC 100 TL eriyor ve aynı tutar kadar 'sigortacılık geliri' tanınıyor.",
      },
      {
        type: "table",
        caption: "PAA — Aylık LRC eriyişi (1.200 TL, 12 ay)",
        headers: ["Ay", "Açılış LRC", "Aylık itfa (gelir)", "Kapanış LRC"],
        rows: [
          ["1", "1.200", "100", "1.100"],
          ["2", "1.100", "100", "1.000"],
          ["3", "1.000", "100", "900"],
          ["...", "...", "...", "..."],
          ["12", "100", "100", "0"],
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Pratik karşılaştırma",
        text:
          "Bu örnek TFRS 4 / mevcut KPK mantığına çok benzer. Asıl farklılık LIC (muallak hasar) tarafında ortaya çıkar: IFRS 17 altında LIC güncel tahminlerle ve risk ayarlaması ile ölçülür, yalnızca 'IBNR + muallak' değildir.",
      },

      { type: "h3", text: "Zarar bileşeni (loss component) ne zaman ortaya çıkar?" },
      {
        type: "p",
        text:
          "Eğer bir sözleşme grubunun gelecekteki hasarlarının primden yüksek olacağı daha başlangıçta biliniyorsa, aradaki fark derhal gelir tablosuna 'gider' olarak yazılır ve LRC'nin içinde 'zarar bileşeni' olarak ayrı izlenir. Örneğin: 1.200 TL prim, 1.400 TL tahmini hasar → 200 TL zarar bileşeni başlangıçta tanınır.",
      },
      {
        type: "table",
        caption: "Zarar bileşeni örneği (hayali)",
        headers: ["Kalem", "Tutar (TL)"],
        rows: [
          ["Brüt prim", "1.200"],
          ["Beklenen hasar + gider", "1.400"],
          ["Zarar bileşeni (başlangıçta)", "(200) — gider olarak tablolara girer"],
          ["LRC — normal bileşen", "1.200"],
          ["LRC — zarar bileşeni", "200 (ayrı izlenir)"],
        ],
      },

      { type: "h3", text: "PAA kullanan şirketin gelir tablosunda ne değişir?" },
      {
        type: "ul",
        items: [
          "Sigortacılık geliri: LRC'nin dönem içinde erimesiyle orantılı. Brüt prim üretimi artık doğrudan gelire yazılmıyor.",
          "Sigortacılık hizmet gideri: ödenen + beklenen hasar farkları + yönetim gideri.",
          "Reasürans gelir/gideri: ayrı bir satır grubunda net gösterilir.",
          "Sigortacılık finans gelir/gideri: iskonto etkisi ve iskonto değişimi (PAA'da opsiyonel, seçimin etkisi burada).",
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "KPI etkisi",
        text:
          "Kombine oran gibi klasik metrikler PAA altında benzer okunur ama sayılar artık 'IFRS 17 sigortacılık geliri' paydasına oturur. Yönetim raporunda 'prim üretimi' ve 'IFRS 17 sigortacılık geliri' aynı dönemde farklı yönlerde hareket edebilir — bunu iletişimde açıklamak kritik.",
      },

      { type: "h3", text: "Sonraki adım" },
      {
        type: "ul",
        items: [
          "Kendi ürün grubunuzun (ör. kasko, sağlık) 1 dönemlik PAA simülasyonunu tablo halinde kurun.",
          "Zarar bileşenini ayrı bir sütun olarak takip edin; onerous grup tespiti için önceden gerekli.",
          "Eğer portföyünüzde 1 yıldan uzun sözleşmeler varsa, PAA uygunluk testini dokümante edin.",
        ],
      },

      clusterLinks(PAA_SLUG),
    ],
  },

  /* ============================================================
   *  UYDU 5 — IFRS 17 Risk Ayarlaması (RA)
   * ============================================================ */
  {
    slug: RA_SLUG,
    title:
      "IFRS 17 Risk Ayarlaması (RA) Nedir? Nasıl Hesaplanır? — Pratik Örnek",
    description:
      "IFRS 17'de Risk Adjustment (RA) kavramı: nakit akışı belirsizliğinin bilançoya yansıması. Güven aralığı yöntemi, hayali örnek ve CSM / LRC / LIC üzerindeki etkisi.",
    date: "2026-04-19",
    guideHref: `/blog/${HUB_SLUG}`,
    guideName: "IFRS 17 ana rehber",
    image: OG_IMAGE,
    keywords: [
      ...COMMON_KEYWORDS,
      "ifrs 17 risk ayarlaması",
      "risk adjustment ifrs 17",
      "tfrs 17 risk ayarlaması",
      "ra hesaplama",
      "güven aralığı ra",
      "confidence level ra",
      "risk ayarlaması örnek",
    ],
    faqs: [
      {
        question: "IFRS 17 risk ayarlaması (RA) nedir?",
        answer:
          "RA, finansal olmayan (sigorta) risklerin beklenen nakit akışları üzerine eklenen bir tampondur. Yani 'gerçek hasarın beklenenden sapma olasılığına karşılık şirketin talep ettiği ek tutar'. IFRS 17'de yükümlülüğün zorunlu bir bileşenidir ve hem LRC hem LIC içinde yer alır (PAA'da sadece LIC'de).",
      },
      {
        question: "RA hangi yöntemle hesaplanır?",
        answer:
          "IFRS 17 belirli bir yöntem dayatmaz. Uygulamada en yaygın kullanılan 'güven aralığı (confidence level) yaklaşımıdır': şirket belirli bir güven düzeyini (ör. %75) hedefler ve beklenen değer + (güven düzeyi − medyan) farkını RA olarak alır. Alternatifler: cost-of-capital ve VaR/TVaR yaklaşımları.",
      },
      {
        question: "Şirketler hangi güven düzeyini kullanır?",
        answer:
          "Türkiye ve Avrupa piyasasında %70–%85 aralığı yaygındır. Düzey yükseldikçe RA (ve dolayısıyla yükümlülük) artar, CSM azalır. Şirketin risk iştahı ve reasürans politikasıyla tutarlı bir düzey seçmesi beklenir. Seçilen güven düzeyinin mali tablo dipnotlarında açıklanması zorunludur.",
      },
      {
        question: "RA, CSM ve LRC/LIC ile nasıl etkileşir?",
        answer:
          "GMM'de LRC başlangıç ölçümü: Beklenen nakit akışları + RA + CSM. RA arttıkça CSM azalır (çünkü prim sabittir). LIC tarafında ise RA hasarın sonuçlanmasına kadar salınır ve dönem sonunda yeniden ölçülür. RA salınımı gelir tablosunda 'risk ayarlaması değişimi' satırında görünür.",
      },
      {
        question: "PAA'da RA var mı?",
        answer:
          "Kısmen. PAA'da LRC ölçümü UPR benzeri olduğu için başlangıçta RA ayrıca ölçülmez. Ancak LIC (muallak hasar) tarafında RA hem PAA hem GMM için zorunludur.",
      },
    ],
    content: [
      {
        type: "snippet",
        question: "Risk ayarlaması (RA) nedir?",
        answer:
          "Risk Adjustment (RA), IFRS 17'de 'sigorta riskinin belirsizliği' için beklenen nakit akışına eklenen bir tampondur. Beklenen hasar bir noktasal tahmin değildir; etrafında sapma olasılığı vardır. RA, bu belirsizlik için şirketin talep ettiği ek tutardır ve yükümlülüğe dahil edilir.",
      },
      {
        type: "callout",
        variant: "warning",
        title: "Önemli not",
        text:
          "Rakamlar hayalidir. Gerçek uygulamada RA, aktüeryal dağılım modelleriyle hesaplanır ve reasürans/çeşitlendirme etkileri dikkate alınır. Bu yazı eğitim amaçlıdır.",
      },

      { type: "h3", text: "Neden RA var?" },
      {
        type: "p",
        text:
          "Bir portföyün 'beklenen hasarı' 100 TL olabilir ama gerçek hasarın 100 olması garanti değil — 90 ile 130 arasında salınacaktır. IFRS 17, bu belirsizliği mali tabloya yansıtmayı zorunlu kılar. Böylece 'iyi' bir portföyle (dar salınım, düşük RA) 'kötü' bir portföyü (geniş salınım, yüksek RA) karşılaştırmak mümkün olur.",
      },
      {
        type: "diagram",
        variant: "tfrs17-ra-confidence",
      },
      {
        type: "ul",
        items: [
          "Beklenen değer (ortalama / medyan): Tahmin edilen en olası nakit akışı.",
          "Güven düzeyi (ör. %75): Şirketin 'hasarın bu düzeyin altında kalma ihtimali' olarak belirlediği eşik.",
          "RA = Güven düzeyindeki değer − Beklenen değer. Yani salınımın 'üst tarafı' için ayrılan tamponun parasal karşılığı.",
        ],
      },

      { type: "h3", text: "RA örneği — güven aralığı yöntemi" },
      {
        type: "p",
        text:
          "Bir kasko portföyünün beklenen yıllık hasarı 100 TL, dağılım normal, standart sapma 15 TL olsun. %75 güven düzeyi (~0.67σ üstü) için:",
      },
      {
        type: "table",
        caption: "Hayali bir portföy için RA — güven aralığı yöntemi",
        headers: ["Kalem", "Değer (TL)"],
        rows: [
          ["Beklenen hasar (medyan)", "100"],
          ["Standart sapma (σ)", "15"],
          ["%75 güven düzeyine karşılık gelen değer", "110"],
          ["Risk Ayarlaması (RA)", "10 (= 110 − 100)"],
          ["%85 güven düzeyine karşılık gelen değer", "116"],
          ["Alternatif RA (%85 için)", "16"],
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Yorumlama",
        text:
          "Aynı portföyde şirket daha muhafazakar bir tutum (yüksek güven düzeyi) seçerse RA büyür, dolayısıyla LRC büyür ve CSM daralır. Yani RA seçimi, ilk gün 'beklenen kârınızın' ne kadarını bugün tanıyacağınızı doğrudan etkiler.",
      },

      { type: "h3", text: "RA'nın mali tablolardaki yeri" },
      {
        type: "table",
        caption: "RA — bilanço ve gelir tablosundaki etkisi",
        headers: ["Alan", "Etki"],
        rows: [
          ["LRC (GMM)", "Başlangıçta ayrılır, kapsama süresince salınır"],
          ["LIC (PAA ve GMM)", "Her dönem yeniden ölçülür, muallak hasar ile birlikte"],
          ["CSM (GMM)", "RA büyükse CSM küçülür — prim sabit olduğu için"],
          ["Gelir tablosu — RA salınımı satırı", "Dönem içi RA değişimini gösterir"],
          ["Dipnotlar", "Seçilen yöntem + güven düzeyi açıklanır"],
        ],
      },

      { type: "h3", text: "Yöntem seçimi: güven aralığı, CoC, VaR" },
      {
        type: "ul",
        items: [
          "Güven aralığı (Confidence Level) — En yaygın, iletişimi kolay. Dipnotta güven düzeyi açıklanır.",
          "Cost-of-Capital — Solvency II mantığına daha yakın; şirketin SCR sermaye maliyetini yansıtır.",
          "VaR/TVaR — Bankacılık risk yönetiminden gelen yaklaşımlar; agresif kuyruk etkilerini yakalar.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Pratik tavsiye",
        text:
          "İlk uygulama yılında şirketler genellikle güven aralığı yöntemini tercih eder — denetim ve sunum açısından daha şeffaftır. Zaman içinde CoC veya VaR tabanlı modellere geçiş yapan şirketler de vardır.",
      },

      { type: "h3", text: "Sonraki adım" },
      {
        type: "ul",
        items: [
          "Kendi portföyünüzün 1 yıllık hasar dağılımını (ortalama, std) hazırlayın.",
          "Farklı güven düzeyleri (%70, %75, %80, %85) için RA tutarlarını karşılaştırın.",
          "CSM üzerindeki etkisini gözlemleyin — düzey değişiklikleri ne kadar sapma yaratıyor?",
          "Dipnot yazımı için seçilen yöntemin gerekçesini bugünden dokümante edin.",
        ],
      },

      clusterLinks(RA_SLUG),
    ],
  },
];
