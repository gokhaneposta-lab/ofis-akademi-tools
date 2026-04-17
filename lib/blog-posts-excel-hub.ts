/**
 * Excel "hub" temalı uzun-form blog yazıları (Pivot, Dashboard, Power Query, vb.).
 * Ofis Akademi topic cluster stratejisinin Excel ayağı.
 *
 * Tüm rakamlar hayalidir; eğitim içeriklidir.
 */
import type { BlogPost } from "./blog-posts";

const PIVOT_SLUG = "excel-pivot-table-nasil-yapilir";
const DASHBOARD_SLUG = "excel-dashboard-nasil-hazirlanir";

const excelClusterLinks = (exclude: string) =>
  ({
    type: "links" as const,
    title: "İlgili Excel rehberleri",
    items: [
      { label: "Excel Pivot Table nasıl yapılır? — adım adım", href: `/blog/${PIVOT_SLUG}` },
      { label: "Excel Dashboard nasıl hazırlanır?", href: `/blog/${DASHBOARD_SLUG}` },
      { label: "Excel'de Dropdown (Açılır) Liste Yapma", href: `/blog/excel-acilir-liste-dropdown-yapma` },
      { label: "XLOOKUP Kullanımı — Formül Kütüphanesi", href: `/formul-kutuphanesi/xlookup` },
      { label: "DÜŞEYARA — Formül Kütüphanesi", href: `/formul-kutuphanesi/duseyara` },
    ].filter((x) => !x.href.endsWith(`/${exclude}`)),
  });

export const BLOG_POSTS_EXCEL_HUB: BlogPost[] = [
  /* ============================================================
   *  PIVOT TABLE HUB
   * ============================================================ */
  {
    slug: PIVOT_SLUG,
    title:
      "Excel Pivot Table Nasıl Yapılır? Adım Adım Rehber + Ücretsiz Örnek Dosya",
    description:
      "Excel'de PivotTable (özet tablo) nasıl yapılır? Veri hazırlığı, alanları yerleştirme, dilimleyici (slicer) ve dashboard için 5 adım. Ücretsiz indirilebilir örnek Excel dosyası.",
    date: "2026-04-19",
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
    keywords: [
      "excel pivot table",
      "pivot table nasıl yapılır",
      "excel özet tablo",
      "pivot nasıl yapılır",
      "excel pivot",
      "pivot table örnek",
      "excel dashboard pivot",
      "pivot dilimleyici",
      "slicer excel",
      "pivot zaman çizelgesi",
    ],
    faqs: [
      {
        question: "PivotTable (özet tablo) nedir?",
        answer:
          "PivotTable, bir Excel veri tablosunu satır/sütun/değer alanları ile özetleyen ve kullanıcının sürükle-bırakla yeniden düzenleyebildiği dinamik bir rapor aracıdır. Binlerce satırı saniyeler içinde gruplandırır, toplar ve karşılaştırır.",
      },
      {
        question: "PivotTable hangi veri yapısıyla çalışır?",
        answer:
          "Düzenli 'tablo' yapısında verilerle çalışır: ilk satırda başlıklar olmalı, her sütun tek bir değişken içermeli, birleşik hücre olmamalı ve boş satır/sütun ayrımı bulunmamalıdır. Verinizi önce Tablo (Ctrl+T) formatına çevirmeniz büyük avantajdır.",
      },
      {
        question: "Dilimleyici (slicer) nedir? Pivot'ta nasıl kullanılır?",
        answer:
          "Dilimleyici, PivotTable'ı görsel butonlarla filtrelemeye yarayan bileşendir. Dropdown filtre yerine büyük, tıklanabilir kartlar sunar. Birden fazla dilimleyici ile aynı anda Departman, Ay ve Ürün filtreleri uygulayabilirsiniz. Dashboard'ların vazgeçilmezidir.",
      },
      {
        question: "Pivot veriye yeni satır eklendiğinde güncellenmiyor. Neden?",
        answer:
          "Kaynak veri aralığı sabit. Çözüm: veriyi Tablo'ya (Ctrl+T) dönüştürün; Pivot otomatik genişler. Alternatif: PivotTable Araçları → Analiz → Veri Kaynağını Değiştir ile yeni aralığı seçin. Ardından sağ tık → Yenile.",
      },
      {
        question: "Pivot'ta hesaplanmış alan nasıl eklenir?",
        answer:
          "PivotTable içindeyken Analiz sekmesi → Alanlar, Öğeler ve Kümeler → Hesaplanmış Alan. Adını yazın, formülü girin (ör. =Ciro/Adet → 'Birim Fiyat'). Mevcut alanlar arasında matematiksel işlem yapmak için idealdir.",
      },
    ],
    content: [
      {
        type: "snippet",
        question: "Pivot Table nasıl yapılır? (Kısa cevap)",
        answer:
          "Verinizi Tablo'ya çevirin (Ctrl+T), sonra Ekle → PivotTable. Açılan panelde Satır, Sütun, Değer bölgelerine alanları sürükleyin. Dilimleyici ile etkileşimli filtreleme ekleyin. İşte bu kadar — veri hazırsa Pivot 30 saniyede hazırlanır.",
      },
      {
        type: "callout",
        variant: "info",
        title: "Öğreneceğiniz kısayol",
        text:
          "Bu rehberin sonunda ücretsiz bir örnek Excel dosyası var — açıp denemek için hazır veri, Pivot ve dilimleyici içeriyor.",
      },
      {
        type: "p",
        text:
          "PivotTable (Türkçe'de 'özet tablo'), Excel'in en güçlü veri analizi aracıdır. Binlerce satırlık ham veriden saniyeler içinde anlamlı özet çıkarır. Kullanıcı sürükle-bırakla raporu yeniden düzenleyebilir — aynı veri, farklı sorulara farklı cevaplar verebilir.",
      },

      { type: "h3", text: "Ön hazırlık: Verinizi Tablo (Ctrl+T) yapın" },
      {
        type: "p",
        text:
          "Pivot kurmadan önce verinizin düzenli olduğundan emin olun. Altın kural: her sütun tek bir değişken, ilk satır başlık, birleşik hücre yok, boş sütun/satır yok. En iyi uygulama: verinizi seçip Ctrl+T ile Tablo'ya dönüştürün. Böylece:",
      },
      {
        type: "ul",
        items: [
          "Yeni satır eklediğinizde Pivot otomatik genişler — kaynak aralığı elle güncellemeniz gerekmez.",
          "Sütun başlıkları otomatik filtrelenir.",
          "Formüllerde $A$2:$A$100 yerine Tablo1[Ciro] gibi okunaklı referanslar kullanırsınız.",
        ],
      },
      {
        type: "table",
        caption: "Örnek veri yapısı (hayali satış verisi)",
        headers: ["Tarih", "Departman", "Ürün", "Bölge", "Adet", "Ciro"],
        rows: [
          ["2026-01-05", "Satış", "A-100", "İstanbul", "12", "36.000"],
          ["2026-01-08", "Pazarlama", "A-200", "Ankara", "8", "24.000"],
          ["2026-01-12", "Satış", "A-100", "İzmir", "15", "45.000"],
          ["...", "...", "...", "...", "...", "..."],
        ],
      },

      { type: "h3", text: "5 Adımda İlk Pivot Table" },
      {
        type: "diagram",
        variant: "excel-pivot-fields",
      },
      {
        type: "ul",
        items: [
          "1) Verinizin herhangi bir hücresine tıklayın.",
          "2) Ekle sekmesi → PivotTable. Aralık otomatik seçilir; onaylayın.",
          "3) 'Yeni Çalışma Sayfası' seçin → Tamam. Sağda PivotTable Alanları paneli açılır.",
          "4) Alanları sürükleyin: Satırlar = Departman, Sütunlar = Ürün, Değerler = Ciro (otomatik TOPLA).",
          "5) Değerler alanında ciro 'TOPLA' olarak görünmüyorsa: değere sağ tık → Değer Alanı Ayarları → TOPLA.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Alan panelindeki 4 bölge",
        text:
          "Filtreler (tüm rapor için ön filtre), Sütunlar (çapraz yayılacak kategori), Satırlar (dikey gruplama), Değerler (toplanan/sayılan sayısal alan). Bir alanı yanlış bölgeye koyduğunuzda sürükleyerek taşıyın — canlı güncellenir.",
      },

      { type: "h3", text: "Sayıları yüzde veya farkla gösterme" },
      {
        type: "p",
        text:
          "Değerler bölgesindeki sayıya sağ tık → 'Değerleri Farklı Göster': Genel Toplamın Yüzdesi, Üst Satırın Yüzdesi, Önceki Dönemden Fark, Çalışan Toplam gibi hazır seçenekler bulursunuz. 'Bu ürünün toplam ciro içindeki payı' türü sorular için saniyeler içinde hazır olur.",
      },
      {
        type: "table",
        caption: "Değer gösterim modları — yaygın kullanımlar",
        headers: ["Senaryo", "Kullanılacak ayar"],
        rows: [
          ["Ürünlerin toplam içindeki payı", "Genel Toplamın Yüzdesi"],
          ["Aylar arası büyüme", "Önceki Dönemden Fark (veya % Fark)"],
          ["Yıl başından itibaren kümülatif", "Çalışan Toplam"],
          ["Bölge bazında sıralama numarası", "En Büyükten En Küçüğe Sıralamak"],
        ],
      },

      { type: "h3", text: "Dilimleyici (Slicer) ve Zaman Çizelgesi" },
      {
        type: "diagram",
        variant: "excel-slicer-timeline",
      },
      {
        type: "p",
        text:
          "PivotTable'a tıklayın → Analiz sekmesi → Dilimleyici Ekle. İstediğiniz alanları (Departman, Bölge, Ürün) tek tek dilimleyici olarak ekleyin. Tarih alanı için Zaman Çizelgesi Ekle — kaydırıcıyla Ocak-Mart, Q2 veya tüm yıl filtreleyin.",
      },
      {
        type: "ul",
        items: [
          "Bir dilimleyiciyi birden fazla Pivot'a bağlamak: dilimleyiciye sağ tık → Rapor Bağlantıları → hedef Pivot'ları seçin. Aynı kaynaktan gelen tüm raporları tek buton ile filtrelersiniz.",
          "Dilimleyici butonlarını simge gibi küçültmek için: sağ tık → Boyut ve Özellikler → 'düğme yükseklik' ve 'düğme sayısı sütun'.",
        ],
      },

      { type: "h3", text: "Yaygın hatalar ve çözümleri" },
      {
        type: "table",
        caption: "Pivot Table — hızlı sorun giderme",
        headers: ["Sorun", "Çözüm"],
        rows: [
          ["Yeni veri eklendi ama Pivot güncellenmiyor", "Kaynağı Tablo (Ctrl+T) yapın veya Analiz → Verileri Yenile."],
          ["'Değerler' altındaki sayı TOPLA değil SAY olarak görünüyor", "Boş hücre veya metin var. Veriyi temizleyin; değerlerin tümünü sayı yapın."],
          ["Başlık satırı Pivot'ta boş", "Ham veride başlık satırının ilk hücresi boş. İlk satıra mutlaka başlık yazın."],
          ["Pivot dilimleyicileri birlikte çalışmıyor", "Dilimleyicinin Rapor Bağlantıları'ndan tüm Pivot'ları işaretleyin."],
          ["Tarihler gruplanamıyor (Yıl/Ay)", "Tarih sütununun format'ı 'Tarih' olmalı. Veri sekmesi → Metni Sütunlara ile dönüştürün."],
        ],
      },

      { type: "h3", text: "Örnek dosyayı indirin" },
      {
        type: "download",
        title: "Excel Pivot Table örnek dosyası",
        description:
          "3 sayfa: 'Veri' (hayali satış verisi — 30 satır), 'Pivot' (hazır örnek pivot + 2 dilimleyici) ve 'Feragat'. Açıp alanları sürükleyerek deneyin.",
        href: "/downloads/pivot-ornegi.xlsx",
        fileName: "pivot-ornegi.xlsx",
        buttonLabel: "Örnek dosyayı indir (.xlsx)",
      },

      { type: "h3", text: "Sonraki adım: Pivot'u Dashboard'a dönüştürün" },
      {
        type: "p",
        text:
          "Tek bir PivotTable güçlüdür ama asıl verim birden fazla Pivot'u tek ekranda gördüğünüzde ortaya çıkar — buna dashboard denir. Dashboard'ta tüm Pivot'lar ortak dilimleyicilere bağlıdır; tek tıklama tüm raporları günceller.",
      },

      excelClusterLinks(PIVOT_SLUG),
    ],
  },

  /* ============================================================
   *  DASHBOARD HUB
   * ============================================================ */
  {
    slug: DASHBOARD_SLUG,
    title:
      "Excel Dashboard Nasıl Hazırlanır? — Basit Finans Dashboard Örneği + Ücretsiz Şablon",
    description:
      "Excel'de sıfırdan dashboard hazırlama: layout planı, KPI kartları, Pivot + dilimleyici entegrasyonu, grafik seçimi. Ücretsiz şablonla adım adım anlatım.",
    date: "2026-04-19",
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
    keywords: [
      "excel dashboard",
      "dashboard hazırlama",
      "excel dashboard örneği",
      "excel dashboard şablon",
      "kpi dashboard excel",
      "excel rapor dashboard",
      "excel yönetim raporu",
      "dashboard nedir",
      "finans dashboard excel",
    ],
    faqs: [
      {
        question: "Excel dashboard nedir?",
        answer:
          "Dashboard, kritik KPI'ları, trendleri ve dağılımları tek ekranda özetleyen görsel rapordur. Excel'de genellikle Pivot + grafik + dilimleyici + KPI kartları kombinasyonundan oluşur; kullanıcı tek tıkla filtreleyip tüm görüntüyü değiştirebilir.",
      },
      {
        question: "Dashboard için hangi grafikleri seçmeliyim?",
        answer:
          "Zaman serisi → çizgi. Karşılaştırma → sütun/çubuk. Bütün içindeki pay → pasta yerine 'yığılmış sütun' veya '100% yığılmış sütun' daha okunaklıdır. Değişim/akış → waterfall (şelale). Kritik kural: bir grafikte 5-7'den fazla seri varsa okumak zorlaşır — gruplayın.",
      },
      {
        question: "Dashboard'da sayıları nasıl vurgulamalıyım?",
        answer:
          "Büyük KPI kartları kullanın: 32-48 pt font, başlık küçük, sayı büyük. Renk şifrelemesi: yeşil = hedefin üstünde, kırmızı = altında, gri = hedef seti yok. İkincil satırda 'vs geçen dönem (+%3.2)' gibi bağlam ekleyin — tek başına sayı konuşmaz.",
      },
      {
        question: "Dilimleyici ile tüm dashboard'ı nasıl filtrelerim?",
        answer:
          "Tüm Pivot'lar aynı veri kaynağından üretilmelidir. Sonra dilimleyiciye sağ tık → Rapor Bağlantıları → tüm Pivot'ları işaretleyin. Artık dilimleyici tek tıklamayla tüm Pivot'ları (ve onlara bağlı grafikleri) eş zamanlı filtreler.",
      },
      {
        question: "Dashboard'ım açılışta yavaş açılıyor, ne yapmalıyım?",
        answer:
          "Yaygın sebepler: (1) Çok fazla koşullu biçimlendirme kuralı — birleştirin. (2) Volatil formüller (BUGÜN, İNDİS...) — mümkün olduğunca azaltın. (3) Çok sayıda resim/grafik — PNG yerine SVG tercih edin. (4) Kaynak veri 100K+ satır — Power Query ile sadece gereken dönemi çekin.",
      },
    ],
    content: [
      {
        type: "snippet",
        question: "Dashboard nasıl hazırlanır? (Kısa cevap)",
        answer:
          "Önce soru seti belirleyin ('kullanıcı ne görmek istiyor?'). Veriyi Tablo'ya çevirin. Her KPI için ayrı bir Pivot kurun. Tüm Pivot'ları tek ekrana taşıyın, dilimleyicileri tüm Pivot'lara bağlayın. KPI kartlarını büyük font + renk ile vurgulayın. Grafik sayısı 4-6 ile sınırlı kalsın.",
      },
      {
        type: "callout",
        variant: "info",
        title: "Örnek dosya var",
        text:
          "Yazının sonunda ücretsiz indirilebilir Excel dashboard şablonu mevcut — KPI kartları, 3 Pivot ve 2 dilimleyici hazır geliyor. Kendi verinizle denemek için ideal.",
      },
      {
        type: "p",
        text:
          "Dashboard, yönetim kurulu toplantısında ya da sabah kahvesinde açılan Excel dosyasının en kritik sayfasıdır. İyi bir dashboard, 10 saniyede 'bu hafta iyi mi kötü mü?' sorusuna cevap verir; kötü bir dashboard kullanıcıyı daha çok soruyla bırakır. Aradaki fark tasarım ve etkileşim tasarımıdır.",
      },

      { type: "h3", text: "Adım 1: Soru setini belirleyin" },
      {
        type: "p",
        text:
          "Dashboard hazırlamaya Excel'de değil, bir boş kağıtta başlayın. Kullanıcının cevabını aradığı 3-5 temel soruyu listeleyin. Örneğin bir finans dashboard'ı için:",
      },
      {
        type: "ul",
        items: [
          "Bu ay toplam ciro / kâr geçen aya göre nasıl?",
          "En çok satan 3 ürün / en yavaş 3 ürün hangisi?",
          "Hangi bölge ne kadar katkı sağlıyor?",
          "Geçen yıl aynı ayla fark nasıl?",
          "Yıllık hedefe göre % gerçekleşme nedir?",
        ],
      },
      {
        type: "callout",
        variant: "warning",
        title: "Yaygın hata",
        text:
          "Mevcut veride ne varsa hepsini dashboard'a koymak. Dashboard = özet. Kullanıcının 'nice to know' değil 'need to know' bilgisi görmeli. Ayrıntılar için ayrı bir 'Detay' sayfası yapın.",
      },

      { type: "h3", text: "Adım 2: Layout planı" },
      {
        type: "diagram",
        variant: "excel-dashboard-layout",
      },
      {
        type: "ul",
        items: [
          "Üst şerit: 4-6 KPI kartı — en kritik sayılar. (Toplam Ciro, Kâr Marjı, Hedef %, vs.)",
          "Sol blok: zaman trendi (çizgi grafik) — 'şu an ne durumdayız?'",
          "Sağ blok: kategorik kırılım (yığılmış sütun veya bar) — 'hangi segment?'",
          "Alt şerit: dilimleyiciler ve zaman çizelgesi — kullanıcının etkileşim alanı.",
          "Sağ üst köşe: veri güncellenme tarihi ve filtrenin durum yazısı.",
        ],
      },

      { type: "h3", text: "Adım 3: KPI kartı tasarımı" },
      {
        type: "p",
        text:
          "KPI kartı bir hücre değil, bir 'grup'tur. Önerilen bileşenler:",
      },
      {
        type: "ul",
        items: [
          "Başlık (10-12 pt, gri) — 'Toplam Ciro'",
          "Ana sayı (28-36 pt, kalın) — '₺ 1.240.000'",
          "Karşılaştırma (10-11 pt, yeşil/kırmızı) — '▲ %3.2 geçen aya göre'",
          "Mini sparkline (isteğe bağlı) — son 12 ayın trendini gösteren çizgi",
          "Hedef oku (isteğe bağlı) — %87 hedefe ulaşıldı gibi",
        ],
      },
      {
        type: "table",
        caption: "KPI kartı formül örnekleri",
        headers: ["Bileşen", "Formül / Yöntem"],
        rows: [
          ["Ana sayı (bu ay)", "=SUMIFS(Tablo1[Ciro]; Tablo1[Ay]; AY(BUGÜN()))"],
          ["Geçen ay karşılaştırma", "=(BuAy − GecenAy)/GecenAy"],
          ["Renk kodlama", "Koşullu biçimlendirme: >%0 yeşil, <%0 kırmızı"],
          ["Sparkline", "Ekle → Mini Grafikler → Çizgi"],
          ["Hedef oku", "Koşullu simge kümeleri (▲▼) + koşullu biçimlendirme"],
        ],
      },

      { type: "h3", text: "Adım 4: Pivot'ları kurun ve dilimleyici ile bağlayın" },
      {
        type: "p",
        text:
          "Her görsel için ayrı bir Pivot kurun (ciro trendi, bölge dağılımı, ürün top-5, vs). Hepsi aynı veri kaynağından olsun. Ardından dilimleyicileri tek Pivot'ta oluşturup → dilimleyiciye sağ tık → Rapor Bağlantıları → tüm Pivot'ları işaretleyin. Artık dilimleyici tek tıkla tüm dashboard'ı filtreliyor.",
      },
      {
        type: "callout",
        variant: "info",
        title: "Profesyonel görünüm ipucu",
        text:
          "Pivot'ları dashboard görüntüsünde gizlemek için: PivotTable Araçları → Tasarım → 'Satır/Sütun Başlıkları' açık; ama çevre hücreleri beyaz yapın, +/− butonlarını gizleyin (Analiz → +/− Butonları). Dashboard profesyonel görünür.",
      },

      { type: "h3", text: "Adım 5: Grafik seçimi rehberi" },
      {
        type: "table",
        caption: "Hangi grafik ne zaman?",
        headers: ["Analiz amacı", "Uygun grafik", "Kaçınılacak"],
        rows: [
          ["Zaman içindeki değişim", "Çizgi grafik", "3B pasta"],
          ["Kategori karşılaştırma (≤7 öge)", "Sütun / Çubuk", "Pasta (>5 dilimde karışır)"],
          ["Bütün içindeki pay (2-3 kategori)", "Yığılmış sütun veya donut", "3B pasta"],
          ["İki değişken ilişkisi", "Dağılım (scatter)", "—"],
          ["Nakit akışı / değişim bileşenleri", "Waterfall (şelale)", "Çizgi grafik"],
          ["Stok / bant (min-max)", "Hata çubuklu sütun", "Pasta"],
        ],
      },

      { type: "h3", text: "Yaygın dashboard hataları" },
      {
        type: "ul",
        items: [
          "Çok fazla renk — dashboard'ınızda 3-4 renkten fazla kullanmayın. Kurumsal paletin 2 rengi + gri tonu yeterlidir.",
          "Başlıksız grafikler — her grafiğin açıklayıcı bir başlığı olmalı: 'Aylık Ciro (₺, 2026)'. Sadece 'Grafik 1' kabul edilemez.",
          "3B efektler — okunurluğu bozar, yanlış oranlar algılatır.",
          "Ondalık taşkınlığı — '1.234.567,89 ₺' yerine '1,23 M ₺' veya '1.235 bin ₺' tercih edin.",
          "Dilimleyici olmadan statik rapor — etkileşim olmazsa dashboard değil, düz resim olur.",
        ],
      },

      { type: "h3", text: "Örnek şablonu indirin" },
      {
        type: "download",
        title: "Excel Dashboard şablonu",
        description:
          "Hazır KPI kartları, 3 Pivot, 2 dilimleyici içeren örnek şablon. 'Veri' sayfasını kendi verinizle değiştirin — dashboard otomatik güncellenir.",
        href: "/downloads/dashboard-ornegi.xlsx",
        fileName: "dashboard-ornegi.xlsx",
        buttonLabel: "Şablonu indir (.xlsx)",
      },

      { type: "h3", text: "Sonraki adım: Power Query ile veriyi otomatikleştirin" },
      {
        type: "p",
        text:
          "Dashboard'ınızı her ay elden güncellemek can sıkıcı. Power Query ile ham veriyi otomatik çekin ve dönüştürün — tek tıkla 'Yenile' dediğinizde tüm dashboard güncellensin. Serinin bir sonraki yazısında bu konuya geçeceğiz.",
      },

      excelClusterLinks(DASHBOARD_SLUG),
    ],
  },
];
