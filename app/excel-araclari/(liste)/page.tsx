"use client";

import Link from "next/link";
import { site } from "@/components/siteUi";

const ACCENT = "#217346";

type Tool = {
  name: string;
  href: string;
  description: string;
};

const temizleme: Tool[] = [
  {
    name: "Boşluk Temizle",
    href: "/excel-araclari/bosluk-temizle",
    description: "TRIM + isteğe bağlı boş satır silme. Eşleştirme öncesi kirli metni temizler.",
  },
  {
    name: "Büyük / Küçük Harf",
    href: "/excel-araclari/buyuk-kucuk-harf",
    description: "UPPER, LOWER, PROPER — toplu harf dönüşümü.",
  },
  {
    name: "Tekrarlananları Kaldır",
    href: "/excel-araclari/tekrarlananlari-kaldir",
    description: "Listedeki yinelenen satırları kaldırır; benzersiz liste üretir.",
  },
  {
    name: "Sadece Sayı / Sadece Metin",
    href: "/excel-araclari/sayi-metin-ayikla",
    description: "Karışık hücrelerden yalnızca rakam veya yalnızca harf ayıklar.",
  },
  {
    name: "Şirket Ünvanı Temizleyici",
    href: "/excel-araclari/sirket-unvan-temizle",
    description: "A.Ş., Ltd. Şti., Anonim Şirket eklerini kaldırır.",
  },
  {
    name: "Türkçe → Slugify",
    href: "/excel-araclari/turkce-slugify",
    description: "Şaziye Çeşme → saziye-cesme; URL ve e-posta için.",
  },
  {
    name: "Veri Ayıklayıcı",
    href: "/excel-araclari/veri-ayikla",
    description: "Metinden e-posta, web adresi veya IP’leri preset ile çeker.",
  },
  {
    name: "E-posta Liste Temizleme",
    href: "/excel-araclari/email-liste-temizleme",
    description: "Geçersiz ve tekrarlayan e-posta adreslerini ayıklar.",
  },
  {
    name: "Telefon Numarası Formatlama",
    href: "/excel-araclari/telefon-formatlama",
    description: "Numaraları standart yerel / uluslararası forma getirir.",
  },
  {
    name: "Ad Soyad Ayırıcı",
    href: "/excel-araclari/ad-soyad-ayir",
    description: "Tam adı ad ve soyad sütunlarına ayırır.",
  },
];

const donusturuculer: Tool[] = [
  {
    name: "CSV Ayırıcı",
    href: "/excel-araclari/csv-ayir",
    description: "CSV / ayraçlı metni sütunlara böler.",
  },
  {
    name: "CSV Validator",
    href: "/excel-araclari/csv-dogrula",
    description: "Ayırıcı, sütun tutarlılığı ve bozuk satırları kontrol eder.",
  },
  {
    name: "Metni Kolonlara Böl",
    href: "/excel-araclari/kolonlara-bol",
    description: "Virgül, noktalı virgül veya sekme ile kolonlara ayırır.",
  },
  {
    name: "Liste Birleştir / Ayır",
    href: "/excel-araclari/liste-birlestir",
    description: "Dikey↔yatay: satırları birleştir veya virgüllü listeyi alt alta ayır.",
  },
  {
    name: "Excel → Markdown Tablo",
    href: "/excel-araclari/excel-markdown",
    description: "Excel tablosunu Notion / GitHub Markdown tablosuna çevirir.",
  },
  {
    name: "Satır / Sütun Döndür",
    href: "/excel-araclari/transpoz",
    description: "Transpoz: satır ↔ sütun.",
  },
  {
    name: "Excel Dosya Birleştirici",
    href: "/excel-araclari/excel-dosya-birlestirici",
    description: "Aynı kolonlu Excel dosyalarını alt alta birleştirir.",
  },
  {
    name: "Excel → SQL INSERT",
    href: "/excel-araclari/excel-sql-insert",
    description: "Tabloyu INSERT komutlarına çevirir.",
  },
  {
    name: "SQL IN Formatter",
    href: "/excel-araclari/sql-in-formatter",
    description: "Listeyi WHERE … IN (…) formatına çevirir.",
  },
  {
    name: "SQL UPDATE Formatter",
    href: "/excel-araclari/sql-update-formatter",
    description: "Excel’den toplu UPDATE üretir.",
  },
  {
    name: "Excel ⇄ JSON",
    href: "/excel-araclari/excel-json",
    description: "Tablo ↔ JSON iki yönlü dönüşüm.",
  },
  {
    name: "Tarih Format Dönüştürücü",
    href: "/excel-araclari/tarih-format-donusturucu",
    description: "Tarih biçimlerini birbirine çevirir.",
  },
];

const finans: Tool[] = [
  {
    name: "Sayıyı Yazıya Çevir",
    href: "/excel-araclari/sayi-yaziya",
    description: "Tutarı Türkçe yazıya çevirir (fatura / çek).",
  },
  {
    name: "KDV Hesaplama",
    href: "/excel-araclari/kdv-hesapla",
    description: "KDV dahil / hariç matrah ve tutar.",
  },
  {
    name: "Yüzde Hesaplama",
    href: "/excel-araclari/yuzde-hesaplama",
    description: "X’in Y%’si veya A’nın B içindeki payı.",
  },
  {
    name: "IBAN Doğrulama",
    href: "/excel-araclari/iban-dogrulama",
    description: "TR ve uluslararası IBAN MOD-97 kontrolü.",
  },
  {
    name: "Faiz Hesaplama",
    href: "/excel-araclari/faiz-hesaplama",
    description: "Basit ve bileşik faiz.",
  },
  {
    name: "Kredi Taksit Hesaplama",
    href: "/excel-araclari/kredi-taksit",
    description: "Aylık taksit, toplam faiz ve geri ödeme.",
  },
  {
    name: "Tarih Farkı (Vade / Gün / Yaş)",
    href: "/excel-araclari/tarih-farki",
    description: "İki tarih arası gün, ay, yıl; vade veya yaş.",
  },
  {
    name: "Hafta Numarası & Gün Adı",
    href: "/excel-araclari/hafta-gun",
    description: "ISO hafta numarası ve gün adı.",
  },
];

const formulYardim: Tool[] = [
  {
    name: "Excel Formül Asistanı",
    href: "/excel-araclari/formul-asistani",
    description: "İhtiyacı yazın; uygun Excel fonksiyonu önerilir.",
  },
  {
    name: "DÜŞEYARA Formül Oluşturucu",
    href: "/excel-araclari/duseyara-olusturucu",
    description: "DÜŞEYARA formülünü adım adım üretir.",
  },
  {
    name: "EĞER Formül Oluşturucu",
    href: "/excel-araclari/eger-olusturucu",
    description: "Koşullu EĞER formülü oluşturur.",
  },
  {
    name: "İç içe EĞER Oluşturucu",
    href: "/excel-araclari/ic-ice-eger-olusturucu",
    description: "Çoklu koşul–sonuç için iç içe EĞER.",
  },
  {
    name: "Excel Formül Açıklayıcı",
    href: "/excel-araclari/formul-aciklayici",
    description: "Formülü Türkçe adım adım açıklar.",
  },
  {
    name: "Hata Kontrol Checklist'i",
    href: "/excel-araclari/hata-kontrol-checklist",
    description: "Teslim öncesi Excel kontrol listesi.",
  },
  {
    name: "Kısayol & Formül Kartları",
    href: "/excel-araclari/kisayol-formul-kartlari",
    description: "Sık kullanılan kısayol ve formül hatırlatıcıları.",
  },
  {
    name: "Otomatik Rapor Şablonları",
    href: "/excel-araclari/rapor-sablonlari",
    description: "Hazır rapor Excel şablonları indirin.",
  },
];

const analiz: Tool[] = [
  {
    name: "İki Listeyi Karşılaştır",
    href: "/excel-araclari/iki-listeyi-karsilastir",
    description: "Ortak, sadece A’da ve sadece B’de kayıtlar.",
  },
  {
    name: "Betimsel İstatistik",
    href: "/excel-araclari/betimsel-istatistik",
    description: "Ortalama, medyan, standart sapma, min/max.",
  },
  {
    name: "Çeyrek ve Yüzdelik",
    href: "/excel-araclari/ceyrek-yuzdelik",
    description: "Q1–Q3 ve özel yüzdelik dilimleri.",
  },
  {
    name: "Korelasyon (Pearson)",
    href: "/excel-araclari/korelasyon",
    description: "İki değişken arası Pearson r.",
  },
  {
    name: "Z Skor",
    href: "/excel-araclari/z-score",
    description: "Z-skor ve aykırı değer tespiti.",
  },
  {
    name: "Frekans Dağılımı",
    href: "/excel-araclari/frekans-dagilimi",
    description: "Sınıf aralıklarına göre frekans tablosu.",
  },
  {
    name: "Grafik Oluşturucu",
    href: "/excel-araclari/grafik-olusturucu",
    description: "Veriyi yapıştır; çubuk, çizgi veya pasta grafik önizle.",
  },
  {
    name: "Basit Regresyon",
    href: "/excel-araclari/basit-regresyon",
    description: "Doğrusal regresyon: eğim, kesişim, R².",
  },
  {
    name: "Kelime & Karakter Sayacı",
    href: "/excel-araclari/kelime-karakter-sayaci",
    description: "Kelime ve karakter sayısı (boşluklu / boşluksuz).",
  },
];

const SECTIONS: { id: string; title: string; subtitle: string; icon: string; tools: Tool[] }[] = [
  {
    id: "temizleme",
    title: "Veri temizleme",
    subtitle: "Kirli listeleri 5 saniyede kullanılabilir hale getirin",
    icon: "🧹",
    tools: temizleme,
  },
  {
    id: "donusturucu",
    title: "Dönüştürücüler",
    subtitle: "CSV, SQL, JSON, liste ve dosya dönüşümleri",
    icon: "🔄",
    tools: donusturuculer,
  },
  {
    id: "finans",
    title: "Finans & doğrulama",
    subtitle: "Tutar, KDV, faiz, IBAN ve tarih hesapları",
    icon: "💰",
    tools: finans,
  },
  {
    id: "formul",
    title: "Formül & Excel yardımı",
    subtitle: "Formül üret, açıkla, kontrol et, şablon indir",
    icon: "🧮",
    tools: formulYardim,
  },
  {
    id: "analiz",
    title: "Veri analizi",
    subtitle: "Liste kıyası ve istatistik araçları",
    icon: "📊",
    tools: analiz,
  },
];

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={tool.href}
      className="group flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition hover:border-emerald-400/60 hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)] active:scale-[0.99]"
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-semibold leading-snug text-gray-900 transition-colors group-hover:text-emerald-700">
          {tool.name}
        </h3>
        <p className="mt-1 text-[13px] leading-relaxed text-gray-500">{tool.description}</p>
      </div>
      <span className="mt-0.5 flex-shrink-0 text-gray-300 transition-colors group-hover:text-emerald-500">
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
    <div className={site.toolPageBg}>
      <header className={site.toolHeader}>
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            aria-label="Ana Sayfa"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-slate-900">Ofis araçları</h1>
            <p className="truncate text-xs text-slate-500">Tarayıcıda çalışan ücretsiz veri araçları</p>
          </div>
          <span
            className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm"
            style={{ background: ACCENT }}
          >
            {totalTools} araç
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
        <p className="mb-6 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm leading-relaxed text-slate-600 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
          Ofis çalışanlarının her gün yaşadığı küçük problemler: temizleme, dönüştürme, finans, formül ve analiz.
          Verileriniz tarayıcınızda işlenir; kurulum gerekmez.
        </p>

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
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{section.subtitle}</p>
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
    </div>
  );
}
