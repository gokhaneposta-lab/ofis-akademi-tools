import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Excel Grafik Oluşturucu — Çubuk, Çizgi, Pasta Önizleme | Ofis Akademi",
  description:
    "Excel'den kopyaladığınız veriyi yapıştırın; çubuk, çizgi veya pasta grafik önizleyin. PNG indirin veya veriyi XLSX olarak kaydedin — ücretsiz araç.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/grafik-olusturucu"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
