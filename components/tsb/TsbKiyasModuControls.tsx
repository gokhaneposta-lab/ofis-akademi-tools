"use client";

import type { TsbKiyasModu } from "@/lib/tsbKiyasHedef";
import type { OlcekSegmentHarfi } from "@/lib/tsbOlcekSegment";
import { cn, TsbSelect, TsbToggleButton, tsb } from "@/components/tsb/tsbDashboardUi";

type Props = {
  kiyasModu: TsbKiyasModu;
  onKiyasModuChange: (mod: TsbKiyasModu) => void;
  sektorPeerSayisi?: number;
  olcekSegment?: OlcekSegmentHarfi | null;
  olcekPeerSayisi?: number;
  kiyasListe: { kod: number; ad: string }[];
  kiyasSirketKodu: number | "";
  onKiyasSirketKoduChange: (kod: number | "") => void;
  selectId: string;
  layout?: "inline" | "stacked";
};

export default function TsbKiyasModuControls({
  kiyasModu,
  onKiyasModuChange,
  sektorPeerSayisi,
  olcekSegment,
  olcekPeerSayisi,
  kiyasListe,
  kiyasSirketKodu,
  onKiyasSirketKoduChange,
  selectId,
  layout = "stacked",
}: Props) {
  return (
    <div className={layout === "inline" ? "min-w-0 flex-1" : undefined}>
      <div className={cn(tsb.btnGroup, "mt-1")}>
        <TsbToggleButton pressed={kiyasModu === "sektor"} onClick={() => onKiyasModuChange("sektor")}>
          Sektör toplamı
        </TsbToggleButton>
        <TsbToggleButton pressed={kiyasModu === "olcek"} onClick={() => onKiyasModuChange("olcek")}>
          Benzer ölçek
        </TsbToggleButton>
        <TsbToggleButton pressed={kiyasModu === "sirket"} onClick={() => onKiyasModuChange("sirket")}>
          Diğer şirket
        </TsbToggleButton>
      </div>

      {kiyasModu === "sektor" ? (
        <p className="mt-1.5 rounded-md border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          <strong>Sektör toplamı</strong>
          {sektorPeerSayisi !== undefined ? ` (n = ${sektorPeerSayisi})` : null}
          <span className="mt-0.5 block text-[10px] leading-snug text-slate-500">
            Havuzdaki tüm şirketlerin toplamı / ortalaması.
          </span>
        </p>
      ) : kiyasModu === "olcek" ? (
        <p className="mt-1.5 rounded-md border border-sky-200/80 bg-sky-50/60 px-3 py-2 text-xs text-slate-700">
          {olcekSegment ? (
            <>
              <strong>{olcekSegment} Segmenti Ortalama</strong>
              {olcekPeerSayisi !== undefined ? ` (${olcekPeerSayisi} şirket)` : null}
            </>
          ) : (
            <strong>Benzer ölçek grubu</strong>
          )}
          <span className="mt-0.5 block text-[10px] leading-snug text-slate-500">
            Seçili şirketle aynı ölçek segmentindeki şirketlerin ortalaması — TL satırlarında aritmetik ortalama,
            oranlarda Σ pay ÷ Σ payda.
          </span>
        </p>
      ) : kiyasListe.length === 0 ? (
        <p className="mt-1.5 rounded-md border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Bu havuzda kıyaslanacak başka şirket yok.
        </p>
      ) : (
        <TsbSelect
          id={selectId}
          className="mt-1.5"
          value={kiyasSirketKodu === "" ? "" : String(kiyasSirketKodu)}
          onChange={(e) => onKiyasSirketKoduChange(e.target.value === "" ? "" : Number(e.target.value))}
        >
          {kiyasListe.map((s) => (
            <option key={s.kod} value={s.kod}>
              {s.ad} ({s.kod})
            </option>
          ))}
        </TsbSelect>
      )}
    </div>
  );
}

export function kiyasBaslikFromModu(
  mod: TsbKiyasModu,
  opts: {
    sektorPeerSayisi?: number;
    olcekSegment?: OlcekSegmentHarfi | null;
    olcekPeerSayisi?: number;
    sirketAdi?: string;
  },
): string {
  if (mod === "sektor") {
    return opts.sektorPeerSayisi !== undefined
      ? `Sektör toplamı (n = ${opts.sektorPeerSayisi})`
      : "Sektör toplamı";
  }
  if (mod === "olcek") {
    if (opts.olcekSegment && opts.olcekPeerSayisi !== undefined) {
      return `${opts.olcekSegment} Segmenti Ortalama (${opts.olcekPeerSayisi} şirket)`;
    }
    return "Benzer ölçek ortalaması";
  }
  return opts.sirketAdi ?? "Kıyas şirketi";
}
