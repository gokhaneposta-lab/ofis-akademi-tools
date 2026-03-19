"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import PageRibbon from "@/components/PageRibbon";
import JsonLdTool from "@/components/JsonLd";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

/** Her dosyanın ilk sayfasından satırları alıp alt alta ekler; ilk dosyanın ilk satırı başlık olarak kullanılır */
function sheetToRows(sheet: XLSX.WorkSheet): unknown[][] {
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as unknown[][];
}

export default function ExcelDosyaBirlestiriciPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setFiles(list);
    setStatus("idle");
    setErrorMsg("");
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

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <JsonLdTool
        name="Excel Dosya Birleştirici — Ücretsiz Excel Birleştirme Aracı"
        description="Excel dosyaları birleştir: aynı kolon yapısına sahip dosyaları alt alta ekleyerek tek Excel çıktısı oluşturur. Ücretsiz, tarayıcıda çalışır."
        path="/excel-araclari/excel-dosya-birlestirici"
        keywords={["excel dosyaları birleştir", "alt alta ekle", "tek excel yap", "aynı kolon yapısı excel"]}
      />
      <PageRibbon
        title="Excel Dosya Birleştirici"
        description="Birden fazla Excel dosyasını tek dosyada birleştirir. Aynı kolon yapısına sahip dosyaları alt alta ekleyerek tek Excel çıktısı oluşturur."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={[
            "Aynı kolon yapısına sahip Excel dosyalarınızı (.xlsx, .xls) seçin (her dosyanın ilk satırı başlık olmalı).",
            "Birleştir ve İndir butonuna tıklayın.",
            "Tüm dosyaların verileri alt alta eklenerek tek bir sayfada birleştirilir; ilk dosyanın başlık satırı kullanılır, diğer dosyaların başlıkları atlanır. 'Birlestirilmis.xlsx' indirilir.",
            "Veriler yalnızca tarayıcınızda işlenir, sunucuya gönderilmez.",
          ]}
          excelAlternatif={
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                Excel&apos;de aynı kolon yapısına sahip dosyaları alt alta birleştirmek için <strong>Power Query</strong> kullanabilirsiniz: <strong>Veri</strong> → <strong>Verileri Al ve Dönüştür</strong> → <strong>Dosyadan</strong> → <strong>Klasörden</strong> ile klasördeki dosyaları seçip &quot;Birleştir ve Yükle&quot; ile tek tabloda toplayabilirsiniz.
              </p>
              <p>
                Bu araç da aynı işlemi tarayıcıda yapar: aynı yapıdaki Excel dosyalarını alt alta ekleyerek tek Excel çıktısı oluşturur.
              </p>
            </div>
          }
        />

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            Aynı kolon yapısına sahip birden fazla Excel dosyasını tarayıcıda birleştirir. Hepsinin verilerini alt alta ekler ve tek bir <span className="font-semibold">Birlestirilmiş Excel</span> dosyası indirmenizi sağlar.
          </p>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Örnek girdi / çıktı</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Girdi:</span> <span className="font-mono">dosya-1.xlsx</span> + <span className="font-mono">dosya-2.xlsx</span> (aynı başlık/kalan kolonlar).
            </p>
            <p>
              <span className="font-semibold">Çıktı:</span> başlık tek kez kullanılarak satırlar alt alta birleşir ve <span className="font-mono">Birlestirilmis.xlsx</span> indir.
            </p>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Dosyalar aynı olmak zorunda mı?</span>
              <br />
              Evet. İlk satır başlıkları ve kolon yapısı benzer/aynı olmalıdır; aksi durumda birleştirme yanlış hizalanabilir.
            </p>
            <p>
              <span className="font-semibold">Dosya adları ne oluyor?</span>
              <br />
              İndirme adı sabit: <span className="font-mono">Birlestirilmis.xlsx</span>.
            </p>
            <p>
              <span className="font-semibold">Veriler sunucuya gider mi?</span>
              <br />
              Hayır. İşlem tarayıcı içinde yapılır.
            </p>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            Power Query alternatifleri için{" "}
            <Link
              href="/blog/excel-dosya-birlestirme"
              className="underline"
              style={{ color: THEME.ribbon }}
            >
              dosya birleştirme rehberini
            </Link>{" "}
            inceleyebilirsin.
          </p>
        </section>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Excel dosyaları (.xlsx, .xls)</label>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            multiple
            onChange={onFileChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:cursor-pointer"
          />
          {files.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">{files.length} dosya seçildi</span>
              <button
                type="button"
                onClick={clearFiles}
                className="text-xs text-gray-500 underline hover:text-gray-700"
              >
                Temizle
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleMerge}
            disabled={files.length === 0 || status === "loading"}
            className="px-4 py-2 text-sm font-semibold rounded text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: THEME.ribbon }}
          >
            {status === "loading" ? "Birleştiriliyor…" : "Birleştir ve İndir"}
          </button>
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}
        {status === "done" && (
          <p className="text-sm text-green-700">Birleştirilmiş dosya indirildi.</p>
        )}
      </div>

      <BenzerExcelAraclari currentHref="/excel-araclari/excel-dosya-birlestirici" />
    </div>
  );
}
