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
];
