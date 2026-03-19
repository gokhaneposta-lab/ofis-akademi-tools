import type { MetadataRoute } from "next";
import { EXCEL_TOOLS } from "@/lib/excel-tools";
import { BLOG_CATEGORIES, getAllSlugs } from "@/lib/blog-posts";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ofisakademi.com";

const withBase = (path: string) => `${BASE_URL}${path}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "/",
    "/excel-araclari",
    "/blog",
    "/egitimler",
    "/egitimler/temel",
    "/egitimler/orta",
    "/egitimler/ileri",
  ];

  const toolRoutes = EXCEL_TOOLS.map((t) => t.href);
  const blogCategoryRoutes = BLOG_CATEGORIES.map((c) => `/blog/kategori/${c.slug}`);
  const blogPostRoutes = getAllSlugs().map((slug) => `/blog/${slug}`);

  const allRoutes = [...staticRoutes, ...toolRoutes, ...blogCategoryRoutes, ...blogPostRoutes];

  return allRoutes.map((route) => ({
    url: withBase(route),
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/excel-araclari" || route === "/egitimler" ? 0.9 : 0.8,
  }));
}

