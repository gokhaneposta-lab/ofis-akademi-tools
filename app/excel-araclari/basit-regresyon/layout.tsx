import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Regresyon Hesaplama (Doğrusal) | Excel İstatistik Aracı",
  description:
    "Basit doğrusal regresyon: eğim, kesişim ve R². Y = a + b·X hesaplama. Ücretsiz regresyon hesaplama aracı. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/basit-regresyon"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
