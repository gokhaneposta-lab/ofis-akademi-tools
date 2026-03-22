import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excel → SQL INSERT Dönüştürücü | Veritabanına Veri Aktarımı",
  description:
    "Excel tablosunu SQL INSERT komutlarına dönüştürün. Veritabanına veri eklemek için tablo veya pipe ile ayrılmış veriyi yapıştırın, INSERT ifadelerini kopyalayın. Ücretsiz, tarayıcıda çalışır. Ofis Akademi.",
  alternates: { canonical: "https://ofisakademi.com/excel-araclari/excel-sql-insert" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
