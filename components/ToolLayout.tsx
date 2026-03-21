"use client";

import React from "react";
import Link from "next/link";
import JsonLdTool from "@/components/JsonLd";
import ToolJsonLd from "@/components/ToolJsonLd";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import Accordion from "@/components/Accordion";

const ACCENT = "#217346";

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
    <div className="min-h-screen bg-gray-50">
      <JsonLdTool
        name={`${title} — Ücretsiz Excel Aracı`}
        description={description}
        path={path}
        keywords={keywords}
      />
      {(hasHowTo || hasFaq) && (
        <ToolJsonLd
          name={title}
          description={description}
          path={path}
          howToSteps={howToSteps}
          faq={faq}
        />
      )}

      <header className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/80 backdrop-blur-lg print:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/excel-araclari"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 active:scale-90"
            aria-label="Geri"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-gray-900">{title}</h1>
            <p className="truncate text-xs text-gray-500">{description}</p>
          </div>
        </div>
      </header>

      <main className="pb-10 pt-5">
        {children}

        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {hasAccordions && (
            <div className="mt-6 flex flex-col gap-3">
              {hasHowTo && (
                <Accordion title="Nasıl kullanılır?">
                  <ol className="list-inside list-decimal space-y-2 text-gray-700">
                    {howToSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </Accordion>
              )}
              {hasAbout && (
                <Accordion title="Bu araç ne işe yarar?">
                  {aboutContent}
                </Accordion>
              )}
              {hasFaq && (
                <Accordion title="Sık sorulan sorular">
                  <div className="space-y-4">
                    {faq.map((f, i) => (
                      <div key={i}>
                        <p className="font-semibold text-gray-900">{f.question}</p>
                        <p className="mt-0.5 text-gray-600">{f.answer}</p>
                      </div>
                    ))}
                  </div>
                  {relatedLinks && (
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      {relatedLinks}
                    </div>
                  )}
                </Accordion>
              )}
            </div>
          )}

          <div className="mt-6">
            <BenzerExcelAraclari currentHref={path} />
          </div>

          <p className="mt-4 text-center text-xs text-gray-400">
            Ofis Akademi · Excel &amp; Veri Analizi
          </p>
        </div>
      </main>

      <style jsx global>{`
        @keyframes staggerFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export { ACCENT };
