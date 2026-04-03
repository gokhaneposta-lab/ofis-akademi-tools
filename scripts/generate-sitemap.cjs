const fs = require("fs");
const path = require("path");

/** Aynı mantık: lib/site.ts getSiteUrl (tek kanonik adres için NEXT_PUBLIC_SITE_URL kullanın). */
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://ofisakademi.com").replace(/\/$/, "");

const excelToolsPath = path.join(__dirname, "..", "lib", "excel-tools.ts");
const content = fs.readFileSync(excelToolsPath, "utf8");
const hrefMatches = content.matchAll(/href:\s*"([^"]+)"/g);
const toolPaths = [...hrefMatches].map((m) => m[1]);

const slugFromFile = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf8");
  // Blog post slugs only (avoid matching category objects etc.)
  return [...content.matchAll(/slug:\s*"([^"]+)"\s*,\s*\n\s*title:\s*"/g)].map((m) => m[1]);
};
const blogSlugs = [
  ...slugFromFile(path.join(__dirname, "..", "lib", "blog-posts.ts")),
  ...slugFromFile(path.join(__dirname, "..", "lib", "blog-posts-extra.ts")),
];
const blogPaths = ["/blog", ...blogSlugs.map((s) => `/blog/${s}`)];
const blogCategoryPaths = [
  "/blog/kategori/formuller",
  "/blog/kategori/metin",
  "/blog/kategori/veri-analizi",
  "/blog/kategori/finans",
  "/blog/kategori/donusturme",
  "/blog/kategori/dogrulama",
  "/blog/kategori/kaynaklar",
];

const staticPaths = [
  "",
  "/excel-araclari",
  "/blog",
  "/egitimler",
  "/egitimler/temel",
  "/egitimler/orta",
  "/egitimler/ileri",
];
const allPaths = [
  ...staticPaths,
  ...blogCategoryPaths,
  ...blogPaths.filter((p) => p !== "/blog"),
  ...toolPaths,
];
const now = new Date().toISOString().split("T")[0];

const urlEntries = allPaths
  .map((p) => {
    const loc = `${BASE_URL}${p || "/"}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p === "" ? "1.0" : p === "/excel-araclari" || p === "/egitimler" ? "0.9" : "0.8"}</priority>
  </url>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

const outPath = path.join(__dirname, "..", "public", "sitemap.xml");
fs.writeFileSync(outPath, xml, "utf8");
console.log("Generated", outPath, "with", allPaths.length, "URLs");
