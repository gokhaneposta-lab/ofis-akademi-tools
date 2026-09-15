"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import type { GenelGiderImportOzet } from "@/lib/butce/v3/genelGiderSummary";

const AY_KISA = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

const tl = (n: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);

type PreviewIssue = { satir: number; kod: string; mesaj: string };

type Props = {
  butceYili: number;
  mevcutSatir?: number;
  mevcutAltHesap?: number;
};

export default function GenelGiderImportPanel({ butceYili, mevcutSatir, mevcutAltHesap }: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<PreviewIssue[]>([]);
  const [warnings, setWarnings] = useState<PreviewIssue[]>([]);
  const [ozet, setOzet] = useState<GenelGiderImportOzet | null>(null);
  const [satirSayisi, setSatirSayisi] = useState(0);
  const [acikAna, setAcikAna] = useState<string | null>(null);

  async function onPreview() {
    if (!file) {
      setErr("Önce dosya seçin");
      return;
    }
    setPreviewBusy(true);
    setErr(null);
    setMsg(null);
    setErrors([]);
    setWarnings([]);
    setOzet(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("butceYili", String(butceYili));
      const res = await fetch("/api/butce/genel-gider/preview", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Önizleme başarısız");
        return;
      }
      setErrors(data.errors ?? []);
      setWarnings(data.warnings ?? []);
      setOzet(data.ozet ?? null);
      setSatirSayisi(data.satirSayisi ?? 0);
      setMsg(data.log ?? null);
      if ((data.errors ?? []).length > 0) {
        setErr(`${data.errors.length} doğrulama hatası — import onaylanamaz.`);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Bağlantı hatası");
    } finally {
      setPreviewBusy(false);
    }
  }

  async function onImport() {
    if (!file || errors.length > 0 || satirSayisi === 0) return;
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("kind", "faaliyet_gider");
      fd.set("butceYili", String(butceYili));
      const res = await fetch("/api/butce/upload", { method: "POST", body: fd });
      const raw = await res.text();
      let data: { detail?: string; error?: string; log?: string } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        /* */
      }
      if (!res.ok) {
        setErr(data.detail ?? data.error ?? `Import başarısız (HTTP ${res.status})`);
        return;
      }
      setMsg(data.log ?? "Import tamamlandı");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Bağlantı hatası");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50/80 p-3">
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
        Genel gider import (aylık × alt hesap)
      </h3>
      <p className="mt-1 text-[11px] text-slate-600">
        61402–61406 tam muhasebe alt hesap kodu + aylık tutar. GT&apos;de ilk 5 hane ile F190–194;
        branş dağılımı F368.
      </p>
      {(mevcutSatir ?? 0) > 0 && (
        <p className="mt-1 text-[11px] text-emerald-800">
          Mevcut: {mevcutSatir} satır, {mevcutAltHesap ?? "—"} alt hesap ({butceYili} dahil tüm yıllar).
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-end gap-2">
        <label className="block min-w-[200px] flex-1 text-[11px] text-slate-600">
          Excel / CSV
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="mt-1 block w-full text-xs file:mr-2 file:rounded file:border-0 file:bg-white file:px-2 file:py-1"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setErrors([]);
              setOzet(null);
              setErr(null);
            }}
          />
        </label>
        <input type="hidden" name="kind" value="faaliyet_gider" />
        <button
          type="button"
          disabled={!file || previewBusy}
          onClick={() => void onPreview()}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 disabled:opacity-50"
        >
          {previewBusy ? "Önizleniyor…" : "Önizle"}
        </button>
        <button
          type="button"
          disabled={!file || busy || errors.length > 0 || satirSayisi === 0}
          onClick={() => void onImport()}
          className="rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {busy ? "Import…" : "Onayla ve import et"}
        </button>
      </div>

      {msg && <p className="mt-2 text-[11px] text-emerald-700">{msg}</p>}
      {err && (
        <p className="mt-2 whitespace-pre-wrap rounded bg-red-50 px-2 py-1 text-[11px] text-red-800">
          {err}
        </p>
      )}

      {errors.length > 0 && (
        <ul className="mt-2 max-h-32 overflow-y-auto rounded bg-red-50/80 px-2 py-1 text-[10px] text-red-900">
          {errors.map((e, i) => (
            <li key={`${e.satir}-${e.kod}-${i}`}>
              Satır {e.satir} [{e.kod}]: {e.mesaj}
            </li>
          ))}
        </ul>
      )}

      {warnings.length > 0 && (
        <ul className="mt-2 text-[10px] text-amber-800">
          {warnings.map((w, i) => (
            <li key={`w-${i}`}>
              Satır {w.satir}: {w.mesaj}
            </li>
          ))}
        </ul>
      )}

      {ozet && (
        <div className="mt-3 overflow-x-auto">
          <p className="mb-1 text-[10px] font-medium text-slate-700">
            {satirSayisi} satır import edilecek — {ozet.altHesapSayisi} alt hesap
          </p>
          <table className="min-w-full text-[10px]">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-1 pr-2">Ana hesap</th>
                {AY_KISA.map((a) => (
                  <th key={a} className="px-0.5 py-1 text-right">
                    {a}
                  </th>
                ))}
                <th className="py-1 pl-1 text-right">Yıllık</th>
              </tr>
            </thead>
            <tbody>
              {ozet.anaHesaplar.map((a) => (
                <Fragment key={a.anaHesap}>
                  <tr
                    className="cursor-pointer border-b border-slate-100 hover:bg-white"
                    onClick={() => setAcikAna(acikAna === a.anaHesap ? null : a.anaHesap)}
                  >
                    <td className="py-1 pr-2 font-mono">
                      {a.anaHesap} {acikAna === a.anaHesap ? "▾" : "▸"}
                    </td>
                    {a.aylik.map((v, i) => (
                      <td key={i} className="px-0.5 py-1 text-right tabular-nums">
                        {v > 0 ? tl(v) : "—"}
                      </td>
                    ))}
                    <td className="py-1 pl-1 text-right tabular-nums font-medium">{tl(a.yillik)}</td>
                  </tr>
                  {acikAna === a.anaHesap &&
                    a.altHesaplar.map((alt) => (
                      <tr key={alt.altHesapKodu} className="border-b border-slate-50 bg-white/60">
                        <td className="py-0.5 pl-3 pr-2 font-mono text-slate-600">
                          {alt.altHesapKodu}
                          {alt.aciklama ? ` ${alt.aciklama}` : ""}
                        </td>
                        {alt.aylik.map((v, i) => (
                          <td key={i} className="px-0.5 py-0.5 text-right tabular-nums text-slate-600">
                            {v > 0 ? tl(v) : "—"}
                          </td>
                        ))}
                        <td className="py-0.5 pl-1 text-right tabular-nums">{tl(alt.yillik)}</td>
                      </tr>
                    ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
