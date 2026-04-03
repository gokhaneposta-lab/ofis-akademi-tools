import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Excel → JSON Dönüştürücü | CSV'yi JSON'a Çevir",
  description:
    "Excel veya CSV verisini JSON formatına çevirin. API ve yazılım geliştirme için tablo verisini nesne dizisine dönüştürün. Ücretsiz, tarayıcıda çalışır. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/excel-json"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
