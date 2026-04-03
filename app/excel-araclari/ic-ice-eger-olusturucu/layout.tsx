import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "İç içe EĞER Oluşturucu | Excel Nested IF Formülü Üret",
  description:
    "Birden fazla koşul–sonuç satırından iç içe EĞER formülü oluşturun. Not aralığı, kademe, puan dilimi için. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/ic-ice-eger-olusturucu"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
