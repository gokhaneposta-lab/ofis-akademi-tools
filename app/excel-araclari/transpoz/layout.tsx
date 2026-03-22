import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Satır / Sütun Döndür (Transpoz)",
  description: "Satırları sütunlara, sütunları satırlara dönüştürün.",
  alternates: {
    canonical: "https://ofisakademi.com/excel-araclari/transpoz",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
