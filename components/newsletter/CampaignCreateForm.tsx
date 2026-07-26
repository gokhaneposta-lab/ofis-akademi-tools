"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { INTEREST_TAGS } from "@/lib/subscription/rules";

export default function CampaignCreateForm() {
  const router = useRouter();
  const [tag, setTag] = useState<string>("tsb");
  const [count, setCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState(
    "<p>Merhaba,</p>\n<p>Yeni TSB verisi yayınlandı.</p>\n<p>Ofis Akademi</p>",
  );
  const [testTo, setTestTo] = useState("");
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshCount = useCallback(async (t: string) => {
    setCountLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/newsletter-admin/audience?tag=${encodeURIComponent(t)}`,
      );
      const j = (await res.json()) as {
        count?: number;
        error?: { message?: string };
      };
      if (!res.ok) {
        setCount(null);
        setError(j.error?.message ?? "Alıcı sayısı alınamadı.");
        return;
      }
      setCount(typeof j.count === "number" ? j.count : 0);
    } catch {
      setCount(null);
      setError("Alıcı sayısı alınamadı.");
    } finally {
      setCountLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCount(tag);
  }, [tag, refreshCount]);

  async function ensureCampaign(): Promise<string | null> {
    if (campaignId) return campaignId;
    const res = await fetch("/api/newsletter-admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag, subject, htmlBody }),
    });
    const j = (await res.json()) as {
      campaign?: { id: string; audienceCount: number };
      error?: { message?: string };
    };
    if (!res.ok) {
      setError(j.error?.message ?? "Kampanya oluşturulamadı.");
      return null;
    }
    const id = j.campaign?.id ?? null;
    setCampaignId(id);
    if (typeof j.campaign?.audienceCount === "number") {
      setCount(j.campaign.audienceCount);
    }
    return id;
  }

  async function onTest() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const id = await ensureCampaign();
      if (!id) return;
      const res = await fetch(`/api/newsletter-admin/campaigns/${id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTo }),
      });
      const j = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        setError(j.error?.message ?? "Test maili gönderilemedi.");
        return;
      }
      setMessage(`Test maili gönderildi: ${testTo}`);
    } finally {
      setBusy(false);
    }
  }

  async function onSend() {
    if (
      !window.confirm(
        `Bu kampanya yaklaşık ${count ?? "?"} aktif aboneye gidecek. Gönderilsin mi?`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const id = await ensureCampaign();
      if (!id) return;
      const res = await fetch(`/api/newsletter-admin/campaigns/${id}/send`, {
        method: "POST",
      });
      const j = (await res.json()) as {
        campaign?: { id: string };
        error?: { message?: string };
      };
      if (!res.ok) {
        setError(j.error?.message ?? "Gönderim başarısız.");
        return;
      }
      router.push(`/newsletter-admin/${id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Kampanya oluştur</h1>
        <p className="mt-1 text-sm text-gray-600">
          Tag seç, içeriği yaz, test et, gönder. Resend yalnızca gönderim
          motorudur.
        </p>
      </div>

      <label className="block text-sm font-medium text-gray-700">
        Hedef tag
        <select
          value={tag}
          onChange={(e) => {
            setCampaignId(null);
            setTag(e.target.value);
          }}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          {INTEREST_TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <p className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
        {countLoading
          ? "Alıcı sayısı hesaplanıyor…"
          : count == null
            ? "Alıcı sayısı yok."
            : `Bu kampanya yaklaşık ${count} aktif kullanıcıya gönderilecek.`}
      </p>

      <label className="block text-sm font-medium text-gray-700">
        Konu
        <input
          type="text"
          value={subject}
          onChange={(e) => {
            setCampaignId(null);
            setSubject(e.target.value);
          }}
          maxLength={200}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="TSB verisi güncellendi"
          required
        />
      </label>

      <label className="block text-sm font-medium text-gray-700">
        HTML içerik
        <textarea
          value={htmlBody}
          onChange={(e) => {
            setCampaignId(null);
            setHtmlBody(e.target.value);
          }}
          rows={12}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs leading-relaxed"
        />
      </label>

      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <p className="text-sm font-medium text-gray-800">Test maili</p>
        <input
          type="email"
          value={testTo}
          onChange={(e) => setTestTo(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="sen@ornek.com"
        />
        <button
          type="button"
          disabled={busy || !subject.trim() || !htmlBody.trim() || !testTo.trim()}
          onClick={() => void onTest()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        >
          Test gönder
        </button>
      </div>

      <button
        type="button"
        disabled={busy || !subject.trim() || !htmlBody.trim() || count === 0}
        onClick={() => void onSend()}
        className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        Gönder
      </button>

      {message ? (
        <p className="text-sm text-emerald-700">{message}</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
