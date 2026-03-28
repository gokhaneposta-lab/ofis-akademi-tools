"use client";

import { useState } from "react";

function fmt(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function YenilemeOraniCalculator() {
  const [vadesiBiten, setVadesiBiten] = useState("");
  const [yenilenen, setYenilenen] = useState("");
  const [vadesiBitenPrim, setVadesiBitenPrim] = useState("");
  const [yenilenenPrim, setYenilenenPrim] = useState("");

  const vb = parseInt(vadesiBiten) || 0;
  const yn = parseInt(yenilenen) || 0;
  const vbp = parseFloat(vadesiBitenPrim.replace(/\./g, "").replace(",", ".")) || 0;
  const ynp = parseFloat(yenilenenPrim.replace(/\./g, "").replace(",", ".")) || 0;

  const adetOran = vb > 0 ? (yn / vb) * 100 : 0;
  const primOran = vbp > 0 ? (ynp / vbp) * 100 : 0;
  const kaybedilen = vb - yn;
  const hasAdet = vb > 0 && yn >= 0;
  const hasPrim = vbp > 0 && ynp >= 0;

  function getColor(ratio: number) {
    if (ratio >= 85) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (ratio >= 75) return "text-blue-700 bg-blue-50 border-blue-200";
    if (ratio >= 65) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-red-700 bg-red-50 border-red-200";
  }

  function getLabel(ratio: number) {
    if (ratio >= 85) return "Mükemmel";
    if (ratio >= 75) return "İyi";
    if (ratio >= 65) return "Orta";
    return "Kritik";
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-sm">🧮</span>
        Yenileme Oranı Hesaplayıcı
      </h3>

      <p className="text-xs text-gray-500 mb-4">Adet ve prim bazlı yenileme oranını aynı anda hesaplayın.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="sm:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Adet Bazlı</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Vadesi Biten Poliçe (adet)</label>
          <input
            type="number"
            inputMode="numeric"
            value={vadesiBiten}
            onChange={(e) => setVadesiBiten(e.target.value)}
            placeholder="450"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Yenilenen Poliçe (adet)</label>
          <input
            type="number"
            inputMode="numeric"
            value={yenilenen}
            onChange={(e) => setYenilenen(e.target.value)}
            placeholder="369"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div className="sm:col-span-2 mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Prim Bazlı (isteğe bağlı)</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Vadesi Biten Toplam Prim (₺)</label>
          <input
            type="text"
            inputMode="decimal"
            value={vadesiBitenPrim}
            onChange={(e) => setVadesiBitenPrim(e.target.value)}
            placeholder="2.250.000"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Yenilenen Toplam Prim (₺)</label>
          <input
            type="text"
            inputMode="decimal"
            value={yenilenenPrim}
            onChange={(e) => setYenilenenPrim(e.target.value)}
            placeholder="2.100.000"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>
      </div>

      {(hasAdet || hasPrim) ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hasAdet && (
              <div className={`rounded-xl border p-4 ${getColor(adetOran)}`}>
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-1">Adet Bazlı Yenileme</p>
                <p className="text-2xl font-bold">%{fmt(adetOran)}</p>
                <p className="text-xs mt-1 opacity-80">{getLabel(adetOran)}</p>
              </div>
            )}
            {hasPrim && (
              <div className={`rounded-xl border p-4 ${getColor(primOran)}`}>
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-1">Prim Bazlı Yenileme</p>
                <p className="text-2xl font-bold">%{fmt(primOran)}</p>
                <p className="text-xs mt-1 opacity-80">{getLabel(primOran)}</p>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-xs text-gray-600 space-y-1">
            {hasAdet && (
              <>
                <p><strong>Kaybedilen Poliçe:</strong> {kaybedilen} adet ({vb} vadesi biten − {yn} yenilenen)</p>
                <p><strong>Hesaplama:</strong> {yn} / {vb} × 100 = %{fmt(adetOran)}</p>
              </>
            )}
            {hasPrim && hasAdet && <div className="border-t border-gray-200 my-1.5" />}
            {hasPrim && (
              <p><strong>Prim Hesaplama:</strong> {fmt(ynp)} / {fmt(vbp)} × 100 = %{fmt(primOran)}</p>
            )}
            {hasAdet && hasPrim && Math.abs(primOran - adetOran) > 3 && (
              <p className="mt-1.5 pt-1.5 border-t border-gray-200">
                <strong>Not:</strong> Adet ve prim bazlı oranlar arasında{" "}
                <strong>{fmt(Math.abs(primOran - adetOran))} puan</strong> fark var.{" "}
                {primOran > adetOran
                  ? "Büyük primli poliçeler daha fazla yenileniyor — gelir sürdürülebilirliği açısından olumlu."
                  : "Büyük primli poliçeler daha çok kaybediliyor — gelir etkisi adet oranından daha olumsuz."}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center text-xs text-gray-400">
          Değerleri girin, yenileme oranları otomatik hesaplanacak.
        </div>
      )}
    </div>
  );
}
