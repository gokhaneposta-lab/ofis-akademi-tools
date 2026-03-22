import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excel Formül Açıklayıcı | Formülü Türkçe Açıkla",
  description:
    "Excel formülünü yapıştırın, Türkçe adım adım açıklama alın. EĞER, DÜŞEYARA ve diğer formüller. Ofis Akademi.",
  alternates: { canonical: "https://ofisakademi.com/excel-araclari/formul-aciklayici" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
