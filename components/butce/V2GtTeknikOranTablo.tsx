"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { bransAdi } from "@/lib/butce/config/brans";
import type { V2TeknikOranTablo } from "@/lib/butce/v2/v2GtOranTablo";

const pct = (n: number | null) =>
  n == null || !Number.isFinite(n)
    ? "—"
    : new Intl.NumberFormat("tr-TR", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(n);

function oranToPctInput(oran: number) {
  return Number((oran * 100).toFixed(2));
}

type Props = {
  bransKodlari: string[] | null;
  ozetAy: number;
  busy: boolean;
  onUygula: () => Promise<void>;
};

export default function V2GtTeknikOranTablo({
  bransKodlari,
  ozetAy,
  busy,
  onUygula,
}: Props) {
  const kodlar = useMemo(
    () => (bransKodlari ?? []).filter((k) => /^7\d{2}$/.test(k)),
    [bransKodlari],
  );
  const [secili, setSecili] = useState(kodlar[0] ?? "");
  const [tablo, setTablo] = useState<V2TeknikOranTablo | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (kodlar.length === 0) {
      setSecili("");
      setTablo(null);
      return;
    }
    if (!kodlar.includes(secili)) setSecili(kodlar[0]!);
  }, [kodlar, secili]);

  const load = useCallback(async (brans: string, ay: number) => {
    if (!brans) return;
    setYukleniyor(true);
    setErr(null);
    try {
      const res = await fetch(`/api/butce/v2/oranlar?brans=${brans}&ay=${ay}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? "Teknik oranlar yüklenemedi");
        setTablo(null);
        return;
      }
      setTablo(data as V2TeknikOranTablo);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Bağlantı hatası");
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    if (secili) void load(secili, ozetAy);
  }, [secili, ozetAy, load]);

  function patchLocal(kalem: string, oran: number, manuel: boolean) {
    setTablo((once) => {
      if (!once) return once;
      return {
        ...once,
        satirlar: once.satirlar.map((s) =>
          s.kalem === kalem
            ? { ...s, uygulanan: oran, manuel, referans: manuel ? "manuel" : "excel_gt" }
            : s,
        ),
      };
    });
  }

  async function uygula(kalem: string, oran: number, manuel: boolean) {
    if (!secili) return;
    setMsg(null);
    setErr(null);
    patchLocal(kalem, oran, manuel);
    const res = await fetch("/api/butce/oran-ayar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patch: [
          {
            kalem,
            bransKodu: secili,
            oran,
            manuel,
            referans: manuel ? "manuel" : "excel_gt",
          },
        ],
      }),
    });
    if (!res.ok) {
      setErr("Oran kaydı başarısız");
      return;
    }
    await onUygula();
    await load(secili, ozetAy);
    setMsg(manuel ? `${kalem} uygulandı — GT yenilendi` : `${kalem} MIZAN oranına döndü`);
  }

  if (kodlar.length === 0) {
    return (
      <section className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Teknik oranlar</h3>
        <p className="mt-1 text-xs text-slate-500">
          Yukarıdan tarife grubu veya 7&apos;li branş seçince o 7xx&apos;in geçmiş yıl oranları ve
          uygulanan oran burada açılır.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Teknik oranlar</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Yıl kolonları gösterim döneminin kümülatif ay-sonu oranı. Uygulanan GT&apos;ye yazar
            (Teknik oranlar paneliyle aynı kayıt).
          </p>
        </div>
        <label className="text-xs text-slate-600">
          7&apos;li branş
          <select
            className="ml-2 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900"
            value={secili}
            onChange={(e) => setSecili(e.target.value)}
          >
            {kodlar.map((k) => (
              <option key={k} value={k}>
                {k} {bransAdi(k)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {msg && <p className="mt-2 text-xs text-emerald-700">{msg}</p>}
      {err && <p className="mt-2 text-xs text-red-700">{err}</p>}
      {(yukleniyor || busy) && (
        <p className="mt-2 text-xs text-slate-500">
          {busy ? "GT yenileniyor…" : "Oranlar yükleniyor…"}
        </p>
      )}

      {tablo && (
        <div className="mt-3 max-h-[420px] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-2 py-1 text-left">Kalem</th>
                {tablo.yillar.map((y) => (
                  <th key={y} className="px-2 py-1 text-right">
                    {y}
                  </th>
                ))}
                <th className="px-2 py-1 text-right">Sistem</th>
                <th className="px-2 py-1 text-right">Uygulanan %</th>
                <th className="px-2 py-1 text-left">Müdahale</th>
              </tr>
            </thead>
            <tbody>
              {tablo.satirlar.map((s) => (
                <tr
                  key={s.kalem}
                  className={`border-b border-slate-100 ${s.manuel ? "bg-amber-50/50" : ""}`}
                >
                  <td className="px-2 py-1">
                    <div className="font-mono text-[11px] text-slate-500">{s.kalem}</div>
                    <div className="max-w-[220px] truncate text-slate-800" title={s.ad}>
                      {s.ad}
                    </div>
                  </td>
                  {tablo.yillar.map((y) => (
                    <td key={y} className="px-2 py-1 text-right tabular-nums text-slate-600">
                      {pct(s.yilOran[String(y)] ?? null)}
                    </td>
                  ))}
                  <td className="px-2 py-1 text-right tabular-nums text-slate-500">
                    {pct(s.sistemOran)}
                  </td>
                  <td className="px-2 py-1 text-right">
                    <input
                      type="number"
                      step="0.01"
                      disabled={busy || yukleniyor}
                      value={oranToPctInput(s.uygulanan)}
                      onChange={(e) =>
                        patchLocal(s.kalem, Number(e.target.value) / 100, true)
                      }
                      onBlur={(e) =>
                        void uygula(s.kalem, Number(e.target.value) / 100, true)
                      }
                      className="w-20 rounded border border-slate-300 px-1.5 py-0.5 text-right text-sm tabular-nums"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        disabled={busy || yukleniyor}
                        onClick={() => void uygula(s.kalem, s.uygulanan + 0.01, true)}
                        className="rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        +1 pp
                      </button>
                      <button
                        type="button"
                        disabled={busy || yukleniyor}
                        onClick={() => void uygula(s.kalem, s.uygulanan - 0.01, true)}
                        className="rounded border border-slate-300 px-1.5 py-0.5 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        −1 pp
                      </button>
                      {s.manuel && (
                        <button
                          type="button"
                          disabled={busy || yukleniyor}
                          onClick={() => void uygula(s.kalem, s.sistemOran, false)}
                          className="rounded border border-emerald-300 px-1.5 py-0.5 text-xs text-emerald-800 hover:bg-emerald-50"
                        >
                          Sisteme dön
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
