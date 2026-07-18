"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  REFERANS_YIL_SECENEKLERI,
  normalizeYilAgirliklari,
  referansYilAgirliklari,
  varsayilanYilAgirliklari,
} from "@/lib/butce/config/constants";
import {
  V2_AYLIK_GETIRI_VARSAYILAN,
  V2_MALI_GELIR_DISCLAIMER,
  V2_VERGI_DISCLAIMER,
} from "@/lib/butce/v2/maliGelirProxyConfig";
import type { V2MaliGelirProxySonuc } from "@/lib/butce/v2/types";
import type { GelirTablosuSonuc } from "@/lib/butce/gelir/gelirTablosu";

type TarifeOzet = {
  tarifeGrubu: string;
  mevcutHedef: number;
  yeniHedef: number;
  artisOrani: number;
};

const tl = (n: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);
const pct = (n: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "percent",
    maximumFractionDigits: 2,
    minimumFractionDigits: 1,
  }).format(n);

export default function V2DashboardClient() {
  const [butceYili, setButceYili] = useState(2027);
  const [tarifeRows, setTarifeRows] = useState<TarifeOzet[]>([]);
  const [giderArtisPct, setGiderArtisPct] = useState(20);
  const [getiriPct, setGetiriPct] = useState<number[]>(
    Array.from({ length: 12 }, () => V2_AYLIK_GETIRI_VARSAYILAN * 100),
  );
  const [referans, setReferans] = useState("Son 2 Yıl Ortalaması (2024-2025)");
  const [yilAgirliklari, setYilAgirliklari] = useState(() =>
    referansYilAgirliklari("Son 2 Yıl Ortalaması (2024-2025)"),
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [gt, setGt] = useState<GelirTablosuSonuc | null>(null);
  const [proxy, setProxy] = useState<V2MaliGelirProxySonuc | null>(null);
  const [uyarilar, setUyarilar] = useState<string[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/butce/v2/varsayimlar");
    if (!res.ok) return;
    const data = await res.json();
    setButceYili(data.butceYili ?? 2027);
    const ozet = (data.tarifeOzet ?? []) as Array<{
      tarifeGrubu: string;
      mevcutHedef: number;
    }>;
    const saved = data.saved as {
      tarifeHedefleri?: Record<string, number>;
      giderArtisOrani?: number;
      aylikGetiriOrani?: number[];
      referansEtiket?: string;
      yilAgirliklari?: number[];
    } | null;

    setTarifeRows(
      ozet.map((r) => {
        const yeni = saved?.tarifeHedefleri?.[r.tarifeGrubu] ?? r.mevcutHedef;
        return {
          tarifeGrubu: r.tarifeGrubu,
          mevcutHedef: r.mevcutHedef,
          yeniHedef: yeni,
          artisOrani: r.mevcutHedef > 0 ? yeni / r.mevcutHedef - 1 : 0,
        };
      }),
    );
    if (saved?.giderArtisOrani != null) setGiderArtisPct(saved.giderArtisOrani * 100);
    if (saved?.aylikGetiriOrani?.length === 12) {
      setGetiriPct(saved.aylikGetiriOrani.map((x) => x * 100));
    }
    if (saved?.referansEtiket && REFERANS_YIL_SECENEKLERI[saved.referansEtiket]) {
      setReferans(saved.referansEtiket);
      setYilAgirliklari(
        referansYilAgirliklari(saved.referansEtiket, saved.yilAgirliklari),
      );
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function bodyPayload() {
    const tarifeHedefleri: Record<string, number> = {};
    for (const r of tarifeRows) tarifeHedefleri[r.tarifeGrubu] = r.yeniHedef;
    return {
      butceYili,
      tarifeHedefleri,
      referansEtiket: referans,
      yilAgirliklari: normalizeYilAgirliklari(yilAgirliklari),
      giderArtisOrani: giderArtisPct / 100,
      aylikGetiriOrani: getiriPct.map((x) => x / 100),
    };
  }

  async function kaydet() {
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/butce/v2/varsayimlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyPayload()),
    });
    setBusy(false);
    setMsg(res.ok ? "V2 varsayımlar kaydedildi" : "Kayıt başarısız");
  }

  async function hesapla() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await fetch("/api/butce/v2/varsayimlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload()),
      });
      const res = await fetch("/api/butce/v2/hesapla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload()),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? data.detail ?? "Hesaplama başarısız");
        setGt(null);
        setProxy(null);
        return;
      }
      setGt(data.gt);
      setProxy(data.proxy);
      setUyarilar(data.uyarilar ?? []);
      setMsg("V2 GT hesaplandı");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Bağlantı hatası");
    } finally {
      setBusy(false);
    }
  }

  const refYears = REFERANS_YIL_SECENEKLERI[referans] ?? [2024];

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold">{V2_MALI_GELIR_DISCLAIMER}</p>
        <p className="mt-1">{V2_VERGI_DISCLAIMER}</p>
        <p className="mt-2 text-amber-900/90">
          V1 adım adım bütçe akışı aynen durur. Bu ekran paralel taslak yoldur. Teknik oran
          müdahalesi için{" "}
          <Link href="/butce/oranlar" className="font-semibold underline">
            Teknik oranlar
          </Link>{" "}
          panelini kullanın (aynı oran-ayarlar.json).
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">1) Tarife grubu hedef prim ({butceYili})</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-slate-500">
                <th className="py-2 pr-3">Tarife</th>
                <th className="py-2 pr-3">Excel hedef</th>
                <th className="py-2 pr-3">{butceYili} hedef</th>
                <th className="py-2">Artış %</th>
              </tr>
            </thead>
            <tbody>
              {tarifeRows.map((row, idx) => (
                <tr key={row.tarifeGrubu} className="border-b border-slate-100">
                  <td className="py-1.5 pr-3 font-medium">{row.tarifeGrubu}</td>
                  <td className="py-1.5 pr-3 text-slate-600">{tl(row.mevcutHedef)}</td>
                  <td className="py-1.5 pr-3">
                    <input
                      type="number"
                      className="w-36 rounded border border-slate-300 px-2 py-1"
                      value={Math.round(row.yeniHedef)}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setTarifeRows((prev) => {
                          const next = [...prev];
                          const r = { ...next[idx]! };
                          r.yeniHedef = v;
                          r.artisOrani = r.mevcutHedef > 0 ? v / r.mevcutHedef - 1 : 0;
                          next[idx] = r;
                          return next;
                        });
                      }}
                    />
                  </td>
                  <td className="py-1.5">
                    <input
                      type="number"
                      step="0.1"
                      className="w-20 rounded border border-slate-300 px-2 py-1"
                      value={Number((row.artisOrani * 100).toFixed(2))}
                      onChange={(e) => {
                        const pctV = Number(e.target.value);
                        setTarifeRows((prev) => {
                          const next = [...prev];
                          const r = { ...next[idx]! };
                          r.artisOrani = pctV / 100;
                          r.yeniHedef = r.mevcutHedef * (1 + r.artisOrani);
                          next[idx] = r;
                          return next;
                        });
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="text-slate-600">Dağıtım referansı</span>
            <select
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={referans}
              onChange={(e) => {
                setReferans(e.target.value);
                setYilAgirliklari(
                  varsayilanYilAgirliklari(
                    (REFERANS_YIL_SECENEKLERI[e.target.value] ?? [2024]).length,
                  ),
                );
              }}
            >
              {Object.keys(REFERANS_YIL_SECENEKLERI).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          {refYears.length > 1 &&
            refYears.map((y, i) => (
              <label key={y} className="text-sm">
                <span className="text-slate-600">{y} ağırlık %</span>
                <input
                  type="number"
                  className="mt-1 block w-20 rounded border border-slate-300 px-2 py-1"
                  value={Number(((yilAgirliklari[i] ?? 0) * 100).toFixed(1))}
                  onChange={(e) => {
                    const next = [...yilAgirliklari];
                    next[i] = Number(e.target.value) / 100;
                    setYilAgirliklari(next);
                  }}
                />
              </label>
            ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          2) Genel gider artışı (61402–06) ve aylık mali getiri
        </h2>
        <label className="mt-3 block text-sm">
          <span className="text-slate-600">Geçen yıla göre artış %</span>
          <input
            type="number"
            step="0.1"
            className="mt-1 block w-28 rounded border border-slate-300 px-2 py-1"
            value={giderArtisPct}
            onChange={(e) => setGiderArtisPct(Number(e.target.value))}
          />
        </label>
        <p className="mt-3 text-xs font-medium uppercase text-slate-500">
          Aylık vadeli mevduat / getiri oranı (%)
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-12">
          {getiriPct.map((v, i) => (
            <label key={i} className="text-xs text-slate-600">
              {["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"][i]}
              <input
                type="number"
                step="0.1"
                className="mt-0.5 w-full rounded border border-slate-300 px-1 py-1 text-sm"
                value={v}
                onChange={(e) => {
                  const next = [...getiriPct];
                  next[i] = Number(e.target.value);
                  setGetiriPct(next);
                }}
              />
            </label>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={kaydet}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 disabled:opacity-50"
          >
            Kaydet
          </button>
          <button
            type="button"
            disabled={busy || tarifeRows.length === 0}
            onClick={hesapla}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Hesaplanıyor…" : "V2 GT hesapla"}
          </button>
          <Link
            href="/butce/oranlar"
            className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-900"
          >
            Teknik oranlar →
          </Link>
        </div>
        {msg && <p className="mt-2 text-sm text-emerald-700">{msg}</p>}
        {err && <p className="mt-2 text-sm text-red-700">{err}</p>}
      </section>

      {uyarilar.length > 0 && (
        <ul className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {uyarilar.map((u, i) => (
            <li key={i} className="list-disc ml-4">
              {u}
            </li>
          ))}
        </ul>
      )}

      {proxy && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Mali gelir proxy (banka roll-forward)</h2>
          <p className="mt-1 text-xs text-slate-500">
            Açılış: {tl(proxy.acilisBanka)} ({proxy.acilisKaynak}) · Yıllık mali gelir:{" "}
            <strong>{tl(proxy.maliGelirYillik)}</strong>
          </p>
          {proxy.negatifBakiyeAylar.length > 0 && (
            <div
              className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900"
              role="alert"
            >
              <p className="font-semibold">Negatif banka bakiyesi — mali gelir anlamsız</p>
              <p className="mt-1 text-xs leading-relaxed">
                {proxy.negatifBakiyeAylar.join(", ")}. ayda ay başı veya ay sonu bakiye 0&apos;ın
                altına düşüyor. Formül stok × getiri varsaydığı için bu aylarda proxy mali gelir
                güvenilir değildir; nakit varsayımlarını veya çıkışları gözden geçirin.
              </p>
            </div>
          )}
          <div className="mt-3 max-h-[360px] overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-2 py-1 text-left">Ay</th>
                  <th className="px-2 py-1 text-right">Ay başı</th>
                  <th className="px-2 py-1 text-right">Giriş</th>
                  <th className="px-2 py-1 text-right">Çıkış</th>
                  <th className="px-2 py-1 text-right">Net</th>
                  <th className="px-2 py-1 text-right">Getiri</th>
                  <th className="px-2 py-1 text-right">Mali gelir</th>
                  <th className="px-2 py-1 text-right">Ay sonu</th>
                </tr>
              </thead>
              <tbody>
                {proxy.aylar.map((a) => (
                  <tr
                    key={a.ay}
                    className={`border-b border-slate-100 ${
                      a.negatifBakiye ? "bg-red-50 text-red-950" : ""
                    }`}
                  >
                    <td className="px-2 py-1">
                      {a.ayAd}
                      {a.negatifBakiye ? (
                        <span className="ml-1 rounded bg-red-200 px-1 text-[10px] font-bold uppercase">
                          Negatif
                        </span>
                      ) : null}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">{tl(a.ayBasiBanka)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{tl(a.giris)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{tl(a.cikis)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{tl(a.netNakit)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{pct(a.getiriOrani)}</td>
                    <td className="px-2 py-1 text-right font-medium tabular-nums">
                      {tl(a.maliGelir)}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums font-medium">
                      {tl(a.aySonuBanka)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {gt && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">V2 Gelir tablosu özeti (şirket toplam)</h2>
          <p className="mt-1 text-xs text-slate-500">
            Brüt prim: {tl(gt.brutPrimToplam)} · Safi TKZ:{" "}
            {tl(gt.toplam[9003] ?? 0)} · TKZ: {tl(gt.toplam[9005] ?? 0)}
          </p>
          <div className="mt-3 max-h-[480px] overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-2 py-1 text-left">Satır</th>
                  <th className="px-2 py-1 text-left">Kalem</th>
                  <th className="px-2 py-1 text-right">Yıllık</th>
                </tr>
              </thead>
              <tbody>
                {gt.satirlar.filter((s) => !s.gizli).map((s) => (
                  <tr
                    key={s.satir}
                    className={`border-b border-slate-100 ${s.kalin ? "font-semibold" : ""} ${
                      s.vurgu ? "bg-emerald-50/50" : ""
                    }`}
                  >
                    <td className="px-2 py-1 font-mono text-xs text-slate-500">
                      {s.kod ?? `F${s.satir}`}
                    </td>
                    <td className="px-2 py-1" style={{ paddingLeft: `${s.seviye * 12 + 8}px` }}>
                      {s.ad}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">{tl(gt.toplam[s.satir] ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
