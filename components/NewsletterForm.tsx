"use client";

import { useState } from "react";
import Link from "next/link";

type Variant = "footer" | "inline" | "card";
type Status = "idle" | "loading" | "success" | "error";

type Props = {
  variant?: Variant;
  /** "Hangi sayfadan abone oldu" — analitik için /api/abone'ye gönderilir. */
  source?: string;
  /** Üstte görünen kısa başlık (variant'a göre default vardır). */
  heading?: string;
  /** Başlığın altındaki açıklama satırı. */
  description?: string;
};

const DEFAULTS: Record<Variant, { heading: string; description: string }> = {
  footer: {
    heading: "Haftalık Excel ipuçları",
    description:
      "Haftada 1 kısa e-posta. Pratik formüller, mini şablonlar ve yeni rehberler. Spam yok, istediğin an çık.",
  },
  inline: {
    heading: "Bu rehberi beğendin mi?",
    description:
      "Haftada 1 kısa e-posta — yeni rehberler, ücretsiz Excel şablonları ve formül ipuçları. İstediğin an çık.",
  },
  card: {
    heading: "Ücretsiz Excel kaynaklarına ilk sen ulaş",
    description:
      "E-posta bırak; haftalık olarak yeni şablonları, rehberleri ve formül kartlarını gönderelim. İstediğin an çık.",
  },
};

export default function NewsletterForm({
  variant = "footer",
  source = "footer",
  heading,
  description,
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const labels = DEFAULTS[variant];
  const finalHeading = heading ?? labels.heading;
  const finalDescription = description ?? labels.description;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/abone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error ?? "Bir hata oluştu.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setEmail("");
    } catch {
      setErrorMsg("Bağlantı hatası. Lütfen tekrar dene.");
      setStatus("error");
    }
  }

  if (variant === "footer") {
    return (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
          {finalHeading}
        </p>
        <p className="mb-3 text-xs leading-relaxed text-gray-500">{finalDescription}</p>
        {status === "success" ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            Teşekkürler! Hoş geldin e-postası gönderildi — gelen kutunu kontrol et.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-2">
            <input
              type="email"
              required
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              disabled={status === "loading"}
              className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="h-9 w-full rounded-lg bg-emerald-700 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60"
            >
              {status === "loading" ? "Gönderiliyor…" : "Bültene abone ol"}
            </button>
          </form>
        )}
        {status === "error" && errorMsg && (
          <p className="mt-2 text-[11px] text-red-600">{errorMsg}</p>
        )}
        <p className="mt-2 text-[10px] text-gray-400">
          Devam ederek{" "}
          <Link href="/gizlilik" className="underline hover:text-emerald-700">
            gizlilik politikamızı
          </Link>{" "}
          kabul etmiş olursun.
        </p>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="my-8 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
        <p className="text-sm font-semibold text-emerald-900">{finalHeading}</p>
        <p className="mt-1 text-xs leading-relaxed text-emerald-900/80">{finalDescription}</p>
        {status === "success" ? (
          <div className="mt-3 rounded-lg bg-white px-3 py-2 text-xs text-emerald-800 border border-emerald-200">
            Teşekkürler! Hoş geldin e-postası gönderildi.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              disabled={status === "loading"}
              className="h-10 flex-1 rounded-xl border border-emerald-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="h-10 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60"
            >
              {status === "loading" ? "Gönderiliyor…" : "Abone ol"}
            </button>
          </form>
        )}
        {status === "error" && errorMsg && (
          <p className="mt-2 text-xs text-red-600">{errorMsg}</p>
        )}
        <p className="mt-2 text-[11px] text-emerald-900/60">
          Spam yok. İstediğin an tek tıkla çıkabilirsin.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-300 bg-gradient-to-b from-emerald-50 to-white p-6 shadow-sm">
      <p className="text-base font-bold text-emerald-900">{finalHeading}</p>
      <p className="mt-1 text-sm leading-relaxed text-gray-700">{finalDescription}</p>
      {status === "success" ? (
        <div className="mt-4 rounded-lg border border-emerald-300 bg-white px-4 py-3 text-sm text-emerald-800">
          Teşekkürler! Hoş geldin e-postası gönderildi — gelen kutunu kontrol et.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            placeholder="ornek@eposta.com"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            disabled={status === "loading"}
            className="h-11 flex-1 rounded-xl border border-emerald-300 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="h-11 rounded-xl bg-[#217346] px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            {status === "loading" ? "Gönderiliyor…" : "Ücretsiz abone ol"}
          </button>
        </form>
      )}
      {status === "error" && errorMsg && (
        <p className="mt-2 text-xs text-red-600">{errorMsg}</p>
      )}
      <p className="mt-3 text-xs text-gray-500">
        Devam ederek{" "}
        <Link href="/gizlilik" className="underline hover:text-emerald-700">
          gizlilik politikamızı
        </Link>{" "}
        kabul etmiş olursun. İstediğin an tek tıkla çıkabilirsin.
      </p>
    </div>
  );
}
