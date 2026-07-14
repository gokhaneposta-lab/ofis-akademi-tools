"use client";

import { useCallback, useEffect, useState } from "react";
import type { HasarBacktestSonuc } from "@/lib/butce/oran/hasarBacktest";

const pct = (n: number | null) => {
  if (n == null || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("tr-TR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(n);
};

const tl = (n: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);

export default function BacktestPanel() {
  const [yil, setYil] = useState(2025);
  const [sonuc, setSonuc] = useState<HasarBacktestSonuc | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async (testYili: number) => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/butce/backtest?yil=${testYili}&kalem=0211`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSonuc(null);
        setErr(data.error ?? "Backtest yüklenemedi");
        return;
      }
      setSonuc(data as HasarBacktestSonuc);
      if (data.uyari) setErr(data.uyari);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Bağlantı hatası");
      setSonuc(null);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load(yil);
  }, [yil, load]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-950">
        <strong>Hafif backtest (0211 brüt ödenen hasar oranı):</strong> Seçilen yılın{" "}
        <em>öncesindeki</em> MIZAN yıllarıyla üretilen model oranı, o yılın gerçekleşen hasar
        bazına uygulanır. Sapma = (model − gerçekleşen) / |gerçekleşen|. Veri yoksa uydurma
        rakam üretilmez.
      </section>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="text-slate-600">Test yılı</span>
          <select
            value={yil}
            onChange={(e) => setYil(Number(e.target.value))}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {[2025, 2024, 2023].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => load(yil)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {busy ? "Hesaplanıyor…" : "Yenile"}
        </button>
      </div>

      {err && <p className="text-sm text-amber-800">{err}</p>}

      {sonuc && !sonuc.uyari && (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-xs text-slate-500">Model yılları</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {sonuc.modelYillari.join(", ") || "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-xs text-slate-500">Gerçek hasar</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900">
                {tl(sonuc.ozet.gercekHasarToplam)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-xs text-slate-500">Model hasar</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900">
                {tl(sonuc.ozet.modelHasarToplam)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-xs text-slate-500">Toplam sapma</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900">
                {pct(sonuc.ozet.sapmaYuzde)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Branş</th>
                  <th className="px-3 py-2">Ad</th>
                  <th className="px-3 py-2 text-right">Model oran</th>
                  <th className="px-3 py-2 text-right">Gerçek oran</th>
                  <th className="px-3 py-2 text-right">Model hasar</th>
                  <th className="px-3 py-2 text-right">Gerçek hasar</th>
                  <th className="px-3 py-2 text-right">Sapma</th>
                </tr>
              </thead>
              <tbody>
                {sonuc.satirlar
                  .slice()
                  .sort((a, b) => Math.abs(b.gercekHasar) - Math.abs(a.gercekHasar))
                  .map((r) => (
                    <tr key={r.bransKodu} className="border-b border-slate-100">
                      <td className="px-3 py-1.5 font-mono text-xs">{r.bransKodu}</td>
                      <td className="max-w-[160px] truncate px-3 py-1.5" title={r.bransAdi}>
                        {r.bransAdi}
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{pct(r.modelOran)}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{pct(r.gercekOran)}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{tl(r.modelHasar)}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{tl(r.gercekHasar)}</td>
                      <td
                        className={`px-3 py-1.5 text-right font-medium tabular-nums ${
                          r.sapmaYuzde != null && Math.abs(r.sapmaYuzde) > 0.15
                            ? "text-amber-800"
                            : "text-slate-800"
                        }`}
                      >
                        {pct(r.sapmaYuzde)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
