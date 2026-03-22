import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IBAN Doğrulama",
  description:
    "IBAN numaralarını doğrulayın. TR ve uluslararası IBAN desteklenir.",
  alternates: {
    canonical: "https://ofisakademi.com/excel-araclari/iban-dogrulama",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
