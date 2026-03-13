
"use client";

import Link from "next/link";

const tools = [
  {
    name: "Ad Soyad Ayırıcı",
    href: "/excel-araclari/ad-soyad-ayir",
    description: "Tam ad listesini otomatik olarak ad ve soyad olarak ayırır.",
  },
  {
    name: "CSV Ayırıcı",
    href: "/excel-araclari/csv-ayir",
    description: "CSV verilerini otomatik olarak sütunlara ayırır.",
  },
  {
    name: "Liste Birleştirici",
    href: "/excel-araclari/liste-birlestir",
    description:
      "Birden fazla satırdaki verileri seçilen ayraç ile tek satırda birleştirir.",
  },
];

export default function ToolsHub() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 sm:mb-10">
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300 ring-1 ring-emerald-400/30">
            Ofis Akademi · Excel Araçları
          </span>
          <div className="mt-4 space-y-3">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Excel Araçları
            </h1>
            <p className="max-w-xl text-sm text-slate-300 sm:text-base">
              Excel çalışmalarınızı hızlandıran ücretsiz araçlar. Ad soyad
              ayırma, CSV verilerini sütunlara bölme ve SQL veya Excel için
              liste birleştirme gibi işlemleri saniyeler içinde yapabilirsiniz.
            </p>
          </div>
        </header>

        <section className="flex-1">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <article
                key={tool.href}
                className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:border-emerald-400/60 hover:shadow-emerald-800/40"
              >
                <div>
                  <h2 className="text-sm font-semibold text-slate-50 sm:text-base">
                    {tool.name}
                  </h2>
                  <p className="mt-2 text-xs text-slate-300 sm:text-sm">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-4">
                  <Link
                    href={tool.href}
                    className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/30 transition group-hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:text-sm"
                  >
                    Aracı Aç
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
