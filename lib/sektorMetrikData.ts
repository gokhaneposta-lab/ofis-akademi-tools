export type MetricCategory = "teknik-sigortacilik" | "finansal-oranlar" | "operasyonel";

export const metricCategoryLabels: Record<MetricCategory, string> = {
  "teknik-sigortacilik": "Teknik Sigortacılık (UW)",
  "finansal-oranlar": "Finansal Oranlar",
  operasyonel: "Operasyonel Metrikler",
};

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
    relatedSlugs: ["kazanilmis-prim", "yenileme-orani"],
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
    relatedSlugs: ["hasar-prim-orani", "yenileme-orani"],
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
    relatedSlugs: ["hasar-prim-orani", "kazanilmis-prim"],
    calculatorType: "yenileme-orani",
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
