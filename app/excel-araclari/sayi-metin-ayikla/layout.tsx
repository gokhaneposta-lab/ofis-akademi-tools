import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sadece Sayı / Sadece Metin Ayıkla | Excel Metin Temizleme",
  description:
    "Metinden yalnızca sayıları veya yalnızca harfleri ayıklayın. Kirli Excel hücrelerini temizleyin. Ücretsiz, tarayıcıda. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/sayi-metin-ayikla"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
