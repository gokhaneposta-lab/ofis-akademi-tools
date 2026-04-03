import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tarih Farkı ve Yaş Hesaplama | Vade, Gün, Yıl-Ay-Gün",
  description:
    "İki tarih arası gün, ay, yıl hesaplayın. Vade farkı veya yaş hesaplama (doğum tarihi → bugün). Excel'den çok satır yapıştırın. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/tarih-farki"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
