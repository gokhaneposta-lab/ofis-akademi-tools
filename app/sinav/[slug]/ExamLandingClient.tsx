"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { site } from "@/components/siteUi";

type ExamMeta = {
  slug: string;
  title: string;
  description: string | null;
  category: string;
  question_count: number;
  duration_minutes: number;
  passing_score: number;
  bank_size: number;
  ready: boolean;
};

export default function ExamLandingClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [exam, setExam] = useState<ExamMeta | null>(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/exams/${slug}`);
      const data = (await res.json()) as { exam?: ExamMeta; error?: string };
      if (!res.ok || !data.exam) {
        setError(data.error ?? "Sınav bulunamadı");
        return;
      }
      setExam(data.exam);
    })();
  }, [slug]);

  async function start() {
    setStarting(true);
    setError("");
    try {
      const res = await fetch(`/api/exams/${slug}/start`, { method: "POST" });
      const data = (await res.json()) as {
        redirectTo?: string;
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        setError([data.error, data.detail].filter(Boolean).join(" — "));
        return;
      }
      if (data.redirectTo) router.push(data.redirectTo);
    } finally {
      setStarting(false);
    }
  }

  if (!exam && !error) {
    return (
      <div className={site.main}>
        <p className="text-sm text-slate-600">Yükleniyor…</p>
      </div>
    );
  }

  if (error && !exam) {
    return (
      <div className={site.main}>
        <p className="text-sm text-red-700">{error}</p>
        <Link href="/sinav" className="mt-3 inline-block text-sm text-emerald-800">
          ← Sınavlar
        </Link>
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div className={site.pageBg}>
      <header className={site.pageHeader}>
        <div className={site.pageHeaderInner}>
          <Link href="/sinav" className={site.backLink}>
            ← Sınavlar
          </Link>
          <h1 className={site.pageTitle}>{exam.title}</h1>
          <p className={site.pageLead}>{exam.description}</p>
        </div>
      </header>
      <main className={site.main + " space-y-5"}>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950">
          V1 soru bankası geliştirme/test amaçlı <strong>dummy</strong> sorular içerir.
          Gerçek TFRS 17 içeriği değildir; daha sonra gerçek banka ile değiştirilecektir.
        </div>

        <dl className="grid gap-3 rounded-xl border border-slate-200/80 bg-white p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Soru sayısı</dt>
            <dd className="font-semibold text-slate-900">{exam.question_count}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Süre</dt>
            <dd className="font-semibold text-slate-900">{exam.duration_minutes} dakika</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Geçme barajı</dt>
            <dd className="font-semibold text-slate-900">%{exam.passing_score}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Soru havuzu</dt>
            <dd className="font-semibold text-slate-900">{exam.bank_size} aktif</dd>
          </div>
        </dl>

        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Giriş gerekmez (misafir sınav).</li>
          <li>Sorular her denemede rastgele seçilir; sıra sabittir.</li>
          <li>İleri/geri gezinebilir, cevaplarınız kaydedilir.</li>
          <li>Süre sunucu saatine göre yönetilir.</li>
          <li>Skor yalnızca sınav bitince hesaplanır.</li>
        </ul>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          type="button"
          disabled={!exam.ready || starting}
          onClick={() => void start()}
          className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
        >
          {starting ? "Başlatılıyor…" : "Sınava başla"}
        </button>
        {!exam.ready ? (
          <p className="text-xs text-amber-800">
            Havuzda yeterli aktif soru yok ({exam.bank_size}/{exam.question_count}). Seed
            çalıştırın.
          </p>
        ) : null}
      </main>
    </div>
  );
}
