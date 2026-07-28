"use client";

import { useEffect, useMemo, useState } from "react";
import {
  applyUrlSirketOrDefault,
  useTsbDashboardUrlPrefs,
} from "@/components/tsb/useTsbDashboardUrlPrefs";
import TsbKiyasModuControls, { kiyasBaslikFromModu } from "@/components/tsb/TsbKiyasModuControls";
import TsbOlcekSegmentRozeti from "@/components/tsb/TsbOlcekSegmentRozeti";
import { useOlcekSegmentKayit } from "@/components/tsb/useOlcekSegmentKayit";
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
import {
  buildAnaBransTkzOzet,
  type AnaBransTkzKiyasHedef,
  type AnaBransTkzSatir,
} from "@/lib/tsbAnaBransTkz";
import {
  fetchGelirTidyDonemIndex,
  fetchGelirTidyDonemler,
} from "@/lib/tsbGelirTidyFetch";
import type { TsbKiyasModu } from "@/lib/tsbKiyasHedef";
import type { SegmentSkorPool } from "@/lib/tsbSirketSegmentSkor";
import { listSirketleriGelirDonemForPool } from "@/lib/tsbFinansalKarsilastirmaData";
import type { TsbGelirTidyRowLike } from "@/lib/tsbYatirimGeliriKpi";

const POOL_LABELS: Record<SegmentSkorPool, string> = {
  HD: "Hayat dışı (HD)",
  HAYAT_EMEKLILIK: "Hayat / Emeklilik",
};

function defaultSirketModForPool(pool: SegmentSkorPool): "hayatdisi" | "hayat" {
  return pool === "HD" ? "hayatdisi" : "hayat";
}

function formatTl(v: number): string {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(v);
}

function shortLabel(mod: TsbKiyasModu, baslik: string): string {
  if (mod === "sektor") return "Sektör toplamı";
  if (mod === "olcek") return baslik.length > 32 ? `${baslik.slice(0, 32)}…` : baslik;
  return baslik.length > 36 ? `${baslik.slice(0, 36)}…` : baslik;
}

function Satir({ satir, toplam = false }: { satir: AnaBransTkzSatir; toplam?: boolean }) {
  return (
    <tr className={cn(tsb.tbodyRow, toplam && "bg-slate-100/90 font-semibold")}>
      <td className={cn(tsb.tdSticky, "whitespace-nowrap text-xs", toplam && "bg-slate-100/90")}>
        {satir.anaBransH}
      </td>
      <td className={cn(tsb.td, "text-right")}>{formatTl(satir.sirketTeknikGelir)}</td>
      <td className={cn(tsb.td, "text-right")}>{formatTl(satir.sirketTeknikGider)}</td>
      <td className={cn(tsb.td, "border-r border-slate-200 text-right font-semibold")}>{formatTl(satir.sirketTkz)}</td>
      <td className={cn(tsb.td, "text-right text-slate-700")}>{formatTl(satir.kiyasTeknikGelir)}</td>
      <td className={cn(tsb.td, "text-right text-slate-700")}>{formatTl(satir.kiyasTeknikGider)}</td>
      <td className={cn(tsb.td, "text-right font-semibold text-slate-900")}>{formatTl(satir.kiyasTkz)}</td>
    </tr>
  );
}

export default function TsbAnaBransTkzDashboard() {
  const urlPrefs = useTsbDashboardUrlPrefs();
  const [tumDonemler, setTumDonemler] = useState<string[]>([]);
  const [rows, setRows] = useState<TsbGelirTidyRowLike[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pool, setPool] = useState<SegmentSkorPool>(urlPrefs.pool ?? "HD");
  const [sirketKodu, setSirketKodu] = useState<number | "">("");
  const [kiyasModu, setKiyasModu] = useState<TsbKiyasModu>("sektor");
  const [kiyasSirketKodu, setKiyasSirketKodu] = useState<number | "">("");

  useEffect(() => {
    let cancelled = false;
    fetchGelirTidyDonemIndex()
      .then((donemler) => {
        if (!cancelled) setTumDonemler(donemler);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Dönem listesi yüklenemedi");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const donem = tumDonemler.length > 0 ? tumDonemler[tumDonemler.length - 1] : "";

  useEffect(() => {
    if (!donem) return;
    let cancelled = false;
    setRows(null);
    fetchGelirTidyDonemler([donem])
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Veri yüklenemedi");
      });
    return () => {
      cancelled = true;
    };
  }, [donem]);

  const sirketListesi = useMemo(() => {
    if (!rows || !donem) return [];
    return listSirketleriGelirDonemForPool(rows, donem, pool);
  }, [rows, donem, pool]);

  useEffect(() => {
    if (sirketListesi.length === 0) return;
    applyUrlSirketOrDefault(
      sirketListesi,
      urlPrefs.sirket,
      sirketKodu,
      setSirketKodu,
      defaultSirketModForPool(pool),
    );
  }, [sirketListesi, urlPrefs.sirket, sirketKodu, pool]);

  const kiyasListe = useMemo(
    () => sirketListesi.filter((s) => s.kod !== sirketKodu),
    [sirketListesi, sirketKodu],
  );

  useEffect(() => {
    if (kiyasModu !== "sirket" || kiyasListe.length === 0) return;
    if (kiyasListe.some((s) => s.kod === kiyasSirketKodu)) return;
    setKiyasSirketKodu(kiyasListe[0].kod);
  }, [kiyasListe, kiyasModu, kiyasSirketKodu]);

  const kiyasHedef: AnaBransTkzKiyasHedef = useMemo(() => {
    if (kiyasModu === "sektor") return { mod: "sektor" };
    if (kiyasModu === "olcek") return { mod: "olcek" };
    if (kiyasSirketKodu === "") return { mod: "sektor" };
    return { mod: "sirket", sirketKodu: kiyasSirketKodu };
  }, [kiyasModu, kiyasSirketKodu]);

  const ozet = useMemo(() => {
    if (!rows || !donem || sirketKodu === "") return null;
    return buildAnaBransTkzOzet(rows, donem, sirketKodu, pool, kiyasHedef);
  }, [rows, donem, sirketKodu, pool, kiyasHedef]);

  const secilenAd =
    sirketListesi.find((s) => s.kod === sirketKodu)?.ad ??
    (sirketKodu === "" ? "" : `Şirket ${sirketKodu}`);

  const { kayit: olcekKayit, finDonem: olcekFinDonem } = useOlcekSegmentKayit(
    rows && donem && sirketKodu !== ""
      ? {
          kaynak: "gelir",
          rows,
          donem,
          pool,
          sirketKodu,
          sirketAdi: secilenAd,
        }
      : null,
  );

  const kiyasBaslik = useMemo(() => {
    if (kiyasModu === "sirket") {
      const ad = kiyasListe.find((s) => s.kod === kiyasSirketKodu)?.ad;
      return ad ?? "Kıyas şirketi";
    }
    return kiyasBaslikFromModu(kiyasModu, {
      sektorPeerSayisi: ozet?.peerSayisi,
      olcekSegment: ozet?.kiyasOlcekSegment,
      olcekPeerSayisi: ozet?.kiyasMod === "olcek" ? ozet.peerSayisi : undefined,
    });
  }, [kiyasListe, kiyasModu, kiyasSirketKodu, ozet]);

  if (error) return <TsbError message={error} />;
  if (tumDonemler.length === 0) return <TsbLoading message="Finansal dönem listesi yükleniyor…" />;
  if (!rows || !donem || sirketKodu === "" || !ozet) return <TsbLoading message="Ana branş TKZ tablosu hazırlanıyor…" />;

  return (
    <div className={tsb.dashboardStack}>
      <TsbFilterBar>
        <p className={tsb.filterSectionLabel}>Sektör havuzu</p>
        <div role="tablist" aria-label="Sektör havuzu" className={cn(tsb.btnGroup, "mb-3")}>
          {(["HD", "HAYAT_EMEKLILIK"] as const).map((p) => (
            <TsbToggleButton
              key={p}
              pressed={pool === p}
              variant="segment"
              onClick={() => {
                setPool(p);
                setSirketKodu("");
                setKiyasModu("sektor");
              }}
            >
              {POOL_LABELS[p]}
            </TsbToggleButton>
          ))}
        </div>

        <TsbFilterGrid>
          <TsbFilterField
            label="Finansal dönem"
            hint={
              <>
                Dashboard her zaman son finansal dönemi baz alır: <strong>{donem}</strong>
              </>
            }
          >
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              {donem}
            </div>
          </TsbFilterField>

          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <span className={tsb.filterLabel}>Tablo karşılaştırması</span>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
              Sol blok seçili şirket; sağ blok sektör toplamı, benzer ölçek ortalaması veya başka bir şirket.
            </p>
            <div className="mt-2 flex flex-col gap-3 rounded-lg border border-slate-200/90 bg-white/80 p-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                  Sol blok — şirket
                </span>
                <TsbSelect
                  id="tkz-ana-sirket"
                  className="mt-1"
                  value={String(sirketKodu)}
                  onChange={(e) => setSirketKodu(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  {sirketListesi.map((s) => (
                    <option key={s.kod} value={s.kod}>
                      {s.ad} ({s.kod})
                    </option>
                  ))}
                </TsbSelect>
              </div>

              <div className="hidden shrink-0 self-center px-1 text-sm font-semibold text-slate-400 sm:block sm:pb-2" aria-hidden>
                vs
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  Sağ blok — kıyas
                </span>
                <TsbKiyasModuControls
                  kiyasModu={kiyasModu}
                  onKiyasModuChange={setKiyasModu}
                  sektorPeerSayisi={ozet.peerSayisi}
                  olcekSegment={ozet.kiyasOlcekSegment}
                  olcekPeerSayisi={ozet.kiyasMod === "olcek" ? ozet.peerSayisi : undefined}
                  kiyasListe={kiyasListe}
                  kiyasSirketKodu={kiyasSirketKodu}
                  onKiyasSirketKoduChange={setKiyasSirketKodu}
                  selectId="tkz-ana-kiyas-sirket"
                />
              </div>
            </div>
          </div>
        </TsbFilterGrid>

        <p className={tsb.filterHint}>
          Satırlar <strong>TSB ana branş</strong> etiketleriyle gösterilir; teknik hesap GT branşlarından türetilir.
        </p>
      </TsbFilterBar>

      {secilenAd ? <TsbOlcekSegmentRozeti sirketAdi={secilenAd} kayit={olcekKayit} finDonem={olcekFinDonem} /> : null}

      <p className={cn(tsb.filterBar, tsb.filterHint, "!mt-0")}>
        <strong>{POOL_LABELS[pool]}</strong> · Teknik gelir = <strong>gelir - 603</strong> · Teknik gider ={" "}
        <strong>gider - 02..06</strong> · TKZ = <strong>teknik gelir + teknik gider</strong>.
      </p>

      <TsbTableShell>
        <table className={cn(tsb.table, "min-w-[860px]")}>
          <thead className={tsb.thead}>
            <tr>
              <th rowSpan={2} className={cn(tsb.thSticky, "min-w-[13rem]")}>
                Ana branş
              </th>
              <th colSpan={3} className="border-l border-slate-200 bg-emerald-50/60 px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-emerald-900">
                {secilenAd}
              </th>
              <th colSpan={3} className="border-l border-slate-200 bg-slate-100/80 px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-800">
                {shortLabel(kiyasModu, kiyasBaslik)}
              </th>
            </tr>
            <tr>
              <th className={cn(tsb.thRight, "border-l border-slate-100")}>Teknik Gelir</th>
              <th className={tsb.thRight}>Teknik Gider</th>
              <th className={cn(tsb.thRight, "border-r border-slate-200")}>TKZ</th>
              <th className={tsb.thRight}>Teknik Gelir</th>
              <th className={tsb.thRight}>Teknik Gider</th>
              <th className={tsb.thRight}>TKZ</th>
            </tr>
          </thead>
          <tbody>
            {ozet.satirlar.map((satir) => (
              <Satir key={satir.anaBransH} satir={satir} />
            ))}
            <Satir satir={ozet.toplam} toplam />
          </tbody>
        </table>
      </TsbTableShell>
    </div>
  );
}
