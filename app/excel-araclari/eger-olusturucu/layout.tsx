import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EĞER Formül Oluşturucu | Excel IF Formülü Üret",
  description:
    "Koşul, doğruysa ve yanlışsa değerlerinden EĞER (IF) formülü oluşturun. Kopyalayıp Excel'e yapıştırın. Ofis Akademi.",
  alternates: { canonical: "https://ofisakademi.com/excel-araclari/eger-olusturucu" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
