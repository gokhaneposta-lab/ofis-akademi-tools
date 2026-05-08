"use client";

import { useEffect, useMemo, useState } from "react";
import type { TsbKanalField, TsbPrimRow } from "@/lib/tsbPrimDashboard";
import {
  buildKiyaslamaTablosu,
  uniqueAnaBransForHayatdisi,
  uniqueSortedPeriods,
} from "@/lib/tsbPrimDashboard";

const KANALLAR: { value: TsbKanalField; label: string }[] = [
  { value: "genelToplam", label: "Genel toplam (tüm kanallar)" },
  { value: "acente", label: "Acente" },
  { value: "banka", label: "Banka" },
  { value: "broker", label: "Broker" },
  { value: "diger", label: "Diğer" },
  { value: "merkez", label: "Merkez" },
];

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export default function TsbKanalPrimDashboard() {
  const [rows, setRows] = useState<TsbPrimRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [donem, setDonem] = useState<string>("");
  const [anaBrans, setAnaBrans] = useState<string>("");
  const [kanal, setKanal] = useState<TsbKanalField>("genelToplam");

  useEffect(() => {
    let cancelled = false;
    fetch("/data/tsb/prim-tidy.json")
      .then((r) => {
        if (!r.ok) throw new Error(`Veri yüklenemedi (${r.status})`);
        return r.json();
      })
      .then((data: TsbPrimRow[]) => {
        if (cancelled) return;
        if (!Array.isArray(data)) throw new Error("Geçersiz veri formatı");
        setRows(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Yükleme hatası");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const donemler = useMemo(() => (rows ? uniqueSortedPeriods(rows) : []), [rows]);
  const sonDonem = donemler.length ? donemler[donemler.length - 1] : "";
  /** Boşken en güncel dönem */
  const secilenDonem = donem || sonDonem;

  const anaBransSecenekleri = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return uniqueAnaBransForHayatdisi(rows, secilenDonem);
  }, [rows, secilenDonem]);

  const tablo = useMemo(() => {
    if (!rows || !secilenDonem) return null;
    return buildKiyaslamaTablosu(rows, secilenDonem, kanal, anaBrans || null);
  }, [rows, secilenDonem, kanal, anaBrans]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (!rows) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600">
        Veri yükleniyor…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
        Henüz prim verisi yok. TSB Excel dosyasını içe aktarmak için:{" "}
        <code className="rounded bg-white px-1.5 py-0.5 text-xs">npm run tsb:import-prim -- path/dosya.xlsx</code>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-gray-700">Dönem</span>
          <select
            value={secilenDonem}
            onChange={(e) => {
              setDonem(e.target.value);
              setAnaBrans("");
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {donemler.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-gray-700">Ana branş</span>
          <select
            value={anaBrans}
            onChange={(e) => setAnaBrans(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="">Tümü (hayat dışı)</option>
            {anaBransSecenekleri.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-gray-700">Kanal</span>
          <select
            value={kanal}
            onChange={(e) => setKanal(e.target.value as TsbKanalField)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {KANALLAR.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {tablo && (
        <>
          <p className="text-xs text-gray-500">
            Hayat dışı: <strong>TARİFE GRUBU = HAYAT</strong> satırları hariç. Önceki yıl: aynı ay bir önceki
            takvim yılı ({tablo.donemOnceki ?? "—"}).
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-[900px] w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                  <th className="px-3 py-2.5">Önceki yıl sıra</th>
                  <th className="px-3 py-2.5">Bu yıl sıra</th>
                  <th className="px-3 py-2.5">Şirket kodu</th>
                  <th className="px-3 py-2.5 min-w-[180px]">Şirket adı</th>
                  <th className="px-3 py-2.5 text-right">{tablo.donemOnceki ?? "Önceki"} prim</th>
                  <th className="px-3 py-2.5 text-right">Önceki pay %</th>
                  <th className="px-3 py-2.5 text-right">{secilenDonem} prim</th>
                  <th className="px-3 py-2.5 text-right">Bu yıl pay %</th>
                  <th className="px-3 py-2.5 text-right">Değişim %</th>
                </tr>
              </thead>
              <tbody>
                {tablo.satirlar.map((s) => (
                  <tr key={s.sirketKodu} className="border-b border-gray-100 hover:bg-gray-50/80">
                    <td className="px-3 py-2 tabular-nums text-gray-600">{s.siraOnceki}</td>
                    <td className="px-3 py-2 tabular-nums font-medium text-gray-900">{s.siraBu}</td>
                    <td className="px-3 py-2 tabular-nums">{s.sirketKodu}</td>
                    <td className="px-3 py-2 text-gray-900">{s.sirketAdi}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{nf.format(s.primOnceki)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-600">{pf.format(s.payOncekiYuzde)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium">{nf.format(s.primBu)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{pf.format(s.payBuYuzde)}</td>
                    <td
                      className={`px-3 py-2 text-right tabular-nums font-medium ${
                        s.degisimYuzde === null
                          ? "text-gray-500"
                          : s.degisimYuzde < 0
                            ? "text-red-600"
                            : "text-emerald-700"
                      }`}
                    >
                      {s.degisimYuzde === null ? "—" : `${pf.format(s.degisimYuzde)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">
            Sektör toplamı ({secilenDonem}): <strong>{nf.format(tablo.sektorToplamBu)}</strong>
            {tablo.donemOnceki ? (
              <>
                {" "}
                · Önceki ({tablo.donemOnceki}): <strong>{nf.format(tablo.sektorToplamOnceki)}</strong>
              </>
            ) : null}
          </p>
        </>
      )}
    </div>
  );
}
