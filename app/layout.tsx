import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import SiteTopBar from "@/components/SiteTopBar";
import SiteFooter from "@/components/SiteFooter";
import BrandJsonLd from "@/components/BrandJsonLd";
import { getSiteUrl } from "@/lib/site";

const BASE_URL = getSiteUrl();

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
    default: "Ofis Akademi — Excel Rehberleri, Ücretsiz Araçlar ve Formül Kütüphanesi",
    template: "%s | Ofis Akademi",
  },
  description:
    "Ofis Akademi: Excel ve veri analizi rehberleri, ücretsiz araçlar, formül kütüphanesi (DÜŞEYARA, XLOOKUP, EĞER), finans & sigorta KPI hesaplayıcıları, blog ve eğitim seviyeleri.",
  keywords: [
    "ofis akademi",
    "excel egitimi",
    "excel veri analizi",
    "ucretsiz excel araclari",
    "excel rehberleri",
    "excel formul",
    "duseyara",
    "excel hesaplayici",
    "sigorta kpı",
    "finans oranlari",
    "excel ile sigorta",
  ],
  applicationName: "Ofis Akademi",
  category: "education",
  // alternates.canonical her sayfada kendi metadata'sında verilmeli — buraya koyarsak
  // override etmeyen tüm alt sayfalar root layout'un canonical'ını miras alır ve
  // tek tek özelleştirme şansı kaybolur.
  verification: {
    other: {
      "msvalidate.01": "005B44FBB0B57E2F7D80711F49FBC354",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Ofis Akademi",
    title: "Ofis Akademi — Excel Rehberleri, Ücretsiz Araçlar ve Formül Kütüphanesi",
    description:
      "Excel ve veri analizi rehberleri, ücretsiz araçlar, formül kütüphanesi (DÜŞEYARA, XLOOKUP, EĞER), finans & sigorta KPI hesaplayıcıları, blog ve eğitim seviyeleri.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ofis Akademi — Excel Rehberleri, Ücretsiz Araçlar ve Formül Kütüphanesi",
    description:
      "Excel ve veri analizi rehberleri, ücretsiz araçlar, formül kütüphanesi (DÜŞEYARA, XLOOKUP, EĞER), finans & sigorta KPI hesaplayıcıları, blog ve eğitim seviyeleri.",
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
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
