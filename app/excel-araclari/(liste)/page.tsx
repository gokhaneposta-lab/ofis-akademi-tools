"use client";

import Link from "next/link";

const ACCENT = "#217346";

type Tool = {
  name: string;
  href: string;
  description: string;
};

const hizliAraclar: Tool[] = [
  {
    name: "Ad Soyad Ayırıcı",
    href: "/excel-araclari/ad-soyad-ayir",
    description: "Tam ad listesini otomatik olarak ad ve soyad olarak ayırır.",
  },
  {
    name: "CSV Ayırıcı",
    href: "/excel-araclari/csv-ayir",
    description: "CSV verilerini otomatik olarak sütunlara ayırır.",
  },
  {
    name: "Liste Birleştirici",
    href: "/excel-araclari/liste-birlestir",
    description:
      "Birden fazla satırdaki verileri seçilen ayraç ile tek satırda birleştirir.",
  },
  {
    name: "Tekrarlananları Kaldır",
    href: "/excel-araclari/tekrarlananlari-kaldir",
    description: "Listedeki tekrar eden satırları kaldırır; benzersiz liste üretir.",
  },
  {
    name: "Tarih Farkı (Vade / Gün / Yaş)",
    href: "/excel-araclari/tarih-farki",
    description: "İki tarih arası gün, ay, yıl hesaplar. Vade farkı veya yaş hesaplama (doğum tarihi → bugün) için ideal.",
  },
  {
    name: "Sayıyı Yazıya Çevir",
    href: "/excel-araclari/sayi-yaziya",
    description: "Rakamları Türkçe yazıya dönüştürür (fatura, çek, sözleşme için TL/kuruş).",
  },
  {
    name: "Satır / Sütun Döndür (Transpoz)",
    href: "/excel-araclari/transpoz",
    description: "Satırları sütunlara, sütunları satırlara çevirir; Excel'e yapıştırmaya uygun.",
  },
  {
    name: "Kelime & Karakter Sayacı",
    href: "/excel-araclari/kelime-karakter-sayaci",
    description: "Metindeki kelime ve karakter sayısı (boşluklu / boşluksuz).",
  },
  {
    name: "Boşluk Temizle",
    href: "/excel-araclari/bosluk-temizle",
    description: "Excel başındaki ve sondaki boşlukları siler; metin içi çoklu boşlukları tek boşluğa indirir (TRIM).",
  },
  {
    name: "Metni Kolonlara Böl",
    href: "/excel-araclari/kolonlara-bol",
    description: "Metni virgül, noktalı virgül veya sekme ile kolonlara ayırır — Excel Metni Sütunlara Dönüştür alternatifi.",
  },
  {
    name: "Büyük / Küçük Harf Dönüştür",
    href: "/excel-araclari/buyuk-kucuk-harf",
    description: "Metni büyük harf, küçük harf veya her kelimenin ilk harfi büyük (Proper) yapar. UPPER, LOWER, PROPER.",
  },
  {
    name: "Hafta Numarası & Gün Adı",
    href: "/excel-araclari/hafta-gun",
    description: "Tarihten ISO hafta numarası ve gün adı (Pazartesi, Salı…).",
  },
  {
    name: "Tarih Format Dönüştürücü",
    href: "/excel-araclari/tarih-format-donusturucu",
    description: "Tarih formatlarını farklı biçimlere çevirir (ISO, Türkçe uzun, GG.AA.YYYY vb.).",
  },
  {
    name: "Excel Dosya Birleştirici",
    href: "/excel-araclari/excel-dosya-birlestirici",
    description: "Birden fazla Excel dosyasını tek dosyada birleştirir. Aynı kolon yapısına sahip dosyaları alt alta ekleyerek tek Excel çıktısı oluşturur.",
  },
];

const mantikFormulAraclar: Tool[] = [
  {
    name: "Excel Formül Asistanı",
    href: "/excel-araclari/formul-asistani",
    description: "Yapmak istediğinizi yazın (örn. iki kolonu birleştir); size uygun Excel fonksiyonunu önerir (Türkçe / İngilizce).",
  },
  {
    name: "DÜŞEYARA Formül Oluşturucu",
    href: "/excel-araclari/duseyara-olusturucu",
    description: "Aranan değer, tablo ve sütun numarasından DÜŞEYARA formülü üretir. Kopyalayıp Excel'e yapıştırın.",
  },
  {
    name: "EĞER Formül Oluşturucu",
    href: "/excel-araclari/eger-olusturucu",
    description: "Koşul, doğruysa ve yanlışsa değerlerinden EĞER formülü oluşturur.",
  },
  {
    name: "İç içe EĞER Oluşturucu",
    href: "/excel-araclari/ic-ice-eger-olusturucu",
    description: "Birden fazla koşul–sonuç satırından iç içe EĞER formülü üretir (not aralığı, kademe vb.).",
  },
  {
    name: "Excel Formül Açıklayıcı",
    href: "/excel-araclari/formul-aciklayici",
    description: "Yapıştırdığınız Excel formülünü Türkçe olarak adım adım açıklar.",
  },
];

const finansAraclar: Tool[] = [
  {
    name: "IBAN Doğrulama",
    href: "/excel-araclari/iban-dogrulama",
    description: "IBAN numaralarını doğrulayın (TR ve uluslararası MOD-97).",
  },
  {
    name: "Faiz Hesaplama",
    href: "/excel-araclari/faiz-hesaplama",
    description: "Basit ve bileşik faiz tutarını hesaplayın.",
  },
  {
    name: "Kredi Taksit Hesaplama",
    href: "/excel-araclari/kredi-taksit",
    description: "Aylık taksit, toplam geri ödeme ve toplam faizi hesaplayın.",
  },
  {
    name: "Yüzde Hesaplama",
    href: "/excel-araclari/yuzde-hesaplama",
    description: "X'in Y%'si kaç? A, B'nin yüzde kaçı? KDV, komisyon, marj.",
  },
];

const istatistikAraclar: Tool[] = [
  {
    name: "Ortalama, Medyan, Standart Sapma Hesaplama",
    href: "/excel-araclari/betimsel-istatistik",
    description: "Betimsel istatistik: ortalama, medyan, mod, standart sapma, varyans, min, max — sayı listesinden tek seferde.",
  },
  {
    name: "Çeyrek (Quartile) ve Yüzdelik Hesaplama",
    href: "/excel-araclari/ceyrek-yuzdelik",
    description: "Quartile ve percentile hesaplama: minimum, Q1, medyan, Q3, maksimum ve özel yüzdelik dilimi (örn. %90).",
  },
  {
    name: "Korelasyon Hesaplama (Pearson)",
    href: "/excel-araclari/korelasyon",
    description: "İki değişken (X, Y) arasındaki Pearson korelasyon katsayısı r — ücretsiz korelasyon hesaplama.",
  },
  {
    name: "Z Skor (Z-Score) Hesaplama",
    href: "/excel-araclari/z-score",
    description: "Z skor hesaplama: her değerin z-skoru, aykırı değer tespiti.",
  },
  {
    name: "Frekans Dağılımı Hesaplama",
    href: "/excel-araclari/frekans-dagilimi",
    description: "Sayıları sınıf aralıklarına bölerek frekans tablosu (histogram verisi) oluşturma.",
  },
  {
    name: "Regresyon Hesaplama (Doğrusal)",
    href: "/excel-araclari/basit-regresyon",
    description: "Basit doğrusal regresyon: Y = a + b·X, eğim, kesişim ve R² — iki sütun X, Y.",
  },
];

const databaseAraclar: Tool[] = [
  {
    name: "Excel → SQL INSERT Dönüştürücü",
    href: "/excel-araclari/excel-sql-insert",
    description: "Excel tablosunu SQL INSERT komutlarına dönüştürür. Veritabanına veri eklemek için kullanılır.",
  },
  {
    name: "Excel → JSON Dönüştürücü",
    href: "/excel-araclari/excel-json",
    description: "Excel veya CSV verisini JSON formatına çevirir. API ve yazılım geliştirme için kullanılır.",
  },
  {
    name: "İki Listeyi Karşılaştır",
    href: "/excel-araclari/iki-listeyi-karsilastir",
    description: "İki listeyi karşılaştırır ve ortak veya farklı kayıtları bulur.",
  },
  {
    name: "E-posta Liste Temizleme",
    href: "/excel-araclari/email-liste-temizleme",
    description: "E-posta listesinde tekrar eden veya geçersiz formatta olan adresleri temizler.",
  },
  {
    name: "Telefon Numarası Formatlama",
    href: "/excel-araclari/telefon-formatlama",
    description: "Telefon numaralarını standart formata çevirir (yerel, uluslararası, parantez, boşluk/tire/nokta).",
  },
];

const SECTIONS: { id: string; title: string; subtitle: string; icon: string; tools: Tool[] }[] = [
  {
    id: "hizli",
    title: "Hızlı İşlem",
    subtitle: "Anında kullan: metin, veri, tarih ve sayı araçları",
    icon: "⚡",
    tools: hizliAraclar,
  },
  {
    id: "mantik",
    title: "Mantık & Formül",
    subtitle: "DÜŞEYARA, EĞER formül oluşturucu ve formül açıklayıcı — eğitimde kullanın",
    icon: "🧮",
    tools: mantikFormulAraclar,
  },
  {
    id: "finans",
    title: "Finans & Bankacılık",
    subtitle: "IBAN, faiz, kredi taksit, yüzde, vade hesaplamaları",
    icon: "💰",
    tools: finansAraclar,
  },
  {
    id: "istatistik",
    title: "Excel Veri Analizi Araçları",
    subtitle: "İstatistik araçları: çeyrek, yüzdelik, z skor, korelasyon, regresyon",
    icon: "📊",
    tools: istatistikAraclar,
  },
  {
    id: "database",
    title: "Database & Veri Dönüştürme",
    subtitle: "Excel ile veritabanı arasında veri taşıma ve dönüştürme",
    icon: "🗄️",
    tools: databaseAraclar,
  },
];

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={tool.href}
      className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-emerald-300 hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">
          {tool.name}
        </h3>
        <p className="mt-1 text-[13px] leading-relaxed text-gray-500">
          {tool.description}
        </p>
      </div>
      <span className="mt-0.5 flex-shrink-0 text-gray-300 group-hover:text-emerald-500 transition-colors">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

export default function ToolsHub() {
  const totalTools = SECTIONS.reduce((sum, s) => sum + s.tools.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/80">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200"
            aria-label="Ana Sayfa"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">Excel Araçları</h1>
          </div>
          <span
            className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
            style={{ background: ACCENT }}
          >
            {totalTools} araç
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
        {/* SEO description */}
        <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-[13px] leading-relaxed text-slate-600">
          Ücretsiz Excel araçları: hızlı işlem (ad soyad ayırma, CSV kolonlara ayırma, liste birleştirme, sayıyı yazıya çevirme, boşluk temizleme, büyük/küçük harf, tarih farkı, tarih format dönüştürme, Excel dosya birleştirme); mantık & formül (formül asistanı, DÜŞEYARA ve EĞER oluşturucu, formül açıklayıcı); finans (IBAN doğrulama, faiz, kredi taksit, yüzde); istatistik (betimsel istatistik, çeyrek-yüzdelik, korelasyon, z skor, regresyon); database & veri dönüştürme (Excel → SQL INSERT, Excel → JSON, iki listeyi karşılaştır, e-posta temizleme, telefon formatlama). Tarayıcıda çalışır, kurulum gerekmez.
        </p>

        {/* Quick nav */}
        <div className="mb-6 flex flex-wrap gap-2">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
            >
              {section.icon} {section.title}
            </a>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section, index) => (
            <section key={section.id} id={section.id}>
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                  style={{ background: ACCENT }}
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900">{section.title}</h2>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{section.subtitle}</p>
                </div>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {section.tools.map((tool) => (
                  <ToolCard key={tool.href} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="pb-6 pt-4 text-center text-xs text-gray-400">
        Ofis Akademi · Excel & Veri Analizi
      </footer>
    </div>
  );
}
