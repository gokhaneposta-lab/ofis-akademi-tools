import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: "Excel Eğitimleri | Temel, Orta, İleri Seviye + Eğitici Araçlar",
  description:
    "Excel eğitim seviyeleri (Temel, Orta, İleri) ve eğitimlerde kullanılan araçlar: rapor şablonları, hata kontrol checklist, kısayol ve formül kartları. Konular ofisteki gerçek problemler üzerinden; her bölüm kendi dosyası ve egzersizleriyle. Ofis Akademi.",
  alternates: { canonical: `${BASE_URL}/egitimler` },
  openGraph: {
    title: "Excel Eğitimleri | Temel, Orta, İleri Seviye + Eğitici Araçlar",
    description:
      "Excel eğitim seviyeleri (Temel, Orta, İleri) ve eğitimlerde kullanılan araçlar: rapor şablonları, hata kontrol checklist, kısayol ve formül kartları.",
    type: "website",
    url: `${BASE_URL}/egitimler`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Excel Eğitimleri | Ofis Akademi",
    description: "Temel, orta, ileri Excel eğitimleri ve pratik araçlarla ofis odaklı öğrenme yolu.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
