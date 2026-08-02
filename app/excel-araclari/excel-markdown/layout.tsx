import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Excel → Markdown Tablo | Notion / GitHub",
  description:
    "Excel tablosunu Markdown tabloya çevirin. Notion, GitHub ve dokümantasyon için. Ücretsiz, tarayıcıda. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/excel-markdown"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
