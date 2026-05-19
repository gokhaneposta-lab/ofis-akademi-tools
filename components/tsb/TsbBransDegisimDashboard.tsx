"use client";

import { useEffect, useMemo, useState } from "react";
import { useTsbBranchLookupFetch } from "@/components/tsb/useTsbBranchLookup";
import {
  cn,
  tsb,
  TsbError,
  TsbFilterBar,
  TsbFilterField,
  TsbFilterGrid,
  TsbLoading,
  TsbSelect,
  TsbTableShell,
  TsbToggleButton,
} from "@/components/tsb/tsbDashboardUi";
import type { BransDegisimSatir } from "@/lib/tsbBransDegisim";
import { buildBransDegisimTablosu } from "@/lib/tsbBransDegisim";
import type { TsbKanalField, TsbPrimDaraltmaModu, TsbPrimRow, TsbSektorSegment } from "@/lib/tsbPrimDashboard";
import {
  daraltmaFromUiState,
  isTsbToplamSirketKodu,
  listSirketlerSegmentDonem,
  prevYearPeriod,
  resolveDefaultSirketKodu,
  uniqueSortedPeriods,
} from "@/lib/tsbPrimDashboard";

const KANALLAR: { value: TsbKanalField; label: string }[] = [
  { value: "genelToplam", label: "Tüm kanallar" },
  { value: "acente", label: "Acente" },
  { value: "banka", label: "Banka" },
  { value: "broker", label: "Broker" },
  { value: "diger", label: "Diğer" },
  { value: "merkez", label: "Merkez" },
];

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

function sirketDegisimRenk(satir: BransDegisimSatir): string {
  const a = satir.sirketDegisim;
  const b = satir.sektorDegisim;
  if (a === null || b === null) return "text-gray-900";
  if (a >= b) return "text-emerald-700 font-semibold";
  return "text-red-600 font-semibold";
}

function SatirHucresi({
  satir,
  araToplam,
}: {
  satir: BransDegisimSatir;
  araToplam?: boolean;
}) {
  const rowCls = araToplam ? "bg-slate-100/90 font-semibold" : "";
  return (
    <tr className={cn(tsb.tbodyRow, rowCls)}>
      <td className={cn(tsb.tdSticky, "whitespace-nowrap text-xs", araToplam && "bg-slate-100/90")}>
        {satir.anaBransH}
      </td>
      <td className={cn(tsb.td, "text-right")}>{nf.format(satir.sirketPrimOnceki)}</td>
      <td className={cn(tsb.td, "text-right")}>{nf.format(satir.sirketPrimBu)}</td>
      <td className={cn(tsb.td, "text-right", sirketDegisimRenk(satir))}>
        {satir.sirketDegisim === null ? "—" : `${pf.format(satir.sirketDegisim)}%`}
      </td>
      <td className={cn(tsb.td, "text-right text-slate-600")}>{nf.format(satir.sektorPrimOnceki)}</td>
      <td className={cn(tsb.td, "text-right text-slate-600")}>{nf.format(satir.sektorPrimBu)}</td>
      <td className={cn(tsb.td, "text-right text-slate-600")}>
        {satir.sektorDegisim === null ? "—" : `${pf.format(satir.sektorDegisim)}%`}
      </td>
      <td className={cn(tsb.td, "text-right text-slate-600")}>{pf.format(satir.payOncekiYuzde)}%</td>
      <td className={cn(tsb.td, "text-right text-slate-600")}>{pf.format(satir.payBuYuzde)}%</td>
      <td className={cn(tsb.td, "text-right text-slate-600")}>{pf.format(satir.payDegisimPp)} pp</td>
    </tr>
  );
}

export default function TsbBransDegisimDashboard() {
  const [rows, setRows] = useState<TsbPrimRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [donem, setDonem] = useState("");
  const [kanal, setKanal] = useState<TsbKanalField>("genelToplam");
  const [filtreModu, setFiltreModu] = useState<TsbPrimDaraltmaModu>("anaBransH");
  const [segment, setSegment] = useState<TsbSektorSegment>("hayatdisi");
  const [sirketKodu, setSirketKodu] = useState<number | "">("");

  const branchLookup = useTsbBranchLookupFetch();

  useEffect(() => {
    let cancelled = false;
    fetch("/data/tsb/prim-tidy.json")
      .then((r) => {
        if (!r.ok) throw new Error(`Veri yüklenemedi (${r.status})`);
        return r.json();
      })
      .then((data: TsbPrimRow[]) => {
        if (cancelled) return;
        if (!Array.isArray(data)) throw new Error("Geçersiz veri formatı");
        setRows(data.filter((row) => !isTsbToplamSirketKodu(row.sirketKodu)));
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Yükleme hatası");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const donemler = useMemo(() => (rows ? uniqueSortedPeriods(rows) : []), [rows]);
  const sonDonem = donemler.length ? donemler[donemler.length - 1] : "";
  const secilenDonem = donem || sonDonem;

  const daraltma = useMemo(
    () => daraltmaFromUiState(filtreModu, "", "", branchLookup),
    [filtreModu, branchLookup],
  );

  const sirketler = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return listSirketlerSegmentDonem(rows, secilenDonem, kanal, segment, daraltma);
  }, [rows, secilenDonem, kanal, segment, daraltma]);

  useEffect(() => {
    if (sirketler.length === 0) return;
    if (sirketKodu === "" || !sirketler.some((s) => s.kod === sirketKodu)) {
      const kod = resolveDefaultSirketKodu(sirketler, segment === "hayatdisi" ? "hayatdisi" : "hayat");
      if (kod !== null) setSirketKodu(kod);
    }
  }, [sirketler, sirketKodu, segment]);

  const effectiveSirketKodu = useMemo(() => {
    if (sirketler.length === 0) return null;
    if (sirketKodu !== "" && sirketler.some((s) => s.kod === sirketKodu)) return sirketKodu as number;
    return resolveDefaultSirketKodu(sirketler, segment === "hayatdisi" ? "hayatdisi" : "hayat");
  }, [sirketler, sirketKodu, segment]);

  const tablo = useMemo(() => {
    if (!rows || !secilenDonem || effectiveSirketKodu === null) return null;
    return buildBransDegisimTablosu(rows, secilenDonem, kanal, effectiveSirketKodu, daraltma);
  }, [rows, secilenDonem, kanal, effectiveSirketKodu, daraltma]);

  if (error) return <TsbError message={error} />;
  if (!rows) return <TsbLoading />;
  if (sirketler.length === 0) {
    const havuz = segment === "hayatdisi" ? "hayat dışı" : "hayat ve emeklilik";
    return (
      <p className={tsb.alertWarn}>
        Bu kanal ve dönem için <strong>{havuz}</strong> şirket verisi bulunamadı; şirket seçilemiyor.
      </p>
    );
  }
  if (!tablo) {
    return (
      <p className={tsb.alertWarn}>
        Seçilen dönem için bir önceki yılın aynı ayı bulunamadığından tablo oluşturulamıyor.
      </p>
    );
  }

  const secilenAd = sirketler.find((s) => s.kod === effectiveSirketKodu)?.ad ?? "";
  const kolonBaslik =
    tablo.kirisumModu === "anaBransH" ? "Branş" : "Tarife grubu";

  return (
    <div className={tsb.dashboardStack}>
      <TsbFilterBar>
        <p className={tsb.filterSectionLabel}>Sektör görünümü (şirket listesi)</p>
        <div className={cn(tsb.btnGroup, "mb-3")}>
          <TsbToggleButton pressed={segment === "hayatdisi"} variant="segment" onClick={() => setSegment("hayatdisi")}>
            Hayat dışı
          </TsbToggleButton>
          <TsbToggleButton pressed={segment === "hayat"} variant="segment" onClick={() => setSegment("hayat")}>
            Hayat &amp; emeklilik
          </TsbToggleButton>
        </div>
        <p className={tsb.filterSectionLabel}>Daraltma türü</p>
        <div className={cn(tsb.btnGroup, "mb-2")}>
          <TsbToggleButton pressed={filtreModu === "anaBransH"} onClick={() => setFiltreModu("anaBransH")}>
            Ana branş (TSB)
          </TsbToggleButton>
          <TsbToggleButton pressed={filtreModu === "tarifeGrubu"} onClick={() => setFiltreModu("tarifeGrubu")}>
            Tarife grubu
          </TsbToggleButton>
        </div>
        <p className={tsb.filterHint}>
          <strong>Şirket</strong> listesi seçilen görünüme göre filtrelenir. Tablo hem hayat dışı hem hayat–emeklilik
          bloklarını gösterir.
        </p>
      </TsbFilterBar>

      <TsbFilterBar>
        <TsbFilterGrid className="sm:grid-cols-3">
          <TsbFilterField label="Kanal">
            <TsbSelect value={kanal} onChange={(e) => setKanal(e.target.value as TsbKanalField)}>
              {KANALLAR.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
          <TsbFilterField label="Şirket" className="sm:col-span-2">
            <TsbSelect
              value={effectiveSirketKodu !== null ? String(effectiveSirketKodu) : ""}
              onChange={(e) => setSirketKodu(Number(e.target.value))}
            >
              {sirketler.map((s) => (
                <option key={s.kod} value={s.kod}>
                  {s.ad} ({s.kod})
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
          <TsbFilterField
            label="Dönem (karşılaştırma ayı)"
            className="sm:col-span-3"
            hint={
              <>
                Tablo: <strong>{tablo.donemOnceki}</strong> vs <strong>{tablo.donemBu}</strong>
              </>
            }
          >
            <TsbSelect className="max-w-xs" value={secilenDonem} onChange={(e) => setDonem(e.target.value)}>
              {donemler.map((d) => (
                <option key={d} value={d}>
                  {d} · önceki yıl {prevYearPeriod(d) ?? "—"}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
        </TsbFilterGrid>
      </TsbFilterBar>

      <p className={cn(tsb.filterBar, tsb.filterHint, "!mt-0")}>
        <strong>Şirket değişim (%)</strong> hücreleri sektörün yıllık değişim oranı ile karşılaştırılarak
        renklendirilir. <strong>Pazar payı</strong> sütunları pp farkını gösterir.
      </p>

      <TsbTableShell>
        <table className={cn(tsb.table, "min-w-[920px]")}>
          <thead className={tsb.thead}>
            <tr>
              <th rowSpan={2} className={cn(tsb.thSticky, "min-w-[8rem]")}>
                {kolonBaslik}
              </th>
              <th colSpan={3} className={cn(tsb.thCenter, "border-l border-slate-200 bg-emerald-50/60 text-emerald-900")}>
                {secilenAd.slice(0, 42)}
                {secilenAd.length > 42 ? "…" : ""}
              </th>
              <th colSpan={3} className={cn(tsb.thCenter, "border-l border-slate-200")}>
                Sektör prim
              </th>
              <th colSpan={3} className={cn(tsb.thCenter, "border-l border-slate-200")}>
                Pazar payı
              </th>
            </tr>
            <tr>
              <th className={cn(tsb.thRight, "border-l border-slate-100")}>{tablo.donemOnceki}</th>
              <th className={tsb.thRight}>{tablo.donemBu}</th>
              <th className={cn(tsb.thRight, "border-r border-slate-200")}>Değişim %</th>
              <th className={tsb.thRight}>{tablo.donemOnceki}</th>
              <th className={tsb.thRight}>{tablo.donemBu}</th>
              <th className={cn(tsb.thRight, "border-r border-slate-200")}>Değişim %</th>
              <th className={tsb.thRight}>{tablo.donemOnceki}</th>
              <th className={tsb.thRight}>{tablo.donemBu}</th>
              <th className={tsb.thRight}>Δ pp</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-emerald-50/70">
              <td
                colSpan={10}
                className="sticky left-0 bg-emerald-50/70 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-emerald-900"
              >
                Hayat dışı {tablo.kirisumModu === "tarifeGrubu" ? "(tarife)" : "branşları"}
              </td>
            </tr>
            {tablo.hayatdisiBranslar.map((s) => (
              <SatirHucresi key={`hd-${s.anaBransH}`} satir={s} />
            ))}
            {tablo.hayatdisiTrafikHaricToplam && (
              <SatirHucresi satir={tablo.hayatdisiTrafikHaricToplam} araToplam />
            )}
            <SatirHucresi satir={tablo.hayatdisiToplam} araToplam />
            <tr className="bg-sky-50/70">
              <td colSpan={10} className="px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-sky-900">
                Hayat &amp; emeklilik {tablo.kirisumModu === "tarifeGrubu" ? "(tarife)" : "(TSB ana branş)"}
              </td>
            </tr>
            {tablo.hayatBranslar.map((s) => (
              <SatirHucresi key={`hy-${s.anaBransH}`} satir={s} />
            ))}
            <SatirHucresi satir={tablo.hayatToplam} araToplam />
            <SatirHucresi satir={tablo.genelToplam} araToplam />
          </tbody>
        </table>
      </TsbTableShell>
    </div>
  );
}
