import type { ReactNode } from "react";
import { cn, tsb } from "@/components/tsb/tsbDashboardUi";
import { formatTsbGuncellemeTarihi, type TsbVeriDurumu } from "@/lib/tsbVeriDurumu";

type Props = {
  data: TsbVeriDurumu;
  /** Hub hero içi — daha sıkı padding, mt yok */
  compact?: boolean;
  /** Hub üst bandı — açık etiketler, okunur değerler (GM raporu bağlamı) */
  variant?: "default" | "band";
};

function Hucre({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className={tsb.veriDurumuItem}>
      <p className={tsb.veriDurumuLabel}>{label}</p>
      <div className={tsb.veriDurumuValue}>{value}</div>
      {hint ? <p className={tsb.veriDurumuHint}>{hint}</p> : null}
    </div>
  );
}

function BandHucre({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-600">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function sirketSayisiMetni(hd: number, hayat: number): ReactNode {
  const hdStr = hd > 0 ? String(hd) : "—";
  const hayatStr = hayat > 0 ? String(hayat) : "—";
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      <span>{hdStr}</span>
      <span className={tsb.veriDurumuValueMuted} aria-hidden>
        /
      </span>
      <span>{hayatStr}</span>
    </span>
  );
}

function sirketKapsamMetni(hd: number, hayat: number): string {
  const hdStr = hd > 0 ? String(hd) : "—";
  const hayatStr = hayat > 0 ? String(hayat) : "—";
  return `${hdStr} hayat dışı / ${hayatStr} hayat–emeklilik`;
}

export default function TsbVeriDurumuBand({ data, compact = false, variant = "default" }: Props) {
  if (variant === "band") {
    return (
      <section
        className="rounded-xl border border-slate-200/90 bg-white px-3.5 py-3 shadow-sm sm:px-4 sm:py-3.5"
        aria-label="Veri kapsamı ve dönemler"
      >
        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          <BandHucre label="Son prim dönemi" value={data.sonPrimDonem} />
          <BandHucre label="Son finansal dönem (çeyrek)" value={data.sonFinansalDonem} />
          <BandHucre label="Kapsam" value={sirketKapsamMetni(data.sirketSayisiHd, data.sirketSayisiHayatEmeklilik)} />
          <BandHucre label="Son güncelleme" value={formatTsbGuncellemeTarihi(data.guncellemeIso)} />
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(tsb.veriDurumuWrap, compact && "mt-0 gap-1.5")}
      aria-label="Veri durumu"
    >
      <Hucre
        label="Son prim verisi"
        value={data.sonPrimDonem}
        hint={compact ? undefined : "Aylık · TSB prim istatistikleri"}
      />
      <Hucre
        label="Son finansal dönem"
        value={data.sonFinansalDonem}
        hint={compact ? undefined : "Çeyrek · gelir tablosu / bilanço"}
      />
      <Hucre
        label="Şirket sayısı"
        value={sirketSayisiMetni(data.sirketSayisiHd, data.sirketSayisiHayatEmeklilik)}
        hint={compact ? undefined : "Hayat dışı (HD) / Hayat–emeklilik"}
      />
      <Hucre
        label="Son güncelleme"
        value={formatTsbGuncellemeTarihi(data.guncellemeIso)}
        hint={compact ? undefined : "Site veri dosyaları"}
      />
    </section>
  );
}
