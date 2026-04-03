import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Liste Birleştirici",
  description:
    "Birden fazla satırdaki değerleri ayraç ile tek satırda birleştirin.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/liste-birlestir"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
