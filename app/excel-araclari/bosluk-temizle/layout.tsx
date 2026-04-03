import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Excel Boşluk Temizleme (TRIM) | Baştaki Sondaki Boşlukları Sil",
  description:
    "Excel başındaki ve sondaki boşlukları silin, metin içi çoklu boşlukları tek boşluğa indirin. Ücretsiz TRIM aracı. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/bosluk-temizle"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
