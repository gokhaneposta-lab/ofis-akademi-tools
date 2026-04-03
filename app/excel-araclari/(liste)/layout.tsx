import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: "Excel Araçları | Hızlı İşlem, Mantık & Formül, Finans, İstatistik",
  description:
    "Ücretsiz Excel araçları: ad soyad ayırma, CSV ayırma, liste birleştirme, sayıyı yazıya çevirme, DÜŞEYARA ve EĞER oluşturucu, formül asistanı, IBAN-faiz-yüzde, istatistik. Tarayıcıda çalışır, kurulum yok. Ofis Akademi.",
  alternates: { canonical: `${BASE_URL}/excel-araclari` },
  openGraph: {
    title: "Excel Araçları | Hızlı İşlem, Mantık & Formül, Finans, İstatistik",
    description:
      "Ücretsiz Excel araçları: ad soyad ayırma, CSV ayırma, liste birleştirme, sayıyı yazıya çevirme, DÜŞEYARA ve EĞER oluşturucu, formül asistanı, IBAN-faiz-yüzde, istatistik. Tarayıcıda çalışır, kurulum yok. Ofis Akademi.",
    type: "website",
    url: `${BASE_URL}/excel-araclari`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Excel Araçları | Ofis Akademi",
    description:
      "Ücretsiz Excel araçları: ad soyad ayırma, CSV ayırma, liste birleştirme, formül oluşturucular, finans ve istatistik araçları.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
