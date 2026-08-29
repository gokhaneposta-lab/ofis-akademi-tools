import Link from "next/link";
import type { OlcekSegmentHarfi } from "@/lib/tsbOlcekSegment";
import { OLCEK_SEGMENT_HUB_LEGEND, type OlcekSegmentCache } from "@/lib/tsbOlcekSegmentCache";
import { tsb } from "@/components/tsb/tsbDashboardUi";

const SEGMENT_BADGE_CLASS: Record<OlcekSegmentHarfi, string> = {
  "A+": "bg-violet-100 text-violet-900 ring-violet-200/80",
  A: "bg-indigo-100 text-indigo-900 ring-indigo-200/80",
  B: "bg-sky-100 text-sky-900 ring-sky-200/80",
  C: "bg-amber-100 text-amber-900 ring-amber-200/80",
  D: "bg-slate-200 text-slate-800 ring-slate-300/80",
};

type HubProps = {
  data: Pick<OlcekSegmentCache, "hubOzet" | "sonFinDonem">;
};

export default function TsbOlcekSegmentHubKart({ data }: HubProps) {
  return (
    <section className={tsb.sektorOzetiWrap} aria-label="Ölçek segment özeti">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/sigorta/olcek-segmentasyon"
            className="inline-flex min-h-[2.5rem] items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900"
          >
            Tüm şirket listesi
            <span aria-hidden>→</span>
          </Link>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-600 sm:text-sm">
            Brüt prim, özsermaye ve aktif büyüklüğe göre A+…D grupları — peer seçimi ve kıyas için.
          </p>
        </div>

        <div className="shrink-0 rounded-lg border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">Hayat Dışı:</span> {data.hubOzet.HD} şirket
          </p>
          <p className="mt-0.5">
            <span className="font-semibold text-slate-900">Hayat/Emeklilik:</span>{" "}
            {data.hubOzet.HAYAT_EMEKLILIK} şirket
          </p>
          {data.sonFinDonem ? (
            <p className="mt-1 text-[10px] text-slate-500">Son finansal dönem: {data.sonFinDonem}</p>
          ) : null}
        </div>
      </div>

      <ul
        className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-3 lg:grid-cols-5"
        aria-label="Ölçek segmentleri"
      >
        {OLCEK_SEGMENT_HUB_LEGEND.map((item) => (
          <li
            key={item.harf}
            className="flex min-w-0 items-center justify-center gap-2 rounded-lg border border-slate-200/75 bg-slate-50/50 px-2.5 py-2.5 text-xs sm:justify-start"
          >
            <span
              className={`inline-flex min-w-[1.75rem] shrink-0 justify-center rounded-md px-1.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${SEGMENT_BADGE_CLASS[item.harf]}`}
            >
              {item.harf}
            </span>
            <span className="truncate font-medium text-slate-800">{item.ad}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { SEGMENT_BADGE_CLASS };
