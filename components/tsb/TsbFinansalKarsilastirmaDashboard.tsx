"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { TsbGelirTidyRowLike } from "@/lib/tsbYatirimGeliriKpi";
import type { SegmentSkorPool } from "@/lib/tsbSirketSegmentSkor";
import {
  FINANSAL_KIYASLAMA_SATIRLARI,
  finansalKiyaslamaDegisim,
  finansalKiyaslamaBenchmarkFark,
  finansalKiyaslamaDonemPaketi,
  finansalKiyaslamaSatirSayisal,
  formatFinansalDegisim,
  formatFinansalHucre,
  listSirketleriGelirDonemForPool,
  oncekiYilDonem,
  type FinansalKiyasHedef,
  type FinansalKiyaslamaDonemPaketi,
} from "@/lib/tsbFinansalKarsilastirmaData";
import { fetchGelirTidyDonemIndex, fetchGelirTidyDonemler } from "@/lib/tsbGelirTidyFetch";
import {
  applyUrlSirketOrDefault,
  useTsbDashboardUrlPrefs,
} from "@/components/tsb/useTsbDashboardUrlPrefs";
import TsbKiyasModuControls, { kiyasBaslikFromModu } from "@/components/tsb/TsbKiyasModuControls";
import TsbOlcekSegmentRozeti from "@/components/tsb/TsbOlcekSegmentRozeti";
import { useOlcekSegmentKayit } from "@/components/tsb/useOlcekSegmentKayit";
import { kiyasHedefFromModu, type TsbKiyasModu } from "@/lib/tsbKiyasHedef";
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
  tsbDeltaRenk,
} from "@/components/tsb/tsbDashboardUi";

const POOL_LABELS: Record<SegmentSkorPool, string> = {
  HD: "Hayat dışı (HD)",
  HAYAT_EMEKLILIK: "Hayat / Emeklilik",
};

function defaultSirketModForPool(pool: SegmentSkorPool): "hayatdisi" | "hayat" {
  return pool === "HD" ? "hayatdisi" : "hayat";
}

export default function TsbFinansalKarsilastirmaDashboard() {
  const urlPrefs = useTsbDashboardUrlPrefs();
  const [tumDonemler, setTumDonemler] = useState<string[]>([]);
  const [rows, setRows] = useState<TsbGelirTidyRowLike[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pool, setPool] = useState<SegmentSkorPool>(urlPrefs.pool ?? "HD");
  const [sirketKodu, setSirketKodu] = useState<number | "">("");
  const [donem, setDonem] = useState<string>("");
  const [kiyasModu, setKiyasModu] = useState<TsbKiyasModu>("sektor");
  const [kiyasSirketKodu, setKiyasSirketKodu] = useState<number | "">("");

  useEffect(() => {
    let cancelled = false;
    fetchGelirTidyDonemIndex()
      .then((d) => {
        if (cancelled) return;
        setTumDonemler(d);
        if (d.length > 0) {
          setDonem((prev) => {
            if (prev && d.includes(prev)) return prev;
            if (urlPrefs.donem && d.includes(urlPrefs.donem)) return urlPrefs.donem;
            return d[d.length - 1];
          });
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Dönem listesi yüklenemedi");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const donemOnceki = useMemo(() => (donem ? oncekiYilDonem(donem) : null), [donem]);

  useEffect(() => {
    if (!donem || tumDonemler.length === 0) return;
    const yuklenecek = [donem];
    if (donemOnceki && tumDonemler.includes(donemOnceki)) {
      yuklenecek.push(donemOnceki);
    }
    let cancelled = false;
    setRows(null);
    fetchGelirTidyDonemler(yuklenecek)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Veri yüklenemedi");
      });
    return () => {
      cancelled = true;
    };
  }, [donem, donemOnceki, tumDonemler]);

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
  }, [sirketListesi, pool, sirketKodu, urlPrefs.sirket]);

  const onceYilVarMi = !!(donemOnceki && tumDonemler.includes(donemOnceki));

  const kiyasListe = useMemo(
    () => sirketListesi.filter((s) => s.kod !== sirketKodu),
    [sirketListesi, sirketKodu],
  );

  const kiyasHedef: FinansalKiyasHedef = useMemo(
    () => kiyasHedefFromModu(kiyasModu, kiyasSirketKodu),
    [kiyasModu, kiyasSirketKodu],
  );

  useEffect(() => {
    if (kiyasModu !== "sirket" || kiyasListe.length === 0) return;
    if (kiyasListe.some((s) => s.kod === kiyasSirketKodu)) return;
    setKiyasSirketKodu(kiyasListe[0].kod);
  }, [kiyasModu, kiyasListe, kiyasSirketKodu]);

  const paketBu: FinansalKiyaslamaDonemPaketi | null = useMemo(() => {
    if (!rows || !donem || sirketKodu === "") return null;
    return finansalKiyaslamaDonemPaketi(rows, donem, sirketKodu, pool, kiyasHedef);
  }, [rows, donem, sirketKodu, pool, kiyasHedef]);

  const paketOnceki: FinansalKiyaslamaDonemPaketi | null = useMemo(() => {
    if (!rows || !donemOnceki || sirketKodu === "" || !onceYilVarMi) return null;
    return finansalKiyaslamaDonemPaketi(rows, donemOnceki, sirketKodu, pool, kiyasHedef);
  }, [rows, donemOnceki, sirketKodu, pool, onceYilVarMi, kiyasHedef]);

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
      sektorPeerSayisi: paketBu?.peerSayisi,
      olcekSegment: paketBu?.kiyasOlcekSegment,
      olcekPeerSayisi: paketBu?.kiyasOlcekPeerSayisi,
    });
  }, [kiyasModu, paketBu, kiyasListe, kiyasSirketKodu]);

  if (error) return <TsbError message={error} />;
  if (tumDonemler.length === 0 && !error) return <TsbLoading message="Dönem listesi yükleniyor…" />;
  if (!rows || !donem || sirketKodu === "") {
    return <TsbLoading message={donem ? `${donem} verisi yükleniyor…` : "Gelir verisi yükleniyor…"} />;
  }

  const segmentBenchmark = kiyasModu === "olcek";
  const tabloColSpan = segmentBenchmark ? 8 : 7;

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
              }}
            >
              {POOL_LABELS[p]}
            </TsbToggleButton>
          ))}
        </div>

        <TsbFilterGrid>
          <TsbFilterField
            label="Dönem"
            hint={
              <>
                Karşılaştırma: <strong>{donem}</strong>{" "}
                {donemOnceki ? (
                  <>
                    vs <strong>{donemOnceki}</strong>{" "}
                    {onceYilVarMi ? "" : "(önceki yıl verisi yok — “—” gösterilir)"}
                  </>
                ) : null}
              </>
            }
          >
            <TsbSelect id="fk-donem" value={donem} onChange={(e) => setDonem(e.target.value)}>
              {[...tumDonemler].reverse().map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>

          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <span className={tsb.filterLabel}>Tablo karşılaştırması</span>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
              Sol ve sağ blok tabloda yan yana görünür; Δ satırları bu iki blok arasındaki farktır.
            </p>
            <div className="mt-2 flex flex-col gap-3 rounded-lg border border-slate-200/90 bg-white/80 p-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                  Sol blok — şirket
                </span>
                <TsbSelect
                  id="fk-sirket"
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

              <div
                className="hidden shrink-0 self-center px-1 text-sm font-semibold text-slate-400 sm:block sm:pb-2"
                aria-hidden
              >
                vs
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  Sağ blok — kıyas
                </span>
                <TsbKiyasModuControls
                  kiyasModu={kiyasModu}
                  onKiyasModuChange={setKiyasModu}
                  sektorPeerSayisi={paketBu?.peerSayisi}
                  olcekSegment={paketBu?.kiyasOlcekSegment}
                  olcekPeerSayisi={paketBu?.kiyasOlcekPeerSayisi}
                  kiyasListe={kiyasListe}
                  kiyasSirketKodu={kiyasSirketKodu}
                  onKiyasSirketKoduChange={setKiyasSirketKodu}
                  selectId="fk-kiyas-sirket"
                />
              </div>
            </div>
          </div>
        </TsbFilterGrid>

        <p className={tsb.filterHint}>
          {POOL_LABELS[pool]} havuzu · Δ: TL satırlarında yüzde değişim; oran satırlarında puan farkı (pp).{" "}
          {segmentBenchmark ? (
            <>
              Benzer ölçek: TL ortalaması, oranlarda havuzlanmış oran ·{" "}
            </>
          ) : null}
          <span className="text-emerald-800">Artış yeşil</span>, <span className="text-red-700">düşüş kırmızı</span>.
        </p>
      </TsbFilterBar>

      {secilenAd ? <TsbOlcekSegmentRozeti sirketAdi={secilenAd} kayit={olcekKayit} finDonem={olcekFinDonem} /> : null}

      <TsbTableShell>
        <table className={cn(tsb.table, "min-w-[820px]")}>
          <thead className={tsb.thead}>
            <tr>
              <th
                scope="col"
                rowSpan={2}
                className={cn(tsb.thSticky, "min-w-[15rem]")}
              >
                KPI
              </th>
              <th
                scope="colgroup"
                colSpan={3}
                className="border-l border-gray-200 bg-emerald-50/70 px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-emerald-900"
              >
                {secilenAd || "Şirket"}
              </th>
              <th
                scope="colgroup"
                colSpan={3}
                className="border-l border-gray-200 bg-slate-100 px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-800"
              >
                {kiyasBaslik}
              </th>
              {segmentBenchmark ? (
                <th
                  scope="col"
                  rowSpan={2}
                  className="border-l border-gray-200 bg-sky-50/80 px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-sky-900"
                >
                  Fark
                  <span className="mt-0.5 block text-[9px] font-normal normal-case text-sky-800/80">
                    vs segment ({donem})
                  </span>
                </th>
              ) : null}
            </tr>
            <tr>
              {(["sirket", "kiyas"] as const).map((blok) => (
                <Fragment key={`hdr-${blok}`}>
                  <th
                    scope="col"
                    className={`border-l border-gray-200 px-2 py-1.5 text-center text-[10px] font-semibold ${
                      blok === "sirket" ? "bg-emerald-50/40 text-emerald-900" : "bg-slate-100/70 text-slate-800"
                    }`}
                  >
                    {donem}
                  </th>
                  <th
                    scope="col"
                    className={`border-l border-gray-100 px-2 py-1.5 text-center text-[10px] font-semibold ${
                      blok === "sirket" ? "bg-emerald-50/30 text-emerald-900" : "bg-slate-100/60 text-slate-800"
                    }`}
                  >
                    {donemOnceki ?? "—"}
                  </th>
                  <th
                    scope="col"
                    className={`border-l border-gray-100 px-2 py-1.5 text-center text-[10px] font-semibold ${
                      blok === "sirket" ? "bg-emerald-50/60 text-emerald-900" : "bg-slate-100/90 text-slate-800"
                    }`}
                  >
                    Δ
                  </th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {FINANSAL_KIYASLAMA_SATIRLARI.map((satir) => {
              if (satir.kind === "spacer") {
                return (
                  <tr key={satir.id} aria-hidden className="border-b border-slate-100 bg-slate-100/50">
                    <td colSpan={tabloColSpan} className="h-2 p-0" />
                  </tr>
                );
              }

              const buDeg = paketBu
                ? finansalKiyaslamaSatirSayisal(
                    satir.id,
                    paketBu.sirketHam,
                    paketBu.kiyasHam,
                    paketBu.sirketSkorHam,
                    paketBu.kiyasOran,
                    paketBu.kiyasSkorHam,
                    paketBu.sirketHp,
                    paketBu.kiyasHp,
                  )
                : { sirket: null, kiyas: null };
              const oncDeg = paketOnceki
                ? finansalKiyaslamaSatirSayisal(
                    satir.id,
                    paketOnceki.sirketHam,
                    paketOnceki.kiyasHam,
                    paketOnceki.sirketSkorHam,
                    paketOnceki.kiyasOran,
                    paketOnceki.kiyasSkorHam,
                    paketOnceki.sirketHp,
                    paketOnceki.kiyasHp,
                  )
                : { sirket: null, kiyas: null };
              const sirketDelta = finansalKiyaslamaDegisim(buDeg.sirket, oncDeg.sirket, satir.format);
              const kiyasDelta = finansalKiyaslamaDegisim(buDeg.kiyas, oncDeg.kiyas, satir.format);
              const benchmarkFark = segmentBenchmark
                ? finansalKiyaslamaBenchmarkFark(buDeg.sirket, buDeg.kiyas, satir.format)
                : null;

              return (
                <tr key={satir.id} className={tsb.tbodyRow}>
                  <th
                    scope="row"
                    className={cn(tsb.tdSticky, "max-w-[18rem] text-left align-top text-[10px] font-semibold uppercase leading-snug tracking-wide")}
                  >
                    {satir.label}
                  </th>

                  <td className={cn(tsb.td, "text-right")}>{formatFinansalHucre(buDeg.sirket, satir.format)}</td>
                  <td className={cn(tsb.td, "text-right text-slate-600")}>
                    {formatFinansalHucre(oncDeg.sirket, satir.format)}
                  </td>
                  <td className={cn(tsb.td, "text-right font-semibold", tsbDeltaRenk(sirketDelta.deger))}>
                    {formatFinansalDegisim(sirketDelta.deger, sirketDelta.format)}
                  </td>

                  <td className={cn(tsb.td, "text-right")}>{formatFinansalHucre(buDeg.kiyas, satir.format)}</td>
                  <td className={cn(tsb.td, "text-right text-slate-600")}>
                    {formatFinansalHucre(oncDeg.kiyas, satir.format)}
                  </td>
                  <td className={cn(tsb.td, "text-right font-semibold", tsbDeltaRenk(kiyasDelta.deger))}>
                    {formatFinansalDegisim(kiyasDelta.deger, kiyasDelta.format)}
                  </td>

                  {segmentBenchmark ? (
                    <td
                      className={cn(
                        tsb.td,
                        "border-l border-sky-100 bg-sky-50/30 text-right text-xs font-semibold",
                        tsbDeltaRenk(benchmarkFark?.deger ?? null),
                      )}
                    >
                      {benchmarkFark ? formatFinansalDegisim(benchmarkFark.deger, benchmarkFark.format) : "—"}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </TsbTableShell>
    </div>
  );
}
