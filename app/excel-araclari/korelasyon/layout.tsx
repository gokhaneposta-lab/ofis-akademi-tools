import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Korelasyon Hesaplama (Pearson) | Excel İstatistik Aracı",
  description:
    "İki değişken arasındaki Pearson korelasyon katsayısı r hesaplama. Ücretsiz korelasyon hesaplama aracı. Ofis Akademi.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
