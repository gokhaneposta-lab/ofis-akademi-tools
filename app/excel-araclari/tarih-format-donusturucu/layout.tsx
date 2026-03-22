import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarih Format Dönüştürücü | ISO, Türkçe Uzun, GG.AA.YYYY",
  description:
    "Tarih formatlarını farklı biçimlere çevirin: YYYY-MM-DD (ISO), 01 Mart 2025 (Türkçe uzun), GG.AA.YYYY, GG/AA/YYYY. Excel'den yapıştırın. Ücretsiz, tarayıcıda çalışır. Ofis Akademi.",
  alternates: { canonical: "https://ofisakademi.com/excel-araclari/tarih-format-donusturucu" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
