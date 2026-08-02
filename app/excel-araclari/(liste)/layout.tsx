import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: "Ofis Araçları | Temizleme, Dönüştürücü, Finans, Formül, Analiz",
  description:
    "Ücretsiz ofis araçları: veri temizleme, SQL/JSON/CSV dönüştürücüler, KDV ve tutar yazıya, formül yardımı, istatistik. Tarayıcıda çalışır. Ofis Akademi.",
  alternates: { canonical: `${BASE_URL}/excel-araclari` },
  openGraph: {
    title: "Ofis Araçları | Temizleme, Dönüştürücü, Finans, Formül, Analiz",
    description:
      "Ücretsiz ofis araçları: veri temizleme, SQL/JSON/CSV, KDV, formül yardımı ve analiz. Tarayıcıda çalışır. Ofis Akademi.",
    type: "website",
    url: `${BASE_URL}/excel-araclari`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ofis Araçları | Ofis Akademi",
    description:
      "Temizleme, dönüştürücü, finans, formül ve analiz araçları — tarayıcıda, ücretsiz.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
