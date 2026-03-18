import Link from "next/link";
import { notFound } from "next/navigation";
import PageRibbon from "@/components/PageRibbon";
import { getPostBySlug, getAllSlugs, getRelatedPosts, getBenefitLine, type ContentBlock } from "@/lib/blog-posts";
import { THEME } from "@/lib/theme";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ofisakademi.com";

function BlogContent({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "p":
      return <p className="mb-4 text-sm sm:text-base leading-relaxed text-gray-700">{block.text}</p>;
    case "h3":
      return <h3 className="mt-6 mb-2 text-base font-semibold text-gray-900">{block.text}</h3>;
    case "ul":
      return (
        <ul className="mb-4 list-disc pl-5 space-y-1 text-sm sm:text-base text-gray-700">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "formula":
      return (
        <div className="mb-4 rounded-lg border bg-gray-50 px-3 py-2 font-mono text-sm" style={{ borderColor: THEME.gridLine }}>
          <span className="text-gray-600 text-xs block mb-0.5">{block.label}</span>
          <code>{block.formula}</code>
        </div>
      );
    default:
      return null;
  }
}

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllSlugs().map((s) => ({ slug: s }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Yazı bulunamadı | Ofis Akademi" };
  const title = `${post.title} | Ofis Akademi Blog`;
  const url = `${BASE_URL}/blog/${slug}`;
  return {
    title,
    description: post.description,
    openGraph: {
      title,
      description: post.description,
      type: "article",
      url,
      siteName: "Ofis Akademi",
      locale: "tr_TR",
    },
    twitter: { card: "summary_large_image", title, description: post.description },
    alternates: { canonical: url },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const mid = Math.max(3, Math.ceil(post.content.length / 2));
  const firstHalf = post.content.slice(0, mid);
  const secondHalf = post.content.slice(mid);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "Ofis Akademi" },
    publisher: { "@type": "Organization", name: "Ofis Akademi" },
    url: `${BASE_URL}/blog/${slug}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/blog/${slug}` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageRibbon
        title={post.title}
        description={post.description}
      />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          className="mb-6 rounded-2xl border-2 p-4 sm:p-5"
          style={{ borderColor: THEME.ribbon, background: "#f0f7f4" }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-gray-900">
              Bu işlemi 5 saniyede yapmak ister misiniz?
            </p>
            <Link
              href={post.toolHref}
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: THEME.ribbon }}
            >
              Aracı kullan
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-700">
            {getBenefitLine(post)}
          </p>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          {new Date(post.date).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <article className="max-w-none">
          {firstHalf.map((block, i) => (
            <BlogContent key={`a-${i}`} block={block} />
          ))}
        </article>

        <div
          className="my-8 rounded-2xl border-2 p-5 text-center"
          style={{ borderColor: THEME.ribbon, background: "#f0f7f4" }}
        >
          <p className="text-sm font-semibold text-gray-900 mb-1">
            En hızlı çözüm: ücretsiz aracımızı kullanın
          </p>
          <p className="text-sm text-gray-700 mb-4">
            Listeyi yapıştırın, tek tıkla sonucu alın ve Excel'e yapıştırın.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={post.toolHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
              style={{ background: THEME.ribbon }}
            >
              {post.toolName} aracını aç
            </Link>
            <Link
              href="/excel-araclari"
              className="text-sm font-medium hover:underline"
              style={{ color: THEME.ribbon }}
            >
              Tüm Excel araçları →
            </Link>
          </div>
        </div>

        <article className="max-w-none">
          {secondHalf.map((block, i) => (
            <BlogContent key={`b-${i}`} block={block} />
          ))}
        </article>

        <div
          className="mt-8 rounded-xl border-2 p-5 text-center"
          style={{ borderColor: THEME.ribbon, background: "#f0f7f4" }}
        >
          <p className="text-sm font-medium text-gray-800 mb-3">
            Bu işlemi saniyeler içinde yapmak için ücretsiz aracımızı deneyin:
          </p>
          <Link
            href={post.toolHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            {post.toolName} aracına git
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/blog"
            className="text-sm font-medium hover:underline"
            style={{ color: THEME.ribbon }}
          >
            ← Tüm blog yazıları
          </Link>
          <Link
            href="/excel-araclari"
            className="text-sm font-medium hover:underline"
            style={{ color: THEME.ribbon }}
          >
            Excel Araçları
          </Link>
          <Link
            href={post.toolHref}
            className="text-sm font-medium hover:underline"
            style={{ color: THEME.ribbon }}
          >
            {post.toolName}
          </Link>
        </div>

        <section className="mt-10">
          <h2 className="text-base font-semibold text-gray-900 mb-3">İlgili yazılar</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {getRelatedPosts(slug, 3).map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="block rounded-xl border bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: THEME.gridLine }}
              >
                <p className="text-sm font-semibold text-gray-900 line-clamp-2">{p.title}</p>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{p.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <div className="text-center text-xs text-gray-500 pb-6">
        Ofis Akademi · Excel & Veri Analizi
      </div>
    </>
  );
}
