import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "E-posta Liste Temizleme | Tekrar ve Geçersiz Adresleri Temizle",
  description:
    "E-posta listesinde tekrar eden veya geçersiz formatta olan adresleri temizleyin. Excel'den yapıştırıp benzersiz ve geçerli adresleri alın. Ücretsiz, tarayıcıda çalışır. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/email-liste-temizleme"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
