import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

const BASE_URL = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // WordPress kullanmıyoruz. Bot taramalarının 404 ürettiği yolları engelliyoruz
        // (Search Console "Bulunamadı (404)" raporundan da düşer).
        disallow: ["/wp-admin", "/wp-content", "/wp-includes", "/xmlrpc.php"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
