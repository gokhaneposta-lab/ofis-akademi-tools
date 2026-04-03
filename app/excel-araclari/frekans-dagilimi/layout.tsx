import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Frekans Dağılımı Hesaplama | Excel İstatistik Aracı",
  description:
    "Sayıları sınıf aralıklarına bölerek frekans tablosu oluşturma. Histogram verisi, frekans dağılımı hesaplama. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/frekans-dagilimi"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
