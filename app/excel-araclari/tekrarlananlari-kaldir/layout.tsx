import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tekrarlananları Kaldır",
  description:
    "Listedeki tekrar eden satırları kaldırın, benzersiz listeye dönüştürün.",
  alternates: {
    canonical:
      "https://ofisakademi.com/excel-araclari/tekrarlananlari-kaldir",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
