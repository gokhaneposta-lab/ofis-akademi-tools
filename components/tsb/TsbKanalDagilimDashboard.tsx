"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  KanalDonutChart,
  KanalLiderBarChart,
  KanalStackedBar,
  KanalStackedTrendChart,
  KANAL_HEX,
} from "@/components/tsb/TsbKanalDagilimCharts";
import {
  aggregateKanalByBrans,
  aggregateKanalBySirket,
  aggregateKanalDagilim,
  aggregateKanalTrend,
  buildKanalDagilimKiyas,
  kanalBazindaSirketSektorPayYuzde,
  kanalLiderOzeti,
  kanalLiderStreakYil,
  kanalTrendDonemleri,
  kanalYuzdeleri,
  KANAL_DAGILIM_SATIRLARI,
  KANAL_HUB_TABS,
  listSirketlerKanalDagilim,
  parseKanalHubTab,
  rankSirketByKanal,
  type KanalDagilimSatirKey,
  type KanalHubTab,
} from "@/lib/tsbKanalDagilim";
import type { TsbPrimDaraltmaModu, TsbPrimRow, TsbSektorHavuz } from "@/lib/tsbPrimDashboard";
import {
  ANA_BRANS_FILTER_TRAFIK_HARIC,
  ANA_BRANS_FILTER_TRAFIK_HARIC_LABEL,
  daraltmaFromUiState,
  isTsbToplamSirketKodu,
  prevYearPeriod,
  resolveDefaultSirketKodu,
  sektorToplamDegisimYuzde,
  sirketSegmentFromKodu,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC_LABEL,
  uniqueAnaBransForSegment,
  uniqueSortedPeriods,
  uniqueTarifeGruplariForSegment,
} from "@/lib/tsbPrimDashboard";
import { TsbSirketSektorGrafikLegend } from "@/components/tsb/TsbRenkAciklama";
import TsbOlcekSegmentRozeti from "@/components/tsb/TsbOlcekSegmentRozeti";
import { useOlcekSegmentKayit } from "@/components/tsb/useOlcekSegmentKayit";
import { useTsbBranchLookupFetch } from "@/components/tsb/useTsbBranchLookup";
import {
  applyUrlDonemIfEmpty,
  applyUrlSirketOrDefault,
  useTsbDashboardUrlPrefs,
} from "@/components/tsb/useTsbDashboardUrlPrefs";
import { formatPrimYtdAralik } from "@/lib/tsbPrimDonemEtiket";
import { TSB_TUM_BRANS_LABEL } from "@/lib/tsbKirilimSozluk";
import { TsbSubPageNav } from "@/components/tsb/TsbSubPageNav";
import {
  cn,
  tsb,
  TsbError,
  TsbDashboardIntro,
  TsbFilterBar,
  TsbFilterField,
  TsbKpiCard,
  TsbKpiGrid,
  TsbLoading,
  TsbSegmentSwitch,
  TsbSelect,
  TsbTableShell,
  TsbToggleButton,
  tsbDeltaRenk,
  tsbFormatDegisimYuzde,
  tsbFormatPp,
  tsbFormatPrim,
} from "@/components/tsb/tsbDashboardUi";

const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
const pf1 = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

const KANAL_RENK_SIRKET: Record<KanalDagilimSatirKey, string> = {
  merkez: "bg-emerald-600",
  acente: "bg-sky-600",
  banka: "bg-violet-600",
  broker: "bg-amber-600",
  diger: "bg-rose-600",
};

const KANAL_RENK_SEKTOR: Record<KanalDagilimSatirKey, string> = {
  merkez: "bg-emerald-300",
  acente: "bg-sky-300",
  banka: "bg-violet-300",
  broker: "bg-amber-300",
  diger: "bg-rose-300",
};

const KANAL_GRADIENT: Record<KanalDagilimSatirKey, string> = {
  merkez: "from-emerald-50/90 via-emerald-50/40 to-white",
  acente: "from-sky-50/90 via-sky-50/40 to-white",
  banka: "from-violet-50/90 via-violet-50/40 to-white",
  broker: "from-amber-50/90 via-amber-50/40 to-white",
  diger: "from-rose-50/90 via-rose-50/40 to-white",
};

function KanalYuzdeGroupedBars({
  ys,
  yk,
  kanalSektorPayi,
}: {
  ys: Record<KanalDagilimSatirKey, number>;
  yk: Record<KanalDagilimSatirKey, number>;
  kanalSektorPayi: Record<KanalDagilimSatirKey, number | null>;
}) {
  const H = 168;
  return (
    <div className="mt-3">
      <div className="mb-2 flex justify-center gap-8 text-[10px] font-medium text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0 w-0 border-y-[5px] border-r-[6px] border-y-transparent border-r-slate-700" aria-hidden />
          Sol · şirket (koyu)
        </span>
        <span className="inline-flex items-center gap-1.5">
          Sağ · sektör (açık)
          <span className="inline-block h-0 w-0 border-y-[5px] border-l-[6px] border-y-transparent border-l-slate-400" aria-hidden />
        </span>
      </div>
      <div className="flex flex-wrap justify-between gap-0 sm:flex-nowrap">
        {KANAL_DAGILIM_SATIRLARI.map(({ key, label }, index) => (
          <div
            key={key}
            className={cn(
              "flex min-w-[4.75rem] flex-1 flex-col items-center bg-gradient-to-b px-2 py-2.5 sm:px-2.5",
              KANAL_GRADIENT[key],
              index > 0 && "border-l border-slate-200/90",
              index === 0 && "rounded-l-lg",
              index === KANAL_DAGILIM_SATIRLARI.length - 1 && "rounded-r-lg",
            )}
          >
            <div className="flex h-[188px] w-full items-end justify-center gap-2.5 border-b border-slate-200/70 px-0.5 pb-0.5">
              <div className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold tabular-nums text-slate-900">
                  <span className={`inline-block h-2 w-2 shrink-0 rounded-sm ${KANAL_RENK_SIRKET[key]}`} aria-hidden />
                  {pf.format(ys[key])}%
                </span>
                <div
                  className={`w-full max-w-[2.25rem] rounded-t ${KANAL_RENK_SIRKET[key]}`}
                  style={{ height: `${ys[key] <= 0 ? 0 : Math.max(4, (ys[key] / 100) * H)}px` }}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                <span className="inline-flex items-center gap-1 text-[10px] tabular-nums text-slate-700">
                  <span className={`inline-block h-2 w-2 shrink-0 rounded-sm ${KANAL_RENK_SEKTOR[key]}`} aria-hidden />
                  {pf.format(yk[key])}%
                </span>
                <div
                  className={`w-full max-w-[2.25rem] rounded-t ${KANAL_RENK_SEKTOR[key]}`}
                  style={{ height: `${yk[key] <= 0 ? 0 : Math.max(4, (yk[key] / 100) * H)}px` }}
                />
              </div>
            </div>
            <p className="mt-2 max-w-[6.5rem] text-center text-[10px] font-medium leading-tight text-slate-800">{label}</p>
            <p className="mt-0.5 text-center text-[9px] tabular-nums text-slate-600">
              Kanalda{" "}
              {kanalSektorPayi[key] !== null ? (
                <span className="font-semibold text-slate-800">{pf.format(kanalSektorPayi[key]!)}%</span>
              ) : (
                "—"
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function KanalLegendChips() {
  return (
    <div className="flex flex-wrap gap-3 text-[11px] text-slate-600">
      {KANAL_DAGILIM_SATIRLARI.map(({ key, label }) => (
        <span key={key} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: KANAL_HEX[key] }} />
          {label}
        </span>
      ))}
    </div>
  );
}

export default function TsbKanalDagilimDashboard() {
  const pathname = usePathname();
  const urlPrefs = useTsbDashboardUrlPrefs();
  const [tab, setTabState] = useState<KanalHubTab>("genel");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam) setTabState(parseKanalHubTab(tabParam));
    else if (params.get("sirket")) setTabState("sirket");
  }, []);

  const setTab = (next: KanalHubTab) => {
    setTabState(next);
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (next === "genel") params.delete("tab");
    else params.set("tab", next);
    const q = params.toString();
    window.history.replaceState(null, "", q ? `${pathname}?${q}` : pathname);
  };

  const [rows, setRows] = useState<TsbPrimRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [donem, setDonem] = useState("");
  const [segment, setSegment] = useState<TsbSektorHavuz>(urlPrefs.segment ?? "hayatdisi");
  const [anaBrans, setAnaBrans] = useState("");
  const [filtreModu, setFiltreModu] = useState<TsbPrimDaraltmaModu>("anaBransH");
  const [tarifeSecim, setTarifeSecim] = useState("");
  const [sirketKodu, setSirketKodu] = useState<number | "">("");
  const [liderKanal, setLiderKanal] = useState<KanalDagilimSatirKey>("acente");

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
    if (urlPrefs.segment === "hayatdisi" || urlPrefs.segment === "hayat") {
      setSegment(urlPrefs.segment);
    }
  }, [urlPrefs.segment]);

  useEffect(() => {
    applyUrlDonemIfEmpty(donemler, urlPrefs.donem, donem, setDonem);
  }, [donemler, donem, urlPrefs.donem]);

  const anaBransSecenekleri = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return uniqueAnaBransForSegment(rows, secilenDonem, segment);
  }, [rows, secilenDonem, segment]);

  const tarifeSecenekleri = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return uniqueTarifeGruplariForSegment(rows, secilenDonem, segment, branchLookup);
  }, [rows, secilenDonem, segment, branchLookup]);

  const daraltma = useMemo(
    () => daraltmaFromUiState(filtreModu, anaBrans, tarifeSecim, branchLookup),
    [filtreModu, anaBrans, tarifeSecim, branchLookup],
  );

  const daraltmaTumu = useMemo(
    () => daraltmaFromUiState(filtreModu, "", "", branchLookup),
    [filtreModu, branchLookup],
  );

  useEffect(() => {
    setAnaBrans("");
    setTarifeSecim("");
  }, [segment]);

  useEffect(() => {
    setAnaBrans("");
    setTarifeSecim("");
  }, [filtreModu]);

  useEffect(() => {
    if (filtreModu !== "tarifeGrubu" || tarifeSecim === "") return;
    if (tarifeSecim === TARIFE_GRUBU_FILTER_TRAFIK_HARIC) return;
    if (!tarifeSecenekleri.includes(tarifeSecim)) setTarifeSecim("");
  }, [filtreModu, tarifeSecim, tarifeSecenekleri]);

  const sirketler = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return listSirketlerKanalDagilim(rows, secilenDonem, segment, daraltma);
  }, [rows, secilenDonem, segment, daraltma]);

  useEffect(() => {
    if (sirketler.length === 0) return;
    applyUrlSirketOrDefault(
      sirketler,
      urlPrefs.sirket,
      sirketKodu,
      setSirketKodu,
      segment === "toplam" ? "any" : segment,
    );
  }, [sirketler, sirketKodu, urlPrefs.sirket, segment]);

  const effectiveSirketKodu = useMemo(() => {
    if (sirketler.length === 0) return null;
    if (sirketKodu !== "" && sirketler.some((s) => s.kod === sirketKodu)) return sirketKodu as number;
    return resolveDefaultSirketKodu(sirketler, segment === "toplam" ? "any" : segment);
  }, [sirketler, sirketKodu, segment]);

  const kiyas = useMemo(() => {
    if (!rows || !secilenDonem || effectiveSirketKodu === null) return null;
    return buildKanalDagilimKiyas(rows, secilenDonem, segment, daraltma, effectiveSirketKodu);
  }, [rows, secilenDonem, segment, daraltma, effectiveSirketKodu]);

  const sektorKutu = useMemo(() => {
    if (!rows || !secilenDonem) return null;
    return buildKanalDagilimKiyas(
      rows,
      secilenDonem,
      segment,
      tab === "genel" || tab === "liderler" ? daraltma : daraltmaTumu,
      effectiveSirketKodu ?? 0,
    ).sektor;
  }, [rows, secilenDonem, segment, daraltma, daraltmaTumu, tab, effectiveSirketKodu]);

  const oncekiDonem = useMemo(
    () => (secilenDonem ? prevYearPeriod(secilenDonem) : null),
    [secilenDonem],
  );

  const sektorOnceki = useMemo(() => {
    if (!rows || !oncekiDonem || !donemler.includes(oncekiDonem)) return null;
    return buildKanalDagilimKiyas(
      rows,
      oncekiDonem,
      segment,
      tab === "genel" || tab === "liderler" ? daraltma : daraltmaTumu,
      effectiveSirketKodu ?? 0,
    ).sektor;
  }, [rows, oncekiDonem, donemler, segment, daraltma, daraltmaTumu, tab, effectiveSirketKodu]);

  const sektorHd = useMemo(() => {
    if (!rows || !secilenDonem || segment !== "toplam") return null;
    const d = tab === "genel" || tab === "liderler" ? daraltma : daraltmaTumu;
    return aggregateKanalDagilim(rows, secilenDonem, "hayatdisi", d, null);
  }, [rows, secilenDonem, segment, daraltma, daraltmaTumu, tab]);

  const sektorHe = useMemo(() => {
    if (!rows || !secilenDonem || segment !== "toplam") return null;
    const d = tab === "genel" || tab === "liderler" ? daraltma : daraltmaTumu;
    return aggregateKanalDagilim(rows, secilenDonem, "hayat", d, null);
  }, [rows, secilenDonem, segment, daraltma, daraltmaTumu, tab]);

  const sektorHdOnceki = useMemo(() => {
    if (!rows || !oncekiDonem || !donemler.includes(oncekiDonem) || segment !== "toplam") return null;
    const d = tab === "genel" || tab === "liderler" ? daraltma : daraltmaTumu;
    return aggregateKanalDagilim(rows, oncekiDonem, "hayatdisi", d, null);
  }, [rows, oncekiDonem, donemler, segment, daraltma, daraltmaTumu, tab]);

  const sektorHeOnceki = useMemo(() => {
    if (!rows || !oncekiDonem || !donemler.includes(oncekiDonem) || segment !== "toplam") return null;
    const d = tab === "genel" || tab === "liderler" ? daraltma : daraltmaTumu;
    return aggregateKanalDagilim(rows, oncekiDonem, "hayat", d, null);
  }, [rows, oncekiDonem, donemler, segment, daraltma, daraltmaTumu, tab]);

  const trend = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    const donemlerTrend = kanalTrendDonemleri(donemler, secilenDonem);
    return aggregateKanalTrend(
      rows,
      donemlerTrend,
      segment,
      tab === "genel" ? daraltma : daraltmaTumu,
    );
  }, [rows, secilenDonem, donemler, segment, daraltma, daraltmaTumu, tab]);

  const sirketSatirlari = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return aggregateKanalBySirket(rows, secilenDonem, segment, daraltma);
  }, [rows, secilenDonem, segment, daraltma]);

  const bransSatirlari = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return aggregateKanalByBrans(
      rows,
      secilenDonem,
      segment,
      filtreModu === "tarifeGrubu" ? "tarifeGrubu" : "anaBransH",
      branchLookup,
      null,
    );
  }, [rows, secilenDonem, segment, filtreModu, branchLookup]);

  const secilenBransKey = filtreModu === "anaBransH" ? anaBrans : tarifeSecim;

  useEffect(() => {
    if (tab !== "brans" || bransSatirlari.length === 0) return;
    if (secilenBransKey && bransSatirlari.some((b) => b.bransKey === secilenBransKey)) return;
    const ilk = bransSatirlari[0].bransKey;
    if (filtreModu === "anaBransH") setAnaBrans(ilk);
    else setTarifeSecim(ilk);
  }, [tab, bransSatirlari, secilenBransKey, filtreModu]);

  const profilSatir =
    bransSatirlari.find((b) => b.bransKey === secilenBransKey) ?? bransSatirlari[0] ?? null;

  const setSecilenBransKey = (key: string) => {
    if (filtreModu === "anaBransH") setAnaBrans(key);
    else setTarifeSecim(key);
  };

  const sirketBransSatirlari = useMemo(() => {
    if (!rows || !secilenDonem || effectiveSirketKodu === null) return [];
    return aggregateKanalByBrans(
      rows,
      secilenDonem,
      segment,
      filtreModu === "tarifeGrubu" ? "tarifeGrubu" : "anaBransH",
      branchLookup,
      effectiveSirketKodu,
    );
  }, [rows, secilenDonem, segment, filtreModu, branchLookup, effectiveSirketKodu]);

  const liderPaket = useMemo(() => {
    if (!rows || !secilenDonem) return null;
    return rankSirketByKanal(rows, secilenDonem, segment, daraltma, liderKanal);
  }, [rows, secilenDonem, segment, daraltma, liderKanal]);

  const secilenAd = sirketler.find((s) => s.kod === effectiveSirketKodu)?.ad ?? "";
  const primSegment =
    rows && effectiveSirketKodu !== null
      ? sirketSegmentFromKodu(rows, effectiveSirketKodu)
      : segment === "toplam"
        ? "hayatdisi"
        : segment;
  const { kayit: olcekKayit, finDonem: olcekFinDonem, yukleniyor: olcekYukleniyor } = useOlcekSegmentKayit(
    tab === "sirket" && effectiveSirketKodu !== null && secilenDonem
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
  if (!rows || !secilenDonem || !sektorKutu) return <TsbLoading />;

  const liderOzet = kanalLiderOzeti(sektorKutu);
  const liderStreak = kanalLiderStreakYil(trend);
  const sektorYoy = sektorOnceki
    ? sektorToplamDegisimYuzde(sektorOnceki.genelToplam, sektorKutu.genelToplam)
    : null;
  const tumBransLabel = TSB_TUM_BRANS_LABEL[segment];
  const showSirketSelect = tab === "sirket";
  const showBransFilter = tab === "genel" || tab === "liderler" || tab === "sirket" || tab === "brans";
  const bransFilterZorunlu = tab === "brans";

  const hdYoy =
    sektorHd && sektorHdOnceki
      ? sektorToplamDegisimYuzde(sektorHdOnceki.genelToplam, sektorHd.genelToplam)
      : null;
  const heYoy =
    sektorHe && sektorHeOnceki
      ? sektorToplamDegisimYuzde(sektorHeOnceki.genelToplam, sektorHe.genelToplam)
      : null;

  const toplamStory =
    sektorYoy == null
      ? "YoY karşılaştırması yok."
      : sektorYoy > 0
        ? "Geçen yılın aynı dönemine göre büyüyor."
        : sektorYoy < 0
          ? "Geçen yılın aynı dönemine göre geriledi."
          : "Geçen yıla göre değişim yok.";
  const liderStory =
    liderStreak && liderStreak.yilSayisi >= 2 && liderStreak.key === liderOzet.lider?.key
      ? `Son ${liderStreak.yilSayisi} yıldır lider.`
      : liderOzet.lider
        ? "Bu dönemde en yüksek pay."
        : "—";
  const ikinciGap =
    liderOzet.lider && liderOzet.ikinci
      ? liderOzet.lider.pay - liderOzet.ikinci.pay
      : null;
  const ikinciStory =
    ikinciGap != null ? `Liderden ${pf1.format(ikinciGap)} puan geride.` : "İkinci kanal yok.";
  const aktifStory =
    liderOzet.aktifSayisi >= 5
      ? "Tüm kanallarda üretim var."
      : `${liderOzet.aktifSayisi} / 5 kanal üretimde.`;

  const genelKpi =
    segment === "toplam" && sektorHd && sektorHe ? (
      <TsbKpiGrid>
        <TsbKpiCard
          accent
          label="Toplam prim (HD+HE)"
          value={tsbFormatPrim(sektorKutu.genelToplam)}
          delta={`${tsbFormatDegisimYuzde(sektorYoy)} YoY`}
          deltaClassName={tsbDeltaRenk(sektorYoy)}
          story={toplamStory}
        />
        <TsbKpiCard
          label="HD toplam"
          value={tsbFormatPrim(sektorHd.genelToplam)}
          delta={`${tsbFormatDegisimYuzde(hdYoy)} YoY`}
          deltaClassName={tsbDeltaRenk(hdYoy)}
          story="Hayat dışı havuz."
        />
        <TsbKpiCard
          label="H/E toplam"
          value={tsbFormatPrim(sektorHe.genelToplam)}
          delta={`${tsbFormatDegisimYuzde(heYoy)} YoY`}
          deltaClassName={tsbDeltaRenk(heYoy)}
          story="Hayat & emeklilik havuz."
        />
        <TsbKpiCard
          label="Lider kanal"
          value={liderOzet.lider?.label ?? "—"}
          delta={liderOzet.lider ? `%${pf1.format(liderOzet.lider.pay)} pay` : undefined}
          story={liderStory}
        />
      </TsbKpiGrid>
    ) : (
      <TsbKpiGrid>
        <TsbKpiCard
          accent
          label="Toplam prim (YTD)"
          value={tsbFormatPrim(sektorKutu.genelToplam)}
          delta={`${tsbFormatDegisimYuzde(sektorYoy)} YoY`}
          deltaClassName={tsbDeltaRenk(sektorYoy)}
          story={toplamStory}
        />
        <TsbKpiCard
          label="Lider kanal"
          value={liderOzet.lider?.label ?? "—"}
          delta={liderOzet.lider ? `%${pf1.format(liderOzet.lider.pay)} pay` : undefined}
          story={liderStory}
        />
        <TsbKpiCard
          label="2. kanal"
          value={liderOzet.ikinci?.label ?? "—"}
          delta={liderOzet.ikinci ? `%${pf1.format(liderOzet.ikinci.pay)} pay` : undefined}
          story={ikinciStory}
        />
        <TsbKpiCard
          label="Aktif kanal"
          value={liderOzet.aktifSayisi}
          delta="Üretimi olan kanal"
          story={aktifStory}
        />
      </TsbKpiGrid>
    );

  return (
    <div className={tsb.dashboardStack}>
      <TsbSubPageNav
        label="Satış kanalları — alt sayfa"
        items={KANAL_HUB_TABS}
        value={tab}
        onChange={setTab}
      />

      <TsbDashboardIntro>
        {tab === "genel" ? genelKpi : null}

        <TsbFilterBar className={tsb.filterBarInset}>
        <div className={tsb.filterCompactRow}>
          <div>
            <p className={tsb.filterSectionLabel}>Havuz</p>
            <TsbSegmentSwitch
              aria-label="Sektör havuzu"
              value={segment}
              onChange={setSegment}
              options={[
                { id: "toplam", label: "HD + H/E Toplam" },
                { id: "hayatdisi", label: "Hayat dışı" },
                { id: "hayat", label: "Hayat & emeklilik" },
              ]}
            />
          </div>
          <div>
            <p className={tsb.filterSectionLabel}>Kırılım</p>
            <TsbSegmentSwitch
              aria-label="Kırılım türü"
              value={filtreModu}
              onChange={setFiltreModu}
              options={[
                { id: "anaBransH", label: "Ana branş" },
                { id: "tarifeGrubu", label: "Tarife grubu" },
              ]}
            />
          </div>
          <TsbFilterField label="Dönem" hint={`${formatPrimYtdAralik(secilenDonem)} · YTD`}>
            <TsbSelect
              value={secilenDonem}
              onChange={(e) => {
                setDonem(e.target.value);
                setAnaBrans("");
                setTarifeSecim("");
              }}
            >
              {[...donemler].reverse().map((d) => (
                <option key={d} value={d}>
                  {d} · {formatPrimYtdAralik(d)}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
          {showBransFilter ? (
            <TsbFilterField
              label={
                filtreModu === "anaBransH"
                  ? bransFilterZorunlu
                    ? "Branş"
                    : "Branş (opsiyonel)"
                  : bransFilterZorunlu
                    ? "Tarife grubu"
                    : "Tarife (opsiyonel)"
              }
            >
              {filtreModu === "anaBransH" ? (
                <TsbSelect
                  value={anaBrans}
                  onChange={(e) => setAnaBrans(e.target.value)}
                >
                  {!bransFilterZorunlu ? <option value="">{tumBransLabel}</option> : null}
                  {segment === "hayatdisi" && !bransFilterZorunlu && (
                    <option value={ANA_BRANS_FILTER_TRAFIK_HARIC}>{ANA_BRANS_FILTER_TRAFIK_HARIC_LABEL}</option>
                  )}
                  {bransFilterZorunlu
                    ? bransSatirlari.map((b) => (
                        <option key={b.bransKey} value={b.bransKey}>
                          {b.label} · {tsbFormatPrim(b.bu.genelToplam)}
                        </option>
                      ))
                    : anaBransSecenekleri.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                </TsbSelect>
              ) : (
                <TsbSelect value={tarifeSecim} onChange={(e) => setTarifeSecim(e.target.value)}>
                  {!bransFilterZorunlu ? <option value="">Tüm tarife grupları</option> : null}
                  {segment === "hayatdisi" && !bransFilterZorunlu && (
                    <option value={TARIFE_GRUBU_FILTER_TRAFIK_HARIC}>{TARIFE_GRUBU_FILTER_TRAFIK_HARIC_LABEL}</option>
                  )}
                  {bransFilterZorunlu
                    ? bransSatirlari.map((b) => (
                        <option key={b.bransKey} value={b.bransKey}>
                          {b.label} · {tsbFormatPrim(b.bu.genelToplam)}
                        </option>
                      ))
                    : tarifeSecenekleri.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                </TsbSelect>
              )}
            </TsbFilterField>
          ) : null}
          {showSirketSelect ? (
            <TsbFilterField label="Şirket" className="min-w-[14rem] flex-1 sm:min-w-[18rem]">
              <TsbSelect
                className={tsb.selectWide}
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
          ) : null}
        </div>
        </TsbFilterBar>
      </TsbDashboardIntro>

      {tab === "genel" && (
        <>
          <section className="grid gap-3 xl:grid-cols-2">
            <div className={tsb.chartPanel}>
              <h2 className={tsb.sectionTitle}>Sektör kanal dağılımı</h2>
              <p className={cn(tsb.sectionLead, "mb-3")}>
                Prim hangi kanallardan geliyor — pay dağılımı tek bakışta.
              </p>
              <KanalDonutChart kutu={sektorKutu} title="Sektör kanal dağılımı" />
            </div>
            <div className={tsb.chartPanel}>
              <h2 className={tsb.sectionTitle}>Yıllar arası kanal payı</h2>
              <p className={cn(tsb.sectionLead, "mb-3")}>
                Aynı ayın yıllar arası seyri — liderlik kalıcı mı kayıyor mu?
              </p>
              <div className="min-w-[560px]">
                <KanalStackedTrendChart trend={trend} />
              </div>
            </div>
          </section>

          <section className={tsb.dataPanel}>
            <div className={cn(tsb.dataPanelHeader, "flex flex-wrap items-end justify-between gap-2")}>
              <div>
                <h2 className={tsb.dataPanelTitle}>Şirket bazında kanal dağılımı</h2>
                <p className={tsb.sectionLead}>{secilenDonem} · {formatPrimYtdAralik(secilenDonem)}</p>
              </div>
              <KanalLegendChips />
            </div>
            <TsbTableShell>
              <table className={cn(tsb.table, "min-w-[860px]")}>
                <thead className={tsb.thead}>
                  <tr>
                    <th className={tsb.th}>#</th>
                    <th className={tsb.thSticky}>Şirket</th>
                    {segment === "toplam" ? <th className={tsb.th}>Havuz</th> : null}
                    <th className={tsb.thRight}>Toplam prim</th>
                    <th className={tsb.thRight}>YoY</th>
                    <th className={tsb.th}>Kanal dağılımı</th>
                  </tr>
                </thead>
                <tbody>
                  {(segment === "toplam"
                    ? [
                        ...sirketSatirlari.filter((s) => s.havuz === "hayatdisi"),
                        ...sirketSatirlari.filter((s) => s.havuz === "hayat"),
                      ]
                    : sirketSatirlari.slice(0, 50)
                  ).map((row, i) => (
                    <tr key={row.sirketKodu} className={tsb.tbodyRow}>
                      <td className={cn(tsb.td, "text-slate-500")}>{i + 1}</td>
                      <th scope="row" className={cn(tsb.tdSticky, "text-left font-medium")}>{row.sirketAdi}</th>
                      {segment === "toplam" ? (
                        <td className={tsb.td}>
                          <span
                            className={cn(
                              "inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide",
                              row.havuz === "hayatdisi"
                                ? "bg-teal-100 text-teal-900"
                                : "bg-sky-100 text-sky-950",
                            )}
                          >
                            {row.havuz === "hayatdisi" ? "HD" : "H/E"}
                          </span>
                        </td>
                      ) : null}
                      <td className={cn(tsb.td, "text-right font-semibold")}>{tsbFormatPrim(row.bu.genelToplam)}</td>
                      <td className={cn(tsb.td, "text-right font-semibold", tsbDeltaRenk(row.yoy))}>
                        {tsbFormatDegisimYuzde(row.yoy)}
                      </td>
                      <td className={cn(tsb.td, "min-w-[180px]")}>
                        <KanalStackedBar kutu={row.bu} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TsbTableShell>
          </section>
        </>
      )}

      {tab === "brans" && (
        <>
          {profilSatir ? (
            <section className={tsb.chartPanel}>
              <h2 className={tsb.sectionTitle}>
                Branş kanal profili — {tsbFormatPrim(profilSatir.bu.genelToplam)}
              </h2>
              <p className={cn(tsb.sectionLead, "mb-3")}>
                {profilSatir.label}
                {profilSatir.yoy !== null ? (
                  <span className={cn("ml-2 font-semibold", tsbDeltaRenk(profilSatir.yoy))}>
                    {tsbFormatDegisimYuzde(profilSatir.yoy)} YoY
                  </span>
                ) : null}
              </p>
              <KanalDonutChart kutu={profilSatir.bu} title={profilSatir.label} />
            </section>
          ) : (
            <p className={tsb.alertWarn}>Bu dönem için branş bulunamadı.</p>
          )}

          <section className={tsb.dataPanel}>
            <div className={cn(tsb.dataPanelHeader, "flex flex-wrap items-end justify-between gap-2")}>
              <div>
                <h2 className={tsb.dataPanelTitle}>
                  Tüm {filtreModu === "tarifeGrubu" ? "tarife grupları" : "branşlar"} — kanal dağılımı
                </h2>
                <p className="mt-1 text-sm text-slate-500">{secilenDonem} · sektör toplamı</p>
              </div>
              <KanalLegendChips />
            </div>
            <TsbTableShell>
              <table className={cn(tsb.table, "min-w-[900px]")}>
                <thead className={tsb.thead}>
                  <tr>
                    <th className={tsb.thSticky}>{filtreModu === "tarifeGrubu" ? "Tarife grubu" : "Branş"}</th>
                    <th className={tsb.thRight}>Toplam</th>
                    <th className={tsb.thRight}>YoY</th>
                    <th className={tsb.th}>Kanal dağılımı</th>
                  </tr>
                </thead>
                <tbody>
                  {bransSatirlari.map((row) => (
                    <tr
                      key={row.bransKey}
                      className={cn(tsb.tbodyRow, row.bransKey === secilenBransKey && "bg-emerald-50/40")}
                    >
                      <th scope="row" className={cn(tsb.tdSticky, "text-left font-medium")}>
                        <button
                          type="button"
                          className="text-left text-teal-800 hover:underline"
                          onClick={() => setSecilenBransKey(row.bransKey)}
                        >
                          {row.label}
                        </button>
                      </th>
                      <td className={cn(tsb.td, "text-right font-semibold")}>{tsbFormatPrim(row.bu.genelToplam)}</td>
                      <td className={cn(tsb.td, "text-right font-semibold", tsbDeltaRenk(row.yoy))}>
                        {tsbFormatDegisimYuzde(row.yoy)}
                      </td>
                      <td className={cn(tsb.td, "min-w-[180px]")}>
                        <KanalStackedBar kutu={row.bu} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TsbTableShell>
          </section>
        </>
      )}

      {tab === "sirket" && (
        <>
          {sirketler.length === 0 ? (
            <p className={tsb.alertWarn}>Bu dönem ve filtreye göre şirket bulunamadı.</p>
          ) : kiyas && effectiveSirketKodu !== null ? (
            <>
              {(() => {
                const sirketLider = kanalLiderOzeti(kiyas.sirket);
                return (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Toplam prim (YTD)</p>
                      <p className="mt-2 text-xl font-bold tabular-nums text-slate-950">
                        {tsbFormatPrim(kiyas.sirket.genelToplam)}
                      </p>
                    </article>
                    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Pazar payı</p>
                      <p className="mt-2 text-xl font-bold tabular-nums text-slate-950">
                        {kiyas.sektor.genelToplam > 0
                          ? `%${pf.format((kiyas.sirket.genelToplam / kiyas.sektor.genelToplam) * 100)}`
                          : "—"}
                      </p>
                    </article>
                    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Lider kanal</p>
                      <p className="mt-2 text-xl font-bold text-slate-950">{sirketLider.lider?.label ?? "—"}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {sirketLider.lider ? `%${pf1.format(sirketLider.lider.pay)} pay` : "—"}
                      </p>
                    </article>
                    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Aktif kanal</p>
                      <p className="mt-2 text-xl font-bold tabular-nums text-slate-950">{sirketLider.aktifSayisi}</p>
                    </article>
                  </div>
                );
              })()}

              <section className="grid gap-4 xl:grid-cols-2">
                <div className={tsb.chartPanel}>
                  <h2 className={cn(tsb.sectionTitle, "mb-3")}>{secilenAd} — kanal dağılımı</h2>
                  <KanalDonutChart kutu={kiyas.sirket} title={`${secilenAd} kanal`} />
                </div>
                <div className={tsb.chartPanel}>
                  <h2 className={cn(tsb.sectionTitle, "mb-3")}>Sektör — kanal dağılımı</h2>
                  <KanalDonutChart kutu={kiyas.sektor} title="Sektör kanal" />
                </div>
              </section>

              <div className={tsb.chartPanel}>
                <p className="text-xs font-semibold text-slate-800">Kanal payları — yüzde (yan yana)</p>
                <TsbSirketSektorGrafikLegend sirketAdi={secilenAd} />
                <KanalYuzdeGroupedBars
                  ys={kanalYuzdeleri(kiyas.sirket)}
                  yk={kanalYuzdeleri(kiyas.sektor)}
                  kanalSektorPayi={kanalBazindaSirketSektorPayYuzde(kiyas.sirket, kiyas.sektor)}
                />
              </div>

              <TsbTableShell>
                <table className={cn(tsb.table, "min-w-[820px]")}>
                  <thead className={tsb.thead}>
                    <tr>
                      <th className={tsb.th}>Kanal</th>
                      <th className={tsb.thRight}>Şirket ₺</th>
                      <th className={tsb.thRight}>Şirket %</th>
                      <th className={tsb.thRight}>Sektör ₺</th>
                      <th className={tsb.thRight}>Sektör %</th>
                      <th className={tsb.thRight}>Kanalda sektör payı</th>
                      <th className={tsb.thRight}>Fark (pp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const ys = kanalYuzdeleri(kiyas.sirket);
                      const yk = kanalYuzdeleri(kiyas.sektor);
                      const kanalSektorPayi = kanalBazindaSirketSektorPayYuzde(kiyas.sirket, kiyas.sektor);
                      const genelKanalPayi =
                        kiyas.sektor.genelToplam > 0
                          ? (kiyas.sirket.genelToplam / kiyas.sektor.genelToplam) * 100
                          : null;
                      return (
                        <>
                          {KANAL_DAGILIM_SATIRLARI.map(({ key, label }) => {
                            const ps = ys[key];
                            const pk = yk[key];
                            const pp = ps - pk;
                            const kp = kanalSektorPayi[key];
                            return (
                              <tr key={key} className={tsb.tbodyRow}>
                                <td className={cn(tsb.td, "font-medium")}>{label}</td>
                                <td className={cn(tsb.td, "text-right")}>{tsbFormatPrim(kiyas.sirket[key])}</td>
                                <td className={cn(tsb.td, "text-right text-slate-600")}>{pf.format(ps)}%</td>
                                <td className={cn(tsb.td, "text-right text-slate-600")}>{tsbFormatPrim(kiyas.sektor[key])}</td>
                                <td className={cn(tsb.td, "text-right text-slate-500")}>{pf.format(pk)}%</td>
                                <td className={cn(tsb.td, "text-right font-medium text-emerald-900")}>
                                  {kp !== null ? `${pf.format(kp)}%` : "—"}
                                </td>
                                <td className={cn(tsb.td, "text-right font-medium", tsbDeltaRenk(pp))}>{tsbFormatPp(pp)}</td>
                              </tr>
                            );
                          })}
                          <tr className={cn(tsb.tbodyRow, "border-t-2 border-slate-200 bg-slate-50/80 font-semibold")}>
                            <td className={tsb.td}>Genel toplam</td>
                            <td className={cn(tsb.td, "text-right")}>{tsbFormatPrim(kiyas.sirket.genelToplam)}</td>
                            <td className={cn(tsb.td, "text-right")}>100,00%</td>
                            <td className={cn(tsb.td, "text-right")}>{tsbFormatPrim(kiyas.sektor.genelToplam)}</td>
                            <td className={cn(tsb.td, "text-right")}>100,00%</td>
                            <td className={cn(tsb.td, "text-right text-emerald-900")}>
                              {genelKanalPayi !== null ? `${pf.format(genelKanalPayi)}%` : "—"}
                            </td>
                            <td className={cn(tsb.td, "text-right")}>—</td>
                          </tr>
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </TsbTableShell>

              <section className={tsb.dataPanel}>
                <div className={tsb.dataPanelHeader}>
                  <h2 className={tsb.dataPanelTitle}>Branş × kanal kırılımı</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {secilenAd} · {filtreModu === "tarifeGrubu" ? "tarife grubu" : "ana branş"} satırları
                  </p>
                </div>
                <TsbTableShell>
                  <table className={cn(tsb.table, "min-w-[980px]")}>
                    <thead className={tsb.thead}>
                      <tr>
                        <th className={tsb.thSticky}>{filtreModu === "tarifeGrubu" ? "Tarife" : "Branş"}</th>
                        {KANAL_DAGILIM_SATIRLARI.map(({ key, label }) => (
                          <th key={key} className={tsb.thRight}>{label}</th>
                        ))}
                        <th className={tsb.thRight}>Toplam</th>
                        <th className={tsb.thRight}>YoY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sirketBransSatirlari.slice(0, 50).map((row) => (
                        <tr key={row.bransKey} className={tsb.tbodyRow}>
                          <th scope="row" className={cn(tsb.tdSticky, "text-left font-medium")}>{row.label}</th>
                          {KANAL_DAGILIM_SATIRLARI.map(({ key }) => (
                            <td key={key} className={cn(tsb.td, "text-right text-slate-600")}>
                              {tsbFormatPrim(row.bu[key])}
                            </td>
                          ))}
                          <td className={cn(tsb.td, "text-right font-semibold")}>{tsbFormatPrim(row.bu.genelToplam)}</td>
                          <td className={cn(tsb.td, "text-right font-semibold", tsbDeltaRenk(row.yoy))}>
                            {tsbFormatDegisimYuzde(row.yoy)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TsbTableShell>
              </section>
            </>
          ) : null}

          {secilenAd ? (
            <TsbOlcekSegmentRozeti
              sirketAdi={secilenAd}
              kayit={olcekKayit}
              finDonem={olcekFinDonem}
              yukleniyor={olcekYukleniyor}
            />
          ) : null}
        </>
      )}

      {tab === "liderler" && liderPaket && (
        <>
          <div className="flex flex-wrap gap-2">
            {KANAL_DAGILIM_SATIRLARI.map(({ key, label }) => (
              <TsbToggleButton
                key={key}
                variant="segment"
                pressed={liderKanal === key}
                onClick={() => setLiderKanal(key)}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: KANAL_HEX[key] }} />
                  {label}
                </span>
              </TsbToggleButton>
            ))}
          </div>

          <section className={tsb.chartPanel}>
            <div className="min-w-[560px]">
              <KanalLiderBarChart
                satirlar={liderPaket.satirlar}
                kanalLabel={KANAL_DAGILIM_SATIRLARI.find((x) => x.key === liderKanal)?.label ?? liderKanal}
              />
            </div>
          </section>

          <section className={tsb.dataPanel}>
            <div className={cn(tsb.dataPanelHeader, "flex flex-wrap items-end justify-between gap-2")}>
              <div>
                <h2 className={tsb.dataPanelTitle}>
                  {KANAL_DAGILIM_SATIRLARI.find((x) => x.key === liderKanal)?.label} liderleri
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Kanal primi · YoY · kanal pazar payı · {secilenDonem}
                </p>
              </div>
              <Link
                href={`/sigorta/kanal-prim?donem=${encodeURIComponent(secilenDonem)}&segment=${segment}`}
                className={tsb.pillLink}
              >
                Prim sıralaması detayı →
              </Link>
            </div>
            <TsbTableShell>
              <table className={cn(tsb.table, "min-w-[760px]")}>
                <thead className={tsb.thead}>
                  <tr>
                    <th className={tsb.th}>#</th>
                    <th className={tsb.thSticky}>Şirket</th>
                    <th className={tsb.thRight}>Kanal primi</th>
                    <th className={tsb.thRight}>YoY</th>
                    <th className={tsb.thRight}>Kanal payı</th>
                  </tr>
                </thead>
                <tbody>
                  {liderPaket.satirlar.slice(0, 25).map((row) => (
                    <tr key={row.sirketKodu} className={tsb.tbodyRow}>
                      <td className={cn(tsb.td, "text-slate-500")}>{row.sira}</td>
                      <th scope="row" className={cn(tsb.tdSticky, "text-left font-medium")}>{row.sirketAdi}</th>
                      <td className={cn(tsb.td, "text-right font-semibold")}>{tsbFormatPrim(row.primBu)}</td>
                      <td className={cn(tsb.td, "text-right font-semibold", tsbDeltaRenk(row.yoy))}>
                        {tsbFormatDegisimYuzde(row.yoy)}
                      </td>
                      <td className={cn(tsb.td, "text-right")}>
                        {row.kanalPayi !== null ? `%${pf.format(row.kanalPayi)}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TsbTableShell>
          </section>
        </>
      )}
    </div>
  );
}
