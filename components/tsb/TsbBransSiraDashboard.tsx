"use client";

import { useEffect, useMemo, useState } from "react";
import { useTsbBranchLookupFetch } from "@/components/tsb/useTsbBranchLookup";
import {
  applyUrlSirketOrDefault,
  useTsbDashboardUrlPrefs,
} from "@/components/tsb/useTsbDashboardUrlPrefs";
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
  tsbSiraDeltaRenk,
} from "@/components/tsb/tsbDashboardUi";
import type { BransSiraSatir } from "@/lib/tsbBransSira";
import { buildBransSiraTablosu, listSirketlerSiraOzeti } from "@/lib/tsbBransSira";
import TsbOlcekSegmentRozeti from "@/components/tsb/TsbOlcekSegmentRozeti";
import { useOlcekSegmentKayit } from "@/components/tsb/useOlcekSegmentKayit";
import type { TsbKanalField, TsbPrimDaraltmaModu, TsbPrimRow } from "@/lib/tsbPrimDashboard";
import {
  daraltmaFromUiState,
  isTsbToplamSirketKodu,
  prevYearPeriod,
  resolveDefaultSirketKodu,
  sirketSegmentFromKodu,
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

function deltaMetin(delta: number | null): string {
  if (delta === null) return "—";
  if (delta === 0) return "0";
  const arrow = delta < 0 ? "↑" : "↓";
  return `${arrow} ${Math.abs(delta)}`;
}

function agirlikHucre(v: number | null): string {
  if (v === null) return "—";
  return `${pf.format(v)}%`;
}

function Satir({
  satir,
  portfoy,
}: {
  satir: BransSiraSatir;
  portfoy?: boolean;
}) {
  const rowCls = portfoy ? "bg-slate-100/90 font-semibold" : "";
  const stickyBg = portfoy ? "bg-slate-100/90" : undefined;
  const siraBuStr =
    satir.siraBu !== null ? `${satir.siraBu} / ${satir.katilimciBu}` : "—";
  const siraOcStr =
    satir.siraOnceki !== null ? `${satir.siraOnceki} / ${satir.katilimciOnceki}` : "—";

  return (
    <tr className={cn(tsb.tbodyRow, rowCls)}>
      <td className={cn(tsb.tdSticky, "whitespace-nowrap text-xs", stickyBg)}>{satir.anaBransH}</td>
      <td className={cn(tsb.td, "text-right")}>{nf.format(satir.prim)}</td>
      <td className={cn(tsb.td, "text-right text-slate-600")}>{agirlikHucre(satir.sirketAgirlikBuYuzde)}</td>
      <td className={cn(tsb.td, "text-right text-slate-600")}>{agirlikHucre(satir.sektorAgirlikBuYuzde)}</td>
      <td className={cn(tsb.td, "text-center font-medium")}>{siraBuStr}</td>
      <td className={cn(tsb.td, "text-center text-slate-600")}>{siraOcStr}</td>
      <td className={cn(tsb.td, "text-center", tsbSiraDeltaRenk(satir.siraDelta))}>{deltaMetin(satir.siraDelta)}</td>
    </tr>
  );
}

export default function TsbBransSiraDashboard() {
  const urlPrefs = useTsbDashboardUrlPrefs();
  const [rows, setRows] = useState<TsbPrimRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [donem, setDonem] = useState("");
  const [kanal, setKanal] = useState<TsbKanalField>("genelToplam");
  const [filtreModu, setFiltreModu] = useState<TsbPrimDaraltmaModu>("anaBransH");
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

  useEffect(() => {
    if (donemler.length === 0 || donem) return;
    if (urlPrefs.donem && donemler.includes(urlPrefs.donem)) {
      setDonem(urlPrefs.donem);
    }
  }, [donemler, donem, urlPrefs.donem]);

  const daraltma = useMemo(
    () => daraltmaFromUiState(filtreModu, "", "", branchLookup),
    [filtreModu, branchLookup],
  );

  const sirketler = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return listSirketlerSiraOzeti(rows, secilenDonem, kanal, daraltma);
  }, [rows, secilenDonem, kanal, daraltma]);

  useEffect(() => {
    if (sirketler.length === 0) return;
    applyUrlSirketOrDefault(sirketler, urlPrefs.sirket, sirketKodu, setSirketKodu, "any");
  }, [sirketler, sirketKodu, urlPrefs.sirket]);

  const effectiveSirketKodu = useMemo(() => {
    if (sirketler.length === 0) return null;
    if (sirketKodu !== "" && sirketler.some((s) => s.kod === sirketKodu)) return sirketKodu as number;
    return resolveDefaultSirketKodu(sirketler, "any");
  }, [sirketler, sirketKodu]);

  const tablo = useMemo(() => {
    if (!rows || !secilenDonem || effectiveSirketKodu === null) return null;
    return buildBransSiraTablosu(rows, secilenDonem, kanal, effectiveSirketKodu, daraltma);
  }, [rows, secilenDonem, kanal, effectiveSirketKodu, daraltma]);

  const secilenAd = sirketler.find((s) => s.kod === effectiveSirketKodu)?.ad ?? "";
  const primSegment =
    rows && effectiveSirketKodu !== null ? sirketSegmentFromKodu(rows, effectiveSirketKodu) : "hayatdisi";
  const { kayit: olcekKayit, yukleniyor: olcekYukleniyor } = useOlcekSegmentKayit(
    effectiveSirketKodu !== null && secilenDonem
      ? {
          kaynak: "prim",
          donem: secilenDonem,
          segment: primSegment,
          sirketKodu: effectiveSirketKodu,
          sirketAdi: secilenAd,
        }
      : null,
  );

  if (error) return <TsbError message={error} />;
  if (!rows) return <TsbLoading />;
  if (sirketler.length === 0) {
    return <p className={tsb.alertWarn}>Bu kanal ve dönem için şirket verisi bulunamadı.</p>;
  }
  if (!tablo) {
    return (
      <p className={tsb.alertWarn}>
        Seçilen dönem için önceki yılın aynı ayı bulunamadığından sıra tablosu oluşturulamıyor.
      </p>
    );
  }

  const kolonBaslik = tablo.kirisumModu === "anaBransH" ? "Branş" : "Tarife grubu";
  const gosterHd = tablo.hayatdisiPortfoy.prim > 0;
  const gosterHy = tablo.hayatPortfoy.prim > 0;
  const colSpanSection = 7;

  return (
    <div className={tsb.dashboardStack}>
      <TsbFilterBar>
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
          Satır listesi ana branş veya tarife moduna göre değişir. Hayat dışı üretimi olmayan şirketlerde{" "}
          <strong>TRAFİK HARİÇ TOPLAM</strong> satırı gösterilmez.
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
            label="Dönem"
            className="sm:col-span-3"
            hint={
              <>
                Sıralar <strong>{tablo.donemBu}</strong> ve <strong>{tablo.donemOnceki}</strong> primlerine göre
              </>
            }
          >
            <TsbSelect className="max-w-xs" value={secilenDonem} onChange={(e) => setDonem(e.target.value)}>
              {donemler.map((d) => (
                <option key={d} value={d}>
                  {d} · sıra kıyası {prevYearPeriod(d) ?? "—"}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
        </TsbFilterGrid>
      </TsbFilterBar>

      {secilenAd ? (
        <TsbOlcekSegmentRozeti sirketAdi={secilenAd} kayit={olcekKayit} yukleniyor={olcekYukleniyor} />
      ) : null}

      <p className={cn(tsb.filterBar, tsb.filterHint, "!mt-0")}>
        <strong>Sıra:</strong> Kanaldaki prim üretimine göre sektör içi yarışma sırası (1 en yüksek prim).{" "}
        <strong>Δ sıra:</strong> Önceki yıla göre sıra farkı; sayının azalması iyileşmedir.
      </p>

      <TsbTableShell>
        <table className={cn(tsb.table, "min-w-[920px]")}>
          <thead className={tsb.thead}>
            <tr>
              <th className={tsb.thSticky}>{kolonBaslik}</th>
              <th className={tsb.thRight}>
                Prim ({tablo.donemBu}) · {secilenAd.slice(0, 22)}
                {secilenAd.length > 22 ? "…" : ""}
              </th>
              <th className={tsb.thRight}>Branş ağırlığı</th>
              <th className={tsb.thRight}>Sektör ağırlığı</th>
              <th className={tsb.thCenter}>Sıra ({tablo.donemBu})</th>
              <th className={tsb.thCenter}>Sıra ({tablo.donemOnceki})</th>
              <th className={tsb.thCenter}>Δ sıra</th>
            </tr>
          </thead>
          <tbody>
            {gosterHd && (
              <>
                <tr className="bg-emerald-50/70">
                  <td colSpan={colSpanSection} className="px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-emerald-900">
                    Hayat dışı {tablo.kirisumModu === "tarifeGrubu" ? "(tarife)" : "branşları"}
                  </td>
                </tr>
                {tablo.hayatdisiBranslar.map((s) => (
                  <Satir key={`hd-${s.anaBransH}`} satir={s} />
                ))}
                {tablo.hayatdisiTrafikHaricPortfoy && <Satir satir={tablo.hayatdisiTrafikHaricPortfoy} portfoy />}
                <Satir satir={tablo.hayatdisiPortfoy} portfoy />
              </>
            )}
            {gosterHy && (
              <>
                <tr className="bg-sky-50/70">
                  <td colSpan={colSpanSection} className="px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-sky-900">
                    Hayat &amp; emeklilik {tablo.kirisumModu === "tarifeGrubu" ? "(tarife)" : "branşları"}
                  </td>
                </tr>
                {tablo.hayatBranslar.map((s) => (
                  <Satir key={`hy-${s.anaBransH}`} satir={s} />
                ))}
                <Satir satir={tablo.hayatPortfoy} portfoy />
              </>
            )}
            {!gosterHd && !gosterHy && (
              <tr>
                <td colSpan={colSpanSection} className={cn(tsb.td, "py-6 text-center text-slate-600")}>
                  Bu kanal ve ay için şirketin hayat dışı veya hayat–emeklilik üretimi görünmüyor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TsbTableShell>
    </div>
  );
}
