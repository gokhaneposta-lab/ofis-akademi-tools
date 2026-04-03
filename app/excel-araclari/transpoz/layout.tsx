import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Satır / Sütun Döndür (Transpoz)",
  description: "Satırları sütunlara, sütunları satırlara dönüştürün.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/transpoz"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
