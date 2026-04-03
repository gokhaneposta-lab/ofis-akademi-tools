import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kredi Taksit Hesaplama",
  description:
    "Kredi tutarı, yıllık faiz oranı ve vadeye göre aylık taksit tutarını hesaplayın. Toplam geri ödeme ve toplam faizi görün.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/kredi-taksit"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
