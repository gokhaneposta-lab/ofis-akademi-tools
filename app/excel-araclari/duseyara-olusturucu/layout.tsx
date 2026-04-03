import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "DÜŞEYARA Formül Oluşturucu | Excel VLOOKUP Formülü Üret",
  description:
    "Aranan değer, arama tablosu ve sütun numarasından DÜŞEYARA (VLOOKUP) formülü oluşturun. Kopyalayıp Excel'e yapıştırın. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/duseyara-olusturucu"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
