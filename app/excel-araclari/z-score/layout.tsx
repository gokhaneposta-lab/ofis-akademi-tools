import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Z Skor (Z-Score) Hesaplama | Excel İstatistik Aracı",
  description:
    "Z skor hesaplama: her değerin z-skoru, aykırı değer tespiti. Ücretsiz z score hesaplama aracı. Ofis Akademi.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
