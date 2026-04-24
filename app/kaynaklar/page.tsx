import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site";
import NewsletterForm from "@/components/NewsletterForm";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

const BASE_URL = getSiteUrl();
const ACCENT = "#217346";

export const metadata: Metadata = {
  title: "Ücretsiz Excel Kaynakları — Şablonlar, Modeller & Kartlar",
  description:
    "Ofis Akademi'nin tüm ücretsiz Excel kaynakları tek sayfada: pivot şablonu, dashboard örneği, TFRS 17 modeli, kısayol/formül kartları ve seviye seviye eğitim Excel'leri.",
  alternates: { canonical: `${BASE_URL}/kaynaklar` },
  keywords: [
    "ucretsiz excel sablonu",
    "excel dashboard",
    "pivot tablo ornegi",
    "tfrs 17 excel",
    "excel kisayol karti",
    "excel formul karti",
    "excel egitim dosyasi",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Ofis Akademi",
    title: "Ücretsiz Excel Kaynakları — Ofis Akademi",
    description:
      "Pivot, dashboard, TFRS 17 modeli, kısayol kartları ve eğitim Excel'leri. Tek tıkla indirilebilir.",
    url: `${BASE_URL}/kaynaklar`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ücretsiz Excel Kaynakları — Ofis Akademi",
    description:
      "Pivot, dashboard, TFRS 17, kısayol kartları ve eğitim Excel'leri.",
  },
};

type ResourceCard = {
  title: string;
  description: string;
  category: string;
  href: string;
  /** "download" → public dosya, ind butonu / "navigate" → sayfaya gönder */
  type: "download" | "navigate";
  fileName?: string;
  ctaLabel: string;
  badges?: string[];
};

const RESOURCES: ResourceCard[] = [
  {
    title: "Pivot Tablo Örneği",
    description:
      "Hazır veri seti + örnek özet tablo. Pivot mantığını adım adım uygulamak için ideal başlangıç dosyası.",
    category: "Veri Analizi",
    href: "/downloads/pivot-ornegi.xlsx",
    type: "download",
    fileName: "pivot-ornegi.xlsx",
    ctaLabel: "Pivot örneğini indir (.xlsx)",
    badges: ["Excel · .xlsx", "Hazır veri seti", "Ücretsiz"],
  },
  {
    title: "Dashboard Örneği",
    description:
      "Tek tıkla güncellenen örnek satış göstergesi: KPI kartları, mini grafik ve dilimleyici örnekleri.",
    category: "Dashboard",
    href: "/downloads/dashboard-ornegi.xlsx",
    type: "download",
    fileName: "dashboard-ornegi.xlsx",
    ctaLabel: "Dashboard örneğini indir (.xlsx)",
    badges: ["Excel · .xlsx", "Hazır şablon", "Ücretsiz"],
  },
  {
    title: "TFRS 17 / IFRS 17 Örnek Model",
    description:
      "Yeni sigorta muhasebesi için hazırlanmış sade bir Excel modeli: CSM, RA, LRC ve LIC kalemleri, açıklamalar ve formüller.",
    category: "Finans & Sigorta",
    href: "/downloads/tfrs-17-ornek-model.xlsx",
    type: "download",
    fileName: "tfrs-17-ornek-model.xlsx",
    ctaLabel: "TFRS 17 modelini indir (.xlsx)",
    badges: ["Excel · .xlsx", "Sigorta", "TFRS 17"],
  },
  {
    title: "Kısayol & Formül Kartları",
    description:
      "En çok kullanılan Excel kısayolları ve formülleri tek sayfada — yazdır, masana as, eğitim sırasında referans olarak tut.",
    category: "Kaynaklar",
    href: "/excel-araclari/kisayol-formul-kartlari",
    type: "navigate",
    ctaLabel: "Kartları aç ve PDF indir",
    badges: ["PDF · yazdırılabilir", "Tek sayfa", "Ücretsiz"],
  },
  {
    title: "Seviye 1 — Temel Eğitim Excel'i",
    description:
      "Başlangıç seviyesi tüm konuların örnek dosyası: TOPLA, ORTALAMA, EĞER, biçimlendirme ve filtreleme egzersizleri.",
    category: "Eğitim",
    href: "/egitimler/temel",
    type: "navigate",
    ctaLabel: "Temel seviyesine git (Excel İndir)",
    badges: ["Excel · .xlsx", "Egzersizli", "Sıfırdan"],
  },
  {
    title: "Seviye 2 — Orta Eğitim Excel'i",
    description:
      "DÜŞEYARA / XLOOKUP, EĞERSAY, ÇOKETOPLA, metin fonksiyonları için pratik egzersiz dosyası.",
    category: "Eğitim",
    href: "/egitimler/orta",
    type: "navigate",
    ctaLabel: "Orta seviyesine git (Excel İndir)",
    badges: ["Excel · .xlsx", "Egzersizli", "Pratik"],
  },
  {
    title: "Seviye 3 — İleri Eğitim Excel'i",
    description:
      "PivotTable, dilimleyici, FİLTRE/SIRALA/BENZERSİZ, gösterge paneli kurulumu için ileri seviye egzersiz dosyası.",
    category: "Eğitim",
    href: "/egitimler/ileri",
    type: "navigate",
    ctaLabel: "İleri seviyesine git (Excel İndir)",
    badges: ["Excel · .xlsx", "Egzersizli", "İleri"],
  },
];

export default function KaynaklarPage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Ücretsiz Excel Kaynakları",
    description:
      "Ofis Akademi'nin ücretsiz Excel şablonları, modeller, kısayol kartları ve eğitim dosyaları.",
    url: `${BASE_URL}/kaynaklar`,
    inLanguage: "tr-TR",
    isPartOf: { "@type": "WebSite", name: "Ofis Akademi", url: BASE_URL },
    hasPart: RESOURCES.map((r) => ({
      "@type": "CreativeWork",
      name: r.title,
      description: r.description,
      url: r.href.startsWith("http") ? r.href : `${BASE_URL}${r.href}`,
    })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/80">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Ana Sayfa", path: "/" },
          { name: "Ücretsiz Kaynaklar", path: "/kaynaklar" },
        ]}
      />

      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200"
            aria-label="Ana Sayfa"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Ücretsiz Excel Kaynakları</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <p className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-[14px] leading-relaxed text-slate-700 sm:px-5">
          Ofis Akademi&apos;nin tüm ücretsiz Excel kaynakları tek sayfada. Şablonları
          doğrudan indirebilir, eğitim dosyalarını ilgili seviye sayfasından alabilirsin.
          Hepsi <strong>tamamen ücretsiz</strong>, ticari amaçla kullanılamaz; eğitim ve
          iş içi pratik için.
        </p>

        <section className="grid gap-4 sm:grid-cols-2">
          {RESOURCES.map((r) => (
            <article
              key={r.href}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                <span>{r.category}</span>
              </div>
              <h2 className="mt-1 text-[15px] font-bold text-gray-900">{r.title}</h2>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-gray-600">
                {r.description}
              </p>

              {r.badges && r.badges.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.badges.map((b) => (
                    <span
                      key={b}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}

              {r.type === "download" ? (
                <a
                  href={r.href}
                  download={r.fileName}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                  style={{ background: ACCENT }}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.576a1 1 0 01.707.293l3.854 3.854a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {r.ctaLabel}
                </a>
              ) : (
                <Link
                  href={r.href}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
                >
                  {r.ctaLabel}
                  <span aria-hidden>→</span>
                </Link>
              )}
            </article>
          ))}
        </section>

        {/* Newsletter CTA */}
        <div className="mt-12">
          <NewsletterForm
            variant="card"
            source="kaynaklar"
            heading="Yeni kaynakları kaçırma"
            description="Yeni Excel şablonları, formül kartları ve rehberleri yayınladığımızda sana e-posta gönderelim. Haftada en fazla 1 e-posta, spam yok."
          />
        </div>

        {/* Alt navigasyon */}
        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/blog" className="font-medium text-emerald-700 hover:underline">
            ← Tüm rehberler (Blog)
          </Link>
          <Link href="/excel-araclari" className="font-medium text-emerald-700 hover:underline">
            Excel Araçları
          </Link>
          <Link href="/egitimler" className="font-medium text-emerald-700 hover:underline">
            Eğitimler
          </Link>
        </div>
      </main>
    </div>
  );
}
