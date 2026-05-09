"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildSon12AyPrimTrend,
  type PrimTrend12Nokta,
  type PrimTrendFiltreModu,
  type PrimTrendFilter,
} from "@/lib/tsbPrimTrend12";
import type { TsbKanalField, TsbPrimRow, TsbSektorSegment } from "@/lib/tsbPrimDashboard";
import {
  ANA_BRANS_FILTER_TRAFIK_HARIC,
  ANA_BRANS_FILTER_TRAFIK_HARIC_LABEL,
  isTsbToplamSirketKodu,
  listSirketlerSegmentDonem,
  resolveDefaultSirketKodu,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC_LABEL,
  uniqueAnaBransForSegment,
  uniqueSortedPeriods,
  uniqueTarifeGruplariForSegment,
} from "@/lib/tsbPrimDashboard";
import { useTsbBranchLookupFetch } from "@/components/tsb/useTsbBranchLookup";

const KANALLAR: { value: TsbKanalField; label: string }[] = [
  { value: "genelToplam", label: "Tüm kanallar" },
  { value: "acente", label: "Acente" },
  { value: "banka", label: "Banka" },
  { value: "broker", label: "Broker" },
  { value: "diger", label: "Diğer" },
  { value: "merkez", label: "Merkez" },
];

const nfMn = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0, minimumFractionDigits: 0 });
const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

const COL_SEKTOR = "#dc2626";
const COL_SIRKET = "#059669";

function fmtMnLab(v: number): string {
  return nfMn.format(v / 1e6);
}

function TrendSvg({
  seri,
  sirketAdi,
  logOlcek,
}: {
  seri: PrimTrend12Nokta[];
  sirketAdi: string;
  logOlcek: boolean;
}) {
  const W = 780;
  const H = 380;
  const pad = { l: 60, r: 28, t: 44, b: 62 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const allRaw = seri.flatMap((p) => [p.sektor, p.sirket]);
  const maxRaw = Math.max(...allRaw, 1);

  let yAt: (v: number) => number;
  let tickVals: number[];

  if (!logOlcek) {
    const hi = maxRaw * 1.08;
    tickVals = [0, 0.25, 0.5, 0.75, 1].map((t) => hi * t);
    yAt = (v: number) => pad.t + innerH - (Math.min(Math.max(v, 0), hi) / hi) * innerH;
  } else {
    const pos = allRaw.filter((x) => x > 0);
    const floor = pos.length ? Math.min(...pos) * 0.28 : 1e6;
    const ceil = Math.max(maxRaw, floor * 5);
    const lo = Math.log10(Math.max(floor, 100));
    const hiL = Math.log10(Math.max(ceil, floor + 1));
    const span = hiL - lo || 1e-9;
    yAt = (v: number) => {
      const vv = v <= 0 ? floor * 0.45 : Math.max(v, floor * 0.45);
      return pad.t + innerH - (Math.log10(vv) - lo) / span * innerH;
    };
    tickVals = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.pow(10, lo + (hiL - lo) * t));
  }

  const n = seri.length;
  const xAt = (i: number) => pad.l + (i / Math.max(n - 1, 1)) * innerW;

  function bandBounds(i: number): [number, number] {
    if (n <= 1) return [pad.l, pad.l + innerW];
    const xi = xAt(i);
    const left = i === 0 ? pad.l : (xAt(i - 1) + xi) / 2;
    const right = i === n - 1 ? pad.l + innerW : (xi + xAt(i + 1)) / 2;
    return [left, right];
  }

  const ptsSektor = seri.map((p, i) => `${xAt(i)},${yAt(p.sektor)}`).join(" ");
  const ptsSirket = seri.map((p, i) => `${xAt(i)},${yAt(p.sirket)}`).join(" ");

  const adKisa = sirketAdi.length > 40 ? `${sirketAdi.slice(0, 38)}…` : sirketAdi;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-full" role="img" aria-label="Son dönem prim trendi">
      <rect width={W} height={H} fill="#fafafa" />
      <text x={pad.l} y={24} fill="#374151" fontSize={12} fontWeight={600}>
        Aylık prim (Mn ₺){logOlcek ? " · logaritmik eksen" : " · doğrusal eksen"}
      </text>
      <text x={pad.l} y={40} fontSize={10}>
        <tspan fill={COL_SEKTOR} fontWeight={700}>
          Sektör
        </tspan>
        <tspan fill="#64748b"> — kırmızı çizgi · </tspan>
        <tspan fill={COL_SIRKET} fontWeight={700}>
          {adKisa}
        </tspan>
        <tspan fill="#64748b"> — yeşil çizgi (üstte Mn ₺, altta pay %)</tspan>
      </text>

      {seri.map((p, i) => {
        const [left, right] = bandBounds(i);
        const w = Math.max(right - left, 0);
        const stripe = i % 2 === 0 ? "#ffffff" : "#f1f5f9";
        return (
          <rect
            key={`band-${p.donem}`}
            x={left}
            y={pad.t}
            width={w}
            height={innerH}
            fill={stripe}
            stroke="#e2e8f0"
            strokeWidth={0.75}
          />
        );
      })}

      <line x1={pad.l} y1={pad.t + innerH} x2={pad.l + innerW} y2={pad.t + innerH} stroke="#94a3b8" strokeWidth={1} />
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + innerH} stroke="#94a3b8" strokeWidth={1} />

      {tickVals.map((tv, ti) => {
        const y = yAt(tv);
        return (
          <g key={`tg-${ti}`}>
            <line x1={pad.l} y1={y} x2={pad.l + innerW} y2={y} stroke="#e2e8f0" strokeWidth={1} />
            <text x={pad.l - 6} y={y + 4} textAnchor="end" fill="#64748b" fontSize={9}>
              {fmtMnLab(tv)}
            </text>
          </g>
        );
      })}

      <polyline fill="none" stroke={COL_SEKTOR} strokeWidth={2.35} points={ptsSektor} strokeLinejoin="round" />
      <polyline fill="none" stroke={COL_SIRKET} strokeWidth={2.35} points={ptsSirket} strokeLinejoin="round" />

      {seri.map((p, i) => (
        <g key={p.donem}>
          <circle cx={xAt(i)} cy={yAt(p.sektor)} r={3.5} fill={COL_SEKTOR} stroke="#fff" strokeWidth={1} />
          <circle cx={xAt(i)} cy={yAt(p.sirket)} r={3.5} fill={COL_SIRKET} stroke="#fff" strokeWidth={1} />
        </g>
      ))}

      {seri.map((p, i) => {
        const xs = xAt(i);
        const ys = yAt(p.sektor);
        const yk = yAt(p.sirket);
        return (
          <g key={`lab-${p.donem}`}>
            <text x={xs} y={ys - 11} textAnchor="middle" fill={COL_SEKTOR} fontSize={8} fontWeight={700}>
              {fmtMnLab(p.sektor)}
            </text>
            <text x={xs} y={yk - 11} textAnchor="middle" fill={COL_SIRKET} fontSize={8} fontWeight={700}>
              {fmtMnLab(p.sirket)}
            </text>
            <text x={xs} y={yk + 15} textAnchor="middle" fill="#065f46" fontSize={8} fontWeight={600}>
              %{pf.format(p.payYuzde)}
            </text>
          </g>
        );
      })}

      {seri.map((p, i) => (
        <text key={`lx-${p.donem}`} x={xAt(i)} y={H - 18} textAnchor="middle" fill="#334155" fontSize={9} fontWeight={600}>
          {p.donem}
        </text>
      ))}
    </svg>
  );
}

export default function TsbPrimTrend12Dashboard() {
  const [rows, setRows] = useState<TsbPrimRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [segment, setSegment] = useState<TsbSektorSegment>("hayatdisi");
  const [donemBitis, setDonemBitis] = useState("");
  const [kanal, setKanal] = useState<TsbKanalField>("genelToplam");
  const [anaBrans, setAnaBrans] = useState("");
  const [filtreModu, setFiltreModu] = useState<PrimTrendFiltreModu>("anaBransH");
  const [tarifeSecim, setTarifeSecim] = useState("");
  const branchLookup = useTsbBranchLookupFetch();
  const [sirketKodu, setSirketKodu] = useState<number | "">("");
  const [logOlcek, setLogOlcek] = useState(true);

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
  const secilenBitis = donemBitis || sonDonem;

  useEffect(() => {
    setAnaBrans("");
    setTarifeSecim("");
  }, [segment]);

  useEffect(() => {
    setAnaBrans("");
    setTarifeSecim("");
  }, [filtreModu]);

  const anaBransSecenekleri = useMemo(() => {
    if (!rows || !secilenBitis) return [];
    return uniqueAnaBransForSegment(rows, secilenBitis, segment);
  }, [rows, secilenBitis, segment]);

  const anaFiltre = anaBrans === "" ? null : anaBrans;

  const tarifeSecenekleri = useMemo(() => {
    if (!rows || !secilenBitis) return [];
    return uniqueTarifeGruplariForSegment(rows, secilenBitis, segment, branchLookup);
  }, [rows, secilenBitis, segment, branchLookup]);

  useEffect(() => {
    if (filtreModu !== "tarifeGrubu" || tarifeSecim === "") return;
    if (tarifeSecim === TARIFE_GRUBU_FILTER_TRAFIK_HARIC) return;
    if (!tarifeSecenekleri.includes(tarifeSecim)) setTarifeSecim("");
  }, [filtreModu, tarifeSecim, tarifeSecenekleri]);

  const trendFilter = useMemo((): PrimTrendFilter => {
    if (filtreModu === "anaBransH") return { kind: "anaBransH", anaBransH: anaFiltre };
    return { kind: "tarifeGrubu", tarifeGrubu: tarifeSecim === "" ? null : tarifeSecim, lookup: branchLookup };
  }, [filtreModu, anaFiltre, tarifeSecim, branchLookup]);

  const sirketler = useMemo(() => {
    if (!rows || !secilenBitis) return [];
    return listSirketlerSegmentDonem(rows, secilenBitis, kanal, segment, trendFilter);
  }, [rows, secilenBitis, kanal, segment, trendFilter]);

  useEffect(() => {
    if (sirketler.length === 0) return;
    if (sirketKodu === "" || !sirketler.some((s) => s.kod === sirketKodu)) {
      const kod = resolveDefaultSirketKodu(sirketler, segment);
      if (kod !== null) setSirketKodu(kod);
    }
  }, [sirketler, sirketKodu, segment]);

  const effectiveSirket = useMemo(() => {
    if (sirketler.length === 0) return null;
    if (sirketKodu !== "" && sirketler.some((s) => s.kod === sirketKodu)) return sirketKodu as number;
    return resolveDefaultSirketKodu(sirketler, segment);
  }, [sirketler, sirketKodu, segment]);

  const sirketAdi = useMemo(() => {
    if (effectiveSirket === null) return "";
    return sirketler.find((s) => s.kod === effectiveSirket)?.ad ?? "";
  }, [sirketler, effectiveSirket]);

  const seri = useMemo(() => {
    if (!rows || effectiveSirket === null) return null;
    return buildSon12AyPrimTrend(rows, donemler, secilenBitis, kanal, segment, effectiveSirket, trendFilter);
  }, [rows, donemler, secilenBitis, kanal, segment, effectiveSirket, trendFilter]);

  const tumBransLabel =
    segment === "hayatdisi" ? "Tüm ana branşlar (hayat dışı)" : "Tüm ana branşlar (hayat–emeklilik)";
  const tumTarifeLabel = "Tüm tarife grupları";

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>;
  }
  if (!rows) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600">
        Veri yükleniyor…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Görünüm</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={segment === "hayatdisi"}
            onClick={() => setSegment("hayatdisi")}
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
            onClick={() => setSegment("hayat")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              segment === "hayat"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Hayat &amp; emeklilik
          </button>
        </div>
        <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-gray-500">Branş filtresi türü</p>
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
        <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-gray-500">Eksen</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={logOlcek}
            onClick={() => setLogOlcek(true)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              logOlcek ? "bg-slate-700 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Logaritmik (önerilen)
          </button>
          <button
            type="button"
            aria-pressed={!logOlcek}
            onClick={() => setLogOlcek(false)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              !logOlcek ? "bg-slate-700 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Doğrusal
          </button>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-gray-600">
          Seçtiğiniz <strong>bitiş ayına</strong> kadar geriye dönük en fazla <strong>12 ay</strong> gösterilir. Primler{" "}
          <strong>tam sayı milyon ₺</strong>; şirket için üstte Mn, altta <strong>pay %</strong>. Sektör çizgisi{" "}
          <strong className="text-red-600">kırmızı</strong>, şirket <strong className="text-emerald-700">yeşil</strong>. Aylar
          için grafikte alternatif dikey şeritler kullanılır. Küçük primler için varsayılan eksen{" "}
          <strong>logaritmik</strong>dir.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-gray-700">Bitiş ayı (pencerenin sonu)</span>
          <select
            value={secilenBitis}
            onChange={(e) => setDonemBitis(e.target.value)}
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
        <label className="block text-sm sm:col-span-2 lg:col-span-1">
          <span className="mb-1.5 block font-medium text-gray-700">
            {filtreModu === "anaBransH" ? "Ana branş filtresi" : "Tarife grubu filtresi"}
          </span>
          {filtreModu === "anaBransH" ? (
            <select
              value={anaBrans}
              onChange={(e) => setAnaBrans(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="">{tumBransLabel}</option>
              {segment === "hayatdisi" && (
                <option value={ANA_BRANS_FILTER_TRAFIK_HARIC}>{ANA_BRANS_FILTER_TRAFIK_HARIC_LABEL}</option>
              )}
              {anaBransSecenekleri.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={tarifeSecim}
              onChange={(e) => setTarifeSecim(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="">{tumTarifeLabel}</option>
              {segment === "hayatdisi" && (
                <option value={TARIFE_GRUBU_FILTER_TRAFIK_HARIC}>{TARIFE_GRUBU_FILTER_TRAFIK_HARIC_LABEL}</option>
              )}
              {tarifeSecenekleri.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </label>
        <label className="block text-sm sm:col-span-2 lg:col-span-3">
          <span className="mb-1.5 block font-medium text-gray-700">Şirket (yeşil çizgi)</span>
          <select
            value={effectiveSirket !== null ? String(effectiveSirket) : ""}
            onChange={(e) => setSirketKodu(Number(e.target.value))}
            className="w-full max-w-2xl rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {sirketler.map((s) => (
              <option key={s.kod} value={s.kod}>
                {s.ad} ({s.kod})
              </option>
            ))}
          </select>
        </label>
      </div>

      {seri && seri.length > 0 && sirketAdi && (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <TrendSvg seri={seri} sirketAdi={sirketAdi} logOlcek={logOlcek} />
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-[640px] w-full border-collapse text-left text-[11px]">
              <thead>
                <tr className="border-b border-gray-300 bg-slate-800 text-white">
                  <th className="px-3 py-2 font-semibold">Dönem</th>
                  <th className="px-3 py-2 text-right font-semibold">Sektör (Mn ₺)</th>
                  <th className="px-3 py-2 text-right font-semibold">Şirket (Mn ₺)</th>
                  <th className="px-3 py-2 text-right font-semibold">Şirket payı (%)</th>
                </tr>
              </thead>
              <tbody>
                {seri.map((p) => (
                  <tr key={p.donem} className="border-b border-gray-100 bg-white">
                    <td className="px-3 py-2 font-medium tabular-nums">{p.donem}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-700">{nfMn.format(p.sektor / 1e6)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-emerald-800">{nfMn.format(p.sirket / 1e6)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-800">{pf.format(p.payYuzde)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
