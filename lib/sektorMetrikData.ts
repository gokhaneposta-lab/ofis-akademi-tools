export type MetricCategory =
  | "teknik-sigortacilik"
  | "ifrs-metrikleri"
  | "finansal-oranlar"
  | "operasyonel";

export const metricCategoryLabels: Record<MetricCategory, string> = {
  "teknik-sigortacilik": "Teknik Sigortacılık (UW)",
  "ifrs-metrikleri": "IFRS Metrikleri (TFRS 17)",
  "finansal-oranlar": "Finansal Oranlar",
  operasyonel: "Operasyonel Metrikler",
};

/** Hub sayfasında kategori sırasını sabitler (insertion order'a güvenmemek için). */
export const metricCategoryOrder: MetricCategory[] = [
  "teknik-sigortacilik",
  "ifrs-metrikleri",
  "finansal-oranlar",
  "operasyonel",
];

export type MetricParam = { name: string; description: string };

export type MetricExample = {
  title: string;
  data: Record<string, string | number>;
  result: string;
  explanation: string;
};

export type ExcelTip = {
  title: string;
  formula: string;
  description: string;
};

export type MetricDef = {
  slug: string;
  name: string;
  nameEn: string;
  category: MetricCategory;
  icon: string;
  summary: string;
  whatIs: string;
  whyImportant: string;
  formulas: { label: string; formula: string; explanation: string }[];
  steps: string[];
  examples: MetricExample[];
  excelTips: ExcelTip[];
  interpretation: { range: string; meaning: string }[];
  tips: string[];
  relatedSlugs: string[];
  /** Which calculator component to render */
  calculatorType: string;
};

export const metrics: MetricDef[] = [
  /* ═══════════════════════════════════════════
     1. HASAR / PRİM ORANI (LOSS RATIO)
     ═══════════════════════════════════════════ */
  {
    slug: "hasar-prim-orani",
    name: "Hasar / Prim Oranı (H/P)",
    nameEn: "Loss Ratio",
    category: "teknik-sigortacilik",
    icon: "📊",
    summary:
      "Sigorta şirketinin topladığı primin ne kadarını hasar ödemelerine harcadığını gösterir. Brüt ve Net olmak üzere iki versiyonu vardır — fark reasürans payındadır.",
    whatIs: `Hasar/Prim oranı (Loss Ratio), sigorta şirketinin belirli bir dönemde ödediği hasarların topladığı primlere oranıdır. Sigortacılığın en temel performans göstergesidir.

İki versiyonu vardır:

**Brüt H/P Oranı:** Reasürans düşülmeden önceki toplam hasar ve prim üzerinden hesaplanır. Şirketin tüm portföyünün teknik performansını gösterir.

**Net H/P Oranı:** Reasürans payı düşüldükten sonra kalan (yani şirketin kendi cebinden çıkacak) hasarın, şirkette kalan (net) prime oranıdır. Şirketin gerçek maruz kaldığı riski ve kendi kârlılığını gösterir.`,
    whyImportant: `Bir sigorta şirketinin sağlıklı çalışıp çalışmadığını anlamanın en hızlı yolu H/P oranına bakmaktır.

- **Brüt H/P** yüksek ama **Net H/P** düşükse: Reasürans anlaşması şirketi koruyor demektir.
- **Her ikisi de yüksekse:** Portföyde ciddi bir sorun var — ya fiyatlama yetersiz ya da hasar frekansı/severity beklenenden yüksek.
- **Net H/P düşük, Brüt H/P de düşükse:** Şirket teknik olarak kârlı.

Yönetim kurulu raporlarında, aktüeryal analizlerde ve regülatöre sunulan raporlarda mutlaka yer alır.`,
    formulas: [
      {
        label: "Brüt H/P Oranı",
        formula: "Brüt Hasar / Prim Oranı = (Toplam Ödenen Hasar + Muallak Hasar Değişimi) / Brüt Yazılan Prim × 100",
        explanation:
          "Reasürans payı düşülmeden önceki tüm hasarların tüm primlere oranı.",
      },
      {
        label: "Net H/P Oranı",
        formula: "Net Hasar / Prim Oranı = (Toplam Hasar − Reasürans Hasar Payı) / (Brüt Prim − Reasürans Prim Payı) × 100",
        explanation:
          "Reasürör payı çıkarıldıktan sonra şirketin kendi üzerinde kalan hasarın kendi primlerine oranı.",
      },
    ],
    steps: [
      "Dönem için toplam Brüt Yazılan Primi belirleyin.",
      "Aynı dönemdeki toplam Ödenen Hasar tutarını belirleyin (muallak hasar değişimi dahil).",
      "Brüt H/P = Toplam Hasar / Brüt Prim × 100 hesaplayın.",
      "Reasürans Prim Payını brüt primden düşerek Net Primi bulun.",
      "Reasürans Hasar Payını toplam hasardan düşerek Net Hasarı bulun.",
      "Net H/P = Net Hasar / Net Prim × 100 hesaplayın.",
      "İki oranı karşılaştırarak reasürans anlaşmasının etkinliğini değerlendirin.",
    ],
    examples: [
      {
        title: "Kasko Portföyü — Aylık Analiz",
        data: {
          "Brüt Yazılan Prim": "10.000.000 ₺",
          "Toplam Hasar": "7.500.000 ₺",
          "Reasürans Prim Payı": "2.000.000 ₺",
          "Reasürans Hasar Payı": "3.000.000 ₺",
        },
        result: "Brüt H/P = %75 | Net H/P = %56,25",
        explanation:
          "Brüt bakışta her 100 ₺ primin 75 ₺'si hasara gidiyor. Ancak reasürans sonrası şirketin kendi cebinden çıkan oran %56,25 — reasürans anlaşması şirketi önemli ölçüde koruyor.",
      },
      {
        title: "Yangın Branşı — Kötü Senaryo",
        data: {
          "Brüt Yazılan Prim": "5.000.000 ₺",
          "Toplam Hasar": "6.000.000 ₺",
          "Reasürans Prim Payı": "1.500.000 ₺",
          "Reasürans Hasar Payı": "4.500.000 ₺",
        },
        result: "Brüt H/P = %120 | Net H/P = %42,86",
        explanation:
          "Brüt bakışta zarar var (%120 > %100). Ancak reasürans büyük hasarları karşıladığı için net olarak şirket hâlâ kârlı. Bu, reasürans anlaşmasının ne kadar kritik olduğunu gösterir.",
      },
    ],
    excelTips: [
      {
        title: "Temel H/P hesaplama",
        formula: "=B2/A2*100",
        description:
          "A2 = Prim, B2 = Hasar. Sonucu yüzde formatında göstermek için hücreyi % biçiminde biçimlendirin veya 100 ile çarpın.",
      },
      {
        title: "Net H/P tek formülde",
        formula: "=(B2-D2)/(A2-C2)*100",
        description:
          "A2 = Brüt Prim, B2 = Brüt Hasar, C2 = Reasürans Prim Payı, D2 = Reasürans Hasar Payı.",
      },
      {
        title: "Branş bazlı H/P (ÇOKETOPLA ile)",
        formula: "=ÇOKETOPLA(Hasar;Branş;\"Kasko\")/ÇOKETOPLA(Prim;Branş;\"Kasko\")*100",
        description:
          "Belirli bir branş için toplam hasar / toplam prim oranını hesaplar.",
      },
      {
        title: "Koşullu biçimlendirme ile alarm",
        formula: "Koşullu biçimlendirme → %80 üzeri kırmızı, %60-80 sarı, %60 altı yeşil",
        description:
          "H/P oranı hücrelerine renk skalası uygulayarak riskli branşları anında görün.",
      },
    ],
    interpretation: [
      { range: "%0 – %50", meaning: "Çok iyi — teknik olarak kârlı, fiyatlama yeterli." },
      { range: "%50 – %70", meaning: "Sağlıklı — sektör ortalamasında." },
      { range: "%70 – %85", meaning: "Dikkat — masraf oranı eklenince kombine oran %100'ü geçebilir." },
      { range: "%85 – %100", meaning: "Riskli — teknik kâr marjı çok dar." },
      { range: "%100+", meaning: "Zarar — topladığından fazlasını hasar olarak ödüyor." },
    ],
    tips: [
      "Brüt ve Net H/P'yi her zaman yan yana değerlendirin — tek başına biri yanıltıcı olabilir.",
      "Muallak hasar değişimini dahil etmeyi unutmayın, yoksa oran gerçeği yansıtmaz.",
      "Aylık takip yapın ancak yorum için en az çeyreklik trende bakın — tek bir büyük hasar oranı geçici olarak şişirebilir.",
      "Branş bazlı kırılım mutlaka yapılmalı — portföy geneli iyi görünürken tek bir branş zarar ediyor olabilir.",
    ],
    relatedSlugs: ["kazanilmis-prim", "yenileme-orani", "kayip-orani", "birlesik-oran", "muallak-hasar-karsiligi"],
    calculatorType: "hasar-prim",
  },

  /* ═══════════════════════════════════════════
     2. KAZANILMIŞ PRİM HESAPLAMA
     ═══════════════════════════════════════════ */
  {
    slug: "kazanilmis-prim",
    name: "Kazanılmış Prim Hesaplama",
    nameEn: "Earned Premium",
    category: "teknik-sigortacilik",
    icon: "📅",
    summary:
      "365 günlük bir poliçenin priminin, poliçenin yaşadığı (geçen) gün sayısına oranlanarak o dönemde kazanılan kısmını hesaplar. Muhasebenin dönemsellik ilkesinin sigortacılıktaki temelidir.",
    whatIs: `Kazanılmış prim, bir sigorta poliçesinin priminin zaman içinde "kazanılan" kısmıdır. Sigorta şirketi poliçe primi tahsil ettiğinde tüm tutarı gelir yazamaz — çünkü risk henüz tamamen taşınmamıştır.

**Örnek:** 1 Mart'ta 365 günlük, 3.650 ₺ primli bir poliçe yazıldı. 31 Mart itibarıyla 31 gün geçti. Kazanılmış prim = 3.650 × (31/365) = 310 ₺. Kalan 3.340 ₺ "kazanılmamış prim karşılığı" olarak bilançoda tutulur.

Bu hesaplama, muhasebenin **dönemsellik ilkesi** gereği zorunludur: gelir, riskin taşındığı döneme ait olmalıdır.`,
    whyImportant: `Kazanılmış prim hesaplaması sigortacılıkta kritiktir çünkü:

- **Finansal raporlama:** Gelir tablosunda "kazanılmış prim" gelir olarak gösterilir, kazanılmamış kısım bilançoda karşılık olarak tutulur.
- **H/P oranı hesabı:** Doğru loss ratio hesaplamak için hasarları kazanılmış prime (yazılan prime değil) bölmek gerekir.
- **Regülatör zorunluluk:** SEDDK düzenlemeleri gereği sigorta şirketleri kazanılmamış prim karşılığı ayırmak zorundadır.
- **Nakit akış planlaması:** Tahsil edilen primin ne kadarı "kazanılmış" (harcanabilir) bilmek finansal planlama için önemlidir.`,
    formulas: [
      {
        label: "Tek Poliçe — Gün Bazlı",
        formula: "Kazanılmış Prim = Toplam Prim × (Geçen Gün Sayısı / Toplam Poliçe Vadesi)",
        explanation:
          "En temel hesaplama: primin yaşanan güne oranı. 365 gün vadeli poliçede 100 gün geçmişse primin 100/365'i kazanılmıştır.",
      },
      {
        label: "Kazanılmamış Prim (kalan)",
        formula: "Kazanılmamış Prim = Toplam Prim − Kazanılmış Prim",
        explanation: "Bilançoda karşılık olarak ayrılacak tutar.",
      },
      {
        label: "Portföy Bazlı — Dönem Toplamı",
        formula: "Dönem Kazanılmış Primi = Σ (Her poliçe primi × O poliçenin dönemde yaşadığı gün / Poliçe vadesi)",
        explanation:
          "Tüm portföy için dönem bazlı kazanılmış prim hesabı. Excel'de her poliçe satırı için ayrı hesaplanıp toplanır.",
      },
    ],
    steps: [
      "Poliçenin başlangıç tarihini, bitiş tarihini ve toplam primini belirleyin.",
      "Poliçe vadesini gün cinsinden hesaplayın: Bitiş − Başlangıç (genellikle 365 gün).",
      "Hesaplama tarihini belirleyin (ay sonu, çeyrek sonu vb.).",
      "Geçen gün sayısını hesaplayın: Hesaplama Tarihi − Başlangıç Tarihi.",
      "Eğer hesaplama tarihi > bitiş tarihi ise geçen gün = toplam vade (poliçe süresi bitmiş, tüm prim kazanılmış).",
      "Kazanılmış Prim = Toplam Prim × (Geçen Gün / Toplam Vade).",
      "Kazanılmamış Prim = Toplam Prim − Kazanılmış Prim.",
    ],
    examples: [
      {
        title: "Standart 1 Yıllık Poliçe — Çeyrek Sonu",
        data: {
          "Poliçe Başlangıç": "01.02.2025",
          "Poliçe Bitiş": "01.02.2026",
          "Toplam Prim": "12.000 ₺",
          "Hesaplama Tarihi": "31.03.2025",
          "Geçen Gün": "58 gün",
        },
        result: "Kazanılmış Prim = 1.906,85 ₺ | Kazanılmamış = 10.093,15 ₺",
        explanation:
          "12.000 × (58/365) = 1.906,85 ₺ kazanılmış. Kalan 10.093,15 ₺ bilançoda kazanılmamış prim karşılığı olarak tutulur.",
      },
      {
        title: "6 Aylık Poliçe — Ay Sonu",
        data: {
          "Poliçe Başlangıç": "15.01.2025",
          "Poliçe Bitiş": "15.07.2025",
          "Toplam Prim": "6.000 ₺",
          "Hesaplama Tarihi": "28.02.2025",
          "Geçen Gün": "44 gün (vade: 181 gün)",
        },
        result: "Kazanılmış Prim = 1.458,56 ₺ | Kazanılmamış = 4.541,44 ₺",
        explanation:
          "6.000 × (44/181) = 1.458,56 ₺. Poliçe 6 aylık olduğu için vade 181 gün üzerinden hesaplanır.",
      },
    ],
    excelTips: [
      {
        title: "Geçen gün hesabı",
        formula: "=MİN(HesaplamaTarihi;BitişTarihi) − BaşlangıçTarihi",
        description:
          "Hesaplama tarihi poliçe bitişini geçtiyse otomatik olarak toplam vadeyi alır.",
      },
      {
        title: "Kazanılmış prim formülü",
        formula: "=Prim * (MİN(D2;C2)-B2) / (C2-B2)",
        description:
          "B2 = Başlangıç, C2 = Bitiş, D2 = Hesaplama Tarihi, E2 = Prim. Tek formülde kazanılmış primi hesaplar.",
      },
      {
        title: "Portföy toplamı",
        formula: "=TOPLA(KazanılmışPrimSütunu)",
        description:
          "Her satırda tek poliçe hesaplanır, sonra toplam alınarak portföy bazlı kazanılmış prim bulunur.",
      },
      {
        title: "Ay bazlı kırılım (PivotTable)",
        formula: "PivotTable → Satır: AY(BaşlangıçTarihi) | Değer: TOPLA(KazanılmışPrim)",
        description:
          "Ay bazlı kazanılmış prim raporunu PivotTable ile kolayca oluşturun.",
      },
    ],
    interpretation: [
      { range: "Kazanılmış Prim ↑", meaning: "Portföy yaşlanıyor, gelir realize oluyor — nakit akış planlamasında olumlu." },
      { range: "Kazanılmamış Prim ↑", meaning: "Yeni iş üretimi güçlü — ancak karşılık ayırmayı unutmayın." },
      { range: "Kazanılmış / Yazılan > %50", meaning: "Portföyün çoğunluğu yılın ilk yarısında yazılmış demektir." },
    ],
    tips: [
      "1/8 yöntemi (sekizde bir) reasürans işlemlerinde kullanılır — doğrudan poliçelerde gün bazlı hesaplama zorunludur.",
      "Excel'de tarih farkı hesaplarken MAKS ve MİN fonksiyonlarıyla sınır kontrolü yapın (negatif gün veya vadesi geçmiş poliçeler).",
      "Portföy büyükse Power Query ile otomatik kazanılmış prim hesaplama tablosu oluşturun.",
      "Dönem sonu raporlarında 'Kazanılmış Prim = Yazılan Prim + Devreden Kazanılmamış Prim (önceki dönem) − Kazanılmamış Prim (bu dönem)' formülü de kullanılabilir.",
    ],
    relatedSlugs: ["hasar-prim-orani", "yenileme-orani", "kayip-orani", "birlesik-oran"],
    calculatorType: "kazanilmis-prim",
  },

  /* ═══════════════════════════════════════════
     3. YENİLEME ORANI (RETENTION RATE)
     ═══════════════════════════════════════════ */
  {
    slug: "yenileme-orani",
    name: "Yenileme Oranı (Retention)",
    nameEn: "Renewal / Retention Rate",
    category: "teknik-sigortacilik",
    icon: "🔄",
    summary:
      "Vadesi biten poliçelerin ne kadarının yenilendiğini ölçer. Müşteri sadakati ve portföy sürdürülebilirliğinin en temel göstergesidir.",
    whatIs: `Yenileme oranı, belirli bir dönemde vadesi biten poliçelerden kaçının yenilenerek devam ettiğini gösteren orandır.

**Formül:** Yenileme Oranı = Yenilenen Poliçe Sayısı / Vadesi Biten Poliçe Sayısı × 100

**Kritik kural:** Vadesi biten ve yenilenen poliçeler **aynı dönem** (genellikle aynı ay) içinde değerlendirilmelidir. Örneğin Mart ayında vadesi biten 100 poliçeden 82'si Mart ayı içinde yenilendiyse yenileme oranı %82'dir.

Adet bazlı veya prim bazlı hesaplanabilir. Adet bazlı müşteri sadakatini, prim bazlı gelir sürdürülebilirliğini gösterir.`,
    whyImportant: `Yenileme oranı doğrudan şirketin geleceğini etkiler:

- **Müşteri kazanım maliyeti:** Yeni müşteri kazanmak, mevcut müşteriyi tutmaktan 5-7 kat daha pahalıdır. Düşük yenileme = yüksek pazarlama maliyeti.
- **Portföy büyümesi:** Yenileme oranı düşükse, portföyün büyümesi için çok daha fazla yeni iş üretmek gerekir.
- **Risk kalitesi:** Yenilenen poliçeler genellikle hasarsız/düşük hasarlı müşterilerden gelir — portföy kalitesini artırır.
- **Acente/şube performansı:** Yenileme oranı, acente veya şube bazında takip edilerek performans değerlendirmesinde kullanılır.`,
    formulas: [
      {
        label: "Adet Bazlı Yenileme Oranı",
        formula: "Yenileme Oranı (%) = (Yenilenen Poliçe Sayısı / Vadesi Biten Poliçe Sayısı) × 100",
        explanation:
          "Aynı ay içinde vadesi bitip yenilenen poliçe adedinin, vadesi biten toplam poliçe adedine oranı.",
      },
      {
        label: "Prim Bazlı Yenileme Oranı",
        formula: "Prim Bazlı Yenileme (%) = (Yenilenen Poliçelerin Prim Toplamı / Vadesi Biten Poliçelerin Prim Toplamı) × 100",
        explanation:
          "Tutar bazlı bakış — büyük primli poliçelerin yenilenmesi daha fazla ağırlık taşır.",
      },
    ],
    steps: [
      "Analiz dönemini belirleyin (genellikle ay bazlı).",
      "O ay vadesi biten poliçeleri filtreleyin.",
      "Bu poliçelerden hangilerinin aynı ay içinde yenilendiğini tespit edin.",
      "Adet bazlı: Yenilenen / Vadesi Biten × 100 hesaplayın.",
      "Prim bazlı: Yenilenen primlerin toplamı / Vadesi biten primlerin toplamı × 100.",
      "Branş, acente veya bölge bazlı kırılımları yaparak detaya inin.",
    ],
    examples: [
      {
        title: "Mart 2025 — Kasko Portföyü",
        data: {
          "Vadesi Biten Poliçe": "450 adet",
          "Yenilenen Poliçe": "369 adet",
          "Vadesi Biten Toplam Prim": "2.250.000 ₺",
          "Yenilenen Toplam Prim": "2.100.000 ₺",
        },
        result: "Adet Bazlı = %82 | Prim Bazlı = %93,3",
        explanation:
          "Adet olarak %82 yenileme var. Prim bazlı %93,3 olması, büyük primli poliçelerin daha yüksek oranda yenilendiğini gösteriyor — iyi bir işaret.",
      },
      {
        title: "Şubat 2025 — Sağlık Branşı (Zayıf Performans)",
        data: {
          "Vadesi Biten Poliçe": "200 adet",
          "Yenilenen Poliçe": "110 adet",
        },
        result: "Adet Bazlı = %55",
        explanation:
          "Her 2 poliçeden birinin kaybedildiği anlamına gelir. Fiyat artışı, rekabet veya hizmet kalitesi sorgulanmalı.",
      },
    ],
    excelTips: [
      {
        title: "Adet bazlı yenileme",
        formula: "=EĞERSAY(Durum;\"Yenilendi\")/EĞERSAY(Durum;\"<>\")*100",
        description:
          "Durum sütununda 'Yenilendi' olanların tüm poliçelere oranı.",
      },
      {
        title: "Ay bazlı yenileme (ÇOKETOPLA)",
        formula: "=ÇOKEĞERSAY(Durum;\"Yenilendi\";BitişAyı;3)/ÇOKEĞERSAY(BitişAyı;3)*100",
        description:
          "Mart ayında (3) vadesi bitip yenilenenlerin oranı.",
      },
      {
        title: "Acente bazlı kırılım (PivotTable)",
        formula: "PivotTable → Satır: Acente | Sütun: Durum | Değer: SAYI(PoliçeNo)",
        description:
          "Hangi acentenin en iyi yenileme performansına sahip olduğunu anında görün.",
      },
      {
        title: "Trend grafiği",
        formula: "Ay bazlı yenileme oranlarını çizgi grafiğe aktarın",
        description:
          "12 aylık trendi izleyerek mevsimsel etkileri ve genel gidişatı değerlendirin.",
      },
    ],
    interpretation: [
      { range: "%85+", meaning: "Mükemmel — portföy çok sağlıklı, müşteri sadakati yüksek." },
      { range: "%75 – %85", meaning: "İyi — sektör ortalamasında, iyileştirme alanları aranabilir." },
      { range: "%65 – %75", meaning: "Orta — müşteri kaybı belirgin, nedenler araştırılmalı." },
      { range: "%65 altı", meaning: "Kritik — ciddi müşteri kaybı var, acil aksiyon gerekli." },
    ],
    tips: [
      "Adet ve prim bazlı yenileme oranını her zaman birlikte değerlendirin — farklı hikayeler anlatabilirler.",
      "Yenilemeyen müşterilerden 'neden yenilemedi' bilgisi toplamak stratejik değer taşır.",
      "Fiyat artışı sonrası yenileme oranını yakından izleyin — artış oranı ile yenileme düşüşü arasındaki denge kritik.",
      "Branş bazlı kırılım mutlaka yapın — bir branştaki düşüş portföy genelini gizleyebilir.",
    ],
    relatedSlugs: ["hasar-prim-orani", "kazanilmis-prim", "iptal-orani"],
    calculatorType: "yenileme-orani",
  },

  /* ═══════════════════════════════════════════
     FİNANSAL ORANLAR (LİKİDİT & KÂRLILIK & YAPI)
     ═══════════════════════════════════════════ */
  {
    slug: "cari-oran",
    name: "Cari Oran",
    nameEn: "Current Ratio",
    category: "finansal-oranlar",
    icon: "📐",
    summary:
      "Dönen varlıkların kısa vadeli yükümlülüklere oranıdır. Şirketin kısa vadeli borçlarını ödeme gücünü ölçer.",
    whatIs: `Cari oran (Current Ratio), bilançodaki dönen varlıkların kısa vadeli yükümlülüklere bölünmesiyle bulunur.

**Formül:** Cari Oran = Dönen Varlıklar ÷ Kısa Vadeli Yükümlülükler

Sonuç genellikle **oransal** ifade edilir (örn. 1,8 — yani her 1 TL kısa borç için 1,8 TL dönen varlık). Bazı kaynaklarda yüzde olarak da gösterilir; önemli olan kullandığınız tanımı tutarlı tutmanızdır.`,
    whyImportant: `Bankalar, tedarikçiler ve yönetim kurulu likiditeyi izler. Cari oran düşükse nakit sıkışması riski yüksektir; çok yüksekse ise varlıkların verimsiz kullanıldığı (fazla stok, tahsilatta gecikme) şüphesi doğabilir.

Excel’de bilanço satırlarını düzenli güncellerseniz cari oranı otomatik raporlayabilirsiniz.`,
    formulas: [
      {
        label: "Cari oran",
        formula: "Cari Oran = Dönen Varlıklar / Kısa Vadeli Yükümlülükler",
        explanation: "Bilanço tarihi ve konsolidasyon kapsamı net olmalıdır.",
      },
    ],
    steps: [
      "Bilançodan dönen varlıklar toplamını alın.",
      "Aynı bilançodan kısa vadeli yükümlülükler toplamını alın.",
      "Dönen varlıkları kısa vadeli yükümlülüklere bölün.",
      "Yorum için geçmiş çeyrekler ve sektör ortalamasıyla karşılaştırın.",
    ],
    examples: [
      {
        title: "Örnek",
        data: {
          "Dönen Varlıklar": "15.000.000 ₺",
          "Kısa Vadeli Yükümlülük": "7.000.000 ₺",
        },
        result: "Cari oran ≈ 2,14",
        explanation:
          "Her 1 TL kısa vadeli borç için yaklaşık 2,14 TL dönen varlık var — kısa vadeli likidite genelde yeterli kabul edilir; sektör normuna bakılmalıdır.",
      },
    ],
    excelTips: [
      {
        title: "Tek hücre",
        formula: "=Bilanco!B10/Bilanco!B25",
        description: "B10 dönen varlıklar, B25 kısa vadeli yükümlülük (örnek).",
      },
      {
        title: "Koşullu biçimlendirme",
        formula: "=EĞER(CariOran<1;\"Dikkat\";\"İzle\")",
        description: "1’in altına düşen hücreleri kırmızıya boyayın.",
      },
    ],
    interpretation: [
      { range: "< 1", meaning: "Kısa vadeli ödeme riski yüksek — acil nakit veya bilanço incelemesi." },
      { range: "1 – 1,5", meaning: "Sınırda; sektöre ve tahsilat döngüsüne göre değerlendirin." },
      { range: "1,5 – 2,5", meaning: "Yaygın olarak kabul edilen sağlıklı bant." },
      { range: "> 2,5–3", meaning: "Likidite iyi olabilir; varlık verimliliği ve işletme sermayesi detayı istenebilir." },
    ],
    tips: [
      "Dönen varlıklar içinde nakite çevrilmesi zor kalemler (şüpheli alacaklar vb.) için ayrı notlar kullanın.",
      "Kısa vadeli borç içinde vadesi yaklaşan uzun vadeli kısımları unutmayın.",
    ],
    relatedSlugs: ["nakit-oran", "asit-test-orani"],
    calculatorType: "cari-oran",
  },
  {
    slug: "nakit-oran",
    name: "Nakit Oranı",
    nameEn: "Cash Ratio",
    category: "finansal-oranlar",
    icon: "💵",
    summary:
      "Nakit ve nakit benzerlerinin kısa vadeli yükümlülüklere oranıdır; en katı likidite ölçüsüdür.",
    whatIs: `Nakit oranı, stok ve alacaklar gibi kalemleri **dışarıda bırakarak** sadece nakit ve nakit benzeri varlıkların kısa vadeli yükümlülüklere oranını ölçer.

**Formül:** Nakit Oranı = (Nakit + Nakit Benzerleri) / Kısa Vadeli Yükümlülükler`,
    whyImportant: `Cari orandan daha muhafazakâr bir resim verir. Kriz senaryolarında “elimizde gerçekten nakit ne kadar?” sorusuna yaklaşır.`,
    formulas: [
      {
        label: "Nakit oranı",
        formula: "Nakit Oranı = (Nakit + Nakit Benzerleri) / Kısa Vadeli Yükümlülükler",
        explanation: "Nakit benzerleri: vadesi kısa, likit enstrümanlar (tanıma göre değişir).",
      },
    ],
    steps: [
      "Bilançodan nakit kalemini ve nakit benzerlerini toplayın.",
      "Kısa vadeli yükümlülükleri alın.",
      "Toplam nakdi kısa vadeli yükümlülüğe bölün.",
    ],
    examples: [
      {
        title: "Örnek",
        data: {
          "Nakit + Nakit benzeri": "3.500.000 ₺",
          "Kısa Vadeli Yükümlülük": "7.000.000 ₺",
        },
        result: "Nakit oranı = 0,50",
        explanation: "Kısa borcun yarısı nakit ve benzeri ile karşılanabilir; geri kalanı cari oranla birlikte yorumlanmalıdır.",
      },
    ],
    excelTips: [
      {
        title: "Formül",
        formula: "=(Nakit+NakitBenzeri)/KisaVadeli",
        description: "Excel tablosunda satır referanslarıyla güncel tutun.",
      },
    ],
    interpretation: [
      { range: "< 0,2", meaning: "Çok düşük — kriz likiditesi zayıf olabilir." },
      { range: "0,2 – 0,5", meaning: "Sektöre bağlı; tahsil hızı yüksekse kabul edilebilir." },
      { range: "> 0,5", meaning: "Nakit tamponu güçlü — fırsat maliyeti ve sermaye verimliliği değerlendirin." },
    ],
    tips: ["Cari ve asit-test ile üçlü likidite seti olarak sunun."],
    relatedSlugs: ["cari-oran", "asit-test-orani"],
    calculatorType: "nakit-oran",
  },
  {
    slug: "asit-test-orani",
    name: "Asit-Test Oranı (Hızlı Oran)",
    nameEn: "Quick / Acid-test Ratio",
    category: "finansal-oranlar",
    icon: "⚡",
    summary:
      "Stokları dönen varlıklardan çıkarıp kısa vadeli yükümlülüğe böler; satışa bağlı likiditeyi ölçer.",
    whatIs: `Asit-test oranı, stokların hızlı nakde dönüşümü her zaman garanti olmadığı için stokları hariç tutar.

**Formül:** Asit-Test = (Dönen Varlıklar − Stoklar) / Kısa Vadeli Yükümlülükler`,
    whyImportant: `Perakende veya üretimde stok ağırlığı yüksek şirketlerde cari oran yanıltıcı olabilir; asit-test bu açıdan tamamlayıcıdır.`,
    formulas: [
      {
        label: "Asit-test",
        formula: "Asit-Test Oranı = (Dönen Varlıklar − Stoklar) / Kısa Vadeli Yükümlülükler",
        explanation: "Stok yerine “stoklar” satırı; TFRS kapsamında tanımlara uyun.",
      },
    ],
    steps: ["Dönen varlıklardan stokları düşün.", "Kısa vadeli yükümlülüğe bölün.", "Cari oranla karşılaştırın."],
    examples: [
      {
        title: "Örnek",
        data: {
          "Dönen Varlıklar": "15.000.000 ₺",
          Stoklar: "4.000.000 ₺",
          "Kısa Vadeli Yükümlülük": "7.000.000 ₺",
        },
        result: "Asit-test ≈ 1,57",
        explanation: "Stok hariç hızlı varlıklar kısa borcu yaklaşık 1,57 katı karşılıyor.",
      },
    ],
    excelTips: [
      {
        title: "Formül",
        formula: "=(Dönen-Stok)/KisaVadeli",
        description: "",
      },
    ],
    interpretation: [
      { range: "< 1", meaning: "Stoksuz kısmi likidite kısa borcu tam karşılamıyor olabilir." },
      { range: "≥ 1", meaning: "Genelde kısa vadeli ödeme için daha rahat tablo." },
    ],
    tips: ["Stok devir hızını da ayrıca takip edin."],
    relatedSlugs: ["cari-oran", "nakit-oran"],
    calculatorType: "asit-test-orani",
  },
  {
    slug: "vok-roe",
    name: "VÖK (Öz Sermaye Kârlılığı)",
    nameEn: "Return on Equity (ROE)",
    category: "finansal-oranlar",
    icon: "📈",
    summary:
      "Net dönem kârının öz kaynaklara oranıdır; hissedar getirisi açısından sık izlenir.",
    whatIs: `**VÖK / ROE**, net kârın öz kaynaklara bölünmesiyle (genelde yüzde olarak) hesaplanır.

**Formül:** VÖK (%) = (Net Dönem Kârı / Öz Kaynaklar) × 100

Profesyonel analizde **öz kaynak ortalaması** (dönem başı+sonu/2 vb.) kullanılabilir; hızlı tabloda dönem sonu öz kaynak da kullanılır.`,
    whyImportant: `Yatırımcı raporları ve performans ölçümünde temel göstergedir; kârlılık ve kaldıraç etkileriyle birlikte yorumlanmalıdır.`,
    formulas: [
      {
        label: "VÖK",
        formula: "VÖK (%) = Net Dönem Kârı / Öz Kaynaklar × 100",
        explanation: "Ortalama öz kaynak ile düzeltme tercihe bağlıdır.",
      },
    ],
    steps: ["Gelir tablosundan net dönem kârını alın.", "Bilançodan öz kaynakları alın (veya ortalama hesaplayın).", "Oranı hesaplayın."],
    examples: [
      {
        title: "Örnek",
        data: { "Net kâr": "2.400.000 ₺", "Öz kaynaklar": "18.000.000 ₺" },
        result: "VÖK ≈ %13,33",
        explanation: "Her 100 TL öz kaynak için yaklaşık 13,33 TL net kâr — sektör ve risk ile birlikte okunmalıdır.",
      },
    ],
    excelTips: [
      {
        title: "Yüzde biçimi",
        formula: "=NetKar/OzKaynak",
        description: "Hücreyi % biçiminde gösterin veya *100 ile çarpın.",
      },
    ],
    interpretation: [
      { range: "Düşük / negatif", meaning: "Kâr baskısı veya zarar — neden analizi (marj, faiz, vergi)." },
      { range: "Sektör ortalamasına yakın", meaning: "Göreli performans için rakiplerle kıyaslayın." },
      { range: "Çok yüksek", meaning: "Aşırı finansal kaldıraç ile şişmiş olabilir; borç/öz kaynak ile birlikte bakın." },
    ],
    tips: ["ROE’yi borç/öz kaynak ve faaliyet kârı ile birlikte değerlendirin (Dupont yaklaşımı)."],
    relatedSlugs: ["net-kar-marji", "borc-ozkaynak-orani"],
    calculatorType: "vok-roe",
  },
  {
    slug: "net-kar-marji",
    name: "Net Kâr Marjı",
    nameEn: "Net Profit Margin",
    category: "finansal-oranlar",
    icon: "📉",
    summary:
      "Net kârın satış hasılatına oranıdır; her 100 TL cirodan ne kadar net kâr kaldığını gösterir.",
    whatIs: `**Net kâr marjı** = Net Dönem Kârı ÷ Satış Hasılatı × 100

Fiyatlama, maliyet kontrolü ve vergi/Finansman giderlerinin birlikte etkisini özetler.`,
    whyImportant: `Yönetim ve yatırımcılar için en anlaşılır kârlılık ölçülerinden biridir.`,
    formulas: [
      {
        label: "Net kâr marjı",
        formula: "Net Kâr Marjı (%) = Net Dönem Kârı / Satış Hasılatı × 100",
        explanation: "Hasılat tanımı (net hasılat vs brüt) tekdüze olmalıdır.",
      },
    ],
    steps: ["Net dönem kârını alın.", "Aynı dönem satış hasılatını alın.", "Kârı hasılata bölüp yüzdeye çevirin."],
    examples: [
      {
        title: "Örnek",
        data: { "Net kâr": "2.400.000 ₺", "Satış hasılatı": "48.000.000 ₺" },
        result: "Net kâr marjı = %5",
        explanation: "Her 100 TL satıştan 5 TL net kâr kalmış.",
      },
    ],
    excelTips: [
      {
        title: "Formül",
        formula: "=NetKar/Hasilat",
        description: "Çoklu yıl için sütun kopyalama veya PivotTable.",
      },
    ],
    interpretation: [
      { range: "Negatif", meaning: "Zarar yazılmış — brüt marj ve gider kırılımı gerekir." },
      { range: "0–3%", meaning: "Dar marj — hacim ve maliyet hassasiyeti yüksek." },
      { range: "Yüksek (sektöre göre)", meaning: "Fiyat gücü veya düşük maliyet yapısı olabilir." },
    ],
    tips: ["Brüt kâr marjı ve faaliyet kârı marjı ile birlikte sunmak daha açıklayıcıdır."],
    relatedSlugs: ["vok-roe", "borc-ozkaynak-orani"],
    calculatorType: "net-kar-marji",
  },
  {
    slug: "borc-ozkaynak-orani",
    name: "Borç / Özkaynak Oranı",
    nameEn: "Debt-to-Equity Ratio",
    category: "finansal-oranlar",
    icon: "⚖️",
    summary:
      "Toplam borçların öz kaynaklara oranıdır; finansal kaldıraç ve risk yapısını gösterir.",
    whatIs: `**Borç / Özkaynak** = Toplam Borçlar / Öz Kaynaklar

“Toplam borç” tanımı (faizli borç mu, tüm yükümlülükler mi) analizde net tanımlanmalıdır; tutarlılık esastır.`,
    whyImportant: `Banka teminatı, kredi notu ve sigorta finansmanı tartışmalarında sık kullanılır. Çok yüksek oranlar temerrüt riskini artırır.`,
    formulas: [
      {
        label: "Borç/Özkaynak",
        formula: "Borç / Özkaynak = Toplam Borçlar / Öz Kaynaklar",
        explanation: "Bazı kaynaklar sadece faiz taşıyan borçları kullanır — raporunuzu açıklayın.",
      },
    ],
    steps: ["Borç toplamını seçin ve tanımlayın.", "Öz kaynakları alın.", "Bölün.", "Sektör normlarıyla karşılaştırın."],
    examples: [
      {
        title: "Örnek",
        data: { "Toplam borç": "22.000.000 ₺", "Öz kaynak": "18.000.000 ₺" },
        result: "Borç/Özkaynak ≈ 1,22",
        explanation: "Her 1 TL öz kaynak için 1,22 TL borç — kaldıraç orta-yüksek banda yaklaşabilir; faiz ödeme kapasitesi kontrol edilmeli.",
      },
    ],
    excelTips: [
      {
        title: "Formül",
        formula: "=ToplamBorç/OzKaynak",
        description: "",
      },
    ],
    interpretation: [
      { range: "< 0,5", meaning: "Düşük kaldıraç — konservatif yapı." },
      { range: "0,5 – 1,5", meaning: "Yaygın görülen aralık (sektöre göre değişir)." },
      { range: "> 2", meaning: "Yüksek kaldıraç — faiz kârını ve borç vadelerini izleyin." },
    ],
    tips: ["Öz kaynak negatifse oran yorumlanamaz; önce sermaye yapısı düzeltilmelidir."],
    relatedSlugs: ["vok-roe", "net-kar-marji", "cari-oran"],
    calculatorType: "borc-ozkaynak-orani",
  },

  /* ═══════════════════════════════════════════
     OPERASYONEL METRİKLER
     ═══════════════════════════════════════════ */
  {
    slug: "sla-servis-seviyesi",
    name: "SLA / Servis Seviyesi",
    nameEn: "Service Level / SLA Achievement",
    category: "operasyonel",
    icon: "🎯",
    summary:
      "Hedef süre veya kalite eşiği içinde tamamlanan işlerin (çağrı, ticket, talep) toplam işe oranıdır.",
    whatIs: `SLA (Service Level Agreement) veya servis seviyesi, işletmenin müşteriye veya iç birime verdiği taahhüdün yerine getirilme oranını ölçer.

**Temel formül:** Servis seviyesi (%) = (Hedef içinde tamamlanan adet / Toplam iş adedi) × 100

“Hedef içinde” tanımı sizin kurallarınıza bağlıdır: ilk yanıt süresi, çözüm süresi, kalite skoru eşiği vb. Tanımı raporda her zaman yazılı tutun; iki dönemi kıyaslarken aynı tanımı kullanın.`,
    whyImportant: `Çağrı merkezi, IT destek, hasar dosyası süreci veya poliçe işleme hatlarında yönetim ve müşteri memnuniyeti için temel göstergedir. Düşük seviye hem müşteri kaybı hem de regülasyon/SLA cezası riski doğurabilir.`,
    formulas: [
      {
        label: "Servis seviyesi",
        formula: "Servis Seviyesi (%) = Hedef İçinde Tamamlanan / Toplam İş × 100",
        explanation: "Adet bazlı; ağırlıklı SLA için öncelik veya süre ağırlığı ayrı model gerekir.",
      },
    ],
    steps: [
      "Ölçüm dönemini ve ‘hedef içinde’ tanımını netleştirin.",
      "Toplam iş/talep/çağrı sayısını sayın.",
      "Tanıma uyan tamamlananları sayın.",
      "Oranı hesaplayın ve ekip/vardiya bazlı kırılım ekleyin.",
    ],
    examples: [
      {
        title: "Çağrı merkezi — aylık",
        data: { "60 sn içinde yanıtlanan": "820", "Toplam gelen çağrı": "1000" },
        result: "Servis seviyesi = %82",
        explanation: "Her 100 çağrının 82'si hedef süre içinde karşılanmış.",
      },
    ],
    excelTips: [
      {
        title: "Yüzde",
        formula: "=HedefIci/Toplam",
        description: "Hücreyi % biçiminde göstermek için Excel biçimi kullanın.",
      },
      {
        title: "Koşullu sayım",
        formula: "=EĞERSAY(SüreDk;\"<=1\")",
        description: "Süre sütunu dakika cinsinden; eşik değişebilir.",
      },
    ],
    interpretation: [
      { range: "%95+", meaning: "Çok sıkı hedeflerde bile genelde mükemmele yakın." },
      { range: "%80 – %95", meaning: "Çoğu işletmede takip edilen bant; iyileştirme alanı olabilir." },
      { range: "%80 altı", meaning: "Kapasite, eğitim veya süreç darboğazı araştırılmalı." },
    ],
    tips: [
      "SLA tanımını değiştirmeden önce geçmiş aylarla kıyas yapmayın.",
      "Müşteri tatmini (CSAT) ile birlikte okumak faydalıdır.",
    ],
    relatedSlugs: ["personel-devir-orani", "calisan-basina-ciro"],
    calculatorType: "sla-servis-seviyesi",
  },
  {
    slug: "personel-devir-orani",
    name: "Personel Devir Oranı (Turnover)",
    nameEn: "Employee Turnover Rate",
    category: "operasyonel",
    icon: "👥",
    summary:
      "Belirli bir dönemde ayrılan çalışan sayısının, dönem ortalaması personel sayısına oranıdır.",
    whatIs: `Personel devir oranı, iş gücü istikrarını gösterir.

**Yaygın formül:** Devir oranı (%) = (Dönemde işten ayrılan sayı / Ortalama personel sayısı) × 100

Ortalama personel genelde (dönem başı + dönem sonu) / 2 veya aylık FTE ortalaması ile alınır. Dönem ay ise sonuç aylık devirdir; yıllık kıyas için aynı mantıkla 12 aylık toplam veya yaklaşık yıllıklandırma kullanılır.`,
    whyImportant: `Yüksek devir; işe alım maliyeti, bilgi kaybı ve müşteri deneyiminde dalgalanma yaratır. İK ve yönetim için stratejik göstergedir.`,
    formulas: [
      {
        label: "Devir oranı",
        formula: "Turnover (%) = Ayrılan ÷ ((FTE başlangıç + FTE bitiş) / 2) × 100",
        explanation: "FTE: tam zamanlı eşdeğeri; yarım zamanlılar oransal toplanır.",
      },
    ],
    steps: [
      "Dönemi seçin (ay, çeyrek, yıl).",
      "Dönem başı ve sonu FTE sayısını belirleyin.",
      "Dönem içinde ayrılan (istifa, işten çıkarma, emeklilik vb.) sayısını sayın.",
      "Ortalama FTE ile bölüp yüzdeye çevirin.",
    ],
    examples: [
      {
        title: "Çeyrek örneği",
        data: { Ayrılan: "12", "Dönem başı FTE": "240", "Dönem sonu FTE": "228" },
        result: "Ortalama FTE = 234 → Devir ≈ %5,13 (çeyreklik)",
        explanation: "Yıllık kıyas için benzer dönemlerin toplamı veya sektör benchmark'ı kullanın.",
      },
    ],
    excelTips: [
      {
        title: "Ortalama FTE",
        formula: "=(B2+C2)/2",
        description: "B2 başlangıç, C2 bitiş.",
      },
      {
        title: "Oran",
        formula: "=Ayrilan/OrtalamaFTE",
        description: "% biçiminde gösterin.",
      },
    ],
    interpretation: [
      { range: "Sektörün altı", meaning: "Bağlılık veya lokasyon avantajı olabilir." },
      { range: "Sektör ortalaması", meaning: "Normal band; neden analizi vaka bazlı." },
      { range: "Sektörün belirgin üstü", meaning: "Ücret, yönetim, yük — kök neden çalışması önerilir." },
    ],
    tips: [
      "Gönüllü / zorunlu ayrılışı ayrı izlemek politika üretimini kolaylaştırır.",
      "Yeni işe başlayan sayısı ile birlikte ‘net büyüme’ de hesaplanabilir.",
    ],
    relatedSlugs: ["sla-servis-seviyesi", "devamsizlik-orani"],
    calculatorType: "personel-devir-orani",
  },
  {
    slug: "devamsizlik-orani",
    name: "Devamsızlık Oranı",
    nameEn: "Absenteeism Rate",
    category: "operasyonel",
    icon: "📋",
    summary:
      "Planlanan çalışma günlerine kıyasla devamsızlık (hastalık, izinsiz vb.) günlerinin oranıdır.",
    whatIs: `Devamsızlık oranı, üretkenlik ve iş gücü planlaması için kullanılır.

**Örnek formül (toplam):** Oran (%) = (Toplam devamsızlık günü / Toplam planlanan iş günü) × 100

Burada payda, tüm ilgili çalışanların “çalışılması beklenen gün” toplamı olabilir (ör. 200 kişi × 22 iş günü). Tek çalışan için: devamsız gün / kendi planlı iş günü.`,
    whyImportant: `Sigorta, üretim ve çağrı merkezlerinde vardiya planı ve maliyet (yedek personel) ile doğrudan ilişkilidir.`,
    formulas: [
      {
        label: "Toplam bazlı",
        formula: "Devamsızlık (%) = Σ Devamsızlık günü / Σ Planlanan iş günü × 100",
        explanation: "Planlı iş günü: resmi takvim ve sözleşmeye göre netleştirin.",
      },
    ],
    steps: [
      "Dönemi ve çalışan kapsamını seçin.",
      "Devamsızlık günlerini (raporlama sisteminizden) toplayın.",
      "Aynı dönem için planlanan toplam iş gününü hesaplayın.",
      "Oranı hesaplayın.",
    ],
    examples: [
      {
        title: "Departman — bir ay",
        data: { "Toplam devamsızlık günü": "186", "Toplam planlı iş günü": "6200" },
        result: "Devamsızlık oranı ≈ %3",
        explanation: "Her 100 planlı iş gününün 3’ü devamsızlıkla kayıp (özet örnek).",
      },
    ],
    excelTips: [
      {
        title: "Toplam",
        formula: "=TOPLA(DevamsızlıkGünü)/TOPLA(PlanlıGün)",
        description: "",
      },
    ],
    interpretation: [
      { range: "Düşük (sektör normuna göre)", meaning: "İK maliyeti kontrol altında." },
      { range: "Artan trend", meaning: "İş yükü, sağlık, motivasyon veya yönetişim sinyali olabilir." },
    ],
    tips: ["Raporlama tanımınızı (ücretsiz izin dahil mi?) tek cümleyle sabitleyin."],
    relatedSlugs: ["personel-devir-orani", "sla-servis-seviyesi"],
    calculatorType: "devamsizlik-orani",
  },
  {
    slug: "calisan-basina-ciro",
    name: "Çalışan Başına Ciro",
    nameEn: "Revenue per Employee",
    category: "operasyonel",
    icon: "🏢",
    summary:
      "Belirli bir dönemde satış hasılatının ortalama tam zamanlı eşdeğer çalışan sayısına bölünmesiyle bulunur.",
    whatIs: `**Çalışan başına ciro**, ölçek ve verimlilik için sık kullanılan bir KPI’dır.

**Formül:** Çalışan başına ciro = Satış hasılatı / Ortalama FTE

Sadece satış ekibine mi yoksa tüm şirkete mi bölündüğünü raporda belirtin; iki metrik farklı hikâye anlatır.`,
    whyImportant: `Büyüme, otomasyon ve organizasyon değişikliklerinin etkisini kabaca izlemenizi sağlar. Sigorta acenteliği, perakende ve B2B’de yönetim kurulu özetlerinde yer alır.`,
    formulas: [
      {
        label: "Ciro / FTE",
        formula: "Çalışan Başına Ciro = Dönem Satış Hasılatı / Ortalama FTE",
        explanation: "Hasılat: TFRS net hasılat ile uyumlu olmalıdır.",
      },
    ],
    steps: ["Dönem satış hasılatını alın.", "Aynı dönem ortalama FTE’yi hesaplayın.", "Bölün.", "Geçmiş yıllar ve sektör ile kıyaslayın."],
    examples: [
      {
        title: "Yıllık",
        data: { "Satış hasılatı": "48.000.000 ₺", "Ortalama FTE": "234" },
        result: "Çalışan başına ciro ≈ 204.957 ₺",
        explanation: "Tam zamanlı eşdeğeri artmadan ciro artıyorsa verimlilik sinyali olabilir (diğer faktörleri de kontrol edin).",
      },
    ],
    excelTips: [
      {
        title: "Formül",
        formula: "=Hasilat/OrtalamaFTE",
        description: "Binlik ayırıcı ile okunabilir biçimlendirme kullanın.",
      },
    ],
    interpretation: [
      { range: "Trend yukarı", meaning: "Fiyat/hacim veya verimlilik — kârlılık metrikleriyle birlikte okuyun." },
      { range: "Trend aşağı", meaning: "Pazar baskısı veya FTE artışı — nedeni ayrıştırın." },
    ],
    tips: ["Bu metriği net kâr marjı ve personel gideri ile üçlü sunmak daha sağlıklıdır."],
    relatedSlugs: ["personel-devir-orani", "net-kar-marji"],
    calculatorType: "calisan-basina-ciro",
  },

  /* ═══════════════════════════════════════════
     Kayıp oranı (kazanılmış prim paydası) — basit
     ═══════════════════════════════════════════ */
  {
    slug: "kayip-orani",
    name: "Kayıp Oranı (Kazanılmış Prim ile)",
    nameEn: "Loss Ratio (Earned Premium Basis)",
    category: "teknik-sigortacilik",
    icon: "📉",
    summary:
      "Dönem hasarının kazanılmış prime bölünmesiyle bulunan kayıp oranıdır. Brüt/net ve reasürans ayrımı için Hasar/Prim (H/P) sayfasına bakın.",
    whatIs: `**Kayıp oranı (loss ratio)**, sigortada en yaygın tanımıyla hasar tutarının (veya ödenen + muallak değişimi gibi tanımladığınız “dönem hasarı”nın) **kazanılmış prime** oranıdır.

Bu sayfadaki hesaplayıcı tek satırda öğrenmek içindir: Payda olarak **kazanılmış prim** kullanırsınız; böylece yazılan prim ile henüz risk taşınmamış kısım sonucu şişirmez.

Tam teknik analizde **brüt / net** ayrımı ve **reasürans** payları kritiktir; buna uygun 4 alanlı hesap **Hasar/Prim Oranı** sayfasındadır.`,
    whyImportant: `Doğru payda seçilmezse (örneğin yazılan prim kullanılırsa), dönem sonu kayıp oranı yanıltıcı düşük veya yüksek görünür. Kazanılmış prim, gelir tablosu ve teknik kârlılık ile hizalıdır.`,
    formulas: [
      {
        label: "Kayıp oranı (basit)",
        formula: "Kayıp Oranı (%) = (Dönem Hasarı / Kazanılmış Prim) × 100",
        explanation:
          "Dönem hasarı tanımınızı (ödenen, muallak dahil vb.) tek tip sabitleyin. Payda: aynı döneme ait kazanılmış prim.",
      },
    ],
    steps: [
      "Dönem için kazanılmış prim toplamını belirleyin.",
      "Aynı dönem için hasar tutarını (tanımınıza göre) toplayın.",
      "Hasarı kazanılmış prime bölüp 100 ile çarpın.",
      "Brüt/net ve reasürans gerekiyorsa H/P sayfasındaki hesaplayıcıyı kullanın.",
    ],
    examples: [
      {
        title: "Çeyrek portföy",
        data: { "Dönem hasarı": "4.200.000 ₺", "Kazanılmış prim": "6.000.000 ₺" },
        result: "Kayıp oranı = %70",
        explanation: "Her 100 ₺ kazanılmış prim için 70 ₺ hasar — masraf eklenmeden önce teknik görünüm.",
      },
    ],
    excelTips: [
      {
        title: "Basit formül",
        formula: "=Hasar/KazanilmisPrim",
        description: "Hücreyi % biçiminde gösterin veya *100 kullanın.",
      },
    ],
    interpretation: [
      { range: "H/P ile aynı skala", meaning: "%100’ün üzeri tek başına teknik zarar sinyali (masraflar hariç)." },
      { range: "Kazanılmış vs yazılan", meaning: "Yazılan prim ile kıyaslamak büyüyen portföyde oranı çarpıtabilir." },
    ],
    tips: [
      "Muallak hasar hareketini dahil edip etmediğinizi raporda yazın.",
      "Branş ve ürün kırılımı olmadan portföy toplamı yanıltabilir.",
    ],
    relatedSlugs: ["hasar-prim-orani", "kazanilmis-prim", "birlesik-oran"],
    calculatorType: "kayip-orani",
  },
  {
    slug: "birlesik-oran",
    name: "Birleşik Oran (Combined Ratio)",
    nameEn: "Combined Ratio",
    category: "teknik-sigortacilik",
    icon: "➕",
    summary:
      "Kayıp oranı ile gider oranının (genellikle komisyon ve idari/satış giderlerinin kazanılmış prime oranı) toplamıdır. %100 altı teknik kâr için tipik eşik olarak kullanılır.",
    whatIs: `**Birleşik oran**, sigorta şirketinin **teknik sonucunu** özetler:

Kayıp oranı (hasar / kazanılmış prim) + Gider oranı (underwriting giderleri / kazanılmış prim).

Gider payında genelde **komisyon, idari ve satış giderleri** gibi poliçe üretimine bağlı kalemler kullanılır; tam kapsam şirket muhasebesine göre değişir. Bu araçta gider tutarını tek kutu olarak giriyorsunuz (içeride komisyon + idari toplamı gibi düşünün).

**Yorum:** Birleşik oran %100’ün altındaysa teknik kâr (basit tanım), üzerindeyse teknik zarar — yatırım geliri ve reasürans etkisi bu basit eşikten hariç tutulur.`,
    whyImportant: `Yönetim kurulu özetlerinde H/P’den sonra en çok citelenen göstergedir; fiyatlama yeterliliği ile operasyonel verimliliği birlikte gösterir.`,
    formulas: [
      {
        label: "Bileşenler",
        formula: "Birleşik Oran (%) = (Hasar / EP × 100) + (Underwriting Giderleri / EP × 100)",
        explanation: "EP: kazanılmış prim. İki oran aynı paydada olmalıdır.",
      },
    ],
    steps: [
      "Dönem kazanılmış primini alın.",
      "Aynı dönem hasar tutarını (tanımınıza uygun) alın.",
      "Aynı dönem underwriting gideri toplamını (komisyon + idari/satış vb.) alın.",
      "Kayıp % ve gider % hesaplayıp toplayın.",
    ],
    examples: [
      {
        title: "Örnek",
        data: { Hasar: "7.000.000 ₺", "Kazanılmış prim": "10.000.000 ₺", "UW giderleri": "2.800.000 ₺" },
        result: "Kayıp %70 + Gider %28 = Birleşik %98",
        explanation: "Basit tanımla teknik kâr marjı pozitif (%2 pay).",
      },
    ],
    excelTips: [
      {
        title: "Toplam yüzde",
        formula: "=(A2/B2+C2/B2)*100",
        description: "A2=hasar, C2=gider, B2=kazanılmış prim.",
      },
    ],
    interpretation: [
      { range: "%100 altı", meaning: "Yaygın yorum: teknik kâr (basit); yatırım geliri ayrı)." },
      { range: "%100 üzeri", meaning: "Teknik zarar — fiyat, seçim veya gider baskısı." },
    ],
    tips: ["Gider kapsamınızı grafik notunda sabitleyin; şirketler arası kıyasta tanımlar farklıdır."],
    relatedSlugs: ["hasar-prim-orani", "kayip-orani", "kazanilmis-prim"],
    calculatorType: "birlesik-oran",
  },
  {
    slug: "prim-tahsilat-orani",
    name: "Prim Tahsilat Oranı",
    nameEn: "Premium Collection Rate",
    category: "teknik-sigortacilik",
    icon: "💳",
    summary:
      "Tahsil edilen primin, yazılan veya tahakkuk eden prime (veya vadesi gelen alacağa) oranıdır. Nakit disiplini ve alacak riskini izlemek için kullanılır.",
    whatIs: `**Prim tahsilat oranı**, “prim poliçede yazıldı ama kasaya ne kadar girdi?” sorusunun özeti için kullanılır.

**Pay:** Dönem içinde tahsil edilen prim (veya net tahsilat).  
**Payda:** Genelde aynı dönemde yazılan prim, tahakkuk eden prim veya vadesi gelen prim/alacak — şirket politikasına göre seçilir. Bu hesaplayıcıda payda alanını “yazılan/tahakkuk tutarı” olarak değerlendirin; tanımınızı raporda yazın.

%100 üzeri, dönemden önceki döneme ait tahsilat veya iade düzeltmeleri nedeniyle görülebilir; veri kalitesini kontrol edin.`,
    whyImportant: `Nakit akışı ve müşteri/acente temerrüdü hakkında erken uyarı verir; özellikle taksitli poliçelerde kritiktir.`,
    formulas: [
      {
        label: "Temel",
        formula: "Tahsilat Oranı (%) = (Tahsil Edilen Prim / Yazılan veya Tahakkuk Prim) × 100",
        explanation: "Payda tanımı değiştikçe oranın seviyesi değişir; kıyasta hep aynı tanımı kullanın.",
      },
    ],
    steps: ["Tahsilat ve payda primini aynı dönem ve TFRS kapsamında seçin.", "Bölün ve % ifade edin.", "Tarihsel trend ve yaşlandırma raporu ile destekleyin."],
    examples: [
      {
        title: "Ay sonu",
        data: { "Tahsil edilen": "8.400.000 ₺", "Yazılan prim (payda)": "9.000.000 ₺" },
        result: "Tahsilat oranı ≈ %93,33",
        explanation: "Geriye kalan kısım henüz tahsil edilmemiş veya vade takvimindedir.",
      },
    ],
    excelTips: [{ title: "Oran", formula: "=Tahsil/Yazilan", description: "% biçimi." }],
    interpretation: [
      { range: "Yüksek (%95+)", meaning: "Güçlü tahsilat; payda tanımına bağlı." },
      { range: "Düşen trend", meaning: "Ödeme koşulları, acente stoku veya ekonomik baskı sinyali." },
    ],
    tips: ["Taksit planı ve iadeleri düzeltmeden önce brüt tahsilatı inceleyin."],
    relatedSlugs: ["kazanilmis-prim", "hasar-prim-orani"],
    calculatorType: "prim-tahsilat-orani",
  },
  {
    slug: "hasar-cozum-suresi",
    name: "Hasar Çözüm Süresi (Ortalama Gün)",
    nameEn: "Average Claims Settlement Time",
    category: "teknik-sigortacilik",
    icon: "⏱️",
    summary:
      "Kapanmış hasar dosyalarında, bildirimden kapanışa kadar geçen günlerin ortalamasıdır. Tanımınızı (SLA, takvim günü, iş günü) sabit tutun.",
    whatIs: `**Ortalama çözüm süresi** = Toplam (veya listedeki taleplerin) çözüm süresi günleri / Talep sayısı.

Tek dosya için: kapanış tarihi − bildirim tarihi. Portföy için: tüm kapanan dosyalarda bu farkların ortalaması veya toplam gün / adet.

İş günü mü takvim günü mü kullandığınızı raporda belirtin; SLA hedefleri genelde iş günüdür.`,
    whyImportant: `Müşteri memnuniyeti, regülasyon beklentisi ve rezerv tahminleri için operasyonel KPI’dır. SLA servis metriği ile birlikte kullanılabilir.`,
    formulas: [
      {
        label: "Ortalama",
        formula: "Ortalama Çözüm Süresi (gün) = Σ (Kapanış − Bildirim) / Kapalı Dosya Adedi",
        explanation: "Sadece kapalı dosyalar — açık dosyalar farklı bir metrik (yaşlandırma) olarak izlenir.",
      },
    ],
    steps: [
      "Kapalı dosyaları filtreleyin.",
      "Her dosya için bildirim ve kapanış tarihi arasındaki gün farkını hesaplayın.",
      "Aritmetik ortalama alın veya Excel’de ORTALAMA kullanın.",
    ],
    examples: [
      {
        title: "Üç",
        data: { "Dosya A gün": "12", "Dosya B gün": "18", "Dosya C gün": "15" },
        result: "Ortalama = 15 gün",
        explanation: "(12+18+15)/3 — gerçek portföyde yüzlerce dosya ile aynı mantık.",
      },
    ],
    excelTips: [
      {
        title: "Gün farkı",
        formula: "=Kapanis-Bildirim",
        description: "Tarih hücreleri sayı olarak.",
      },
      {
        title: "Ortalama",
        formula: "=ORTALAMA(E2:E500)",
        description: "Kapalı dosya sütunu.",
      },
    ],
    interpretation: [
      { range: "Kısalan ortalama", meaning: "Operasyon iyileşmesi (tanım değişmediyse)." },
      { range: "Uzayan ortalama", meaning: "Eksper, eksik evrak, anomaly veya hacim artışı." },
    ],
    tips: ["Outlier dosyaları (yıllar süren dava) ortalamayı şişirir; medyan da raporlayın."],
    relatedSlugs: ["sla-servis-seviyesi", "yenileme-orani"],
    calculatorType: "hasar-cozum-suresi",
  },
  {
    slug: "iptal-orani",
    name: "Poliçe İptal Oranı",
    nameEn: "Cancellation Rate",
    category: "teknik-sigortacilik",
    icon: "🚫",
    summary:
      "Belirli bir dönemde iptal edilen poliçe adedinin, referans portföy adedine oranıdır. Payda tanımı (dönem başı aktif, vadesi gelen, yenilenebilir vb.) kuruma göre değişir.",
    whatIs: `**İptal oranı** için yaygın bir tanım:

İptal Oranı (%) = (Dönem içi iptal edilen poliçe sayısı / Payda: örn. dönem başı aktif poliçe sayısı) × 100

**Yenileme oranından farkı:** Yenileme, vadesi bitenlerden kaçının devam ettiğini ölçer; iptal, çoğu zaman poliçenin vadesi dolmadan veya yenileme öncesi kesilmesini takip eder. Kurumda “erken iptal” ve “yenilenmeme” ayrı KPI olarak da tutulabilir.

Bu hesaplayıcıda payda olarak **aynı dönem için seçtiğiniz referans adedi** (ör. dönem başı aktif poliçe) kullanılır.`,
    whyImportant: `Müşteri tatmini, fiyat rekabeti ve kanal davranışı hakkında bilgi verir; yenileme KPI’sı ile birlikte okunmalıdır.`,
    formulas: [
      {
        label: "Adet bazlı",
        formula: "İptal Oranı (%) = İptal Edilen Poliçe Adedi / Referans Poliçe Adedi × 100",
        explanation: "Referans: dönem başı aktif, ortalama aktif veya “riskte adet” — tek tanım seçin.",
      },
    ],
    steps: ["İptal tanımınızı (erken iptal, tüm iptaller) netleştirin.", "Payda adedini aynı periyotta üretin.", "Oranı hesaplayın, branş/kanal kırılımı ekleyin."],
    examples: [
      {
        title: "Örnek",
        data: { "Dönem içi iptal": "340", "Dönem başı aktif poliçe": "12.500" },
        result: "İptal oranı ≈ %2,72",
        explanation: "Her 100 aktif poliçeye yaklaşık 2,7 iptal (bu tanım setiyle).",
      },
    ],
    excelTips: [{ title: "Oran", formula: "=İptal/Referans", description: "% biçimi." }],
    interpretation: [
      { range: "Sektörle kıyas", meaning: "Mutlak % yerine trend ve segment önemli." },
      { range: "Ani sıçrama", meaning: "Fiyat değişimi, ürün kapanışı veya kanal sorunu olabilir." },
    ],
    tips: ["Yenileme oranı sayfasındaki dönem uyumunu iptal KPI’sına da uygulayın."],
    relatedSlugs: ["yenileme-orani", "prim-tahsilat-orani"],
    calculatorType: "iptal-orani",
  },
  {
    slug: "police-basina-maliyet",
    name: "Poliçe Başına Maliyet",
    nameEn: "Cost per Policy",
    category: "teknik-sigortacilik",
    icon: "📑",
    summary:
      "Seçilen gider kovasının (ör. üretim, dağıtım, poliçe başına işlem) toplamının, ilgili poliçe adedine bölünmesidir.",
    whatIs: `**Poliçe başına maliyet** = Toplam gider (tanımlı kapsam) / Poliçe adedi

Kapsam sadece **net underwriting gideri** olabilir veya **çağrı merkezi + poliçeleştirme** gibi dar bir havuz. Önemli olan: raporda hangi giderlerin dahil edildiğini yazmak ve dönemler arasında aynı kapsamı korumak.

Çalışan başına cirodan farkı: payda **poliçe** veya **işlem adedi**dir; üretim verimliliğini ölçer.`,
    whyImportant: `Dijitalleşme ve otomasyon projelerinin etkisini kabaca ölçmek için kullanılır; kanal (online/acente) kırılımı fark yaratır.`,
    formulas: [
      {
        label: "Temel",
        formula: "Poliçe Başına Maliyet = Toplam İlgili Giderler / Üretilen veya Yenilenen Poliçe Adedi",
        explanation: "Paydada “yeni iş” mi “tüm işlem” mü olduğunu netleştirin.",
      },
    ],
    steps: ["Gider havuzunu ve dönemi seçin.", "Payda adetini aynı dönemde sayın.", "Bölün; geçmiş çeyreklerle kıyaslayın."],
    examples: [
      {
        title: "Dağıtım gideri",
        data: { "Toplam dağıtım gideri": "4.500.000 ₺", "Poliçe adedi": "15.000" },
        result: "Poliçe başına ≈ 300 ₺",
        explanation: "Dar tanım — tam şirket maliyeti değildir.",
      },
    ],
    excelTips: [{ title: "Bölüm", formula: "=Gider/Adet", description: "TL veya USD tutarlılığı." }],
    interpretation: [
      { range: "Düşen eğilim", meaning: "Ölçek veya verimlilik (kapsam sabitse)." },
      { range: "Yüksek mutlak", meaning: "Kanal karışımı veya manuel iş yükü olabilir." },
    ],
    tips: ["Bu metriği birleşik orandaki gider oranı ile birlikte okuyun; ikisi farklı payda kullanabilir."],
    relatedSlugs: ["calisan-basina-ciro", "birlesik-oran"],
    calculatorType: "police-basina-maliyet",
  },

  /* ═══ Teknik karşılıklar (eğitim) ═══ */
  {
    slug: "kazanilmamis-prim-karsiligi",
    name: "Kazanılmamış Primler Karşılığı (KPK)",
    nameEn: "Unearned Premium Reserve (UPR)",
    category: "teknik-sigortacilik",
    icon: "📅",
    summary:
      "Risk henüz tam taşınmadığı için gelir yazılamayan prim kısmının bilançoda teknik karşılık olarak tutulmasıdır. Poliçe vadesine göre oransal dağıtım en yaygın Excel mantığıdır.",
    whatIs: `**Kazanılmamış prim karşılığı (KPK)**, tahsil edilmiş veya yazılmış primin, henüz “kazanılmamış” kısmının bilanço pasifinde gösterilen teknik yükümlülüğüdür.

Sigorta şirketi primi peşin alabilir; ancak muhasebe ve teknik mantıkta gelir, riskin taşındığı süre boyunca **zaman içinde** kazanılır. Kalan süreye düşen prim payı KPK’dır.

**Tek poliçe düşüncesi:** Prim × (Kalan gün ÷ Toplam vade günü) = KPK; Kazanılmış prim payı ise Prim × (Geçen gün ÷ Toplam vade).

Portföyde binlerce poliçe vardır; pratikte her poliçe satırı için aynı mantık uygulanıp toplanır veya aktüerya/ERP çıktısı kullanılır.`,
    whyImportant: `Gelir tablosunda kazanılmış prim ile tutarlılık, bilanço doğruluğu ve regülatör raporlama için zorunludur. KPK’nın eksik veya yanlış hesabı hem teknik kârı hem öz kaynak görünümünü çarpıtabilir.`,
    formulas: [
      {
        label: "Oransal (gün bazlı)",
        formula: "KPK (poliçe) = Toplam Prim × (Kalan Gün / Toplam Poliçe Günü)",
        explanation: "En yaygın eğitim formülü; özel ürünlerde farklı dağıtım kuralları olabilir.",
      },
      {
        label: "Bütünlük",
        formula: "Kazanılmış Prim Payı + KPK = İlgili dönemde dağıtılacak toplam prim (tek poliçe bazında)",
        explanation: "Kontrol amaçlı.",
      },
    ],
    steps: [
      "Her poliçe için başlangıç-bitiş tarihi ve primi alın.",
      "Dönem sonu veya hesap tarihinde geçen ve kalan günü netleştirin.",
      "Oransal KPK ve kazanılmış payı hesaplayın.",
      "Branş ve kanal kırılımında toplayın; bilanço satırı ile mutabakat yapın.",
    ],
    examples: [
      {
        title: "365 günlük poliçe — 100. gün",
        data: { Prim: "3.650 ₺", "Geçen gün": "100", "Toplam vade": "365 gün" },
        result: "Kazanılmış pay ≈ 1.000 ₺ | KPK ≈ 2.650 ₺",
        explanation: "3.650 × (100/365) ve 3.650 × (265/365).",
      },
    ],
    excelTips: [
      {
        title: "Satır bazlı KPK",
        formula: "=Prim*(1-MİN(HesapTarihi;Bitiş)+Başlangıç)/(Bitiş-Başlangıç)",
        description: "Tarih sınırlarını MİN/MAKS ile güvenli tutun.",
      },
    ],
    interpretation: [
      { range: "KPK ↑", meaning: "Yeni iş veya uzun vade — nakit gelse bile gelir ertelenir." },
      { range: "KPK ↓", meaning: "Portföy yaşlanıyor veya kısa vade ağırlığı." },
    ],
    tips: ["Reasürans payı düşülmüş net prim üzerinden mi hesaplandığını raporda yazın.", "Kazanmış prim sayfası ile çift kontrol yapın."],
    relatedSlugs: ["kazanilmis-prim", "birlesik-oran", "muallak-hasar-karsiligi", "ifrs17-paa", "ifrs17-lrc"],
    calculatorType: "kazanilmamis-prim-karsiligi",
  },
  {
    slug: "muallak-hasar-karsiligi",
    name: "Muallak Hasar Karşılığı",
    nameEn: "Claims Outstanding / IBNR (context-dependent)",
    category: "teknik-sigortacilik",
    icon: "⚖️",
    summary:
      "Henüz ödenmemiş veya tam olarak bilinmeyen hasar yükü için ayrılan teknik karşılıktır. Basit fark: oluşmuş hasar − ödenen; IBNR için zincir merdiveni ve aktüerya gerekir.",
    whatIs: `**Muallak hasar karşılığı**, raporlanmış ama henüz kapanmamış dosyalar ve bazen **henüz raporlanmamış** (IBNR) bileşenleri içerebilir.

**Basit öğrenme ayrımı:** “Oluşmuş (veya tahmini toplam) hasar − Ödenen hasar” ödenmemiş bileşeni verir. **IBNR** (henüz bildirilmemiş) ayrıca istatistiksel yöntemlerle tahmin edilir; zincir merdiveni, Bornhuetter-Ferguson gibi teknikler sigorta matematiğinde kullanılır.

Şirket bilançosunda muallak, düzenleyici tablo ve TFRS çerçevesinde teknik pasif kalemlerinde izlenir.`,
    whyImportant: `Teknik kârlılık ve solvabilitenin doğru görünmesi için kritiktir. Muallak eksikse kâr şişik, fazlaysa kâr baskılanmış görünür.`,
    formulas: [
      {
        label: "Ödenmemiş (basit)",
        formula: "Ödenmemiş ≈ Tahmini Oluşmuş Toplam Hasar − Ödenen Hasar",
        explanation: "Raporlanan dosyalar için kabaca kontrol; IBNR dahil değildir.",
      },
    ],
    steps: [
      "Hasar veri tabanından dönem ve branş bazında ödenen ve rezerv tutarlarını çekin.",
      "Aktüer IBNR tahminini ayrı sütunda tutun.",
      "Toplam muallak = bilinen ödenmemiş + IBNR (tanımınıza göre).",
      "Gelir tablosu hareketi ile mutabakat yapın.",
    ],
    examples: [
      {
        title: "Basit kontrol",
        data: { "Tahmini oluşmuş": "8.500.000 ₺", Ödenen: "5.200.000 ₺" },
        result: "Ödenmemiş bileşen ≈ 3.300.000 ₺",
        explanation: "IBNR eklenmeden önce kabaca taban.",
      },
    ],
    excelTips: [{ title: "Fark", formula: "=Olusmus-Odenen", description: "Branş sütunu ile ÇOKETOPLA kullanın." }],
    interpretation: [
      { range: "Muallak artışı", meaning: "Büyük olay, geciken çözüm veya IBNR revizyonu." },
      { range: "Muallak azalışı", meaning: "Çözüm veya konservatiflik azalması — nedeni ayrıştırın." },
    ],
    tips: ["IBNR’yi basit yüzde ile karıştırmayın; yöntem raporda açıklanmalıdır.", "Hasar/Prim ile birlikte okuyun."],
    relatedSlugs: ["hasar-prim-orani", "kayip-orani", "kazanilmamis-prim-karsiligi", "ifrs17-lic", "ifrs17-ra"],
    calculatorType: "muallak-hasar-karsiligi",
  },
  {
    slug: "matematik-karsiliklar",
    name: "Matematik Karşılıklar",
    nameEn: "Mathematical Reserves",
    category: "teknik-sigortacilik",
    icon: "∞",
    summary:
      "Hayat, sağlık ve emeklilikte uzun vadeli yükümlülüklerin bugünkü değerle bilançoda karşılanmasıdır. Tam tutar aktüerya ve FMV yöntemiyle belirlenir; sayfada kavram ve Excel izleme mantığı vardır.",
    whatIs: `**Matematik karşılıklar**, uzun süreli sigorta ve emeklilik sözleşmelerinde, şirketin gelecekte ödeyeceği faydaların bugünkü değerinin teknik borç olarak ayrılmasıdır.

Ölüm, maluliyet, ferdi kaza, sağlık gideri projeksiyonları ve iskonto oranı birlikte kullanılır. TFRS 17 ve SEDDK düzenlemeleri kapsamında yöntem ve varsayımlar şeffaf olmalıdır.

Bu platformda **tam aktüerya motoru yoktur**; amaç kavramı doğru anlamak ve rapor satırlarını Excel’de takip edebilmektir.`,
    whyImportant: `Hayat/emeklilik şirketleri için bilançonun büyük kısmını oluşturur; öz kaynak ve getiri analizinin merkezindedir.`,
    formulas: [
      {
        label: "Kavramsal",
        formula: "Matematik Karşılık ≈ PV(Beklenen Gelecek Ödemeler − Beklenen Gelecek Primler) (politika bazında toplam)",
        explanation: "PV: bugünkü değer; uygulama tablolar ve yazılımla yapılır.",
      },
    ],
    steps: ["Aktüerden dönem sonu teknik hesap çıktısını alın.", "Bilanço kalem kodlarıyla eşleştirin.", "Hareket: faiz ertelenmesi, yeni iş, ödemeler.", "TFRS dipnotlarıyla çapraz kontrol."],
    examples: [
      {
        title: "Örnek (sayısal değil)",
        data: { Senaryo: "Vadesi uzun hayat poliçesi", Not: "İskonto ↓ ise karşılık ↑ eğilimi" },
        result: "Yön analizi — mutlak tutar aktüer çıktısıdır",
        explanation: "Hassasiyet analizi Excel’de senaryo sütunlarıyla yapılır.",
      },
    ],
    excelTips: [
      {
        title: "Senaryo sütunu",
        formula: "=TemelKarşılık*(1+ŞokOranı)",
        description: "Eğitim için kabaca duyarlılık; resmi hesap değildir.",
      },
    ],
    interpretation: [
      { range: "Karşılık ↑", meaning: "Beklenti kötüleşti, iskonto düştü veya yeni iş maliyeti arttı (özet)." },
      { range: "Karşılık ↓", meaning: "Tersi yön — mutlaka dipnotla destekleyin." },
    ],
    tips: ["FMV oynaklığı öz kaynak göstergelerini etkiler.", "Hayat dışı KPK ile karıştırmayın."],
    relatedSlugs: ["devam-eden-riskler-karsiligi", "dengeleme-karsiligi", "kazanilmamis-prim-karsiligi"],
    calculatorType: "matematik-karsiliklar",
  },
  {
    slug: "ikramiye-indirim-karsiligi",
    name: "İkramiye ve İndirimler Karşılığı",
    nameEn: "Bonus & Discount Reserve",
    category: "teknik-sigortacilik",
    icon: "🎁",
    summary:
      "Poliçe sahiplerine bağlı ikramiye veya indirim taahhütleri için ayrılan teknik karşılıktır. Excel’de sıkça prim veya hasılat üzerinden oransal tahmin ile izlenir; kesin tutar ürün şartnamesine bağlıdır.",
    whatIs: `**İkramiye** (katılım payı vb.) ve **indirim** taahhütleri, sözleşmede tanımlı koşullara göre gelecekte poliçe sahibine aktarılacak tutarlar için karşılık gerektirebilir.

Hayat ve bazı sağlık ürünlerinde yaygındır. Oran, geçmiş kârlılık, fon getirisi ve şirket politikasına göre belirlenir.

**Basit Excel yaklaşımı:** İlgili prim havuzu × tahmini ikramiye/indirim oranı = dönem karşılık tahmini (eğitim amaçlı).`,
    whyImportant: `Taahhüt edilmiş faydayı bilançoda göstermezseniz teknik kâr ve öz kaynak yanıltıcı olur.`,
    formulas: [
      {
        label: "Oransal tahmin",
        formula: "Karşılık ≈ Uygun Prim Tutarı × İkramiye veya İndirim Oranı",
        explanation: "Ürün bazında farklı kovalar oluşturun.",
      },
    ],
    steps: ["Ürün şartnamesinden ikramiye/indirim kuralını çıkarın.", "Prim veya fon bilançosunu eşleştirin.", "Oranı yönetim onayıyla sabitleyin veya senaryolaştırın.", "Dönemsel hareketi muhasebe ile mutabık tutun."],
    examples: [
      {
        title: "Oransal örnek",
        data: { Prim: "10.000.000 ₺", "Tahmini oran": "%4" },
        result: "Kabaca 400.000 ₺ karşılık",
        explanation: "Gerçekte vesting ve fon performansı eklenir.",
      },
    ],
    excelTips: [{ title: "Çarpım", formula: "=Prim*Oran", description: "Oranı 0,04 veya % biçiminde tutarlı kullanın." }],
    interpretation: [
      { range: "Oran ↑", meaning: "Paylaşım politikası cömertleşti veya düzenleme değişti." },
      { range: "Oran ↓", meaning: "Tersi — müşteri vaadi ve pazar etkisi." },
    ],
    tips: ["Katılım sigortası ile geleneksel hayatı karıştırmayın.", "Mevzuat değişimlerini takip edin."],
    relatedSlugs: ["matematik-karsiliklar", "kazanilmamis-prim-karsiligi"],
    calculatorType: "ikramiye-indirim-karsiligi",
  },
  {
    slug: "devam-eden-riskler-karsiligi",
    name: "Devam Eden Riskler Karşılığı (DERK)",
    nameEn: "Reserve for Unexpired Risk / Similar",
    category: "teknik-sigortacilik",
    icon: "🛡️",
    summary:
      "Risk süresi devam eden iş için teknik karşılık; hayat dışı ve bazı teknik düzenlemelerde önemlidir. Tutar genelde sistem ve düzenleyici yöntemle belirlenir; sayfada tanım ve raporlama çerçevesi anlatılır.",
    whatIs: `**Devam eden riskler karşılığı (DERK)**, henüz tamamlanmamış risk dönemine isabet eden teknik yükümlülüğü ifade eden karşılık türlerinden biridir (mevzuat ve şirket uygulamasında isim ve kapsam netleştirilir).

KPK ile kavramsal yakınlık gösterebilir; ancak bazı düzenlemelerde **ek zorunlu karşılık** veya **farklı hesap yöntemi** söz konusu olabilir. Portföyde zeyil, iptal, taksitlendirme ve yenileme akışı hesabı zorlaştırır.

**Bu sayfada** genel tanım ve Excel’de hangi rapor satırlarıyla ilişkilendireceğiniz anlatılır; **tutar hesabı** şirket içi model ve güncel mevzuat ile yapılmalıdır.`,
    whyImportant: `Yetersiz DERK teknik açığı ve regülatör sorularına yol açabilir; fazlası ise sermaye verimsizliği demektir.`,
    formulas: [
      {
        label: "Genel ifade",
        formula: "DERK = f(Portföy teknik verisi, yöntem, düzenleyici parametreler)",
        explanation: "Kapalı formül değil; şirket/period özelidir.",
      },
    ],
    steps: ["Güncel SEDDK/teknik tebliğ ve şirket politikasını referans alın.", "ERP/aktüer DERK çıktısını çekin.", "Bilanço ve gelir tablosu köprü tablolarıyla doğrulayın.", "Dipnot açıklamasını güncelleyin."],
    examples: [
      {
        title: "Kontrol sorusu",
        data: { "KPK toplamı": "X", "DERK satırı": "Y", Not: "Mutabakat farkı var mı?" },
        result: "Fark varsa neden analizi (reasürans, ek zorunluluk vb.)",
        explanation: "Örnek rakamsız süreç.",
      },
    ],
    excelTips: [
      {
        title: "Köprü tablo",
        formula: "=ERP_DERK-Bilanço_DERK",
        description: "Sıfıra yakın olmalı; fark sütunu açıklama ister.",
      },
    ],
    interpretation: [
      { range: "Dönemsel artış", meaning: "Büyüyen portföy veya ek zorunluluk." },
      { range: "Dönemsel azalış", meaning: "Çözüm veya yöntem değişimi — dokümante edin." },
    ],
    tips: ["KPK ile aynı tutarı göstermeyebilir; satır tanımını TFRS dipnotundan okuyun.", "Hayat dışı branşlarda daha sık karşılaşılır."],
    relatedSlugs: ["kazanilmamis-prim-karsiligi", "dengeleme-karsiligi", "matematik-karsiliklar"],
    calculatorType: "devam-eden-riskler-karsiligi",
  },
  {
    slug: "dengeleme-karsiligi",
    name: "Dengeleme Karşılığı",
    nameEn: "Equalization / Balancing Reserve",
    category: "teknik-sigortacilik",
    icon: "⚖️",
    summary:
      "Teknik sonuç dalgalanmalarını yumuşatmak veya mevzuatın öngördüğü denge mekanizmaları için ayrılan karşılıklardır. Tutar ve kullanım hukuki çerçeveye bağlıdır; sayfada mantık ve dikkat listesi verilir.",
    whatIs: `**Dengeleme karşılığı**, döneme ve mevzuata göre farklı isimlerle anılabilen; teknik kâr/zarar dalgalanmalarını yönetmeye veya sektörel/düzenleyici dengeyi sağlamaya yönelik **özel teknik karşılık** türlerini kapsar.

Ne zaman ayrılır, ne zaman serbest bırakılır, vergi ve öz kaynak etkisi nasıldır — bunlar **güncel kanun, tebliğ ve şirket hukuk/mali görüşü** ile belirlenir.

Bu içerik **yatırım veya muhasebe tavsiyesi değildir**; öğrenme ve rapor satırını tanıma amaçlıdır.`,
    whyImportant: `Yönetim ve yönetim kurulu sunumlarında teknik sonuçların “tek seferlik mi, yapısal mı” ayrımında dengeleme kalemleri sık sorulur.`,
    formulas: [
      {
        label: "Yer tutucu",
        formula: "Tutar = Mevzuat ve yönetim kurulu kararına uygun hesaplama",
        explanation: "Genel formül yoktur.",
      },
    ],
    steps: ["İlgili mevzuat maddelerini ve son genelgeyi kontrol edin.", "Mali işler ve hukuk ile ayrılış koşullarını yazılı hale getirin.", "Bilanço ve dipnotta kalemi açıklayın.", "Yıllık hareket tablosunda giriş/çıkışı gösterin."],
    examples: [
      {
        title: "Kontrol listesi",
        data: { "Karar var mı?": "E/H", "Dipnot güncel mi?": "E/H", "Öz kaynak etkisi net mi?": "E/H" },
        result: "Üçü de E olmalı",
        explanation: "Operasyonel disiplin örneği.",
      },
    ],
    excelTips: [
      {
        title: "Hareket",
        formula: "=Açılış+DönemGirişi-DönemÇıkışı",
        description: "Kapanış bilanço satırı ile eşleşmeli.",
      },
    ],
    interpretation: [
      { range: "Birikim", meaning: "İstek dışı teknik dalgalanma için tampon oluşturuluyor olabilir." },
      { range: "Erim", meaning: "Serbest bırakım veya kullanım — gerekçe dosyalanmalı." },
    ],
    tips: ["Eski dönem mevzuatı ile güncel uygulamayı karıştırmayın.", "Denetçi sorularına hazır özet paragraf tutun."],
    relatedSlugs: ["devam-eden-riskler-karsiligi", "muallak-hasar-karsiligi", "birlesik-oran"],
    calculatorType: "dengeleme-karsiligi",
  },

  /* ═══════════════════════════════════════════
     IFRS METRİKLERİ (TFRS 17)
     CSM, RA, PAA, LIC, LRC, GMM
     ═══════════════════════════════════════════ */
  {
    slug: "ifrs17-csm",
    name: "CSM (Sözleşmeye Bağlı Hizmet Marjı)",
    nameEn: "Contractual Service Margin",
    category: "ifrs-metrikleri",
    icon: "📈",
    summary:
      "IFRS 17 / TFRS 17 kapsamında bir sigorta sözleşme grubunun gelecekteki kazanılmamış kârıdır. Bilançoda LRC içinde tutulur, hizmet birimleri ile dönemsel olarak gelir tablosuna açılır. Kayıp grubunda CSM = 0.",
    whatIs: `**CSM (Contractual Service Margin / Sözleşmeye Bağlı Hizmet Marjı)**, IFRS 17 (Türkiye'de TFRS 17) kapsamında bir sigorta sözleşmeleri grubunun **gelecekte kazanılacak kârının** ilk muhasebeleştirme anındaki bugünkü değeridir.

Eski TFRS 4'te prim, alındığı anda büyük oranda gelir yazılırken, IFRS 17'de durum farklıdır:

- İlk gün **kâr yazılmaz**; bunun yerine **CSM** bilançoda pasifte (LRC bileşeni içinde) tutulur.
- Şirket sözleşme süresi boyunca **hizmet birimi (coverage units)** ürettikçe, CSM her dönem **sigortacılık geliri** olarak P&L'a aktarılır.
- Tahminler güncellendiğinde (faiz dışı varsayımlar) CSM **yukarı/aşağı kaydırılır** (CSM unlocking).
- Eğer grup **kayıplıysa (onerous)**, CSM = 0; tüm beklenen kayıp anında P&L'a yansır.

CSM, IFRS 17'nin "kâr ne zaman okunur?" sorusuna verdiği yapısal cevaptır.`,
    whyImportant: `CSM, IFRS 17 mali tablosunun en stratejik kalemidir. Yatırımcılar ve analistler için **gelecek dönem kârının görünür stoğu** anlamına gelir.

- **Yüksek CSM:** Kuvvetli bir kâr biriktirme; gelecek dönemlerde sigortacılık geliri istikrarlı görünür.
- **Düşen CSM (sürekli):** Yeni iş azalıyor olabilir veya unlocking nedeniyle eriyor.
- **CSM unlocking (aşağı):** Risk varsayımları kötüleşti; yönetim açıklaması beklenir.
- **CSM = 0 (onerous):** Grup kayıplı; tüm beklenen kayıp anında gelir tablosuna düşer.

Yönetim kurulu sunumlarında **yeni iş CSM'i** ve **CSM hareket tablosu (roll-forward)** standart slayttır.`,
    formulas: [
      {
        label: "CSM Hareket (Roll-forward)",
        formula:
          "Kapanış CSM = Açılış CSM + Yeni İş CSM + Faiz Tahakkuku ± Estimate Değişimi (Unlocking) − Cari Dönem İtfa",
        explanation:
          "Her dönem CSM için yapılan standart hareket tablosu. İtfa kısmı sigortacılık gelirine aktarılır.",
      },
      {
        label: "Faiz Tahakkuku",
        formula: "Faiz = Açılış CSM × İlk muhasebeleştirme iskonto oranı",
        explanation:
          "İlk gün belirlenen iskonto oranı (locked-in rate) kullanılır; piyasa değişimi P&L değil OCI tarafına gider.",
      },
      {
        label: "İtfa (Coverage Units)",
        formula: "İtfa = Kapanış (öncesi) CSM × (Cari dönem hizmet birimi / Toplam beklenen hizmet birimi)",
        explanation:
          "Hizmet birimi tanımı (poliçe sayısı, sigorta bedeli, gün sayısı vb.) IFRS 17 politika seçimidir.",
      },
    ],
    steps: [
      "Sözleşme grubunu IFRS 17 kohort kurallarına göre belirleyin (yıllık + kâr profiline göre).",
      "İlk muhasebeleştirmede beklenen nakit akışı (BEL) + iskonto + RA hesaplayın.",
      "Eğer net pozitif ise CSM açılır; net negatif ise grup onerous → CSM = 0, kayıp anında gelire düşer.",
      "Her dönem: faiz tahakkuku ekle, varsayım değişimini (unlocking) yansıt, hizmet birimine göre itfa et.",
      "Kapanış CSM bilançoda LRC içinde gösterilir; itfa edilen kısım sigortacılık gelirine aktarılır.",
      "Hareket tablosunu dipnotlarda satır bazında açıklayın.",
    ],
    examples: [
      {
        title: "Basit yıllık CSM hareketi (hayali)",
        data: {
          "Açılış CSM": "1.000.000 ₺",
          "Yeni iş CSM": "300.000 ₺",
          "Faiz (%5)": "50.000 ₺",
          "Unlocking (+/-)": "-80.000 ₺",
          "Cari dönem itfa": "260.000 ₺",
        },
        result: "Kapanış CSM ≈ 1.010.000 ₺ | Sigortacılık geliri (CSM payı) ≈ 260.000 ₺",
        explanation:
          "Faiz CSM'i büyütür, unlocking küçültür, itfa hem CSM'i azaltır hem de cari dönem gelirine aktarılır.",
      },
    ],
    excelTips: [
      {
        title: "Roll-forward satırı",
        formula: "=Acilis+YeniIs+Faiz+Unlocking-Itfa",
        description: "Her dönem için açılış–kapanış mutabakatı; bilançoda LRC'ye bağlanmalı.",
      },
      {
        title: "İtfa katsayısı",
        formula: "=DonemBirim/ToplamBeklenenBirim",
        description: "Coverage unit oranı; her dönem yeniden hesaplanabilir (politika kararına bağlı).",
      },
    ],
    interpretation: [
      { range: "CSM artıyor", meaning: "Yeni iş güçlü; gelecek kâr stoğu büyüyor." },
      { range: "CSM yatay", meaning: "Yeni iş, faiz ve itfa dengeli; portföy olgun." },
      { range: "CSM hızla düşüyor", meaning: "Yeni iş eriyor veya kötü unlocking; nedeni dipnotta açıklanmalı." },
      { range: "CSM = 0 (onerous grup)", meaning: "Grup kayıplı; beklenen kayıp anında P&L'a yansıdı." },
    ],
    tips: [
      "İskonto oranı **ilk muhasebeleştirme**de sabitlenir (locked-in); cari piyasa hareketleri OCI tarafına gider.",
      "Coverage unit tanımı kritik politika seçimidir; bir kez seçilince tutarlı uygulanmalı.",
      "Onerous grup tespit edilince beklenen kayıp **hemen** gelire yansır — bu IFRS 4'e göre büyük fark.",
      "CSM yalnızca GMM (BBA) ve VFA modelinde tutulur; PAA'da ayrı CSM yoktur.",
    ],
    relatedSlugs: ["ifrs17-gmm", "ifrs17-lrc", "ifrs17-ra", "ifrs17-paa"],
    calculatorType: "ifrs17-csm",
  },

  {
    slug: "ifrs17-ra",
    name: "RA (Risk Ayarlaması)",
    nameEn: "Risk Adjustment for Non-Financial Risk",
    category: "ifrs-metrikleri",
    icon: "🎯",
    summary:
      "Şirketin finansal olmayan risk (sigortacılık riski) almak için talep ettiği tazminatın bilançodaki karşılığıdır. Genellikle %70-85 güven düzeyi (quantile) veya sermaye maliyeti yöntemi ile hesaplanır.",
    whatIs: `**RA (Risk Adjustment / Risk Ayarlaması)**, sigorta yükümlülüklerinin tahmininde **finansal olmayan risk belirsizliği** için ayrılan ek karşılıktır. Yani şirketin "bu beklenen nakit akışını üstlenmek için kâr beklentisinin **yanı sıra** ne kadar bir tampon istiyorum?" sorusunun cevabıdır.

IFRS 17, hesaplama yöntemini **kuralcı şekilde dayatmaz**. Pratikte iki yaklaşım yaygındır:

1. **Quantile / Confidence Level (yüzdelik) yöntemi:** Beklenen ortalama nakit akışının üzerinde belirli bir güven düzeyine (ör. %75) kadar tampon ayrılır. Açıklamada **denk gelen güven düzeyi** zorunlu olarak yazılır.
2. **Cost of Capital (CoC) yöntemi:** Risk taşıma süresinde gerekli sermayenin maliyeti hesaplanır.

RA, **bilançoda LIC ve (GMM altında) LRC'nin içinde** yer alır. Risk azaldıkça (örneğin hasarlar sonuçlandıkça) RA serbest bırakılır → sigortacılık geliri olarak gelire döner.`,
    whyImportant: `RA, IFRS 17'nin "ihtiyatlılık" sinyalidir. Dipnotta verilen güven düzeyi, **şirketler arası karşılaştırma** için en önemli tek sayıdır.

- **Yüksek RA / yüksek güven düzeyi (örn. %85+):** Daha ihtiyatlı; CSM görece küçük, ileriki gelir tablosunda RA serbest bırakım kalemi büyük.
- **Düşük RA / düşük güven düzeyi (örn. %70):** Daha az ihtiyatlı; ilk anda CSM görece büyük.
- Şirketler arası karşılaştırmada **mutlak RA tutarı yerine güven düzeyi** anlamlıdır.

Aktüer çalışması ve RA politikası, IFRS 17 denetimlerinde en sık sorgulanan konulardan biridir.`,
    formulas: [
      {
        label: "Basit Quantile (Normal yaklaşım)",
        formula: "RA ≈ Z(γ) × σ(toplam hasar)",
        explanation:
          "γ güven düzeyi için standart normal Z değeri (ör. %75 → ~0,674; %85 → ~1,036). σ ise toplam hasar tahmininin standart sapmasıdır. Eğitim amaçlı yaklaşıktır; gerçekte aktüer modeli kullanılır.",
      },
      {
        label: "Cost of Capital (CoC) yaklaşımı",
        formula: "RA = Σ_t [ Sermaye_t × CoC oranı / (1 + r)^t ]",
        explanation:
          "Risk taşıma süresinde gerekli sermayenin maliyetinin iskontolu toplamı. Solvency II'den ödünç alınan klasik yaklaşımdır.",
      },
    ],
    steps: [
      "RA yöntemini ve güven düzeyini şirket politikası olarak yazılı hale getirin.",
      "Hasar/kayıp dağılımının makul bir tahminini (en az ortalama + standart sapma veya simülasyon) çıkarın.",
      "Quantile yöntemi için Z(γ) × σ ile başlangıç tampon hesaplayın; daha sofistike modeli aktüer yapsın.",
      "RA'yı LIC ve (GMM ise) LRC'ye dağıtın; yıl içi serbest bırakım planını çıkarın.",
      "Dipnotta hangi güven düzeyine denk geldiğini açıklayın — IFRS 17 zorunluluğudur.",
    ],
    examples: [
      {
        title: "Hayali bir branşta yaklaşık RA (eğitim amaçlı)",
        data: {
          "Beklenen toplam hasar": "10.000.000 ₺",
          "Standart sapma (σ)": "1.500.000 ₺",
          "Güven düzeyi": "%75 (Z ≈ 0,674)",
        },
        result: "RA ≈ 0,674 × 1.500.000 ≈ 1.011.000 ₺",
        explanation:
          "Toplam yükümlülük tahmini ≈ 10 mn + 1,01 mn RA. Dipnota \"%75 güven düzeyi\" yazılır. Gerçek modelde aktüer Solvency II veya stokastik simülasyon kullanır.",
      },
    ],
    excelTips: [
      {
        title: "Z değerleri (yaklaşık)",
        formula: "%70 → 0,524 | %75 → 0,674 | %80 → 0,842 | %85 → 1,036 | %90 → 1,282",
        description: "Standart normal kuyruğun pratik referansı; eğitim için kullanın.",
      },
      {
        title: "Excel'de NORMSTERS",
        formula: "=NORMSTERS(GuvenDuzeyi)",
        description: "Verilen olasılık için Z değerini döndürür (Türkçe Excel: NORMSTERS, İngilizce: NORM.S.INV).",
      },
    ],
    interpretation: [
      { range: "Güven düzeyi ≥ %85", meaning: "İhtiyatlı; CSM küçük, RA serbest bırakım geliri zamana yayılır." },
      { range: "Güven düzeyi %75 civarı", meaning: "Sektörde sık görülen seviye; yorum yapılırken karşılaştırma kolay." },
      { range: "Güven düzeyi < %70", meaning: "Düşük; denetçi ve regülatör soracaktır — gerekçe net olmalı." },
    ],
    tips: [
      "Mutlak RA tutarı **karşılaştırma için yetmez**; mutlaka güven düzeyi ile birlikte değerlendirin.",
      "RA yöntemi yıllar arasında değiştirilmemelidir; değişirse açıklama zorunlu.",
      "RA'nın LIC kısmı zaman içinde hızlı erir; LRC'deki RA hizmet süresine yayılır.",
      "Quantile ile CoC arasındaki seçim, sermaye yükü ve raporlama anlatısını ciddi şekilde etkiler.",
    ],
    relatedSlugs: ["ifrs17-csm", "ifrs17-lic", "ifrs17-gmm", "muallak-hasar-karsiligi"],
    calculatorType: "ifrs17-ra",
  },

  {
    slug: "ifrs17-paa",
    name: "PAA (Basitleştirilmiş Yaklaşım)",
    nameEn: "Premium Allocation Approach",
    category: "ifrs-metrikleri",
    icon: "⚡",
    summary:
      "IFRS 17'nin kısa vadeli sözleşmeler için izin verdiği basitleştirilmiş ölçüm yaklaşımıdır. LRC, kazanılmamış prim mantığıyla hesaplanır; LIC için tam IFRS 17 (iskonto + RA) uygulanır.",
    whatIs: `**PAA (Premium Allocation Approach / Basitleştirilmiş Yaklaşım)**, IFRS 17'nin **kısa vadeli sigorta sözleşmeleri** için sunduğu sadeleştirilmiş ölçüm modelidir. Trafik, kasko, sağlık, yangın gibi yıllık veya daha kısa süreli ürünlerde sıkça kullanılır.

**Uygulama şartı:**

- Sözleşme süresi ≤ **1 yıl**, **veya**
- Şirket, PAA sonucunun **GMM'e (BBA) makul ölçüde yakın** olacağını gösterebiliyorsa.

**Mantığı çok benzer KPK gibidir:**

- **LRC (Kalan Kapsam Yükümlülüğü)** → Tahsil edilen prim − kazanılan kısım (− iskontolu acquisition cost ayarlaması).
- **LIC (Oluşmuş Hasarlar Yükümlülüğü)** → Tam IFRS 17 mantığı (BEL + iskonto + RA) uygulanır. **PAA, LIC'i basitleştirmez**.

PAA altında **CSM tutulmaz**; kâr, prim kazanıldıkça gelir tablosuna yansır.`,
    whyImportant: `Türkiye'de hayat dışı sigorta portföyünün büyük kısmı (trafik, kasko, sağlık) yıllık olduğu için, çoğu şirket için **uygulamada IFRS 17 ölçümü = PAA + LIC için tam IFRS 17** demektir.

- PAA, **operasyonel yük**: tek tek nakit akışı + iskonto + CSM yapma yükünü ortadan kaldırır.
- KPK ile mantıksal olarak çok yakındır; eski raporlama altyapısı PAA için **görece kolay uyarlanır**.
- LIC tarafında ise **iskonto + RA** dahil olduğu için eski "muallak hasar karşılığı" sayısından farklı çıkar.

PAA seçimi politika kararıdır; uygunluk testleri ve dipnot açıklaması her dönem yapılır.`,
    formulas: [
      {
        label: "LRC (PAA — basit)",
        formula:
          "LRC = Tahsil Edilen Prim − Kazanılan Prim − İskontolu Acquisition Cost (politika seçimine göre)",
        explanation:
          "Kazanılan prim genelde gün sayısı oranıyla hesaplanır (KPK ile aynı mantık). Acquisition cost'u P&L'a yayma seçeneği vardır.",
      },
      {
        label: "Kazanılan Kısım",
        formula: "Kazanılan = Toplam Prim × (Geçen Gün ÷ Toplam Vade)",
        explanation: "Klasik gün-bazlı dağılım; KPK'nın aynası.",
      },
      {
        label: "LIC (PAA altında bile tam IFRS 17)",
        formula: "LIC = BEL (Best Estimate) + İskonto Etkisi + RA",
        explanation:
          "PAA, LIC için bir kolaylık sağlamaz; aktüer hesabı yapılır.",
      },
    ],
    steps: [
      "Sözleşme grubunun PAA uygunluğunu kontrol edin (≤ 1 yıl, veya GMM'e yakınlık testi).",
      "Yazılan prim, tahsilat ve acquisition cost kalemlerini grup bazında izleyin.",
      "Her dönem: kazanılan prim → sigortacılık geliri; kalan prim → LRC.",
      "LIC için ayrı aktüer modeli ile BEL + iskonto + RA hesaplayın.",
      "Toplam yükümlülük = LRC + LIC olarak bilançoya yansıtın.",
      "Dipnotta PAA seçimi ve uygunluk gerekçesini yazın.",
    ],
    examples: [
      {
        title: "1 yıllık trafik poliçesi — 100. gün",
        data: {
          "Tahsil edilen prim": "3.650 ₺",
          "Geçen gün": "100",
          "Toplam vade": "365 gün",
        },
        result: "Kazanılan ≈ 1.000 ₺ (gelir) | LRC ≈ 2.650 ₺ (pasif)",
        explanation:
          "PAA'da bu hesap KPK ile birebir aynı sonuç verir; fark, dipnot anlatısı ve acquisition cost politikasında.",
      },
    ],
    excelTips: [
      {
        title: "PAA LRC satırı",
        formula: "=ToplamPrim*(1-(MIN(GunSayisi;Vade)/Vade))",
        description: "Her poliçe satırı için kalan kapsam yükümlülüğü; KPK ile aynı mantık.",
      },
      {
        title: "Kazanılan prim (sigortacılık geliri)",
        formula: "=ToplamPrim*(GunSayisi/Vade)",
        description: "Gün bazlı kazanım — politika tek seferse buradan gelir tablosuna aktarılır.",
      },
    ],
    interpretation: [
      { range: "LRC ↑", meaning: "Yeni iş yoğun veya uzun vadeli ağırlık; gelir gelecek dönemlere ertelenir." },
      { range: "LRC ↓", meaning: "Portföy yaşlanıyor veya yeni iş yavaş; gelir hızlı kazanılıyor." },
      { range: "LIC ↑", meaning: "Hasarlar arttı veya RA yukarı revize; teknik baskı işareti." },
    ],
    tips: [
      "PAA seçilse bile **LIC için tam IFRS 17 (iskonto + RA)** zorunludur — bu en sık atlanan noktadır.",
      "Acquisition cost'u dönem boyunca yayma vs. gider yazma seçimi politika tutarlılığı gerektirir.",
      "GMM'e yakınlık testi düzenli yapılmalı; portföy yapısı değişirse PAA uygunluğu yeniden değerlendirilmeli.",
      "KPK ile PAA LRC sayıları yakın çıkar ama **mevzuat altyapısı ve dipnotlar farklıdır**.",
    ],
    relatedSlugs: ["ifrs17-lrc", "ifrs17-lic", "kazanilmamis-prim-karsiligi", "ifrs17-gmm"],
    calculatorType: "ifrs17-paa",
  },

  {
    slug: "ifrs17-lic",
    name: "LIC (Oluşmuş Hasarlar Yükümlülüğü)",
    nameEn: "Liability for Incurred Claims",
    category: "ifrs-metrikleri",
    icon: "🧾",
    summary:
      "IFRS 17 bilançosunda bilanço tarihinde oluşmuş ama henüz tamamı ödenmemiş hasarlar için tutulan yükümlülüktür. BEL + iskonto + RA bileşenlerini içerir; eski 'muallak hasar karşılığı'nın IFRS 17 karşılığıdır.",
    whatIs: `**LIC (Liability for Incurred Claims / Oluşmuş Hasarlar Yükümlülüğü)**, bilanço tarihine kadar **gerçekleşmiş ama henüz tamamı ödenmemiş** hasarlar için ayrılan IFRS 17 yükümlülüğüdür.

Eski TFRS 4 dünyasındaki "muallak hasar karşılığı"nın IFRS 17 karşılığıdır, ama daha kapsamlıdır:

- **BEL (Best Estimate of Liability):** Beklenen tüm gelecekteki hasar ödemelerinin olasılık ağırlıklı tahmini. Raporlanmış (RBNS) + raporlanmamış (IBNR) + masraf tahsisleri (ALAE/ULAE).
- **İskonto etkisi:** Beklenen ödeme tarihlerine göre nakit akışları **bugüne indirgenir**. (Eski sistemde yoktu — bu büyük fark.)
- **RA (Risk Adjustment):** Finansal olmayan risk için ek tampon.

**LIC = BEL (iskontolu) + RA**

Bu sayfa **bilgi sayfasıdır** — gerçek LIC tutarı, aktüer modeli ve hasar dosyası bazlı sistem çıktısıyla hesaplanır.`,
    whyImportant: `LIC, sigortacılık şirketinin **gerçekten ne kadar hasar ödemekle yükümlü olduğunu** gösterir. IFRS 17 ile gelen iskonto ve RA, eski muallaktan **farklı bir sayı** üretir.

- **İskonto, LIC'i küçültür** (beklenen ödeme uzun vadeli ise belirgin etki).
- **RA, LIC'i büyütür** (ihtiyatlılık tamponu).
- **IBNR tahmin yöntemi** (zincir merdiveni, Bornhuetter-Ferguson, Cape Cod vb.) sonuca büyük etki eder.

LIC değişimi, gelir tablosunda **sigortacılık hizmet gideri** ve **finans gideri** olarak ayrışır — bu ayrım analist okumasında kritiktir.`,
    formulas: [
      {
        label: "LIC genel ifade",
        formula: "LIC = BEL (iskontolu nakit akışları) + RA",
        explanation:
          "BEL = beklenen tüm hasar + masraf nakit akışlarının iskontolu toplamı; RA finansal olmayan risk tamponu.",
      },
      {
        label: "Eski muallak ile köprü",
        formula: "LIC ≈ (Eski Muallak — undiscounted) − İskonto Etkisi + RA",
        explanation:
          "Eski TFRS 4 muallak rakamından IFRS 17 LIC'e geçişin kavramsal yorumu (gerçek geçiş daha komplikedir).",
      },
    ],
    steps: [
      "Hasar dosyalarını dönem ve branş bazında çekin (RBNS).",
      "Aktüer ile IBNR + ALAE/ULAE dahil **toplam beklenen hasar nakit akışını** kurun.",
      "Beklenen ödeme zamanlamasını çıkarın ve uygun iskonto eğrisi ile bugüne indirgeyin.",
      "RA'yı (politika yöntemi) LIC'e dağıtın.",
      "Bilançoya LIC olarak yansıtın; hareket tablosunu (açılış / yeni hasar / ödeme / revizyon / iskonto unwind) dipnotta açıklayın.",
    ],
    examples: [
      {
        title: "Kavramsal hayali örnek",
        data: {
          "Eski muallak (undiscounted)": "10.000.000 ₺",
          "İskonto etkisi": "− 400.000 ₺",
          RA: "+ 700.000 ₺",
        },
        result: "LIC ≈ 10.300.000 ₺",
        explanation:
          "İskonto LIC'i küçültür, RA büyütür. Net etki portföy süresine ve risk dağılımına bağlıdır. Sayı tamamen eğitim amaçlıdır.",
      },
    ],
    excelTips: [
      {
        title: "Hasar hareket tablosu (rapor satırı)",
        formula: "=Acilis+YeniHasar-Odeme+Revizyon+IskontoUnwind+RAHareket",
        description: "Dipnotta LIC roll-forward için temel iskelet.",
      },
    ],
    interpretation: [
      { range: "LIC artıyor", meaning: "Yeni dönem hasarları yüksek veya RA yukarı revize edildi." },
      { range: "LIC azalıyor", meaning: "Hasar ödemeleri hızlandı veya iskonto / yöntem revizyonu olumlu." },
      { range: "Hareket tablosunda 'iskonto unwind' büyük", meaning: "Portföy uzun vadeli; her dönem otomatik finansal gider doğar." },
    ],
    tips: [
      "PAA seçilmiş olsa bile LIC için **tam IFRS 17 (iskonto + RA)** zorunludur.",
      "İskonto eğrisi seçimi (top-down vs. bottom-up) politikadır ve denetim sorgular.",
      "Hareket tablosunda **operasyonel etki** (yeni hasar, revizyon) ile **finansal etki** (iskonto unwind, oran değişimi) ayrıştırılmalıdır.",
      "Eski muallak rakamı ile LIC arasında köprü tablosu, iç kontrol için faydalıdır.",
    ],
    relatedSlugs: ["muallak-hasar-karsiligi", "ifrs17-ra", "ifrs17-paa", "ifrs17-gmm"],
    calculatorType: "ifrs17-lic",
  },

  {
    slug: "ifrs17-lrc",
    name: "LRC (Kalan Kapsam Yükümlülüğü)",
    nameEn: "Liability for Remaining Coverage",
    category: "ifrs-metrikleri",
    icon: "📦",
    summary:
      "IFRS 17 bilançosunda kalan poliçe süresi için sözleşmeyi sürdürme yükümlülüğüdür. PAA altında KPK benzeri; GMM altında BEL + iskonto + RA + CSM bileşenlerini içerir.",
    whatIs: `**LRC (Liability for Remaining Coverage / Kalan Kapsam Yükümlülüğü)**, sigorta sözleşmesinin **henüz hizmet verilmemiş** bölümüne karşılık gelen IFRS 17 yükümlülüğüdür. Yani "müşteriye verilmesi gereken kalan kapsam".

LRC'nin içeriği uygulanan modele göre **çok farklı** görünür:

**PAA altında (basit):**

- LRC = Tahsil edilen prim − Kazanılan prim − İskontolu acquisition cost (politikaya göre)
- KPK ile mantıksal olarak çok yakın.

**GMM (BBA) altında (tam):**

- LRC = BEL (gelecek nakit akışı, iskontolu) + RA + CSM
- CSM, gelecekteki kazanılmamış kâr olarak burada tutulur.

Bu sayfa **kavram ve raporlama bilgi sayfasıdır**; tutar, sistem ve aktüer çıktısı ile oluşur.`,
    whyImportant: `LRC, IFRS 17 bilançosunda **gelecek dönem gelirinin stoğu** anlamına gelir. CSM açılışı LRC içinde olduğu için yatırımcı analizinde merkezi rol oynar.

- **PAA LRC** anlamlı, ama KPK'ya çok benzer; anlatı farkı **iskonto + acquisition cost politikasında** ortaya çıkar.
- **GMM LRC** içindeki CSM, gelecek kâr stoğu sinyali olarak okunur.
- LRC azalışı = sigortacılık geliri kazanımı; LRC yükselişi = yeni iş veya unlocking.

LRC hareket tablosu, IFRS 17 dipnotlarının **en görünür** parçasıdır.`,
    formulas: [
      {
        label: "PAA LRC",
        formula: "LRC (PAA) = Tahsil Edilen Prim − Kazanılan Prim ± Acquisition Cost Ayarlaması",
        explanation: "KPK ile aynı mantık; politika farkları küçük ama dipnot anlatısı ayrı.",
      },
      {
        label: "GMM LRC",
        formula: "LRC (GMM) = BEL (gelecek, iskontolu) + RA + CSM",
        explanation:
          "Tam model: nakit akışı + iskonto + risk + CSM. Her bileşen ayrı hareket tablosunda izlenir.",
      },
    ],
    steps: [
      "Grubu doğru modele atayın (PAA mı GMM mi).",
      "PAA'da: tahsilat, kazanılan kısım ve acquisition cost akışı ile LRC'yi izleyin.",
      "GMM'de: BEL (gelecek nakit akışı + iskonto) + RA + CSM ayrı ayrı tutulur.",
      "Her dönem LRC roll-forward'ı: açılış → yeni iş → faiz → unlocking → hizmet (gelir tarafı) → kapanış.",
      "Dipnotta LRC'yi alt bileşenlere ayrıştırarak gösterin.",
    ],
    examples: [
      {
        title: "PAA LRC — kısa örnek",
        data: { "Tahsil prim": "3.650 ₺", "Kazanılan (100/365)": "1.000 ₺" },
        result: "LRC (PAA) ≈ 2.650 ₺",
        explanation: "KPK ile aynı sayı; fark dipnot ve politika tarafında.",
      },
      {
        title: "GMM LRC — kavramsal",
        data: { BEL: "5.000.000 ₺", RA: "300.000 ₺", CSM: "1.200.000 ₺" },
        result: "LRC (GMM) ≈ 6.500.000 ₺",
        explanation:
          "Üç bileşen toplamı LRC'yi verir; her biri ayrı hareket tablosunda izlenir.",
      },
    ],
    excelTips: [
      {
        title: "PAA LRC satırı",
        formula: "=ToplamPrim-KazanilanPrim-AcquisitionAyarlamasi",
        description: "Eski KPK altyapısı küçük güncellemeyle yeniden kullanılabilir.",
      },
      {
        title: "GMM LRC satırı",
        formula: "=BEL_Gelecek+RA+CSM",
        description: "Üç bileşeni ayrı sütunda tutmak hareket tablosunu çok kolaylaştırır.",
      },
    ],
    interpretation: [
      { range: "PAA LRC ≈ KPK", meaning: "Beklenen durum; geçişin doğru yapıldığının işareti." },
      { range: "GMM LRC içinde CSM büyük", meaning: "Sağlıklı gelecek kâr stoğu." },
      { range: "GMM LRC içinde CSM = 0", meaning: "Onerous grup; kayıp anında P&L'a yansımış." },
      { range: "LRC hızla eriyor", meaning: "Yeni iş üretimi yetersiz veya portföy yaşlanıyor." },
    ],
    tips: [
      "PAA LRC için KPK altyapısı %80 hazırdır — köprü tablosu mutlaka kurulmalı.",
      "GMM LRC'de CSM ayrı bilanço alt kalemi gibi düşünülmeli; hareketleri ayrı izleyin.",
      "LRC azalışı (servis kazanımı) sigortacılık gelirinin kaynağıdır — gelir tablosu açıklamasında bu bağ kurulmalı.",
      "Acquisition cost politika seçimi PAA LRC üzerinde belirgin etki yapar.",
    ],
    relatedSlugs: ["ifrs17-paa", "ifrs17-csm", "kazanilmamis-prim-karsiligi", "ifrs17-gmm"],
    calculatorType: "ifrs17-lrc",
  },

  {
    slug: "ifrs17-gmm",
    name: "GMM (Genel Ölçüm Modeli)",
    nameEn: "General Measurement Model (Building Block Approach)",
    category: "ifrs-metrikleri",
    icon: "🏗️",
    summary:
      "IFRS 17'nin tüm gruplara uygulanabilen tam ölçüm modeli. Building Block Approach (BBA) olarak da bilinir: BEL + iskonto + RA + CSM bileşenleriyle hem LIC hem LRC oluşur.",
    whatIs: `**GMM (General Measurement Model / Genel Ölçüm Modeli)**, IFRS 17'nin **temel ve genel** ölçüm yaklaşımıdır. **BBA (Building Block Approach)** olarak da anılır.

Dört "yapı taşı" üzerine kurulur:

1. **Future Cash Flows (BEL):** Gelecekteki tüm nakit akışlarının (prim girişleri, hasar, masraf) olasılık ağırlıklı tahmini.
2. **İskonto (Discount):** Bu nakit akışlarının para zaman değeri ile bugüne indirgenmesi.
3. **RA (Risk Adjustment):** Finansal olmayan risk için tampon.
4. **CSM (Contractual Service Margin):** Gelecekte kazanılacak kâr stoğu (onerous grupta CSM = 0, kayıp hemen P&L'a).

GMM, **uzun vadeli sözleşmeler** (hayat, emeklilik, uzun vadeli sağlık, anüite) ve PAA'ya uygun olmayan tüm gruplar için zorunludur.

Bu sayfa **kavram ve mali tablo etkisi bilgi sayfasıdır**; gerçek hesaplama aktüer modeli, sistem altyapısı ve denetlenmiş varsayımlarla yapılır.`,
    whyImportant: `GMM, IFRS 17'nin **felsefi merkezini** temsil eder. PAA bir kolaylıktır; GMM ise standardın asıl mimarisidir.

- Mali tablo şeffaflığını artırır: kâr nereden geldi (sigorta servisi mi, finansal etki mi) açıkça görülür.
- CSM ve RA ayrımı sayesinde **kâr profili sigorta süresine yayılır** — ilk yıl prim, son yıl bumeranglıkla kâr çıkması ortadan kalkar.
- Uzun vadeli portföy taşıyan sigortacılar için **bilanço dönüşümü PAA'ya göre çok daha derin**.

Yatırımcılar GMM altında bir şirketi okurken **CSM hareketi + RA serbest bırakım + finansal etki** üçlüsünü ayrı ayrı izler.`,
    formulas: [
      {
        label: "GMM yükümlülük yapısı",
        formula: "Yükümlülük = LRC (BEL_gelecek + RA + CSM) + LIC (BEL_olusmus + RA)",
        explanation:
          "Her grup için bilanço pasifinde iki yükümlülük: kalan kapsam (LRC) ve oluşmuş hasar (LIC).",
      },
      {
        label: "Sigortacılık geliri (özet)",
        formula:
          "Sigortacılık Geliri = CSM İtfa + RA Serbest Bırakım + Beklenen Hasar / Masraf + Acquisition Geri Kazanım",
        explanation:
          "Bu tanım, eski 'kazanılmış prim' satırından çok farklı; gelir parçalanır ve şeffaf hale gelir.",
      },
    ],
    steps: [
      "Sözleşme grubunu kohort kurallarına göre oluşturun (yıl + kâr profili).",
      "Beklenen nakit akışı (BEL) modelini kurun.",
      "İskonto eğrisini seçin (top-down veya bottom-up); ilk gün için locked-in oran sabitlenir.",
      "RA yöntemini ve güven düzeyini belirleyin.",
      "Net pozitif: CSM açılır; net negatif: onerous → kayıp hemen P&L'a, CSM = 0.",
      "Her dönem: faiz tahakkuku, unlocking, RA hareketleri ve CSM itfasını roll-forward ile yansıtın.",
      "Mali tablo ve dipnot setini IFRS 17 zorunluluklarına göre üretin.",
    ],
    examples: [
      {
        title: "GMM bilanço görünümü (kavramsal)",
        data: {
          "BEL (gelecek, iskontolu)": "8.000.000 ₺",
          RA: "500.000 ₺",
          CSM: "1.500.000 ₺",
          "BEL (oluşmuş, iskontolu)": "3.000.000 ₺",
          "RA (LIC içinde)": "200.000 ₺",
        },
        result: "LRC ≈ 10.000.000 ₺ | LIC ≈ 3.200.000 ₺ | Toplam yükümlülük ≈ 13.200.000 ₺",
        explanation:
          "Bilanço pasifi LRC + LIC olarak gösterilir. Dipnotta her bileşen (BEL, RA, CSM) ayrı satırda yer alır.",
      },
    ],
    excelTips: [
      {
        title: "Gruba özel building blocks",
        formula: "BEL_F | İskonto | RA | CSM | BEL_O | RA(LIC)",
        description: "Her sözleşme grubu için bu altı sütun, tüm hareket tablosunun temelidir.",
      },
      {
        title: "Gelir dağılımı",
        formula: "Gelir = CSMItfa + RAReleased + BeklenenHasarMasraf + AcquisitionGeriKazanim",
        description: "P&L tarafına yansıyan sigortacılık geliri; her bileşen ayrı sütunda izlenmeli.",
      },
    ],
    interpretation: [
      { range: "GMM uygulanan portföy büyük", meaning: "Şirket uzun vadeli iş ağırlıklı (hayat, emeklilik, anüite)." },
      { range: "CSM stoğu büyüyor", meaning: "Yeni iş kuvvetli; gelecek kâr potansiyeli yüksek." },
      { range: "Onerous grup oranı yüksek", meaning: "Fiyatlama veya hasar varsayımları sorunlu — derhal aksiyon gerekir." },
      { range: "OCI tarafında büyük finansal hareket", meaning: "Faiz/iskonto oranı dalgalanmaları yansıyor." },
    ],
    tips: [
      "Locked-in iskonto oranı vs. cari oran ayrımı, OCI vs. P&L bölünmesinin kalbidir.",
      "Coverage unit politikası (CSM itfasını belirler) net yazılmalı; denetim sorgular.",
      "Onerous grup tespiti **her dönem** yapılır; ihmal ciddi mali tablo riski doğurur.",
      "GMM altyapısı PAA'ya göre çok daha sistem yoğundur — Excel sadece raporlama / mutabakat amaçlı kullanılmalıdır.",
    ],
    relatedSlugs: ["ifrs17-csm", "ifrs17-ra", "ifrs17-lrc", "ifrs17-lic", "ifrs17-paa"],
    calculatorType: "ifrs17-gmm",
  },
];

/* ─── Yardımcı fonksiyonlar ─── */

export function getMetricBySlug(slug: string): MetricDef | undefined {
  return metrics.find((m) => m.slug === slug);
}

export function getRelatedMetrics(slug: string): MetricDef[] {
  const metric = getMetricBySlug(slug);
  if (!metric) return [];
  return metric.relatedSlugs
    .map((s) => getMetricBySlug(s))
    .filter((m): m is MetricDef => m !== undefined);
}
