import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-posta Liste Temizleme | Tekrar ve Geçersiz Adresleri Temizle",
  description:
    "E-posta listesinde tekrar eden veya geçersiz formatta olan adresleri temizleyin. Excel'den yapıştırıp benzersiz ve geçerli adresleri alın. Ücretsiz, tarayıcıda çalışır. Ofis Akademi.",
  alternates: { canonical: "https://ofisakademi.com/excel-araclari/email-liste-temizleme" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
