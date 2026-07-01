"use client";

import { useState } from "react";
import { AYLAR } from "@/lib/butce/config/constants";
import { HAZINE_BRANS_KODLARI } from "@/lib/butce/config/brans";
import type { AylikPrimStore } from "@/lib/butce/types";

type Durum = {
  hasPrimBransHedef: boolean;
  hasMizanAylik: boolean;
  mizanAylikSatir: number;
  butceYili: number;
};

type Props = {
  initialDurum: Durum;
  initialReferansYil: number;
  initialGenelOranlar: number[];
  initialOranKaynak: string;
  initialSaved: AylikPrimStore | null;
};

function fmt(n: number) {
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
}

export default function AylikDagilimClient({
  initialDurum,
  initialReferansYil,
  initialGenelOranlar,
  initialOranKaynak,
  initialSaved,
}: Props) {
  const [durum, setDurum] = useState(initialDurum);
  const [referansYil, setReferansYil] = useState(initialReferansYil);
  const [genelOranlar, setGenelOranlar] = useState<number[]>(initialGenelOranlar);
  const [oranKaynak, setOranKaynak] = useState(initialOranKaynak);
  const [satirlar, setSatirlar] = useState(initialSaved?.satirlar ?? []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ozet, setOzet] = useState<{ bransSayisi: number; toplamYillik: number } | null>(
    initialSaved
      ? {
          bransSayisi: initialSaved.satirlar.length,
          toplamYillik: initialSaved.satirlar.reduce((a, r) => a + r.toplam, 0),
        }
      : null,
  );

  async function hesapla(manuel: boolean) {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/butce/aylik-dagilim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referansYil,
          genelOranlar: manuel ? genelOranlar : undefined,
          mod: manuel ? "manuel" : "mizan",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? "Hesaplama başarısız");
        return;
      }
      setSatirlar(data.store?.satirlar ?? []);
      setGenelOranlar(data.store?.genelOranlar ?? genelOranlar);
      setOranKaynak(data.store?.kaynak ?? oranKaynak);
      setOzet(data.ozet ?? null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Bağlantı hatası");
    } finally {
      setBusy(false);
    }
  }

  function updateOran(idx: number, val: number) {
    setGenelOranlar((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  }

  const oranToplam = genelOranlar.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-950">
        <strong>Mantık:</strong> Yıllık branş hedefini 12&apos;ye <em>eşit bölmüyoruz</em>.
        Aylık GT ve Bilanço Mizanı&apos;ndaki geçmiş aylık üretim ritmi kullanılır; her branş
        kendi geçmiş aylık payına göre dağılır. Veri yoksa varsayılan veya manuel oran kullanılır.
      </section>

      {!durum.hasPrimBransHedef && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Önce <strong>Prim hedefi</strong> sayfasında A motoru ile dağıtın — branş yıllık hedefleri
          kaydedilir.
        </p>
      )}

      {!durum.hasMizanAylik && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Aylık GT ve Bilanço Mizanı henüz yüklenmedi. Veriyi <strong>Veri yükleme</strong>{" "}
          sekmesinden yükleyene kadar varsayılan / manuel oran kullanılır.
        </p>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Aylık oranlar (genel yedek)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Branşın kendi MIZAN payı yoksa bu genel oran uygulanır. Kaynak:{" "}
          <strong>{oranKaynak}</strong>
          {durum.hasMizanAylik && ` · ${durum.mizanAylikSatir.toLocaleString("tr-TR")} MIZAN_AY satır`}
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="text-slate-600">Referans yıl</span>
            <input
              type="number"
              value={referansYil}
              onChange={(e) => setReferansYil(Number(e.target.value))}
              className="mt-1 w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            disabled={!durum.hasPrimBransHedef || busy}
            onClick={() => hesapla(false)}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Hesaplanıyor…" : "Geçmiş aylık paylarla hesapla"}
          </button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {AYLAR.map((ay, idx) => (
            <label key={ay} className="text-sm">
              <span className="text-slate-600">{ay}</span>
              <input
                type="number"
                step="0.001"
                min={0}
                max={1}
                value={genelOranlar[idx] ?? 0}
                onChange={(e) => updateOran(idx, Number(e.target.value))}
                className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-sm"
              />
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Oran toplamı: {oranToplam.toFixed(3)} (hesaplamada normalize edilir)
        </p>
        <button
          type="button"
          disabled={!durum.hasPrimBransHedef || busy}
          onClick={() => hesapla(true)}
          className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 disabled:opacity-50"
        >
          Manuel oranlarla yeniden hesapla
        </button>
        {err && <p className="mt-2 text-sm text-red-700">{err}</p>}
        {ozet && (
          <p className="mt-3 text-sm text-emerald-800">
            <strong>{ozet.bransSayisi}</strong> branş · yıllık toplam{" "}
            <strong>{fmt(ozet.toplamYillik)} TL</strong>
          </p>
        )}
      </section>

      {satirlar.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            {durum.butceYili} aylık prim dağılımı (branş × ay)
          </h2>
          <div className="mt-3 overflow-x-auto max-h-[520px]">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th className="py-2 pr-2">Kod</th>
                  <th className="py-2 pr-2">Branş</th>
                  {AYLAR.map((ay) => (
                    <th key={ay} className="py-2 pr-2 whitespace-nowrap">{ay}</th>
                  ))}
                  <th className="py-2">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {satirlar
                  .filter((r) => r.toplam > 0)
                  .map((r) => {
                    const info = HAZINE_BRANS_KODLARI[r.bransKodu] ?? ["", r.bransKodu, ""];
                    return (
                      <tr key={r.bransKodu} className="border-b border-slate-100">
                        <td className="py-1 pr-2 font-mono text-xs">{r.bransKodu}</td>
                        <td className="py-1 pr-2 max-w-[140px] truncate">{info[1]}</td>
                        {r.aylar.map((v, i) => (
                          <td key={i} className="py-1 pr-2 text-slate-700 whitespace-nowrap">
                            {fmt(v)}
                          </td>
                        ))}
                        <td className="py-1 font-medium">{fmt(r.toplam)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
