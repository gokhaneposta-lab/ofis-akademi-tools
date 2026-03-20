"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { THEME } from "@/lib/theme";

const pathTitles: Record<string, string> = {
  "/": "Ana Sayfa",
  "/excel-araclari": "Excel Araçları",
  "/excel-araclari/ad-soyad-ayir": "Ad Soyad Ayırıcı",
  "/excel-araclari/csv-ayir": "CSV Ayırıcı",
  "/excel-araclari/liste-birlestir": "Liste Birleştirici",
  "/excel-araclari/tekrarlananlari-kaldir": "Tekrarlananları Kaldır",
  "/excel-araclari/sayi-yaziya": "Sayıyı Yazıya Çevir",
  "/excel-araclari/transpoz": "Satır / Sütun Döndür",
  "/excel-araclari/iban-dogrulama": "IBAN Doğrulama",
  "/excel-araclari/faiz-hesaplama": "Faiz Hesaplama",
  "/excel-araclari/kredi-taksit": "Kredi Taksit Hesaplama",
  "/excel-araclari/yuzde-hesaplama": "Yüzde Hesaplama",
  "/excel-araclari/tarih-farki": "Tarih Farkı",
  "/excel-araclari/kelime-karakter-sayaci": "Kelime & Karakter Sayacı",
  "/excel-araclari/hafta-gun": "Hafta Numarası & Gün Adı",
  "/excel-araclari/betimsel-istatistik": "Betimsel İstatistik",
  "/excel-araclari/ceyrek-yuzdelik": "Çeyrekler & Yüzdelik",
  "/excel-araclari/korelasyon": "Korelasyon (Pearson)",
  "/excel-araclari/z-score": "Z-Skor",
  "/excel-araclari/frekans-dagilimi": "Frekans Dağılımı",
  "/excel-araclari/basit-regresyon": "Basit Doğrusal Regresyon",
  "/excel-araclari/rapor-sablonlari": "Otomatik Rapor Şablonları",
  "/excel-araclari/hata-kontrol-checklist": "Hata Kontrol Checklist'i",
  "/excel-araclari/ksayol-formul-kartlari": "Kısayol & Formül Kartları",
  "/blog": "Blog",
  "/egitimler": "Excel Eğitimleri",
  "/egitimler/temel": "Seviye 1 · Temel",
  "/egitimler/orta": "Seviye 2 · Orta",
  "/egitimler/ileri": "Seviye 3 · İleri",
};

export default function SiteTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const currentTitle = pathTitles[pathname] ?? (pathname?.startsWith("/blog/") ? "Blog" : "Ofis Akademi");
  const isHome = pathname === "/";

  const pageLabel = `${currentTitle} — Ofis Akademi`;

  return (
    <header
      className="w-full max-w-[100vw] text-white text-xs sm:text-sm"
      style={{ background: THEME.topBar, fontFamily: THEME.font }}
    >
      <div className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-3 sm:gap-y-1 sm:px-4">
        <nav
          className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1"
          aria-label="Site üst menü"
        >
          {!isHome && (
            <>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex shrink-0 items-center gap-1.5 opacity-90 hover:opacity-100 transition"
                title="Bir önceki sayfaya dön"
                aria-label="Bir önceki sayfaya dön"
              >
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                Geri
              </button>
              <span className="hidden text-gray-400 sm:inline" aria-hidden>
                |
              </span>
            </>
          )}
          <Link
            href="/"
            className={`flex shrink-0 items-center gap-1.5 transition ${
              isHome ? "font-medium opacity-100" : "opacity-90 hover:opacity-100"
            }`}
          >
            <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M19 13H5v-2h14v2zM19 17H5v-2h14v2zM19 9H5V7h14v2z" />
            </svg>
            Ana Sayfa
          </Link>
          <span className="text-gray-400" aria-hidden>
            |
          </span>
          <Link
            href="/blog"
            className={`shrink-0 transition ${pathname === "/blog" ? "font-medium opacity-100" : "opacity-90 hover:opacity-100"}`}
          >
            Blog
          </Link>
        </nav>
        <p
          className="min-w-0 max-w-full truncate border-t border-white/15 pt-1.5 text-[11px] leading-snug text-gray-100 sm:max-w-[min(100%,28rem)] sm:border-0 sm:pt-0 md:max-w-[min(100%,36rem)] sm:text-sm"
          title={pageLabel}
        >
          <span className="font-medium">{pageLabel}</span>
        </p>
      </div>
    </header>
  );
}
