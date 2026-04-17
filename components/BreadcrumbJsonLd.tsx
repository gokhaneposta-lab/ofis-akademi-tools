import { getSiteUrl } from "@/lib/site";

export type BreadcrumbItem = {
  name: string;
  /** Site kökünden göreli yol (ör. "/blog"). Son kırıntı için URL dahil edilmeyebilir ama
   *  Google'ın doğru okuması için her zaman verilmesi önerilir. */
  path: string;
};

type Props = {
  items: BreadcrumbItem[];
};

/**
 * Schema.org BreadcrumbList JSON-LD yayar.
 * Sayfa gövdesinin içinde render edilir; görsel breadcrumb'ı etkilemez.
 *
 * Örnek:
 *   <BreadcrumbJsonLd items=\{[
 *     { name: "Ana Sayfa", path: "/" },
 *     { name: "Blog", path: "/blog" },
 *     { name: post.title, path: `/blog/${slug}` },
 *   ]} />
 */
export default function BreadcrumbJsonLd({ items }: Props) {
  if (!items || items.length === 0) return null;
  const base = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${base}${it.path.startsWith("/") ? it.path : `/${it.path}`}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
