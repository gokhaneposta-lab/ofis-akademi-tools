"use client";

import Link from "next/link";
import PageRibbon from "@/components/PageRibbon";
import { THEME } from "@/lib/theme";

const tools = [
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
    name: "Kısayol & Formül Kartları",
    href: "/excel-araclari/ksayol-formul-kartlari",
    description:
      "En çok kullanılan Excel kısayolları ve formülleri tek sayfada — PDF indir, yazdır, masana as.",
  },
];

export default function ToolsHub() {
  return (
    <div className="min-h-screen bg-[#e2e8ec]" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Excel Araçları"
        description="Ad soyad ayırma, CSV sütunlara bölme ve liste birleştirme gibi işlemleri saniyeler içinde yapın."
      />

      {/* Sayfa alanı - tablo görünümü */}
      <div
        className="mx-4 mt-2 mb-6 overflow-hidden rounded-b shadow-lg border border-t-0"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        {/* Sütun başlıkları */}
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

        {/* Satırlar */}
        {tools.map((tool, i) => (
          <div
            key={tool.href}
            className="flex border-b group hover:bg-[#f0f7f4] transition-colors"
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

      <div className="text-center text-xs text-gray-500 pb-4">
        {"Ofis Akademi · Excel & Veri Analizi"}
      </div>
    </div>
  );
}
