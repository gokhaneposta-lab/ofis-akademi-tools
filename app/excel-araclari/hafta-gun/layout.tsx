import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hafta Numarası & Gün Adı",
  description:
    "Tarih listesinden ISO hafta numarası ve gün adını hesaplayın.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/hafta-gun"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
