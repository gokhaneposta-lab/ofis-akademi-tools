import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hafta Numarası & Gün Adı",
  description:
    "Tarih listesinden ISO hafta numarası ve gün adını hesaplayın.",
  alternates: {
    canonical: "https://ofisakademi.com/excel-araclari/hafta-gun",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
