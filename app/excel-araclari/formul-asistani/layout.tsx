import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excel Formül Asistanı | Ne Yapmak İstiyorsunuz? Doğru Fonksiyonu Bulun",
  description:
    "Excel'de yapmak istediğinizi yazın (örn. iki kolonu birleştir); size uygun fonksiyonu önerir. Türkçe ve İngilizce adlar. Ofis Akademi.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
