"use client";

import Link from "next/link";
import PageRibbon from "@/components/PageRibbon";
import { THEME } from "@/lib/theme";

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

const SECTIONS: { id: string; title: string; subtitle: string; tools: Tool[] }[] = [
  {
    id: "hizli",
    title: "Hızlı işlem",
    subtitle: "Anında kullan: metin, veri, tarih ve sayı araçları",
    tools: hizliAraclar,
  },
  {
    id: "mantik",
    title: "Mantık & Formül",
    subtitle: "DÜŞEYARA, EĞER formül oluşturucu ve formül açıklayıcı — eğitimde kullanın",
    tools: mantikFormulAraclar,
  },
  {
    id: "finans",
    title: "Finans & bankacılık",
    subtitle: "IBAN, faiz, kredi taksit, yüzde, vade hesaplamaları",
    tools: finansAraclar,
  },
  {
    id: "istatistik",
    title: "Excel Veri Analizi Araçları",
    subtitle: "İstatistik araçları: çeyrek hesaplama, yüzdelik hesaplama, z skor, korelasyon hesaplama, regresyon",
    tools: istatistikAraclar,
  },
  {
    id: "database",
    title: "Database & Veri Dönüştürme Araçları",
    subtitle: "Excel ile veritabanı arasında veri taşıma ve dönüştürme: SQL INSERT, aktarım",
    tools: databaseAraclar,
  },
];

function ToolTable({
  tools,
  title,
  subtitle,
}: {
  tools: Tool[];
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      {title ? <h2 className="mb-1 text-base font-bold text-gray-800">{title}</h2> : null}
      {subtitle ? <p className="mb-3 text-xs text-gray-500">{subtitle}</p> : null}
      <div
        className="overflow-hidden rounded-b shadow-lg border border-t-0"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <div
          className="flex border-b"
          style={{ background: THEME.cornerBg, borderColor: THEME.gridLine }}
        >
          <div
            className="w-12 flex-shrink-0 border-r flex items-center justify-center text-xs font-semibold text-gray-600 py-2"
            style={{ borderColor: THEME.gridLine }}
          />
          <div
            className="flex-1 border-r px-3 py-2 text-xs font-semibold text-gray-700"
            style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}
          >
            A — Araç
          </div>
          <div
            className="flex-[2] border-r px-3 py-2 text-xs font-semibold text-gray-700"
            style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}
          >
            B — Açıklama
          </div>
          <div
            className="w-28 flex-shrink-0 px-3 py-2 text-xs font-semibold text-gray-700 text-center"
            style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}
          >
            İşlem
          </div>
        </div>
        {tools.map((tool, i) => (
          <div
            key={tool.href}
            className="flex border-b group hover:bg-[#f0f7f4] transition-colors last:border-b-0"
            style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}
          >
            <div
              className="w-12 flex-shrink-0 border-r flex items-center justify-center text-xs text-gray-500 py-3"
              style={{ borderColor: THEME.gridLine, background: THEME.headerBg }}
            >
              {i + 1}
            </div>
            <div
              className="flex-1 border-r px-3 py-3 text-sm font-medium text-gray-900"
              style={{ borderColor: THEME.gridLine }}
            >
              {tool.name}
            </div>
            <div
              className="flex-[2] border-r px-3 py-3 text-sm text-gray-600"
              style={{ borderColor: THEME.gridLine }}
            >
              {tool.description}
            </div>
            <div
              className="w-28 flex-shrink-0 flex items-center justify-center p-2"
              style={{ borderColor: THEME.gridLine }}
            >
              <Link
                href={tool.href}
                className="inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                style={{ background: THEME.ribbon }}
              >
                Aç
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ToolsHub() {
  return (
    <div className="min-h-screen bg-[#e2e8ec]" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Excel Araçları"
        description="Beş ana başlıkta: hızlı işlem, mantık & formül, finans & bankacılık, istatistik, database & veri dönüştürme."
      />

      <div className="mx-4 mt-2 mb-6 max-w-5xl">
        <p className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700">
          Ücretsiz Excel araçları: hızlı işlem (ad soyad ayırma, CSV kolonlara ayırma, liste birleştirme, sayıyı yazıya çevirme, boşluk temizleme, büyük/küçük harf, tarih farkı, tarih format dönüştürme, Excel dosya birleştirme); mantık & formül (formül asistanı, DÜŞEYARA ve EĞER oluşturucu, formül açıklayıcı); finans (IBAN doğrulama, faiz, kredi taksit, yüzde); istatistik (betimsel istatistik, çeyrek-yüzdelik, korelasyon, z skor, regresyon); database & veri dönüştürme (Excel → SQL INSERT, Excel → JSON, iki listeyi karşılaştır, e-posta temizleme, telefon formatlama). Tarayıcıda çalışır, kurulum gerekmez. Ofis Akademi.
        </p>
        {SECTIONS.map((section, index) => (
          <section
            key={section.id}
            className="mb-10 rounded-xl border bg-white p-5 sm:p-6 shadow-sm"
            style={{ borderColor: THEME.gridLine }}
          >
            <div className="flex items-start gap-3 mb-4">
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: THEME.ribbon }}
            >
              {index + 1}
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-800">{section.title}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{section.subtitle}</p>
            </div>
          </div>
          <ToolTable tools={section.tools} title="" subtitle="" />
          </section>
        ))}
      </div>

      <div className="text-center text-xs text-gray-500 pb-4">
        {"Ofis Akademi · Excel & Veri Analizi"}
      </div>
    </div>
  );
}
