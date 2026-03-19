"use client";

import Link from "next/link";
import PageRibbon from "@/components/PageRibbon";
import { THEME } from "@/lib/theme";

const SEVIYELER = [
  {
    slug: "temel",
    name: "Seviye 1 — Temel",
    title: "Hızlı Başlangıç & Temel Beceriler",
    description: "Temel formüller (TOPLA, ORTALAMA, MİN, MAKS, EĞER), tablo yapısı, veri temizleme ve filtreleme, kısayollar ve hızlı biçimlendirme. Excel’e yeni başlayanlar için.",
    href: "/egitimler/temel",
  },
  {
    slug: "orta",
    name: "Seviye 2 — Orta",
    title: "İşte Gerçekten Kullandığın Formüller",
    description: "DÜŞEYARA / XLOOKUP, iç içe EĞER, VE, VEYA. Koşullu toplama ve sayma: EĞERSAY, ÇOKETOPLA, ÇOKEĞERSAY. Metin fonksiyonları: SAĞ, SOL, PARÇAAL, BİRLEŞTİR, METNEBİRLEŞTİR.",
    href: "/egitimler/orta",
  },
  {
    slug: "ileri",
    name: "Seviye 3 — İleri",
    title: "PivotTable, Dashboard & Veri Analizi",
    description: "PivotTable ile özet raporlar ve dilimleyiciler. Grafikler, mini grafikler ve gösterge panelleri. Gelişmiş fonksiyonlar: FİLTRE, SIRALA, BENZERSİZ, DÜŞEYARA+EĞERHATA.",
    href: "/egitimler/ileri",
  },
];

/** Eğitimlerde kullanılacak araçlar (seviye değil; eğitimle birlikte kullanılan şablon ve kartlar) */
const EGITICI_ARACLAR = [
  {
    name: "Otomatik Rapor Şablonları",
    href: "/excel-araclari/rapor-sablonlari",
    description: "Haftalık satış, stok ve performans raporları için örnek veri setleri ve hazır formüllü Excel şablonları. Eğitimde uygulama dosyası olarak kullanılır.",
  },
  {
    name: "Hata Kontrol Checklist'i",
    href: "/excel-araclari/hata-kontrol-checklist",
    description: "Dosya teslim etmeden önce formül, bağlantı ve hücre güvenliği kontrollerini adım adım işaretle. Eğitim sonrası pratik için.",
  },
  {
    name: "Kısayol & Formül Kartları",
    href: "/excel-araclari/ksayol-formul-kartlari",
    description: "En çok kullanılan Excel kısayolları ve formülleri tek sayfada — PDF indir, yazdır, eğitim sırasında masanda referans olsun.",
  },
];

export default function EgitimlerPage() {
  return (
    <div className="min-h-screen bg-[#e2e8ec]" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Excel Eğitim İçerikleri"
        description="Temel, orta ve ileri seviye: konular ofisteki gerçek problemler üzerinden; her bölüm kendi dosyası ve egzersizleriyle gelir."
      />

      <div className="mx-4 mt-2 mb-6 max-w-5xl">
        <p className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700">
          Excel eğitimleri temelden ileri seviyeye net bir yol haritası sunar. Her seviyede kendi örnek dosyası ve egzersizleri bulunur; konular ofiste karşılaşılan gerçek senaryolar üzerinden işlenir.
        </p>

        {/* 1 — Eğitim seviyeleri */}
        <section id="egitim-seviyeleri" className="mb-10">
          <div className="flex items-start gap-3 mb-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: THEME.ribbon }}>
              1
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-800">Eğitim seviyeleri</h2>
              <p className="text-xs text-gray-500 mt-0.5">Temel, orta ve ileri seviye içerikleri; her biri kendi dosyası ve egzersizleriyle</p>
            </div>
          </div>
          <div
            className="overflow-hidden rounded-b shadow-lg border border-t-0"
            style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
          >
            <div className="flex border-b" style={{ background: THEME.cornerBg, borderColor: THEME.gridLine }}>
              <div className="w-12 flex-shrink-0 border-r flex items-center justify-center text-xs font-semibold text-gray-600 py-2" style={{ borderColor: THEME.gridLine }} />
              <div className="flex-1 border-r px-3 py-2 text-xs font-semibold text-gray-700" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>Seviye</div>
              <div className="flex-[2] border-r px-3 py-2 text-xs font-semibold text-gray-700" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>Açıklama</div>
              <div className="w-28 flex-shrink-0 px-3 py-2 text-xs font-semibold text-gray-700 text-center" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>İşlem</div>
            </div>
            {SEVIYELER.map((level, i) => (
            <div
              key={level.slug}
              className="flex border-b last:border-b-0 group hover:bg-[#f0f7f4] transition-colors"
              style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}
            >
              <div
                className="w-12 flex-shrink-0 border-r flex items-center justify-center text-xs text-gray-500 py-3"
                style={{ borderColor: THEME.gridLine, background: THEME.headerBg }}
              >
                {i + 1}
              </div>
              <div className="flex-1 border-r px-3 py-3" style={{ borderColor: THEME.gridLine }}>
                <div className="text-sm font-semibold text-gray-900">{level.name}</div>
                <div className="text-xs text-gray-600 mt-0.5">{level.title}</div>
              </div>
              <div className="flex-[2] border-r px-3 py-3 text-sm text-gray-600" style={{ borderColor: THEME.gridLine }}>
                {level.description}
              </div>
              <div className="w-28 flex-shrink-0 flex items-center justify-center p-2" style={{ borderColor: THEME.gridLine }}>
                <Link
                  href={level.href}
                  className="inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                  style={{ background: THEME.ribbon }}
                >
                  Aç
                </Link>
              </div>
            </div>
          ))}
          </div>
        </section>

        {/* 2 — Eğitici araçlar (eğitimlerde kullanılacak araçlar) */}
        <section className="mb-10">
          <div className="flex items-start gap-3 mb-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: THEME.ribbon }}>
              2
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-800">Eğitici araçlar</h2>
              <p className="text-xs text-gray-500 mt-0.5">Eğitim seviyeleri değil; eğitimlerle birlikte kullanacağınız şablonlar, checklist ve kısayol kartları</p>
            </div>
          </div>
          <div
            className="overflow-hidden rounded-b shadow-lg border border-t-0"
            style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
          >
            <div className="flex border-b" style={{ background: THEME.cornerBg, borderColor: THEME.gridLine }}>
              <div className="w-12 flex-shrink-0 border-r flex items-center justify-center text-xs font-semibold text-gray-600 py-2" style={{ borderColor: THEME.gridLine }} />
              <div className="flex-1 border-r px-3 py-2 text-xs font-semibold text-gray-700" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>Araç</div>
              <div className="flex-[2] border-r px-3 py-2 text-xs font-semibold text-gray-700" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>Açıklama</div>
              <div className="w-28 flex-shrink-0 px-3 py-2 text-xs font-semibold text-gray-700 text-center" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>İşlem</div>
            </div>
            {EGITICI_ARACLAR.map((tool, i) => (
              <div
                key={tool.href}
                className="flex border-b last:border-b-0 group hover:bg-[#f0f7f4] transition-colors"
                style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}
              >
                <div className="w-12 flex-shrink-0 border-r flex items-center justify-center text-xs text-gray-500 py-3" style={{ borderColor: THEME.gridLine, background: THEME.headerBg }}>
                  {i + 1}
                </div>
                <div className="flex-1 border-r px-3 py-3 text-sm font-medium text-gray-900" style={{ borderColor: THEME.gridLine }}>{tool.name}</div>
                <div className="flex-[2] border-r px-3 py-3 text-sm text-gray-600" style={{ borderColor: THEME.gridLine }}>{tool.description}</div>
                <div className="w-28 flex-shrink-0 flex items-center justify-center p-2" style={{ borderColor: THEME.gridLine }}>
                  <Link href={tool.href} className="inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90" style={{ background: THEME.ribbon }}>
                    Aç
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="text-center text-xs text-gray-500 pb-4">
        Ofis Akademi · Excel & Veri Analizi
      </div>
    </div>
  );
}
