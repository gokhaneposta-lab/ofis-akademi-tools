"use client";

import { useEffect, useMemo, useState } from "react";
import { useTsbBranchLookupFetch } from "@/components/tsb/useTsbBranchLookup";
import type { BransSiraSatir } from "@/lib/tsbBransSira";
import { buildBransSiraTablosu, listSirketlerSiraOzeti } from "@/lib/tsbBransSira";
import type { TsbKanalField, TsbPrimDaraltmaModu, TsbPrimRow } from "@/lib/tsbPrimDashboard";
import {
  daraltmaFromUiState,
  isTsbToplamSirketKodu,
  prevYearPeriod,
  resolveDefaultSirketKodu,
  uniqueSortedPeriods,
} from "@/lib/tsbPrimDashboard";

const KANALLAR: { value: TsbKanalField; label: string }[] = [
  { value: "genelToplam", label: "Tüm kanallar" },
  { value: "acente", label: "Acente" },
  { value: "banka", label: "Banka" },
  { value: "broker", label: "Broker" },
  { value: "diger", label: "Diğer" },
  { value: "merkez", label: "Merkez" },
];

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

function deltaRenk(delta: number | null): string {
  if (delta === null) return "text-gray-600";
  if (delta < 0) return "text-emerald-700 font-semibold";
  if (delta > 0) return "text-red-600 font-semibold";
  return "text-gray-800 font-medium";
}

function deltaMetin(delta: number | null): string {
  if (delta === null) return "—";
  if (delta === 0) return "0";
  const arrow = delta < 0 ? "↑" : "↓";
  return `${arrow} ${Math.abs(delta)}`;
}

function agirlikHucre(v: number | null): string {
  if (v === null) return "—";
  return `${pf.format(v)}%`;
}

function Satir({
  satir,
  portfoy,
}: {
  satir: BransSiraSatir;
  portfoy?: boolean;
}) {
  const rowCls = portfoy ? "bg-slate-100 font-semibold" : "bg-white";
  const stickyBg = portfoy ? "bg-slate-100" : "bg-white";
  const siraBuStr =
    satir.siraBu !== null ? `${satir.siraBu} / ${satir.katilimciBu}` : "—";
  const siraOcStr =
    satir.siraOnceki !== null ? `${satir.siraOnceki} / ${satir.katilimciOnceki}` : "—";

  return (
    <tr className={`border-b border-gray-200 ${rowCls}`}>
      <td className={`sticky left-0 z-10 whitespace-nowrap border-r border-gray-200 px-2 py-2 text-xs ${stickyBg}`}>
        {satir.anaBransH}
      </td>
      <td className="px-2 py-2 text-right text-[11px] tabular-nums text-gray-800">{nf.format(satir.prim)}</td>
      <td className="px-2 py-2 text-right text-[11px] tabular-nums text-gray-700">{agirlikHucre(satir.sirketAgirlikBuYuzde)}</td>
      <td className="px-2 py-2 text-right text-[11px] tabular-nums text-gray-700">{agirlikHucre(satir.sektorAgirlikBuYuzde)}</td>
      <td className="px-2 py-2 text-center text-[11px] tabular-nums font-medium text-gray-900">{siraBuStr}</td>
      <td className="px-2 py-2 text-center text-[11px] tabular-nums text-gray-700">{siraOcStr}</td>
      <td className={`px-2 py-2 text-center text-[11px] tabular-nums ${deltaRenk(satir.siraDelta)}`}>
        {deltaMetin(satir.siraDelta)}
      </td>
    </tr>
  );
}

export default function TsbBransSiraDashboard() {
  const [rows, setRows] = useState<TsbPrimRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [donem, setDonem] = useState("");
  const [kanal, setKanal] = useState<TsbKanalField>("genelToplam");
  const [filtreModu, setFiltreModu] = useState<TsbPrimDaraltmaModu>("anaBransH");
  const [sirketKodu, setSirketKodu] = useState<number | "">("");

  const branchLookup = useTsbBranchLookupFetch();

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
        setRows(data.filter((row) => !isTsbToplamSirketKodu(row.sirketKodu)));
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

  const daraltma = useMemo(
    () => daraltmaFromUiState(filtreModu, "", "", branchLookup),
    [filtreModu, branchLookup],
  );

  const sirketler = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return listSirketlerSiraOzeti(rows, secilenDonem, kanal, daraltma);
  }, [rows, secilenDonem, kanal, daraltma]);

  useEffect(() => {
    if (sirketler.length === 0) return;
    if (sirketKodu === "" || !sirketler.some((s) => s.kod === sirketKodu)) {
      const kod = resolveDefaultSirketKodu(sirketler, "any");
      if (kod !== null) setSirketKodu(kod);
    }
  }, [sirketler, sirketKodu]);

  const effectiveSirketKodu = useMemo(() => {
    if (sirketler.length === 0) return null;
    if (sirketKodu !== "" && sirketler.some((s) => s.kod === sirketKodu)) return sirketKodu as number;
    return resolveDefaultSirketKodu(sirketler, "any");
  }, [sirketler, sirketKodu]);

  const tablo = useMemo(() => {
    if (!rows || !secilenDonem || effectiveSirketKodu === null) return null;
    return buildBransSiraTablosu(rows, secilenDonem, kanal, effectiveSirketKodu, daraltma);
  }, [rows, secilenDonem, kanal, effectiveSirketKodu, daraltma]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
    );
  }

  if (!rows) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600">
        Veri yükleniyor…
      </div>
    );
  }

  if (sirketler.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
        Bu kanal ve dönem için şirket verisi bulunamadı.
      </div>
    );
  }

  if (!tablo) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
        Seçilen dönem için önceki yılın aynı ayı bulunamadığından sıra tablosu oluşturulamıyor.
      </div>
    );
  }

  const secilenAd = sirketler.find((s) => s.kod === effectiveSirketKodu)?.ad ?? "";
  const kolonBaslik = tablo.kirisumModu === "anaBransH" ? "Branş" : "Tarife grubu";
  const gosterHd = tablo.hayatdisiPortfoy.prim > 0;
  const gosterHy = tablo.hayatPortfoy.prim > 0;
  const colSpanSection = 7;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Daraltma türü</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={filtreModu === "anaBransH"}
            onClick={() => setFiltreModu("anaBransH")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              filtreModu === "anaBransH"
                ? "bg-slate-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Ana branş (TSB)
          </button>
          <button
            type="button"
            aria-pressed={filtreModu === "tarifeGrubu"}
            onClick={() => setFiltreModu("tarifeGrubu")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              filtreModu === "tarifeGrubu"
                ? "bg-slate-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tarife grubu
          </button>
        </div>
        <p className="mt-2 text-[11px] text-gray-600">
          Satır listesi yalnızca ana branş veya tarife moduna göre değişir. Hayat dışı üretimi olmayan şirketlerde{" "}
          <strong>TRAFİK HARİÇ TOPLAM</strong> satırı gösterilmez.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block font-medium text-gray-700">Şirket</span>
          <select
            value={effectiveSirketKodu !== null ? String(effectiveSirketKodu) : ""}
            onChange={(e) => setSirketKodu(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {sirketler.map((s) => (
              <option key={s.kod} value={s.kod}>
                {s.ad} ({s.kod})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm sm:col-span-3">
          <span className="mb-1.5 block font-medium text-gray-700">Dönem</span>
          <select
            value={secilenDonem}
            onChange={(e) => setDonem(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {donemler.map((d) => (
              <option key={d} value={d}>
                {d} · sıra kıyası {prevYearPeriod(d) ?? "—"}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-gray-500">
            Sıralar <strong>{tablo.donemBu}</strong> ve <strong>{tablo.donemOnceki}</strong> primlerine göre hesaplanır
            (prim &gt; 0 olan şirketler arasında).
          </p>
        </label>
      </div>

      <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] leading-relaxed text-gray-600">
        <strong>Sıra:</strong> İlgili satırda seçilen kanaldaki prim üretimine göre sektör içi yarışma sırası (1 en yüksek
        prim). <strong>Δ sıra:</strong> Önceki yıla göre sıra farkı; sayının{" "}
        <span className="text-emerald-700">azalması</span> iyileşmedir (↑ gösterilir). Üretim yoksa (prim 0) sıra gösterilmez.
        <strong className="ml-1">Branş ağırlığı</strong> ({tablo.donemBu}
        ): satır priminin şirketin ilgili segment portföy toplamına oranı. <strong>Sektör ağırlığı</strong>: aynı branşın
        sektör segment primine oranı.
      </p>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-[920px] w-full border-collapse text-left text-[11px]">
          <thead>
            <tr className="border-b border-gray-300 bg-slate-800 text-white">
              <th className="sticky left-0 z-20 border-r border-slate-600 bg-slate-800 px-2 py-2 font-semibold">
                {kolonBaslik}
              </th>
              <th className="px-2 py-2 text-right font-semibold">
                Prim ({tablo.donemBu}) · {secilenAd.slice(0, 22)}
                {secilenAd.length > 22 ? "…" : ""}
              </th>
              <th className="px-2 py-2 text-right font-semibold">Branş ağırlığı</th>
              <th className="px-2 py-2 text-right font-semibold">Sektör ağırlığı</th>
              <th className="px-2 py-2 text-center font-semibold">Sıra ({tablo.donemBu})</th>
              <th className="px-2 py-2 text-center font-semibold">Sıra ({tablo.donemOnceki})</th>
              <th className="px-2 py-2 text-center font-semibold">Δ sıra</th>
            </tr>
          </thead>
          <tbody>
            {gosterHd && (
              <>
                <tr className="bg-emerald-50">
                  <td colSpan={colSpanSection} className="px-2 py-2 text-[11px] font-bold uppercase tracking-wide text-emerald-900">
                    Hayat dışı {tablo.kirisumModu === "tarifeGrubu" ? "(tarife)" : "branşları"}
                  </td>
                </tr>
                {tablo.hayatdisiBranslar.map((s) => (
                  <Satir key={`hd-${s.anaBransH}`} satir={s} />
                ))}
                {tablo.hayatdisiTrafikHaricPortfoy && (
                  <Satir satir={tablo.hayatdisiTrafikHaricPortfoy} portfoy />
                )}
                <Satir satir={tablo.hayatdisiPortfoy} portfoy />
              </>
            )}
            {gosterHy && (
              <>
                <tr className="bg-sky-50">
                  <td colSpan={colSpanSection} className="px-2 py-2 text-[11px] font-bold uppercase tracking-wide text-sky-900">
                    Hayat &amp; emeklilik {tablo.kirisumModu === "tarifeGrubu" ? "(tarife)" : "branşları"}
                  </td>
                </tr>
                {tablo.hayatBranslar.map((s) => (
                  <Satir key={`hy-${s.anaBransH}`} satir={s} />
                ))}
                <Satir satir={tablo.hayatPortfoy} portfoy />
              </>
            )}
            {!gosterHd && !gosterHy && (
              <tr>
                <td colSpan={colSpanSection} className="px-3 py-6 text-center text-gray-600">
                  Bu kanal ve ay için şirketin hayat dışı veya hayat–emeklilik üretimi görünmüyor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
