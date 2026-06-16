import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** TSB hub önbellek kullanır; büyük tidy dosyaları lambda bundle'a girmesin. */
  outputFileTracingExcludes: {
    "*": ["./public/data/tsb/gelir-tidy/**", "./public/data/tsb/prim-tidy.json"],
  },
  async redirects() {
    return [
      {
        source: "/sigorta/prim-waterfall",
        destination: "/sigorta/tsb",
        permanent: true,
      },
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
