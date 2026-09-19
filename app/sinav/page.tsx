import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/components/siteUi";
import { isExamDbConfigured } from "@/lib/exam/db";
import { listActiveExams } from "@/lib/exam/queries";

export const metadata: Metadata = {
  title: "Sınavlar",
  description:
    "Ofis Akademi online deneme sınavları. TFRS 17 ve ileride Excel, finans, muhasebe sınavları.",
};

export const dynamic = "force-dynamic";

export default async function SinavHubPage() {
  let exams: Awaited<ReturnType<typeof listActiveExams>> = [];
  let dbOk = isExamDbConfigured();
  if (dbOk) {
    try {
      exams = await listActiveExams();
    } catch {
      dbOk = false;
    }
  }

  return (
    <div className={site.pageBg}>
      <header className={site.pageHeader}>
        <div className={site.pageHeaderInner}>
          <Link href="/" className={site.backLink}>
            ← Ana sayfa
          </Link>
          <h1 className={site.pageTitle}>Sınavlar</h1>
          <p className={site.pageLead}>
            Profesyonel deneme sınavları. Giriş gerekmez; sonuç sunucu tarafında
            hesaplanır.
          </p>
        </div>
      </header>
      <main className={site.main}>
        {!dbOk ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Sınav veritabanı henüz yapılandırılmamış. Ortamda DATABASE_URL ve migration
            gerekir.
          </p>
        ) : exams.length === 0 ? (
          <p className="text-sm text-slate-600">Aktif sınav yok. Seed çalıştırın.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {exams.map((e) => (
              <li key={e.id}>
                <Link href={`/sinav/${e.slug}`} className={site.card + " block h-full"}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    {e.category}
                  </p>
                  <h2 className={site.cardTitle + " mt-1"}>{e.title}</h2>
                  <p className={site.cardDesc}>
                    {e.question_count} soru · {e.duration_minutes} dk · baraj %
                    {e.passing_score}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
