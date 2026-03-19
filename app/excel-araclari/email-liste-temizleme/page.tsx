"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageRibbon from "@/components/PageRibbon";
import JsonLdTool from "@/components/JsonLd";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

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

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <JsonLdTool
        name="E-posta Liste Temizleme — Ücretsiz E-posta Temizleme Aracı"
        description="E-posta listesinde tekrar eden veya geçersiz formatta olan adresleri temizler. Ücretsiz, tarayıcıda çalışır."
        path="/excel-araclari/email-liste-temizleme"
        keywords={["e-posta liste temizleme", "email temizleme", "geçersiz email", "tekrarlanan email"]}
      />
      <PageRibbon
        title="E-posta Liste Temizleme"
        description="E-posta listesinde tekrar eden veya geçersiz formatta olan adresleri temizler."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={[
            "E-posta listesini aşağıdaki alana yapıştırın (her satırda bir adres). Excel'den tek sütun kopyalayabilirsiniz.",
            "Temizle butonuna tıklayın.",
            "Geçersiz formattaki adresler (örn. @ veya .com içermeyen) ve tekrarlar elenir; yalnızca geçerli ve benzersiz adresler listelenir.",
            "Sonucu Kopyala ile temiz listeyi alıp Excel veya e-posta yazılımına yapıştırın.",
          ]}
        />

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            E-posta listesinde tekrar eden veya geçersiz formatta olan adresleri ayıklar. Böylece kampanya/raporlar için daha temiz ve güvenilir bir liste elde edersin.
          </p>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Örnek girdi / çıktı</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Girdi</p>
              <p className="text-gray-700">
                <span className="font-mono">ahmet@gmail.com</span>
                <br />
                <span className="font-mono">mehmet@gmail.com</span>
                <br />
                <span className="font-mono">ahmet@gmail.com</span>
                <br />
                <span className="font-mono">abc</span>
              </p>
            </div>
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Çıktı</p>
              <p className="text-gray-700">
                <span className="font-mono">ahmet@gmail.com</span>
                <br />
                <span className="font-mono">mehmet@gmail.com</span>
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold text-gray-900">Tekrarları nasıl anlıyor?</span>
              <br />
              Büyük/küçük harf farkını eşleştirmeden sayar; örn. <span className="font-mono">Ahmet@Gmail.com</span> ile aynı kabul eder.
            </p>
            <p>
              <span className="font-semibold text-gray-900">Geçersiz format ne demek?</span>
              <br />
              Basit e-posta formatı doğrulamasını geçmeyen (örn. <span className="font-mono">@</span> veya <span className="font-mono">.</span> koşulları) satırlar elenir.
            </p>
            <p>
              <span className="font-semibold text-gray-900">Excel’e nasıl aktarırım?</span>
              <br />
              “Sonucu Kopyala” ile listeyi kopyalayıp Excel’e yapıştır.
            </p>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            İstersen{" "}
            <Link
              href="/blog/excel-email-liste-temizleme"
              className="underline"
              style={{ color: THEME.ribbon }}
            >
              e-posta temizleme rehberine
            </Link>{" "}
            de göz at.
          </p>
        </section>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">E-posta listesi (her satırda bir adres)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ahmet@gmail.com\nmehmet@gmail.com\nahmet@gmail.com\nabc"
            rows={10}
            className="w-full rounded-lg border p-3 text-sm bg-white font-mono resize-y"
            style={{ borderColor: THEME.gridLine }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleClean}
            className="px-4 py-2 text-sm font-semibold rounded text-white hover:opacity-90 transition"
            style={{ background: THEME.ribbon }}
          >
            Temizle
          </button>
          {result.length > 0 && (
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2 text-sm font-medium rounded transition flex items-center gap-2 ${
                copied ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {copied ? "✓ Kopyalandı" : "Sonucu Kopyala"}
            </button>
          )}
        </div>

        {stats != null && (
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>Girdi: {stats.total} satır</span>
            {stats.invalid > 0 && <span>Geçersiz: {stats.invalid}</span>}
            {stats.duplicate > 0 && <span>Tekrar: {stats.duplicate}</span>}
            <span className="font-medium text-gray-800">Kalan: {stats.kept} adres</span>
          </div>
        )}

        {result.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Temiz liste</label>
            <pre className="rounded-lg border p-4 text-sm bg-white font-mono text-gray-800 max-h-80 overflow-y-auto whitespace-pre-wrap" style={{ borderColor: THEME.gridLine }}>
              {result.join("\n")}
            </pre>
          </div>
        )}
      </div>

      <BenzerExcelAraclari currentHref="/excel-araclari/email-liste-temizleme" />
    </div>
  );
}
