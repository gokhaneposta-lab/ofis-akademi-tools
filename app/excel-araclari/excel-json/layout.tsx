import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Excel ⇄ JSON Dönüştürücü | JSON'u Excel'e Çevir",
  description:
    "Excel/CSV ↔ JSON iki yönlü dönüşüm. Tabloyu JSON'a, JSON dizisini Excel'e yapıştırılabilir tabloya çevirin. Ücretsiz. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/excel-json"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
