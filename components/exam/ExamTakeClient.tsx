"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ExamTimer from "@/components/exam/ExamTimer";
import QuestionNav from "@/components/exam/QuestionNav";
import type { PublicQuestion } from "@/lib/exam/types";
import { site } from "@/components/siteUi";

type AttemptPayload = {
  ok: boolean;
  status: string;
  redirectTo?: string;
  attempt: {
    id: string;
    status: string;
    expiresAt: string;
    remainingSeconds: number;
    totalQuestions: number;
  };
  exam: { slug: string; title: string; passing_score?: number };
  questions: PublicQuestion[];
};

type Props = {
  attemptId: string;
  examSlug: string;
};

export default function ExamTakeClient({ attemptId, examSlug }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expiredHandled = useRef(false);

  const load = useCallback(async () => {
    setError("");
    const res = await fetch(`/api/exams/attempts/${attemptId}`);
    const data = (await res.json()) as AttemptPayload & { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Yüklenemedi");
      setLoading(false);
      return;
    }
    if (data.status !== "in_progress" && data.redirectTo) {
      router.replace(data.redirectTo);
      return;
    }
    setTitle(data.exam.title);
    setExpiresAt(data.attempt.expiresAt);
    setQuestions(data.questions);
    setLoading(false);
  }, [attemptId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const answered = useMemo(() => {
    const s = new Set<number>();
    questions.forEach((q, i) => {
      if (q.selected_option_id) s.add(i);
    });
    return s;
  }, [questions]);

  const blankCount = questions.length - answered.size;
  const current = questions[index];

  const persistAnswer = useCallback(
    async (questionId: string, selectedOptionId: string | null) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/exams/attempts/${attemptId}/answers`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, selectedOptionId }),
        });
        const data = (await res.json()) as { error?: string; redirectTo?: string };
        if (res.status === 410 && data.redirectTo) {
          router.replace(data.redirectTo);
          return;
        }
        if (!res.ok) setError(data.error ?? "Kayıt hatası");
      } finally {
        setSaving(false);
      }
    },
    [attemptId, router],
  );

  function selectOption(optionId: string) {
    if (!current) return;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === current.id ? { ...q, selected_option_id: optionId } : q,
      ),
    );
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void persistAnswer(current.id, optionId);
    }, 250);
  }

  const finish = useCallback(async () => {
    setFinishing(true);
    setConfirmOpen(false);
    try {
      const res = await fetch(`/api/exams/attempts/${attemptId}/finish`, {
        method: "POST",
      });
      const data = (await res.json()) as { redirectTo?: string; error?: string };
      if (data.redirectTo) {
        router.replace(data.redirectTo);
        return;
      }
      setError(data.error ?? "Bitirme başarısız");
    } finally {
      setFinishing(false);
    }
  }, [attemptId, router]);

  const onExpire = useCallback(() => {
    if (expiredHandled.current) return;
    expiredHandled.current = true;
    void finish();
  }, [finish]);

  function requestFinish() {
    if (blankCount > 0) setConfirmOpen(true);
    else void finish();
  }

  if (loading) {
    return (
      <div className={site.main}>
        <p className="text-sm text-slate-600">Sınav yükleniyor…</p>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className={site.main}>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className={site.main}>
        <p className="text-sm text-slate-600">Soru bulunamadı.</p>
      </div>
    );
  }

  const progress = Math.round(((index + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
            <p className="text-xs text-slate-500">
              Soru {index + 1} / {questions.length}
              {saving ? " · kaydediliyor…" : ""}
            </p>
          </div>
          {expiresAt ? <ExamTimer expiresAt={expiresAt} onExpire={onExpire} /> : null}
        </div>
        <div className="h-1 w-full bg-slate-100">
          <div
            className="h-1 bg-emerald-800 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {error ? (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {error}
          </p>
        ) : null}

        <div className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-[11px] leading-relaxed text-amber-950">
          Geliştirme/test bankası: sorular dummy içeriktir; gerçek TFRS 17 soru bankası değildir.
        </div>

        <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)] sm:p-6">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {current.category} · {current.difficulty}
          </p>
          <h2 className="text-base font-semibold leading-relaxed text-slate-900 sm:text-lg">
            {current.question_text}
          </h2>

          <ul className="mt-5 space-y-2.5">
            {current.options.map((opt) => {
              const selected = current.selected_option_id === opt.id;
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => selectOption(opt.id)}
                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                      selected
                        ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        selected
                          ? "bg-emerald-800 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {opt.option_key}
                    </span>
                    <span className="leading-relaxed text-slate-800">{opt.option_text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </article>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className={site.btnSecondary + " disabled:opacity-40"}
          >
            Önceki
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={requestFinish}
              disabled={finishing}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              {finishing ? "Bitiriliyor…" : "Sınavı Bitir"}
            </button>
            {index < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900"
              >
                Sonraki
              </button>
            ) : (
              <button
                type="button"
                onClick={requestFinish}
                disabled={finishing}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 disabled:opacity-50"
              >
                Bitir ve Sonuç
              </button>
            )}
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Soru navigasyonu
          </p>
          <QuestionNav
            total={questions.length}
            currentIndex={index}
            answered={answered}
            onSelect={setIndex}
          />
          <p className="mt-3 text-[11px] text-slate-500">
            Cevaplanan: {answered.size} · Boş: {blankCount}
          </p>
        </section>
      </main>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <p className="text-sm font-semibold text-slate-900">Sınavı bitir?</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {blankCount} soruyu cevaplamadınız. Sınavı tamamlamak istediğinizden emin
              misiniz?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className={site.btnSecondary}
                onClick={() => setConfirmOpen(false)}
              >
                Vazgeç
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
                onClick={() => void finish()}
              >
                Evet, bitir
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <p className="sr-only">{examSlug}</p>
    </div>
  );
}
