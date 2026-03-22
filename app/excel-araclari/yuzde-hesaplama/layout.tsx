import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yüzde Hesaplama",
  description:
    "X'in Y%'si kaç? A, B'nin yüzde kaçı? KDV, komisyon, kar marjı ve oran hesaplamaları için.",
  alternates: {
    canonical: "https://ofisakademi.com/excel-araclari/yuzde-hesaplama",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
