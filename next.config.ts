import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Slug yazım hatası düzeltmesi (Mart 2026'da oluşan eski URL → yeni doğru URL).
      // Google'da indexlendiyse 301 ile yeni URL'ye taşır.
      {
        source: "/excel-araclari/ksayol-formul-kartlari",
        destination: "/excel-araclari/kisayol-formul-kartlari",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
