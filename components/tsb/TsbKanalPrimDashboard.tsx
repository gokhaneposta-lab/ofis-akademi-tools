"use client";

import { useEffect, useMemo, useState } from "react";
import type { TsbKanalField, TsbPrimDaraltmaModu, TsbPrimRow, TsbSektorSegment } from "@/lib/tsbPrimDashboard";
import {
  ANA_BRANS_FILTER_TRAFIK_HARIC,
  ANA_BRANS_FILTER_TRAFIK_HARIC_LABEL,
  buildKiyaslamaTablosu,
  daraltmaFromUiState,
  isTsbToplamSirketKodu,
  sektorToplamDegisimYuzde,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC_LABEL,
  uniqueAnaBransForSegment,
  uniqueSortedPeriods,
  uniqueTarifeGruplariForSegment,
} from "@/lib/tsbPrimDashboard";
import { TsbRenkAciklama } from "@/components/tsb/TsbRenkAciklama";
import { useTsbBranchLookupFetch } from "@/components/tsb/useTsbBranchLookup";
import { useTsbDashboardUrlPrefs } from "@/components/tsb/useTsbDashboardUrlPrefs";
import { TSB_TUM_BRANS_LABEL } from "@/lib/tsbKirilimSozluk";
import {
  cn,
  tsb,
  TsbError,
  TsbFilterBar,
  TsbFilterField,
  TsbKpiCard,
  TsbKpiGrid,
  TsbLoading,
  TsbSegmentSwitch,
  TsbSelect,
  TsbTableShell,
  tsbDeltaRenk,
  tsbFormatDegisimYuzde,
  tsbFormatPrim,
  tsbSiraIyilestirmeRenk,
} from "@/components/tsb/tsbDashboardUi";

const KANALLAR: { value: TsbKanalField; label: string }[] = [
  { value: "genelToplam", label: "Genel toplam (tüm kanallar)" },
  { value: "acente", label: "Acente" },
  { value: "banka", label: "Banka" },
  { value: "broker", label: "Broker" },
  { value: "diger", label: "Diğer" },
  { value: "merkez", label: "Merkez" },
];

const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export default function TsbKanalPrimDashboard() {
  const urlPrefs = useTsbDashboardUrlPrefs();
  const [rows, setRows] = useState<TsbPrimRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [segment, setSegment] = useState<TsbSektorSegment>("hayatdisi");
  const [donem, setDonem] = useState<string>("");
  const [anaBrans, setAnaBrans] = useState<string>("");
  const [filtreModu, setFiltreModu] = useState<TsbPrimDaraltmaModu>("anaBransH");
  const [tarifeSecim, setTarifeSecim] = useState("");
  const [kanal, setKanal] = useState<TsbKanalField>("genelToplam");

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
        const cleaned = data.filter((row) => !isTsbToplamSirketKodu(row.sirketKodu));
        setRows(cleaned);
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
    if (donemler.length === 0 || donem) return;
    if (urlPrefs.donem && donemler.includes(urlPrefs.donem)) {
      setDonem(urlPrefs.donem);
    }
  }, [donemler, donem, urlPrefs.donem]);

  const anaBransSecenekleri = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return uniqueAnaBransForSegment(rows, secilenDonem, segment);
  }, [rows, secilenDonem, segment]);

  const tarifeSecenekleri = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return uniqueTarifeGruplariForSegment(rows, secilenDonem, segment, branchLookup);
  }, [rows, secilenDonem, segment, branchLookup]);

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

  const daraltma = useMemo(
    () => daraltmaFromUiState(filtreModu, anaBrans, tarifeSecim, branchLookup),
    [filtreModu, anaBrans, tarifeSecim, branchLookup],
  );

  const tablo = useMemo(() => {
    if (!rows || !secilenDonem) return null;
    return buildKiyaslamaTablosu(rows, secilenDonem, kanal, daraltma, segment);
  }, [rows, secilenDonem, kanal, daraltma, segment]);

  if (error) return <TsbError message={error} />;
  if (!rows) return <TsbLoading />;
  if (rows.length === 0) {
    return <p className={tsb.alertWarn}>Gösterilecek prim verisi bulunamadı.</p>;
  }

  const tumAnaBransLabel = TSB_TUM_BRANS_LABEL[segment];

  const toplamDegisim =
    tablo !== null
      ? sektorToplamDegisimYuzde(tablo.sektorToplamOnceki, tablo.sektorToplamBu)
      : null;
  const liderSatir = tablo?.satirlar[0] ?? null;
  const kanalLabel = KANALLAR.find((k) => k.value === kanal)?.label ?? "Kanal";

  return (
    <div className={tsb.dashboardStack}>
      {tablo ? (
        <TsbKpiGrid>
          <TsbKpiCard
            accent
            label="Sektör toplamı"
            value={tsbFormatPrim(tablo.sektorToplamBu)}
            delta={`${tsbFormatDegisimYuzde(toplamDegisim)} YoY`}
            deltaClassName={tsbDeltaRenk(toplamDegisim)}
            story={
              toplamDegisim == null
                ? "YoY karşılaştırması yok."
                : toplamDegisim > 0
                  ? "Seçili kırılımda pazar büyüyor."
                  : toplamDegisim < 0
                    ? "Seçili kırılımda pazar daralıyor."
                    : "Seçili kırılımda değişim yok."
            }
          />
          <TsbKpiCard
            label="Lider şirket"
            value={liderSatir?.sirketAdi ?? "—"}
            delta={liderSatir ? `%${pf.format(liderSatir.payBuYuzde)} pay` : undefined}
            story={
              liderSatir
                ? liderSatir.siraOnceki > liderSatir.siraBu
                  ? "Sıra geçen yıla göre iyileşti."
                  : liderSatir.siraOnceki < liderSatir.siraBu
                    ? "Sıra geçen yıla göre geriledi."
                    : "Sıra geçen yılla aynı."
                : "—"
            }
          />
          <TsbKpiCard
            label="Listelenen şirket"
            value={tablo.satirlar.length}
            delta={kanalLabel}
            story={`${secilenDonem} · seçili filtreye göre.`}
          />
          <TsbKpiCard
            label="Lider prim"
            value={liderSatir ? tsbFormatPrim(liderSatir.primBu) : "—"}
            delta={liderSatir ? `${tsbFormatDegisimYuzde(liderSatir.degisimYuzde)} YoY` : undefined}
            deltaClassName={liderSatir ? tsbDeltaRenk(liderSatir.degisimYuzde) : undefined}
            story={
              liderSatir && liderSatir.degisimYuzde != null && toplamDegisim != null
                ? liderSatir.degisimYuzde > toplamDegisim
                  ? "Pazarın üzerinde büyüyor."
                  : liderSatir.degisimYuzde < toplamDegisim
                    ? "Pazarın altında büyüyor."
                    : "Pazarla aynı hızda."
                : "—"
            }
          />
        </TsbKpiGrid>
      ) : null}

      <TsbFilterBar>
        <div className={tsb.filterCompactRow}>
          <div>
            <p className={tsb.filterSectionLabel}>Havuz</p>
            <TsbSegmentSwitch
              aria-label="Sektör havuzu"
              value={segment}
              onChange={(v) => {
                setSegment(v);
                setAnaBrans("");
                setTarifeSecim("");
              }}
              options={[
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
          <TsbFilterField label="Dönem">
            <TsbSelect
              value={secilenDonem}
              onChange={(e) => {
                setDonem(e.target.value);
                setAnaBrans("");
                setTarifeSecim("");
              }}
            >
              {donemler.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
          <TsbFilterField label={filtreModu === "anaBransH" ? "Branş" : "Tarife grubu"}>
            {filtreModu === "anaBransH" ? (
              <TsbSelect className={tsb.selectWide} value={anaBrans} onChange={(e) => setAnaBrans(e.target.value)}>
                <option value="">{tumAnaBransLabel}</option>
                {segment === "hayatdisi" && (
                  <option value={ANA_BRANS_FILTER_TRAFIK_HARIC}>{ANA_BRANS_FILTER_TRAFIK_HARIC_LABEL}</option>
                )}
                {anaBransSecenekleri.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </TsbSelect>
            ) : (
              <TsbSelect className={tsb.selectWide} value={tarifeSecim} onChange={(e) => setTarifeSecim(e.target.value)}>
                <option value="">Tüm tarife grupları</option>
                {segment === "hayatdisi" && (
                  <option value={TARIFE_GRUBU_FILTER_TRAFIK_HARIC}>{TARIFE_GRUBU_FILTER_TRAFIK_HARIC_LABEL}</option>
                )}
                {tarifeSecenekleri.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </TsbSelect>
            )}
          </TsbFilterField>
          <TsbFilterField label="Kanal">
            <TsbSelect value={kanal} onChange={(e) => setKanal(e.target.value as TsbKanalField)}>
              {KANALLAR.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
        </div>
      </TsbFilterBar>

      {tablo && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className={tsb.sectionTitle}>Şirket sıralaması</h2>
              <p className={tsb.sectionLead}>
                {secilenDonem}
                {tablo.donemOnceki ? ` · geçen yıl aynı ay: ${tablo.donemOnceki}` : ""}
              </p>
            </div>
            <details className="text-xs text-slate-500">
              <summary className="cursor-pointer font-semibold text-slate-600 hover:text-slate-900">
                Renk kodları
              </summary>
              <div className="mt-2">
                <TsbRenkAciklama
                  baslik="Renk kodları"
                  items={[
                    { label: "Bu yıl sıra — yeşil: sıra iyileşti", ton: "iyi" },
                    { label: "Bu yıl sıra — sarı: değişmedi", ton: "notr" },
                    { label: "Bu yıl sıra — kırmızı: kötüleşti", ton: "kotu" },
                    { label: "Değişim % — yeşil: artış / kırmızı: düşüş", ton: "iyi" },
                  ]}
                />
              </div>
            </details>
          </div>
          <TsbTableShell>
            <table className={tsb.tableDense}>
              <colgroup>
                <col className="w-[4.75rem]" />
                <col className="w-[4.75rem]" />
                <col className="w-[4.25rem]" />
                <col className="w-[135px]" />
                <col />
                <col className="w-[4.5rem]" />
                <col />
                <col className="w-[4.5rem]" />
                <col className="min-w-[5.25rem]" />
              </colgroup>
              <thead className={tsb.thead}>
                <tr className="min-h-11">
                  <th className={cn(tsb.thCenter, "leading-snug whitespace-normal")}>
                    Önceki yıl
                    <br />
                    sıra
                  </th>
                  <th className={cn(tsb.thCenter, "leading-snug whitespace-normal")}>
                    Bu yıl
                    <br />
                    sıra
                  </th>
                  <th className={cn(tsb.thCenter, "whitespace-normal")}>Şirket kodu</th>
                  <th className={cn(tsb.th, "leading-snug")}>Şirket adı</th>
                  <th className={cn(tsb.thRight, "whitespace-nowrap leading-snug")}>
                    {tablo.donemOnceki ?? "Önceki"} prim
                  </th>
                  <th className={cn(tsb.thRight, "whitespace-normal leading-snug")}>
                    Önceki
                    <br />
                    pay %
                  </th>
                  <th className={cn(tsb.thRight, "whitespace-nowrap leading-snug")}>{secilenDonem} prim</th>
                  <th className={cn(tsb.thRight, "whitespace-normal leading-snug")}>
                    Bu yıl
                    <br />
                    pay %
                  </th>
                  <th className={cn(tsb.thRight, "whitespace-nowrap leading-snug")}>Değişim %</th>
                </tr>
              </thead>
              <tbody>
                {tablo.satirlar.map((s) => (
                  <tr key={s.sirketKodu} className={tsb.tbodyRowDense}>
                    <td className={cn(tsb.td, "text-center text-slate-600")}>{s.siraOnceki}</td>
                    <td className={cn(tsb.td, "text-center", tsbSiraIyilestirmeRenk(s.siraOnceki, s.siraBu))}>{s.siraBu}</td>
                    <td className={cn(tsb.td, "text-center whitespace-nowrap")}>{s.sirketKodu}</td>
                    <td className={cn(tsb.td, "max-w-[135px]")}>
                      <div className="truncate" title={s.sirketAdi}>
                        {s.sirketAdi}
                      </div>
                    </td>
                    <td className={cn(tsb.td, "text-right whitespace-nowrap")}>{tsbFormatPrim(s.primOnceki)}</td>
                    <td className={cn(tsb.td, "text-right text-slate-600 whitespace-nowrap")}>
                      {pf.format(s.payOncekiYuzde)}
                    </td>
                    <td className={cn(tsb.td, "text-right font-medium whitespace-nowrap")}>{tsbFormatPrim(s.primBu)}</td>
                    <td className={cn(tsb.td, "text-right whitespace-nowrap")}>{pf.format(s.payBuYuzde)}</td>
                    <td className={cn(tsb.td, "text-right font-medium whitespace-nowrap", tsbDeltaRenk(s.degisimYuzde))}>
                      {tsbFormatDegisimYuzde(s.degisimYuzde)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className={tsb.tfoot}>
                <tr className={tsb.tbodyRowDense}>
                  <td className={cn(tsb.td, "text-center text-slate-500")}>—</td>
                  <td className={cn(tsb.td, "text-center text-slate-500")}>—</td>
                  <td className={cn(tsb.td, "text-center text-slate-500")}>—</td>
                  <td className={tsb.td}>TOPLAM</td>
                  <td className={cn(tsb.td, "text-right whitespace-nowrap")}>{tsbFormatPrim(tablo.sektorToplamOnceki)}</td>
                  <td className={cn(tsb.td, "text-right text-emerald-900 whitespace-nowrap")}>{pf.format(100)}</td>
                  <td className={cn(tsb.td, "text-right whitespace-nowrap")}>{tsbFormatPrim(tablo.sektorToplamBu)}</td>
                  <td className={cn(tsb.td, "text-right text-emerald-900 whitespace-nowrap")}>{pf.format(100)}</td>
                  <td className={cn(tsb.td, "text-right whitespace-nowrap", tsbDeltaRenk(toplamDegisim))}>
                    {tsbFormatDegisimYuzde(toplamDegisim)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </TsbTableShell>
        </>
      )}
    </div>
  );
}
