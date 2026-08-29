"use client";

import { useState } from "react";
import Link from "next/link";
import type { SubscribeChannel, SubscribeReason } from "@/lib/subscription/rules";

type Variant = "footer" | "inline" | "card";
type Status = "idle" | "loading" | "success" | "error";

type Props = {
  variant?: Variant;
  /** Eski prop — channel/reason türetilmesinde kullanılır. */
  source?: string;
  heading?: string;
  description?: string;
  buttonLabel?: string;
  reason?: SubscribeReason;
  channel?: SubscribeChannel;
};

const DEFAULTS: Record<Variant, { heading: string; description: string }> = {
  footer: {
    heading: "Yeni içerikler",
    description:
      "Yeni rehber, araç veya güncelleme yayınlandığında kısa e-posta. Spam yok, istediğin an çık.",
  },
  inline: {
    heading: "Bu rehberi beğendin mi?",
    description:
      "Benzer rehber ve araçlar yayınlandığında kısa e-posta — ilgi alanına göre. İstediğin an çık.",
  },
  card: {
    heading: "Ücretsiz kaynaklara ilk sen ulaş",
    description:
      "E-posta bırak; ilgi alanına göre şablon, rehber ve güncellemeler gönderelim. İstediğin an çık.",
  },
};

function resolveChannel(
  variant: Variant,
  source: string,
  explicit?: SubscribeChannel,
): SubscribeChannel {
  if (explicit) return explicit;
  if (source === "footer" || variant === "footer") return "web_footer";
  if (variant === "inline") return "web_inline";
  return "web_inline";
}

function resolveReason(explicit?: SubscribeReason): SubscribeReason {
  return explicit ?? "signup_form";
}

function readUtm(): Record<string, string | null> | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const q = new URLSearchParams(window.location.search);
    const utm = {
      source: q.get("utm_source"),
      medium: q.get("utm_medium"),
      campaign: q.get("utm_campaign"),
      term: q.get("utm_term"),
      content: q.get("utm_content"),
    };
    if (Object.values(utm).every((v) => !v)) return undefined;
    return utm;
  } catch {
    return undefined;
  }
}

function apiErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "Bir hata oluştu.";
  const err = (data as { error?: unknown }).error;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "Bir hata oluştu.";
}

export default function NewsletterForm({
  variant = "footer",
  source = "footer",
  heading,
  description,
  buttonLabel,
  reason,
  channel,
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const labels = DEFAULTS[variant];
  const finalHeading = heading ?? labels.heading;
  const finalDescription = description ?? labels.description;
  const finalButtonLabel =
    buttonLabel ??
    (variant === "footer" ? "Bültene abone ol" : variant === "inline" ? "Abone ol" : "Ücretsiz abone ol");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    const page =
      typeof window !== "undefined" ? window.location.pathname || "/" : "/";
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          page,
          reason: resolveReason(reason),
          channel: resolveChannel(variant, source, channel),
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          utm: readUtm(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(apiErrorMessage(data));
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
            Teşekkürler! Aboneliğin alındı — gelen kutunu kontrol et.
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
              {status === "loading" ? "Gönderiliyor…" : finalButtonLabel}
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
            Teşekkürler! Aboneliğin alındı.
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
          Teşekkürler! Aboneliğin alındı — gelen kutunu kontrol et.
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
