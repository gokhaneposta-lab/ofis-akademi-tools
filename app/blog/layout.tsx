import type { Metadata } from "next";
import { THEME } from "@/lib/theme";

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
    <div className="min-h-screen bg-[#e2e8ec]" style={{ fontFamily: THEME.font }}>
      {children}
    </div>
  );
}
