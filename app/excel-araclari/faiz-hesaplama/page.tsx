"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

export default function FaizHesaplamaPage() {
  const [anapara, setAnapara] = useState("");
  const [oran, setOran] = useState("");
  const [sure, setSure] = useState("");
  const [sureBirim, setSureBirim] = useState<"yil" | "ay">("yil");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  function handleHesapla() {
    const P = parseFloat(anapara.replace(/\s/g, "").replace(",", "."));
    const r = parseFloat(oran.replace(",", ".")) / 100;
    const t = parseFloat(sure.replace(",", "."));
    const tYil = sureBirim === "ay" ? t / 12 : t;

    if (Number.isNaN(P) || Number.isNaN(r) || Number.isNaN(t) || P <= 0 || t <= 0) {
      setResult("");
      return;
    }

    const basitFaiz = P * r * tYil;
    const bilesikToplam = P * Math.pow(1 + r, tYil);
    const bilesikFaiz = bilesikToplam - P;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const satir = (label: string, val: number) =>
      `${label}\t${val.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const lines = [
      "Anapara (₺)\t" + P.toLocaleString("tr-TR", { minimumFractionDigits: 2 }),
      "Yıllık faiz oranı (%)\t" + (r * 100).toLocaleString("tr-TR"),
      "Süre\t" + t + " " + (sureBirim === "ay" ? "ay" : "yıl"),
      "",
      "Basit faiz tutarı\t" + basitFaiz.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      "Basit faiz sonrası toplam\t" + (P + basitFaiz).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      "",
      "Bileşik faiz tutarı\t" + bilesikFaiz.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      "Bileşik faiz sonrası toplam\t" + bilesikToplam.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    ];
    setResult(lines.join("\n"));
    setCopied(false);
  }

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

  const resultRows = useMemo(() => {
    if (!result) return [];
    return result
      .split(/\r?\n/)
      .filter((line) => line.length > 0)
      .map((line) => {
        const tab = line.indexOf("\t");
        if (tab === -1) return { label: line, value: "" as string | undefined };
        return { label: line.slice(0, tab), value: line.slice(tab + 1) };
      });
  }, [result]);

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/15";

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Basit ve bileşik faiz hesaplarını tek ekranda verir. Yatırım, teklif karşılaştırma ve finansal planlama sırasında doğru faiz etkisini hızlıca görmenizi sağlar.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="text-gray-700">Anapara: 10.000 · Oran: %12 · Süre: 2 yıl</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">Basit faiz: 2.400 · Bileşik toplam: 12.544</p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="Faiz Hesaplama"
      description="Basit ve bileşik faiz hesaplayın. Anapara, yıllık faiz oranı ve süre ile faiz tutarını ve toplam getiriyi görün."
      path="/excel-araclari/faiz-hesaplama"
      keywords={["excel faiz hesaplama", "basit faiz", "bileşik faiz", "faiz hesaplayıcı"]}
      howToSteps={[
        "Anapara (₺), yıllık faiz oranı (%) ve süreyi girin; süreyi yıl veya ay seçin.",
        "Hesapla butonuna tıklayın.",
        "Basit ve bileşik faiz tutarları ile toplam getiri görünür; Sonucu Kopyala ile alabilirsiniz.",
      ]}
      faq={[
        {
          question: "Ay seçince hesaplama nasıl yapılır?",
          answer: "Araç ay değerini otomatik olarak yıla çevirip faiz hesabını buna göre yapar.",
        },
        {
          question: "Basit ve bileşik faiz farkı nedir?",
          answer: "Basit faizde faiz sadece anaparaya işler, bileşik faizde biriken faiz de faiz üretir.",
        },
        {
          question: "Sonucu rapora alabilir miyim?",
          answer: "Evet. Çıktıyı kopyalayıp Excel raporunuza yapıştırabilirsiniz.",
        },
      ]}
      aboutContent={aboutContent}
      relatedLinks={
        <span className="text-gray-600">
          <Link
            href="/egitimler/orta"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Orta seviye eğitim
          </Link>
          {" · "}
          <Link
            href="/blog/excelde-faiz-hesaplama"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Faiz rehberi
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-6 sm:py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="faiz-anapara"
                className="mb-1 block text-xs font-medium text-gray-600"
              >
                Anapara (₺)
              </label>
              <input
                id="faiz-anapara"
                type="text"
                value={anapara}
                onChange={(e) => setAnapara(e.target.value)}
                placeholder="10000"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="faiz-oran"
                className="mb-1 block text-xs font-medium text-gray-600"
              >
                Yıllık faiz oranı (%)
              </label>
              <input
                id="faiz-oran"
                type="text"
                value={oran}
                onChange={(e) => setOran(e.target.value)}
                placeholder="12"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="faiz-sure" className="mb-1 block text-xs font-medium text-gray-600">
                Süre
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <input
                  id="faiz-sure"
                  type="text"
                  value={sure}
                  onChange={(e) => setSure(e.target.value)}
                  placeholder="1"
                  className={`${inputClass} sm:min-w-0 sm:flex-1`}
                />
                <div className="flex shrink-0 flex-col sm:w-44">
                  <span className="mb-1 block text-xs font-medium text-gray-600 sm:hidden">Birim</span>
                  <div className="relative flex h-12 w-full rounded-xl bg-gray-200/90 p-1">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute left-1 top-1 bottom-1 rounded-lg shadow-sm transition-transform duration-200 ease-out"
                      style={{
                        width: "calc(50% - 4px)",
                        background: ACCENT,
                        transform:
                          sureBirim === "ay" ? "translateX(calc(100% + 8px))" : "translateX(0)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setSureBirim("yil")}
                      className={`relative z-10 flex-1 rounded-lg text-sm font-semibold transition-colors ${
                        sureBirim === "yil" ? "text-white" : "text-gray-700"
                      }`}
                    >
                      Yıl
                    </button>
                    <button
                      type="button"
                      onClick={() => setSureBirim("ay")}
                      className={`relative z-10 flex-1 rounded-lg text-sm font-semibold transition-colors ${
                        sureBirim === "ay" ? "text-white" : "text-gray-700"
                      }`}
                    >
                      Ay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <PrimaryButton className="mt-4" onClick={handleHesapla}>
            Hesapla
          </PrimaryButton>
        </div>

        {result && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4 shadow-md sm:px-5">
            <label className="block text-sm font-semibold text-gray-900">Sonuç</label>
            <div className="mt-3 overflow-x-auto rounded-xl border border-emerald-200/80 bg-white shadow-sm">
              <table className="w-full min-w-[280px] border-collapse text-left text-sm">
                <tbody className="divide-y divide-gray-100">
                  {resultRows.map((row, i) => (
                    <tr
                      key={i}
                      className={
                        row.label === "Basit faiz tutarı" || row.label === "Bileşik faiz tutarı"
                          ? "border-t border-gray-200"
                          : ""
                      }
                    >
                      <th
                        scope="row"
                        className="px-3 py-2.5 font-medium text-gray-700 sm:px-4 sm:py-3"
                      >
                        {row.label}
                      </th>
                      <td className="px-3 py-2.5 font-medium tabular-nums text-gray-900 sm:px-4 sm:py-3">
                        {row.value ?? ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!result}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={
                  copied
                    ? { borderColor: ACCENT, color: ACCENT }
                    : undefined
                }
              >
                {copied ? "Kopyalandı ✓" : "Sonucu kopyala"}
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
