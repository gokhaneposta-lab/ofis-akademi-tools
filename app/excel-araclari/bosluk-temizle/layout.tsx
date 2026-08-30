import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Excel Boşluk Temizleme — TEMİZLE (TRIM) Formülü | Ofis Akademi",
  description:
    "Excel'de baştaki ve sondaki boşlukları TEMİZLE (TRIM) ile silin; çift boşlukları düzeltin. Toplu liste temizliği için ücretsiz araç.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/bosluk-temizle"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
