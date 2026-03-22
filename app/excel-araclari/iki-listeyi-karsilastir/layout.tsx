import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İki Listeyi Karşılaştır | Ortak ve Farklı Kayıtları Bul",
  description:
    "İki listeyi karşılaştırın: ortak kayıtlar, sadece A'da olanlar, sadece B'de olanlar. Excel veya metin listelerini yapıştırıp anında sonuç alın. Ücretsiz, tarayıcıda çalışır. Ofis Akademi.",
  alternates: { canonical: "https://ofisakademi.com/excel-araclari/iki-listeyi-karsilastir" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
