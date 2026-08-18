import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Büyük Aylık GT ve Bilanço dosyası için body limit 50 MB
    serverBodySizeLimit: "50mb",
  },
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
      // Prim panelleri tek hub altında sekmeye taşındı.
      { source: "/sigorta/kanal-prim", destination: "/sigorta/prim?panel=kanal-prim", permanent: true },
      { source: "/sigorta/kanal-dagilim", destination: "/sigorta/prim?panel=kanal-dagilim", permanent: true },
      {
        source: "/sigorta/brans-degisim",
        destination: "/sigorta/prim?panel=brans&view=degisim",
        permanent: true,
      },
      { source: "/sigorta/brans-sira", destination: "/sigorta/prim?panel=brans&view=sira", permanent: true },
      { source: "/sigorta/prim-trend-12", destination: "/sigorta/prim?panel=prim-trend-12", permanent: true },
      {
        source: "/sigorta/pazar-yogunlasma",
        destination: "/sigorta/prim?panel=pazar-yogunlasma",
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
