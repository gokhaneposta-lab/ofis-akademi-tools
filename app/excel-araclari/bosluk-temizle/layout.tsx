import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Excel Boşluk Temizleme (TRIM) | Boş Satır Sil",
  description:
    "Baştaki/sondaki boşlukları ve çift boşlukları temizleyin; isteğe bağlı boş satırları silin. Ücretsiz TRIM aracı. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/bosluk-temizle"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
