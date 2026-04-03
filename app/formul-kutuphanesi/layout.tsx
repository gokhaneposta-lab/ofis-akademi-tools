import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Excel Formül Kütüphanesi — DÜŞEYARA, EĞER, XLOOKUP, TOPLA & Daha Fazlası",
  description:
    "Excel formüllerinin sözdizimi, parametreleri, adım adım kullanımı ve örnekler. Arama, mantık, toplama, metin, tarih ve dinamik dizi fonksiyonları. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/formul-kutuphanesi"),
  },
  openGraph: {
    title: "Excel Formül Kütüphanesi | Ofis Akademi",
    description:
      "DÜŞEYARA, XLOOKUP, EĞER, TOPLA, FİLTRE ve daha fazlası — sözdizimi, örnekler ve ipuçları.",
    type: "website",
    url: `${BASE}/formul-kutuphanesi`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Excel Formül Kütüphanesi | Ofis Akademi",
    description: "Formül sözdizimi, örnekler ve kategorilere göre rehber.",
  },
};

export default function FormulKutuphanesiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
