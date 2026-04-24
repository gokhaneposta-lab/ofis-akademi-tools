import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { getSiteUrl } from "@/lib/site";

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: "Ofis Akademi — Excel Rehberleri, Ücretsiz Araçlar ve Formül Kütüphanesi",
  description:
    "Excel ve veri analizi rehberleri, ücretsiz Excel araçları, formül kütüphanesi (DÜŞEYARA, XLOOKUP, EĞER), finans & sigorta KPI hesaplayıcıları, blog ve adım adım eğitim seviyeleri.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Ofis Akademi",
    title: "Ofis Akademi — Excel Rehberleri, Ücretsiz Araçlar ve Formül Kütüphanesi",
    description:
      "Excel ve veri analizi rehberleri, ücretsiz Excel araçları, formül kütüphanesi, finans & sigorta KPI hesaplayıcıları, blog ve eğitim seviyeleri.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ofis Akademi — Excel Rehberleri, Ücretsiz Araçlar ve Formül Kütüphanesi",
    description:
      "Excel ve veri analizi rehberleri, ücretsiz Excel araçları, formül kütüphanesi, finans & sigorta KPI hesaplayıcıları.",
  },
};

export default function Page() {
  return <HomeClient />;
}
