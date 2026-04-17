import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { metrics, getMetricBySlug, getRelatedMetrics, metricCategoryLabels } from "@/lib/sektorMetrikData";
import HasarPrimCalculator from "@/components/calculators/HasarPrimCalculator";
import KazanilmisPrimCalculator from "@/components/calculators/KazanilmisPrimCalculator";
import YenilemeOraniCalculator from "@/components/calculators/YenilemeOraniCalculator";
import {
  AsitTestCalculator,
  BirlesikOranCalculator,
  BorcOzkaynakCalculator,
  CalisanBasinaCiroCalculator,
  CariOranCalculator,
  DevamsizlikOraniCalculator,
  HasarCozumSuresiCalculator,
  IkramiyeIndirimKarsiligiCalculator,
  IptalOraniCalculator,
  KazanilmamisPrimKarsiligiCalculator,
  KayipOraniCalculator,
  MuallakHasarKarsiligiCalculator,
  NakitOranCalculator,
  NetKarMarjiCalculator,
  PersonelDevirCalculator,
  PoliceBasinaMaliyetCalculator,
  PrimTahsilatOraniCalculator,
  SlaServisSeviyesiCalculator,
  TeknikKarsilikBilgiCalculator,
  VokRoeCalculator,
} from "@/components/calculators/FinansSigortaCalculators";
import { canonicalUrl } from "@/lib/site";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return metrics.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = getMetricBySlug(slug);
  if (!m) return {};
  return {
    title: `${m.name} — Excel ile Hesaplama Rehberi`,
    description: m.summary,
    alternates: {
      canonical: canonicalUrl(`/finans-sigorta/${slug}`),
    },
    openGraph: {
      title: `${m.name} (${m.nameEn}) — Ofis Akademi`,
      description: m.summary,
    },
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="h-1 w-5 rounded-full bg-emerald-500" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function CalculatorSection({ type }: { type: string }) {
  switch (type) {
    case "hasar-prim":
      return <HasarPrimCalculator />;
    case "kazanilmis-prim":
      return <KazanilmisPrimCalculator />;
    case "yenileme-orani":
      return <YenilemeOraniCalculator />;
    case "cari-oran":
      return <CariOranCalculator />;
    case "nakit-oran":
      return <NakitOranCalculator />;
    case "asit-test-orani":
      return <AsitTestCalculator />;
    case "vok-roe":
      return <VokRoeCalculator />;
    case "net-kar-marji":
      return <NetKarMarjiCalculator />;
    case "borc-ozkaynak-orani":
      return <BorcOzkaynakCalculator />;
    case "sla-servis-seviyesi":
      return <SlaServisSeviyesiCalculator />;
    case "personel-devir-orani":
      return <PersonelDevirCalculator />;
    case "devamsizlik-orani":
      return <DevamsizlikOraniCalculator />;
    case "calisan-basina-ciro":
      return <CalisanBasinaCiroCalculator />;
    case "kayip-orani":
      return <KayipOraniCalculator />;
    case "birlesik-oran":
      return <BirlesikOranCalculator />;
    case "prim-tahsilat-orani":
      return <PrimTahsilatOraniCalculator />;
    case "hasar-cozum-suresi":
      return <HasarCozumSuresiCalculator />;
    case "iptal-orani":
      return <IptalOraniCalculator />;
    case "police-basina-maliyet":
      return <PoliceBasinaMaliyetCalculator />;
    case "kazanilmamis-prim-karsiligi":
      return <KazanilmamisPrimKarsiligiCalculator />;
    case "muallak-hasar-karsiligi":
      return <MuallakHasarKarsiligiCalculator />;
    case "ikramiye-indirim-karsiligi":
      return <IkramiyeIndirimKarsiligiCalculator />;
    case "matematik-karsiliklar":
      return <TeknikKarsilikBilgiCalculator variant="matematik" />;
    case "devam-eden-riskler-karsiligi":
      return <TeknikKarsilikBilgiCalculator variant="derk" />;
    case "dengeleme-karsiligi":
      return <TeknikKarsilikBilgiCalculator variant="dengeleme" />;
    default:
      return null;
  }
}

export default async function MetricDetailPage({ params }: Props) {
  const { slug } = await params;
  const m = getMetricBySlug(slug);
  if (!m) notFound();

  const related = getRelatedMetrics(slug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/80">
      <BreadcrumbJsonLd
        items={[
          { name: "Ana Sayfa", path: "/" },
          { name: "Finans & Sigorta", path: "/finans-sigorta" },
          { name: m.name, path: `/finans-sigorta/${slug}` },
        ]}
      />
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <Link
            href="/finans-sigorta"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline mb-3"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Finans & Sigorta için Excel
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-3xl">{m.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{m.name}</h1>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {m.nameEn}
              </span>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">{m.summary}</p>
          <div className="mt-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              {metricCategoryLabels[m.category]}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        {/* Hesaplayıcı — en üstte */}
        <Section title="Hemen Hesapla">
          <CalculatorSection type={m.calculatorType} />
        </Section>

        {/* Nedir? */}
        <Section title="Nedir?">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            {m.whatIs.split("\n\n").map((p, i) => (
              <p key={i} className="text-xs text-gray-700 leading-relaxed mb-3 last:mb-0 whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
        </Section>

        {/* Neden Önemli? */}
        <Section title="Neden Önemli?">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            {m.whyImportant.split("\n\n").map((p, i) => (
              <p key={i} className="text-xs text-gray-700 leading-relaxed mb-3 last:mb-0 whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
        </Section>

        {/* Formüller */}
        <Section title="Formüller">
          <div className="space-y-3">
            {m.formulas.map((f, i) => (
              <div key={i} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mb-1">{f.label}</p>
                <code className="block text-sm font-mono font-semibold text-emerald-900 mb-2 break-all">
                  {f.formula}
                </code>
                <p className="text-xs text-emerald-700">{f.explanation}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Adım Adım */}
        {m.steps.length > 0 && (
          <Section title="Adım Adım Hesaplama">
            <ol className="space-y-2">
              {m.steps.map((step, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-xs text-gray-700"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* Gerçek Hayat Örnekleri */}
        {m.examples.length > 0 && (
          <Section title="Gerçek Hayat Örnekleri">
            <div className="space-y-4">
              {m.examples.map((ex, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <div className="border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                    <p className="text-xs font-bold text-gray-800">{ex.title}</p>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {Object.entries(ex.data).map(([key, val]) => (
                        <div key={key} className="text-xs">
                          <span className="text-gray-500">{key}:</span>{" "}
                          <span className="font-medium text-gray-800">{val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 mb-2">
                      <p className="text-xs font-bold text-emerald-800">{ex.result}</p>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{ex.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Excel İpuçları */}
        {m.excelTips.length > 0 && (
          <Section title="Excel'de Nasıl Yapılır?">
            <div className="space-y-3">
              {m.excelTips.map((tip, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-bold text-gray-800 mb-1">{tip.title}</p>
                  <code className="block rounded-lg bg-gray-50 px-3 py-2 text-xs font-mono text-gray-800 mb-2 break-all">
                    {tip.formula}
                  </code>
                  <p className="text-xs text-gray-600">{tip.description}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Yorumlama Rehberi */}
        {m.interpretation.length > 0 && (
          <Section title="Sonucu Nasıl Yorumlamalı?">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-2 font-semibold text-gray-600">Aralık</th>
                    <th className="px-4 py-2 font-semibold text-gray-600">Anlam</th>
                  </tr>
                </thead>
                <tbody>
                  {m.interpretation.map((item, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{item.range}</td>
                      <td className="px-4 py-2 text-gray-600">{item.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* İpuçları */}
        {m.tips.length > 0 && (
          <Section title="İpuçları & Dikkat Edilecekler">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <ul className="space-y-2">
                {m.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-xs text-amber-900 leading-relaxed">
                    <span className="mt-0.5 shrink-0">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        )}

        {/* İlgili Metrikler */}
        {related.length > 0 && (
          <Section title="İlgili Metrikler">
            <div className="flex flex-wrap gap-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/finans-sigorta/${r.slug}`}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-medium text-gray-700 transition hover:border-emerald-200 hover:text-emerald-700 hover:shadow-sm"
                >
                  {r.icon} {r.name}
                </Link>
              ))}
            </div>
          </Section>
        )}
      </main>
    </div>
  );
}
