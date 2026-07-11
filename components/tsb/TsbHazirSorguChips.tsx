import Link from "next/link";
import { cn, tsb } from "@/components/tsb/tsbDashboardUi";
import type { TsbHazirSorgu } from "@/lib/tsbHazirSorgular";

type Props = {
  sorgular: TsbHazirSorgu[];
  className?: string;
};

export default function TsbHazirSorguChips({ sorgular, className }: Props) {
  if (sorgular.length === 0) return null;
  return (
    <div className={cn(tsb.dataPanel, "p-3 sm:p-4", className)}>
      <p className="text-sm font-semibold text-slate-800">Hazır sorgular</p>
      <p className="mt-0.5 text-xs text-slate-600">Seçili şirket ve dönemle ilgili panellere geçiş</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {sorgular.map((s) => (
          <Link
            key={s.id}
            href={s.href}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900"
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
