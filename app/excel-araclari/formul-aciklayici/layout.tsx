import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Excel Formül Açıklayıcı | Formülü Türkçe Açıkla",
  description:
    "Excel formülünü yapıştırın, Türkçe adım adım açıklama alın. EĞER, DÜŞEYARA ve diğer formüller. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/formul-aciklayici"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
