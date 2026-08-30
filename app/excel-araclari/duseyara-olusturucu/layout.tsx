import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "DÜŞEYARA Formül Oluşturucu — Excel VLOOKUP | Ofis Akademi",
  description:
    "Excel DÜŞEYARA (VLOOKUP) formülünü tablo aralığı ve sütun seçerek otomatik oluşturun. Kopyalayıp Excel'e yapıştırın — ücretsiz araç.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/duseyara-olusturucu"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
