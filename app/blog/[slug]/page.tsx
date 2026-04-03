import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs, getRelatedPosts, getBenefitLine, type ContentBlock } from "@/lib/blog-posts";
import { getSiteUrl } from "@/lib/site";

const BASE_URL = getSiteUrl();
const ACCENT = "#217346";

function BlogContent({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "p":
      return <p className="mb-4 text-[14px] sm:text-base leading-relaxed text-gray-700">{block.text}</p>;
    case "h3":
      return <h3 className="mt-6 mb-2 text-base font-semibold text-gray-900">{block.text}</h3>;
    case "ul":
      return (
        <ul className="mb-4 list-disc pl-5 space-y-1 text-[14px] sm:text-base text-gray-700">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "formula":
      return (
        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm">
          <span className="text-gray-500 text-xs block mb-0.5">{block.label}</span>
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

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/blog"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200"
            aria-label="Blog"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] sm:text-lg font-bold text-gray-900 line-clamp-1">{post.title}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
        {/* Top CTA */}
        <div className="mb-6 rounded-2xl border-2 border-emerald-300 bg-emerald-50/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[14px] font-semibold text-gray-900">
              {post.toolHref ? "Bu işlemi 5 saniyede yapmak ister misiniz?" : "Bu konuyu adım adım öğrenmek ister misiniz?"}
            </p>
            <Link
              href={post.toolHref || post.guideHref || "/egitimler"}
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 shadow-sm"
              style={{ background: ACCENT }}
            >
              {post.toolHref ? "Aracı kullan" : "Eğitime başla"}
            </Link>
          </div>
          <p className="mt-2 text-[13px] text-gray-600">
            {getBenefitLine(post)}
          </p>
        </div>

        {/* Date + description */}
        <p className="text-[13px] text-gray-400 mb-1">
          {new Date(post.date).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="text-[14px] text-gray-600 mb-6 leading-relaxed">{post.description}</p>

        {/* First half content */}
        <article className="max-w-none">
          {firstHalf.map((block, i) => (
            <BlogContent key={`a-${i}`} block={block} />
          ))}
        </article>

        {/* Mid CTA */}
        <div className="my-8 rounded-2xl border-2 border-emerald-300 bg-emerald-50/80 p-5 text-center">
          <p className="text-[14px] font-semibold text-gray-900 mb-1">
            {post.toolHref ? "En hızlı çözüm: ücretsiz aracımızı kullanın" : "Bu konuyu uygulamalı öğrenin"}
          </p>
          <p className="text-[13px] text-gray-600 mb-4">
            {post.toolHref
              ? "Listeyi yapıştırın, tek tıkla sonucu alın ve Excel'e yapıştırın."
              : "Adım adım eğitim içerikleriyle Excel becerilerinizi geliştirin."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={post.toolHref || post.guideHref || "/egitimler"}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white transition hover:opacity-90 shadow-sm"
              style={{ background: ACCENT }}
            >
              {post.toolHref ? `${post.toolName} aracını aç` : `${post.guideName || "Eğitime"} başla`}
            </Link>
            <Link
              href={post.toolHref ? "/excel-araclari" : "/egitimler"}
              className="text-[13px] font-medium text-emerald-600 hover:underline"
            >
              {post.toolHref ? "Tüm Excel araçları →" : "Tüm eğitimler →"}
            </Link>
          </div>
        </div>

        {/* Second half content */}
        <article className="max-w-none">
          {secondHalf.map((block, i) => (
            <BlogContent key={`b-${i}`} block={block} />
          ))}
        </article>

        {/* Bottom CTA */}
        <div className="mt-8 rounded-2xl border-2 border-emerald-300 bg-emerald-50/80 p-5 text-center">
          <p className="text-[14px] font-medium text-gray-800 mb-3">
            {post.toolHref
              ? "Bu işlemi saniyeler içinde yapmak için ücretsiz aracımızı deneyin:"
              : "Bu konuyu adım adım öğrenmek için eğitimimize göz atın:"}
          </p>
          <Link
            href={post.toolHref || post.guideHref || "/egitimler"}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white transition hover:opacity-90 shadow-sm"
            style={{ background: ACCENT }}
          >
            {post.toolHref ? `${post.toolName} aracına git` : `${post.guideName || "Eğitime"} git`}
          </Link>
        </div>

        {/* Navigation links */}
        <div className="mt-6 flex flex-wrap gap-4">
          <Link href="/blog" className="text-[13px] font-medium text-emerald-600 hover:underline">
            ← Tüm blog yazıları
          </Link>
          <Link href="/excel-araclari" className="text-[13px] font-medium text-emerald-600 hover:underline">
            Excel Araçları
          </Link>
          {post.toolHref ? (
            <Link href={post.toolHref} className="text-[13px] font-medium text-emerald-600 hover:underline">
              {post.toolName}
            </Link>
          ) : post.guideHref ? (
            <Link href={post.guideHref} className="text-[13px] font-medium text-emerald-600 hover:underline">
              {post.guideName}
            </Link>
          ) : null}
        </div>

        {/* Related posts */}
        <section className="mt-8">
          <h2 className="text-base font-bold text-gray-900 mb-3">İlgili yazılar</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {getRelatedPosts(slug, 3).map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-300"
              >
                <p className="text-[14px] font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">{p.title}</p>
                <p className="mt-1 text-[13px] text-gray-500 line-clamp-2">{p.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

    </>
  );
}
