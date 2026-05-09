"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { buildPrimWaterfall, type PrimWaterfallGrup, type PrimWaterfallModel } from "@/lib/tsbPrimWaterfall";
import type { TsbBranchLookupMap } from "@/lib/tsbBranchLookup";
import { parseBranchLookupJson } from "@/lib/tsbBranchLookup";
import type { TsbKanalField, TsbPrimRow, TsbSektorSegment } from "@/lib/tsbPrimDashboard";
import {
  ANA_BRANS_FILTER_TRAFIK_HARIC,
  ANA_BRANS_FILTER_TRAFIK_HARIC_LABEL,
  isTsbToplamSirketKodu,
  listSirketlerSegmentDonem,
  prevMonthPeriod,
  prevYearPeriod,
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

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const nfMnTbl = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 0 });

const nfMnChart = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1, minimumFractionDigits: 0 });

function fmtMnShort(x: number): string {
  return `${nfMnChart.format(x / 1e6)} Mn`;
}

function fmtMnDelta(delta: number): string {
  const ab = nfMnChart.format(Math.abs(delta) / 1e6);
  return delta >= 0 ? `+${ab}` : `−${ab}`;
}

function truncateLabel(s: string, max = 30): string {
  const t = s.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function WaterfallSvg({ model }: { model: PrimWaterfallModel }) {
  const colCount = model.deltas.length + 2;
  const W = Math.min(1760, Math.max(880, colCount * 76));
  const H = 430;
  const pad = { l: 64, r: 26, t: 36, b: 138 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const runs = [model.toplamBaslangic];
  let r = model.toplamBaslangic;
  for (const d of model.deltas) {
    r += d.delta;
    runs.push(r);
  }
  const maxV = Math.max(...runs, 0);
  const minV = Math.min(0, ...runs);
  const span = maxV - minV || 1;
  const padV = span * 0.06;
  const lo = minV - padV;
  const hi = maxV + padV;
  const rng = hi - lo || 1;

  const valToY = (v: number) => pad.t + innerH - ((v - lo) / rng) * innerH;

  const nFloat = model.deltas.length;
  const colW = innerW / colCount;

  const pillarFill = "#475569";
  const posFill = "#10b981";
  const negFill = "#f43f5e";

  const els: ReactNode[] = [];

  let cumBefore = model.toplamBaslangic;

  const xLeft = (i: number) => pad.l + i * colW + 4;
  const xRight = (i: number) => pad.l + (i + 1) * colW - 4;
  const cx = (i: number) => pad.l + (i + 0.5) * colW;

  const pillar = (i: number, total: number, fill: string) => {
    const top = valToY(total);
    const bot = valToY(0);
    const h = bot - top;
    els.push(
      <rect
        key={`p-${i}`}
        x={xLeft(i)}
        y={top}
        width={colW - 8}
        height={Math.max(h, 1)}
        rx={4}
        fill={fill}
        opacity={0.92}
      />,
    );
    els.push(
      <text key={`pt-${i}`} x={cx(i)} y={top - 8} textAnchor="middle" fill="#0f172a" fontSize={10} fontWeight={600}>
        {fmtMnShort(total)} ₺
      </text>,
    );
  };

  pillar(0, model.toplamBaslangic, pillarFill);

  for (let j = 0; j < nFloat; j++) {
    const i = j + 1;
    const { delta } = model.deltas[j];
    const cumAfter = cumBefore + delta;
    const yLine = valToY(cumBefore);
    els.push(
      <line
        key={`ln-${j}`}
        x1={xRight(i - 1)}
        y1={yLine}
        x2={xLeft(i)}
        y2={yLine}
        stroke="#94a3b8"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />,
    );

    const top = valToY(Math.max(cumBefore, cumAfter));
    const bot = valToY(Math.min(cumBefore, cumAfter));
    const barH = Math.max(bot - top, 2);
    els.push(
      <rect
        key={`f-${j}`}
        x={xLeft(i)}
        y={top}
        width={colW - 8}
        height={barH}
        rx={4}
        fill={delta >= 0 ? posFill : negFill}
        opacity={0.88}
      />,
    );

    const labY = delta >= 0 ? top - 6 : bot + 14;
    els.push(
      <text
        key={`ft-${j}`}
        x={cx(i)}
        y={labY}
        textAnchor="middle"
        fill={delta >= 0 ? "#065f46" : "#9f1239"}
        fontSize={9}
        fontWeight={700}
      >
        {fmtMnDelta(delta)} ₺
      </text>,
    );

    cumBefore = cumAfter;
  }

  const lastIdx = nFloat + 1;
  const yEndLine = valToY(model.toplamBitis);
  els.push(
    <line
      key="ln-end"
      x1={xRight(nFloat)}
      y1={yEndLine}
      x2={xLeft(lastIdx)}
      y2={yEndLine}
      stroke="#94a3b8"
      strokeWidth={1.5}
      strokeDasharray="4 3"
    />,
  );
  pillar(lastIdx, model.toplamBitis, "#1e40af");

  const labels = [
    `Başlangıç · ${model.donemBaslangic}`,
    ...model.deltas.map((d) => truncateLabel(d.label, 34)),
    `Bitiş · ${model.donemBitis}`,
  ];

  for (let i = 0; i < labels.length; i++) {
    const x = cx(i);
    const y = H - 42;
    els.push(
      <text
        key={`lb-${i}`}
        transform={`translate(${x},${y}) rotate(-52)`}
        textAnchor="end"
        dominantBaseline="middle"
        fill="#334155"
        fontSize={9}
      >
        {labels[i]}
      </text>,
    );
  }

  const grupBaslik =
    model.grup === "tarifeGrubu" ? "Tarife grubu kırılımı · Mn ₺" : "Ana branş (TSB) kırılımı · Mn ₺";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto min-w-[880px] w-full max-w-none" role="img" aria-label="Prim köprü grafiği">
      <rect width={W} height={H} fill="white" />
      <text x={pad.l} y={22} fill="#64748b" fontSize={11}>
        {grupBaslik} — rakamlar milyon TL
      </text>
      {els}
    </svg>
  );
}

export default function TsbPrimWaterfallDashboard() {
  const [rows, setRows] = useState<TsbPrimRow[] | null>(null);
  const [branchLookup, setBranchLookup] = useState<TsbBranchLookupMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [segment, setSegment] = useState<TsbSektorSegment>("hayatdisi");
  const [grupMode, setGrupMode] = useState<PrimWaterfallGrup>("anaBransH");
  const [donemBitis, setDonemBitis] = useState("");
  const [donemBaslangic, setDonemBaslangic] = useState("");
  const [kanal, setKanal] = useState<TsbKanalField>("genelToplam");
  const [anaBrans, setAnaBrans] = useState("");
  const [sirketKodu, setSirketKodu] = useState<number | "">("");
  const [baslangicInitialized, setBaslangicInitialized] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    fetch("/data/tsb/branch-lookup.json")
      .then((r) => {
        if (!r.ok) throw new Error("lookup");
        return r.json();
      })
      .then((raw: Record<string, { anaBrans?: string; tarifeGrubu?: string }>) => {
        if (!cancelled) setBranchLookup(parseBranchLookupJson(raw));
      })
      .catch(() => {
        if (!cancelled) setBranchLookup(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const donemler = useMemo(() => (rows ? uniqueSortedPeriods(rows) : []), [rows]);
  const sonDonem = donemler.length ? donemler[donemler.length - 1] : "";
  const secilenBitis = donemBitis || sonDonem;

  useEffect(() => {
    if (!donemler.length || baslangicInitialized) return;
    const y = prevYearPeriod(secilenBitis);
    if (y && donemler.includes(y)) {
      setDonemBaslangic(y);
    } else {
      const m = prevMonthPeriod(secilenBitis);
      if (m && donemler.includes(m)) setDonemBaslangic(m);
    }
    setBaslangicInitialized(true);
  }, [donemler, secilenBitis, baslangicInitialized]);

  useEffect(() => {
    setAnaBrans("");
    setDonemBaslangic("");
    setBaslangicInitialized(false);
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

  const model = useMemo(() => {
    if (!rows || !donemBaslangic || !secilenBitis || effectiveSirket === null) return null;
    if (!donemler.includes(donemBaslangic) || !donemler.includes(secilenBitis)) return null;
    return buildPrimWaterfall(
      rows,
      donemBaslangic,
      secilenBitis,
      kanal,
      segment,
      anaFiltre,
      effectiveSirket,
      grupMode,
      branchLookup,
    );
  }, [rows, donemBaslangic, secilenBitis, kanal, segment, anaFiltre, effectiveSirket, donemler, grupMode, branchLookup]);

  const setBaslangicYoy = () => {
    const y = prevYearPeriod(secilenBitis);
    if (y && donemler.includes(y)) setDonemBaslangic(y);
  };
  const setBaslangicMom = () => {
    const m = prevMonthPeriod(secilenBitis);
    if (m && donemler.includes(m)) setDonemBaslangic(m);
  };

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
        <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-gray-500">Köprü kırılımı</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={grupMode === "anaBransH"}
            onClick={() => setGrupMode("anaBransH")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              grupMode === "anaBransH"
                ? "bg-slate-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Ana branş (TSB)
          </button>
          <button
            type="button"
            aria-pressed={grupMode === "tarifeGrubu"}
            onClick={() => setGrupMode("tarifeGrubu")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              grupMode === "tarifeGrubu"
                ? "bg-slate-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tarife grubu
          </button>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-gray-600">
          Tarife grubu: önce veri satırındaki <span className="font-medium">tarifeGrubu</span> alanı kullanılır; boşsa{" "}
          <code className="rounded bg-gray-100 px-1 text-[10px]">branch-lookup.json</code> ile tamamlanır. Grafikte rakamlar{" "}
          <strong>milyon TL</strong>; eksen etiketleri eğiktir.
        </p>
        <p className="mt-3 text-[12px] leading-relaxed text-gray-600">
          <strong>Başlangıç</strong> ve <strong>bitiş</strong> dönemini siz seçiyorsunuz; varsayılan yüklemede bitiş son ay,
          başlangıç ise aynı ayın bir önceki yılı (yoksa bir önceki ay). İsterseniz aşağıdan özelleştirin — bu, hem yıllık
          hem aylık kıyas için esneklik verir.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-sm sm:col-span-2 lg:col-span-1">
          <span className="mb-1.5 block font-medium text-gray-700">Bitiş dönemi (“bu” dönem)</span>
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
        <label className="block text-sm sm:col-span-2 lg:col-span-1">
          <span className="mb-1.5 block font-medium text-gray-700">Başlangıç dönemi (karşılaştırma)</span>
          <select
            value={donemBaslangic}
            onChange={(e) => setDonemBaslangic(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="">— Seçin —</option>
            {donemler.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={setBaslangicYoy}
              className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:bg-slate-200"
            >
              Önceki yıl aynı ay
            </button>
            <button
              type="button"
              onClick={setBaslangicMom}
              className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:bg-slate-200"
            >
              Bir önceki ay
            </button>
          </div>
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
        <label className="block text-sm sm:col-span-2">
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
          <span className="mb-1.5 block font-medium text-gray-700">Şirket</span>
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

      {!donemBaslangic && (
        <p className="text-sm text-amber-800">Başlangıç dönemini seçin veya hızlı düğmelerden birini kullanın.</p>
      )}

      {donemBaslangic && model && (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <WaterfallSvg model={model} />
          </div>
          <p className="text-[11px] leading-relaxed text-gray-600">
            Köprü sırası: etkiye göre (mutlak değişim büyükten küçüğe). Ana branşta en fazla <strong>14</strong>, tarife
            grubunda <strong>18</strong> kalem ayrı; kalanlar birleşik “Diğer … (net)” satırında. Başlangıç sütunu{" "}
            <span className="font-medium text-slate-600">gri</span>, artışlar{" "}
            <span className="font-medium text-emerald-700">yeşil</span>, azalışlar{" "}
            <span className="font-medium text-rose-700">kırmızı</span>, bitiş{" "}
            <span className="font-medium text-blue-900">mavi</span>.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-[560px] w-full border-collapse text-left text-[11px]">
              <thead>
                <tr className="border-b border-gray-300 bg-slate-800 text-white">
                  <th className="px-3 py-2 font-semibold">Kalem</th>
                  <th className="px-3 py-2 text-right font-semibold">Mn ₺</th>
                  <th className="px-3 py-2 text-right font-semibold">Tam ₺</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 bg-white">
                  <td className="px-3 py-2 font-medium">Başlangıç toplamı ({model.donemBaslangic})</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">{nfMnTbl.format(model.toplamBaslangic / 1e6)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-600">{nf.format(model.toplamBaslangic)}</td>
                </tr>
                {model.deltas.map((d) => (
                  <tr key={d.label} className="border-b border-gray-100 bg-white">
                    <td className="px-3 py-2">{d.label}</td>
                    <td className={`px-3 py-2 text-right tabular-nums font-semibold ${d.delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {d.delta >= 0 ? "+" : ""}
                      {nfMnTbl.format(d.delta / 1e6)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums ${d.delta >= 0 ? "text-emerald-800/90" : "text-rose-800/90"}`}>
                      {d.delta >= 0 ? "+" : ""}
                      {nf.format(d.delta)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 bg-slate-50 font-semibold">
                  <td className="px-3 py-2">Bitiş toplamı ({model.donemBitis})</td>
                  <td className="px-3 py-2 text-right tabular-nums">{nfMnTbl.format(model.toplamBitis / 1e6)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{nf.format(model.toplamBitis)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
