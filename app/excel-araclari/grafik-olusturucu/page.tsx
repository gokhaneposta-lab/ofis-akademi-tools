"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";
import GrafikOnizleme from "@/components/excel/GrafikOnizleme";
import {
  type ChartPoint,
  type ChartType,
  parseLabelValuesSkipHeader,
} from "@/lib/chartData";

const ACCENT = "#217346";

const SAMPLE = `Ürün\tSatış
A\t120
B\t85
C\t140
D\t95`;

export default function GrafikOlusturucuPage() {
  const [input, setInput] = useState(SAMPLE);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [chartTitle, setChartTitle] = useState("Satış Grafiği");
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [error, setError] = useState("");
  const chartRef = useRef<HTMLDivElement>(null);

  const howToSteps = [
    "Excel'de etiket ve değer sütunlarını seçip kopyalayın (Ctrl+C).",
    "Aşağıdaki kutuya yapıştırın; grafik türünü ve başlığı seçin.",
    "Grafik Oluştur'a tıklayın; PNG indirin veya veriyi XLSX olarak kaydedin.",
  ];

  const faq = [
    {
      question: "Excel'deki grafiği bu araçla aynı mı?",
      answer:
        "Hayır. Bu araç hızlı önizleme ve PNG/XLSX çıktısı verir. Excel'de tam biçimlendirilmiş grafik için veriyi XLSX'e aktarıp Ekle → Grafik kullanın.",
    },
    {
      question: "Kaç satır veri desteklenir?",
      answer: "MVP sürümünde 30 satıra kadar rahat okunur. Daha fazla satırda etiketler sıkışabilir.",
    },
    {
      question: "Veriler sunucuya gönderilir mi?",
      answer: "Hayır. Tüm işlem tarayıcınızda yapılır.",
    },
  ];

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Excel&apos;den iki sütunluk veriyi (kategori + sayı) yapıştırarak çubuk, çizgi veya pasta grafik
        önizlemesi oluşturur. Sunum veya hızlı kontrol için PNG indirebilir; Excel&apos;de grafik oluşturmak
        üzere veriyi XLSX olarak kaydedebilirsiniz.
      </p>
      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs text-gray-700">
        <p className="mb-1 font-semibold text-gray-800">Örnek veri</p>
        <pre className="font-mono whitespace-pre-wrap">{SAMPLE}</pre>
      </div>
    </>
  );

  function handleOlustur() {
    const parsed = parseLabelValuesSkipHeader(input);
    if (parsed.length === 0) {
      setPoints([]);
      setError("Geçerli veri bulunamadı. İki sütun (etiket + sayı) yapıştırın.");
      return;
    }
    if (parsed.length > 30) {
      setError("30 satırdan fazla veri girdiniz; ilk 30 satır kullanıldı.");
      setPoints(parsed.slice(0, 30));
      return;
    }
    setError("");
    setPoints(parsed);
  }

  async function handlePng() {
    const el = chartRef.current;
    if (!el || points.length === 0) return;
    try {
      const { default: h2c } = await import("html2canvas");
      const canvas = await h2c(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "grafik.png";
      a.click();
    } catch (e) {
      console.error(e);
      setError("PNG indirilemedi. Tarayıcıyı yenileyip tekrar deneyin.");
    }
  }

  function handleXlsx() {
    const rows = points.length > 0 ? points : parseLabelValuesSkipHeader(input);
    if (rows.length === 0) return;
    const data = [["Etiket", "Değer"], ...rows.map((p) => [p.label, p.value])];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Veri");
    XLSX.writeFile(wb, "grafik-verisi.xlsx");
  }

  return (
    <ToolLayout
      title="Excel Grafik Oluşturucu"
      description="Excel verisini yapıştırın; çubuk, çizgi veya pasta grafik önizleyin. PNG veya XLSX indirin."
      path="/excel-araclari/grafik-olusturucu"
      keywords={[
        "excel grafik oluşturma",
        "excel grafik",
        "grafik oluşturucu",
        "pasta grafik",
        "çubuk grafik",
        "çizgi grafik excel",
      ]}
      howToSteps={howToSteps}
      faq={faq}
      aboutContent={aboutContent}
      relatedLinks={
        <Link
          href="/blog/excel-grafik-olusturma-rehberi"
          className="font-medium underline underline-offset-2"
          style={{ color: ACCENT }}
        >
          Excel grafik oluşturma rehberi
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label htmlFor="grafik-input" className="block text-sm font-semibold text-gray-900">
            Veriyi yapıştırın (etiket + değer)
          </label>
          <div className="mt-1.5">
            <InputTextarea
              id="grafik-input"
              value={input}
              onChange={setInput}
              rows={7}
              minHeight="11rem"
              className="font-mono resize-y"
              placeholder={"Kategori\tDeğer\nA\t120\nB\t85"}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div>
              <span className="mr-2 text-sm text-gray-600">Grafik türü:</span>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as ChartType)}
                className="h-10 rounded-xl border border-gray-200 bg-gray-50/80 px-3 text-sm text-gray-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/15"
              >
                <option value="bar">Çubuk</option>
                <option value="line">Çizgi</option>
                <option value="pie">Pasta</option>
              </select>
            </div>
            <div className="min-w-[12rem] flex-1">
              <label htmlFor="grafik-title" className="sr-only">
                Grafik başlığı
              </label>
              <input
                id="grafik-title"
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="Grafik başlığı"
                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 text-sm text-gray-900 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/15"
              />
            </div>
          </div>

          <PrimaryButton className="mt-4" onClick={handleOlustur}>
            Grafik oluştur
          </PrimaryButton>

          {error ? <p className="mt-3 text-sm text-amber-700">{error}</p> : null}
        </div>

        {points.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
            <div ref={chartRef} className="p-4 sm:p-6">
              <GrafikOnizleme points={points} type={chartType} title={chartTitle} />
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200 px-4 py-3">
              <button
                type="button"
                onClick={handlePng}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
              >
                PNG indir
              </button>
              <button
                type="button"
                onClick={handleXlsx}
                className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
                style={{ background: ACCENT }}
              >
                XLSX indir
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </ToolLayout>
  );
}
