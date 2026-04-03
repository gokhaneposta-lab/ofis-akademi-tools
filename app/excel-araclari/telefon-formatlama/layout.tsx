import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Telefon Numarası Formatlama | Yerel ve Uluslararası Format",
  description:
    "Telefon numaralarını standart formata çevirin: yerel (0 ile), uluslararası (+90), alan kodu parantez, boşluk/tire/nokta ayırıcı. Excel'den liste yapıştırın. Ücretsiz, tarayıcıda çalışır. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/telefon-formatlama"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
