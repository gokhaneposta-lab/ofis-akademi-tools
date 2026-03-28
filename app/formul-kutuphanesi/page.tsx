"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  formulas,
  categoryLabels,
  getAllCategories,
  type FormulaCategory,
} from "@/lib/formulData";

const ACCENT = "#217346";

export default function FormulKutuphanesiPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<FormulaCategory | "all">("all");
  const categories = useMemo(() => getAllCategories(), []);

  const filtered = useMemo(() => {
    let list = formulas;
    if (activeCategory !== "all") {
      list = list.filter((f) => f.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().replace(/\s+/g, "");
      list = list.filter(
        (f) =>
          f.name.toLowerCase().replace(/\s+/g, "").includes(q) ||
          f.nameEn.toLowerCase().includes(q) ||
          f.summary.toLowerCase().includes(q) ||
          f.slug.includes(q)
      );
    }
    return list;
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/80">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline mb-3"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Ana Sayfa
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Formül Kütüphanesi
          </h1>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl">
            Excel&apos;de en çok kullanılan {formulas.length} fonksiyonun detaylı açıklamaları,
            söz dizimi, adım adım kullanım rehberi ve gerçek hayat örnekleri.
            Aradığınız formülü bulun, tıklayıp detayına girin.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Search + Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Formül ara... (örn. DÜŞEYARA, VLOOKUP, EĞER)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              activeCategory === "all"
                ? "text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
            style={activeCategory === "all" ? { background: ACCENT } : undefined}
          >
            Tümü ({formulas.length})
          </button>
          {categories.map((cat) => {
            const count = formulas.filter((f) => f.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  activeCategory === cat
                    ? "text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
                style={activeCategory === cat ? { background: ACCENT } : undefined}
              >
                {categoryLabels[cat]} ({count})
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="text-xs text-gray-500 mb-4">
          {filtered.length} formül gösteriliyor
        </p>

        {/* Formula Cards Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">
              Aramanızla eşleşen formül bulunamadı. Farklı bir arama terimi deneyin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((f) => (
              <Link
                key={f.slug}
                href={`/formul-kutuphanesi/${f.slug}`}
                className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-emerald-200"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {f.name}
                  </h2>
                  <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                    {f.nameEn}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {f.summary}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-medium text-emerald-800 bg-emerald-50"
                  >
                    {categoryLabels[f.category]}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 group-hover:underline">
                    Detay →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
