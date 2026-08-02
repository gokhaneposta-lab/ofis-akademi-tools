import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "SQL IN Formatter | Listeyi SQL IN'e Çevir",
  description:
    "Excel veya satır listesini SQL IN (...) formatına çevirin. Metin ve sayı desteği. Ücretsiz, tarayıcıda çalışır. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/sql-in-formatter"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
