"use client";

import { useState } from "react";
import type {
  SektorBransBuyumeSatir,
  SektorGorunumuDonem,
  SektorGorunumuPool,
  SektorPrimSnapshot,
} from "@/lib/tsbSektorGorunumu";
import { TsbSvgTooltip, tsbChartYoyLabel } from "@/components/tsb/TsbChartTooltip";

const W = 860;
const H = 350;
const PAD = { l: 78, r: 24, t: 62, b: 48 };
const COLORS = {
  teknikKar: "#7c3aed",
  yatirimGeliri: "#2563eb",
  faaliyetGideri: "#ea580c",
  vok: "#0f172a",
  HD: "#0f766e",
  HAYAT_EMEKLILIK: "#38bdf8",
  bransBu: "#0f766e",
  bransOnceki: "#94a3b8",
};

const tl = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

function fmtMr(v: number): string {
  return `${tl.format(v / 1e9)} Mr`;
}

function xAt(i: number, n: number): number {
  const inner = W - PAD.l - PAD.r;
  return PAD.l + (n <= 1 ? inner / 2 : (i / (n - 1)) * inner);
}

type VokParca = { key: "teknikKar" | "yatirimGeliri" | "faaliyetGideri"; label: string; value: number };

/** Teknik kâr + yatırım geliri + faaliyet gideri → VÖK (yığılmış, işaretli). */
export function TsbSektorKarBilesenleriChart({
  trend,
  pool,
}: {
  trend: SektorGorunumuDonem[];
  pool: SektorGorunumuPool;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const padT = 48;
  const padB = 52;
  const chartH = H + 20;
  const innerH = chartH - padT - padB;
  const innerW = W - PAD.l - PAD.r;
  const band = innerW / Math.max(1, trend.length);
  const barW = Math.min(64, band * 0.55);

  const partsOf = (p: SektorGorunumuDonem): VokParca[] => {
    const s = p[pool];
    return [
      { key: "teknikKar", label: "Teknik kâr", value: s.teknikKar },
      { key: "yatirimGeliri", label: "Yatırım geliri", value: s.yatirimGeliri },
      { key: "faaliyetGideri", label: "Faaliyet gideri", value: s.faaliyetGideri },
    ];
  };

  const extremes = trend.flatMap((p) => {
    const parts = partsOf(p);
    let pos = 0;
    let neg = 0;
    for (const part of parts) {
      if (part.value >= 0) pos += part.value;
      else neg += part.value;
    }
    return [pos, neg, p[pool].vok];
  });
  const max = Math.max(1, ...extremes, 0);
  const min = Math.min(0, ...extremes);
  const span = max - min || 1;
  const yAt = (v: number) => padT + ((max - v) / span) * innerH;
  const y0 = yAt(0);
  const tickBase = Array.from({ length: 5 }, (_, i) => min + (span * i) / 4);
  const ticks = [...new Set([...tickBase.map((t) => Math.round(t / 1e8) * 1e8), 0])].sort((a, b) => a - b);

  const tip =
    hoverIdx !== null
      ? (() => {
          const p = trend[hoverIdx];
          const onceki = hoverIdx > 0 ? trend[hoverIdx - 1] : null;
          const bu = p[pool].vok;
          const onc = onceki ? onceki[pool].vok : null;
          const cx = PAD.l + band * hoverIdx + band / 2;
          return {
            x: Math.min(W - 210, Math.max(PAD.l, cx + 14)),
            y: 8,
            lines: [
              { text: `VÖK · ${p.donem}` },
              { text: fmtMr(bu), muted: true as const },
              {
                text: onceki ? tsbChartYoyLabel(bu, onc) : "Önceki dönem artışı: —",
                accent: true as const,
              },
            ],
          };
        })()
      : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${chartH}`}
      className="h-auto min-w-[720px] w-full"
      role="img"
      aria-label="VÖK bileşenleri — teknik kâr, yatırım, faaliyet"
      onMouseLeave={() => setHoverIdx(null)}
    >
      <rect width={W} height={chartH} fill="#fff" />
      <text x={PAD.l} y={28} fontSize={14} fontWeight={700} fill="#0f172a">
        VÖK bileşenleri
      </text>
      {ticks.map((tick, i) => {
        const y = yAt(tick);
        const isZero = tick === 0;
        return (
          <g key={i}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y}
              y2={y}
              stroke={isZero ? "#0f172a" : "#e2e8f0"}
              strokeWidth={isZero ? 1.75 : 1}
              strokeDasharray={isZero ? "7 5" : undefined}
            />
            <text
              x={PAD.l - 9}
              y={y + 3}
              textAnchor="end"
              fontSize={isZero ? 10 : 9}
              fontWeight={isZero ? 800 : 400}
              fill={isZero ? "#0f172a" : "#64748b"}
            >
              {isZero ? "0" : fmtMr(tick)}
            </text>
          </g>
        );
      })}
      {/* Sıfır çizgisi — kâr/zarar ayrımı (tick 0 yoksa da çiz) */}
      {!ticks.some((t) => t === 0) ? (
        <g>
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={y0}
            y2={y0}
            stroke="#0f172a"
            strokeWidth={1.75}
            strokeDasharray="7 5"
          />
          <text x={PAD.l - 9} y={y0 + 3} textAnchor="end" fontSize={10} fontWeight={800} fill="#0f172a">
            0
          </text>
        </g>
      ) : null}
      {trend.map((p, i) => {
        const cx = PAD.l + band * i + band / 2;
        const parts = partsOf(p);
        const active = hoverIdx === i;
        let posTop = 0;
        let negBot = 0;
        const segs: { key: string; y: number; h: number; fill: string; value: number; label: string }[] = [];
        for (const part of parts) {
          const v = part.value;
          if (v === 0 || !Number.isFinite(v)) continue;
          if (v > 0) {
            const yTop = yAt(posTop + v);
            const yBot = yAt(posTop);
            segs.push({
              key: part.key,
              y: yTop,
              h: Math.max(1, yBot - yTop),
              fill: COLORS[part.key],
              value: v,
              label: part.label,
            });
            posTop += v;
          } else {
            const yTop = yAt(negBot);
            const yBot = yAt(negBot + v);
            segs.push({
              key: part.key,
              y: yTop,
              h: Math.max(1, yBot - yTop),
              fill: COLORS[part.key],
              value: v,
              label: part.label,
            });
            negBot += v;
          }
        }
        const vok = p[pool].vok;
        const vokY = yAt(vok);
        return (
          <g key={p.donem} className="cursor-pointer" onMouseEnter={() => setHoverIdx(i)}>
            {segs.map((seg) => (
              <g key={seg.key}>
                <rect
                  x={cx - barW / 2}
                  y={seg.y}
                  width={barW}
                  height={seg.h}
                  fill={seg.fill}
                  fillOpacity={active ? 1 : 0.88}
                  rx={2}
                />
                {seg.h >= 14 ? (
                  <text
                    x={cx}
                    y={seg.y + seg.h / 2 + 4}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight={700}
                    fill="#fff"
                  >
                    {fmtMr(seg.value)}
                  </text>
                ) : null}
              </g>
            ))}
            <line x1={cx - barW / 2 - 2} x2={cx + barW / 2 + 2} y1={y0} y2={y0} stroke="#64748b" strokeWidth={1} />
            <text
              x={cx}
              y={vok >= 0 ? Math.min(vokY, yAt(posTop)) - 8 : Math.max(vokY, yAt(negBot)) + 14}
              textAnchor="middle"
              fontSize={10}
              fontWeight={800}
              fill={COLORS.vok}
            >
              VÖK {fmtMr(vok)}
            </text>
            <text
              x={cx}
              y={chartH - 18}
              textAnchor="middle"
              fontSize={10}
              fill="#334155"
              fontWeight={active ? 700 : 500}
            >
              {p.donem}
            </text>
          </g>
        );
      })}
      <g transform={`translate(${PAD.l}, ${chartH - 4})`}>
        {(
          [
            ["teknikKar", "Teknik kâr"],
            ["yatirimGeliri", "Yatırım geliri"],
            ["faaliyetGideri", "Faaliyet gideri"],
          ] as const
        ).map(([key, label], i) => (
          <g key={key} transform={`translate(${i * 160}, 0)`}>
            <rect x={0} y={-11} width={12} height={8} fill={COLORS[key]} rx={1} />
            <text x={17} y={-3} fontSize={10} fill="#475569">
              {label}
            </text>
          </g>
        ))}
      </g>
      {tip ? <TsbSvgTooltip x={tip.x} y={tip.y} width={208} lines={tip.lines} /> : null}
    </svg>
  );
}

type PrimHover = { i: number; key: "HD" | "HE" } | null;

/** Prim üretimi — yıllar arası gruplu bar (HD | H/E); tüm etiketler + hover. */
export function TsbSektorPrimUretimChart({
  trend,
  seciliDonem,
}: {
  trend: SektorPrimSnapshot[];
  seciliDonem: string;
}) {
  const [hover, setHover] = useState<PrimHover>(null);
  const max = Math.max(1, ...trend.flatMap((p) => [p.HD, p.HAYAT_EMEKLILIK]));
  const chartH = H + 8;
  const padB = 56;
  const padT = PAD.t + 8;
  const innerH = chartH - padT - padB;
  const yAt = (v: number) => padT + innerH - (v / max) * innerH;
  const innerW = W - PAD.l - PAD.r;
  const band = innerW / Math.max(1, trend.length);
  const gap = 4;
  const barW = Math.min(28, (band * 0.62 - gap) / 2);
  const ticks = Array.from({ length: 5 }, (_, i) => (max * i) / 4);
  const lastIdx = trend.length - 1;

  const tip =
    hover !== null
      ? (() => {
          const p = trend[hover.i];
          const onceki = hover.i > 0 ? trend[hover.i - 1] : null;
          const bu = hover.key === "HD" ? p.HD : p.HAYAT_EMEKLILIK;
          const onc = onceki ? (hover.key === "HD" ? onceki.HD : onceki.HAYAT_EMEKLILIK) : null;
          const cx = PAD.l + band * hover.i + band / 2;
          return {
            x: Math.min(W - 210, Math.max(PAD.l, cx + 16)),
            y: padT + 4,
            lines: [
              { text: "Üretim" },
              { text: fmtMr(bu), muted: true },
              {
                text: onceki ? tsbChartYoyLabel(bu, onc) : "Önceki dönem artışı: —",
                accent: true,
              },
            ],
          };
        })()
      : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${chartH}`}
      className="h-auto min-w-[620px] w-full"
      role="img"
      aria-label="Prim üretimi — hayat dışı ve hayat/emeklilik"
      onMouseLeave={() => setHover(null)}
    >
      <rect width={W} height={chartH} fill="#fff" />
      <text x={PAD.l} y={28} fontSize={14} fontWeight={700} fill="#0f172a">
        Prim üretimi
      </text>
      <g transform={`translate(${W - PAD.r - 220}, 18)`}>
        <rect x={0} y={0} width={12} height={8} fill={COLORS.HD} rx={1} />
        <text x={17} y={8} fontSize={10} fill="#475569">
          Hayat dışı
        </text>
        <rect x={100} y={0} width={12} height={8} fill={COLORS.HAYAT_EMEKLILIK} rx={1} />
        <text x={117} y={8} fontSize={10} fill="#475569">
          Hayat / Emeklilik
        </text>
      </g>
      {ticks.map((tick, i) => {
        const y = yAt(tick);
        return (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#e2e8f0" />
            <text x={PAD.l - 9} y={y + 3} textAnchor="end" fontSize={9} fill="#64748b">
              {fmtMr(tick)}
            </text>
          </g>
        );
      })}
      {trend.map((p, i) => {
        const cx = PAD.l + band * i + band / 2;
        const isSecili = p.donem === seciliDonem;
        const isIlk = i === 0;
        const isSon = i === lastIdx;
        const base = padT + innerH;
        const hdH = Math.max(0, base - yAt(p.HD));
        const heH = Math.max(0, base - yAt(p.HAYAT_EMEKLILIK));
        const hdX = cx - gap / 2 - barW;
        const heX = cx + gap / 2;
        const labelFill = isSecili ? "#0f172a" : "#334155";
        const hdActive = hover?.i === i && hover.key === "HD";
        const heActive = hover?.i === i && hover.key === "HE";
        return (
          <g key={p.donem}>
            {isSecili ? (
              <rect
                x={cx - band * 0.42}
                y={padT - 6}
                width={band * 0.84}
                height={innerH + 14}
                fill="#ecfdf5"
                rx={6}
              />
            ) : null}
            <rect
              x={hdX}
              y={base - hdH}
              width={barW}
              height={hdH}
              fill={COLORS.HD}
              fillOpacity={isSecili || hdActive ? 1 : 0.78}
              rx={2}
              stroke={isSecili || hdActive ? "#134e4a" : "none"}
              strokeWidth={isSecili || hdActive ? 1.5 : 0}
              className="cursor-pointer"
              onMouseEnter={() => setHover({ i, key: "HD" })}
            />
            <rect
              x={heX}
              y={base - heH}
              width={barW}
              height={heH}
              fill={COLORS.HAYAT_EMEKLILIK}
              fillOpacity={isSecili || heActive ? 1 : 0.78}
              rx={2}
              stroke={isSecili || heActive ? "#0369a1" : "none"}
              strokeWidth={isSecili || heActive ? 1.5 : 0}
              className="cursor-pointer"
              onMouseEnter={() => setHover({ i, key: "HE" })}
            />
            <text
              x={hdX + barW / 2}
              y={base - hdH - 6}
              textAnchor="middle"
              fontSize={isSecili ? 10 : 9}
              fontWeight={700}
              fill={COLORS.HD}
            >
              {fmtMr(p.HD)}
            </text>
            <text
              x={heX + barW / 2}
              y={base - heH - 6}
              textAnchor="middle"
              fontSize={isSecili ? 10 : 9}
              fontWeight={700}
              fill="#0284c7"
            >
              {fmtMr(p.HAYAT_EMEKLILIK)}
            </text>
            <text
              x={cx}
              y={chartH - 28}
              textAnchor="middle"
              fontSize={isSecili ? 11 : 10}
              fontWeight={isSecili ? 700 : 500}
              fill={labelFill}
            >
              {p.donem}
            </text>
            {isIlk || isSon ? (
              <text
                x={cx}
                y={chartH - 14}
                textAnchor="middle"
                fontSize={9}
                fontWeight={700}
                fill={isSon ? "#047857" : "#64748b"}
              >
                {isIlk ? "← başlangıç" : "son dönem →"}
              </text>
            ) : null}
          </g>
        );
      })}
      {tip ? <TsbSvgTooltip x={tip.x} y={tip.y} width={208} lines={tip.lines} /> : null}
    </svg>
  );
}

export function TsbSektorBilançoStackedChart({
  trend,
  metric,
  title,
  pool = "SEKTOR",
}: {
  trend: SektorGorunumuDonem[];
  metric: "aktifToplami" | "ozsermaye";
  title: string;
  pool?: SektorGorunumuPool;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const showHd = pool === "SEKTOR" || pool === "HD";
  const showHe = pool === "SEKTOR" || pool === "HAYAT_EMEKLILIK";
  const valueOf = (p: SektorGorunumuDonem) => {
    const hd = showHd ? p.HD[metric] : 0;
    const he = showHe ? p.HAYAT_EMEKLILIK[metric] : 0;
    return hd + he;
  };
  const max = Math.max(1, ...trend.map(valueOf));
  const innerH = H - PAD.t - PAD.b;
  const yAt = (v: number) => PAD.t + innerH - (v / max) * innerH;
  const innerW = W - PAD.l - PAD.r;
  const band = innerW / Math.max(1, trend.length);
  const barW = Math.min(72, band * 0.52);
  const ticks = Array.from({ length: 5 }, (_, i) => (max * i) / 4);

  const tip =
    hoverIdx !== null
      ? (() => {
          const p = trend[hoverIdx];
          const onceki = hoverIdx > 0 ? trend[hoverIdx - 1] : null;
          const bu = valueOf(p);
          const onc = onceki ? valueOf(onceki) : null;
          const cx = PAD.l + band * hoverIdx + band / 2;
          const detay =
            pool === "SEKTOR"
              ? `HD ${fmtMr(p.HD[metric])} · H/E ${fmtMr(p.HAYAT_EMEKLILIK[metric])}`
              : pool === "HD"
                ? `HD ${fmtMr(p.HD[metric])}`
                : `H/E ${fmtMr(p.HAYAT_EMEKLILIK[metric])}`;
          return {
            x: Math.min(W - 220, Math.max(PAD.l, cx + 12)),
            y: PAD.t,
            lines: [
              { text: "Üretim" },
              { text: detay, muted: true },
              {
                text: onceki ? tsbChartYoyLabel(bu, onc) : "Önceki dönem artışı: —",
                accent: true,
              },
            ],
          };
        })()
      : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto min-w-[620px] w-full"
      role="img"
      aria-label={title}
      onMouseLeave={() => setHoverIdx(null)}
    >
      <rect width={W} height={H} fill="#fff" />
      <text x={PAD.l} y={28} fontSize={14} fontWeight={700} fill="#0f172a">
        {title}
      </text>
      {ticks.map((tick, i) => {
        const y = yAt(tick);
        return (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#e2e8f0" />
            <text x={PAD.l - 9} y={y + 3} textAnchor="end" fontSize={9} fill="#64748b">
              {fmtMr(tick)}
            </text>
          </g>
        );
      })}
      {trend.map((p, i) => {
        const cx = PAD.l + band * i + band / 2;
        const hdVal = showHd ? p.HD[metric] : 0;
        const heVal = showHe ? p.HAYAT_EMEKLILIK[metric] : 0;
        const hdH = showHd ? innerH - (yAt(hdVal) - PAD.t) : 0;
        const heH = showHe ? innerH - (yAt(heVal) - PAD.t) : 0;
        const base = PAD.t + innerH;
        const active = hoverIdx === i;
        return (
          <g key={p.donem} className="cursor-pointer" onMouseEnter={() => setHoverIdx(i)}>
            {showHd ? (
              <rect
                x={cx - barW / 2}
                y={base - hdH}
                width={barW}
                height={hdH}
                fill={COLORS.HD}
                fillOpacity={active ? 1 : 0.85}
                rx={2}
              />
            ) : null}
            {showHe ? (
              <rect
                x={cx - barW / 2}
                y={base - hdH - heH}
                width={barW}
                height={heH}
                fill={COLORS.HAYAT_EMEKLILIK}
                fillOpacity={active ? 1 : 0.85}
                rx={2}
              />
            ) : null}
            <text x={cx} y={H - 18} textAnchor="middle" fontSize={10} fill="#334155" fontWeight={active ? 700 : 400}>
              {p.donem}
            </text>
          </g>
        );
      })}
      <g transform={`translate(${PAD.l}, ${H - 2})`}>
        {showHd ? (
          <>
            <rect x={0} y={-11} width={12} height={8} fill={COLORS.HD} rx={1} />
            <text x={17} y={-3} fontSize={10} fill="#475569">
              Hayat dışı
            </text>
          </>
        ) : null}
        {showHe ? (
          <>
            <rect x={showHd ? 100 : 0} y={-11} width={12} height={8} fill={COLORS.HAYAT_EMEKLILIK} rx={1} />
            <text x={showHd ? 117 : 17} y={-3} fontSize={10} fill="#475569">
              Hayat / Emeklilik
            </text>
          </>
        ) : null}
      </g>
      {tip ? <TsbSvgTooltip x={tip.x} y={tip.y} width={214} lines={tip.lines} /> : null}
    </svg>
  );
}

const pfYoy = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1, signDisplay: "exceptZero" });

function shortBransLabel(s: string): string {
  if (s.length <= 22) return s;
  return `${s.slice(0, 20)}…`;
}

/** Branş bazlı prim — bu dönem vs önceki yıl aynı ay (gruplu sütun). */
export function TsbSektorBransBuyumeChart({
  satirlar,
  donem,
  oncekiDonem,
}: {
  satirlar: SektorBransBuyumeSatir[];
  donem: string;
  oncekiDonem: string | null;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const padL = 72;
  const padR = 20;
  const padT = 48;
  const padB = 118;
  const band = Math.max(48, Math.min(72, Math.floor(820 / Math.max(1, satirlar.length))));
  const chartW = Math.max(900, padL + padR + satirlar.length * band);
  const chartH = 390;
  const innerH = chartH - padT - padB;
  const max = Math.max(1, ...satirlar.flatMap((s) => [s.primBu, s.primOnceki]));
  const yAt = (v: number) => padT + innerH - (v / max) * innerH;
  const ticks = Array.from({ length: 5 }, (_, i) => (max * i) / 4);
  const gap = 3;
  const barW = Math.min(18, (band * 0.72 - gap) / 2);
  const base = padT + innerH;
  const labelAnchorY = base + 10;

  const tip =
    hoverIdx !== null
      ? (() => {
          const s = satirlar[hoverIdx];
          const cx = padL + band * hoverIdx + band / 2;
          return {
            x: Math.min(chartW - 220, Math.max(padL, cx + 12)),
            y: 8,
            lines: [
              { text: s.anaBransH },
              { text: `${donem}: ${fmtMr(s.primBu)}`, muted: true as const },
              {
                text: oncekiDonem
                  ? `${oncekiDonem}: ${fmtMr(s.primOnceki)}`
                  : "Önceki yıl: —",
                muted: true as const,
              },
              {
                text:
                  s.yoy !== null
                    ? `YoY ${pfYoy.format(s.yoy * 100)}%`
                    : "YoY: —",
                accent: true as const,
              },
            ],
          };
        })()
      : null;

  if (satirlar.length === 0) {
    return (
      <p className="px-1 py-6 text-sm text-slate-500">Bu havuz / dönem için branş verisi yok.</p>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${chartW} ${chartH}`}
      className="h-auto min-w-[720px] w-full"
      role="img"
      aria-label="Branş bazlı prim büyümesi — önceki yıl aynı dönem"
      onMouseLeave={() => setHoverIdx(null)}
    >
      <rect width={chartW} height={chartH} fill="#fff" />
      <text x={padL} y={26} fontSize={14} fontWeight={700} fill="#0f172a">
        Branş bazlı prim büyümesi
      </text>
      <g transform={`translate(${chartW - padR - 250}, 16)`}>
        <rect x={0} y={0} width={12} height={8} fill={COLORS.bransBu} rx={1} />
        <text x={16} y={8} fontSize={10} fill="#475569">
          {donem}
        </text>
        <rect x={90} y={0} width={12} height={8} fill={COLORS.bransOnceki} rx={1} />
        <text x={106} y={8} fontSize={10} fill="#475569">
          {oncekiDonem ?? "önceki yıl"}
        </text>
      </g>
      {ticks.map((tick, i) => {
        const y = yAt(tick);
        return (
          <g key={i}>
            <line x1={padL} x2={chartW - padR} y1={y} y2={y} stroke="#e2e8f0" />
            <text x={padL - 8} y={y + 3} textAnchor="end" fontSize={9} fill="#64748b">
              {fmtMr(tick)}
            </text>
          </g>
        );
      })}
      {satirlar.map((s, i) => {
        const cx = padL + band * i + band / 2;
        const hBu = Math.max(0, base - yAt(s.primBu));
        const hOn = Math.max(0, base - yAt(s.primOnceki));
        const active = hoverIdx === i;
        return (
          <g key={s.anaBransH} className="cursor-pointer" onMouseEnter={() => setHoverIdx(i)}>
            <rect
              x={cx - barW - gap / 2}
              y={base - hOn}
              width={barW}
              height={hOn}
              fill={COLORS.bransOnceki}
              fillOpacity={active ? 1 : 0.85}
              rx={2}
            />
            <rect
              x={cx + gap / 2}
              y={base - hBu}
              width={barW}
              height={hBu}
              fill={COLORS.bransBu}
              fillOpacity={active ? 1 : 0.92}
              rx={2}
            />
            {s.yoy !== null && hBu >= 18 ? (
              <text
                x={cx}
                y={base - hBu - 6}
                textAnchor="middle"
                fontSize={8}
                fontWeight={700}
                fill={s.yoy >= 0 ? "#047857" : "#b91c1c"}
              >
                {pfYoy.format(s.yoy * 100)}%
              </text>
            ) : null}
            <text
              x={cx}
              y={labelAnchorY}
              textAnchor="end"
              fontSize={10}
              fill="#0f172a"
              fontWeight={active ? 700 : 600}
              transform={`rotate(-42 ${cx} ${labelAnchorY})`}
            >
              {shortBransLabel(s.anaBransH)}
            </text>
          </g>
        );
      })}
      {tip ? <TsbSvgTooltip x={tip.x} y={tip.y} width={210} lines={tip.lines} /> : null}
    </svg>
  );
}
