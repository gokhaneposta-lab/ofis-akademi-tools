import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sayıyı Yazıya Çevir",
  description:
    "Rakamları Türkçe yazıya dönüştürün. Fatura, çek ve sözleşme metinlerinde kullanım için TL ve kuruş formatı desteklenir.",
  alternates: {
    canonical: "https://ofisakademi.com/excel-araclari/sayi-yaziya",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
