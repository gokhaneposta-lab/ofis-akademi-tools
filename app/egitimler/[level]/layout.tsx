import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";

type Props = {
  children: React.ReactNode;
  params: Promise<{ level: string }>;
};

const LEVEL_META: Record<string, { title: string; description: string }> = {
  temel: {
    title: "Excel Temel Seviye Eğitimi — Hızlı Başlangıç & Temel Beceriler",
    description:
      "Excel'e sıfırdan başlayanlar için temel formüller (TOPLA, ORTALAMA, MİN, MAKS, EĞER), tablo yapısı, veri temizleme, kısayollar ve hızlı biçimlendirme. Uygulamalı, ücretsiz.",
  },
  orta: {
    title: "Excel Orta Seviye Eğitimi — İşte Gerçekten Kullandığın Formüller",
    description:
      "DÜŞEYARA / XLOOKUP, içiçe EĞER, koşullu toplama (EĞERSAY, ÇOKETOPLA, ÇOKEĞERSAY), metin fonksiyonları (SAĞ, SOL, PARÇAAL, BİRLEŞTİR). Adım adım, örnek dosyalı.",
  },
  ileri: {
    title: "Excel İleri Seviye Eğitimi — PivotTable, Dashboard & Veri Analizi",
    description:
      "PivotTable ve dilimleyici, grafikler, gösterge panelleri, gelişmiş dinamik dizi fonksiyonları (FİLTRE, SIRALA, BENZERSİZ) ve DÜŞEYARA + EĞERHATA pratiği.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level } = await params;
  const meta = LEVEL_META[level];
  if (!meta) return { title: "Eğitim seviyesi bulunamadı | Ofis Akademi" };
  const url = canonicalUrl(`/egitimler/${level}`);
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "website",
      url,
      siteName: "Ofis Akademi",
      locale: "tr_TR",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

export default function Layout({ children }: Props) {
  return children;
}
