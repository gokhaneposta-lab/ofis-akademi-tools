import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Korelasyon Hesaplama (Pearson) | Excel İstatistik Aracı",
  description:
    "İki değişken arasındaki Pearson korelasyon katsayısı r hesaplama. Ücretsiz korelasyon hesaplama aracı. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/korelasyon"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
