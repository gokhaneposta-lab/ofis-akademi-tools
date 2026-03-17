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
  "/egitimler": "Excel Eğitimleri",
  "/egitimler/temel": "Seviye 1 · Temel",
  "/egitimler/orta": "Seviye 2 · Orta",
  "/egitimler/ileri": "Seviye 3 · İleri",
};

export default function SiteTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const currentTitle = pathTitles[pathname] ?? "Ofis Akademi";
  const isHome = pathname === "/";

  return (
    <div
      className="flex items-center justify-between px-4 py-2 text-white text-sm"
      style={{ background: THEME.topBar, fontFamily: THEME.font }}
    >
      <div className="flex items-center gap-3">
        {!isHome && (
          <>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition"
              title="Bir önceki sayfaya dön"
              aria-label="Bir önceki sayfaya dön"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Geri
            </button>
            <span className="text-gray-400">|</span>
          </>
        )}
        <Link
          href="/"
          className={`flex items-center gap-1.5 transition ${
            isHome ? "font-medium opacity-100" : "opacity-90 hover:opacity-100"
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M19 13H5v-2h14v2zM19 17H5v-2h14v2zM19 9H5V7h14v2z" />
          </svg>
          Ana Sayfa
        </Link>
        <span className="text-gray-400">|</span>
        <span className="font-medium">{currentTitle} — Ofis Akademi</span>
      </div>
    </div>
  );
}
