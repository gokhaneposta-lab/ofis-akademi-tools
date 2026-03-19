"use client";

import React from "react";
import Link from "next/link";
import { THEME } from "@/lib/theme";

type Props = {
  steps: string[];
  excelAlternatif?: React.ReactNode;
  showEnhancedSections?: boolean;
};

export default function NasilKullanilir({ steps, excelAlternatif, showEnhancedSections = true }: Props) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: THEME.gridLine }}>
      {showEnhancedSections && (
        <div className="mb-4 rounded-lg border p-3" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
          <h3 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h3>
          <p className="mt-1.5 text-sm text-gray-700">
            Bu araç, tekrar eden manuel adımları hızlandırmak için tasarlandı. Veriyi yapıştırıp sonucu tek tıkla alabilir, Excel&apos;e geri yapıştırarak iş akışını kesmeden devam edebilirsiniz.
          </p>
        </div>
      )}
      <h2 className="text-sm font-semibold text-gray-800 mb-2">Nasıl kullanılır</h2>
      <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-700 mb-4">
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      {excelAlternatif != null && (
        <details className="group">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
            Excel&apos;de formülle / kendim yapmak istersem
          </summary>
          <div className="mt-2 pl-4 text-sm text-gray-600 border-l-2 pl-3" style={{ borderColor: THEME.ribbon }}>
            {excelAlternatif}
          </div>
        </details>
      )}
      {showEnhancedSections && (
        <div className="mt-4 rounded-lg border p-3" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
          <h3 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h3>
          <div className="mt-2 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold text-gray-900">Verilerim kaydediliyor mu?</span>
              <br />
              Hayır. Araçlar tarayıcı içinde çalışır; verileriniz saklanmaz.
            </p>
            <p>
              <span className="font-semibold text-gray-900">Toplu liste ile çalışabilir miyim?</span>
              <br />
              Evet. Her satıra bir değer olacak şekilde çok satırlı veriyle işlem yapabilirsiniz.
            </p>
            <p>
              <span className="font-semibold text-gray-900">Sonucu Excel&apos;e nasıl aktarırım?</span>
              <br />
              Sonucu kopyalayıp Excel&apos;de ilgili hücreye Ctrl+V yapıştırmanız yeterli.
            </p>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Daha fazla öğrenmek için{" "}
            <Link href="/egitimler" className="underline" style={{ color: THEME.ribbon }}>
              eğitim içeriklerine
            </Link>
            {" "}ve{" "}
            <Link href="/blog" className="underline" style={{ color: THEME.ribbon }}>
              blog rehberlerine
            </Link>
            {" "}bakabilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}
