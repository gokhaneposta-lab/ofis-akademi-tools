"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import ToolLayout from "@/components/ToolLayout";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

/** Her dosyanın ilk sayfasından satırları alıp alt alta ekler; ilk dosyanın ilk satırı başlık olarak kullanılır */
function sheetToRows(sheet: XLSX.WorkSheet): unknown[][] {
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as unknown[][];
}

export default function ExcelDosyaBirlestiriciPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setFiles(list);
    setStatus("idle");
    setErrorMsg("");
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const list = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    setFiles(list);
    setStatus("idle");
    setErrorMsg("");
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) setDragActive(false);
  }

  async function handleMerge() {
    if (files.length === 0) {
      setErrorMsg("En az bir Excel dosyası seçin.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    try {
      let headerRow: unknown[] = [];
      const allDataRows: unknown[][] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ab = await file.arrayBuffer();
        const book = XLSX.read(ab, { type: "array" });
        const firstSheetName = book.SheetNames[0];
        if (!firstSheetName) continue;
        const sheet = book.Sheets[firstSheetName];
        if (!sheet) continue;

        const rows = sheetToRows(sheet);
        if (rows.length === 0) continue;

        if (i === 0) {
          headerRow = rows[0];
          for (let r = 1; r < rows.length; r++) allDataRows.push(rows[r]);
        } else {
          for (let r = 1; r < rows.length; r++) allDataRows.push(rows[r]);
        }
      }

      if (headerRow.length === 0 && allDataRows.length === 0) {
        setErrorMsg("Hiçbir veri okunamadı.");
        setStatus("error");
        return;
      }

      const combined = [headerRow, ...allDataRows];
      const ws = XLSX.utils.aoa_to_sheet(combined);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Birleşik");
      XLSX.writeFile(wb, "Birlestirilmis.xlsx");
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Dosyalar birleştirilirken hata oluştu.");
      setStatus("error");
    }
  }

  function clearFiles() {
    setFiles([]);
    setStatus("idle");
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Aynı kolon yapısına sahip birden fazla Excel dosyasını tarayıcıda birleştirir. Hepsinin verilerini alt alta ekler ve tek bir{" "}
        <span className="font-semibold">Birlestirilmiş Excel</span> dosyası indirmenizi sağlar.
      </p>
      <div className="mt-4 space-y-2 text-sm text-gray-700">
        <p>
          Excel&apos;de aynı kolon yapısına sahip dosyaları alt alta birleştirmek için <strong>Power Query</strong> kullanabilirsiniz: <strong>Veri</strong> → <strong>Verileri Al ve Dönüştür</strong> → <strong>Dosyadan</strong> → <strong>Klasörden</strong> ile klasördeki dosyaları seçip &quot;Birleştir ve Yükle&quot; ile tek tabloda toplayabilirsiniz.
        </p>
        <p>Bu araç da aynı işlemi tarayıcıda yapar: aynı yapıdaki Excel dosyalarını alt alta ekleyerek tek Excel çıktısı oluşturur.</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="text-gray-700">
            <span className="font-mono">dosya-1.xlsx</span> + <span className="font-mono">dosya-2.xlsx</span> (aynı başlık/kalan kolonlar).
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">
            Başlık tek kez kullanılarak satırlar alt alta birleşir ve <span className="font-mono">Birlestirilmis.xlsx</span> indirilir.
          </p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="Excel Dosya Birleştirici"
      description="Birden fazla Excel dosyasını tek dosyada birleştirir. Aynı kolon yapısına sahip dosyaları alt alta ekleyerek tek Excel çıktısı oluşturur."
      path="/excel-araclari/excel-dosya-birlestirici"
      howToSteps={[
        "Aynı kolon yapısına sahip Excel dosyalarınızı (.xlsx, .xls) seçin (her dosyanın ilk satırı başlık olmalı).",
        "Birleştir ve İndir butonuna tıklayın.",
        "Tüm dosyaların verileri alt alta eklenerek tek bir sayfada birleştirilir; ilk dosyanın başlık satırı kullanılır, diğer dosyaların başlıkları atlanır. 'Birlestirilmis.xlsx' indirilir.",
        "Veriler yalnızca tarayıcınızda işlenir, sunucuya gönderilmez.",
      ]}
      faq={[
        {
          question: "Dosyalar aynı olmak zorunda mı?",
          answer:
            "Evet. İlk satır başlıkları ve kolon yapısı benzer/aynı olmalıdır; aksi durumda birleştirme yanlış hizalanabilir.",
        },
        {
          question: "Dosya adları ne oluyor?",
          answer: "İndirme adı sabit: Birlestirilmis.xlsx.",
        },
        {
          question: "Veriler sunucuya gider mi?",
          answer: "Hayır. İşlem tarayıcı içinde yapılır.",
        },
      ]}
      aboutContent={aboutContent}
      relatedLinks={
        <span className="text-gray-600">
          Power Query alternatifleri için{" "}
          <Link
            href="/blog/excel-dosya-birlestirme"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            dosya birleştirme rehberini
          </Link>{" "}
          inceleyebilirsiniz.
        </span>
      }
      keywords={["excel dosyaları birleştir", "alt alta ekle", "tek excel yap", "aynı kolon yapısı excel"]}
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <div>
            <label htmlFor="excel-merge-files" className="block text-sm font-semibold text-gray-900">
              Excel dosyaları (.xlsx, .xls)
            </label>
            <p className="mt-0.5 text-xs text-gray-500">Birden fazla dosya seçebilir veya sürükleyip bırakabilirsiniz.</p>

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onClick={() => inputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors sm:py-10 ${
                dragActive ? "bg-emerald-50/60" : "bg-gray-50/50 hover:bg-gray-50"
              }`}
              style={{
                borderColor: dragActive ? ACCENT : "#e5e7eb",
              }}
            >
              <input
                id="excel-merge-files"
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                multiple
                onChange={onFileChange}
                className="sr-only"
                aria-label="Excel dosyaları seç"
              />
              <svg
                className="mb-3 h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <p className="text-sm font-medium text-gray-800">Dosyaları buraya sürükleyin</p>
              <p className="mt-1 text-xs text-gray-500">veya tıklayarak seçin</p>
            </div>

            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">{files.length} dosya seçildi</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFiles();
                  }}
                  className="text-xs font-medium text-gray-500 underline underline-offset-2 transition hover:text-gray-800"
                >
                  Temizle
                </button>
              </div>
            )}
          </div>

          <PrimaryButton
            className="mt-4 sm:mt-5"
            onClick={handleMerge}
            disabled={files.length === 0 || status === "loading"}
          >
            {status === "loading" ? "Birleştiriliyor…" : "Birleştir ve İndir"}
          </PrimaryButton>

          {errorMsg && <p className="mt-3 text-sm text-red-600">{errorMsg}</p>}
          {status === "done" && <p className="mt-3 text-sm text-emerald-700">Birleştirilmiş dosya indirildi.</p>}
        </div>
      </div>
    </ToolLayout>
  );
}
