import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hata Kontrol Checklist'i",
  description:
    "Dosya teslim etmeden önce formül, bağlantı ve hücre güvenliği kontrollerini adım adım işaretle.",
  alternates: {
    canonical:
      "https://ofisakademi.com/excel-araclari/hata-kontrol-checklist",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
