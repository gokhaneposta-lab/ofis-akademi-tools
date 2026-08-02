"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";
import { detectSeparator } from "@/lib/excelToolHelpers";

const ACCENT = "#217346";

type Issue = { line: number; message: string };

type Report = {
  separator: string;
  sepLabel: string;
  headerCols: number;
  dataRows: number;
  emptyRows: number;
  issues: Issue[];
};

function sepLabel(sep: string): string {
  if (sep === "\t") return "Sekme (Tab)";
  if (sep === ",") return "Virgül";
  if (sep === ";") return "Noktalı virgül";
  if (sep === "|") return "Pipe (|)";
  return "Bilinmiyor";
}

function splitCsvLine(line: string, sep: string): string[] {
  if (sep !== ",") return line.split(sep);
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === sep && !inQuotes) {
      cells.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  cells.push(cur);
  return cells;
}

export default function CsvDogrulaPage() {
  const [input, setInput] = useState("");
  const [report, setReport] = useState<Report | null>(null);

  function handleValidate() {
    const rawLines = input.split(/\r?\n/);
    const nonEmptyIdx = rawLines
      .map((l, i) => ({ l, i }))
      .filter(({ l }) => l.trim().length > 0);
    if (nonEmptyIdx.length === 0) {
      setReport(null);
      return;
    }

    const first = nonEmptyIdx[0].l;
    const sep = detectSeparator(first);
    const headerCols = splitCsvLine(first, sep).length;
    const issues: Issue[] = [];
    let emptyRows = 0;
    let dataRows = 0;

    rawLines.forEach((line, idx) => {
      const lineNo = idx + 1;
      if (!line.trim()) {
        emptyRows += 1;
        return;
      }
      if (idx === nonEmptyIdx[0].i) return;
      dataRows += 1;
      const cells = splitCsvLine(line, sep);
      if (cells.length !== headerCols) {
        issues.push({
          line: lineNo,
          message: `${cells.length} sütun (beklenen ${headerCols})`,
        });
      }
      if (sep === "," && (line.match(/"/g)?.length ?? 0) % 2 === 1) {
        issues.push({ line: lineNo, message: "Kapanmamış tırnak" });
      }
    });

    setReport({
      separator: sep,
      sepLabel: sepLabel(sep),
      headerCols,
      dataRows,
      emptyRows,
      issues: issues.slice(0, 50),
    });
  }

  return (
    <ToolLayout
      title="CSV Validator"
      description="CSV metnini kontrol eder: ayırıcı, sütun tutarlılığı, boş satır ve tırnak hataları."
      path="/excel-araclari/csv-dogrula"
      keywords={["csv validator", "csv kontrol", "csv hata", "csv doğrulama"]}
      howToSteps={[
        "CSV içeriğini yapıştırın (veya dosyadan kopyalayın).",
        "Doğrula’ya basın.",
        "Özet ve sorunlu satırları inceleyin; sonra CSV Ayırıcı ile sütunlara bölün.",
      ]}
      faq={[
        {
          question: "Ayırıcıyı nasıl buluyor?",
          answer: "İlk dolu satırda sekme, |, ; veya , arar.",
        },
        {
          question: "En fazla kaç hata listelenir?",
          answer: "İlk 50 tutarsızlık satırı gösterilir.",
        },
      ]}
      aboutContent={
        <p className="text-sm text-gray-700">
          Dış sistemden gelen CSV’yi Excel’e almadan önce kırık satırları yakalar. Ayırma işleminden önce kullanın.
        </p>
      }
      relatedLinks={
        <span className="text-gray-600">
          <Link href="/excel-araclari/csv-ayir" className="font-medium underline" style={{ color: ACCENT }}>
            CSV Ayırıcı
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label className="block text-sm font-semibold text-gray-900">CSV metni</label>
          <div className="mt-1.5">
            <InputTextarea
              value={input}
              onChange={setInput}
              rows={10}
              minHeight="12rem"
              className="font-mono text-sm"
              placeholder={"id,ad,sehir\n1,Ahmet,İstanbul\n2,Ayşe,Ankara"}
            />
          </div>
          <PrimaryButton className="mt-3" onClick={handleValidate}>
            Doğrula
          </PrimaryButton>

          {report ? (
            <div className="mt-4 space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4">
              <p className="text-sm font-semibold text-gray-900">Özet</p>
              <ul className="grid gap-1 text-sm text-gray-700 sm:grid-cols-2">
                <li>Ayırıcı: <strong>{report.sepLabel}</strong></li>
                <li>Sütun sayısı: <strong>{report.headerCols}</strong></li>
                <li>Veri satırı: <strong>{report.dataRows}</strong></li>
                <li>Boş satır: <strong>{report.emptyRows}</strong></li>
                <li className="sm:col-span-2">
                  Sorun:{" "}
                  <strong className={report.issues.length ? "text-rose-700" : "text-emerald-700"}>
                    {report.issues.length === 0 ? "Bulunamadı ✓" : `${report.issues.length} satır`}
                  </strong>
                </li>
              </ul>
              {report.issues.length > 0 ? (
                <div className="rounded-xl border border-rose-200 bg-white p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-rose-700">Sorunlu satırlar</p>
                  <ul className="mt-2 max-h-48 space-y-1 overflow-auto font-mono text-xs text-gray-800">
                    {report.issues.map((iss) => (
                      <li key={`${iss.line}-${iss.message}`}>
                        Satır {iss.line}: {iss.message}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </ToolLayout>
  );
}
