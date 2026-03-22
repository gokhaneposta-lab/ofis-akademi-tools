import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excel Çeyrek (Quartile) ve Yüzdelik Hesaplama Aracı",
  description:
    "Quartile ve percentile hesaplama: Q1, Q2, Q3, minimum, maksimum ve özel yüzdelik dilimi. Ücretsiz Excel çeyrek ve yüzdelik hesaplama. Ofis Akademi.",
  alternates: { canonical: "https://ofisakademi.com/excel-araclari/ceyrek-yuzdelik" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
