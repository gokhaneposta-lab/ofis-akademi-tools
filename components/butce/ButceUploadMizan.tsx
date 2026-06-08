"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  hasMizan: boolean;
  butceYili: number;
};

export default function ButceUploadMizan({ hasMizan, butceYili }: Props) {
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
      setErr("Ağ hatası");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">MIZAN verisi (BUTCE_MAP.xlsx)</h2>
      <p className="mt-1 text-sm text-slate-600">
        Teknik oran hesabı için MIZAN sayfası gerekli.
        {hasMizan ? " Veri yüklü." : " Henüz yüklenmedi."}
      </p>
      <form onSubmit={onSubmit} className="mt-3 flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="text-slate-600">Excel dosyası</span>
          <input
            type="file"
            name="file"
            accept=".xlsx,.xls"
            required
            className="mt-1 block w-full max-w-sm text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Yükleniyor…" : "Yükle ve import et"}
        </button>
      </form>
      {msg && <p className="mt-2 text-sm text-emerald-700">{msg}</p>}
      {err && <p className="mt-2 text-sm text-red-700">{err}</p>}
    </section>
  );
}
