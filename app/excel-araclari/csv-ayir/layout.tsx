import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "CSV Ayırıcı",
  description: "CSV metnini satır ve sütunlara ayırın.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/csv-ayir"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
