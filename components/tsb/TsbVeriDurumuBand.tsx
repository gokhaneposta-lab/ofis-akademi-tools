import { tsb } from "@/components/tsb/tsbDashboardUi";
import { formatTsbGuncellemeTarihi, type TsbVeriDurumu } from "@/lib/tsbVeriDurumu";

type Props = {
  data: TsbVeriDurumu;
};

function Hucre({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={tsb.veriDurumuItem}>
      <p className={tsb.veriDurumuLabel}>{label}</p>
      <p className={tsb.veriDurumuValue}>{value}</p>
      {hint ? <p className={tsb.veriDurumuHint}>{hint}</p> : null}
    </div>
  );
}

export default function TsbVeriDurumuBand({ data }: Props) {
  const sirket =
    data.sirketSayisiHd > 0 ? String(data.sirketSayisiHd) : "—";

  return (
    <section className={tsb.veriDurumuWrap} aria-label="Veri durumu">
      <Hucre label="Son prim verisi" value={data.sonPrimDonem} hint="Aylık · TSB prim istatistikleri" />
      <Hucre label="Son finansal dönem" value={data.sonFinansalDonem} hint="Çeyrek · gelir tablosu / bilanço" />
      <Hucre label="Şirket sayısı" value={sirket} hint="Hayat dışı (HD) havuzu" />
      <Hucre
        label="Son güncelleme"
        value={formatTsbGuncellemeTarihi(data.guncellemeIso)}
        hint="Site veri dosyaları"
      />
    </section>
  );
}
