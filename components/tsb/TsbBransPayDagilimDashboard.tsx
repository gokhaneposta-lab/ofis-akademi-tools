"use client";

import { useEffect, useMemo, useState } from "react";
import BransPrimPayStrip from "@/components/tsb/BransPrimPayStrip";
import { useTsbBranchLookupFetch } from "@/components/tsb/useTsbBranchLookup";
import { buildBransPrimPayDilimleriTekDonem, listSirketlerBransDashboard } from "@/lib/tsbBransDegisim";
import type { TsbKanalField, TsbPrimDaraltmaModu, TsbPrimRow } from "@/lib/tsbPrimDashboard";
import {
  daraltmaFromUiState,
  isTsbToplamSirketKodu,
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

export default function TsbBransPayDagilimDashboard() {
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
    return listSirketlerBransDashboard(rows, secilenDonem, kanal, daraltma);
  }, [rows, secilenDonem, kanal, daraltma]);

  useEffect(() => {
    if (sirketler.length === 0) return;
    if (sirketKodu === "" || !sirketler.some((s) => s.kod === sirketKodu)) {
      const kod = resolveDefaultSirketKodu(sirketler, "hayatdisi");
      if (kod !== null) setSirketKodu(kod);
    }
  }, [sirketler, sirketKodu]);

  const effectiveSirketKodu = useMemo(() => {
    if (sirketler.length === 0) return null;
    if (sirketKodu !== "" && sirketler.some((s) => s.kod === sirketKodu)) return sirketKodu as number;
    return resolveDefaultSirketKodu(sirketler, "hayatdisi");
  }, [sirketler, sirketKodu]);

  const dilimler = useMemo(() => {
    if (!rows || !secilenDonem || effectiveSirketKodu === null) return [];
    return buildBransPrimPayDilimleriTekDonem(rows, secilenDonem, kanal, effectiveSirketKodu, daraltma);
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

  if (sirketler.length === 0 || effectiveSirketKodu === null) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
        Bu kanal ve dönem için şirket seçilemiyor.
      </div>
    );
  }

  const secilenAd = sirketler.find((s) => s.kod === effectiveSirketKodu)?.ad ?? "";
  const kirilimAciklama =
    filtreModu === "anaBransH"
      ? "TSB ana branşları (hayat dışı + hayat–emeklilik)"
      : "Tarife grubu satırları (aynı veri kırılımı)";

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
        <p className="mt-2 text-[11px] text-gray-600">{kirilimAciklama}. Tek tek branş daraltması bu sayfada yok; tüm satırlar gösterilir.</p>
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
            value={String(effectiveSirketKodu)}
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
          <span className="mb-1.5 block font-medium text-gray-700">Rapor ayı (tek dönem)</span>
          <select
            value={secilenDonem}
            onChange={(e) => setDonem(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {donemler.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      <BransPrimPayStrip dilimler={dilimler} sirketAdi={secilenAd} donemEtiket={secilenDonem} />
    </div>
  );
}
