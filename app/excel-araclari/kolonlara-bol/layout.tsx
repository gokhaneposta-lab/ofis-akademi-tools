import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Excel Metni Kolonlara Ayır | Virgül, Noktalı Virgül veya Sekmeyle Böl",
  description:
    "Metni kolonlara bölün: virgül, noktalı virgül veya sekme ile ayırın. Excel Metni Sütunlara Dönüştür alternatifi. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/kolonlara-bol"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
