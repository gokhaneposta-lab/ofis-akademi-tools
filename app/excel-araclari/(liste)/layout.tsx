import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excel Araçları | Hızlı İşlem, Mantık & Formül, Finans, İstatistik",
  description:
    "Ücretsiz Excel araçları: ad soyad ayırma, CSV ayırma, liste birleştirme, sayıyı yazıya çevirme, DÜŞEYARA ve EĞER oluşturucu, formül asistanı, IBAN-faiz-yüzde, istatistik. Tarayıcıda çalışır, kurulum yok. Ofis Akademi.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
