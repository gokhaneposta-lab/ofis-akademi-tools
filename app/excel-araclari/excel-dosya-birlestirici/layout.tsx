import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excel Dosyaları Birleştir | Alt Alta Ekle — Tek Excel Yap",
  description:
    "Excel dosyaları birleştir: aynı kolon yapısına sahip dosyaları alt alta ekleyerek tek Excel çıktısı oluşturun. Tek excel yap. Tarayıcıda çalışır, veri sunucuya gönderilmez. Ofis Akademi.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
