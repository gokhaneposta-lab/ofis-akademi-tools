"use client";

import Link from "next/link";
import PageRibbon from "@/components/PageRibbon";
import { THEME } from "@/lib/theme";

type Tool = {
  name: string;
  href: string;
  description: string;
};

const egiticiAraclar: Tool[] = [
  {
    name: "Otomatik Rapor Şablonları",
    href: "/excel-araclari/rapor-sablonlari",
    description:
      "Haftalık satış, stok ve performans raporları için örnek veri setleri ve hazır formüllü Excel şablonları.",
  },
  {
    name: "Hata Kontrol Checklist'i",
    href: "/excel-araclari/hata-kontrol-checklist",
    description:
      "Dosya teslim etmeden önce formül, bağlantı ve hücre güvenliği kontrollerini adım adım işaretle.",
  },
  {
    name: "Kısayol & Formül Kartları",
    href: "/excel-araclari/ksayol-formul-kartlari",
    description:
      "En çok kullanılan Excel kısayolları ve formülleri tek sayfada — PDF indir, yazdır, masana as.",
  },
];

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
    name: "Hafta Numarası & Gün Adı",
    href: "/excel-araclari/hafta-gun",
    description: "Tarihten ISO hafta numarası ve gün adı (Pazartesi, Salı…).",
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
  {
    name: "Tarih Farkı (Vade / Gün)",
    href: "/excel-araclari/tarih-farki",
    description: "İki tarih arasındaki gün sayısını hesaplayın.",
  },
];

const istatistikAraclar: Tool[] = [
  {
    name: "Betimsel İstatistik",
    href: "/excel-araclari/betimsel-istatistik",
    description: "Ortalama, medyan, mod, standart sapma, varyans, min, max, açıklık — sayı listesinden tek seferde.",
  },
  {
    name: "Çeyrekler & Yüzdelik",
    href: "/excel-araclari/ceyrek-yuzdelik",
    description: "Minimum, Q1, medyan, Q3, maksimum ve özel yüzdelik dilimi (örn. %90).",
  },
  {
    name: "Korelasyon (Pearson)",
    href: "/excel-araclari/korelasyon",
    description: "İki değişken (X, Y) arasındaki Pearson korelasyon katsayısı r.",
  },
  {
    name: "Z-Skor",
    href: "/excel-araclari/z-score",
    description: "Her değerin z-skoru; aykırı değer tespiti için.",
  },
  {
    name: "Frekans Dağılımı",
    href: "/excel-araclari/frekans-dagilimi",
    description: "Sayıları sınıf aralıklarına bölerek frekans tablosu (histogram verisi).",
  },
  {
    name: "Basit Doğrusal Regresyon",
    href: "/excel-araclari/basit-regresyon",
    description: "Y = a + b·X: eğim, kesişim ve R² — iki sütun X, Y.",
  },
];

const SECTIONS: { id: string; title: string; subtitle: string; tools: Tool[] }[] = [
  {
    id: "ogrenme",
    title: "Öğrenme & pratik",
    subtitle: "Eğitici araçlar: şablonlar, checklist, kısayol kartları",
    tools: egiticiAraclar,
  },
  {
    id: "hizli",
    title: "Hızlı işlem",
    subtitle: "Anında kullan: metin, veri, tarih ve sayı araçları",
    tools: hizliAraclar,
  },
  {
    id: "finans",
    title: "Finans & bankacılık",
    subtitle: "IBAN, faiz, kredi taksit, yüzde, vade hesaplamaları",
    tools: finansAraclar,
  },
  {
    id: "istatistik",
    title: "İstatistik",
    subtitle: "Betimsel istatistik, çeyrekler, korelasyon, regresyon",
    tools: istatistikAraclar,
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
        description="Dört ana başlıkta: öğrenme & pratik, hızlı işlem, finans & bankacılık, istatistik."
      />

      <div className="mx-4 mt-2 mb-6 max-w-5xl">
        <p className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700">
          Ücretsiz Excel araçları ile ad soyad ayırma, CSV verilerini sütunlara ayırma, liste birleştirme, sayıyı yazıya çevirme ve veri temizleme işlemlerini tarayıcıda saniyeler içinde yapabilirsiniz. Ofis Akademi Excel araçları kurulum gerektirmez ve tamamen ücretsizdir.
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
