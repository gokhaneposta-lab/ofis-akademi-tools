import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "SQL UPDATE Formatter | Excel'den UPDATE Üret",
  description:
    "Excel tablosundan SQL UPDATE komutları üretin. İlk sütun WHERE anahtarı, diğer sütunlar SET alanları. Ücretsiz araç. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/sql-update-formatter"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
