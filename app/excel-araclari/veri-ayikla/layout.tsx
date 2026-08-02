import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Veri Ayıklayıcı | E-posta, URL, IP Çek",
  description:
    "Metin veya log yığınından sadece e-posta, web adresi veya IP adreslerini ayıklayın. Hazır preset'ler. Ücretsiz. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/veri-ayikla"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
