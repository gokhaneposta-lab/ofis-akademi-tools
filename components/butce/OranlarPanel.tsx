"use client";

import { useCallback, useEffect, useState } from "react";
import type { BransOranSatir } from "@/lib/butce/types";

type Kalem = { kod: string; ad: string };

const pct = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export default function OranlarPanel() {
  const [kalemler, setKalemler] = useState<Kalem[]>([]);
  const [kalem, setKalem] = useState("");
  const [tablo, setTablo] = useState<BransOranSatir[]>([]);
  const [yillar, setYillar] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadKalemler = useCallback(async () => {
    const res = await fetch("/api/butce/oranlar");
    if (!res.ok) return;
    const data = await res.json();
    setKalemler(data.kalemler ?? []);
    setYillar(data.yillar ?? []);
    if (data.kalemler?.length && !kalem) {
      setKalem(data.kalemler[0].kod);
    }
  }, [kalem]);

  const loadTablo = useCallback(async (k: string, yeniden = false) => {
    if (!k) return;
    setBusy(true);
    setMsg(null);
    const q = new URLSearchParams({ kalem: k });
    if (yeniden) q.set("yeniden", "1");
    const res = await fetch(`/api/butce/oranlar?${q}`);
    setBusy(false);
    if (!res.ok) {
      setMsg("Tablo yüklenemedi");
      return;
    }
    const data = await res.json();
    setTablo(data.tablo ?? []);
    if (yeniden) setMsg("MIZAN'dan yeniden hesaplandı");
  }, []);

  useEffect(() => {
    loadKalemler();
  }, [loadKalemler]);

  useEffect(() => {
    if (kalem) loadTablo(kalem);
  }, [kalem, loadTablo]);

  async function kaydet() {
    if (!kalem || tablo.length === 0) return;
    setBusy(true);
    const ayarlar: Record<string, Record<string, { referans: string; oran: number; manuel: boolean }>> = {};
    const getRes = await fetch("/api/butce/oran-ayar");
    const existing = getRes.ok ? await getRes.json() : { ayarlar: {} };
    Object.assign(ayarlar, existing.ayarlar ?? {});
    ayarlar[kalem] = {};
    for (const row of tablo) {
      ayarlar[kalem][row.bransKodu] = {
        referans: row.referans,
        oran: row.oran,
        manuel: row.manuel,
      };
    }
    const res = await fetch("/api/butce/oran-ayar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ayarlar }),
    });
    setBusy(false);
    setMsg(res.ok ? "Oran ayarları kaydedildi" : "Kayıt başarısız");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="text-slate-600">Oran kalemi</span>
          <select
            value={kalem}
            onChange={(e) => setKalem(e.target.value)}
            className="mt-1 block min-w-[280px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {kalemler.map((k) => (
              <option key={k.kod} value={k.kod}>
                {k.kod} — {k.ad}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={busy || !kalem}
          onClick={() => loadTablo(kalem, true)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          MIZAN&apos;dan yeniden hesapla
        </button>
        <button
          type="button"
          disabled={busy || !kalem}
          onClick={kaydet}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Kaydet
        </button>
      </div>

      {yillar.length > 0 && (
        <p className="text-xs text-slate-500">
          MIZAN yılları: {yillar.join(", ")} (bütçe yılı hariç)
        </p>
      )}
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Branş</th>
              <th className="px-3 py-2">Ad</th>
              <th className="px-3 py-2">Ana branş</th>
              <th className="px-3 py-2">Referans</th>
              <th className="px-3 py-2 text-right">Oran</th>
            </tr>
          </thead>
          <tbody>
            {tablo.map((row) => (
              <tr key={row.bransKodu} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-3 py-1.5 font-mono text-xs">{row.bransKodu}</td>
                <td className="px-3 py-1.5 max-w-[200px] truncate" title={row.bransAdi}>
                  {row.bransAdi}
                </td>
                <td className="px-3 py-1.5 text-slate-600">{row.anaBrans}</td>
                <td className="px-3 py-1.5 text-xs text-slate-500">{row.referans}</td>
                <td className="px-3 py-1.5 text-right font-medium tabular-nums">{pct(row.oran)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
