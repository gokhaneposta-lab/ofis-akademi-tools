"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

const ACCENT = "#217346";

type NavItem = {
  label: string;
  href: string;
};

type NavSection = {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
};

const NAV: NavSection[] = [
  {
    label: "Ana Sayfa",
    href: "/",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
      </svg>
    ),
  },
  {
    label: "Excel Araçları",
    href: "/excel-araclari",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    children: [
      { label: "Tüm Araçlar", href: "/excel-araclari" },
      { label: "Ad Soyad Ayırıcı", href: "/excel-araclari/ad-soyad-ayir" },
      { label: "CSV Ayırıcı", href: "/excel-araclari/csv-ayir" },
      { label: "Liste Birleştirici", href: "/excel-araclari/liste-birlestir" },
      { label: "Formül Asistanı", href: "/excel-araclari/formul-asistani" },
      { label: "DÜŞEYARA Oluşturucu", href: "/excel-araclari/duseyara-olusturucu" },
      { label: "EĞER Oluşturucu", href: "/excel-araclari/eger-olusturucu" },
      { label: "IBAN Doğrulama", href: "/excel-araclari/iban-dogrulama" },
      { label: "Faiz Hesaplama", href: "/excel-araclari/faiz-hesaplama" },
      { label: "Kredi Taksit", href: "/excel-araclari/kredi-taksit" },
      { label: "Betimsel İstatistik", href: "/excel-araclari/betimsel-istatistik" },
      { label: "Korelasyon (Pearson)", href: "/excel-araclari/korelasyon" },
    ],
  },
  {
    label: "Eğitimler",
    href: "/egitimler",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
    children: [
      { label: "Tüm Eğitim Seviyeleri", href: "/egitimler" },
      { label: "Seviye 1 · Temel", href: "/egitimler/temel" },
      { label: "Seviye 2 · Orta", href: "/egitimler/orta" },
      { label: "Seviye 3 · İleri", href: "/egitimler/ileri" },
    ],
  },
  {
    label: "Blog",
    href: "/blog",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    label: "Formül Kütüphanesi",
    href: "/formul-kutuphanesi",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: "Finans & Sigorta",
    href: "/finans-sigorta",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    children: [
      { label: "Tüm Metrikler", href: "/finans-sigorta" },
      { label: "Hasar/Prim Oranı", href: "/finans-sigorta/hasar-prim-orani" },
      { label: "Kayıp Oranı (EP)", href: "/finans-sigorta/kayip-orani" },
      { label: "Birleşik Oran", href: "/finans-sigorta/birlesik-oran" },
      { label: "Prim Tahsilat", href: "/finans-sigorta/prim-tahsilat-orani" },
      { label: "Hasar Çözüm Süresi", href: "/finans-sigorta/hasar-cozum-suresi" },
      { label: "İptal Oranı", href: "/finans-sigorta/iptal-orani" },
      { label: "Poliçe Başına Maliyet", href: "/finans-sigorta/police-basina-maliyet" },
      { label: "KPK (Kazanılmamış Prim)", href: "/finans-sigorta/kazanilmamis-prim-karsiligi" },
      { label: "Muallak Hasar Karşılığı", href: "/finans-sigorta/muallak-hasar-karsiligi" },
      { label: "Matematik Karşılıklar", href: "/finans-sigorta/matematik-karsiliklar" },
      { label: "İkramiye / İndirim Karşılığı", href: "/finans-sigorta/ikramiye-indirim-karsiligi" },
      { label: "DERK", href: "/finans-sigorta/devam-eden-riskler-karsiligi" },
      { label: "Dengeleme Karşılığı", href: "/finans-sigorta/dengeleme-karsiligi" },
      { label: "Kazanılmış Prim", href: "/finans-sigorta/kazanilmis-prim" },
      { label: "Yenileme Oranı", href: "/finans-sigorta/yenileme-orani" },
      { label: "Cari Oran", href: "/finans-sigorta/cari-oran" },
      { label: "Nakit Oranı", href: "/finans-sigorta/nakit-oran" },
      { label: "Asit-Test", href: "/finans-sigorta/asit-test-orani" },
      { label: "VÖK (ROE)", href: "/finans-sigorta/vok-roe" },
      { label: "Net Kâr Marjı", href: "/finans-sigorta/net-kar-marji" },
      { label: "Borç/Özkaynak", href: "/finans-sigorta/borc-ozkaynak-orani" },
      { label: "SLA / Servis", href: "/finans-sigorta/sla-servis-seviyesi" },
      { label: "Personel Devir", href: "/finans-sigorta/personel-devir-orani" },
      { label: "Devamsızlık", href: "/finans-sigorta/devamsizlik-orani" },
      { label: "Çalışan Başına Ciro", href: "/finans-sigorta/calisan-basina-ciro" },
    ],
  },
];

const pathTitles: Record<string, string> = {
  "/": "Ana Sayfa",
  "/excel-araclari": "Excel Araçları",
  "/blog": "Blog",
  "/egitimler": "Eğitimler",
  "/egitimler/temel": "Seviye 1 · Temel",
  "/egitimler/orta": "Seviye 2 · Orta",
  "/egitimler/ileri": "Seviye 3 · İleri",
  "/formul-kutuphanesi": "Formül Kütüphanesi",
  "/finans-sigorta": "Finans & Sigorta",
};

export default function SiteTopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setExpandedSection(null);
  }, []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const currentTitle =
    pathTitles[pathname] ??
    (pathname?.startsWith("/blog/") ? "Blog" :
     pathname?.startsWith("/excel-araclari/") ? "Excel Araçları" :
     "Ofis Akademi");

  const isActive = (href: string) => pathname === href;
  const isSectionActive = (section: NavSection) =>
    isActive(section.href) || section.children?.some((c) => isActive(c.href)) || false;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 active:bg-gray-200"
            aria-label="Menüyü aç"
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-white"
              style={{ background: ACCENT }}
            >
              OA
            </span>
            <span className="hidden text-sm font-semibold text-gray-900 sm:inline">
              Ofis Akademi
            </span>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Current page breadcrumb */}
          <span className="truncate text-xs font-medium text-gray-500 sm:text-sm">
            {currentTitle}
          </span>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
        aria-hidden
      />

      {/* Drawer */}
      <nav
        className={`fixed top-0 left-0 z-50 flex h-full w-[280px] max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Ana navigasyon"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5" onClick={close}>
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ background: ACCENT }}
            >
              OA
            </span>
            <span className="text-[15px] font-bold text-gray-900">Ofis Akademi</span>
          </Link>
          <button
            type="button"
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Menüyü kapat"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-1">
            {NAV.map((section) => {
              const active = isSectionActive(section);
              const expanded = expandedSection === section.label;
              const hasChildren = section.children && section.children.length > 0;

              return (
                <li key={section.label}>
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSection(expanded ? null : section.label)
                        }
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium transition-colors ${
                          active
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className={active ? "text-emerald-600" : "text-gray-400"}>
                          {section.icon}
                        </span>
                        <span className="flex-1">{section.label}</span>
                        {hasChildren && (
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            className={`text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>

                      {/* Sub-items */}
                      <div
                        className={`overflow-hidden transition-all duration-200 ease-out ${
                          expanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <ul className="ml-8 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-3">
                          {section.children!.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={close}
                                className={`block rounded-lg px-3 py-2 text-[13px] transition-colors ${
                                  isActive(child.href)
                                    ? "bg-emerald-50 font-semibold text-emerald-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                          {section.children!.length > 3 && (
                            <li>
                              <Link
                                href={section.href}
                                onClick={close}
                                className="block rounded-lg px-3 py-2 text-[13px] font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
                              >
                                Tümünü gör →
                              </Link>
                            </li>
                          )}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={section.href}
                      onClick={close}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors ${
                        active
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className={active ? "text-emerald-600" : "text-gray-400"}>
                        {section.icon}
                      </span>
                      <span>{section.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Drawer footer */}
        <div className="border-t border-gray-100 px-4 py-3">
          <p className="text-[11px] text-gray-400">
            © 2025 Ofis Akademi · Excel & Veri Analizi
          </p>
        </div>
      </nav>
    </>
  );
}
