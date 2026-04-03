import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Otomatik Rapor Şablonları",
  description:
    "Haftalık satış, stok ve performans raporları için örnek veri setleri ve hazır formüller içeren Excel şablonlarını indirin.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/rapor-sablonlari"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
