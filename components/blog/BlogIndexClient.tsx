"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BLOG_POSTS,
  BLOG_CATEGORIES,
  categorizePost,
  getBenefitLine,
  getCategoryBySlug,
  getCategoryLabelForPost,
  getPostPlainText,
  type BlogCategorySlug,
  type BlogPost,
} from "@/lib/blog-posts";

const ACCENT = "#217346";

const POPULAR_SLUGS = new Set([
  "excelde-ad-soyad-ayirma",
  "excelde-sayiyi-yaziya-cevirme",
  "excelde-buyuk-kucuk-harf-donusturme",
]);

function estimateReadingMinutesFromPost(post: BlogPost): number {
  const text = getPostPlainText(post);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}

function BlogCard({ post, compact = false }: { post: BlogPost; compact?: boolean }) {
  const category = getCategoryLabelForPost(post);
  const reading = estimateReadingMinutesFromPost(post);
  const benefit = getBenefitLine(post);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={[
        "group block rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-300",
        compact ? "" : "h-full",
      ].join(" ")}
    >
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          {category}
        </span>
        <span className="text-[11px] text-gray-400 flex-shrink-0">
          {reading} dk okuma
        </span>
      </div>

      <h2 className={["font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug", compact ? "text-[15px]" : "text-base sm:text-lg"].join(" ")}>
        {post.title}
      </h2>

      <p className="mt-1.5 text-[13px] text-gray-500 line-clamp-2 leading-relaxed">{post.description}</p>
      <p className="mt-1.5 text-[13px] font-medium text-gray-700">{benefit}</p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-gray-400">
          {new Date(post.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        <span className="text-[12px] font-medium text-emerald-600">
          Devamını oku →
        </span>
      </div>
    </Link>
  );
}

function CategoryTabs({ active }: { active?: BlogCategorySlug }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/blog"
        className={[
          "rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors",
          !active
            ? "border-emerald-600 bg-emerald-700 text-white"
            : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-700",
        ].join(" ")}
      >
        Tümü
      </Link>
      {BLOG_CATEGORIES.map((c) => {
        const isActive = active === c.slug;
        return (
          <Link
            key={c.slug}
            href={`/blog/kategori/${c.slug}`}
            className={[
              "rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors",
              isActive
                ? "border-emerald-600 bg-emerald-700 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-700",
            ].join(" ")}
          >
            {c.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function BlogIndexClient({ category }: { category?: BlogCategorySlug }) {
  const [q, setQ] = useState("");

  const popular = useMemo(() => BLOG_POSTS.filter((p) => POPULAR_SLUGS.has(p.slug)), []);
  const allSorted = useMemo(() => [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1)), []);

  const baseList = useMemo(() => {
    if (!category) return allSorted;
    return allSorted.filter((p) => categorizePost(p) === category);
  }, [category, allSorted]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return baseList;
    return baseList.filter((p) => {
      const hay = `${p.title} ${p.description} ${p.toolName}`.toLowerCase();
      return hay.includes(query);
    });
  }, [q, baseList]);

  const catObj = category ? getCategoryBySlug(category) : undefined;

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200"
            aria-label="Ana Sayfa"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {category ? `Blog — ${catObj?.label ?? "Kategori"}` : "Excel Blog & Rehberler"}
            </h1>
          </div>
          <span className="flex-shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            {filtered.length} yazı
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
        {/* Category tabs */}
        <div className="mb-5">
          <CategoryTabs active={category} />
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Yazılarda ara: ad soyad, CSV, IBAN, tarih farkı..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] outline-none transition-all duration-200 focus:border-emerald-400 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.10)]"
          />
        </div>

        {/* Popular */}
        {!category && (
          <section className="mb-8">
            <div className="mb-3 flex items-end justify-between gap-4">
              <h2 className="text-base font-bold text-gray-900">En Popüler Rehberler</h2>
              <Link href="/excel-araclari" className="text-[13px] font-medium text-emerald-600 hover:underline">
                Araçları keşfet →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}

        {/* All posts */}
        <section>
          <h2 className="mb-3 text-base font-bold text-gray-900">
            {category ? "Bu Kategorideki Yazılar" : "Tüm Yazılar"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((p) => (
              <BlogCard key={p.slug} compact post={p} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-center">
          <p className="text-sm font-medium text-gray-800 mb-3">Excel araçlarıyla işleri saniyelere indirin.</p>
          <Link
            href="/excel-araclari"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: ACCENT }}
          >
            Excel araçlarını keşfet
          </Link>
        </div>
      </main>

      <footer className="pb-6 pt-4 text-center text-xs text-gray-400">
        Ofis Akademi · Excel & Veri Analizi
      </footer>
    </>
  );
}
