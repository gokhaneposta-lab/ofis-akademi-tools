import type { MetadataRoute } from "next";
import { EXCEL_TOOLS } from "@/lib/excel-tools";
import { BLOG_CATEGORIES, getAllSlugs, getPostBySlug } from "@/lib/blog-posts";
import { formulas } from "@/lib/formulData";
import { metrics } from "@/lib/sektorMetrikData";
import { getSiteUrl } from "@/lib/site";

const BASE_URL = getSiteUrl();

const withBase = (path: string) => `${BASE_URL}${path}`;

const HUB_ROUTES = [
  "/",
  "/excel-araclari",
  "/blog",
  "/egitimler",
  "/egitimler/temel",
  "/egitimler/orta",
  "/egitimler/ileri",
  "/formul-kutuphanesi",
  "/finans-sigorta",
  "/kaynaklar",
  "/gizlilik",
] as const;

function priorityFor(route: string): number {
  if (route === "/") return 1.0;
  if (
    route === "/excel-araclari" ||
    route === "/egitimler" ||
    route === "/blog" ||
    route === "/formul-kutuphanesi" ||
    route === "/finans-sigorta"
  ) {
    return 0.9;
  }
  if (route === "/kaynaklar") return 0.85;
  if (route === "/gizlilik") return 0.3;
  if (route.startsWith("/egitimler/")) return 0.8;
  if (route.startsWith("/blog/kategori/")) return 0.7;
  if (route.startsWith("/formul-kutuphanesi/")) return 0.7;
  if (route.startsWith("/finans-sigorta/")) return 0.7;
  if (route.startsWith("/excel-araclari/")) return 0.7;
  if (route.startsWith("/blog/")) return 0.65;
  return 0.6;
}

function changeFreqFor(route: string): MetadataRoute.Sitemap[0]["changeFrequency"] {
  if (route === "/") return "weekly";
  if (route.startsWith("/blog/")) return "monthly";
  return "monthly";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const toolRoutes = EXCEL_TOOLS.map((t) => t.href);
  const blogCategoryRoutes = BLOG_CATEGORIES.map((c) => `/blog/kategori/${c.slug}`);
  const blogPostRoutes = getAllSlugs().map((slug) => `/blog/${slug}`);
  const formulaRoutes = formulas.map((f) => `/formul-kutuphanesi/${f.slug}`);
  const finansRoutes = metrics.map((m) => `/finans-sigorta/${m.slug}`);

  const allRoutes = [
    ...HUB_ROUTES,
    ...toolRoutes,
    ...blogCategoryRoutes,
    ...blogPostRoutes,
    ...formulaRoutes,
    ...finansRoutes,
  ];

  return allRoutes.map((route) => {
    let lastModified = now;
    if (route.startsWith("/blog/") && !route.startsWith("/blog/kategori/")) {
      const slug = route.slice("/blog/".length);
      const post = getPostBySlug(slug);
      if (post?.date) {
        const d = new Date(post.date);
        if (!Number.isNaN(d.getTime())) lastModified = d;
      }
    }
    return {
      url: withBase(route),
      lastModified,
      changeFrequency: changeFreqFor(route),
      priority: priorityFor(route),
    };
  });
}
