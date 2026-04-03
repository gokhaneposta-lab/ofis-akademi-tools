import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sayıyı Yazıya Çevir",
  description:
    "Rakamları Türkçe yazıya dönüştürün. Fatura, çek ve sözleşme metinlerinde kullanım için TL ve kuruş formatı desteklenir.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/sayi-yaziya"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
