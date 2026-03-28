"use client";

import { useState } from "react";

function fmt(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function HasarPrimCalculator() {
  const [brutPrim, setBrutPrim] = useState("");
  const [brutHasar, setBrutHasar] = useState("");
  const [reasPrim, setReasPrim] = useState("");
  const [reasHasar, setReasHasar] = useState("");

  const bp = parseFloat(brutPrim.replace(/\./g, "").replace(",", ".")) || 0;
  const bh = parseFloat(brutHasar.replace(/\./g, "").replace(",", ".")) || 0;
  const rp = parseFloat(reasPrim.replace(/\./g, "").replace(",", ".")) || 0;
  const rh = parseFloat(reasHasar.replace(/\./g, "").replace(",", ".")) || 0;

  const netPrim = bp - rp;
  const netHasar = bh - rh;
  const brutHP = bp > 0 ? (bh / bp) * 100 : 0;
  const netHP = netPrim > 0 ? (netHasar / netPrim) * 100 : 0;
  const hasResult = bp > 0 && bh >= 0;

  function getColor(ratio: number) {
    if (ratio > 100) return "text-red-700 bg-red-50 border-red-200";
    if (ratio > 85) return "text-orange-700 bg-orange-50 border-orange-200";
    if (ratio > 70) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-emerald-700 bg-emerald-50 border-emerald-200";
  }

  function getLabel(ratio: number) {
    if (ratio > 100) return "Zarar";
    if (ratio > 85) return "Riskli";
    if (ratio > 70) return "Dikkat";
    if (ratio > 50) return "Sağlıklı";
    return "Çok İyi";
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-sm">🧮</span>
        H/P Oranı Hesaplayıcı
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Brüt Yazılan Prim (₺)</label>
          <input
            type="text"
            inputMode="decimal"
            value={brutPrim}
            onChange={(e) => setBrutPrim(e.target.value)}
            placeholder="10.000.000"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Toplam Hasar (₺)</label>
          <input
            type="text"
            inputMode="decimal"
            value={brutHasar}
            onChange={(e) => setBrutHasar(e.target.value)}
            placeholder="7.500.000"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Reasürans Prim Payı (₺)</label>
          <input
            type="text"
            inputMode="decimal"
            value={reasPrim}
            onChange={(e) => setReasPrim(e.target.value)}
            placeholder="2.000.000"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Reasürans Hasar Payı (₺)</label>
          <input
            type="text"
            inputMode="decimal"
            value={reasHasar}
            onChange={(e) => setReasHasar(e.target.value)}
            placeholder="3.000.000"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {hasResult && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`rounded-xl border p-4 ${getColor(brutHP)}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-1">Brüt H/P Oranı</p>
              <p className="text-2xl font-bold">%{fmt(brutHP)}</p>
              <p className="text-xs mt-1 opacity-80">{getLabel(brutHP)}</p>
            </div>
            <div className={`rounded-xl border p-4 ${getColor(netHP)}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-1">Net H/P Oranı</p>
              <p className="text-2xl font-bold">%{fmt(netHP)}</p>
              <p className="text-xs mt-1 opacity-80">{getLabel(netHP)}</p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-xs text-gray-600 space-y-1">
            <p><strong>Net Prim:</strong> {fmt(netPrim)} ₺ (Brüt Prim − Reasürans Prim Payı)</p>
            <p><strong>Net Hasar:</strong> {fmt(netHasar)} ₺ (Toplam Hasar − Reasürans Hasar Payı)</p>
            {brutHP > 0 && netHP > 0 && (
              <p className="mt-1.5 pt-1.5 border-t border-gray-200">
                <strong>Reasürans Etkisi:</strong> Brüt H/P ile Net H/P arasındaki fark{" "}
                <strong>{fmt(Math.abs(brutHP - netHP))} puan</strong> — reasürans,
                hasar yükünü {brutHP > netHP ? "azaltıyor" : "artırmıyor"}.
              </p>
            )}
          </div>
        </div>
      )}

      {!hasResult && (
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center text-xs text-gray-400">
          Değerleri girin, Brüt ve Net H/P oranları otomatik hesaplanacak.
        </div>
      )}
    </div>
  );
}
