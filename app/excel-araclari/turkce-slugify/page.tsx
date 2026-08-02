"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import { slugifyTr, type SlugifyStyle } from "@/lib/excelToolHelpers";

const ACCENT = "#217346";

const STYLES: { id: SlugifyStyle; label: string; sample: string }[] = [
  { id: "kebab", label: "tire (kebab)", sample: "saziye-cesme" },
  { id: "snake", label: "alt çizgi", sample: "saziye_cesme" },
  { id: "compact", label: "bitişik", sample: "saziyecesme" },
];

export default function TurkceSlugifyPage() {
  const [input, setInput] = useState("");
  const [style, setStyle] = useState<SlugifyStyle>("kebab");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return "";
    return input
      .split(/\r?\n/)
      .map((line) => (line.trim() ? slugifyTr(line, style) : ""))
      .join("\n");
  }, [input, style]);

  const show = Boolean(input.trim());

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <ToolLayout
      title="Türkçe → Slugify"
      description="Ş, Ğ, Ü, Ö, Ç, İ karakterlerini web ve e-posta güvenli formata çevirir (saziye-cesme)."
      path="/excel-araclari/turkce-slugify"
      keywords={["türkçe slugify", "türkçe karakter english", "url slug türkçe", "şğüöçı dönüştür"]}
      howToSteps={[
        "İsim veya başlık listesini yapıştırın (her satır bir kayıt).",
        "Çıktı stilini seçin: tire, alt çizgi veya bitişik.",
        "Sonucu kopyalayıp URL, e-posta veya dosya adında kullanın.",
      ]}
      faq={[
        {
          question: "İ büyük I nasıl olur?",
          answer: "İ ve I → i; ı → i. ASCII’ye indirgenir.",
        },
        {
          question: "Boşluklar ne olur?",
          answer: "Tire veya alt çizgi stilinde ayraç olur; bitişikte tamamen kalkar.",
        },
      ]}
      aboutContent={
        <p className="text-sm text-gray-700">
          E-posta listesi, URL slug ve dosya adı üretirken Türkçe karakterleri güvenli ASCII’ye çevirir.
        </p>
      }
      relatedLinks={
        <span className="text-gray-600">
          <Link href="/excel-araclari/buyuk-kucuk-harf" className="font-medium underline" style={{ color: ACCENT }}>
            Büyük / küçük harf
          </Link>
          {" · "}
          <Link href="/excel-araclari/email-liste-temizleme" className="font-medium underline" style={{ color: ACCENT }}>
            E-posta temizleme
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Çıktı stili</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold sm:text-sm ${
                  style === s.id ? "text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={style === s.id ? { background: ACCENT } : undefined}
              >
                {s.label}
                <span className="mt-0.5 block font-mono text-[10px] opacity-80">{s.sample}</span>
              </button>
            ))}
          </div>

          <label className="mt-4 block text-sm font-semibold text-gray-900">Listeyi yapıştırın</label>
          <div className="mt-1.5">
            <InputTextarea
              value={input}
              onChange={setInput}
              rows={8}
              minHeight="11rem"
              placeholder={"Şaziye Çeşme\nGökhan Öğüt"}
            />
          </div>

          {show ? (
            <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4">
              <span className="text-sm font-semibold text-gray-900">Slug çıktısı</span>
              <textarea
                readOnly
                value={result}
                rows={8}
                className="w-full resize-y rounded-xl border-2 border-emerald-400/90 bg-white px-4 py-3.5 font-mono text-[15px] text-gray-900"
                style={{ minHeight: "11rem" }}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-gray-50"
                  style={copied ? { borderColor: ACCENT, color: ACCENT } : undefined}
                >
                  {copied ? "Kopyalandı ✓" : "Sonucu kopyala"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ToolLayout>
  );
}
