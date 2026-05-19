"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_BEREKET_EMEKLILIK_KOD,
  DEFAULT_BEREKET_SIGORTA_HD_KOD,
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
        ? `${POOL_LABELS[pool]} sektör (n = ${paketBu.peerSayisi})`
        : `${POOL_LABELS[pool]} sektör`;
    }
    const ad = kiyasListe.find((s) => s.kod === kiyasSirketKodu)?.ad;
    return ad ?? "Kıyas şirketi";
  }, [kiyasModu, pool, paketBu, kiyasListe, kiyasSirketKodu]);

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
        {error}
      </p>
    );
  }

  if (tumDonemler.length === 0 && !error) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600">
        Dönem listesi yükleniyor…
      </p>
    );
  }

  if (!rows || !donem || sirketKodu === "") {
    return (
      <p className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600">
        {donem ? `${donem} verisi yükleniyor…` : "Gelir verisi yükleniyor…"}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div role="tablist" aria-label="Sektör havuzu" className="flex flex-wrap gap-1.5">
          {(["HD", "HAYAT_EMEKLILIK"] as const).map((p) => {
            const aktif = pool === p;
            return (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={aktif}
                onClick={() => {
                  setPool(p);
                  setSirketKodu("");
                }}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  aktif
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                    : "border-gray-300 bg-white text-gray-700 hover:border-emerald-300 hover:text-emerald-800"
                }`}
              >
                {POOL_LABELS[p]}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="fk-donem" className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Dönem
            </label>
            <select
              id="fk-donem"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={donem}
              onChange={(e) => setDonem(e.target.value)}
            >
              {[...tumDonemler].reverse().map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-gray-500">
              Karşılaştırma: <strong>{donem}</strong>{" "}
              {donemOnceki ? (
                <>
                  vs <strong>{donemOnceki}</strong>{" "}
                  {onceYilVarMi ? "" : "(önceki yıl verisi yok — “—” gösterilir)"}
                </>
              ) : null}
            </p>
          </div>
          <div>
            <label htmlFor="fk-sirket" className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Şirket
            </label>
            <select
              id="fk-sirket"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={String(sirketKodu)}
              onChange={(e) => setSirketKodu(e.target.value === "" ? "" : Number(e.target.value))}
            >
              {sirketListesi.map((s) => (
                <option key={s.kod} value={s.kod}>
                  {s.ad} ({s.kod})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-gray-500">
              Varsayılan: {pool === "HD" ? "Bereket Sigorta AŞ" : "Bereket Emeklilik ve Hayat AŞ"} (
              {pool === "HD" ? DEFAULT_BEREKET_SIGORTA_HD_KOD : DEFAULT_BEREKET_EMEKLILIK_KOD}).
            </p>
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Kıyas
            </span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setKiyasModu("sektor")}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                  kiyasModu === "sektor"
                    ? "border-slate-600 bg-slate-700 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-slate-400"
                }`}
              >
                Sektör (Σ)
              </button>
              <button
                type="button"
                onClick={() => setKiyasModu("sirket")}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                  kiyasModu === "sirket"
                    ? "border-slate-600 bg-slate-700 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-slate-400"
                }`}
              >
                Şirket
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="fk-kiyas-sirket"
              className="block text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Kıyas şirketi
            </label>
            <select
              id="fk-kiyas-sirket"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
              value={kiyasSirketKodu === "" ? "" : String(kiyasSirketKodu)}
              disabled={kiyasModu === "sektor" || kiyasListe.length === 0}
              onChange={(e) =>
                setKiyasSirketKodu(e.target.value === "" ? "" : Number(e.target.value))
              }
            >
              {kiyasListe.map((s) => (
                <option key={s.kod} value={s.kod}>
                  {s.ad} ({s.kod})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-gray-500">
              {kiyasModu === "sektor"
                ? "Sağ blok: havuzdaki şirketlerin toplamı (oranlarda Σ pay / Σ payda)."
                : "Sağ blok: seçilen şirketle bire bir kıyas."}
            </p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-gray-600">
          Sol blok: <strong className="text-gray-800">{secilenAd || "Şirket"}</strong> · Sağ blok:{" "}
          <strong className="text-gray-800">{kiyasBaslik}</strong>. Δ: TL satırlarında yüzde değişim; oran
          satırlarında puan farkı (pp).
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-[820px] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-slate-50">
              <th
                scope="col"
                rowSpan={2}
                className="sticky left-0 z-20 min-w-[15rem] border-r border-gray-200 bg-slate-50 px-3 py-2 text-left font-bold text-gray-800"
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
            <tr className="border-b border-gray-200 bg-gray-50/90">
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
                <tr
                  key={satir.id}
                  className="group border-b border-gray-100 odd:bg-white even:bg-gray-50/40"
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 max-w-[16rem] border-r border-gray-200 bg-white px-3 py-2 text-left align-top font-medium leading-snug text-gray-800 group-even:bg-gray-50/40"
                  >
                    {satir.label}
                  </th>

                  <td className="border-l border-gray-100 px-2 py-1.5 text-right tabular-nums text-gray-900">
                    {formatFinansalHucre(buDeg.sirket, satir.format)}
                  </td>
                  <td className="border-l border-gray-100 px-2 py-1.5 text-right tabular-nums text-gray-700">
                    {formatFinansalHucre(oncDeg.sirket, satir.format)}
                  </td>
                  <td
                    className={`border-l border-gray-100 px-2 py-1.5 text-right tabular-nums font-semibold ${
                      sirketDelta.deger === null
                        ? "text-gray-400"
                        : sirketDelta.deger > 0
                          ? "text-emerald-700"
                          : sirketDelta.deger < 0
                            ? "text-rose-700"
                            : "text-gray-700"
                    }`}
                  >
                    {formatFinansalDegisim(sirketDelta.deger, sirketDelta.format)}
                  </td>

                  <td className="border-l border-gray-200 px-2 py-1.5 text-right tabular-nums text-slate-800">
                    {formatFinansalHucre(buDeg.kiyas, satir.format)}
                  </td>
                  <td className="border-l border-gray-100 px-2 py-1.5 text-right tabular-nums text-slate-700">
                    {formatFinansalHucre(oncDeg.kiyas, satir.format)}
                  </td>
                  <td
                    className={`border-l border-gray-100 px-2 py-1.5 text-right tabular-nums font-semibold ${
                      kiyasDelta.deger === null
                        ? "text-gray-400"
                        : kiyasDelta.deger > 0
                          ? "text-emerald-700"
                          : kiyasDelta.deger < 0
                            ? "text-rose-700"
                            : "text-gray-700"
                    }`}
                  >
                    {formatFinansalDegisim(kiyasDelta.deger, kiyasDelta.format)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
