import Link from "next/link";
import { getPostBySlug } from "@/lib/blog-posts";
import { tsbSeoContentFor, type TsbSeoContent } from "@/lib/tsbSeoContent";
import type { TsbSeoPageId } from "@/lib/tsbSeo";
import { cn, tsb } from "@/components/tsb/tsbDashboardUi";

type Props = {
  pageId: TsbSeoPageId | "hub";
  className?: string;
};

export default function TsbSeoSection({ pageId, className }: Props) {
  const content = tsbSeoContentFor(pageId);
  return <TsbSeoSectionInner content={content} className={className} />;
}

function TsbSeoSectionInner({ content, className }: { content: TsbSeoContent; className?: string }) {
  const blogPosts =
    content.blogSlugs
      ?.map((slug) => getPostBySlug(slug))
      .filter((p): p is NonNullable<typeof p> => Boolean(p)) ?? [];

  return (
    <section
      className={cn(
        "mt-10 rounded-xl border border-slate-200/90 bg-white px-4 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)] sm:px-5",
        className,
      )}
      aria-labelledby="tsb-seo-section-heading"
    >
      <h2 id="tsb-seo-section-heading" className="text-base font-semibold text-slate-900 sm:text-lg">
        {content.heading}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
        {content.paragraphs.map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
      </div>
      {content.bullets && content.bullets.length > 0 ? (
        <ul className="mt-4 list-none space-y-1.5 pl-0 text-sm text-slate-700">
          {content.bullets.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {content.faqs.length > 0 ? (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sık sorulan sorular</h3>
          <dl className="mt-3 space-y-4">
            {content.faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="text-sm font-semibold text-slate-800">{faq.question}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-slate-600">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {blogPosts.length > 0 ? (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">İlgili rehber yazıları</h3>
          <ul className="mt-2 space-y-2">
            {blogPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-medium text-emerald-800 underline decoration-emerald-300 underline-offset-2 hover:decoration-emerald-600"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className={cn(tsb.caption, "mt-5 border-t border-slate-100 pt-4")}>
        Kaynak: Türkiye Sigortalar Birliği kamuya açık istatistikleri. Resmi tablolar için{" "}
        <a
          href="https://www.tsb.org.tr"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-emerald-800 underline decoration-emerald-400/60"
        >
          tsb.org.tr
        </a>
        .
      </p>
    </section>
  );
}
