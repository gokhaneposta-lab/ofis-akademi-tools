"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ResultQuestionReview } from "@/lib/exam/types";
import { site } from "@/components/siteUi";

type ResultPayload = {
  ok: boolean;
  exam: { slug: string; title: string; passing_score: number };
  score: number;
  correct_count: number;
  wrong_count: number;
  blank_count: number;
  total_questions: number;
  passed: boolean;
  review: ResultQuestionReview[];
  dummyNotice?: string;
  attempt: { status: string };
  error?: string;
};

type Props = {
  attemptId: string;
  examSlug: string;
};

export default function ExamResultClient({ attemptId, examSlug }: Props) {
  const [data, setData] = useState<ResultPayload | null>(null);
  const [error, setError] = useState("");
  const [openCorrect, setOpenCorrect] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/exams/attempts/${attemptId}/result`);
      const json = (await res.json()) as ResultPayload;
      if (!res.ok) {
        setError(json.error ?? "Sonuç yüklenemedi");
        return;
      }
      setData(json);
    })();
  }, [attemptId]);

  if (error) {
    return (
      <div className={site.main}>
        <p className="text-sm text-red-700">{error}</p>
        <Link href={`/sinav/${examSlug}`} className="mt-4 inline-block text-sm text-emerald-800">
          Sınav sayfasına dön
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={site.main}>
        <p className="text-sm text-slate-600">Sonuç hesaplanıyor…</p>
      </div>
    );
  }

  return (
    <div className={site.pageBg}>
      <header className={site.pageHeader}>
        <div className={site.pageHeaderInner}>
          <Link href="/sinav" className={site.backLink}>
            ← Sınavlar
          </Link>
          <h1 className={site.pageTitle}>{data.exam.title}</h1>
          <p className={site.pageLead}>
            {data.attempt.status === "expired"
              ? "Süre dolduğu için sınav otomatik sonlandırıldı."
              : "Sınav tamamlandı. Skor sunucu tarafında hesaplanmıştır."}
          </p>
        </div>
      </header>

      <main className={site.main + " space-y-6"}>
        {data.dummyNotice ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
            {data.dummyNotice}
          </p>
        ) : null}

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
          <p className="text-3xl font-semibold tabular-nums text-slate-900">
            {data.correct_count} / {data.total_questions}
          </p>
          <p className="mt-1 text-lg font-medium text-slate-800">
            %{data.score} başarı
            <span
              className={`ml-2 text-sm font-semibold ${
                data.passed ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {data.passed ? "Geçti" : "Kaldı"}
            </span>
            <span className="ml-1 text-xs font-normal text-slate-500">
              (baraj %{data.exam.passing_score})
            </span>
          </p>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-lg bg-emerald-50 px-2 py-3">
              <dt className="text-xs text-emerald-800">Doğru</dt>
              <dd className="font-semibold text-emerald-900">{data.correct_count}</dd>
            </div>
            <div className="rounded-lg bg-red-50 px-2 py-3">
              <dt className="text-xs text-red-800">Yanlış</dt>
              <dd className="font-semibold text-red-900">{data.wrong_count}</dd>
            </div>
            <div className="rounded-lg bg-slate-100 px-2 py-3">
              <dt className="text-xs text-slate-600">Boş</dt>
              <dd className="font-semibold text-slate-800">{data.blank_count}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={`/sinav/${examSlug}`}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
            >
              Yeniden dene
            </Link>
            <Link href="/sinav" className={site.btnSecondary}>
              Tüm sınavlar
            </Link>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold text-slate-900">Soru analizi</h2>
          <ul className="space-y-3">
            {data.review.map((r) => {
              const wrongOrBlank = r.is_blank || r.is_correct === false;
              const showExpl = wrongOrBlank || openCorrect[r.question_id];
              return (
                <li
                  key={r.question_id}
                  className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      Soru {r.position}
                    </p>
                    <span
                      className={`text-xs font-semibold ${
                        r.is_blank
                          ? "text-slate-600"
                          : r.is_correct
                            ? "text-emerald-700"
                            : "text-red-700"
                      }`}
                    >
                      {r.is_blank ? "Boş" : r.is_correct ? "Doğru" : "Yanlış"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {r.question_text}
                  </p>
                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <p>
                      Sizin cevabınız:{" "}
                      <span className="font-medium text-slate-800">
                        {r.is_blank
                          ? "—"
                          : `${r.selected_option_key}) ${r.selected_option_text}`}
                      </span>
                    </p>
                    <p>
                      Doğru cevap:{" "}
                      <span className="font-medium text-slate-800">
                        {r.correct_option_key}) {r.correct_option_text}
                      </span>
                    </p>
                  </div>
                  {!wrongOrBlank && r.explanation ? (
                    <button
                      type="button"
                      className="mt-2 text-xs font-medium text-emerald-800 hover:underline"
                      onClick={() =>
                        setOpenCorrect((o) => ({
                          ...o,
                          [r.question_id]: !o[r.question_id],
                        }))
                      }
                    >
                      {showExpl ? "Açıklamayı gizle" : "Açıklamayı göster"}
                    </button>
                  ) : null}
                  {showExpl && r.explanation ? (
                    <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700">
                      <p className="mb-1 font-semibold text-slate-800">Neden?</p>
                      {r.explanation}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
