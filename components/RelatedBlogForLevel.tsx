"use client";

import Link from "next/link";
import { getPostsForLevel, getCategoryLabelForPost } from "@/lib/blog-posts";

type Props = {
  level: "temel" | "orta" | "ileri";
  limit?: number;
  heading?: string;
};

const DEFAULT_HEADINGS: Record<Props["level"], string> = {
  temel: "Temel seviyede önerilen rehberler",
  orta: "Orta seviyede işine yarayacak rehberler",
  ileri: "İleri seviye için seçilmiş rehberler",
};

export default function RelatedBlogForLevel({ level, limit = 4, heading }: Props) {
  const posts = getPostsForLevel(level, limit);
  if (posts.length === 0) return null;

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            Sıradaki adım
          </p>
          <h2 className="mt-1 text-base font-bold text-gray-900 sm:text-lg">
            {heading ?? DEFAULT_HEADINGS[level]}
          </h2>
        </div>
        <Link
          href="/blog"
          className="hidden text-xs font-medium text-emerald-700 hover:text-emerald-800 sm:inline"
        >
          Tüm rehberler →
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {posts.map((p) => {
          const cat = getCategoryLabelForPost(p);
          return (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group block h-full rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-sm"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                  {cat}
                </span>
                <p className="mt-1 text-[14px] font-semibold text-gray-900 group-hover:text-emerald-700 line-clamp-2">
                  {p.title}
                </p>
                <p className="mt-1 text-[12px] text-gray-500 line-clamp-2">
                  {p.description}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
