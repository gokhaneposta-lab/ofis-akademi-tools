import Link from "next/link";
import PageRibbon from "@/components/PageRibbon";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { THEME } from "@/lib/theme";

export default function BlogPage() {
  return (
    <>
      <PageRibbon
        title="Blog"
        description="Excel'de sık sorulan sorulara cevaplar ve ilgili araçlara kısa rehber."
      />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="mb-6 text-sm text-gray-600">
          Aşağıdaki yazılar Excel ile ilgili günlük sorulara kısa çözümler sunar; her yazının sonunda ilgili ücretsiz araca yönlendiren buton bulunur.
        </p>
        <ul className="space-y-4">
          {BLOG_POSTS.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block rounded-lg border p-4 transition hover:border-emerald-500/50 hover:bg-white/80"
                style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
              >
                <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                  {post.title}
                </h2>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {post.description}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {new Date(post.date).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {" · "}
                  <span style={{ color: THEME.ribbon }}>{post.toolName}</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <Link
            href="/excel-araclari"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            Tüm Excel Araçları
          </Link>
        </div>
      </main>
      <div className="text-center text-xs text-gray-500 pb-6">
        Ofis Akademi · Excel & Veri Analizi
      </div>
    </>
  );
}
