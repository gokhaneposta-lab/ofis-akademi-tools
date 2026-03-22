import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelime & Karakter Sayacı",
  description: "Metindeki kelime ve karakter sayısını hesaplayın.",
  alternates: {
    canonical:
      "https://ofisakademi.com/excel-araclari/kelime-karakter-sayaci",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
