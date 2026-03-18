"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PageRibbon from "@/components/PageRibbon";
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
import { THEME } from "@/lib/theme";

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
        "group block rounded-2xl border bg-white/70 p-5 shadow-sm transition",
        "hover:-translate-y-0.5 hover:shadow-md",
        compact ? "" : "h-full",
      ].join(" ")}
      style={{ borderColor: THEME.gridLine }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: "#e9f5f1", color: THEME.ribbon }}
        >
          {category}
        </span>
        <span className="text-[11px] text-gray-500">
          {reading} dk okuma • 5 sn çözüm
        </span>
      </div>

      <h2 className={["font-semibold text-gray-900", compact ? "text-base" : "text-lg"].join(" ")}>
        {post.title}
      </h2>

      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.description}</p>
      <p className="mt-2 text-sm font-medium text-gray-800">{benefit}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-500">
          {new Date(post.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        <span className="text-xs font-medium" style={{ color: THEME.ribbon }}>
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
          "rounded-full border px-3 py-1.5 text-sm font-semibold transition",
          !active ? "text-white" : "text-gray-700 hover:bg-white/70",
        ].join(" ")}
        style={{
          borderColor: THEME.gridLine,
          background: !active ? THEME.ribbon : "transparent",
        }}
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
              "rounded-full border px-3 py-1.5 text-sm font-semibold transition",
              isActive ? "text-white" : "text-gray-700 hover:bg-white/70",
            ].join(" ")}
            style={{
              borderColor: THEME.gridLine,
              background: isActive ? THEME.ribbon : "transparent",
            }}
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
  const ribbonTitle = category ? `Excel Blog — ${catObj?.label ?? "Kategori"}` : "Excel Blog & Rehberler";
  const ribbonDesc = category
    ? catObj?.description || "Seçtiğiniz kategoriye ait Excel rehberleri."
    : "Excel ipuçları, pratik çözümler ve ücretsiz araçlarla işlerinizi hızlandırın.";

  return (
    <>
      <PageRibbon title={ribbonTitle} description={ribbonDesc} />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5">
          <CategoryTabs active={category} />
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr,360px] lg:items-end">
          <div>
            <p className="text-sm text-gray-700">
              Bu rehberler, en sık yapılan Excel işlemlerini hem formülle hem de <strong>tek tıkla ücretsiz araç</strong> ile çözmenize yardımcı olur.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Yazılarda ara (başlık, açıklama, araç)
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Örn: ad soyad, CSV, IBAN, tarih farkı..."
              className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2"
              style={{ borderColor: THEME.gridLine, boxShadow: "none" }}
            />
          </div>
        </div>

        {!category && (
          <section className="mb-10">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">En Popüler Excel Rehberleri</h2>
              <Link href="/excel-araclari" className="text-sm font-medium hover:underline" style={{ color: THEME.ribbon }}>
                Excel araçlarını keşfet →
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {popular.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">{category ? "Bu Kategorideki Yazılar" : "Tüm Yazılar"}</h2>
            <p className="text-sm text-gray-600">{filtered.length} yazı</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <BlogCard key={p.slug} compact post={p} />
            ))}
          </div>
        </section>

        <div className="mt-10 rounded-2xl border bg-white/70 p-6 text-center" style={{ borderColor: THEME.gridLine }}>
          <p className="text-sm font-medium text-gray-800 mb-4">Excel araçlarıyla işleri saniyelere indirin.</p>
          <Link
            href="/excel-araclari"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            Excel araçlarını keşfet
          </Link>
        </div>
      </main>

      <div className="text-center text-xs text-gray-500 pb-6">Ofis Akademi · Excel & Veri Analizi</div>
    </>
  );
}

