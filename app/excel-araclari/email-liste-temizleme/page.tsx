"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

/** Basit e-posta formatı: local@domain (RFC 5322 basitleştirilmiş) */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  return EMAIL_REGEX.test(t);
}

export default function EmailListeTemizlemePage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string[]>([]);
  const [stats, setStats] = useState<{ total: number; invalid: number; duplicate: number; kept: number } | null>(null);
  const [copied, setCopied] = useState(false);

  function handleClean() {
    const lines = input
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    let invalid = 0;
    const seen = new Set<string>([]);
    const kept: string[] = [];

    lines.forEach((line) => {
      if (!isValidEmail(line)) {
        invalid++;
        return;
      }
      const lower = line.toLowerCase();
      if (seen.has(lower)) return;
      seen.add(lower);
      kept.push(line);
    });

    setResult(kept);
    setStats({
      total: lines.length,
      invalid,
      duplicate: lines.length - invalid - kept.length,
      kept: kept.length,
    });
    setCopied(false);
  }

  async function handleCopy() {
    if (!result.length) return;
    const text = result.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error("Kopyalanamadı:", e);
    }
  }

  const aboutContent = (
    <div className="space-y-4">
      <p className="text-sm text-gray-700">
        E-posta listesinde tekrar eden veya geçersiz formatta olan adresleri ayıklar. Böylece kampanya ve raporlar için daha temiz ve güvenilir bir liste elde edersiniz.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/90 p-3 text-xs">
          <p className="mb-2 font-semibold text-gray-800">Örnek girdi</p>
          <p className="space-y-1 text-gray-700">
            <span className="block font-mono">ahmet@gmail.com</span>
            <span className="block font-mono">mehmet@gmail.com</span>
            <span className="block font-mono">ahmet@gmail.com</span>
            <span className="block font-mono">abc</span>
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs">
          <p className="mb-2 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="space-y-1 text-gray-700">
            <span className="block font-mono">ahmet@gmail.com</span>
            <span className="block font-mono">mehmet@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <ToolLayout
      title="E-posta Liste Temizleme"
      description="E-posta listesinde tekrar eden veya geçersiz formatta olan adresleri temizler."
      path="/excel-araclari/email-liste-temizleme"
      keywords={["e-posta liste temizleme", "email temizleme", "geçersiz email", "tekrarlanan email"]}
      howToSteps={[
        "E-posta listesini kutuya yapıştırın (her satırda bir adres).",
        "Temizle butonuna tıklayın.",
        "Geçersiz ve tekrar eden adresler elenir.",
      ]}
      faq={[
        { question: "Tekrarları nasıl anlıyor?", answer: "Büyük/küçük harf farkını eşleştirmeden sayar." },
        { question: "Geçersiz format ne demek?", answer: "@ veya . koşullarını karşılamayan satırlar." },
        { question: "Excel'e nasıl aktarırım?", answer: "Sonucu Kopyala ile listeyi alıp yapıştırın." },
      ]}
      aboutContent={aboutContent}
      relatedLinks={
        <span className="text-gray-600">
          Daha fazla bilgi için{" "}
          <Link
            href="/blog/excel-email-liste-temizleme"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            e-posta liste temizleme rehberine
          </Link>{" "}
          göz atın.
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            E-posta listesini yapıştırın
          </label>
          <InputTextarea
            value={input}
            onChange={setInput}
            placeholder={
              "ahmet@gmail.com\nmehmet@gmail.com\nahmet@gmail.com\nabc"
            }
            rows={10}
            minHeight="12rem"
            className="!resize-y font-mono text-sm"
          />
          <PrimaryButton className="mt-3" onClick={handleClean}>
            Temizle
          </PrimaryButton>
        </div>

        {stats && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium tabular-nums text-gray-700">
              Girdi: {stats.total}
            </span>
            {stats.invalid > 0 && (
              <span className="inline-flex items-center rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium tabular-nums text-red-800">
                Geçersiz: {stats.invalid}
              </span>
            )}
            {stats.duplicate > 0 && (
              <span className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-medium tabular-nums text-amber-900">
                Tekrar: {stats.duplicate}
              </span>
            )}
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium tabular-nums text-emerald-900">
              Kalan: {stats.kept}
            </span>
          </div>
        )}

        {result.length > 0 && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4 shadow-sm sm:px-5">
            <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap break-all rounded-xl border border-emerald-100/80 bg-white/90 p-3 text-sm font-mono text-gray-900 shadow-inner">
              {result.join("\n")}
            </pre>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                style={
                  copied
                    ? { borderColor: ACCENT, color: ACCENT }
                    : undefined
                }
              >
                {copied ? "Kopyalandı ✓" : "Sonucu Kopyala"}
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
