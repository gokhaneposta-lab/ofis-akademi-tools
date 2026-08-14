"use client";

import {
  GRUP_SIRA,
  type V2GtFiltreModu,
  type V2YediliSecenek,
} from "@/lib/butce/v2/v2GtFiltre";

type Props = {
  mod: V2GtFiltreModu;
  secim: ReadonlySet<string>;
  yedili: V2YediliSecenek[];
  onMod: (mod: V2GtFiltreModu) => void;
  onToggle: (id: string) => void;
  onTumu: () => void;
};

function Chip({
  checked,
  label,
  title,
  onClick,
}: {
  checked: boolean;
  label: string;
  title?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[11px] leading-tight ${
        checked
          ? "border-indigo-400 bg-indigo-50 font-semibold text-indigo-950"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      }`}
    >
      <span
        aria-hidden
        className={`inline-block h-3 w-3 shrink-0 rounded-sm border ${
          checked ? "border-indigo-600 bg-indigo-600" : "border-slate-400 bg-white"
        }`}
      />
      {label}
    </button>
  );
}

export default function V2GtFiltreBar({
  mod,
  secim,
  yedili,
  onMod,
  onToggle,
  onTumu,
}: Props) {
  const tumu = secim.size === 0;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Kırılım
        </span>
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {(
            [
              ["tarife", "Tarife grubu"],
              ["yedili", "7'li branş"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onMod(id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                mod === id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex max-h-28 flex-wrap gap-1 overflow-auto">
        <Chip checked={tumu} label="Tümü" onClick={onTumu} />
        {mod === "tarife"
          ? GRUP_SIRA.map((g) => (
              <Chip
                key={g}
                checked={secim.has(g)}
                label={g}
                onClick={() => onToggle(g)}
              />
            ))
          : yedili.map((b) => (
              <Chip
                key={b.kod}
                checked={secim.has(b.kod)}
                label={`${b.kod} ${b.ad}`}
                title={`${b.kod} · ${b.ad} · ${b.grup}`}
                onClick={() => onToggle(b.kod)}
              />
            ))}
      </div>
    </div>
  );
}
