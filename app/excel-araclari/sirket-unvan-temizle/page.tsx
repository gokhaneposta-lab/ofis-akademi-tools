"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import { cleanSirketUnvan } from "@/lib/excelToolHelpers";

const ACCENT = "#217346";

export default function SirketUnvanTemizlePage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input) return "";
    return input
      .split(/\r?\n/)
      .map((line) => (line.trim() ? cleanSirketUnvan(line) : ""))
      .join("\n");
  }, [input]);

  const showResult = Boolean(input.trim());
  const changed =
    showResult &&
    input
      .split(/\r?\n/)
      .filter((l) => l.trim())
      .some((l, i) => cleanSirketUnvan(l) !== l.trim());

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
      title="Şirket Ünvanı Temizleyici"
      description="A.Ş., Ltd. Şti., Anonim Şirket gibi hukukî ekleri kaldırır; CRM ve eşleştirme için sade ünvan bırakır."
      path="/excel-araclari/sirket-unvan-temizle"
      keywords={["şirket ünvanı temizleme", "a.ş. kaldır", "ltd şti temizle", "unvan normalize"]}
      howToSteps={[
        "Şirket ünvan listesini yapıştırın (her satırda bir ünvan).",
        "Temizlenmiş liste anında oluşur.",
        "Sonucu kopyalayıp Excel veya CRM’e yapıştırın.",
      ]}
      faq={[
        {
          question: "Hangi ekler silinir?",
          answer: "A.Ş., A.S., Ltd., Ltd. Şti., Anonim Şirket, Limited Şirket, Inc., Corp. ve benzerleri.",
        },
        {
          question: "Orijinal ünvan bozulur mu?",
          answer: "Hayır — kaynak metin sizde kalır; araç yalnızca çıktıyı üretir.",
        },
      ]}
      aboutContent={
        <p className="text-sm text-gray-700">
          Aynı şirketin “ABC Sigorta A.Ş.” ve “ABC Sigorta” şeklinde yazılması eşleştirmeyi bozar. Bu araç hukukî
          ekleri ayıklar.
        </p>
      }
      relatedLinks={
        <span className="text-gray-600">
          <Link href="/excel-araclari/buyuk-kucuk-harf" className="font-medium underline" style={{ color: ACCENT }}>
            Büyük / küçük harf
          </Link>
          {" · "}
          <Link href="/excel-araclari/bosluk-temizle" className="font-medium underline" style={{ color: ACCENT }}>
            Boşluk temizle
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label className="block text-sm font-semibold text-gray-900">Ünvan listesi</label>
          <div className="mt-1.5">
            <InputTextarea
              value={input}
              onChange={setInput}
              rows={8}
              minHeight="11rem"
              placeholder={"ABC Sigorta A.Ş.\nXYZ Teknoloji Ltd. Şti.\nDemo Anonim Şirketi"}
            />
          </div>
          {changed ? (
            <p className="mt-2 text-xs font-medium text-emerald-700">Hukukî ekler temizlendi.</p>
          ) : null}

          {showResult ? (
            <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4">
              <span className="text-sm font-semibold text-gray-900">Temiz ünvan</span>
              <textarea
                readOnly
                value={result}
                rows={8}
                className="w-full resize-y rounded-xl border-2 border-emerald-400/90 bg-white px-4 py-3.5 text-[15px] text-gray-900"
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
