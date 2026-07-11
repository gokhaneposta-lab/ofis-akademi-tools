"use client";

import { useCallback, useEffect, useState } from "react";
import { AYLAR } from "@/lib/butce/config/constants";

type TarifeSatir = {
  tarifeGrubu: string;
  aylar: number[];
  toplam: number;
  kaynak: ("gercek" | "tahmin")[];
};

type ApiData = {
  butceYili: number;
  saved: {
    sonGercekAy?: number;
    tarifeBuyumeOran?: Record<string, number>;
    tarifeAylikOverride?: Record<string, Record<number, number>>;
  } | null;
  oncekiYil: {
    oncekiYil: number;
    sonGercekAy: number;
    tarifeSatirlar: TarifeSatir[];
    buyumeOranlari: Record<string, number>;
  };
};

function fmt(n: number) {
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toFixed(0);
}

export default function KpkKapanisClient() {
  const [data, setData] = useState<ApiData | null>(null);
  const [sonAy, setSonAy] = useState(9);
  const [buyume, setBuyume] = useState<Record<string, string>>({});
  const [override, setOverride] = useState<Record<string, Record<number, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/butce/kpk-kapanis");
      const json = (await res.json()) as ApiData;
      setData(json);
      setSonAy(json.saved?.sonGercekAy ?? json.oncekiYil.sonGercekAy ?? 9);
      const b: Record<string, string> = {};
      for (const [t, v] of Object.entries(json.oncekiYil.buyumeOranlari)) {
        b[t] = String(Math.round(v * 1000) / 10);
      }
      if (json.saved?.tarifeBuyumeOran) {
        for (const [t, v] of Object.entries(json.saved.tarifeBuyumeOran)) {
          b[t] = String(Math.round(v * 1000) / 10);
        }
      }
      setBuyume(b);
      const o: Record<string, Record<number, string>> = {};
      if (json.saved?.tarifeAylikOverride) {
        for (const [t, ayMap] of Object.entries(json.saved.tarifeAylikOverride)) {
          o[t] = {};
          for (const [ay, val] of Object.entries(ayMap)) {
            o[t][Number(ay)] = String(val);
          }
        }
      }
      setOverride(o);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function kaydet() {
    setSaving(true);
    setMsg(null);
    try {
      const tarifeBuyumeOran: Record<string, number> = {};
      for (const [t, v] of Object.entries(buyume)) {
        const n = parseFloat(v.replace(",", "."));
        if (Number.isFinite(n)) tarifeBuyumeOran[t] = n / 100;
      }
      const tarifeAylikOverride: Record<string, Record<number, number>> = {};
      for (const [t, ayMap] of Object.entries(override)) {
        for (const [ay, val] of Object.entries(ayMap)) {
          const n = parseFloat(val.replace(/\./g, "").replace(",", "."));
          if (!Number.isFinite(n) || n <= 0) continue;
          if (!tarifeAylikOverride[t]) tarifeAylikOverride[t] = {};
          tarifeAylikOverride[t][Number(ay)] = n;
        }
      }
      const res = await fetch("/api/butce/kpk-kapanis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sonGercekAy: sonAy, tarifeBuyumeOran, tarifeAylikOverride }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Kayıt başarısız");
      setMsg("Kapanış tahmini kaydedildi — devreden KPK ve gelir tablosu buna göre güncellenir.");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Hata");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-600">Veri yüklenemedi.</p>;
  }

  const { oncekiYil, butceYili } = data;
  const tahminAylar = Array.from({ length: 12 - sonAy }, (_, i) => sonAy + 1 + i);

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-950">
        <strong>{oncekiYil.oncekiYil} kapanış prim tahmini</strong> — Devreden KPK için {butceYili}{" "}
        açılış bilançosunda kullanılır. Mizanda gerçekleşen aylar otomatik; kalan aylar tarife grubu
        büyüme oranıyla tahmin edilir. Hücreye yazarak elle düzeltebilirsiniz.
      </section>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Mizanda son gerçek ay ({oncekiYil.oncekiYil})</span>
          <select
            value={sonAy}
            onChange={(e) => setSonAy(Number(e.target.value))}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            {AYLAR.map((ad, i) => (
              <option key={ad} value={i + 1}>
                {i + 1}. {ad}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={kaydet}
          disabled={saving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? "Kaydediliyor…" : "Tahmini kaydet"}
        </button>
        {msg && <p className="text-sm text-emerald-800">{msg}</p>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-600">
              <th className="px-3 py-2">Tarife grubu</th>
              <th className="px-3 py-2">YoY %</th>
              {tahminAylar.map((ay) => (
                <th key={ay} className="px-2 py-2 whitespace-nowrap">
                  {AYLAR[ay - 1]} (tahmin)
                </th>
              ))}
              <th className="px-3 py-2">Yıllık toplam</th>
            </tr>
          </thead>
          <tbody>
            {oncekiYil.tarifeSatirlar.map((row) => (
              <tr key={row.tarifeGrubu} className="border-b border-slate-100">
                <td className="px-3 py-2 font-medium">{row.tarifeGrubu}</td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={buyume[row.tarifeGrubu] ?? ""}
                    onChange={(e) =>
                      setBuyume((prev) => ({ ...prev, [row.tarifeGrubu]: e.target.value }))
                    }
                    className="w-16 rounded border border-slate-200 px-1 py-0.5 text-right text-xs"
                  />
                  %
                </td>
                {tahminAylar.map((ay) => {
                  const otomatik = row.aylar[ay - 1] ?? 0;
                  const val = override[row.tarifeGrubu]?.[ay] ?? "";
                  return (
                    <td key={ay} className="px-2 py-1">
                      <input
                        type="text"
                        placeholder={fmt(otomatik)}
                        title={`Otomatik: ${fmt(otomatik)}`}
                        value={val}
                        onChange={(e) =>
                          setOverride((prev) => ({
                            ...prev,
                            [row.tarifeGrubu]: { ...prev[row.tarifeGrubu], [ay]: e.target.value },
                          }))
                        }
                        className="w-24 rounded border border-slate-200 px-1 py-0.5 text-right text-xs"
                      />
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-right tabular-nums">{fmt(row.toplam)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">
        Gerçek aylar (1–{sonAy}) mizandan okunur. Tahmin aylarda placeholder otomatik değeri gösterir;
        boş bırakırsanız YoY oranı uygulanır.
      </p>
    </div>
  );
}
