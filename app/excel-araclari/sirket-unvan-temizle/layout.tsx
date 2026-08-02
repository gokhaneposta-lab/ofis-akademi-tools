import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Şirket Ünvanı Temizleyici | A.Ş. Ltd. Şti. Kaldır",
  description:
    "Şirket ünvanlarından A.Ş., Ltd. Şti., Anonim Şirket gibi ekleri temizleyin. CRM ve Excel listeleri için. Ofis Akademi.",
  alternates: {
    canonical: canonicalUrl("/excel-araclari/sirket-unvan-temizle"),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
