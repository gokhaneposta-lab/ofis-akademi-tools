import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "KDV Hesaplama | Dahil / Hariç KDV",
  description:
    "KDV dahil ve hariç tutarı hızlı hesaplayın. %1, %10, %20 ve özel oran. Ücretsiz KDV hesaplayıcı. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/kdv-hesapla"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
