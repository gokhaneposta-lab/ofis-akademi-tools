"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  applyUrlSirketOrDefault,
  useTsbDashboardUrlPrefs,
} from "@/components/tsb/useTsbDashboardUrlPrefs";
import TsbOlcekSegmentRozeti from "@/components/tsb/TsbOlcekSegmentRozeti";
import { useOlcekSegmentKayit } from "@/components/tsb/useOlcekSegmentKayit";
import TsbSirketKarneOzet, {
  type TsbSirketKarneOzetControlled,
} from "@/components/tsb/TsbSirketKarneOzet";
import { KarnePrimPerformansGrid } from "@/components/tsb/TsbKarnePerformansKpi";
import {
  cn,
  tsb,
  TsbError,
  TsbFilterBar,
  TsbFilterField,
  TsbFilterGrid,
  TsbKpiCard,
  TsbKpiGrid,
  TsbLoading,
  TsbSelect,
  TsbToggleButton,
  tsbFormatPrim,
} from "@/components/tsb/tsbDashboardUi";
import { fetchGelirTidyDonemIndex, fetchGelirTidyDonemler } from "@/lib/tsbGelirTidyFetch";
import {
  finansalKiyaslamaDonemPaketi,
  finansalKiyaslamaSatirSayisal,
  formatFinansalHucre,
} from "@/lib/tsbFinansalKarsilastirmaData";
import { olcekFinDonemForPrimDonem } from "@/lib/tsbOlcekSegmentCache";
import { useOlcekSegmentCache } from "@/components/tsb/useOlcekSegmentCache";
import { buildSirketKarnePrimPaket } from "@/lib/tsbSirketKarne";
import type { TsbPrimRow, TsbSektorSegment } from "@/lib/tsbPrimDashboard";
import { listSirketlerSegmentDonem, uniqueSortedPeriods } from "@/lib/tsbPrimDashboard";
import type { SegmentSkorPool } from "@/lib/tsbSirketSegmentSkor";
import type { TsbGelirTidyRowLike } from "@/lib/tsbYatirimGeliriKpi";
import TsbHazirSorguChips from "@/components/tsb/TsbHazirSorguChips";
import { tsbHazirSorgularKarne } from "@/lib/tsbHazirSorgular";
import {
  parseSirketKarneSekme,
  karneSekmeAciklamasi,
  sirketKarnePanelLinks,
  sirketKarnePrefs,
  TSB_SIRKET_KARNE_SEKMELER,
  type TsbSirketKarneSekme,
} from "@/lib/tsbSirketKarneSekmeler";

const SEGMENT_LABEL: Record<TsbSektorSegment, string> = {
  hayatdisi: "Hayat dışı",
  hayat: "Hayat & emeklilik",
};

const POOL_FOR_SEGMENT: Record<TsbSektorSegment, SegmentSkorPool> = {
  hayatdisi: "HD",
  hayat: "HAYAT_EMEKLILIK",
};

const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

type KpiCard = { label: string; value: string; hint?: string; accent?: boolean };

function MerkeziKpiGrid({ items }: { items: KpiCard[] }) {
  if (items.length === 0) return null;
  return (
    <TsbKpiGrid>
      {items.map((k) => (
        <TsbKpiCard key={k.label} label={k.label} value={k.value} hint={k.hint} accent={k.accent} />
      ))}
    </TsbKpiGrid>
  );
}

function PanelLinkGrid({
  links,
}: {
  links: ReturnType<typeof sirketKarnePanelLinks>;
}) {
  if (links.length === 0) return null;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {links.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          className={cn(
            tsb.hubPanelCard,
            "group p-4 transition hover:border-emerald-300/90",
          )}
        >
          <span className={tsb.hubPanelBadge}>{p.badge}</span>
          <h3 className={tsb.hubPanelTitle}>{p.title}</h3>
          <p className={tsb.hubPanelSubtitle}>{p.subtitle}</p>
          <p className={tsb.hubPanelCta}>Panele git →</p>
        </Link>
      ))}
    </div>
  );
}

export default function TsbSirketKarneDashboard() {
  const urlPrefs = useTsbDashboardUrlPrefs();
  const { cache: olcekCache } = useOlcekSegmentCache();
  const [primRows, setPrimRows] = useState<TsbPrimRow[] | null>(null);
  const [gelirRows, setGelirRows] = useState<TsbGelirTidyRowLike[] | null>(null);
  const [gelirDonemler, setGelirDonemler] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [segment, setSegment] = useState<TsbSektorSegment>(urlPrefs.segment ?? "hayatdisi");
  const [donem, setDonem] = useState("");
  const [sirketKodu, setSirketKodu] = useState<number | "">("");
  const [sekme, setSekme] = useState<TsbSirketKarneSekme>(parseSirketKarneSekme(urlPrefs.sekme));

  const syncUrl = useCallback(() => {
    if (typeof window === "undefined" || sirketKodu === "") return;
    const href = sirketKarnePrefs({
      sirket: sirketKodu,
      donem: donem || undefined,
      segment,
      sekme,
    });
    window.history.replaceState(null, "", href);
  }, [sirketKodu, donem, segment, sekme]);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/tsb/prim-tidy.json")
      .then((r) => r.json())
      .then((data: TsbPrimRow[]) => {
        if (!cancelled) {
          setPrimRows(data);
          const periods = uniqueSortedPeriods(data);
          if (periods.length > 0) {
            setDonem((prev) => {
              if (prev && periods.includes(prev)) return prev;
              if (urlPrefs.donem && periods.includes(urlPrefs.donem)) return urlPrefs.donem;
              return periods[periods.length - 1];
            });
          }
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Prim verisi yüklenemedi");
      });
    fetchGelirTidyDonemIndex()
      .then((d) => {
        if (!cancelled) setGelirDonemler(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [urlPrefs.donem]);

  const sortedPrimDonemler = useMemo(
    () => (primRows ? uniqueSortedPeriods(primRows) : []),
    [primRows],
  );

  const finDonem = useMemo(
    () => (donem && olcekCache ? olcekFinDonemForPrimDonem(olcekCache, donem) : null),
    [donem, olcekCache],
  );

  useEffect(() => {
    if (!finDonem || gelirDonemler.length === 0) return;
    let cancelled = false;
    setGelirRows(null);
    fetchGelirTidyDonemler([finDonem])
      .then((data) => {
        if (!cancelled) setGelirRows(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [finDonem, gelirDonemler]);

  const sirketler = useMemo(() => {
    if (!primRows || !donem) return [];
    return listSirketlerSegmentDonem(primRows, donem, "genelToplam", segment, {
      kind: "anaBransH",
      anaBransH: null,
    });
  }, [primRows, donem, segment]);

  useEffect(() => {
    if (sirketler.length === 0) return;
    applyUrlSirketOrDefault(sirketler, urlPrefs.sirket, sirketKodu, setSirketKodu, segment);
  }, [sirketler, segment, sirketKodu, urlPrefs.sirket]);

  useEffect(() => {
    syncUrl();
  }, [syncUrl]);

  const secilenAd = sirketler.find((s) => s.kod === sirketKodu)?.ad ?? "";
  const pool = POOL_FOR_SEGMENT[segment];

  const primPaket = useMemo(() => {
    if (!primRows || !donem || sirketKodu === "") return null;
    return buildSirketKarnePrimPaket(
      primRows,
      sortedPrimDonemler,
      donem,
      segment,
      sirketKodu,
      { kind: "anaBransH", anaBransH: null },
      "genelToplam",
    );
  }, [primRows, sortedPrimDonemler, donem, segment, sirketKodu]);

  const finPaket = useMemo(() => {
    if (!gelirRows || !finDonem || sirketKodu === "") return null;
    return finansalKiyaslamaDonemPaketi(gelirRows, finDonem, sirketKodu, pool, { mod: "sektor" });
  }, [gelirRows, finDonem, sirketKodu, pool]);

  const { kayit: olcekKayit, finDonem: olcekFinDonem, yukleniyor: olcekYukleniyor } =
    useOlcekSegmentKayit(
      primRows && donem && sirketKodu !== ""
        ? {
            kaynak: "prim",
            donem,
            segment,
            sirketKodu,
            sirketAdi: secilenAd,
            cache: olcekCache,
          }
        : null,
    );

  const karneControlled: TsbSirketKarneOzetControlled = {
    segment,
    donem,
    sirketKodu,
    setSegment,
    setDonem,
    setSirketKodu,
  };

  const panelPrefs = {
    sirket: sirketKodu === "" ? undefined : sirketKodu,
    donem: donem || undefined,
    segment,
    finDonem,
  };

  const finansalKpis: KpiCard[] = useMemo(() => {
    if (!finPaket) return [];
    const row = (id: Parameters<typeof finansalKiyaslamaSatirSayisal>[0]) =>
      finansalKiyaslamaSatirSayisal(
        id,
        finPaket.sirketHam,
        finPaket.kiyasHam,
        finPaket.sirketSkorHam,
        finPaket.kiyasOran,
        finPaket.kiyasSkorHam,
        finPaket.sirketHp,
        finPaket.kiyasHp,
      ).sirket;

    return [
      { label: "Brüt prim", value: formatFinansalHucre(row("prim"), "tl"), hint: finDonem ?? undefined },
      {
        label: "Safi teknik K/Z",
        value: formatFinansalHucre(row("safi_teknik"), "tl"),
      },
      { label: "Yatırım geliri", value: formatFinansalHucre(row("yatirim"), "tl") },
      { label: "Net kar", value: formatFinansalHucre(row("net_kar"), "tl") },
    ];
  }, [finPaket, finDonem]);

  const teknikKpis: KpiCard[] = useMemo(() => {
    if (!finPaket) return [];
    const row = (id: Parameters<typeof finansalKiyaslamaSatirSayisal>[0]) =>
      finansalKiyaslamaSatirSayisal(
        id,
        finPaket.sirketHam,
        finPaket.kiyasHam,
        finPaket.sirketSkorHam,
        finPaket.kiyasOran,
        finPaket.kiyasSkorHam,
        finPaket.sirketHp,
        finPaket.kiyasHp,
      ).sirket;

    return [
      { label: "Brüt H/P", value: formatFinansalHucre(row("brut_hp"), "yuzde") },
      { label: "Net H/P", value: formatFinansalHucre(row("net_hp"), "yuzde") },
      {
        label: "Teknik K/Z",
        value: formatFinansalHucre(row("teknik_kar_zarar"), "tl"),
      },
      {
        label: "Safi teknik / prim",
        value: formatFinansalHucre(row("oran_safi_prim"), "yuzde"),
      },
    ];
  }, [finPaket]);

  const pazarKpis: KpiCard[] = useMemo(() => {
    if (!primPaket) return [];
    const top3 = [...primPaket.payDilimleriBu]
      .filter((d) => d.sirketPay > 0.3)
      .sort((a, b) => b.sirketPay - a.sirketPay)
      .slice(0, 3);
    return top3.map((d, i) => ({
      label: `Branş payı #${i + 1}`,
      value: `${d.etiket} · ${pf.format(d.sirketPay)}%`,
      hint: `${donem} aylık üretim`,
    }));
  }, [primPaket, donem]);

  const hazirSorgular = useMemo(() => {
    if (sirketKodu === "" || !donem) return [];
    return tsbHazirSorgularKarne({
      sirketKodu,
      donem,
      segment,
      olcekCache,
    });
  }, [sirketKodu, donem, segment, olcekCache]);

  if (error) return <TsbError message={error} />;
  if (!primRows) return <TsbLoading message="Prim verisi yükleniyor…" />;

  return (
    <div className={tsb.dashboardStack}>
      <TsbFilterBar>
        <p className={tsb.filterSectionLabel}>Şirket grubu</p>
        <div className={cn(tsb.btnGroup, "mb-3")}>
          <TsbToggleButton
            pressed={segment === "hayatdisi"}
            variant="segment"
            onClick={() => {
              setSegment("hayatdisi");
              setSirketKodu("");
            }}
          >
            Hayat dışı
          </TsbToggleButton>
          <TsbToggleButton
            pressed={segment === "hayat"}
            variant="segment"
            onClick={() => {
              setSegment("hayat");
              setSirketKodu("");
            }}
          >
            Hayat &amp; emeklilik
          </TsbToggleButton>
        </div>
        <TsbFilterGrid>
          <TsbFilterField
            label="Prim dönemi (ay)"
            hint={
              finDonem ? (
                <>
                  Finansal çeyrek: <strong>{finDonem}</strong>
                </>
              ) : (
                "Finansal çeyrek eşlemesi yükleniyor…"
              )
            }
          >
            <TsbSelect value={donem} onChange={(e) => setDonem(e.target.value)}>
              {[...sortedPrimDonemler].reverse().map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
          <TsbFilterField label="Şirket">
            <TsbSelect
              value={sirketKodu === "" ? "" : String(sirketKodu)}
              onChange={(e) => setSirketKodu(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">Seçin…</option>
              {sirketler.map((s) => (
                <option key={s.kod} value={s.kod}>
                  {s.ad} ({s.kod})
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
        </TsbFilterGrid>
      </TsbFilterBar>

      {secilenAd && sirketKodu !== "" ? (
        <>
          <div className={tsb.heroCard}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className={tsb.heroEyebrow}>Şirket karne</p>
                <h2 className={tsb.heroTitle}>{secilenAd}</h2>
                <p className={tsb.heroMeta}>
                  {SEGMENT_LABEL[segment]} · Kod {sirketKodu}
                  {donem ? ` · Prim ${donem}` : ""}
                  {finDonem ? ` · Fin ${finDonem}` : ""}
                </p>
                {primPaket?.portfoySirasi.sira !== null && primPaket ? (
                  <p className={tsb.heroBadge}>
                    Sektör prim sırası: {primPaket.portfoySirasi.sira} / {primPaket.portfoySirasi.katilimci}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 text-right text-xs font-medium text-slate-500">
                <span>TSB kamu verisi</span>
              </div>
            </div>
          </div>

          <TsbOlcekSegmentRozeti
            sirketAdi={secilenAd}
            kayit={olcekKayit}
            finDonem={olcekFinDonem}
            yukleniyor={olcekYukleniyor}
          />

          <TsbHazirSorguChips sorgular={hazirSorgular} />

          <nav className={cn(tsb.dataPanel, "p-3 sm:p-4")} aria-label="Şirket karne sekmeleri">
            <div className={cn(tsb.btnGroup, "flex-wrap")}>
              {TSB_SIRKET_KARNE_SEKMELER.map((t) => (
                <TsbToggleButton
                  key={t.id}
                  pressed={sekme === t.id}
                  variant="tab"
                  onClick={() => setSekme(t.id)}
                  aria-current={sekme === t.id ? "page" : undefined}
                >
                  {t.label}
                </TsbToggleButton>
              ))}
            </div>
            <p className="mt-2 px-1 text-sm text-slate-600">
              {karneSekmeAciklamasi(sekme, donem, finDonem)}
            </p>
          </nav>

          {sekme === "ozet" ? (
            <div className="space-y-5">
              {primPaket && donem ? (
                <KarnePrimPerformansGrid primPaket={primPaket} donem={donem} />
              ) : null}
              <TsbSirketKarneOzet controlled={karneControlled} hideFilters hideHero />
            </div>
          ) : (
            <div className="space-y-3">
              {sekme === "finansal" ? (
                finPaket ? (
                  <MerkeziKpiGrid items={finansalKpis} />
                ) : (
                  <TsbLoading message="Finansal önizleme yükleniyor…" />
                )
              ) : null}
              {sekme === "teknik" ? (
                finPaket ? (
                  <MerkeziKpiGrid items={teknikKpis} />
                ) : (
                  <TsbLoading message="Teknik önizleme yükleniyor…" />
                )
              ) : null}
              {sekme === "prim" ? (
                primPaket && donem ? (
                  <KarnePrimPerformansGrid primPaket={primPaket} donem={donem} />
                ) : (
                  <TsbLoading message="Prim önizleme…" />
                )
              ) : null}
              {sekme === "pazar" ? (
                primPaket ? (
                  pazarKpis.length > 0 ? (
                    <MerkeziKpiGrid items={pazarKpis} />
                  ) : (
                    <p className={tsb.filterHint}>Seçili ay için branş payı hesaplanamadı.</p>
                  )
                ) : (
                  <TsbLoading message="Pazar önizleme…" />
                )
              ) : null}

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">İlgili paneller</p>
                <PanelLinkGrid links={sirketKarnePanelLinks(panelPrefs, sekme)} />
              </div>
            </div>
          )}
        </>
      ) : (
        <p className={tsb.filterHint}>Karneyi görmek için yukarıdan bir şirket seçin.</p>
      )}
    </div>
  );
}
