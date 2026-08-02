"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import { extractOnlyNumbers, extractOnlyText } from "@/lib/excelToolHelpers";

const ACCENT = "#217346";

type Mod = "sayi" | "metin";

export default function SayiMetinAyiklaPage() {
  const [input, setInput] = useState("");
  const [mod, setMod] = useState<Mod>("sayi");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input) return "";
    return input
      .split(/\r?\n/)
      .map((line) => (mod === "sayi" ? extractOnlyNumbers(line) : extractOnlyText(line)))
      .join("\n");
  }, [input, mod]);

  const showResult = Boolean(input.trim());

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
      title="Sadece Sayı / Sadece Metin"
      description="Her satırdan yalnızca sayıları veya yalnızca harfleri ayıklar. Kirli hücreleri temizler."
      path="/excel-araclari/sayi-metin-ayikla"
      keywords={["sadece sayı çıkar", "metinden rakam çıkar", "sadece metin ayıkla", "excel temizleme"]}
      howToSteps={[
        "Listeyi yapıştırın (her satır bir hücre).",
        "Sadece sayı veya sadece metin modunu seçin.",
        "Sonuç anında oluşur; kopyalayıp Excel’e yapıştırın.",
      ]}
      faq={[
        {
          question: "Ondalık sayılar korunur mu?",
          answer: "Evet. 12,5 veya 12.5 gibi yazımlar sayı olarak alınır.",
        },
        {
          question: "Boş satırlar ne olur?",
          answer: "Çıktıda da boş satır kalır; satır hizası bozulmaz.",
        },
      ]}
      aboutContent={
        <p className="text-sm text-gray-700">
          “TL 1.250,00” veya “Ahmet-12” gibi karışık hücrelerden ihtiyacınız olan parçayı saniyede ayırır.
        </p>
      }
      relatedLinks={
        <span className="text-gray-600">
          <Link href="/excel-araclari/bosluk-temizle" className="font-medium underline" style={{ color: ACCENT }}>
            Boşluk temizle
          </Link>
          {" · "}
          <Link href="/excel-araclari/sirket-unvan-temizle" className="font-medium underline" style={{ color: ACCENT }}>
            Ünvan temizle
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <div className="relative flex rounded-2xl bg-gray-200/70 p-1">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl shadow-sm transition-transform duration-300"
              style={{
                background: ACCENT,
                transform: mod === "metin" ? "translateX(calc(100% + 0.5rem))" : "translateX(0)",
              }}
            />
            <button
              type="button"
              onClick={() => setMod("sayi")}
              className={`relative z-10 flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold ${
                mod === "sayi" ? "text-white" : "text-gray-600"
              }`}
            >
              Sadece sayı
            </button>
            <button
              type="button"
              onClick={() => setMod("metin")}
              className={`relative z-10 flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold ${
                mod === "metin" ? "text-white" : "text-gray-600"
              }`}
            >
              Sadece metin
            </button>
          </div>

          <label className="mt-4 block text-sm font-semibold text-gray-900">Metni yapıştırın</label>
          <div className="mt-1.5">
            <InputTextarea
              value={input}
              onChange={setInput}
              rows={8}
              minHeight="11rem"
              placeholder={"Fatura: 1.250,50 TL\nKod-ABC-99"}
            />
          </div>

          {showResult ? (
            <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4">
              <span className="text-sm font-semibold text-gray-900">Sonuç</span>
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
