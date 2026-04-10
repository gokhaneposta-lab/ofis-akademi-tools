/**
 * TFRS 17 — sigorta çalışanları için eğitim blog içeriği (hayali tablo, şema).
 */
import type { BlogPost } from "./blog-posts";

export const BLOG_POSTS_TFRS17: BlogPost[] = [
  {
    slug: "tfrs-17-yeni-sigorta-mali-tablosu-rehberi",
    title:
      "TFRS 17 ve Yeni Sigorta Mali Tablosu: Sigorta Çalışanları İçin Rehber (Hayali Tablo + Şemalar)",
    description:
      "TFRS 17 sonrası bilanço ve gelir tablosunu sigorta operasyonu gözüyle okumak: poliçe, tahsilat, sözleşme grupları, LIC/LRC/CSM özeti ve tamamen hayali örnek tablo. Eğitim amaçlıdır.",
    date: "2026-03-29",
    guideHref: "/finans-sigorta",
    guideName: "Finans & Sigorta metrikleri",
    keywords: [
      "TFRS 17",
      "sigorta muhasebesi",
      "sigorta bilançosu",
      "CSM",
      "LIC",
      "LRC",
      "kazanılmamış prim",
      "sözleşme grubu",
      "TMS",
      "sigorta çalışanı",
    ],
    faqs: [
      {
        question: "TFRS 17 ile birlikte prim tahsilatı gelir tablosunda doğrudan 'brüt prim' olarak mı görünür?",
        answer:
          "Genel olarak hayır: TFRS 17, geliri çoğu sözleşme için hizmetin sunulmasıyla orantılı (zaman içinde) tanıma ve teknik sonuçları ayrıştırma mantığına kaydırır. Gördüğünüz kalemler şirketin ölçüm modeline ve sunuma bağlıdır; detay TMS/TFRS ve şirket politikasına göre değişir.",
      },
      {
        question: "Poliçe kesildiği gün tüm prim bilançoda aynı şekilde mi durur?",
        answer:
          "Tahsilat veya alacak ile ilgili nakit etkileri bilançonun bir tarafında görülürken, sigorta yükümlülüğü ve kalan kapsam bileşenleri ayrı satırlarda izlenir. Klasik 'sadece kazanılmamış prim' düşüncesi tek başına yeterli değildir; CSM ve yükümlülük ölçümü devreye girer.",
      },
      {
        question: "CSM (sözleşme hizmet marjı) nedir, operasyonel raporlarla ilişkisi nedir?",
        answer:
          "Basitçe: sözleşmeden beklenen kârın, hizmet sunuldukça gelire yansıtılacak kısmının muhasebe karşılığıdır. Operasyonel olarak iyi dönem performansı ile CSM hareketleri aynı yönde olmayabilir; bu yüzden yönetim sunumlarında 'teknik + muhasebe' ayrımı sık anlatılır.",
      },
      {
        question: "Bu yazıdaki rakamlar gerçek şirket verisi midir?",
        answer:
          "Hayır. Tablolardaki tutarlar tamamen hayali ve yuvarlatılmıştır; yalnızca satır mantığını göstermek içindir. Gerçek finansal tablo için ilgili döneme ait TFRS uygun raporlamaya bakılmalıdır.",
      },
      {
        question: "Hayat ve sağlık ile zarar branşları bu yazıda ayrı mı ele alınıyor?",
        answer:
          "Bu yazı genel çerçevededir. Ölçüm modeli (ör. genelleştirilmiş model, prim ayırma yaklaşımı, değişken ücret) branş ve sözleşme tipine göre değişebilir; ayrıntı için TFRS 17 metni ve şirket içi aktüerya/finans dokümanları esas alınmalıdır.",
      },
      {
        question: "TFRS 17'yi Excel veya KPI sayfalarınızla nasıl ilişkilendirebilirim?",
        answer:
          "Operasyonel KPI'lar (ör. hasar/prim, kazanılmış prim, tahsilat oranı) hâlâ işi yönetmek için kullanılır; TFRS 17 tablosu ise bu faaliyetlerin finansal dilde konsolide ifadesidir. Sitemizdeki Finans & Sigorta bölümündeki teknik karşılık ve prim metrikleri klasik/ara dönem dilini anlamanıza yardımcı olur.",
      },
    ],
    content: [
      {
        type: "callout",
        variant: "warning",
        title: "Önemli not",
        text:
          "Bu yazı eğitim amaçlıdır; TMS/TFRS, KGK düzenlemeleri veya şirketinizin aktüerya ve muhasebe politikalarının yerine geçmez. Rakamlar tamamen hayalidir.",
      },
      {
        type: "p",
        text:
          "Sigorta şirketinde satıştan hasara, tahsilattan yenilemeye kadar günlük işiniz operasyonel verilerle döner; yıllık ve çeyreklik finansal tablolar ise aynı faaliyetin farklı bir dilde özetidir. TFRS 17 (Sigorta Sözleşmeleri Standardı), bu özeti yeniden düzenleyerek bilanço ve gelir tablosunda gördüğünüz kalemlerin mantığını değiştirdi. Bu rehber, teknik terimleri sadeleştirerek 'tabloda ne arıyorum?' sorusuna odaklanır.",
      },
      {
        type: "h3",
        text: "Neden tablo değişti? (Tek cümlelik çerçeve)",
      },
      {
        type: "p",
        text:
          "Eski uygulamada çoğu sigortacıda alışıldık olan tablo yapısı, brüt prim üretimi ve teknik karşılıklar üzerinden daha doğrudan okunabiliyordu. TFRS 17 ise sözleşmeleri gruplar halinde ölçer, yükümlülükleri güncel tahminlerle değerlendirir ve beklenen kârın bir kısmını CSM üzerinden hizmet süresine yayar. Sonuç: aynı poliçe portföyü, farklı satır başlıkları ve farklı zamanlama ile görünür.",
      },
      {
        type: "h3",
        text: "Poliçe ve risk süresi: tabloyu hangi zaman ekseninde düşünmeliyim?",
      },
      {
        type: "p",
        text:
          "Poliçe başladığında risk üstlenilir; süre boyunca prim (veya taksitler) tahsil edilebilir; dönem içinde hasar veya iddia oluşabilir; sözleşme yenilenir veya sona erer. Mali tablo, bu olayların parasal yansımalarını dönemlere dağıtır.",
      },
      { type: "diagram", variant: "tfrs17-policy-coverage" },
      {
        type: "h3",
        text: "Tahsilat (nakit) ile gelir tablosu aynı şey değildir",
      },
      {
        type: "p",
        text:
          "Saha ekibi için 'prim tahsil edildi' güçlü bir başarı göstergesidir. Muhasebe tarafında ise tahsilat bilançoda nakit veya alacağı etkiler; gelir tablosundaki teknik gelir/gider kalemleri ise çoğu modelde hizmetin sunulması ve yükümlülük ölçümüyle ilişkilendirilir. Bu uyumsuzluk, çeyrek sonuçlarını yorumlarken sık sorulan soruların kaynağıdır.",
      },
      { type: "diagram", variant: "tfrs17-premium-flow" },
      {
        type: "h3",
        text: "Sözleşme grubu: neden tek tek poliçe değil?",
      },
      {
        type: "p",
        text:
          "TFRS 17, benzer risk özellikli sözleşmeleri bir arada değerlendirmeyi gerektirir. Pratikte finans ekipleri portföyleri 'gruplar' halinde modeler; sizin raporlarınızdaki ürün hattı veya kanal kırılımı bu gruplarla tam örtüşmeyebilir ama yorum yaparken aynı mantığın var olduğunu bilmeniz faydalıdır.",
      },
      {
        type: "h3",
        text: "Üç kısa kavram: LIC, LRC ve CSM",
      },
      {
        type: "ul",
        items: [
          "LIC (yükümlülük karşılığı bileşeni): Oluşmuş iddia ve olaylarla ilgili yükümlülüğün güncel tahmini — operasyonel dilde 'henüz kapanmamış hasar/IDV' yaklaşımına yakın düşünülebilir (IBNR ve düzeltmeler modelde ayrıntılanır).",
          "LRC (kalan kapsam yükümlülüğü): Henüz sunulmamış hizmete ait kısım — klasik 'kazanılmamış' riskin finansal ölçüm karşılığıdır fakat TFRS 17 ölçümü ile birebir aynı rakam olmayabilir.",
          "CSM (sözleşme hizmet marjı): Beklenen kârın, henüz kazanılmamış kısmı; hizmet sunuldukça gelire itfa edilir. Kötü teknik sonuç bazen önce CSM'i tüketir, sonra kârlılığı etkiler — bu yüzden yönetim sunumlarında CSM hareketleri ayrı slayt olarak gezer.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Operasyonel KPI ile köprü",
        text:
          "Hasar/prim oranı, kazanılmış prim, tahsilat oranı gibi göstergeler işi yönetmek içindir. TFRS 17 tablosu bu göstergelerin tamamının tek satırda toplanmadığı, zamanlama ve ölçüm farklarıyla yeniden kurgulandığı bir özet sunar. Ofis Akademi Finans & Sigorta bölümünde kazanılmış prim, KPK ve muallak hasar gibi konulara kısa hesaplayıcılar ve tanımlar bulunur.",
      },
      {
        type: "h3",
        text: "Hayali özet bilanço ve gelir tablosu (illüstratif)",
      },
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
          "Gerçek raporlarda satır sayısı çok daha fazladır; özellikle CSM açılışı, düzeltmeler, risk ayarlaması ve faiz etkileri dipnotlarda ayrıntılanır. Yönetim kurulu özetinde gördüğünüz 'teknik kâr' tanımı ile TFRS 17 gelir tablosu satırları birebir aynı etiketleri kullanmayabilir.",
      },
      {
        type: "h3",
        text: "Rapor okurken sigorta çalışanı olarak nelere dikkat edebilirsiniz?",
      },
      {
        type: "ul",
        items: [
          "Aynı çeyrekte tahsilatın güçlü olması ile gelir tablosundaki teknik gelirin güçlü görünmesi her zaman örtüşmez — sunumda 'nakit' ve 'TFRS geliri' ayrı slaytlarda ise şaşırmayın.",
          "Hasar yılı kötü geçmiş olsa bile CSM tüketimi veya geçmiş dönem düzeltmeleri net kârı farklı yönde hareket ettirebilir.",
          "Yenileme ve fiyat artışı operasyonel olarak olumlu görünür; tabloda ise yeni sözleşme veya değişen varsayımlar CSM ve LRC ölçümünü aynı yönde taşımayabilir.",
          "Reasürans payı, brüt kalemlerden sonra netleştiği için brüt hasarı yorumlarken reasürans satırlarını birlikte okumak gerekir.",
        ],
      },
      {
        type: "h3",
        text: "Resmi kaynak ve iç eğitim",
      },
      {
        type: "p",
        text:
          "TFRS 17 metni ve KGK'nın yayımladığı Türkiye finansal raporlama standartları, bağlayıcı referanstır. Şirket içi aktüerya el kitabı ve finans kontrol departmanının 'TFRS 17 mapping' dokümanı (operasyonel rapor satırı → muhasebe hesabı) en doğru iş yeri kaynağınızdır.",
      },
      {
        type: "h3",
        text: "Özet",
      },
      {
        type: "p",
        text:
          "TFRS 17, sigorta faaliyetini sözleşme grupları üzerinden ölçerek bilanço ve gelir tablosunu yeniden düzenler. Poliçe ve tahsilat operasyonel gerçekliktir; tablo ise bu gerçekliğin yükümlülük ölçümü, kalan kapsam ve CSM itfasıyla zamanlanmış finansal yansımasıdır. Hayali tablolarımız satır mantığını göstermek içindir — gerçek rakamlar için her zaman resmi finansal rapora ve dipnotlara başvurun.",
      },
      {
        type: "p",
        text:
          "Aşağıdaki sayfalar klasik teknik dil ile günlük işi bağlamanıza yardımcı olur; TFRS 17 satırlarıyla birebir örtüşmeyebilir ancak KPI mantığını pekiştirir.",
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
    ],
  },
];
