"use client";

import React, { useState } from "react";

const codeBox = "rounded bg-gray-100 border border-gray-200 px-3 py-2 text-sm font-mono text-gray-800";

type Props = {
  /** Örn. "Adı almak için:" */
  baslik?: string;
  /** Excel formülü; verilirse kutu + kopyala butonu gösterilir */
  formül?: string;
  /** Açıklama metni (birkaç cümle); "Açıklama:" etiketi ile gri kutu içinde */
  aciklama: string;
};

export default function ExcelFormulBlok({ baslik, formül, aciklama }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!formül) return;
    navigator.clipboard.writeText(formül);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mt-4 first:mt-0">
      {baslik != null && baslik !== "" && (
        <p className="text-sm font-medium text-gray-800 mb-1">{baslik}</p>
      )}
      {formül != null && formül !== "" && (
        <>
          <div className={`flex items-center justify-between gap-2 ${codeBox}`}>
            <code className="break-all">{formül}</code>
            <button
              type="button"
              onClick={handleCopy}
              className="flex-shrink-0 p-1.5 rounded hover:bg-gray-200 transition text-gray-500 hover:text-gray-700"
              title="Kopyala"
            >
              {copied ? (
                <span className="text-xs text-green-600 font-medium">✓</span>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
                  <rect x="3" y="3" width="13" height="13" rx="2" strokeWidth="2" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs font-medium text-gray-700 mt-2 mb-1">Açıklama:</p>
        </>
      )}
      <div className={`${codeBox} text-sm text-gray-600 leading-relaxed`}>
        {aciklama}
      </div>
    </div>
  );
}
