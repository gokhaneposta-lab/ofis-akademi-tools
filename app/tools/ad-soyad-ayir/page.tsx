"use client";
import React, { useState } from "react";
import CopyButton from "../../../components/CopyButton";

export default function AdSoyadAyirici() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ firstName: string; lastName: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"split" | "surnameOnly">("split");
  const [outputFormat, setOutputFormat] = useState<"table" | "excel">("table");

  function splitNames() {
    // Split by new lines, trim whitespace, ignore empty lines
    const lines = input
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const output = lines.map((line) => {
      const parts = line.split(/\s+/).filter(Boolean);

      // Her satır için: son kelime soyad, önceki tüm kelimeler ad
      if (parts.length === 0) {
        return { firstName: "", lastName: "" };
      }

      return {
        firstName: parts.slice(0, -1).join(" "),
        lastName: parts[parts.length - 1],
      };
    });

    setResult(output);
    setCopied(false);
  }

  function handleCopy() {
    if (!result.length) return;

    let text = "";

    if (mode === "split") {
      if (outputFormat === "excel") {
        text =
          "Ad;Soyad\n" +
          result
            .map((row) => `${row.firstName};${row.lastName}`)
            .join("\n");
      } else {
        text =
          "Ad\tSoyad\n" +
          result
            .map((row) => `${row.firstName}\t${row.lastName}`)
            .join("\n");
      }
    } else {
      text = result
        .map((row) => row.lastName || row.firstName)
        .filter(Boolean)
        .join("\n");
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-3 py-10 sm:px-4 sm:py-12">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900/90 backdrop-blur border border-slate-800 shadow-xl shadow-emerald-900/30 p-6 sm:p-8 flex flex-col gap-7">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-300 tracking-tight mb-1">
            Ad Soyad Ayırıcı
          </h1>
          <p className="text-slate-400 text-sm sm:text-[0.9rem]">
            Tam ad listesindeki ad ve soyad bilgilerini otomatik ayırın veya sadece soyadları çıkarın.
            Her satıra bir kişi yazın.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Mod Seçimi
            </span>
            <div className="inline-flex rounded-full bg-slate-800/80 border border-slate-700 p-1 gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setMode("split")}
                className={`flex-1 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                  mode === "split"
                    ? "bg-emerald-400 text-slate-950 shadow shadow-emerald-500/30"
                    : "text-slate-300 hover:text-emerald-300"
                }`}
              >
                Ad + Soyad Ayır
              </button>
              <button
                type="button"
                onClick={() => setMode("surnameOnly")}
                className={`flex-1 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                  mode === "surnameOnly"
                    ? "bg-emerald-400 text-slate-950 shadow shadow-emerald-500/30"
                    : "text-slate-300 hover:text-emerald-300"
                }`}
              >
                Sadece Soyadı Çıkar
              </button>
            </div>
          </div>

          {mode === "split" && (
            <div className="flex flex-col gap-1.5 mt-2 sm:mt-0">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Çıktı Formatı
              </span>
              <div className="inline-flex rounded-full bg-slate-800/80 border border-slate-700 p-1 gap-1 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setOutputFormat("table")}
                  className={`flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
                    outputFormat === "table"
                      ? "bg-slate-900 text-emerald-300 shadow-inner shadow-slate-900/80"
                      : "text-slate-300 hover:text-emerald-300"
                  }`}
                >
                  Tablo
                </button>
                <button
                  type="button"
                  onClick={() => setOutputFormat("excel")}
                  className={`flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
                    outputFormat === "excel"
                      ? "bg-slate-900 text-emerald-300 shadow-inner shadow-slate-900/80"
                      : "text-slate-300 hover:text-emerald-300"
                  }`}
                >
                  Excel (Ad;Soyad)
                </button>
              </div>
            </div>
          )}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          placeholder={`Örn:\nMELİHA ELVİN GÜZEL YILDIRIM\nAHMET MEHMET DEMİR`}
          className="w-full rounded-xl bg-slate-900/80 text-slate-50 border border-slate-700 focus:border-emerald-400 focus:ring-emerald-400/60 focus:ring-2 outline-none p-4 text-sm resize-y transition placeholder:text-slate-500"
        />
        <div className="flex flex-col gap-3 sm:flex-row items-stretch">
          <button
            onClick={splitNames}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            Ayır
          </button>
          <CopyButton
            onClick={handleCopy}
            disabled={!result.length}
            copied={copied}
            label="Tüm Sonuçları Kopyala"
            copiedLabel="Kopyalandı"
          />
        </div>
        {result.length > 0 && (
          <div className="mt-3 space-y-2">
            {mode === "split" && outputFormat === "table" && (
              <div className="overflow-x-auto rounded-lg border border-slate-800/80 bg-slate-950/70 shadow-inner">
                <table className="w-full text-left min-w-[270px]">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-emerald-400 bg-slate-900/70 border-b border-slate-800">
                      <th className="py-2 px-3">Ad</th>
                      <th className="py-2 px-3">Soyad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.map((row, i) => (
                      <tr
                        key={i}
                        className={
                          i % 2 === 0
                            ? "bg-slate-900/70"
                            : "bg-slate-800/60"
                        }
                      >
                        <td className="py-2 px-3 text-sm text-slate-100">{row.firstName}</td>
                        <td className="py-2 px-3 text-sm text-emerald-200">{row.lastName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {mode === "split" && outputFormat === "excel" && (
              <div className="rounded-lg border border-slate-800/80 bg-slate-950/70 shadow-inner p-3">
                <div className="text-xs font-medium text-slate-400 mb-2">
                  Excel formatında çıktı (Ad;Soyad):
                </div>
                <pre className="text-xs sm:text-sm text-slate-100 font-mono whitespace-pre-wrap">
                  {"Ad;Soyad\n"}
                  {result
                    .map((row) => `${row.firstName};${row.lastName}`)
                    .join("\n")}
                </pre>
              </div>
            )}

            {mode === "surnameOnly" && (
              <div className="rounded-xl border border-emerald-500/40 bg-slate-900 shadow-lg shadow-emerald-900/40 p-4 sm:p-5">
                <div className="text-xs sm:text-sm font-semibold text-emerald-300 mb-3">
                  Sadece soyad listesi:
                </div>
                <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {result.map((row, index) => {
                    const surname = row.lastName || row.firstName;
                    return (
                      <li
                        key={index}
                        className="text-base sm:text-[1.05rem] text-emerald-300 bg-slate-950/90 rounded-lg px-3 py-2.5 border border-slate-800/80"
                      >
                        {surname}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
        <div className="text-xs text-slate-500 mt-1">
          Ofis Akademi · Excel & Veri Analizi
        </div>
      </div>
    </div>
  );
}