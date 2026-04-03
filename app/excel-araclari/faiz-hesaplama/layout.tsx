import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Faiz Hesaplama",
  description:
    "Basit ve bileşik faiz hesaplayın. Anapara, yıllık faiz oranı ve süre ile faiz tutarını ve toplam getiriyi görün.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/faiz-hesaplama"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
