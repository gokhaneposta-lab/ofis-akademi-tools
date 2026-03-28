"use client";

import Link from "next/link";

const ACCENT = "#217346";

const SEVIYELER = [
  {
    slug: "temel",
    name: "Seviye 1 — Temel",
    title: "Hızlı Başlangıç & Temel Beceriler",
    description:
      "Temel formüller (TOPLA, ORTALAMA, MİN, MAKS, EĞER), tablo yapısı, veri temizleme ve filtreleme, kısayollar ve hızlı biçimlendirme. Excel'e yeni başlayanlar için.",
    href: "/egitimler/temel",
    icon: "🟢",
  },
  {
    slug: "orta",
    name: "Seviye 2 — Orta",
    title: "İşte Gerçekten Kullandığın Formüller",
    description:
      "DÜŞEYARA / XLOOKUP, iç içe EĞER, VE, VEYA. Koşullu toplama ve sayma: EĞERSAY, ÇOKETOPLA, ÇOKEĞERSAY. Metin fonksiyonları: SAĞ, SOL, PARÇAAL, BİRLEŞTİR, METNEBİRLEŞTİR.",
    href: "/egitimler/orta",
    icon: "🟡",
  },
  {
    slug: "ileri",
    name: "Seviye 3 — İleri",
    title: "PivotTable, Dashboard & Veri Analizi",
    description:
      "PivotTable ile özet raporlar ve dilimleyiciler. Grafikler, mini grafikler ve gösterge panelleri. Gelişmiş fonksiyonlar: FİLTRE, SIRALA, BENZERSİZ, DÜŞEYARA+EĞERHATA.",
    href: "/egitimler/ileri",
    icon: "🔴",
  },
];

const EGITICI_ARACLAR = [
  {
    name: "Otomatik Rapor Şablonları",
    href: "/excel-araclari/rapor-sablonlari",
    description:
      "Haftalık satış, stok ve performans raporları için örnek veri setleri ve hazır formüllü Excel şablonları. Eğitimde uygulama dosyası olarak kullanılır.",
    icon: "📊",
  },
  {
    name: "Hata Kontrol Checklist'i",
    href: "/excel-araclari/hata-kontrol-checklist",
    description:
      "Dosya teslim etmeden önce formül, bağlantı ve hücre güvenliği kontrollerini adım adım işaretle. Eğitim sonrası pratik için.",
    icon: "✅",
  },
  {
    name: "Kısayol & Formül Kartları",
    href: "/excel-araclari/ksayol-formul-kartlari",
    description:
      "En çok kullanılan Excel kısayolları ve formülleri tek sayfada — PDF indir, yazdır, eğitim sırasında masanda referans olsun.",
    icon: "🃏",
  },
];

export default function EgitimlerPage() {
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
            <h1 className="text-lg font-bold text-gray-900 truncate">Excel Eğitim İçerikleri</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
        {/* Description */}
        <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-[13px] leading-relaxed text-slate-600">
          Excel eğitimleri temelden ileri seviyeye net bir yol haritası sunar. Her seviyede kendi
          örnek dosyası ve egzersizleri bulunur; konular ofiste karşılaşılan gerçek senaryolar
          üzerinden işlenir.
        </p>

        {/* Section 1: Training levels */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
              style={{ background: ACCENT }}
            >
              1
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900">Eğitim Seviyeleri</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Temel, orta ve ileri seviye içerikleri; her biri kendi dosyası ve egzersizleriyle
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {SEVIYELER.map((level) => (
              <Link
                key={level.slug}
                href={level.href}
                className="group block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-emerald-300 hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-2xl flex-shrink-0">{level.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {level.name}
                    </h3>
                    <p className="mt-0.5 text-[13px] font-medium text-emerald-700/80">
                      {level.title}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
                      {level.description}
                    </p>
                  </div>
                  <span className="mt-1 flex-shrink-0 text-gray-300 group-hover:text-emerald-500 transition-colors">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 2: Training tools */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
              style={{ background: ACCENT }}
            >
              2
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900">Eğitici Araçlar</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Eğitimlerle birlikte kullanacağınız şablonlar, checklist ve kısayol kartları
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {EGITICI_ARACLAR.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-emerald-300 hover:shadow-md active:scale-[0.98]"
              >
                <span className="mt-0.5 text-xl flex-shrink-0">{tool.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-gray-500">
                    {tool.description}
                  </p>
                </div>
                <span className="mt-1 flex-shrink-0 text-gray-300 group-hover:text-emerald-500 transition-colors">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

    </div>
  );
}
