import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "IBAN Doğrulama",
  description:
    "IBAN numaralarını doğrulayın. TR ve uluslararası IBAN desteklenir.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/iban-dogrulama"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
