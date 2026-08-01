"use client";

import {
  KANAL_DAGILIM_SATIRLARI,
  kanalYuzdeleri,
  type KanalDagilimKutu,
  type KanalDagilimSatirKey,
  type KanalLiderSatir,
  type KanalTrendNokta,
} from "@/lib/tsbKanalDagilim";
import { cn, tsbFormatPrim } from "@/components/tsb/tsbDashboardUi";

export const KANAL_HEX: Record<KanalDagilimSatirKey, string> = {
  acente: "#0f766e",
  broker: "#7c3aed",
  banka: "#d97706",
  merkez: "#2563eb",
  diger: "#94a3b8",
};

const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const tl = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

function fmtMr(v: number): string {
  return `${tl.format(v / 1e9)} Mr`;
}

/** Satır içi yatay stacked bar (kanal mix). */
export function KanalStackedBar({
  kutu,
  className,
}: {
  kutu: KanalDagilimKutu;
  className?: string;
}) {
  const total = kutu.genelToplam;
  if (total <= 0) {
    return <div className={cn("h-2.5 w-full rounded-full bg-slate-100", className)} />;
  }
  return (
    <div className={cn("flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100", className)} title={
      KANAL_DAGILIM_SATIRLARI.map(({ key, label }) =>
        `${label}: ${pf.format((kutu[key] / total) * 100)}%`,
      ).join(" · ")
    }>
      {KANAL_DAGILIM_SATIRLARI.map(({ key }) => {
        const pct = (kutu[key] / total) * 100;
        if (pct <= 0) return null;
        return (
          <div
            key={key}
            style={{ width: `${pct}%`, backgroundColor: KANAL_HEX[key] }}
            className="h-full min-w-[1px]"
          />
        );
      })}
    </div>
  );
}

/** Donut + legend (tutar + %). */
export function KanalDonutChart({
  kutu,
  title,
}: {
  kutu: KanalDagilimKutu;
  title: string;
}) {
  const yuzde = kanalYuzdeleri(kutu);
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 62;
  const stroke = 28;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = KANAL_DAGILIM_SATIRLARI.filter(({ key }) => kutu[key] > 0).map(({ key, label }) => {
    const pct = yuzde[key] / 100;
    const len = circ * pct;
    const item = {
      key,
      label,
      tutar: kutu[key],
      pay: yuzde[key],
      dash: `${len} ${circ - len}`,
      offset,
    };
    offset += len;
    return item;
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44 shrink-0" role="img" aria-label={title}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        {slices.map((s) => (
          <circle
            key={s.key}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={KANAL_HEX[s.key]}
            strokeWidth={stroke}
            strokeDasharray={s.dash}
            strokeDashoffset={-s.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          >
            <title>{`${s.label}: ${tsbFormatPrim(s.tutar)} · %${pf.format(s.pay)}`}</title>
          </circle>
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0f172a">
          {fmtMr(kutu.genelToplam)}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fill="#64748b">
          toplam
        </text>
      </svg>
      <ul className="min-w-0 flex-1 space-y-1.5 text-sm">
        {KANAL_DAGILIM_SATIRLARI.map(({ key, label }) => (
          <li key={key} className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-slate-700">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: KANAL_HEX[key] }} />
              {label}
            </span>
            <span className="tabular-nums text-slate-900">
              <strong>{tsbFormatPrim(kutu[key])}</strong>
              <span className="ml-2 text-slate-500">%{pf.format(yuzde[key])}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Yıllar arası stacked area (kanal bileşimi). */
export function KanalStackedTrendChart({
  trend,
}: {
  trend: KanalTrendNokta[];
}) {
  const W = 720;
  const H = 280;
  const PAD = { l: 56, r: 16, t: 36, b: 40 };
  const max = Math.max(1, ...trend.map((t) => t.kutu.genelToplam));
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const n = trend.length;
  const xAt = (i: number) => PAD.l + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yAt = (v: number) => PAD.t + innerH - (v / max) * innerH;

  const order: KanalDagilimSatirKey[] = ["acente", "broker", "banka", "merkez", "diger"];
  const cumulBottom = trend.map(() => 0);
  const paths = order.map((key) => {
    const topPts: string[] = [];
    const botPts: string[] = [];
    for (let i = 0; i < n; i += 1) {
      const v = trend[i].kutu[key];
      const bot = cumulBottom[i];
      const top = bot + v;
      topPts.push(`${xAt(i)},${yAt(top)}`);
      botPts.push(`${xAt(i)},${yAt(bot)}`);
      cumulBottom[i] = top;
    }
    const d = `M ${topPts.join(" L ")} L ${[...botPts].reverse().join(" L ")} Z`;
    return { key, d };
  });

  const ticks = Array.from({ length: 4 }, (_, i) => (max * i) / 3);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto min-w-[560px] w-full" role="img" aria-label="Kanal trendi">
      <rect width={W} height={H} fill="#fff" />
      <text x={PAD.l} y={22} fontSize={13} fontWeight={700} fill="#0f172a">
        Kanal trendi
      </text>
      {ticks.map((tick, i) => {
        const y = yAt(tick);
        return (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#e2e8f0" />
            <text x={PAD.l - 8} y={y + 3} textAnchor="end" fontSize={9} fill="#64748b">
              {fmtMr(tick)}
            </text>
          </g>
        );
      })}
      {paths.map((p) => (
        <path key={p.key} d={p.d} fill={KANAL_HEX[p.key]} fillOpacity={0.85} />
      ))}
      {trend.map((t, i) => (
        <text key={t.donem} x={xAt(i)} y={H - 14} textAnchor="middle" fontSize={10} fill="#475569">
          {t.donem}
        </text>
      ))}
      {order.map((key, i) => (
        <g key={key} transform={`translate(${PAD.l + i * 110}, ${H - 2})`}>
          <rect x={0} y={-10} width={10} height={8} fill={KANAL_HEX[key]} rx={1} />
          <text x={14} y={-2} fontSize={10} fill="#475569">
            {KANAL_DAGILIM_SATIRLARI.find((x) => x.key === key)?.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Kanal liderleri yatay bar. */
export function KanalLiderBarChart({
  satirlar,
  kanalLabel,
  limit = 12,
}: {
  satirlar: KanalLiderSatir[];
  kanalLabel: string;
  limit?: number;
}) {
  const top = satirlar.slice(0, limit);
  const max = Math.max(1, ...top.map((s) => s.primBu));
  const rowH = 28;
  const W = 720;
  const PAD = { l: 168, r: 72, t: 28, b: 16 };
  const H = PAD.t + PAD.b + top.length * rowH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto min-w-[560px] w-full" role="img" aria-label={`Kanal liderleri · ${kanalLabel}`}>
      <rect width={W} height={H} fill="#fff" />
      <text x={PAD.l} y={18} fontSize={13} fontWeight={700} fill="#0f172a">
        Kanal liderleri — {kanalLabel}
      </text>
      {top.map((s, i) => {
        const y = PAD.t + i * rowH;
        const barW = ((W - PAD.l - PAD.r) * s.primBu) / max;
        return (
          <g key={s.sirketKodu}>
            <text x={PAD.l - 8} y={y + 14} textAnchor="end" fontSize={10} fill="#334155">
              {s.sirketAdi.length > 28 ? `${s.sirketAdi.slice(0, 26)}…` : s.sirketAdi}
            </text>
            <rect x={PAD.l} y={y + 4} width={Math.max(2, barW)} height={16} rx={3} fill="#0f766e" />
            <text x={PAD.l + barW + 6} y={y + 16} fontSize={10} fill="#475569">
              {fmtMr(s.primBu)}
            </text>
            <title>{`${s.sirketAdi} | ${kanalLabel}: ${tsbFormatPrim(s.primBu)}`}</title>
          </g>
        );
      })}
    </svg>
  );
}
