"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  hasGtBl: boolean;
  hasHedef: boolean;
};

export default function ButceUploadPanel({ hasGtBl, hasHedef }: Props) {
  const router = useRouter();
  const [log, setLog] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function upload(kind: "gtbl" | "hedef", file: File | undefined) {
    if (!file) return;
    setBusy(kind);
    setLog("");
    const fd = new FormData();
    fd.set("kind", kind);
    fd.set("file", file);
    const res = await fetch("/api/butce/upload", { method: "POST", body: fd });
    const j = (await res.json().catch(() => ({}))) as { ok?: boolean; log?: string; error?: string; detail?: string };
    setBusy(null);
    if (!res.ok) {
      setLog(j.detail ?? j.error ?? "Yükleme hatası");
      return;
    }
    setLog(j.log ?? "Tamam");
    router.refresh();
  }

  async function logout() {
    await fetch("/api/butce/auth", { method: "DELETE" });
    router.replace("/butce/login");
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">Veri yükleme</h2>
        <button
          type="button"
          onClick={logout}
          className="text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          Çıkış
        </button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block rounded-lg border border-dashed border-slate-300 p-3 text-sm">
          <span className="font-medium text-slate-800">Aylık GT + Bilanço (.xlsx)</span>
          <span className="mt-0.5 block text-xs text-slate-500">
            {hasGtBl ? "Yüklü — yenisiyle değiştir" : "Henüz yok"}
          </span>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="mt-2 block w-full text-xs"
            disabled={busy !== null}
            onChange={(e) => upload("gtbl", e.target.files?.[0])}
          />
        </label>
        <label className="block rounded-lg border border-dashed border-slate-300 p-3 text-sm">
          <span className="font-medium text-slate-800">Prim hedefi (.xlsx)</span>
          <span className="mt-0.5 block text-xs text-slate-500">
            {hasHedef ? "Yüklü — yenisiyle değiştir" : "Henüz yok"}
          </span>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="mt-2 block w-full text-xs"
            disabled={busy !== null}
            onChange={(e) => upload("hedef", e.target.files?.[0])}
          />
        </label>
      </div>
      {busy ? <p className="mt-2 text-xs text-slate-500">İşleniyor: {busy}…</p> : null}
      {log ? (
        <pre className="mt-2 max-h-32 overflow-auto rounded bg-slate-50 p-2 text-[10px] text-slate-600">{log}</pre>
      ) : null}
    </section>
  );
}
