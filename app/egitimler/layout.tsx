import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excel Eğitimleri | Temel, Orta, İleri Seviye + Eğitici Araçlar",
  description:
    "Excel eğitim seviyeleri (Temel, Orta, İleri) ve eğitimlerde kullanılan araçlar: rapor şablonları, hata kontrol checklist, kısayol ve formül kartları. Konular ofisteki gerçek problemler üzerinden; her bölüm kendi dosyası ve egzersizleriyle. Ofis Akademi.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
