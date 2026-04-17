export type FormulaCategory =
  | "arama"
  | "mantik"
  | "toplama-sayma"
  | "metin"
  | "tarih"
  | "matematik"
  | "istatistik"
  | "dinamik-dizi"
  | "bilgi";

export const categoryLabels: Record<FormulaCategory, string> = {
  arama: "Arama & Getirme",
  mantik: "Mantık & Karar",
  "toplama-sayma": "Toplama & Sayma",
  metin: "Metin İşleme",
  tarih: "Tarih & Saat",
  matematik: "Matematik & Yuvarlama",
  istatistik: "İstatistik",
  "dinamik-dizi": "Dinamik Dizi",
  bilgi: "Bilgi & Hata Yönetimi",
};

export type FormulaParam = { name: string; description: string };

export type FormulaExample = {
  scenario: string;
  formula: string;
  result: string;
};

export type FormulaDef = {
  slug: string;
  name: string;
  nameEn: string;
  category: FormulaCategory;
  summary: string;
  syntax: string;
  params: FormulaParam[];
  steps: string[];
  examples: FormulaExample[];
  tips: string[];
  relatedSlugs: string[];
  /** Link to education page */
  guideHref?: string;
  guideName?: string;
  /** Link to blog post */
  blogHref?: string;
  blogName?: string;
  /** Link to tool page */
  toolHref?: string;
  toolName?: string;
  /** SEO override: başlık (yoksa varsayılan generateMetadata kullanılır) */
  seoTitle?: string;
  /** SEO override: meta description (yoksa summary kullanılır) */
  seoDescription?: string;
  /** SEO override: anahtar kelimeler */
  seoKeywords?: string[];
};

export const formulas: FormulaDef[] = [
  /* ═══════════════════════════════════════════
     ARAMA & GETİRME
     ═══════════════════════════════════════════ */
  {
    slug: "duseyara",
    name: "DÜŞEYARA",
    nameEn: "VLOOKUP",
    category: "arama",
    summary: "Bir tablonun ilk sütununda değer arar ve aynı satırdaki başka bir sütundan sonuç getirir. Excel'in en bilinen arama fonksiyonudur.",
    syntax: "=DÜŞEYARA(aranan_değer; tablo_aralığı; sütun_indisi; [aralık_bak])",
    params: [
      { name: "aranan_değer", description: "Tablonun ilk sütununda aranacak değer (hücre referansı veya doğrudan değer)." },
      { name: "tablo_aralığı", description: "Aramanın yapılacağı tablo. Aranan değer ilk sütunda olmalıdır." },
      { name: "sütun_indisi", description: "Sonucun alınacağı sütunun numarası (ilk sütun = 1)." },
      { name: "aralık_bak", description: "0 veya YANLIŞ = tam eşleşme (önerilen); 1 veya DOĞRU = yaklaşık eşleşme." },
    ],
    steps: [
      "Sonucun görüneceği hücreyi seçin.",
      "=DÜŞEYARA( yazın.",
      "Aranan değeri girin (örn. D1 — ürün kodu).",
      "Noktalı virgül koyup tabloyu seçin: ;$A$2:$C$100 (mutlak referans önerilir).",
      "Sütun numarasını yazın: ;2 (tablodaki 2. sütun).",
      "Son parametre: ;0 (tam eşleşme). Parantezi kapatıp Enter'a basın.",
    ],
    examples: [
      { scenario: "Ürün kodundan ürün adı getirme", formula: "=DÜŞEYARA(D1;$A$2:$C$100;2;0)", result: "\"Laptop\"" },
      { scenario: "Personel numarasından departman getirme", formula: "=DÜŞEYARA(E2;Personel!$A:$D;4;0)", result: "\"Finans\"" },
    ],
    tips: [
      "Aranan değer tablonun İLK sütununda olmalıdır — bu en büyük kısıtlamadır.",
      "Sütun eklenince sütun numarası kayar — bu yüzden İNDİS+KAÇINCI daha güvenilirdir.",
      "EĞERHATA ile sararak #YOK hatalarını gizleyin: =EĞERHATA(DÜŞEYARA(...);\"-\").",
      "Tablo aralığını mutlak referans ($) yapın ki formülü kopyalayınca bozulmasın.",
    ],
    relatedSlugs: ["xlookup", "indis", "kacinci", "egerhata"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
    toolHref: "/excel-araclari/duseyara-olusturucu",
    toolName: "DÜŞEYARA Oluşturucu",
  },
  {
    slug: "xlookup",
    name: "XLOOKUP",
    nameEn: "XLOOKUP",
    category: "arama",
    summary: "DÜŞEYARA'nın modern alternatifi. Sola da bakabilir, sütun numarası gerektirmez ve bulunamazsa varsayılan değer döndürebilir. Excel 365 / 2021+ gerekir.",
    syntax: "=XLOOKUP(aranan; arama_aralığı; dönüş_aralığı; [bulunamazsa]; [eşleşme_türü]; [arama_modu])",
    params: [
      { name: "aranan", description: "Aranacak değer." },
      { name: "arama_aralığı", description: "Aramanın yapılacağı tek sütun." },
      { name: "dönüş_aralığı", description: "Sonucun alınacağı sütun (aynı boyutta)." },
      { name: "bulunamazsa", description: "Eşleşme yoksa gösterilecek değer (isteğe bağlı)." },
      { name: "eşleşme_türü", description: "0 = tam eşleşme (varsayılan), -1 = tam veya küçük, 1 = tam veya büyük." },
      { name: "arama_modu", description: "1 = ilkten sona (varsayılan), -1 = sondan başa, 2 = ikili arama (artan sıralı)." },
    ],
    steps: [
      "Sonucun görüneceği hücreye =XLOOKUP( yazın.",
      "Aranan değeri girin: D1",
      "Arama aralığını seçin: ;B2:B100",
      "Dönüş aralığını seçin: ;C2:C100",
      "Bulunamazsa değeri ekleyin: ;\"Kayıt yok\"",
      "Parantezi kapatıp Enter'a basın.",
    ],
    examples: [
      { scenario: "Ürün kodundan fiyat getirme", formula: "=XLOOKUP(D1;A2:A100;C2:C100;\"Bulunamadı\")", result: "1250" },
      { scenario: "Sola arama (DÜŞEYARA yapamaz)", formula: "=XLOOKUP(D1;C2:C100;A2:A100)", result: "\"PRD-001\"" },
    ],
    tips: [
      "DÜŞEYARA'dan üstünlükleri: sola bakabilir, sütun numarası gerektirmez, bulunamazsa parametresi var.",
      "Birden fazla sütun döndürebilir: dönüş aralığı olarak birden fazla sütun seçin.",
      "Excel 365 veya 2021 yoksa İNDİS+KAÇINCI kullanın.",
    ],
    relatedSlugs: ["duseyara", "indis", "kacinci"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
    blogHref: "/blog/excel-caprazara-xlookup-kullanimi",
    blogName: "XLOOKUP Blog Yazısı",
    seoTitle: "XLOOKUP Kullanımı: Excel'de Sola Arama, Örnekler ve DÜŞEYARA Farkı",
    seoDescription:
      "XLOOKUP nasıl kullanılır? Sözdizimi, sola arama, bulunamazsa parametresi, gerçek örnekler ve DÜŞEYARA ile karşılaştırma — adım adım rehber.",
    seoKeywords: [
      "xlookup kullanımı",
      "xlookup nasıl kullanılır",
      "excel xlookup",
      "xlookup örnek",
      "xlookup düşeyara farkı",
      "xlookup sola arama",
      "çaprazara kullanımı",
    ],
  },
  {
    slug: "indis",
    name: "İNDİS",
    nameEn: "INDEX",
    category: "arama",
    summary: "Bir aralıktan belirtilen satır ve sütun numarasındaki değeri döndürür. KAÇINCI ile birlikte en esnek arama çözümünü oluşturur.",
    syntax: "=İNDİS(dizi; satır_no; [sütun_no])",
    params: [
      { name: "dizi", description: "Sonucun alınacağı hücre aralığı." },
      { name: "satır_no", description: "Dizideki satır numarası (1'den başlar)." },
      { name: "sütun_no", description: "Dizideki sütun numarası (tek sütun dizilerde gerekmez)." },
    ],
    steps: [
      "=İNDİS( yazın ve sonuç aralığını seçin: C2:C100",
      "Satır numarasını girin — genellikle KAÇINCI ile bulunur: ;KAÇINCI(D1;A2:A100;0)",
      "Parantezi kapatıp Enter'a basın.",
    ],
    examples: [
      { scenario: "KAÇINCI ile birlikte arama", formula: "=İNDİS(C2:C100;KAÇINCI(D1;A2:A100;0))", result: "\"Laptop\"" },
      { scenario: "2 boyutlu arama (satır + sütun)", formula: "=İNDİS(B2:D10;KAÇINCI(\"Ocak\";A2:A10;0);KAÇINCI(\"Satış\";B1:D1;0))", result: "45000" },
    ],
    tips: [
      "İNDİS + KAÇINCI kombinasyonu her Excel sürümünde çalışır.",
      "Sütun eklenip çıkarıldığında bozulmaz — DÜŞEYARA'dan daha güvenilirdir.",
    ],
    relatedSlugs: ["kacinci", "duseyara", "xlookup"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },
  {
    slug: "kacinci",
    name: "KAÇINCI",
    nameEn: "MATCH",
    category: "arama",
    summary: "Bir değerin aralıktaki konumunu (satır numarasını) bulur. İNDİS ile birlikte güçlü arama çözümleri oluşturur.",
    syntax: "=KAÇINCI(aranan_değer; arama_aralığı; [eşleşme_türü])",
    params: [
      { name: "aranan_değer", description: "Aranacak değer." },
      { name: "arama_aralığı", description: "Tek sütun veya tek satır olmalıdır." },
      { name: "eşleşme_türü", description: "0 = tam eşleşme (önerilen), 1 = küçük eşit, -1 = büyük eşit." },
    ],
    steps: [
      "=KAÇINCI( yazın ve aranan değeri girin: D1",
      "Arama aralığını seçin: ;A2:A100",
      "Eşleşme türünü yazın: ;0 (tam eşleşme).",
      "Sonuç: D1 değerinin A sütunundaki satır pozisyonu (1, 2, 3... şeklinde).",
    ],
    examples: [
      { scenario: "Ürün kodunun satır numarası", formula: "=KAÇINCI(\"PRD-005\";A2:A100;0)", result: "5" },
    ],
    tips: [
      "Tek başına kullanıldığında sadece pozisyon döner — değer almak için İNDİS ile birleştirin.",
      "0 dışındaki eşleşme türlerinde liste sıralı olmalıdır.",
    ],
    relatedSlugs: ["indis", "duseyara", "xlookup"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },

  /* ═══════════════════════════════════════════
     MANTIK & KARAR
     ═══════════════════════════════════════════ */
  {
    slug: "eger",
    name: "EĞER",
    nameEn: "IF",
    category: "mantik",
    summary: "Bir koşul doğruysa bir değer, yanlışsa başka bir değer döndürür. Excel'in temel karar fonksiyonudur.",
    syntax: "=EĞER(mantıksal_sınama; doğruysa_değer; yanlışsa_değer)",
    params: [
      { name: "mantıksal_sınama", description: "Doğru/yanlış dönen koşul (örn. A2>=50)." },
      { name: "doğruysa_değer", description: "Koşul doğruysa döndürülecek değer." },
      { name: "yanlışsa_değer", description: "Koşul yanlışsa döndürülecek değer." },
    ],
    steps: [
      "=EĞER( yazın ve koşulunuzu belirleyin: A2>=50",
      "Doğruysa değeri yazın: ;\"Geçti\"",
      "Yanlışsa değeri yazın: ;\"Kaldı\"",
      "Parantezi kapatın: =EĞER(A2>=50;\"Geçti\";\"Kaldı\")",
    ],
    examples: [
      { scenario: "Sınav geçti/kaldı", formula: "=EĞER(A2>=50;\"Geçti\";\"Kaldı\")", result: "\"Geçti\"" },
      { scenario: "Stok kontrolü", formula: "=EĞER(B2<10;\"Sipariş Ver\";\"Yeterli\")", result: "\"Sipariş Ver\"" },
    ],
    tips: [
      "Metin değerleri çift tırnak içinde yazılır.",
      "Türkçe Excel'de parametre ayırıcı noktalı virgül (;) kullanılır.",
      "3+ koşul için iç içe EĞER veya IFS kullanın.",
    ],
    relatedSlugs: ["ve", "veya", "ifs", "egerhata"],
    guideHref: "/egitimler/temel",
    guideName: "Temel Seviye Eğitim",
    toolHref: "/excel-araclari/eger-olusturucu",
    toolName: "EĞER Oluşturucu",
  },
  {
    slug: "ve",
    name: "VE",
    nameEn: "AND",
    category: "mantik",
    summary: "Tüm koşullar doğruysa DOĞRU, en az biri yanlışsa YANLIŞ döndürür. EĞER ile birlikte çoklu koşul kontrolü yapar.",
    syntax: "=VE(koşul1; koşul2; ...)",
    params: [{ name: "koşul1; koşul2; ...", description: "Kontrol edilecek koşullar (255'e kadar)." }],
    steps: [
      "EĞER içinde kullanım: =EĞER(VE(A2>=50;B2>=50);\"İkisi de geçti\";\"Kaldı\")",
    ],
    examples: [
      { scenario: "İki koşul birlikte doğru mu?", formula: "=EĞER(VE(A2>=100;B2<=3);\"Prim Var\";\"Prim Yok\")", result: "\"Prim Var\"" },
    ],
    tips: ["Tek başına DOĞRU/YANLIŞ döner — anlamlı sonuç için EĞER ile birleştirin."],
    relatedSlugs: ["veya", "eger"],
    guideHref: "/egitimler/temel",
    guideName: "Temel Seviye Eğitim",
  },
  {
    slug: "veya",
    name: "VEYA",
    nameEn: "OR",
    category: "mantik",
    summary: "En az bir koşul doğruysa DOĞRU döndürür. EĞER ile birlikte 'herhangi biri yeterse' senaryolarında kullanılır.",
    syntax: "=VEYA(koşul1; koşul2; ...)",
    params: [{ name: "koşul1; koşul2; ...", description: "Kontrol edilecek koşullar." }],
    steps: [
      "EĞER içinde: =EĞER(VEYA(C2=\"VIP\";D2>10000);\"Öncelikli\";\"Normal\")",
    ],
    examples: [
      { scenario: "VIP veya yüksek ciro", formula: "=EĞER(VEYA(C2=\"VIP\";D2>10000);\"Öncelikli\";\"Normal\")", result: "\"Öncelikli\"" },
    ],
    tips: ["VE = hepsi doğru olmalı. VEYA = en az biri doğru yeterli."],
    relatedSlugs: ["ve", "eger"],
    guideHref: "/egitimler/temel",
    guideName: "Temel Seviye Eğitim",
  },
  {
    slug: "ifs",
    name: "IFS (EĞERLER)",
    nameEn: "IFS",
    category: "mantik",
    summary: "Birden fazla koşulu sırayla kontrol eder ve ilk doğru olan koşulun değerini döndürür. İç içe EĞER'in okunaklı alternatifidir. Excel 2019+ / 365.",
    syntax: "=IFS(koşul1; değer1; koşul2; değer2; ...; DOĞRU; varsayılan)",
    params: [{ name: "koşul-değer çiftleri", description: "İlk doğru olan koşulun değeri döner. Son çift olarak DOĞRU;varsayılan ekleyin." }],
    steps: [
      "=IFS( yazın.",
      "Koşul-değer çiftlerini girin: A2>=90;\"A\"; A2>=80;\"B\"; A2>=70;\"C\"",
      "Varsayılan: ;DOĞRU;\"F\") — hiçbir koşul tutmazsa F.",
    ],
    examples: [
      { scenario: "Not hesaplama", formula: "=IFS(A2>=90;\"A\";A2>=80;\"B\";A2>=70;\"C\";DOĞRU;\"F\")", result: "\"B\"" },
    ],
    tips: ["DOĞRU;varsayılan eklemeyi unutmayın, yoksa hiçbir koşul tutmazsa #YOK hatası alırsınız."],
    relatedSlugs: ["eger", "ve", "veya"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },

  /* ═══════════════════════════════════════════
     TOPLAMA & SAYMA
     ═══════════════════════════════════════════ */
  {
    slug: "topla",
    name: "TOPLA",
    nameEn: "SUM",
    category: "toplama-sayma",
    summary: "Seçili hücre aralığındaki sayıları toplar. Excel'de en çok kullanılan fonksiyondur.",
    syntax: "=TOPLA(aralık1; [aralık2]; ...)",
    params: [{ name: "aralık", description: "Toplanacak hücre aralığı. Birden fazla aralık toplanabilir." }],
    steps: [
      "Toplamın görüneceği hücreyi seçin.",
      "=TOPLA( yazıp aralığı seçin: A1:A100",
      "Enter'a basın. Kısayol: Alt+=",
    ],
    examples: [
      { scenario: "Aylık satış toplamı", formula: "=TOPLA(C2:C31)", result: "428900" },
      { scenario: "Birden fazla aralık", formula: "=TOPLA(A1:A10;C1:C10)", result: "1250" },
    ],
    tips: [
      "Boş hücreler ve metin hücreleri atlanır, hata vermez.",
      "Alt+= kısayolu ile otomatik TOPLA yazılır.",
    ],
    relatedSlugs: ["ortalama", "etopla", "coketopla"],
    guideHref: "/egitimler/temel",
    guideName: "Temel Seviye Eğitim",
  },
  {
    slug: "ortalama",
    name: "ORTALAMA",
    nameEn: "AVERAGE",
    category: "toplama-sayma",
    summary: "Sayıların aritmetik ortalamasını hesaplar. Performans puanları, fiyat ortalamaları gibi karşılaştırmalarda kullanılır.",
    syntax: "=ORTALAMA(aralık1; [aralık2]; ...)",
    params: [{ name: "aralık", description: "Ortalaması alınacak hücre aralığı. Boş hücreler dahil edilmez." }],
    steps: ["=ORTALAMA( yazın, aralığı seçin, Enter'a basın."],
    examples: [
      { scenario: "Sınav ortalaması", formula: "=ORTALAMA(B2:B30)", result: "72,5" },
    ],
    tips: ["ORTALAMA boş hücreleri saymaz ama 0 değerli hücreleri sayar."],
    relatedSlugs: ["topla", "min-maks", "say"],
    guideHref: "/egitimler/temel",
    guideName: "Temel Seviye Eğitim",
  },
  {
    slug: "min-maks",
    name: "MİN / MAKS",
    nameEn: "MIN / MAX",
    category: "toplama-sayma",
    summary: "Bir aralıktaki en küçük (MİN) ve en büyük (MAKS) değeri bulur.",
    syntax: "=MİN(aralık)  veya  =MAKS(aralık)",
    params: [{ name: "aralık", description: "Değerlerin aranacağı hücre aralığı." }],
    steps: ["=MİN(C2:C100) veya =MAKS(C2:C100) yazıp Enter'a basın."],
    examples: [
      { scenario: "En düşük ve en yüksek satış", formula: "=MİN(C2:C100) & \" - \" & MAKS(C2:C100)", result: "1200 - 98500" },
    ],
    tips: ["Fark hesabı: =MAKS(aralık)-MİN(aralık) ile aralığı (spread) bulun."],
    relatedSlugs: ["topla", "ortalama", "say"],
    guideHref: "/egitimler/temel",
    guideName: "Temel Seviye Eğitim",
  },
  {
    slug: "say",
    name: "SAY / SAYA / SAYBOŞ",
    nameEn: "COUNT / COUNTA / COUNTBLANK",
    category: "toplama-sayma",
    summary: "SAY: sayı hücrelerini sayar. SAYA: dolu hücreleri sayar. SAYBOŞ: boş hücreleri sayar.",
    syntax: "=SAY(aralık)  =SAYA(aralık)  =SAYBOŞ(aralık)",
    params: [{ name: "aralık", description: "Sayılacak hücre aralığı." }],
    steps: ["İhtiyaca göre =SAY, =SAYA veya =SAYBOŞ yazıp aralığı seçin."],
    examples: [
      { scenario: "Kaç hücrede sayı var", formula: "=SAY(A1:A100)", result: "85" },
      { scenario: "Kaç hücre boş", formula: "=SAYBOŞ(A1:A100)", result: "15" },
    ],
    tips: ["Veri kalitesi kontrolünde SAYBOŞ çok faydalıdır."],
    relatedSlugs: ["egersay", "topla"],
    guideHref: "/egitimler/temel",
    guideName: "Temel Seviye Eğitim",
  },
  {
    slug: "egersay",
    name: "EĞERSAY",
    nameEn: "COUNTIF",
    category: "toplama-sayma",
    summary: "Tek bir koşulu sağlayan hücreleri sayar. 'İstanbul kaç kez geçiyor?' veya '50den büyük kaç değer var?' sorularına cevap verir.",
    syntax: "=EĞERSAY(aralık; ölçüt)",
    params: [
      { name: "aralık", description: "Sayılacak hücre aralığı." },
      { name: "ölçüt", description: "Koşul: \"İstanbul\", \">50\", \"*rapor*\" gibi." },
    ],
    steps: [
      "=EĞERSAY( yazın, aralığı seçin, koşulu girin.",
      "Metin: ;\"İstanbul\" — Sayı: ;\">50\" — Joker: ;\"*Excel*\"",
    ],
    examples: [
      { scenario: "İstanbul kaç kez", formula: "=EĞERSAY(A:A;\"İstanbul\")", result: "42" },
      { scenario: "50'den büyükler", formula: "=EĞERSAY(B2:B100;\">50\")", result: "28" },
    ],
    tips: [
      "Joker: * (herhangi karakter dizisi), ? (tek karakter).",
      "Birden fazla koşul için ÇOKEĞERSAY kullanın.",
    ],
    relatedSlugs: ["cokegersay", "etopla", "coketopla"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },
  {
    slug: "cokegersay",
    name: "ÇOKEĞERSAY",
    nameEn: "COUNTIFS",
    category: "toplama-sayma",
    summary: "Birden fazla koşulu aynı anda sağlayan satırları sayar.",
    syntax: "=ÇOKEĞERSAY(ölçüt_aralığı1; ölçüt1; [ölçüt_aralığı2; ölçüt2]; ...)",
    params: [
      { name: "ölçüt_aralığı1; ölçüt1", description: "İlk koşul: aralık ve kriter." },
      { name: "ölçüt_aralığı2; ölçüt2", description: "İkinci koşul çifti (isteğe bağlı, VE mantığı)." },
    ],
    steps: ["=ÇOKEĞERSAY(A:A;\"İstanbul\";C:C;\"Aktif\") — İstanbul VE Aktif olan satır sayısı."],
    examples: [
      { scenario: "Şehir + durum", formula: "=ÇOKEĞERSAY(A:A;\"İstanbul\";C:C;\"Aktif\")", result: "18" },
    ],
    tips: ["Tüm koşullar VE mantığıyla çalışır — hepsi aynı anda sağlanmalıdır."],
    relatedSlugs: ["egersay", "coketopla"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },
  {
    slug: "etopla",
    name: "ETOPLA",
    nameEn: "SUMIF",
    category: "toplama-sayma",
    summary: "Tek bir koşulu sağlayan satırlardaki değerleri toplar.",
    syntax: "=ETOPLA(aralık; ölçüt; [toplam_aralığı])",
    params: [
      { name: "aralık", description: "Koşulun kontrol edileceği aralık." },
      { name: "ölçüt", description: "Koşul: \"İstanbul\", \">1000\" vb." },
      { name: "toplam_aralığı", description: "Toplanacak değerlerin bulunduğu aralık (farklı sütunsa)." },
    ],
    steps: ["=ETOPLA(A:A;\"İstanbul\";C:C) — A sütununda İstanbul olan satırların C sütun toplamı."],
    examples: [
      { scenario: "Şehir bazlı toplam", formula: "=ETOPLA(A:A;\"İstanbul\";C:C)", result: "125000" },
    ],
    tips: ["Birden fazla koşul için ÇOKETOPLA kullanın."],
    relatedSlugs: ["coketopla", "egersay", "topla"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },
  {
    slug: "coketopla",
    name: "ÇOKETOPLA",
    nameEn: "SUMIFS",
    category: "toplama-sayma",
    summary: "Birden fazla koşulu sağlayan satırlardaki değerleri toplar. ETOPLA'nın çoklu koşul versiyonudur.",
    syntax: "=ÇOKETOPLA(toplam_aralığı; ölçüt_aralığı1; ölçüt1; [ölçüt_aralığı2; ölçüt2]; ...)",
    params: [
      { name: "toplam_aralığı", description: "Toplanacak sayılar (İLK parametre — ETOPLA'dan farklı!)." },
      { name: "ölçüt_aralığı1; ölçüt1", description: "İlk koşul çifti." },
      { name: "ölçüt_aralığı2; ölçüt2", description: "İkinci koşul çifti (isteğe bağlı)." },
    ],
    steps: [
      "=ÇOKETOPLA( yazın. İlk parametre TOPLAM aralığıdır: D2:D1000",
      "Koşul çiftlerini ekleyin: ;A2:A1000;\"İstanbul\";B2:B1000;\">=\"&TARİH(2025;1;1)",
    ],
    examples: [
      { scenario: "Şehir + yıl filtresiyle toplam", formula: "=ÇOKETOPLA(D:D;A:A;\"İstanbul\";B:B;\">=\"&TARİH(2025;1;1))", result: "85000" },
    ],
    tips: [
      "ETOPLA ile parametre sırası farklıdır: ÇOKETOPLA'da toplam aralığı BAŞTA.",
      "Tek koşulda bile ÇOKETOPLA kullanmak ileride koşul eklemeyi kolaylaştırır.",
    ],
    relatedSlugs: ["etopla", "egersay", "topla-carpim"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },
  {
    slug: "topla-carpim",
    name: "TOPLA.ÇARPIM",
    nameEn: "SUMPRODUCT",
    category: "toplama-sayma",
    summary: "Dizileri eleman eleman çarpar ve toplar. Ağırlıklı ortalama, çoklu koşullu toplam ve OR mantığı için güçlü bir araçtır.",
    syntax: "=TOPLA.ÇARPIM(dizi1; [dizi2]; ...)",
    params: [{ name: "dizi1; dizi2; ...", description: "Aynı boyuttaki aralıklar. Eleman eleman çarpılır, sonuçlar toplanır." }],
    steps: [
      "Koşullu toplam: =TOPLA.ÇARPIM((A2:A100=\"İstanbul\")*C2:C100)",
      "OR mantığı: =TOPLA.ÇARPIM(((A:A=\"Elma\")+(A:A=\"Armut\")>0)*C:C)",
    ],
    examples: [
      { scenario: "Ağırlıklı ortalama", formula: "=TOPLA.ÇARPIM(B2:B10;C2:C10)/TOPLA(C2:C10)", result: "78,4" },
      { scenario: "OR ile koşullu toplam", formula: "=TOPLA.ÇARPIM(((A:A=\"Elma\")+(A:A=\"Armut\")>0)*C:C)", result: "3200" },
    ],
    tips: [
      "VE mantığı: koşulları * ile çarpın. OR mantığı: koşulları + ile toplayın.",
      "Her Excel sürümünde çalışır — dinamik dizi gerektirmez.",
    ],
    relatedSlugs: ["coketopla", "etopla"],
    guideHref: "/egitimler/ileri",
    guideName: "İleri Seviye Eğitim",
  },

  /* ═══════════════════════════════════════════
     METİN İŞLEME
     ═══════════════════════════════════════════ */
  {
    slug: "birlestir",
    name: "BİRLEŞTİR / &",
    nameEn: "CONCATENATE / &",
    category: "metin",
    summary: "Birden fazla hücredeki metni tek hücrede birleştirir. Ad+Soyad, adres oluşturma gibi senaryolarda kullanılır.",
    syntax: "=BİRLEŞTİR(metin1;\" \";metin2)  veya  =A2&\" \"&B2",
    params: [{ name: "metin1; metin2; ...", description: "Birleştirilecek metinler veya hücreler." }],
    steps: ["En hızlı yol: =A2&\" \"&B2 — araya boşluk koyarak birleştirir."],
    examples: [
      { scenario: "Ad + Soyad", formula: "=A2&\" \"&B2", result: "\"Ahmet Yılmaz\"" },
    ],
    tips: ["& operatörü her versiyonda çalışır. METNEBİRLEŞTİR boş hücreleri otomatik atlayabilir."],
    relatedSlugs: ["sag-sol-parcaal", "uzunluk", "metin"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },
  {
    slug: "sag-sol-parcaal",
    name: "SAĞ / SOL / PARÇAAL",
    nameEn: "RIGHT / LEFT / MID",
    category: "metin",
    summary: "Metnin sağından, solundan veya ortasından belirli sayıda karakter çeker.",
    syntax: "=SAĞ(metin;n)  =SOL(metin;n)  =PARÇAAL(metin;başlangıç;uzunluk)",
    params: [
      { name: "metin", description: "İşlenecek metin veya hücre." },
      { name: "n / başlangıç / uzunluk", description: "SAĞ/SOL: karakter sayısı. PARÇAAL: başlangıç pozisyonu ve uzunluk." },
    ],
    steps: [
      "Son 4 karakter: =SAĞ(A2;4)",
      "İlk 2 karakter: =SOL(A2;2)",
      "Ortadan: =PARÇAAL(A2;3;5) — 3. karakterden 5 karakter alır.",
    ],
    examples: [
      { scenario: "TC son 4 hane", formula: "=SAĞ(A2;4)", result: "\"5678\"" },
      { scenario: "Plaka kodu", formula: "=SOL(A2;2)", result: "\"34\"" },
    ],
    tips: ["BUL fonksiyonu ile ayırıcı pozisyonunu bulup dinamik parçalama yapabilirsiniz."],
    relatedSlugs: ["birlestir", "uzunluk", "bul", "yerinekoy"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },
  {
    slug: "uzunluk",
    name: "UZUNLUK",
    nameEn: "LEN",
    category: "metin",
    summary: "Metnin karakter sayısını döndürür. Veri doğrulama ve TC kimlik kontrolü gibi senaryolarda kullanılır.",
    syntax: "=UZUNLUK(metin)",
    params: [{ name: "metin", description: "Uzunluğu ölçülecek metin veya hücre (boşluklar dahil)." }],
    steps: ["=UZUNLUK(A2) yazıp Enter'a basın."],
    examples: [{ scenario: "TC kimlik 11 hane mi?", formula: "=UZUNLUK(A2)=11", result: "DOĞRU" }],
    tips: ["KIRP ile fazla boşlukları temizledikten sonra UZUNLUK kontrol edin."],
    relatedSlugs: ["sag-sol-parcaal", "kirp"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },
  {
    slug: "kirp",
    name: "KIRP / TEMİZ",
    nameEn: "TRIM / CLEAN",
    category: "metin",
    summary: "KIRP: baştaki ve sondaki fazla boşlukları temizler. TEMİZ: yazdırılamayan (görünmeyen) karakterleri siler.",
    syntax: "=KIRP(metin)  =TEMİZ(metin)",
    params: [{ name: "metin", description: "Temizlenecek metin veya hücre." }],
    steps: ["Tam temizlik: =KIRP(TEMİZ(A2)) — önce görünmeyen karakterleri, sonra boşlukları temizler."],
    examples: [{ scenario: "Fazla boşlukları temizle", formula: "=KIRP(A2)", result: "\"Ahmet Yılmaz\"" }],
    tips: ["DÜŞEYARA eşleşme sorunlarının çoğu fazla boşluklardan kaynaklanır — KIRP+TEMİZ çözüm olabilir."],
    relatedSlugs: ["uzunluk", "yerinekoy"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },
  {
    slug: "yerinekoy",
    name: "YERİNEKOY",
    nameEn: "SUBSTITUTE",
    category: "metin",
    summary: "Metindeki belirli bir karakter dizisini başka bir karakter dizisiyle değiştirir. Toplu bul-değiştir işlemi için formül alternatifidir.",
    syntax: "=YERİNEKOY(metin; eski_metin; yeni_metin; [sıra_no])",
    params: [
      { name: "metin", description: "İşlenecek metin." },
      { name: "eski_metin", description: "Değiştirilecek metin." },
      { name: "yeni_metin", description: "Yerine konacak metin." },
      { name: "sıra_no", description: "Kaçıncı eşleşmenin değiştirileceği (boş bırakılırsa tümü)." },
    ],
    steps: ["=YERİNEKOY(A2;\"-\";\" \") — tireleri boşlukla değiştirir."],
    examples: [{ scenario: "Tire → boşluk", formula: "=YERİNEKOY(A2;\"-\";\" \")", result: "\"İstanbul Ankara\"" }],
    tips: ["BUL-DEĞİŞTİR (Ctrl+H) kalıcı değiştirir; YERİNEKOY formül olarak çalışır, kaynağı bozmaz."],
    relatedSlugs: ["kirp", "sag-sol-parcaal", "bul"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },
  {
    slug: "bul",
    name: "BUL / ARA",
    nameEn: "FIND / SEARCH",
    category: "metin",
    summary: "Bir metnin başka bir metin içindeki pozisyonunu bulur. BUL büyük/küçük harf duyarlıdır, ARA duyarsızdır.",
    syntax: "=BUL(aranan_metin; metin; [başlangıç])  =ARA(aranan_metin; metin; [başlangıç])",
    params: [
      { name: "aranan_metin", description: "Aranacak karakter veya metin." },
      { name: "metin", description: "İçinde aranacak metin veya hücre." },
    ],
    steps: ["@ işaretinin pozisyonu: =BUL(\"@\";A2) — e-posta adresinin @'ini bulur."],
    examples: [{ scenario: "@ pozisyonu", formula: "=BUL(\"@\";\"ahmet@test.com\")", result: "6" }],
    tips: ["PARÇAAL ile birlikte e-posta, dosya yolu gibi metinleri parçalamak için kullanılır."],
    relatedSlugs: ["sag-sol-parcaal", "yerinekoy"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },
  {
    slug: "metin",
    name: "METİN",
    nameEn: "TEXT",
    category: "metin",
    summary: "Sayı veya tarihi belirtilen formatta metne çevirir. Raporlarda özel format görüntüleme için kullanılır.",
    syntax: "=METİN(değer; format_kodu)",
    params: [
      { name: "değer", description: "Formatlanacak sayı, tarih veya hücre." },
      { name: "format_kodu", description: "Format dizisi: \"#.##0,00\", \"GG.AA.YYYY\", \"MMMM\" vb." },
    ],
    steps: ["=METİN(A2;\"#.##0,00 ₺\") — sayıyı para formatında metne çevirir."],
    examples: [
      { scenario: "Para formatı", formula: "=METİN(1234,5;\"#.##0,00 ₺\")", result: "\"1.234,50 ₺\"" },
      { scenario: "Ay adı", formula: "=METİN(A2;\"MMMM\")", result: "\"Mart\"" },
    ],
    tips: ["Sonuç METİNDİR — matematiksel işlem yapılamaz. Görüntüleme amaçlı kullanın."],
    relatedSlugs: ["birlestir"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },

  /* ═══════════════════════════════════════════
     TARİH & SAAT
     ═══════════════════════════════════════════ */
  {
    slug: "bugun",
    name: "BUGÜN / ŞİMDİ",
    nameEn: "TODAY / NOW",
    category: "tarih",
    summary: "BUGÜN: günün tarihini döndürür. ŞİMDİ: tarih + saati döndürür. Vade kontrolü, kalan gün hesabı için kullanılır.",
    syntax: "=BUGÜN()  =ŞİMDİ()",
    params: [],
    steps: ["=BUGÜN() yazın — parametre almaz. Kalan gün: =A2-BUGÜN()"],
    examples: [
      { scenario: "Kalan gün", formula: "=A2-BUGÜN()", result: "15" },
      { scenario: "Vade geçti mi?", formula: "=EĞER(A2<BUGÜN();\"Gecikmiş\";\"Süresi var\")", result: "\"Süresi var\"" },
    ],
    tips: ["Sabit tarih istiyorsanız Ctrl+; kullanın — BUGÜN her açılışta güncellenir."],
    relatedSlugs: ["gun-ay-yil", "edate", "tarihfarki"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },
  {
    slug: "gun-ay-yil",
    name: "GÜN / AY / YIL",
    nameEn: "DAY / MONTH / YEAR",
    category: "tarih",
    summary: "Tarihten gün, ay veya yıl bileşenini çıkarır. Aylık gruplama, yıl bazlı filtreleme için kullanılır.",
    syntax: "=GÜN(tarih)  =AY(tarih)  =YIL(tarih)",
    params: [{ name: "tarih", description: "Tarih içeren hücre veya değer." }],
    steps: ["=AY(A2) — 15.03.2025 için 3 döner. Ay adı: =METİN(A2;\"MMMM\") → \"Mart\"."],
    examples: [
      { scenario: "Ay numarası", formula: "=AY(A2)", result: "3" },
      { scenario: "Yıl", formula: "=YIL(A2)", result: "2025" },
    ],
    tips: ["Ay bazlı gruplama: =YIL(A2)&\"-\"&METİN(AY(A2);\"00\") → \"2025-03\"."],
    relatedSlugs: ["bugun", "edate", "tarihfarki", "metin"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },
  {
    slug: "edate",
    name: "EDATE",
    nameEn: "EDATE",
    category: "tarih",
    summary: "Bir tarihe belirtilen sayıda ay ekler veya çıkarır. Vade hesaplama, sözleşme bitiş tarihi için kullanılır.",
    syntax: "=EDATE(başlangıç_tarihi; ay_sayısı)",
    params: [
      { name: "başlangıç_tarihi", description: "Başlangıç tarihi." },
      { name: "ay_sayısı", description: "Eklenecek ay sayısı (negatif = geriye)." },
    ],
    steps: ["=EDATE(A2;3) — A2 tarihine 3 ay ekler."],
    examples: [{ scenario: "3 ay sonraki vade", formula: "=EDATE(\"15.01.2025\";3)", result: "15.04.2025" }],
    tips: ["Negatif ay sayısı geriye gider: =EDATE(A2;-6) — 6 ay öncesinin tarihi."],
    relatedSlugs: ["bugun", "tarihfarki", "gun-ay-yil"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },
  {
    slug: "tarihfarki",
    name: "TARİHFARKI",
    nameEn: "DATEDIF",
    category: "tarih",
    summary: "İki tarih arasındaki farkı yıl, ay veya gün olarak hesaplar. Yaş ve kıdem hesaplama için kullanılır. Excel'in gizli fonksiyonudur.",
    syntax: "=TARİHFARKI(başlangıç; bitiş; birim)",
    params: [
      { name: "başlangıç", description: "Başlangıç tarihi (küçük tarih)." },
      { name: "bitiş", description: "Bitiş tarihi (büyük tarih)." },
      { name: "birim", description: "\"Y\" = yıl, \"M\" = ay, \"D\" = gün, \"YM\" = yıldan artan ay, \"MD\" = aydan artan gün." },
    ],
    steps: ["Yaş: =TARİHFARKI(A2;BUGÜN();\"Y\")", "Kıdem: =TARİHFARKI(A2;BUGÜN();\"Y\")&\" yıl \"&TARİHFARKI(A2;BUGÜN();\"YM\")&\" ay\""],
    examples: [{ scenario: "Yaş hesaplama", formula: "=TARİHFARKI(A2;BUGÜN();\"Y\")", result: "32" }],
    tips: ["Formül sihirbazında görünmez ama çalışır. Başlangıç > bitiş ise hata verir."],
    relatedSlugs: ["bugun", "edate", "gun-ay-yil"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },

  /* ═══════════════════════════════════════════
     MATEMATİK & YUVARLAMA
     ═══════════════════════════════════════════ */
  {
    slug: "yuvarlak",
    name: "YUVARLAK",
    nameEn: "ROUND",
    category: "matematik",
    summary: "Sayıyı belirtilen ondalık basamağa yuvarlar. Fatura ve muhasebe hesaplamalarında kuruş hassasiyeti için kritiktir.",
    syntax: "=YUVARLAK(sayı; ondalık_basamak)",
    params: [
      { name: "sayı", description: "Yuvarlanacak sayı." },
      { name: "ondalık_basamak", description: "0 = tam sayı, 2 = kuruş, -1 = onlara yuvarlama." },
    ],
    steps: ["=YUVARLAK(A2;2) — 127,856 → 127,86"],
    examples: [
      { scenario: "Kuruşa yuvarla", formula: "=YUVARLAK(127,856;2)", result: "127,86" },
      { scenario: "Onlara yuvarla", formula: "=YUVARLAK(127,856;-1)", result: "130" },
    ],
    tips: ["YUKARIYUVARLA: her zaman büyüğe. AŞAĞIYUVARLA: her zaman küçüğe."],
    relatedSlugs: ["tamsayi", "mod"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },
  {
    slug: "tamsayi",
    name: "TAMSAYI",
    nameEn: "INT",
    category: "matematik",
    summary: "Sayıyı en yakın alt tam sayıya yuvarlar.",
    syntax: "=TAMSAYI(sayı)",
    params: [{ name: "sayı", description: "3,7 → 3; -2,3 → -3." }],
    steps: ["=TAMSAYI(A2) yazıp Enter'a basın."],
    examples: [{ scenario: "Tam sayıya indir", formula: "=TAMSAYI(9,8)", result: "9" }],
    tips: ["Tarih-saat ayrıştırmada kullanılır: =TAMSAYI(A2) tarih kısmını verir."],
    relatedSlugs: ["yuvarlak", "mod"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },
  {
    slug: "mod",
    name: "MOD",
    nameEn: "MOD",
    category: "matematik",
    summary: "Bölme işleminin kalanını verir. Tek/çift kontrolü, satır renklendirme ve döngüsel dağıtım için kullanılır.",
    syntax: "=MOD(sayı; bölen)",
    params: [
      { name: "sayı", description: "Bölünecek sayı." },
      { name: "bölen", description: "Bölücü (örn. 2 — tek/çift kontrolü)." },
    ],
    steps: ["Tek/çift: =MOD(A2;2) — 0 ise çift, 1 ise tek."],
    examples: [{ scenario: "Çift satır kontrolü", formula: "=MOD(SATIR();2)=0", result: "DOĞRU (çift satır)" }],
    tips: ["Koşullu biçimlendirmede satır renklendirme için: =MOD(SATIR();2)=0."],
    relatedSlugs: ["yuvarlak", "tamsayi"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },

  /* ═══════════════════════════════════════════
     BİLGİ & HATA YÖNETİMİ
     ═══════════════════════════════════════════ */
  {
    slug: "egerhata",
    name: "EĞERHATA",
    nameEn: "IFERROR",
    category: "bilgi",
    summary: "Formül hata verdiğinde belirlediğiniz değeri gösterir. Raporlardaki #YOK, #BÖL/0! gibi hataları gizler.",
    syntax: "=EĞERHATA(değer; hata_ise_değer)",
    params: [
      { name: "değer", description: "Kontrol edilecek formül." },
      { name: "hata_ise_değer", description: "Hata olursa gösterilecek değer." },
    ],
    steps: ["=EĞERHATA(A2/B2;\"-\") — B2 sıfırsa \"-\" gösterir."],
    examples: [
      { scenario: "Bölme hatası", formula: "=EĞERHATA(A2/B2;0)", result: "0" },
      { scenario: "DÜŞEYARA hatası", formula: "=EĞERHATA(DÜŞEYARA(D1;A:B;2;0);\"Bulunamadı\")", result: "\"Bulunamadı\"" },
    ],
    tips: [
      "Tüm hata türlerini yakalar. Sadece #YOK için EĞERYOK kullanın.",
      "XLOOKUP kullanıyorsanız EĞERHATA'ya gerek yok — bulunamazsa parametresi var.",
    ],
    relatedSlugs: ["duseyara", "xlookup", "eger"],
    guideHref: "/egitimler/temel",
    guideName: "Temel Seviye Eğitim",
  },
  {
    slug: "dolayli",
    name: "DOLAYLI",
    nameEn: "INDIRECT",
    category: "bilgi",
    summary: "Metin olarak verilen hücre adresini gerçek referansa çevirir. Bağımlı listeler ve dinamik referanslar için kullanılır.",
    syntax: "=DOLAYLI(referans_metni; [A1_stili])",
    params: [
      { name: "referans_metni", description: "Hücre adresi veya aralık adı içeren metin." },
      { name: "A1_stili", description: "DOĞRU = A1 stili (varsayılan), YANLIŞ = S1B1 stili." },
    ],
    steps: ["Bağımlı liste: Veri Doğrulama kaynağı olarak =DOLAYLI(A2) yazın."],
    examples: [{ scenario: "Dinamik sayfa referansı", formula: "=DOLAYLI(\"Sayfa1!A\"&B2)", result: "A sütununun B2. satırındaki değer" }],
    tips: ["Bağımlı açılır listeler için Ad Tanımla + DOLAYLI kombinasyonu standart yaklaşımdır."],
    relatedSlugs: ["duseyara", "xlookup"],
    guideHref: "/egitimler/orta",
    guideName: "Orta Seviye Eğitim",
  },

  /* ═══════════════════════════════════════════
     DİNAMİK DİZİ (Excel 365 / 2021+)
     ═══════════════════════════════════════════ */
  {
    slug: "filtre",
    name: "FİLTRE",
    nameEn: "FILTER",
    category: "dinamik-dizi",
    summary: "Belirli koşula uyan satırları dinamik olarak filtreler. Sonuç otomatik taşar (spill). Excel 365 / 2021+ gerekir.",
    syntax: "=FİLTRE(dizi; koşul; [boşsa])",
    params: [
      { name: "dizi", description: "Filtrelenecek tablo aralığı." },
      { name: "koşul", description: "DOĞRU/YANLIŞ dönen mantıksal dizi." },
      { name: "boşsa", description: "Hiç eşleşme yoksa gösterilecek değer." },
    ],
    steps: [
      "=FİLTRE(A2:D100;B2:B100>1000;\"Sonuç yok\")",
      "Çoklu koşul: =FİLTRE(A2:D100;(B2:B100>1000)*(C2:C100=\"İstanbul\"))",
    ],
    examples: [{ scenario: "Tutarı 1000'den büyük olanlar", formula: "=FİLTRE(A2:D100;C2:C100>1000;\"Sonuç yok\")", result: "(filtrelenmiş tablo)" }],
    tips: [
      "Sonuç hücrelerinin altında yeterli boş alan bırakın, yoksa #TAŞMA! hatası alırsınız.",
      "SIRALA ile birlikte: =SIRALA(FİLTRE(...);3;-1) — filtrele ve sırala.",
    ],
    relatedSlugs: ["sirala", "benzersiz"],
    guideHref: "/egitimler/ileri",
    guideName: "İleri Seviye Eğitim",
  },
  {
    slug: "sirala",
    name: "SIRALA",
    nameEn: "SORT",
    category: "dinamik-dizi",
    summary: "Bir aralığı formülle sıralar. Kaynak veri bozulmaz, sonuç dinamik güncellenir. Excel 365 / 2021+.",
    syntax: "=SIRALA(dizi; [sıralama_indisi]; [sıralama_sırası])",
    params: [
      { name: "dizi", description: "Sıralanacak aralık." },
      { name: "sıralama_indisi", description: "Kaçıncı sütuna göre (1 = ilk sütun)." },
      { name: "sıralama_sırası", description: "1 = artan, -1 = azalan." },
    ],
    steps: ["=SIRALA(A2:C100;3;-1) — 3. sütuna göre büyükten küçüğe."],
    examples: [{ scenario: "Satışa göre azalan sırala", formula: "=SIRALA(A2:C100;3;-1)", result: "(sıralanmış tablo)" }],
    tips: ["FİLTRE ile birlikte kullanarak filtrele + sırala yapabilirsiniz."],
    relatedSlugs: ["filtre", "benzersiz"],
    guideHref: "/egitimler/ileri",
    guideName: "İleri Seviye Eğitim",
  },
  {
    slug: "benzersiz",
    name: "BENZERSİZ",
    nameEn: "UNIQUE",
    category: "dinamik-dizi",
    summary: "Tekrarsız (unique) değerler listesi çıkarır. Müşteri listesi, kategori listesi gibi benzersiz değerler oluşturur. Excel 365 / 2021+.",
    syntax: "=BENZERSİZ(dizi; [sütun_bazlı]; [yalnızca_bir_kez])",
    params: [
      { name: "dizi", description: "Benzersiz değerlerin alınacağı aralık." },
      { name: "sütun_bazlı", description: "YANLIŞ = satır bazlı (varsayılan)." },
      { name: "yalnızca_bir_kez", description: "DOĞRU = yalnızca bir kez geçen değerler." },
    ],
    steps: ["=BENZERSİZ(A2:A1000) — tüm benzersiz değerleri listeler."],
    examples: [{ scenario: "Benzersiz müşteri listesi", formula: "=SIRALA(BENZERSİZ(A2:A1000))", result: "(sıralı benzersiz liste)" }],
    tips: ["Açılır liste kaynağı olarak mükemmeldir — yeni değer eklenince otomatik güncellenir."],
    relatedSlugs: ["filtre", "sirala"],
    guideHref: "/egitimler/ileri",
    guideName: "İleri Seviye Eğitim",
  },

  /* ═══════════════════════════════════════════
     İSTATİSTİK
     ═══════════════════════════════════════════ */
  {
    slug: "buyukdeger",
    name: "BÜYÜKDEĞER / KÜÇÜKDEĞER",
    nameEn: "LARGE / SMALL",
    category: "istatistik",
    summary: "Bir aralıktaki k. en büyük veya en küçük değeri bulur. Top-N raporları için kullanılır.",
    syntax: "=BÜYÜKDEĞER(dizi; k)  =KÜÇÜKDEĞER(dizi; k)",
    params: [
      { name: "dizi", description: "Değerlerin bulunduğu aralık." },
      { name: "k", description: "Kaçıncı büyük/küçük (1 = en büyük/küçük)." },
    ],
    steps: ["En yüksek 3. satış: =BÜYÜKDEĞER(C2:C100;3)"],
    examples: [{ scenario: "2. en yüksek satış", formula: "=BÜYÜKDEĞER(C2:C100;2)", result: "95000" }],
    tips: ["Top-5 listesi için k değerini 1-5 arası sırayla kullanın."],
    relatedSlugs: ["min-maks", "sirala"],
    guideHref: "/egitimler/ileri",
    guideName: "İleri Seviye Eğitim",
  },
];

/* ─── Yardımcı fonksiyonlar ─── */

export function getFormulaBySlug(slug: string): FormulaDef | undefined {
  return formulas.find((f) => f.slug === slug);
}

export function getFormulasByCategory(category: FormulaCategory): FormulaDef[] {
  return formulas.filter((f) => f.category === category);
}

export function getAllCategories(): FormulaCategory[] {
  const cats = new Set(formulas.map((f) => f.category));
  return Array.from(cats);
}

export function getRelatedFormulas(slug: string): FormulaDef[] {
  const formula = getFormulaBySlug(slug);
  if (!formula) return [];
  return formula.relatedSlugs
    .map((s) => getFormulaBySlug(s))
    .filter((f): f is FormulaDef => f !== undefined);
}
