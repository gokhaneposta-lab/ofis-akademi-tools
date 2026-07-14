"use client";

import { useCallback, useEffect, useState } from "react";
import type { BransOranSatir } from "@/lib/butce/types";
import type { OranKalemAciklama } from "@/lib/butce/oran/oranKalemAciklama";

type Kalem = { kod: string; ad: string };

const pct = (n: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

function oranToPctInput(oran: number) {
  return Number((oran * 100).toFixed(2));
}

export default function OranlarPanel() {
  const [kalemler, setKalemler] = useState<Kalem[]>([]);
  const [kalem, setKalem] = useState("");
  const [tablo, setTablo] = useState<BransOranSatir[]>([]);
  const [aciklama, setAciklama] = useState<OranKalemAciklama | null>(null);
  const [yillar, setYillar] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

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
    setErr(null);
    const q = new URLSearchParams({ kalem: k });
    if (yeniden) q.set("yeniden", "1");
    try {
      const res = await fetch(`/api/butce/oranlar?${q}`);
      const text = await res.text();
      let data: { tablo?: BransOranSatir[]; aciklama?: OranKalemAciklama | null; error?: string } =
        {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setErr(`Sunucu yanıtı okunamadı (HTTP ${res.status})`);
        return;
      }
      if (!res.ok) {
        setErr(data.error ?? `Tablo yüklenemedi (HTTP ${res.status})`);
        return;
      }
      const rows = data.tablo ?? [];
      setTablo(rows);
      setAciklama(data.aciklama ?? null);
      setDirty(false);
      if (rows.length === 0) {
        setErr("Branş tablosu boş döndü — sayfayı yenileyip tekrar deneyin.");
      } else if (yeniden) {
        setMsg(`MIZAN'dan yeniden hesaplandı (${rows.length} branş; manuel satımlar korundu)`);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Bağlantı hatası");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    loadKalemler();
  }, [loadKalemler]);

  useEffect(() => {
    if (kalem) loadTablo(kalem);
  }, [kalem, loadTablo]);

  function patchRow(bransKodu: string, patch: Partial<BransOranSatir>) {
    setTablo((prev) =>
      prev.map((r) => (r.bransKodu === bransKodu ? { ...r, ...patch } : r)),
    );
    setDirty(true);
    setMsg(null);
  }

  function setManuelOran(bransKodu: string, oran: number) {
    patchRow(bransKodu, {
      oran,
      manuel: true,
      referans: "manuel",
    });
  }

  function adjustPp(bransKodu: string, deltaPp: number) {
    const row = tablo.find((r) => r.bransKodu === bransKodu);
    if (!row) return;
    setManuelOran(bransKodu, row.oran + deltaPp / 100);
  }

  async function persistAyarlar(nextTablo: BransOranSatir[]) {
    const ayarlar: Record<
      string,
      Record<string, { referans: string; oran: number; manuel: boolean }>
    > = {};
    const getRes = await fetch("/api/butce/oran-ayar");
    const existing = getRes.ok ? await getRes.json() : { ayarlar: {} };
    Object.assign(ayarlar, existing.ayarlar ?? {});
    ayarlar[kalem] = {};
    for (const row of nextTablo) {
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
    return res.ok;
  }

  async function kaydet() {
    if (!kalem || tablo.length === 0) return;
    setBusy(true);
    setErr(null);
    const ok = await persistAyarlar(tablo);
    setBusy(false);
    setDirty(false);
    setMsg(ok ? "Oran ayarları kaydedildi — GT bu oranları kullanır" : "Kayıt başarısız");
  }

  async function mizanDon(bransKodu: string) {
    if (!kalem) return;
    setBusy(true);
    setErr(null);
    const next = tablo.map((r) =>
      r.bransKodu === bransKodu ? { ...r, manuel: false, referans: "excel_gt" } : r,
    );
    setTablo(next);
    const ok = await persistAyarlar(next);
    if (!ok) {
      setBusy(false);
      setErr("MIZAN'a dönüş kaydı başarısız");
      return;
    }
    await loadTablo(kalem, true);
    setMsg(`${bransKodu} MIZAN ağırlıklı ortalamaya döndü`);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-950">
        <strong>Hasar/Prim ve teknik oranlar:</strong> Varsayılan değer geçmiş yılların
        (torpulu) ağırlıklı ortalamasıdır. Branş satırında oranı elle yazın veya ±1 pp ile
        kaydırın — satır <em>manuel</em> olur. GT bu kaydı kullanır. &quot;MIZAN&apos;a dön&quot;
        ilgili branşı tekrar hesaplanan orana çeker.
      </section>

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
          disabled={busy || !kalem || !dirty}
          onClick={kaydet}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Kaydet{dirty ? " *" : ""}
        </button>
      </div>

      {aciklama && (
        <section className="rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-slate-800">
          <h3 className="font-semibold text-slate-900">{aciklama.ad}</h3>
          <p className="mt-1 text-xs text-slate-500">
            GT kodu: {aciklama.kalemKodu}
            {aciklama.gtHucre ? ` · Excel oran hücresi: ${aciklama.gtHucre}` : ""}
            {aciklama.excelHucre && aciklama.excelHucre !== aciklama.kalemKodu
              ? ` · Excel kalem: ${aciklama.excelHucre}`
              : ""}
          </p>

          <div className="mt-3 space-y-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                MIZAN oranı (pay ÷ baz)
              </p>
              {aciklama.mizanSatirlar.length <= 1 ? (
                <p className="mt-1 font-mono text-base text-slate-900">{aciklama.mizanOranFormul}</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {aciklama.mizanSatirlar.map((s) => (
                    <li key={s.etiket}>
                      <span className="text-slate-600">{s.etiket}: </span>
                      <span className="font-mono text-slate-900">{s.formul}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Yıl birleştirme
                </p>
                <p className="mt-0.5 text-slate-700">{aciklama.yilBirlestirme}</p>
              </div>
              {aciklama.tahminAciklama && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    GT tahmin
                  </p>
                  <p className="mt-0.5 text-slate-700">{aciklama.tahminAciklama}</p>
                  {aciklama.excelCarpim && (
                    <p className="mt-0.5 font-mono text-xs text-slate-500">
                      Excel: {aciklama.excelCarpim}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {yillar.length > 0 && (
        <p className="text-xs text-slate-500">
          MIZAN yılları: {yillar.join(", ")} (bütçe yılı hariç)
        </p>
      )}
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      {err && <p className="text-sm text-red-700">{err}</p>}

      {busy && <p className="text-sm text-slate-500">Hesaplanıyor…</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Branş</th>
              <th className="px-3 py-2">Ad</th>
              <th className="px-3 py-2">Ana branş</th>
              <th className="px-3 py-2">Durum</th>
              <th className="px-3 py-2 text-right">Oran %</th>
              <th className="px-3 py-2">Müdahale</th>
            </tr>
          </thead>
          <tbody>
            {tablo.map((row) => (
              <tr
                key={row.bransKodu}
                className={`border-b border-slate-100 hover:bg-slate-50/50 ${
                  row.manuel ? "bg-amber-50/40" : ""
                }`}
              >
                <td className="px-3 py-1.5 font-mono text-xs">{row.bransKodu}</td>
                <td className="max-w-[180px] truncate px-3 py-1.5" title={row.bransAdi}>
                  {row.bransAdi}
                </td>
                <td className="px-3 py-1.5 text-slate-600">{row.anaBrans}</td>
                <td className="px-3 py-1.5">
                  {row.manuel ? (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-900">
                      Manuel
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500" title={row.referans}>
                      {row.referans}
                    </span>
                  )}
                </td>
                <td className="px-3 py-1.5 text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={oranToPctInput(row.oran)}
                    onChange={(e) =>
                      setManuelOran(row.bransKodu, Number(e.target.value) / 100)
                    }
                    className="w-24 rounded border border-slate-300 px-2 py-1 text-right text-sm tabular-nums"
                    title={`Ondalık: ${pct(row.oran)}`}
                  />
                </td>
                <td className="px-3 py-1.5">
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => adjustPp(row.bransKodu, 1)}
                      className="rounded border border-slate-300 px-1.5 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      title="+1 yüzde puan"
                    >
                      +1 pp
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => adjustPp(row.bransKodu, -1)}
                      className="rounded border border-slate-300 px-1.5 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      title="-1 yüzde puan"
                    >
                      −1 pp
                    </button>
                    {row.manuel && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => mizanDon(row.bransKodu)}
                        className="rounded border border-emerald-300 px-1.5 py-0.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50"
                      >
                        MIZAN&apos;a dön
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
