"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  etiket: string;
  busy: boolean;
  onUygula: () => Promise<void>;
};

export default function V2GtTeknikOranTablo({
  bransKodlari,
  ozetAy,
  etiket,
  busy,
  onUygula,
}: Props) {
  const kodlar = useMemo(
    () => (bransKodlari ?? []).filter((k) => /^7\d{2}$/.test(k)),
    [bransKodlari],
  );
  const [tablo, setTablo] = useState<V2TeknikOranTablo | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const bransKey = kodlar.join(",");

  const load = useCallback(async (kod: string[], ay: number) => {
    if (kod.length === 0) return;
    setYukleniyor(true);
    setErr(null);
    try {
      const res = await fetch(
        `/api/butce/v2/oranlar?brans=${encodeURIComponent(kod.join(","))}&ay=${ay}`,
      );
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
    if (kodlar.length === 0) {
      setTablo(null);
      return;
    }
    void load(kodlar, ozetAy);
  }, [bransKey, ozetAy, load, kodlar]);

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
    if (kodlar.length === 0) return;
    setMsg(null);
    setErr(null);
    patchLocal(kalem, oran, manuel);
    const res = await fetch("/api/butce/oran-ayar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patch: kodlar.map((bransKodu) => ({
          kalem,
          bransKodu,
          oran,
          manuel,
          referans: manuel ? "manuel" : "excel_gt",
        })),
      }),
    });
    if (!res.ok) {
      setErr("Oran kaydı başarısız");
      return;
    }
    await onUygula();
    await load(kodlar, ozetAy);
    setMsg(
      manuel
        ? `${kalem} gruptaki ${kodlar.length} branşa yazıldı — GT yenilendi`
        : `${kalem} MIZAN oranına döndü`,
    );
  }

  if (kodlar.length === 0) {
    return (
      <section className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Teknik oranlar</h3>
        <p className="mt-1 text-xs text-slate-500">
          Yukarıdan tarife grubu veya 7&apos;li branş seçince oranlar burada açılır. Tarife
          grubunda pay/payda ilgili 7xx&apos;lerin toplamıdır.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Teknik oranlar — {etiket}</h3>
        <p className="mt-0.5 text-[11px] text-slate-400">
          {kodlar.length > 1
            ? `Pay ve payda ${kodlar.join(" + ")} toplanır, oran toplam pay ÷ toplam payda.`
            : "Tek 7xx branş oranı."}{" "}
          Kapanış kolonları yıl sonudur; güncel kolon içerideki son aylık dönemi gösterir.
          Sistem kolonu seçili GT ayı {String(ozetAy).padStart(2, "0")} için hesaplanır.
          Müdahale gruptaki tüm 7xx&apos;e yazılır.
        </p>
        {tablo && (
          <p className="mt-1 text-[11px] text-sky-800 bg-sky-50 rounded px-2 py-1 border border-sky-100">
            {tablo.metodolojiOzet} Küçük baz eşiği:{" "}
            {new Intl.NumberFormat("tr-TR").format(tablo.kucukBazEsikTl)} TL (son referans yılı).
          </p>
        )}
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
                    {y}-12
                  </th>
                ))}
                {tablo.guncelDonem && (
                  <th className="px-2 py-1 text-right">{tablo.guncelDonem.etiket}</th>
                )}
                <th className="px-2 py-1 text-right">Sistem ({String(ozetAy).padStart(2, "0")})</th>
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
                    {s.hesapAciklamaSatirlari.length > 0 && (
                      <div className="mt-1 space-y-0.5 text-[10px] leading-4 text-slate-500">
                        {s.hesapAciklamaSatirlari.map((satir) => (
                          <div key={`${s.kalem}-${satir}`}>{satir}</div>
                        ))}
                      </div>
                    )}
                    {s.duzenlemeEtiketleri.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {s.duzenlemeEtiketleri.map((etiket) => (
                          <span
                            key={`${s.kalem}-${etiket}`}
                            className="rounded bg-amber-50 px-1 py-0.5 text-[9px] font-medium text-amber-900 ring-1 ring-amber-200"
                            title={s.duzenlemeNotlari.join(" ")}
                          >
                            {etiket}
                          </span>
                        ))}
                      </div>
                    )}
                    {s.duzenlemeNotlari.length > 0 && (
                      <details className="mt-1 text-[10px] text-slate-600">
                        <summary className="cursor-pointer text-sky-700 hover:underline">
                          Düzenleme notları ({s.duzenlemeNotlari.length})
                        </summary>
                        <ul className="mt-0.5 list-disc pl-3 space-y-0.5">
                          {s.duzenlemeNotlari.map((n, i) => (
                            <li key={`${s.kalem}-dn-${i}`}>{n}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </td>
                  {tablo.yillar.map((y) => (
                    <td key={y} className="px-2 py-1 text-right tabular-nums text-slate-600">
                      {pct(s.yilOran[String(y)] ?? null)}
                    </td>
                  ))}
                  {tablo.guncelDonem && (
                    <td className="px-2 py-1 text-right tabular-nums font-medium text-slate-700">
                      {pct(s.guncelDonemOran)}
                    </td>
                  )}
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
