"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { OlcekSegmentHarfi } from "@/lib/tsbOlcekSegment";
import type { SegmentSkorPool } from "@/lib/tsbSirketSegmentSkor";
import {
  filtreOlcekSegmentTablosu,
  formatOlcekTl,
  sektorSirasiMetin,
  segmentSirasiMetin,
  sonFinDonemPoolData,
} from "@/lib/tsbOlcekSegmentDashboard";
import { OLCEK_SEGMENT_HUB_LEGEND } from "@/lib/tsbOlcekSegmentCache";
import { useOlcekSegmentCache } from "@/components/tsb/useOlcekSegmentCache";
import { useTsbDashboardUrlPrefs } from "@/components/tsb/useTsbDashboardUrlPrefs";
import { SEGMENT_BADGE_CLASS } from "@/components/tsb/TsbOlcekSegmentHubKart";
import {
  cn,
  tsb,
  TsbError,
  TsbFilterBar,
  TsbFilterField,
  TsbFilterGrid,
  TsbLoading,
  TsbTableShell,
  TsbToggleButton,
} from "@/components/tsb/tsbDashboardUi";

const POOL_LABELS: Record<SegmentSkorPool, string> = {
  HD: "Hayat dışı (HD)",
  HAYAT_EMEKLILIK: "Hayat / Emeklilik",
};

type SegmentFiltre = OlcekSegmentHarfi | "tumu";

function SegmentBadge({ harf }: { harf: OlcekSegmentHarfi }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[2rem] justify-center rounded-md px-1.5 py-0.5 text-[11px] font-bold ring-1 ring-inset",
        SEGMENT_BADGE_CLASS[harf],
      )}
    >
      {harf}
    </span>
  );
}

export default function TsbOlcekSegmentasyonDashboard() {
  const urlPrefs = useTsbDashboardUrlPrefs();
  const { cache, yukleniyor, hata } = useOlcekSegmentCache();
  const [pool, setPool] = useState<SegmentSkorPool>(urlPrefs.pool ?? "HD");
  const [segment, setSegment] = useState<SegmentFiltre>("tumu");

  useEffect(() => {
    if (urlPrefs.pool) setPool(urlPrefs.pool);
  }, [urlPrefs.pool]);

  const sonPool = useMemo(() => sonFinDonemPoolData(cache, pool), [cache, pool]);

  const tablo = useMemo(() => {
    if (!sonPool) return [];
    return filtreOlcekSegmentTablosu(sonPool.poolData.sirketler, segment);
  }, [sonPool, segment]);

  const segmentDagilimi = sonPool?.poolData.segmentDagilimi;

  if (yukleniyor) return <TsbLoading />;
  if (hata) return <TsbError message={hata} />;
  if (!cache || !sonPool) {
    return <TsbError message="Ölçek segment verisi bulunamadı. tsb:meta ile önbellek üretin." />;
  }

  return (
    <div className="space-y-4">
      <TsbFilterBar>
        <TsbFilterGrid>
          <TsbFilterField label="Şirket grubu">
            <div className="flex flex-wrap gap-1">
              {(Object.keys(POOL_LABELS) as SegmentSkorPool[]).map((p) => (
                <TsbToggleButton key={p} pressed={pool === p} onClick={() => setPool(p)}>
                  {POOL_LABELS[p]}
                </TsbToggleButton>
              ))}
            </div>
          </TsbFilterField>
        </TsbFilterGrid>
        <p className={cn(tsb.caption, "mt-2")}>
          Sınıflandırma dönemi:{" "}
          <span className="font-semibold text-slate-800">{sonPool.donem}</span> (son finansal çeyrek). Ölçek
          skoru brüt prim (%50), özsermaye (%30) ve toplam aktif (%20) ile havuz içinde min-max normalize
          edilir.
        </p>
      </TsbFilterBar>

      {segmentDagilimi ? (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Ölçek segmenti filtresi">
          <TsbToggleButton pressed={segment === "tumu"} onClick={() => setSegment("tumu")}>
            Tümü ({sonPool.poolData.peerSayisi})
          </TsbToggleButton>
          {OLCEK_SEGMENT_HUB_LEGEND.map((item) => (
            <TsbToggleButton
              key={item.harf}
              pressed={segment === item.harf}
              onClick={() => setSegment(item.harf)}
            >
              <span className="mr-1 font-bold">{item.harf}</span>
              {segmentDagilimi[item.harf]} şirket
            </TsbToggleButton>
          ))}
        </div>
      ) : null}

      <TsbTableShell>
        <table className={cn(tsb.table, "min-w-[900px]")}>
          <thead className={tsb.thead}>
            <tr>
              <th scope="col" className={cn(tsb.th, "min-w-[14rem] text-left")}>
                Şirket
              </th>
              <th scope="col" className={cn(tsb.th, "text-center")}>
                Segment
              </th>
              <th scope="col" className={cn(tsb.th, "text-right")}>
                Brüt prim
              </th>
              <th scope="col" className={cn(tsb.th, "text-right")}>
                Özsermaye
              </th>
              <th scope="col" className={cn(tsb.th, "text-right")}>
                Toplam aktif
              </th>
              <th scope="col" className={cn(tsb.th, "text-center")}>
                Sektör sırası
              </th>
              <th scope="col" className={cn(tsb.th, "text-center")}>
                Segment sırası
              </th>
            </tr>
          </thead>
          <tbody>
            {tablo.map((s) => (
              <tr key={s.sirketKodu} className={tsb.tbodyRow}>
                <td className={cn(tsb.td, "max-w-[220px]")}>
                  <Link
                    href={`/sigorta/finansal-karsilastirma?sirket=${s.sirketKodu}&donem=${sonPool.donem}&pool=${pool}`}
                    className="font-medium text-emerald-900 hover:underline"
                  >
                    {s.sirketAdi}
                  </Link>
                  <span className="ml-1 text-[10px] text-slate-400">{s.sirketKodu}</span>
                </td>
                <td className={cn(tsb.td, "text-center")}>
                  <SegmentBadge harf={s.olcekSegment} />
                </td>
                <td className={cn(tsb.td, "text-right tabular-nums")}>{formatOlcekTl(s.brutPrim)}</td>
                <td className={cn(tsb.td, "text-right tabular-nums")}>{formatOlcekTl(s.ozsermaye)}</td>
                <td className={cn(tsb.td, "text-right tabular-nums")}>{formatOlcekTl(s.toplamAktif)}</td>
                <td className={cn(tsb.td, "text-center font-medium tabular-nums")}>
                  {sektorSirasiMetin(s)}
                </td>
                <td className={cn(tsb.td, "text-center font-medium tabular-nums")}>
                  {segmentSirasiMetin(s)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TsbTableShell>

      {tablo.length === 0 ? (
        <p className={cn(tsb.caption, "text-center")}>Seçilen segmentte şirket bulunamadı.</p>
      ) : null}
    </div>
  );
}
