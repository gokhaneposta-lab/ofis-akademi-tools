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
    <section className={tsb.sektorOzetiWrap} aria-labelledby="tsb-olcek-segment-baslik">
      <div className={tsb.sektorOzetiBaslikWrap}>
        <h2 id="tsb-olcek-segment-baslik" className={tsb.sektorOzetiBaslik}>
          Ölçek Segmentasyonu
        </h2>
        <p className={tsb.sektorOzetiAltBaslik}>
          Şirketler brüt prim, özsermaye ve aktif büyüklüklerine göre benzer ölçek gruplarına ayrılmıştır.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {OLCEK_SEGMENT_HUB_LEGEND.map((item) => (
            <li
              key={item.harf}
              className="flex items-center gap-2 rounded-lg border border-slate-200/75 bg-slate-50/50 px-2.5 py-2 text-xs"
            >
              <span
                className={`inline-flex min-w-[1.75rem] justify-center rounded-md px-1.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${SEGMENT_BADGE_CLASS[item.harf]}`}
              >
                {item.harf}
              </span>
              <span className="font-medium text-slate-800">{item.ad}</span>
            </li>
          ))}
        </ul>

        <div className="shrink-0 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs text-slate-700">
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
          <Link
            href="/sigorta/olcek-segmentasyon"
            className="mt-2 inline-block text-[11px] font-semibold text-emerald-800 hover:underline"
          >
            Tüm şirket listesi →
          </Link>
        </div>
      </div>
    </section>
  );
}

export { SEGMENT_BADGE_CLASS };
