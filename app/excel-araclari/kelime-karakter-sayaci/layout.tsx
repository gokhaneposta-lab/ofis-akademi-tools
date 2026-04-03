import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kelime & Karakter Sayacı",
  description: "Metindeki kelime ve karakter sayısını hesaplayın.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/kelime-karakter-sayaci"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
