"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  resolveDefaultSirketKodu,
} from "@/lib/tsbPrimDashboard";
import type { TsbGelirTidyRowLike } from "@/lib/tsbYatirimGeliriKpi";
import type { SegmentSkorPool } from "@/lib/tsbSirketSegmentSkor";
import {
  FINANSAL_KIYASLAMA_SATIRLARI,
  finansalKiyaslamaDegisim,
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
  const [tumDonemler, setTumDonemler] = useState<string[]>([]);
  const [rows, setRows] = useState<TsbGelirTidyRowLike[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pool, setPool] = useState<SegmentSkorPool>("HD");
  const [sirketKodu, setSirketKodu] = useState<number | "">("");
  const [donem, setDonem] = useState<string>("");
  const [kiyasModu, setKiyasModu] = useState<"sektor" | "sirket">("sektor");
  const [kiyasSirketKodu, setKiyasSirketKodu] = useState<number | "">("");

  useEffect(() => {
    let cancelled = false;
    fetchGelirTidyDonemIndex()
      .then((d) => {
        if (cancelled) return;
        setTumDonemler(d);
        if (d.length > 0) {
          setDonem((prev) => (prev && d.includes(prev) ? prev : d[d.length - 1]));
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
    const halaListede = sirketListesi.some((s) => s.kod === sirketKodu);
    if (halaListede) return;
    const kod = resolveDefaultSirketKodu(sirketListesi, defaultSirketModForPool(pool));
    if (kod !== null) setSirketKodu(kod);
  }, [sirketListesi, pool, sirketKodu]);

  const onceYilVarMi = !!(donemOnceki && tumDonemler.includes(donemOnceki));

  const kiyasListe = useMemo(
    () => sirketListesi.filter((s) => s.kod !== sirketKodu),
    [sirketListesi, sirketKodu],
  );

  const kiyasHedef: FinansalKiyasHedef = useMemo(() => {
    if (kiyasModu === "sektor") return { mod: "sektor" };
    if (kiyasSirketKodu === "") return { mod: "sektor" };
    return { mod: "sirket", sirketKodu: kiyasSirketKodu };
  }, [kiyasModu, kiyasSirketKodu]);

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

  const kiyasBaslik = useMemo(() => {
    if (kiyasModu === "sektor") {
      return paketBu
        ? `Sektör toplamı (n = ${paketBu.peerSayisi})`
        : "Sektör toplamı";
    }
    const ad = kiyasListe.find((s) => s.kod === kiyasSirketKodu)?.ad;
    return ad ?? "Kıyas şirketi";
  }, [kiyasModu, pool, paketBu, kiyasListe, kiyasSirketKodu]);

  if (error) return <TsbError message={error} />;
  if (tumDonemler.length === 0 && !error) return <TsbLoading message="Dönem listesi yükleniyor…" />;
  if (!rows || !donem || sirketKodu === "") {
    return <TsbLoading message={donem ? `${donem} verisi yükleniyor…` : "Gelir verisi yükleniyor…"} />;
  }

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
                <div className={cn(tsb.btnGroup, "mt-1")}>
                  <TsbToggleButton pressed={kiyasModu === "sektor"} onClick={() => setKiyasModu("sektor")}>
                    Sektör toplamı
                  </TsbToggleButton>
                  <TsbToggleButton pressed={kiyasModu === "sirket"} onClick={() => setKiyasModu("sirket")}>
                    Diğer şirket
                  </TsbToggleButton>
                </div>
                {kiyasModu === "sektor" ? (
                  <p className="mt-1.5 rounded-md border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    {paketBu ? (
                      <>
                        <strong>Sektör toplamı</strong> (n = {paketBu.peerSayisi})
                      </>
                    ) : (
                      <strong>Sektör toplamı</strong>
                    )}
                    <span className="mt-0.5 block text-[10px] leading-snug text-slate-500">
                      Havuzdaki tüm şirketlerin Σ&apos;si — TL satırları toplam; oranlarda Σ pay / Σ payda.
                    </span>
                  </p>
                ) : kiyasListe.length === 0 ? (
                  <p className="mt-1.5 rounded-md border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Bu havuzda kıyaslanacak başka şirket yok.
                  </p>
                ) : (
                  <TsbSelect
                    id="fk-kiyas-sirket"
                    className="mt-1.5"
                    value={kiyasSirketKodu === "" ? "" : String(kiyasSirketKodu)}
                    onChange={(e) => setKiyasSirketKodu(e.target.value === "" ? "" : Number(e.target.value))}
                  >
                    {kiyasListe.map((s) => (
                      <option key={s.kod} value={s.kod}>
                        {s.ad} ({s.kod})
                      </option>
                    ))}
                  </TsbSelect>
                )}
              </div>
            </div>
          </div>
        </TsbFilterGrid>

        <p className={tsb.filterHint}>
          {POOL_LABELS[pool]} havuzu · Δ: TL satırlarında yüzde değişim; oran satırlarında puan farkı (pp).
        </p>
      </TsbFilterBar>

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
                    <td colSpan={7} className="h-2 p-0" />
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </TsbTableShell>
    </div>
  );
}
