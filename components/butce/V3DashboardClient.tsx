"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  REFERANS_YIL_SECENEKLERI,
  referansYilAgirliklari,
} from "@/lib/butce/config/constants";
import {
  V2_MALI_GELIR_DISCLAIMER,
  V2_VERGI_DISCLAIMER,
} from "@/lib/butce/v2/maliGelirProxyConfig";
import { downloadV2GelirTablosuExcel } from "@/lib/butce/v2/exportV2GelirTablosu";
import type { GelirTablosuSonuc } from "@/lib/butce/gelir/gelirTablosu";
import type { GtCocukPay } from "@/lib/butce/v2/gtFormatCocukPay";
import type {
  V3KalibrasyonSatir,
  MizanReconSatir,
  V3MaliGelirRollingSonuc,
} from "@/lib/butce/v3/types";
import type { V3Oneri } from "@/lib/butce/v3/motor/types";
import { toplamPrimFromTarife, V3_AYLIK_GETIRI_PCT_2026 } from "@/lib/butce/v3/defaults";
import {
  v2FiltreBransKodlari,
  v2FiltreEtiket,
  v2OzetDeger,
  v2YediliSecenekler,
  type V2GtFiltreModu,
} from "@/lib/butce/v2/v2GtFiltre";
import V2GtHesapTablo from "@/components/butce/V2GtHesapTablo";
import V2GtFiltreBar from "@/components/butce/V2GtFiltreBar";
import V2GtTeknikOranTablo from "@/components/butce/V2GtTeknikOranTablo";

const tl = (n: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);

const pct = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "percent", minimumFractionDigits: 1 }).format(n);

const AY_ADLARI = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
] as const;

type FaaliyetRow = {
  hesap: string;
  ad: string;
  oncekiYilTutari: number;
  butceTutari: number;
};

type TarifeRow = {
  tarifeGrubu: string;
  mevcutHedef: number;
  yeniHedef: number;
  artisOrani: number;
};

export default function V3DashboardClient() {
  const [butceYili, setButceYili] = useState(2026);
  const [butceYillari, setButceYillari] = useState<number[]>([2026]);
  const [tarifeRows, setTarifeRows] = useState<TarifeRow[]>([]);
  const [referans, setReferans] = useState("Son 2 Yıl Ortalaması (2024-2025)");
  const [yilAgirliklari, setYilAgirliklari] = useState<number[]>([0.5, 0.5]);
  const [ytdAnchorAy, setYtdAnchorAy] = useState(7);
  const [giderRows, setGiderRows] = useState<FaaliyetRow[]>([]);
  const [getiriPct, setGetiriPct] = useState<number[]>([...V3_AYLIK_GETIRI_PCT_2026]);
  const [v2SorunOzeti, setV2SorunOzeti] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [gt, setGt] = useState<GelirTablosuSonuc | null>(null);
  const [maliGelirRolling, setMaliGelirRolling] = useState<V3MaliGelirRollingSonuc | null>(null);
  const [kalibrasyon, setKalibrasyon] = useState<V3KalibrasyonSatir[]>([]);
  const [mizanTutmayan, setMizanTutmayan] = useState<MizanReconSatir[]>([]);
  const [oneriler, setOneriler] = useState<V3Oneri[]>([]);
  const [uyarilar, setUyarilar] = useState<string[]>([]);
  const [formatCocukPay, setFormatCocukPay] = useState<GtCocukPay>({});
  const [excelBusy, setExcelBusy] = useState(false);
  const [ozetAy, setOzetAy] = useState(12);
  const [filtreMod, setFiltreMod] = useState<V2GtFiltreModu>("tarife");
  const [filtreSecim, setFiltreSecim] = useState<Set<string>>(() => new Set());
  const [hasMizan, setHasMizan] = useState(true);

  const toplamPrim = useMemo(
    () => tarifeRows.reduce((a, r) => a + (r.yeniHedef || 0), 0),
    [tarifeRows],
  );

  const oneriByKey = useMemo(() => {
    const m = new Map<string, V3Oneri>();
    for (const o of oneriler) m.set(`${o.alan}|${o.key}`, o);
    return m;
  }, [oneriler]);

  function OneriBadge({ alan, oneriKey }: { alan: V3Oneri["alan"]; oneriKey: string }) {
    const o = oneriByKey.get(`${alan}|${oneriKey}`);
    if (!o) return null;
    const sapma = o.sapmaPct;
    const renk =
      sapma == null
        ? "bg-slate-100 text-slate-600"
        : Math.abs(sapma) < 5
          ? "bg-emerald-100 text-emerald-800"
          : Math.abs(sapma) < 15
            ? "bg-amber-100 text-amber-800"
            : "bg-rose-100 text-rose-800";
    const oneriText =
      alan === "mali_getiri"
        ? `${o.modelOneri.toFixed(2)}%`
        : new Intl.NumberFormat("tr-TR").format(o.modelOneri);
    return (
      <span
        className={`ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${renk}`}
        title={o.aciklama}
      >
        model: {oneriText}
        {sapma != null ? ` (${sapma > 0 ? "+" : ""}${sapma.toFixed(1)}%)` : ""}
      </span>
    );
  }

  const refYears = REFERANS_YIL_SECENEKLERI[referans] ?? [2024, 2025];

  const load = useCallback(async (hedefYil?: number) => {
    const query = hedefYil ? `?butceYili=${hedefYil}` : "";
    const res = await fetch(`/api/butce/v3/varsayimlar${query}`);
    if (!res.ok) return;
    const data = await res.json();
    const yil = data.butceYili ?? 2026;
    setButceYili(yil);
    setButceYillari(data.butceYillari?.length ? data.butceYillari : [yil]);
    setYtdAnchorAy(data.ytdAnchorAy ?? 7);
    setV2SorunOzeti(data.v2SorunOzeti ?? []);
    setHasMizan(data.dataDurumu?.hasMizan !== false);

    const ozet = (data.tarifeOzet ?? []) as Array<{
      tarifeGrubu: string;
      mevcutHedef: number;
      yeniHedef?: number;
    }>;
    setTarifeRows(
      ozet.map((r) => {
        const yeni = r.yeniHedef ?? r.mevcutHedef;
        return {
          tarifeGrubu: r.tarifeGrubu,
          mevcutHedef: r.mevcutHedef,
          yeniHedef: yeni,
          artisOrani: r.mevcutHedef > 0 ? yeni / r.mevcutHedef - 1 : 0,
        };
      }),
    );

    setGiderRows((data.faaliyetGiderSatirlari ?? []) as FaaliyetRow[]);

    if (Array.isArray(data.aylikGetiriOrani) && data.aylikGetiriOrani.length === 12) {
      setGetiriPct(data.aylikGetiriOrani.map((x: number) => x * 100));
    } else if (yil === 2026) {
      setGetiriPct([...V3_AYLIK_GETIRI_PCT_2026]);
    }

    const refEtiket = data.referansEtiket ?? "Son 2 Yıl Ortalaması (2024-2025)";
    setReferans(refEtiket);
    setYilAgirliklari(referansYilAgirliklari(refEtiket, data.yilAgirliklari));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function bodyPayload() {
    const tarifeHedefleri: Record<string, number> = {};
    for (const r of tarifeRows) tarifeHedefleri[r.tarifeGrubu] = r.yeniHedef;
    const faaliyetGiderButce: Record<string, number> = {};
    for (const r of giderRows) faaliyetGiderButce[r.hesap] = r.butceTutari;
    return {
      butceYili,
      toplamPrimHedef: toplamPrimFromTarife(tarifeHedefleri),
      tarifeHedefleri,
      referansEtiket: referans,
      yilAgirliklari,
      ytdAnchorAy,
      faaliyetGiderButce,
      aylikGetiriOrani: getiriPct.map((x) => x / 100),
    };
  }

  async function kaydetVeHesapla() {
    setBusy(true);
    setErr(null);
    const payload = bodyPayload();

    const saveRes = await fetch("/api/butce/v3/varsayimlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!saveRes.ok) {
      const j = await saveRes.json().catch(() => ({}));
      setErr(j.error ?? "Kayıt başarısız");
      setBusy(false);
      return;
    }

    const res = await fetch("/api/butce/v3/hesapla", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setErr(data.error ?? data.detail ?? "Hesaplama başarısız");
      return;
    }
    setGt(data.gt);
    setMaliGelirRolling(data.v3?.maliGelirRolling ?? null);
    setKalibrasyon(data.v3?.kalibrasyon ?? []);
    setMizanTutmayan(data.v3?.mizanTutmayan ?? []);
    setOneriler(data.v3?.oneriler ?? data.v3?.motor?.oneriler ?? []);
    setUyarilar([...(data.uyarilar ?? [])]);
    setFormatCocukPay(data.formatCocukPay ?? {});
  }

  async function excelIndir() {
    if (!gt) return;
    setExcelBusy(true);
    try {
      await downloadV2GelirTablosuExcel(gt, formatCocukPay);
    } finally {
      setExcelBusy(false);
    }
  }

  const yediliSecenekler = useMemo(() => (gt ? v2YediliSecenekler(gt) : []), [gt]);
  const filtreBranslar = useMemo(
    () => (gt ? v2FiltreBransKodlari(gt, filtreMod, filtreSecim) : null),
    [gt, filtreMod, filtreSecim],
  );
  const ozetDeger = (satir: number) =>
    gt ? v2OzetDeger(gt, satir, ozetAy, filtreBranslar) : 0;
  const filtreEtiket = v2FiltreEtiket(filtreMod, filtreSecim, yediliSecenekler);

  return (
    <div className="space-y-5">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Bütçe V3 — Mizan Tahmini</h1>
          <p className="mt-1 text-sm text-slate-600">
            Tarife prim hedefi, genel gider ve mali getiri girin; teknik oranlar ve aylık GT otomatik.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Bütçe yılı</label>
          <select
            value={butceYili}
            onChange={(e) => {
              const y = Number(e.target.value);
              setButceYili(y);
              void load(y);
            }}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          >
            {butceYillari.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!hasMizan ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          Mizan verisi yok. Önce{" "}
          <Link href="/butce/veri-yukle" className="font-semibold underline">
            Veri yükleme
          </Link>{" "}
          ile mizan-tidy ve aylık GT aktarın.
        </p>
      ) : null}

      {v2SorunOzeti.length > 0 ? (
        <details className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm">
          <summary className="cursor-pointer font-semibold text-amber-900">
            V2&apos;den V3&apos;e — neden değişti?
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-950">
            {v2SorunOzeti.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </details>
      ) : null}

      <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">
          1) Tarife grubu hedef prim ({butceYili})
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-slate-500">
                <th className="py-2 pr-3">Tarife</th>
                <th className="py-2 pr-3">Excel / baz</th>
                <th className="py-2 pr-3">{butceYili} hedef</th>
                <th className="py-2 pr-3">Artış %</th>
              </tr>
            </thead>
            <tbody>
              {tarifeRows.map((row, idx) => (
                <tr key={row.tarifeGrubu} className="border-b border-slate-100">
                  <td className="py-1.5 pr-3 font-medium">{row.tarifeGrubu}</td>
                  <td className="py-1.5 pr-3 tabular-nums text-slate-600">{tl(row.mevcutHedef)}</td>
                  <td className="py-1.5 pr-3">
                    <div className="flex items-center">
                      <input
                        type="number"
                        className="w-36 rounded border border-slate-200 px-2 py-1 tabular-nums"
                        value={Math.round(row.yeniHedef) || ""}
                        onChange={(e) => {
                          const v = Number(e.target.value) || 0;
                          setTarifeRows((prev) => {
                            const next = [...prev];
                            const r = { ...next[idx]! };
                            r.yeniHedef = v;
                            r.artisOrani = r.mevcutHedef > 0 ? v / r.mevcutHedef - 1 : 0;
                            next[idx] = r;
                            return next;
                          });
                        }}
                      />
                      <OneriBadge alan="tarife_prim" oneriKey={row.tarifeGrubu} />
                    </div>
                  </td>
                  <td className="py-1.5 tabular-nums text-slate-600">{pct(row.artisOrani)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td className="py-2 pr-3">Toplam</td>
                <td className="py-2 pr-3 tabular-nums">
                  {tl(tarifeRows.reduce((a, r) => a + r.mevcutHedef, 0))}
                </td>
                <td className="py-2 pr-3 tabular-nums">{tl(toplamPrim)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-4 border-t border-slate-100 pt-4">
          <div>
            <label className="text-xs text-slate-600">Dağıtım referansı</label>
            <select
              value={referans}
              onChange={(e) => {
                const etiket = e.target.value;
                setReferans(etiket);
                setYilAgirliklari(referansYilAgirliklari(etiket));
              }}
              className="mt-1 block rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            >
              {Object.keys(REFERANS_YIL_SECENEKLERI).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          {refYears.map((yil, i) => (
            <div key={yil}>
              <label className="text-xs text-slate-600">{yil} ağırlık %</label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={Math.round((yilAgirliklari[i] ?? 0) * 100)}
                onChange={(e) => {
                  const v = Number(e.target.value) / 100;
                  setYilAgirliklari((prev) => {
                    const next = [...prev];
                    next[i] = v;
                    return next;
                  });
                }}
                className="mt-1 block w-20 rounded border border-slate-200 px-2 py-1.5 text-sm tabular-nums"
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-slate-600">YTD kilidi ayı</label>
            <select
              value={ytdAnchorAy}
              onChange={(e) => setYtdAnchorAy(Number(e.target.value))}
              className="mt-1 block rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            >
              {AY_ADLARI.map((ad, i) => (
                <option key={ad} value={i + 1}>
                  {i + 1} — {ad}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">2) Genel gider bütçesi (61402–06)</h2>
          <p className="mt-1 text-xs text-slate-500">Yıllık tutar eşit aylık dağıtılır.</p>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-1 pr-2">Hesap</th>
                  <th className="py-1 pr-2">Kalem</th>
                  <th className="py-1 pr-2 text-right">{butceYili - 1} kapanış</th>
                  <th className="py-1 pr-2 text-right">{butceYili} bütçe</th>
                  <th className="py-1 text-right">Artış %</th>
                </tr>
              </thead>
              <tbody>
                {giderRows.map((r) => (
                  <tr key={r.hesap} className="border-b border-slate-100">
                    <td className="py-1 pr-2 font-mono text-slate-500">{r.hesap}</td>
                    <td className="py-1 pr-2">{r.ad}</td>
                    <td className="py-1 pr-2 text-right tabular-nums">{tl(r.oncekiYilTutari)}</td>
                    <td className="py-1 pr-2">
                      <div className="flex items-center justify-end">
                        <input
                          type="number"
                          value={Math.round(r.butceTutari) || ""}
                          onChange={(e) => {
                            const v = Number(e.target.value) || 0;
                            setGiderRows((rows) =>
                              rows.map((x) => (x.hesap === r.hesap ? { ...x, butceTutari: v } : x)),
                            );
                          }}
                          className="w-full rounded border border-slate-200 px-2 py-1 text-right tabular-nums"
                        />
                        <OneriBadge alan="genel_gider" oneriKey={r.hesap} />
                      </div>
                    </td>
                    <td className="py-1 text-right tabular-nums">
                      {r.oncekiYilTutari > 0 ? pct(r.butceTutari / r.oncekiYilTutari - 1) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">3) Aylık mali getiri (%)</h2>
          <p className="mt-1 text-[10px] text-slate-500">Baseline: her ay için model önerisi rozette.</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {AY_ADLARI.map((ad, i) => (
              <label key={ad} className="text-[10px] text-slate-500">
                <span className="flex items-center justify-between">
                  {ad}
                  <OneriBadge alan="mali_getiri" oneriKey={String(i + 1)} />
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={getiriPct[i]?.toFixed(2) ?? ""}
                  onChange={(e) => {
                    const v = Number(e.target.value) || 0;
                    setGetiriPct((p) => {
                      const n = [...p];
                      n[i] = v;
                      return n;
                    });
                  }}
                  className="mt-0.5 w-full rounded border border-slate-200 px-1 py-0.5 text-xs tabular-nums"
                />
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || toplamPrim <= 0 || !hasMizan}
          onClick={() => void kaydetVeHesapla()}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Hesaplanıyor…" : "Kaydet ve GT hesapla"}
        </button>
        {gt ? (
          <button
            type="button"
            disabled={excelBusy}
            onClick={() => void excelIndir()}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
          >
            {excelBusy ? "İndiriliyor…" : "Excel indir (şirket formatı)"}
          </button>
        ) : null}
        <Link href="/butce/v2" className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:underline">
          V2 karşılaştır →
        </Link>
      </div>

      {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}

      {uyarilar.length > 0 ? (
        <ul className="mt-4 max-h-40 space-y-1 overflow-auto rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-950">
          {[...new Set(uyarilar)].slice(0, 20).map((u, i) => (
            <li key={i}>• {u}</li>
          ))}
        </ul>
      ) : null}

      {mizanTutmayan.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-amber-300 bg-amber-50/50">
          <p className="border-b border-amber-200 px-3 py-2 text-xs font-semibold text-amber-950">
            Mizan kontrol — Temmuz YTD tutmayan kalemler ({mizanTutmayan.length})
          </p>
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b bg-amber-100/60 text-left text-xs uppercase text-amber-900">
                <th className="px-3 py-2">Hesap</th>
                <th className="px-3 py-2">Kalem</th>
                <th className="px-3 py-2 text-right">Mizan</th>
                <th className="px-3 py-2 text-right">V3</th>
                <th className="px-3 py-2 text-right">Fark</th>
              </tr>
            </thead>
            <tbody>
              {mizanTutmayan.map((r) => (
                <tr key={r.hesapKodu} className="border-b border-amber-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.hesapKodu}</td>
                  <td className="px-3 py-2">{r.ad}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{tl(r.mizanYtd)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{tl(r.v3Ytd)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-amber-900">{tl(r.fark)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {kalibrasyon.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500">
                <th className="px-3 py-2">Kalem</th>
                <th className="px-3 py-2 text-right">YTD tahmin</th>
                <th className="px-3 py-2 text-right">YTD gerçek</th>
                <th className="px-3 py-2 text-right">Sapma</th>
              </tr>
            </thead>
            <tbody>
              {kalibrasyon.map((k) => (
                <tr key={k.satir} className="border-b border-slate-100">
                  <td className="px-3 py-2">{k.ad}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{tl(k.ytdTahmin)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{tl(k.ytdGercek)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {k.sapmaPct != null ? `${k.sapmaPct.toFixed(1)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {oneriler.length > 0 ? (
        <details className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 text-xs">
          <summary className="cursor-pointer font-semibold text-emerald-900">
            Model önerileri ({oneriler.length}) — kullanıcı girdileri vs V3 tahmini
          </summary>
          <table className="mt-2 w-full text-xs">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-1 pr-2">Alan</th>
                <th className="py-1 pr-2">Kalem</th>
                <th className="py-1 pr-2 text-right">Kullanıcı</th>
                <th className="py-1 pr-2 text-right">Model önerisi</th>
                <th className="py-1 pr-2 text-right">Sapma %</th>
                <th className="py-1 pl-2">Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {oneriler.map((o) => (
                <tr key={`${o.alan}|${o.key}`} className="border-b border-slate-100">
                  <td className="py-1 pr-2 text-slate-500">{o.alan}</td>
                  <td className="py-1 pr-2 font-medium">{o.key}</td>
                  <td className="py-1 pr-2 text-right tabular-nums">
                    {o.alan === "mali_getiri" ? `${o.kullaniciDeger}%` : tl(o.kullaniciDeger)}
                  </td>
                  <td className="py-1 pr-2 text-right tabular-nums">
                    {o.alan === "mali_getiri" ? `${o.modelOneri}%` : tl(o.modelOneri)}
                  </td>
                  <td className="py-1 pr-2 text-right tabular-nums">
                    {o.sapmaPct != null ? `${o.sapmaPct > 0 ? "+" : ""}${o.sapmaPct.toFixed(1)}%` : "—"}
                  </td>
                  <td className="py-1 pl-2 text-slate-500">{o.aciklama}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      ) : null}

      {maliGelirRolling ? (
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Mali gelir (603) — rolling proxy</h2>
          <p className="mt-1 text-xs text-slate-500">
            {V2_MALI_GELIR_DISCLAIMER} {V2_VERGI_DISCLAIMER}
          </p>
          <p className="mt-2 text-xs text-slate-600">
            YTD (1–{maliGelirRolling.anchorAy}. ay): mizan ·{" "}
            {tl(maliGelirRolling.ytdMaliGelir)}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Tahmin ({maliGelirRolling.tahminBaslangicAy}–12. ay): anchor banka{" "}
            {tl(maliGelirRolling.anchorBanka)} ({maliGelirRolling.anchorBankaKaynak}) ·{" "}
            {tl(maliGelirRolling.tahminMaliGelir)}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-700">
            Yıllık toplam: {tl(maliGelirRolling.yillikMaliGelir)}
          </p>
        </section>
      ) : null}

      {gt ? (
        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-600">Özet ay:</span>
            <select
              value={ozetAy}
              onChange={(e) => setOzetAy(Number(e.target.value))}
              className="rounded border border-slate-200 px-2 py-1 text-sm"
            >
              {AY_ADLARI.map((ad, i) => (
                <option key={ad} value={i + 1}>
                  {ad} (YTD)
                </option>
              ))}
            </select>
            <span className="text-sm tabular-nums text-slate-700">
              {filtreEtiket} · Brüt prim: {tl(ozetDeger(11))} · Safi TKZ: {tl(ozetDeger(9003))} ·
              TKZ: {tl(ozetDeger(9005))}
            </span>
          </div>
          <V2GtFiltreBar
            mod={filtreMod}
            secim={filtreSecim}
            yedili={yediliSecenekler}
            onMod={(m) => {
              setFiltreMod(m);
              setFiltreSecim(new Set());
            }}
            onToggle={(id) => {
              setFiltreSecim((once) => {
                const next = new Set(once);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              });
            }}
            onTumu={() => setFiltreSecim(new Set())}
          />
          <V2GtHesapTablo
            ozetDeger={ozetDeger}
            donemEtiket={`${AY_ADLARI[ozetAy - 1]} sonu`}
          />
          <V2GtTeknikOranTablo
            bransKodlari={filtreBranslar}
            ozetAy={ozetAy}
            etiket={filtreEtiket}
            busy={busy}
            onUygula={kaydetVeHesapla}
          />
        </div>
      ) : null}
    </div>
  );
}
