import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/components/siteUi";
import { isExamDbConfigured } from "@/lib/exam/db";
import { listActiveExams } from "@/lib/exam/queries";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Online Deneme Sınavları — TFRS 17 & Finans | Ofis Akademi",
  description:
    "Ücretsiz online deneme sınavları. TFRS 17 (IFRS 17) finans sertifika hazırlık sınavı: 50 soru, 60 dakika, anında sonuç. Giriş gerekmez.",
  keywords: [
    "TFRS 17 sınav",
    "IFRS 17 deneme sınavı",
    "TFRS 17 deneme",
    "sigorta muhasebe sınavı",
    "finans sertifika hazırlık",
    "online deneme sınavı",
  ],
  alternates: {
    canonical: canonicalUrl("/sinav"),
  },
  openGraph: {
    title: "Online Deneme Sınavları — TFRS 17 | Ofis Akademi",
    description:
      "Ücretsiz TFRS 17 deneme sınavı ve diğer finans/sigorta sınavları. Giriş gerekmez, anında sonuç.",
    url: `${BASE}/sinav`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Online Deneme Sınavları | Ofis Akademi",
    description: "TFRS 17 deneme sınavı — ücretsiz, online, anında sonuç.",
  },
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
      <BreadcrumbJsonLd
        items={[
          { name: "Ana Sayfa", path: "/" },
          { name: "Sınavlar", path: "/sinav" },
        ]}
      />
      <header className={site.pageHeader}>
        <div className={site.pageHeaderInner}>
          <Link href="/" className={site.backLink}>
            ← Ana sayfa
          </Link>
          <h1 className={site.pageTitle}>Sınavlar</h1>
          <p className={site.pageLead}>
            Profesyonel deneme sınavları. Giriş gerekmez; sonuç sunucu tarafında
            hesaplanır. TFRS 17 (IFRS 17) finans sertifika hazırlık sınavı ile
            başlayın.
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
