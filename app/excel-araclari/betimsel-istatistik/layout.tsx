import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ortalama, Medyan, Standart Sapma Hesaplama | Excel İstatistik Aracı",
  description:
    "Ücretsiz betimsel istatistik hesaplama: ortalama, medyan, mod, standart sapma, varyans, min, max. Sayı listesinden tek seferde sonuç. Ofis Akademi.",
  alternates: { canonical: "https://ofisakademi.com/excel-araclari/betimsel-istatistik" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
