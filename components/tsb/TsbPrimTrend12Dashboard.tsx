"use client";

import { useEffect, useMemo, useState } from "react";
import { buildSon12AyPrimTrend, type PrimTrend12Nokta } from "@/lib/tsbPrimTrend12";
import type { TsbKanalField, TsbPrimRow, TsbSektorSegment } from "@/lib/tsbPrimDashboard";
import {
  ANA_BRANS_FILTER_TRAFIK_HARIC,
  ANA_BRANS_FILTER_TRAFIK_HARIC_LABEL,
  isTsbToplamSirketKodu,
  listSirketlerSegmentDonem,
  resolveDefaultSirketKodu,
  uniqueAnaBransForSegment,
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

const nfMn = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1, minimumFractionDigits: 0 });
const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

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
  const pad = { l: 60, r: 32, t: 44, b: 62 };
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
    const floor = pos.length ? Math.min(...pos) * 0.32 : 1e6;
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

  const xAt = (i: number) => pad.l + (i / Math.max(seri.length - 1, 1)) * innerW;

  const ptsSektor = seri.map((p, i) => `${xAt(i)},${yAt(p.sektor)}`).join(" ");
  const ptsSirket = seri.map((p, i) => `${xAt(i)},${yAt(p.sirket)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-full" role="img" aria-label="Son dönem prim trendi">
      <rect width={W} height={H} fill="white" />
      <text x={pad.l} y={24} fill="#374151" fontSize={12} fontWeight={600}>
        Aylık prim (Mn ₺){logOlcek ? " · logaritmik eksen" : " · doğrusal eksen"}
      </text>
      <text x={pad.l} y={40} fill="#6b7280" fontSize={10}>
        Gri: sektör · Yeşil: {sirketAdi.slice(0, 42)}
        {sirketAdi.length > 42 ? "…" : ""}
      </text>

      <line x1={pad.l} y1={pad.t + innerH} x2={pad.l + innerW} y2={pad.t + innerH} stroke="#cbd5e1" strokeWidth={1} />
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + innerH} stroke="#cbd5e1" strokeWidth={1} />

      {tickVals.map((tv, ti) => {
        const y = yAt(tv);
        return (
          <g key={`tg-${ti}`}>
            <line x1={pad.l} y1={y} x2={pad.l + innerW} y2={y} stroke="#f1f5f9" strokeWidth={1} />
            <text x={pad.l - 6} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize={9}>
              {fmtMnLab(tv)}
            </text>
          </g>
        );
      })}

      <polyline fill="none" stroke="#64748b" strokeWidth={2.25} points={ptsSektor} strokeLinejoin="round" />
      <polyline fill="none" stroke="#059669" strokeWidth={2.25} points={ptsSirket} strokeLinejoin="round" />

      {seri.map((p, i) => (
        <g key={p.donem}>
          <circle cx={xAt(i)} cy={yAt(p.sektor)} r={3.5} fill="#64748b" />
          <circle cx={xAt(i)} cy={yAt(p.sirket)} r={3.5} fill="#059669" />
        </g>
      ))}

      {seri.map((p, i) => {
        const xs = xAt(i);
        const ys = yAt(p.sektor);
        const yk = yAt(p.sirket);
        const stagger = i % 2 === 0 ? 1 : -1;
        return (
          <g key={`lab-${p.donem}`}>
            <text x={xs} y={ys - 10} textAnchor="middle" fill="#475569" fontSize={8} fontWeight={600}>
              {fmtMnLab(p.sektor)}
            </text>
            <text
              x={xs + stagger * 22}
              y={yk + 14 + stagger * 6}
              textAnchor="middle"
              fill="#047857"
              fontSize={8}
              fontWeight={600}
            >
              {`${fmtMnLab(p.sirket)} · %${pf.format(p.payYuzde)}`}
            </text>
          </g>
        );
      })}

      {seri.map((p, i) => (
        <text key={`lx-${p.donem}`} x={xAt(i)} y={H - 20} textAnchor="middle" fill="#475569" fontSize={9}>
          {p.donem}
        </text>
      ))}

      <g transform={`translate(${pad.l + innerW - 172}, ${pad.t + 8})`}>
        <rect width={164} height={52} rx={6} fill="#f8fafc" stroke="#e2e8f0" />
        <line x1={10} y1={18} x2={30} y2={18} stroke="#64748b" strokeWidth={2.5} />
        <text x={36} y={22} fill="#374151" fontSize={10}>
          Sektör (etiket: Mn ₺)
        </text>
        <line x1={10} y1={38} x2={30} y2={38} stroke="#059669" strokeWidth={2.5} />
        <text x={36} y={42} fill="#374151" fontSize={10}>
          Şirket (Mn · pay %)
        </text>
      </g>
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
  }, [segment]);

  const anaBransSecenekleri = useMemo(() => {
    if (!rows || !secilenBitis) return [];
    return uniqueAnaBransForSegment(rows, secilenBitis, segment);
  }, [rows, secilenBitis, segment]);

  const anaFiltre = anaBrans === "" ? null : anaBrans;

  const sirketler = useMemo(() => {
    if (!rows || !secilenBitis) return [];
    return listSirketlerSegmentDonem(rows, secilenBitis, kanal, segment);
  }, [rows, secilenBitis, kanal, segment]);

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
    return buildSon12AyPrimTrend(rows, donemler, secilenBitis, kanal, anaFiltre, segment, effectiveSirket);
  }, [rows, donemler, secilenBitis, kanal, anaFiltre, segment, effectiveSirket]);

  const tumBransLabel =
    segment === "hayatdisi" ? "Tüm ana branşlar (hayat dışı)" : "Tüm ana branşlar (hayat–emeklilik)";

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
          Seçtiğiniz <strong>bitiş ayına</strong> kadar geriye dönük en fazla <strong>12 ay</strong> gösterilir. Grafik ve etiketler{" "}
          <strong>milyon TL</strong> üzerinden; şirket etiketinde <strong>sektör içi pay %</strong> de yer alır. Küçük primler sıfıra
          yapışmasın diye varsayılan eksen <strong>logaritmik</strong>dir (Excel’deki log ölçeğe benzer).
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
          <span className="mb-1.5 block font-medium text-gray-700">Ana branş filtresi</span>
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
