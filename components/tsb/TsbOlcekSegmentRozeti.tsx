"use client";

import type { OlcekSegmentSirketKayit } from "@/lib/tsbOlcekSegment";
import { SEGMENT_BADGE_CLASS } from "@/components/tsb/TsbOlcekSegmentHubKart";
import { cn, tsb } from "@/components/tsb/tsbDashboardUi";

type Props = {
  sirketAdi: string;
  kayit: OlcekSegmentSirketKayit | null;
  yukleniyor?: boolean;
  className?: string;
};

export default function TsbOlcekSegmentRozeti({ sirketAdi, kayit, yukleniyor, className }: Props) {
  if (yukleniyor) {
    return (
      <div className={cn(tsb.olcekSegmentKart, className)}>
        <p className="text-xs text-slate-500">Ölçek segmenti yükleniyor…</p>
      </div>
    );
  }

  if (!kayit) return null;

  return (
    <div className={cn(tsb.olcekSegmentKart, className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{sirketAdi}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-600">Ölçek Segmenti:</span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${SEGMENT_BADGE_CLASS[kayit.olcekSegment]}`}
            >
              {kayit.olcekSegment}
            </span>
            <span className="text-xs font-medium text-slate-800">{kayit.olcekSegmentAdi}</span>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Sektör Sırası:{" "}
            <strong className="tabular-nums text-slate-800">
              {kayit.olcekSirasi} / {kayit.peerSayisi}
            </strong>
            <span className="mx-2 text-slate-300">·</span>
            Segment Sırası:{" "}
            {kayit.segmentSirasi > 0 && kayit.segmentPeerSayisi > 0 ? (
              <strong className="tabular-nums text-slate-800">
                {kayit.segmentSirasi} / {kayit.segmentPeerSayisi}
              </strong>
            ) : (
              <span className="text-slate-500">—</span>
            )}
            <span className="ml-2 text-slate-500">· Skor: {kayit.olcekSkoru.toFixed(1)}</span>
          </p>
        </div>
      </div>

      <details className={tsb.olcekSegmentMetodolojiWrap}>
        <summary className={tsb.olcekSegmentMetodolojiBtn}>Bu segment nasıl hesaplandı?</summary>
        <div className={tsb.olcekSegmentMetodolojiPanel}>
          <p className="font-semibold text-slate-800">Ölçek Segmenti;</p>
          <ul className="mt-1 list-inside list-disc text-[11px] leading-relaxed text-slate-600">
            <li>Brüt Prim (%50)</li>
            <li>Özsermaye (%30)</li>
            <li>Toplam Aktif (%20)</li>
          </ul>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            kullanılarak hesaplanır. Segment performans değil, şirketin sektördeki göreli büyüklüğünü ifade eder.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            Segment ortalamaları aynı ölçek grubunda yer alan şirketlerin ortalama değerlerinden oluşur. Segment
            skoru ve sıralamalar yalnızca aynı havuz (Hayat Dışı veya Hayat/Emeklilik) içindeki şirketlerle
            karşılaştırılır.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            Finansal karşılaştırmada segment ortalaması: TL satırlarında aritmetik ortalama; oran satırlarında
            Σ pay ÷ Σ payda (havuzlanmış oran).
          </p>
        </div>
      </details>
    </div>
  );
}
