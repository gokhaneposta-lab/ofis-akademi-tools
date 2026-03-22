import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liste Birleştirici",
  description:
    "Birden fazla satırdaki değerleri ayraç ile tek satırda birleştirin.",
  alternates: {
    canonical: "https://ofisakademi.com/excel-araclari/liste-birlestir",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
