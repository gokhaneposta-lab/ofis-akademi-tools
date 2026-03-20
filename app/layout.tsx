import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteTopBar from "@/components/SiteTopBar";
import BrandJsonLd from "@/components/BrandJsonLd";

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
  title: {
    default: "Ofis Akademi — Excel & Veri Analizi",
    template: "%s | Ofis Akademi",
  },
  description:
    "Ofis Akademi ile Excel ve veri analizini adim adim ogren. Ucretsiz Excel araclari, blog rehberleri ve egitim seviyeleri.",
  keywords: [
    "ofis akademi",
    "excel egitimi",
    "excel veri analizi",
    "ucretsiz excel araclari",
    "excel rehberleri",
  ],
  applicationName: "Ofis Akademi",
  category: "education",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Ofis Akademi",
    title: "Ofis Akademi — Excel & Veri Analizi",
    description:
      "Ofis Akademi ile Excel ve veri analizini adim adim ogren. Ucretsiz Excel araclari, blog rehberleri ve egitim seviyeleri.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ofis Akademi — Excel & Veri Analizi",
    description:
      "Ofis Akademi ile Excel ve veri analizini adim adim ogren. Ucretsiz Excel araclari, blog rehberleri ve egitim seviyeleri.",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#06a09b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen overflow-x-hidden`}
      >
        <SiteTopBar />
        <BrandJsonLd baseUrl={BASE_URL} />
        {children}
      </body>
    </html>
  );
}
