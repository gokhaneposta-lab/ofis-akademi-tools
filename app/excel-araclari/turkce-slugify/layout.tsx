import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Türkçe Karakter → Slugify | Web ve E-posta Formatı",
  description:
    "Türkçe isim ve başlıkları saziye-cesme veya saziyecesme formatına çevirin. URL, e-posta ve dosya adı için. Ücretsiz. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/turkce-slugify"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
