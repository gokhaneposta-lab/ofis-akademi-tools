import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "CSV Validator | CSV Hata Kontrolü",
  description:
    "CSV dosyasını satır satır kontrol edin: ayırıcı, sütun sayısı, boş satır ve tutarsızlıklar. Ücretsiz CSV doğrulama. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/csv-dogrula"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
