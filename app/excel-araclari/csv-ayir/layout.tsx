import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV Ayırıcı",
  description: "CSV metnini satır ve sütunlara ayırın.",
  alternates: { canonical: "https://ofisakademi.com/excel-araclari/csv-ayir" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
