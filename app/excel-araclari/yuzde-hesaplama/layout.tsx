import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Yüzde Hesaplama",
  description:
    "X'in Y%'si kaç? A, B'nin yüzde kaçı? KDV, komisyon, kar marjı ve oran hesaplamaları için.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/yuzde-hesaplama"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
