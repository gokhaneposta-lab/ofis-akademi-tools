"use client";

import { useEffect, useMemo, useState } from "react";
import type { TsbKanalField, TsbPrimRow, TsbSektorSegment } from "@/lib/tsbPrimDashboard";
import {
  buildKiyaslamaTablosu,
  isTsbToplamSirketKodu,
  sektorToplamDegisimYuzde,
  uniqueAnaBransForSegment,
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

  const [segment, setSegment] = useState<TsbSektorSegment>("hayatdisi");
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
        const cleaned = data.filter((row) => !isTsbToplamSirketKodu(row.sirketKodu));
        setRows(cleaned);
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
  const secilenDonem = donem || sonDonem;

  const anaBransSecenekleri = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return uniqueAnaBransForSegment(rows, secilenDonem, segment);
  }, [rows, secilenDonem, segment]);

  const tablo = useMemo(() => {
    if (!rows || !secilenDonem) return null;
    return buildKiyaslamaTablosu(rows, secilenDonem, kanal, anaBrans || null, segment);
  }, [rows, secilenDonem, kanal, anaBrans, segment]);

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

  const tumAnaBransLabel =
    segment === "hayatdisi"
      ? "Tümü (hayat dışı · HD, kod 3… hariç)"
      : "Tümü (hayat-emeklilik · kod 3… veya tip H)";

  const toplamDegisim =
    tablo !== null
      ? sektorToplamDegisimYuzde(tablo.sektorToplamOnceki, tablo.sektorToplamBu)
      : null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Sektör görünümü</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={segment === "hayatdisi"}
            onClick={() => {
              setSegment("hayatdisi");
              setAnaBrans("");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              segment === "hayatdisi"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Hayat dışı
          </button>
          <button
            type="button"
            aria-pressed={segment === "hayat"}
            onClick={() => {
              setSegment("hayat");
              setAnaBrans("");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              segment === "hayat"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Hayat &amp; emeklilik
          </button>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-gray-600">
          Hayat-emeklilik: şirket kodu <strong>3</strong> ile başlayanlar veya şirket tipi <strong>H</strong>. Hayat
          dışı: tip <strong>HD</strong> ve kodu <strong>3</strong> ile başlamayan şirketler.
        </p>
      </div>

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
            <option value="">{tumAnaBransLabel}</option>
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
            Önceki yıl karşılaştırması: <strong>{tablo.donemOnceki ?? "—"}</strong>. Tablonun alt satırında seçili
            filtrelerdeki tüm şirketlerin prim toplamı yer alır (pay sütunları %100).
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
              <tfoot>
                <tr className="border-t-2 border-emerald-600 bg-emerald-50/95 font-semibold text-gray-900">
                  <td className="px-3 py-2.5 text-gray-500" colSpan={2}>
                    —
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">—</td>
                  <td className="px-3 py-2.5">TOPLAM</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{nf.format(tablo.sektorToplamOnceki)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-emerald-900">{pf.format(100)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{nf.format(tablo.sektorToplamBu)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-emerald-900">{pf.format(100)}</td>
                  <td
                    className={`px-3 py-2.5 text-right tabular-nums ${
                      toplamDegisim === null
                        ? "text-gray-600"
                        : toplamDegisim < 0
                          ? "text-red-700"
                          : "text-emerald-800"
                    }`}
                  >
                    {toplamDegisim === null ? "—" : pf.format(toplamDegisim)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
