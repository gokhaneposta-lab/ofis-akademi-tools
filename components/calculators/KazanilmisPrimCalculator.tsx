"use client";

import { useState } from "react";

function fmt(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function dateDiffDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

export default function KazanilmisPrimCalculator() {
  const [baslangic, setBaslangic] = useState("");
  const [bitis, setBitis] = useState("");
  const [hesapTarihi, setHesapTarihi] = useState("");
  const [prim, setPrim] = useState("");

  const primVal = parseFloat(prim.replace(/\./g, "").replace(",", ".")) || 0;

  const hasInput = baslangic && bitis && hesapTarihi && primVal > 0;
  let toplamVade = 0;
  let gecenGun = 0;
  let kazanilmis = 0;
  let kazanilmamis = 0;
  let yuzde = 0;

  if (hasInput) {
    toplamVade = dateDiffDays(baslangic, bitis);
    const rawGecen = dateDiffDays(baslangic, hesapTarihi);
    gecenGun = Math.max(0, Math.min(rawGecen, toplamVade));
    kazanilmis = toplamVade > 0 ? primVal * (gecenGun / toplamVade) : 0;
    kazanilmamis = primVal - kazanilmis;
    yuzde = toplamVade > 0 ? (gecenGun / toplamVade) * 100 : 0;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-sm">🧮</span>
        Kazanılmış Prim Hesaplayıcı
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Poliçe Başlangıç Tarihi</label>
          <input
            type="date"
            value={baslangic}
            onChange={(e) => setBaslangic(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Poliçe Bitiş Tarihi</label>
          <input
            type="date"
            value={bitis}
            onChange={(e) => setBitis(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Hesaplama Tarihi</label>
          <input
            type="date"
            value={hesapTarihi}
            onChange={(e) => setHesapTarihi(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Toplam Prim (₺)</label>
          <input
            type="text"
            inputMode="decimal"
            value={prim}
            onChange={(e) => setPrim(e.target.value)}
            placeholder="12.000"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {hasInput && toplamVade > 0 ? (
        <div className="space-y-3">
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-medium text-gray-500 mb-1">
              <span>Poliçe İlerlemesi</span>
              <span>{gecenGun} / {toplamVade} gün (%{fmt(yuzde)})</span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(yuzde, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mb-1">Kazanılmış Prim</p>
              <p className="text-2xl font-bold text-emerald-800">{fmt(kazanilmis)} ₺</p>
              <p className="text-xs text-emerald-600 mt-1">Gelir olarak yazılabilir</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 mb-1">Kazanılmamış Prim</p>
              <p className="text-2xl font-bold text-amber-800">{fmt(kazanilmamis)} ₺</p>
              <p className="text-xs text-amber-600 mt-1">Bilançoda karşılık olarak tutulur</p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-xs text-gray-600 space-y-1">
            <p><strong>Toplam Vade:</strong> {toplamVade} gün</p>
            <p><strong>Geçen Gün:</strong> {gecenGun} gün</p>
            <p><strong>Hesaplama:</strong> {fmt(primVal)} × ({gecenGun} / {toplamVade}) = {fmt(kazanilmis)} ₺</p>
            {gecenGun >= toplamVade && (
              <p className="mt-1.5 pt-1.5 border-t border-gray-200 text-emerald-700 font-medium">
                Poliçe süresi dolmuş — primin tamamı kazanılmıştır.
              </p>
            )}
          </div>
        </div>
      ) : hasInput && toplamVade <= 0 ? (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center text-xs text-red-600">
          Bitiş tarihi başlangıç tarihinden sonra olmalıdır.
        </div>
      ) : (
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center text-xs text-gray-400">
          Tarihleri ve primi girin, kazanılmış prim otomatik hesaplanacak.
        </div>
      )}
    </div>
  );
}
