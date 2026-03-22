import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kısayol & Formül Kartları",
  description:
    "En çok kullanılan Excel kısayolları ve formülleri — tek sayfa, yazdırılabilir PDF.",
  alternates: {
    canonical:
      "https://ofisakademi.com/excel-araclari/ksayol-formul-kartlari",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
