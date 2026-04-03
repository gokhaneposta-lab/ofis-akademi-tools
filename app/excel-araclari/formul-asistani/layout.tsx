import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Excel Formül Asistanı | Ne Yapmak İstiyorsunuz? Doğru Fonksiyonu Bulun",
  description:
    "Excel'de yapmak istediğinizi yazın (örn. iki kolonu birleştir); size uygun fonksiyonu önerir. Türkçe ve İngilizce adlar. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/formul-asistani"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
