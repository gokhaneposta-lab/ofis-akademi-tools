import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tekrarlananları Kaldır",
  description:
    "Listedeki tekrar eden satırları kaldırın, benzersiz listeye dönüştürün.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/tekrarlananlari-kaldir"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
