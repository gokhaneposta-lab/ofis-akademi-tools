"use client";

import React, { useState, useMemo } from "react";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import { THEME } from "@/lib/theme";

function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter((s) => s.length > 0).length;
}

function countChars(text: string): { withSpaces: number; withoutSpaces: number } {
  const withSpaces = text.length;
  const withoutSpaces = text.replace(/\s/g, "").length;
  return { withSpaces, withoutSpaces };
}

export default function KelimeKarakterSayaciPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const words = countWords(input);
    const { withSpaces, withoutSpaces } = countChars(input);
    return { words, withSpaces, withoutSpaces };
  }, [input]);

  const copyText = `Kelime sayısı\t${stats.words}\nKarakter (boşluklu)\t${stats.withSpaces}\nKarakter (boşluksuz)\t${stats.withoutSpaces}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Kelime & Karakter Sayacı"
        description="Metindeki kelime sayısını ve karakter sayısını (boşluklu / boşluksuz) hesaplayın. Excel veya metin yapıştırın."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-2xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Metin (yapıştırın veya yazın)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Buraya metin yapıştırın. Kelime ve karakter sayıları anında güncellenir."
            rows={8}
            className="w-full rounded-lg border p-3 text-sm bg-white resize-y"
            style={{ borderColor: THEME.gridLine }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4 text-center bg-white" style={{ borderColor: THEME.gridLine }}>
            <div className="text-2xl font-bold tabular-nums" style={{ color: THEME.ribbon }}>{stats.words}</div>
            <div className="text-xs font-medium text-gray-600 mt-1">Kelime</div>
          </div>
          <div className="rounded-lg border p-4 text-center bg-white" style={{ borderColor: THEME.gridLine }}>
            <div className="text-2xl font-bold tabular-nums" style={{ color: THEME.ribbon }}>{stats.withSpaces}</div>
            <div className="text-xs font-medium text-gray-600 mt-1">Karakter (boşluklu)</div>
          </div>
          <div className="rounded-lg border p-4 text-center bg-white" style={{ borderColor: THEME.gridLine }}>
            <div className="text-2xl font-bold tabular-nums" style={{ color: THEME.ribbon }}>{stats.withoutSpaces}</div>
            <div className="text-xs font-medium text-gray-600 mt-1">Karakter (boşluksuz)</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <CopyButton onClick={handleCopy} disabled={!input.trim()} copied={copied} label="Sonucu Kopyala" copiedLabel="Kopyalandı" />
        </div>

        <div className="text-xs text-gray-500">Ofis Akademi · Metin araçları</div>
      </div>
    </div>
  );
}
