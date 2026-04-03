import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Excel Büyük Harf Küçük Harf Dönüştür | UPPER, LOWER, PROPER",
  description:
    "Metni büyük harf, küçük harf veya her kelimenin ilk harfi büyük (Proper) yapın. Ücretsiz Excel büyük/küçük harf aracı. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/buyuk-kucuk-harf"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
