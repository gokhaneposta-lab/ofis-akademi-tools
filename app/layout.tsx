import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteTopBar from "@/components/SiteTopBar";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ofisakademi.com";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Ofis Akademi — Excel & Veri Analizi",
  description: "Excel ve veri analizi ile ofis hayatını kolaylaştır. Eğitimler ve ücretsiz Excel araçları.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Ofis Akademi",
    title: "Ofis Akademi — Excel & Veri Analizi",
    description: "Excel ve veri analizi ile ofis hayatını kolaylaştır. Eğitimler ve ücretsiz Excel araçları.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ofis Akademi — Excel & Veri Analizi",
    description: "Excel ve veri analizi ile ofis hayatını kolaylaştır. Eğitimler ve ücretsiz Excel araçları.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <SiteTopBar />
        {children}
      </body>
    </html>
  );
}
