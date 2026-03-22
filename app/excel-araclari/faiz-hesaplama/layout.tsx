import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Faiz Hesaplama",
  description:
    "Basit ve bileşik faiz hesaplayın. Anapara, yıllık faiz oranı ve süre ile faiz tutarını ve toplam getiriyi görün.",
  alternates: {
    canonical: "https://ofisakademi.com/excel-araclari/faiz-hesaplama",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
