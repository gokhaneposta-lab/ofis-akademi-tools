import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Liste Birleştir / Ayır | Yatay ↔ Dikey Liste",
  description:
    "Satırları ayraçla birleştirin veya virgüllü / yan yana listeyi Excel sütununa ayırın. SQL IN desteği. Ücretsiz. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/liste-birlestir"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
