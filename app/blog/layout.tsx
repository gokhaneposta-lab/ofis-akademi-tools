import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ofisakademi.com";

export const metadata: Metadata = {
  title: "Blog — Excel İpuçları & Araç Rehberi | Ofis Akademi",
  description: "Excel'de sık karşılaşılan sorulara cevaplar ve ücretsiz araçlara yönlendiren rehber yazıları.",
  openGraph: {
    title: "Blog — Excel İpuçları & Araç Rehberi | Ofis Akademi",
    description: "Excel'de sık karşılaşılan sorulara cevaplar ve ücretsiz araçlara yönlendiren rehber yazıları.",
    type: "website",
    url: `${BASE_URL}/blog`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
  },
  alternates: { canonical: `${BASE_URL}/blog` },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/80">
      {children}
    </div>
  );
}
