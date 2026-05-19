"use client";

import React from "react";
import Link from "next/link";
import JsonLdTool from "@/components/JsonLd";
import ToolJsonLd from "@/components/ToolJsonLd";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import RelatedBlogForTool from "@/components/RelatedBlogForTool";
import Accordion from "@/components/Accordion";
import { site } from "@/components/siteUi";

export const ACCENT = "#166534";

type FAQItem = { question: string; answer: string };

type ToolLayoutProps = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  howToSteps?: string[];
  faq?: FAQItem[];
  aboutContent?: React.ReactNode;
  relatedLinks?: React.ReactNode;
  children: React.ReactNode;
};

export default function ToolLayout({
  title,
  description,
  path,
  keywords = [],
  howToSteps = [],
  faq = [],
  aboutContent,
  relatedLinks,
  children,
}: ToolLayoutProps) {
  const hasHowTo = howToSteps.length > 0;
  const hasFaq = faq.length > 0;
  const hasAbout = aboutContent != null;
  const hasAccordions = hasHowTo || hasFaq || hasAbout;

  return (
    <div className={site.toolPageBg}>
      <JsonLdTool
        name={`${title} — Ücretsiz Excel Aracı`}
        description={description}
        path={path}
        keywords={keywords}
      />
      {(hasHowTo || hasFaq) && (
        <ToolJsonLd name={title} description={description} path={path} howToSteps={howToSteps} faq={faq} />
      )}

      <header className={site.toolHeader}>
        <div className={site.toolHeaderInner}>
          <Link
            href="/excel-araclari"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:bg-white active:scale-95"
            aria-label="Excel araçlarına dön"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className={site.toolTitle}>{title}</h1>
            <p className={site.toolDesc}>{description}</p>
          </div>
        </div>
      </header>

      <main>
        <div className={site.toolMain}>
          <p className={site.toolPrivacy}>
            Verileriniz tarayıcınızda işlenir; bu araç için sunucuya gönderilmez. Sonucu Excel&apos;e kopyalayıp
            yapıştırabilirsiniz.
          </p>

          {children}

          {hasAccordions && (
            <div className="flex flex-col gap-3 pt-2">
              {hasHowTo && (
                <Accordion title="Nasıl kullanılır?">
                  <ol className="list-inside list-decimal space-y-2 text-sm leading-relaxed text-slate-700">
                    {howToSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </Accordion>
              )}
              {hasAbout && <Accordion title="Bu araç ne işe yarar?">{aboutContent}</Accordion>}
              {hasFaq && (
                <Accordion title="Sık sorulan sorular">
                  <div className="space-y-4 text-sm">
                    {faq.map((f, i) => (
                      <FaqItem key={i} q={f.question} a={f.answer} />
                    ))}
                  </div>
                  {relatedLinks && <div className="mt-4 flex flex-wrap gap-2 text-xs">{relatedLinks}</div>}
                </Accordion>
              )}
            </div>
          )}

          <RelatedBlogForTool toolHref={path} limit={3} />
          <BenzerExcelAraclari currentHref={path} />
          <p className="pt-2 text-center text-[11px] text-slate-400">Ofis Akademi · Excel &amp; veri analizi</p>
        </div>
      </main>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <p className="font-semibold text-slate-900">{q}</p>
      <p className="mt-0.5 leading-relaxed text-slate-600">{a}</p>
    </div>
  );
}

/** Araç gövdesi — girdi, buton ve sonuç alanı için ortak kart. */
export function ToolWorkbench({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${site.toolWorkbench} ${className ?? ""}`.trim()}>{children}</div>;
}
