"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import { extractByPreset, type ExtractPreset } from "@/lib/excelToolHelpers";

const ACCENT = "#217346";

const PRESETS: { id: ExtractPreset; label: string; hint: string }[] = [
  { id: "email", label: "E-postalar", hint: "ali@firma.com" },
  { id: "url", label: "Web adresleri", hint: "https://…" },
  { id: "ip", label: "IP adresleri", hint: "192.168.1.1" },
];

export default function VeriAyiklaPage() {
  const [input, setInput] = useState("");
  const [preset, setPreset] = useState<ExtractPreset>("email");
  const [copied, setCopied] = useState(false);

  const items = useMemo(() => (input.trim() ? extractByPreset(input, preset) : []), [input, preset]);
  const result = items.join("\n");

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
      title="Veri Ayıklayıcı"
      description="Karmaşık metinden sadece e-posta, web adresi veya IP’leri süzüp temiz liste verir. Hazır seçenekler (preset)."
      path="/excel-araclari/veri-ayikla"
      keywords={["e-posta ayıkla", "url çıkar metinden", "ip adresi çek", "log temizleme"]}
      howToSteps={[
        "Log veya metin yığınını yapıştırın.",
        "Ne çekileceğini seçin: e-posta, web adresi veya IP.",
        "Benzersiz liste anında oluşur; kopyalayın.",
      ]}
      faq={[
        {
          question: "Kendi regex’imi yazabilir miyim?",
          answer: "Bu sürümde hayır — sadece hazır seçenekler var. Böylece araç basit ve güvenilir kalır.",
        },
        {
          question: "Tekrarlar ne olur?",
          answer: "Aynı değer bir kez listelenir (e-postada büyük/küçük harf birleştirilir).",
        },
      ]}
      aboutContent={
        <p className="text-sm text-gray-700">
          Destek maili, log veya kopyala-yapıştır çöplüğünden ihtiyacınız olan parçayı seçenekle ayıklar. Regex
          yazmanıza gerek yok.
        </p>
      }
      relatedLinks={
        <span className="text-gray-600">
          <Link href="/excel-araclari/email-liste-temizleme" className="font-medium underline" style={{ color: ACCENT }}>
            E-posta liste temizleme
          </Link>
          {" · "}
          <Link href="/excel-araclari/sayi-metin-ayikla" className="font-medium underline" style={{ color: ACCENT }}>
            Sadece sayı / metin
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ne çekilsin?</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={`rounded-xl px-3 py-2 text-left text-xs font-semibold sm:text-sm ${
                  preset === p.id ? "text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={preset === p.id ? { background: ACCENT } : undefined}
              >
                {p.label}
                <span className="mt-0.5 block font-mono text-[10px] opacity-80">{p.hint}</span>
              </button>
            ))}
          </div>

          <label className="mt-4 block text-sm font-semibold text-gray-900">Metni yapıştırın</label>
          <div className="mt-1.5">
            <InputTextarea
              value={input}
              onChange={setInput}
              rows={10}
              minHeight="12rem"
              className="font-mono text-sm"
              placeholder={"İletişim: ali@firma.com, ziyaret https://ornek.com — sunucu 10.0.0.5"}
            />
          </div>
          <p className="mt-2 text-xs tabular-nums text-gray-500">{items.length} benzersiz sonuç</p>

          {items.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4">
              <span className="text-sm font-semibold text-gray-900">Ayıklanan liste</span>
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
