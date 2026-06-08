"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ButceUploadGuide from "@/components/butce/ButceUploadGuide";
import { BUTCE_MAP_MIZAN_SPEC } from "@/lib/butce/uploadSpecs";

type Props = {
  hasMizan: boolean;
  butceYili: number;
  mizanOzet?: string;
};

export default function ButceUploadMizan({ hasMizan, butceYili, mizanOzet }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErr(null);

    const fd = new FormData(e.currentTarget);
    fd.set("kind", "mizan");
    fd.set("butceYili", String(butceYili));

    try {
      const res = await fetch("/api/butce/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.detail ?? data.error ?? "Yükleme başarısız");
        return;
      }
      setMsg(data.log ?? "MIZAN yüklendi");
      router.refresh();
    } catch {
      setErr("Ağ hatası — bağlantıyı kontrol edin");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">1. MIZAN verisi yükle</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            <strong className="font-medium text-slate-800">BUTCE_MAP.xlsx</strong> dosyasındaki{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">MIZAN</code> sayfası — teknik
            oran hesabının temel girdisi.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            hasMizan
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-900"
          }`}
        >
          {hasMizan ? "Yüklü" : "Bekliyor"}
        </span>
      </div>

      {hasMizan && mizanOzet && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Mevcut veri: {mizanOzet}. Yeni dosya yüklerseniz üzerine yazılır.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block min-w-[240px] flex-1 text-sm">
          <span className="text-slate-600">Excel dosyası (.xlsx)</span>
          <input
            type="file"
            name="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            required
            className="mt-1 block w-full max-w-md text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Import ediliyor…" : "Yükle ve import et"}
        </button>
      </form>

      {msg && <p className="mt-2 text-sm text-emerald-700">{msg}</p>}
      {err && (
        <p className="mt-2 whitespace-pre-wrap rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {err}
        </p>
      )}

      <ButceUploadGuide spec={BUTCE_MAP_MIZAN_SPEC} defaultOpen={!hasMizan} />
    </section>
  );
}
