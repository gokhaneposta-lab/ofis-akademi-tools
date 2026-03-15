const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ofisakademi.com";

const excelToolsPath = path.join(__dirname, "..", "lib", "excel-tools.ts");
const content = fs.readFileSync(excelToolsPath, "utf8");
const hrefMatches = content.matchAll(/href:\s*"([^"]+)"/g);
const toolPaths = [...hrefMatches].map((m) => m[1]);

const staticPaths = [
  "",
  "/excel-araclari",
  "/egitimler/temel",
  "/egitimler/orta",
  "/egitimler/ileri",
];
const allPaths = [...staticPaths, ...toolPaths];
const now = new Date().toISOString().split("T")[0];

const urlEntries = allPaths
  .map((p) => {
    const loc = `${BASE_URL}${p || "/"}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p === "" ? "1.0" : p === "/excel-araclari" ? "0.9" : "0.8"}</priority>
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
