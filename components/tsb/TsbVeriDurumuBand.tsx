import type { ReactNode } from "react";
import { tsb } from "@/components/tsb/tsbDashboardUi";
import { formatTsbGuncellemeTarihi, type TsbVeriDurumu } from "@/lib/tsbVeriDurumu";

type Props = {
  data: TsbVeriDurumu;
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

export default function TsbVeriDurumuBand({ data }: Props) {
  return (
    <section className={tsb.veriDurumuWrap} aria-label="Veri durumu">
      <Hucre label="Son prim verisi" value={data.sonPrimDonem} hint="Aylık · TSB prim istatistikleri" />
      <Hucre label="Son finansal dönem" value={data.sonFinansalDonem} hint="Çeyrek · gelir tablosu / bilanço" />
      <Hucre
        label="Şirket sayısı"
        value={sirketSayisiMetni(data.sirketSayisiHd, data.sirketSayisiHayatEmeklilik)}
        hint="Hayat dışı (HD) / Hayat–emeklilik"
      />
      <Hucre
        label="Son güncelleme"
        value={formatTsbGuncellemeTarihi(data.guncellemeIso)}
        hint="Site veri dosyaları"
      />
    </section>
  );
}
