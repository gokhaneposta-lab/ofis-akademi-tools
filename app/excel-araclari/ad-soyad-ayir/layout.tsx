import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ad Soyad Ayırıcı",
  description:
    "Tam ad listesini ad ve soyad olarak ayırın; tablo veya Excel formatında kopyalayın.",
  alternates: {
    canonical: "https://ofisakademi.com/excel-araclari/ad-soyad-ayir",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
