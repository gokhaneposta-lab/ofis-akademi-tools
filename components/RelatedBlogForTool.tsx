"use client";

import Link from "next/link";
import { getRelatedPostsForTool, getCategoryLabelForPost } from "@/lib/blog-posts";

type Props = {
  toolHref: string;
  limit?: number;
  /** Başlık özelleştirme (varsayılan: "Bu araçla ilgili rehberler"). */
  heading?: string;
};

export default function RelatedBlogForTool({
  toolHref,
  limit = 3,
  heading = "Bu araçla ilgili rehberler",
}: Props) {
  const posts = getRelatedPostsForTool(toolHref, limit);
  if (posts.length === 0) return null;

  return (
    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">{heading}</h2>
        <Link
          href="/blog"
          className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800"
        >
          Tüm rehberler →
        </Link>
      </div>
      <ul className="space-y-2.5">
        {posts.map((p) => {
          const cat = getCategoryLabelForPost(p);
          return (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group block rounded-xl border border-gray-100 bg-gray-50/60 p-3 transition hover:border-emerald-300 hover:bg-emerald-50/60"
              >
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                  <span>{cat}</span>
                </div>
                <p className="mt-1 text-[13px] font-semibold text-gray-900 group-hover:text-emerald-700 line-clamp-2">
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
