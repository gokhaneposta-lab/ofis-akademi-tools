import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kısayol & Formül Kartları",
  description:
    "En çok kullanılan Excel kısayolları ve formülleri — tek sayfa, yazdırılabilir PDF.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/ksayol-formul-kartlari"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
