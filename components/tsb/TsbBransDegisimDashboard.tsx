"use client";

import { useEffect, useMemo, useState } from "react";
import { useTsbBranchLookupFetch } from "@/components/tsb/useTsbBranchLookup";
import {
  applyUrlSirketOrDefault,
  useTsbDashboardUrlPrefs,
} from "@/components/tsb/useTsbDashboardUrlPrefs";
import TsbKiyasModuControls, { kiyasBaslikFromModu } from "@/components/tsb/TsbKiyasModuControls";
import TsbOlcekSegmentRozeti from "@/components/tsb/TsbOlcekSegmentRozeti";
import { useOlcekSegmentCache } from "@/components/tsb/useOlcekSegmentCache";
import { useOlcekSegmentKayit } from "@/components/tsb/useOlcekSegmentKayit";
import { kiyasHedefFromModu, type TsbKiyasModu } from "@/lib/tsbKiyasHedef";
import { olcekSegmentPeerKodlariFromCache, primSegmentToOlcekPool } from "@/lib/tsbOlcekSegmentCache";
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
  tsbFormatDegisimYuzde,
  tsbFormatPp,
} from "@/components/tsb/tsbDashboardUi";
import type { BransDegisimKiyasHedef, BransDegisimSatir } from "@/lib/tsbBransDegisim";
import { buildBransDegisimTablosu } from "@/lib/tsbBransDegisim";
import type { TsbKanalField, TsbPrimDaraltmaModu, TsbPrimRow, TsbSektorSegment } from "@/lib/tsbPrimDashboard";
import {
  daraltmaFromUiState,
  isTsbToplamSirketKodu,
  listSirketlerSegmentDonem,
  countSirketlerSegmentDonem,
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

const HAVUZ_LABEL: Record<TsbSektorSegment, string> = {
  hayatdisi: "Hayat dışı (HD)",
  hayat: "Hayat / Emeklilik",
};

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

function SatirHucresi({
  satir,
  araToplam,
  kiyasBaslik,
}: {
  satir: BransDegisimSatir;
  araToplam?: boolean;
  kiyasBaslik: string;
}) {
  const rowCls = araToplam ? "bg-slate-100/90 font-semibold" : "";
  return (
    <tr className={cn(tsb.tbodyRow, rowCls)}>
      <td className={cn(tsb.tdSticky, "whitespace-nowrap text-xs", araToplam && "bg-slate-100/90")}>
        {satir.anaBransH}
      </td>
      <td className={cn(tsb.td, "text-right")}>{nf.format(satir.sirketPrimOnceki)}</td>
      <td className={cn(tsb.td, "text-right")}>{nf.format(satir.sirketPrimBu)}</td>
      <td className={cn(tsb.td, "text-right", tsbDeltaRenk(satir.sirketDegisim))}>
        {tsbFormatDegisimYuzde(satir.sirketDegisim)}
      </td>
      <td className={cn(tsb.td, "text-right text-slate-600")}>{nf.format(satir.sektorPrimOnceki)}</td>
      <td className={cn(tsb.td, "text-right text-slate-600")}>{nf.format(satir.sektorPrimBu)}</td>
      <td className={cn(tsb.td, "text-right", tsbDeltaRenk(satir.sektorDegisim))}>
        {tsbFormatDegisimYuzde(satir.sektorDegisim)}
      </td>
      <td className={cn(tsb.td, "text-right text-slate-600")} title={`Sol şirket payı · ${HAVUZ_LABEL[satir.grup]} sektör toplamı`}>
        {pf.format(satir.payOncekiYuzde)}%
      </td>
      <td className={cn(tsb.td, "text-right text-slate-600")} title={`Sol şirket payı · ${HAVUZ_LABEL[satir.grup]} sektör toplamı`}>
        {pf.format(satir.payBuYuzde)}%
      </td>
      <td className={cn(tsb.td, "text-right", tsbDeltaRenk(satir.payDegisimPp))} title={`Pazar payı değişimi (sol şirket · sektör); sağ blok: ${kiyasBaslik}`}>
        {tsbFormatPp(satir.payDegisimPp)}
      </td>
    </tr>
  );
}

export default function TsbBransDegisimDashboard() {
  const urlPrefs = useTsbDashboardUrlPrefs();
  const [rows, setRows] = useState<TsbPrimRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [donem, setDonem] = useState("");
  const [kanal, setKanal] = useState<TsbKanalField>("genelToplam");
  const [filtreModu, setFiltreModu] = useState<TsbPrimDaraltmaModu>("anaBransH");
  const [segment, setSegment] = useState<TsbSektorSegment>(urlPrefs.segment ?? "hayatdisi");
  const [sirketKodu, setSirketKodu] = useState<number | "">("");
  const [kiyasModu, setKiyasModu] = useState<TsbKiyasModu>("sektor");
  const [kiyasSirketKodu, setKiyasSirketKodu] = useState<number | "">("");

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
    return listSirketlerSegmentDonem(rows, secilenDonem, kanal, segment, daraltma);
  }, [rows, secilenDonem, kanal, segment, daraltma]);

  useEffect(() => {
    if (sirketler.length === 0) return;
    applyUrlSirketOrDefault(
      sirketler,
      urlPrefs.sirket,
      sirketKodu,
      setSirketKodu,
      segment === "hayatdisi" ? "hayatdisi" : "hayat",
    );
  }, [sirketler, sirketKodu, urlPrefs.sirket, segment]);

  const effectiveSirketKodu = useMemo(() => {
    if (sirketler.length === 0) return null;
    if (sirketKodu !== "" && sirketler.some((s) => s.kod === sirketKodu)) return sirketKodu as number;
    return resolveDefaultSirketKodu(sirketler, segment === "hayatdisi" ? "hayatdisi" : "hayat");
  }, [sirketler, sirketKodu, segment]);

  useEffect(() => {
    if (!rows || effectiveSirketKodu === null) return;
    const havuz = sirketSegmentFromKodu(rows, effectiveSirketKodu);
    if (havuz !== segment) setSegment(havuz);
  }, [rows, effectiveSirketKodu, segment]);

  const kiyasListe = useMemo(
    () => sirketler.filter((s) => s.kod !== effectiveSirketKodu),
    [sirketler, effectiveSirketKodu],
  );

  useEffect(() => {
    if (kiyasModu !== "sirket" || kiyasListe.length === 0) return;
    if (kiyasListe.some((s) => s.kod === kiyasSirketKodu)) return;
    setKiyasSirketKodu(kiyasListe[0].kod);
  }, [kiyasModu, kiyasListe, kiyasSirketKodu]);

  const { cache: olcekCache } = useOlcekSegmentCache();

  const olcekPeer = useMemo(() => {
    if (effectiveSirketKodu === null || !secilenDonem) return null;
    return olcekSegmentPeerKodlariFromCache(
      olcekCache,
      secilenDonem,
      primSegmentToOlcekPool(segment),
      effectiveSirketKodu,
    );
  }, [olcekCache, secilenDonem, segment, effectiveSirketKodu]);

  const kiyasHedef: BransDegisimKiyasHedef = useMemo(() => {
    if (kiyasModu === "sektor") return { mod: "sektor" };
    if (kiyasModu === "olcek") {
      if (!olcekPeer?.segment || olcekPeer.kodlar.length === 0) return { mod: "sektor" };
      return {
        mod: "olcek",
        sirketKodlari: olcekPeer.kodlar,
        segment: olcekPeer.segment,
      };
    }
    if (kiyasSirketKodu === "") return { mod: "sektor" };
    return { mod: "sirket", sirketKodu: kiyasSirketKodu };
  }, [kiyasModu, kiyasSirketKodu, olcekPeer]);

  const tablo = useMemo(() => {
    if (!rows || !secilenDonem || effectiveSirketKodu === null) return null;
    return buildBransDegisimTablosu(rows, secilenDonem, kanal, effectiveSirketKodu, daraltma, kiyasHedef);
  }, [rows, secilenDonem, kanal, effectiveSirketKodu, daraltma, kiyasHedef]);

  const sektorPeerSayisi = useMemo(() => {
    if (!rows || !secilenDonem) return undefined;
    return countSirketlerSegmentDonem(rows, secilenDonem, segment);
  }, [rows, secilenDonem, segment]);

  const secilenAdEarly = sirketler.find((s) => s.kod === effectiveSirketKodu)?.ad ?? "";
  const { kayit: olcekKayit, finDonem: olcekFinDonem, yukleniyor: olcekYukleniyor } = useOlcekSegmentKayit(
    effectiveSirketKodu !== null && secilenDonem
      ? {
          kaynak: "prim",
          donem: secilenDonem,
          segment,
          sirketKodu: effectiveSirketKodu,
          sirketAdi: secilenAdEarly,
          cache: olcekCache,
        }
      : null,
  );

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

  const secilenAd = secilenAdEarly;
  const kolonBaslik = tablo.kirisumModu === "anaBransH" ? "Branş" : "Tarife grubu";

  const kiyasBaslik = kiyasBaslikFromModu(tablo.kiyasMod, {
    sektorPeerSayisi: tablo.peerSayisi,
    olcekSegment: tablo.kiyasOlcekSegment,
    olcekPeerSayisi: tablo.kiyasMod === "olcek" ? tablo.peerSayisi : undefined,
    sirketAdi: kiyasListe.find((s) => s.kod === kiyasSirketKodu)?.ad,
  });

  const kiyasBaslikKisa =
    tablo.kiyasMod === "sektor"
      ? "Sektör toplamı"
      : tablo.kiyasMod === "olcek"
        ? `${tablo.kiyasOlcekSegment ?? "Benzer ölçek"} ort.`
        : kiyasBaslik.slice(0, 42) + (kiyasBaslik.length > 42 ? "…" : "");

  const blokBaslik =
    tablo.tabloHavuzu === "hayatdisi"
      ? `Hayat dışı ${tablo.kirisumModu === "tarifeGrubu" ? "(tarife)" : "branşları"}`
      : `Hayat & emeklilik ${tablo.kirisumModu === "tarifeGrubu" ? "(tarife)" : "(TSB ana branş)"}`;

  return (
    <div className={tsb.dashboardStack}>
      <TsbFilterBar>
        <p className={tsb.filterSectionLabel}>Sektör havuzu (şirket listesi)</p>
        <div className={cn(tsb.btnGroup, "mb-3")}>
          <TsbToggleButton
            pressed={segment === "hayatdisi"}
            variant="segment"
            onClick={() => {
              setSegment("hayatdisi");
              setSirketKodu("");
              setKiyasModu("sektor");
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
              setKiyasModu("sektor");
            }}
          >
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
          Tablo yalnızca <strong>seçili şirketin havuzuna</strong> ({HAVUZ_LABEL[tablo.tabloHavuzu]}) ait branşları
          gösterir.
        </p>
      </TsbFilterBar>

      <TsbFilterBar>
        <TsbFilterGrid>
          <TsbFilterField label="Kanal">
            <TsbSelect value={kanal} onChange={(e) => setKanal(e.target.value as TsbKanalField)}>
              {KANALLAR.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
          <TsbFilterField
            label="Dönem (karşılaştırma ayı)"
            hint={
              <>
                Tablo: <strong>{tablo.donemOnceki}</strong> vs <strong>{tablo.donemBu}</strong>
              </>
            }
          >
            <TsbSelect value={secilenDonem} onChange={(e) => setDonem(e.target.value)}>
              {donemler.map((d) => (
                <option key={d} value={d}>
                  {d} · önceki yıl {prevYearPeriod(d) ?? "—"}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>

          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <span className={tsb.filterLabel}>Tablo karşılaştırması</span>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
              Sol blok seçili şirket; sağ blok sektör toplamı veya başka bir şirket. Pazar payı her zaman sol şirketin
              sektör içindeki payıdır.
            </p>
            <div className="mt-2 flex flex-col gap-3 rounded-lg border border-slate-200/90 bg-white/80 p-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                  Sol blok — şirket
                </span>
                <TsbSelect
                  className="mt-1"
                  value={effectiveSirketKodu !== null ? String(effectiveSirketKodu) : ""}
                  onChange={(e) => setSirketKodu(Number(e.target.value))}
                >
                  {sirketler.map((s) => (
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
                  sektorPeerSayisi={sektorPeerSayisi}
                  olcekSegment={olcekPeer?.segment}
                  olcekPeerSayisi={olcekPeer?.kodlar.length}
                  kiyasListe={kiyasListe}
                  kiyasSirketKodu={kiyasSirketKodu}
                  onKiyasSirketKoduChange={setKiyasSirketKodu}
                  selectId="bd-kiyas-sirket"
                />
              </div>
            </div>
          </div>
        </TsbFilterGrid>
      </TsbFilterBar>

      {secilenAd ? (
        <TsbOlcekSegmentRozeti sirketAdi={secilenAd} kayit={olcekKayit} finDonem={olcekFinDonem} yukleniyor={olcekYukleniyor} />
      ) : null}

      <p className={cn(tsb.filterBar, tsb.filterHint, "!mt-0")}>
        <strong>{blokBaslik}</strong> · <strong>Değişim %</strong> ve <strong>Δ pp</strong> önceki yıla göre:{" "}
        <span className="text-emerald-800">artış yeşil</span>, <span className="text-red-700">düşüş kırmızı</span>.
        Pazar payı: <strong>{secilenAd.slice(0, 36)}{secilenAd.length > 36 ? "…" : ""}</strong> · sektör.
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
              <th colSpan={3} className={cn(tsb.thCenter, "border-l border-slate-200 bg-slate-100/80 text-slate-800")}>
                {kiyasBaslikKisa}
              </th>
              <th
                colSpan={3}
                className={cn(tsb.thCenter, "border-l border-slate-200 bg-slate-50 text-slate-700")}
                title="Sol şirketin sektör içindeki branş payı"
              >
                Pazar payı · sektör
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
            <tr className={tablo.tabloHavuzu === "hayatdisi" ? "bg-emerald-50/70" : "bg-sky-50/70"}>
              <td
                colSpan={10}
                className={cn(
                  "sticky left-0 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide",
                  tablo.tabloHavuzu === "hayatdisi" ? "bg-emerald-50/70 text-emerald-900" : "bg-sky-50/70 text-sky-900",
                )}
              >
                {blokBaslik}
              </td>
            </tr>
            {tablo.branslar.map((s) => (
              <SatirHucresi key={s.anaBransH} satir={s} kiyasBaslik={kiyasBaslik} />
            ))}
            {tablo.trafikHaricToplam && (
              <SatirHucresi satir={tablo.trafikHaricToplam} araToplam kiyasBaslik={kiyasBaslik} />
            )}
            <SatirHucresi satir={tablo.toplam} araToplam kiyasBaslik={kiyasBaslik} />
          </tbody>
        </table>
      </TsbTableShell>
    </div>
  );
}
