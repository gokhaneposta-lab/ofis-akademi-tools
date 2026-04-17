import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  formulas,
  getFormulaBySlug,
  getRelatedFormulas,
  categoryLabels,
  type FormulaDef,
} from "@/lib/formulData";
import { canonicalUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return formulas.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = getFormulaBySlug(slug);
  if (!f) return {};
  const title = f.seoTitle ?? `${f.name} Kullanımı — Excel Formül Kütüphanesi`;
  const description = f.seoDescription ?? f.summary;
  return {
    title,
    description,
    keywords: f.seoKeywords,
    alternates: {
      canonical: canonicalUrl(`/formul-kutuphanesi/${slug}`),
    },
    openGraph: {
      title: f.seoTitle ?? `${f.name} (${f.nameEn}) — Ofis Akademi Formül Kütüphanesi`,
      description,
      type: "article",
      url: canonicalUrl(`/formul-kutuphanesi/${slug}`),
      siteName: "Ofis Akademi",
      locale: "tr_TR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="h-1 w-5 rounded-full bg-emerald-500" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function FormulDetailPage({ params }: Props) {
  const { slug } = await params;
  const f = getFormulaBySlug(slug);
  if (!f) notFound();

  const related = getRelatedFormulas(slug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/80">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <Link
            href="/formul-kutuphanesi"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline mb-3"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Formül Kütüphanesi
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{f.name}</h1>
            <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
              {f.nameEn}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">{f.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              {categoryLabels[f.category]}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        {/* Söz Dizimi */}
        <Section title="Söz Dizimi (Syntax)">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <code className="text-sm font-mono font-semibold text-emerald-900 break-all">
              {f.syntax}
            </code>
          </div>
        </Section>

        {/* Parametreler */}
        {f.params.length > 0 && (
          <Section title="Parametreler">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-2 font-semibold text-gray-600">Parametre</th>
                    <th className="px-4 py-2 font-semibold text-gray-600">Açıklama</th>
                  </tr>
                </thead>
                <tbody>
                  {f.params.map((p, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-2 font-mono font-medium text-gray-900 whitespace-nowrap">
                        {p.name}
                      </td>
                      <td className="px-4 py-2 text-gray-600">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* Adım Adım */}
        {f.steps.length > 0 && (
          <Section title="Adım Adım Kullanım">
            <ol className="space-y-2">
              {f.steps.map((step, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-xs text-gray-700"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* Örnekler */}
        {f.examples.length > 0 && (
          <Section title="Gerçek Hayat Örnekleri">
            <div className="space-y-3">
              {f.examples.map((ex, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
                    <p className="text-xs font-medium text-gray-700">{ex.scenario}</p>
                  </div>
                  <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-gray-800 break-all bg-gray-50 rounded-lg px-3 py-2">
                      {ex.formula}
                    </code>
                    <span className="shrink-0 text-xs text-gray-400">=</span>
                    <span className="shrink-0 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                      {ex.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* İpuçları */}
        {f.tips.length > 0 && (
          <Section title="İpuçları & Dikkat Edilecekler">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <ul className="space-y-2">
                {f.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-xs text-amber-900 leading-relaxed">
                    <span className="mt-0.5 shrink-0">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        )}

        {/* İlgili Formüller */}
        {related.length > 0 && (
          <Section title="İlgili Formüller">
            <div className="flex flex-wrap gap-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/formul-kutuphanesi/${r.slug}`}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-medium text-gray-700 transition hover:border-emerald-200 hover:text-emerald-700 hover:shadow-sm"
                >
                  {r.name} <span className="text-gray-400">({r.nameEn})</span>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* CTA Linkleri */}
        <div className="mt-8 flex flex-wrap gap-3">
          {f.guideHref && (
            <Link
              href={f.guideHref}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
              {f.guideName}
            </Link>
          )}
          {f.toolHref && (
            <Link
              href={f.toolHref}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-600 bg-white px-5 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {f.toolName}
            </Link>
          )}
          {f.blogHref && (
            <Link
              href={f.blogHref}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              {f.blogName}
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
