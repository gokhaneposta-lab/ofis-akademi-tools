"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

const TR_AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function parseDate(s: string): Date | null {
  const t = s.trim();
  if (!t) return null;
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t);
  if (iso) {
    const d = new Date(+iso[1], +iso[2] - 1, +iso[3]);
    return isNaN(d.getTime()) ? null : d;
  }
  const dmy = /^(\d{1,2})[./\-](\d{1,2})[./\-](\d{4})/.exec(t);
  if (dmy) {
    const d = new Date(+dmy[3], +dmy[2] - 1, +dmy[1]);
    return isNaN(d.getTime()) ? null : d;
  }
  const fallback = new Date(t);
  return isNaN(fallback.getTime()) ? null : fallback;
}

function pad(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

type OutFormat = "iso" | "trLong" | "ddmmyyyyDot" | "ddmmyyyySlash";

function formatDate(d: Date, fmt: OutFormat): string {
  const g = d.getDate();
  const a = d.getMonth();
  const y = d.getFullYear();
  if (fmt === "iso") return `${y}-${pad(d.getMonth() + 1)}-${pad(g)}`;
  if (fmt === "trLong") return `${pad(g)} ${TR_AYLAR[a]} ${y}`;
  if (fmt === "ddmmyyyyDot") return `${pad(g)}.${pad(a + 1)}.${y}`;
  if (fmt === "ddmmyyyySlash") return `${pad(g)}/${pad(a + 1)}/${y}`;
  return "";
}

export default function TarihFormatDonusturucuPage() {
  const [input, setInput] = useState("");
  const [outFormat, setOutFormat] = useState<OutFormat>("iso");
  const [result, setResult] = useState<string[]>([]);
  const [invalidLines, setInvalidLines] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  function handleConvert() {
    const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const out: string[] = [];
    const invalid: string[] = [];
    lines.forEach((line) => {
      const d = parseDate(line);
      if (d) {
        out.push(formatDate(d, outFormat));
      } else {
        invalid.push(line);
      }
    });
    setResult(out);
    setInvalidLines(invalid);
    setCopied(false);
  }

  async function handleCopy() {
    if (!result.length) return;
    try {
      await navigator.clipboard.writeText(result.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error("Kopyalanamadı:", e);
    }
  }

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Elinizdeki tarihleri farklı okunabilir formatlara (ISO, Türkçe uzun, GG.AA.YYYY gibi) dönüştürür. Excel’de “tarih mi metin mi?” karışıklığını azaltmaya yardımcı olur.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="font-mono text-gray-700">01/03/2025</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Çıktı (ISO)</p>
          <p className="font-mono text-gray-700">2025-03-01</p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="Tarih Format Dönüştürücü"
      description="Tarih formatlarını farklı biçimlere çevirir (ISO, Türkçe uzun, GG.AA.YYYY vb.)."
      path="/excel-araclari/tarih-format-donusturucu"
      keywords={["tarih format dönüştürücü", "tarih formatı", "ISO tarih", "Excel tarih formatı"]}
      howToSteps={[
        "Tarihleri aşağıdaki alana yapıştırın (her satırda bir tarih). 01/03/2025, 01.03.2025, 2025-03-01 gibi formatlar desteklenir.",
        "Hedef formatı seçin: ISO (YYYY-MM-DD), Türkçe uzun (01 Mart 2025), GG.AA.YYYY veya GG/AA/YYYY.",
        "Dönüştür butonuna tıklayın.",
        "Sonucu kopyalayıp Excel veya başka uygulamaya yapıştırın.",
      ]}
      faq={[
        {
          question: "Hangi giriş formatları desteklenir?",
          answer: "01/03/2025, 01.03.2025, 2025-03-01 gibi formatlar.",
        },
        {
          question: "Geçersiz satır ne olur?",
          answer: "O satır hata listesine düşer (dönüştürülmez).",
        },
        {
          question: "Excel’e nasıl taşınır?",
          answer: "Sonucu kopyala → Excel’de yapıştır.",
        },
      ]}
      aboutContent={aboutContent}
      relatedLinks={
        <span className="text-gray-600">
          Daha fazla örnek için{" "}
          <Link
            href="/blog/excelde-tarih-format-donusturme"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            tarih format dönüştürme rehberine
          </Link>{" "}
          bakabilirsin.
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <div className="mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Hedef format
            </span>
            <div
              className="relative mt-1.5 grid grid-cols-1 gap-1 rounded-2xl bg-gray-200/70 p-1 sm:grid-cols-2"
              role="group"
              aria-label="Çıkış tarih formatı"
            >
              <button
                type="button"
                onClick={() => setOutFormat("iso")}
                className={`rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition sm:text-sm ${
                  outFormat === "iso" ? "text-white shadow-sm" : "text-gray-600 hover:bg-white/60"
                }`}
                style={outFormat === "iso" ? { background: ACCENT } : undefined}
              >
                ISO (YYYY-MM-DD)
              </button>
              <button
                type="button"
                onClick={() => setOutFormat("trLong")}
                className={`rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition sm:text-sm ${
                  outFormat === "trLong" ? "text-white shadow-sm" : "text-gray-600 hover:bg-white/60"
                }`}
                style={outFormat === "trLong" ? { background: ACCENT } : undefined}
              >
                Türkçe uzun (01 Mart 2025)
              </button>
              <button
                type="button"
                onClick={() => setOutFormat("ddmmyyyyDot")}
                className={`rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition sm:text-sm ${
                  outFormat === "ddmmyyyyDot" ? "text-white shadow-sm" : "text-gray-600 hover:bg-white/60"
                }`}
                style={outFormat === "ddmmyyyyDot" ? { background: ACCENT } : undefined}
              >
                GG.AA.YYYY
              </button>
              <button
                type="button"
                onClick={() => setOutFormat("ddmmyyyySlash")}
                className={`rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition sm:text-sm ${
                  outFormat === "ddmmyyyySlash" ? "text-white shadow-sm" : "text-gray-600 hover:bg-white/60"
                }`}
                style={outFormat === "ddmmyyyySlash" ? { background: ACCENT } : undefined}
              >
                GG/AA/YYYY
              </button>
            </div>
          </div>

          <label
            htmlFor="tarih-format-input"
            className="mt-4 block text-sm font-semibold text-gray-900"
          >
            Tarihler (her satırda bir; 01/03/2025, 2025-03-01 vb.)
          </label>
          <div className="mt-1.5">
            <InputTextarea
              id="tarih-format-input"
              value={input}
              onChange={setInput}
              rows={8}
              minHeight="12rem"
              className="resize-y font-mono text-sm"
              placeholder={"01/03/2025\n01.03.2025\n2025-03-01"}
            />
          </div>

          <PrimaryButton className="mt-3" onClick={handleConvert}>
            Dönüştür
          </PrimaryButton>
        </div>

        {invalidLines.length > 0 && (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs font-medium text-amber-900">
            {invalidLines.length} satır tanınamadı (GG/AA/YYYY veya YYYY-MM-DD formatında girin).
          </p>
        )}

        {result.length > 0 && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4 shadow-md sm:px-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Dönüştürülmüş tarihler</h2>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex shrink-0 items-center justify-center self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] sm:self-auto"
                style={copied ? { borderColor: ACCENT, color: ACCENT } : undefined}
              >
                {copied ? "Kopyalandı ✓" : "Sonucu kopyala"}
              </button>
            </div>

            <div className="mt-3 overflow-x-auto rounded-xl border border-emerald-200/80 bg-white shadow-sm">
              <table className="w-full min-w-[280px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-emerald-100 bg-emerald-50/80">
                    <th className="px-3 py-2.5 font-semibold text-gray-700 sm:px-4">#</th>
                    <th className="px-3 py-2.5 font-semibold text-gray-700 sm:px-4">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {result.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="px-3 py-2.5 tabular-nums text-gray-500 sm:px-4">{i + 1}</td>
                      <td className="px-3 py-2.5 font-mono text-gray-900 sm:px-4">{row}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-gray-600 sm:hidden">Yatay kaydırarak tüm sütunları görebilirsiniz.</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
