import Link from "next/link";
import type { Metadata } from "next";
import TsbJsonLd from "@/components/tsb/TsbJsonLd";
import TsbSeoSection from "@/components/tsb/TsbSeoSection";
import TsbSektorOzeti from "@/components/tsb/TsbSektorOzeti";
import TsbVeriDurumuBand from "@/components/tsb/TsbVeriDurumuBand";
import { tsb } from "@/components/tsb/tsbDashboardUi";
import { TSB_DASHBOARD_GROUPS, TSB_DASHBOARD_PANELS } from "@/lib/tsbDashboardPanels";
import { loadSektorOzeti } from "@/lib/tsbSektorOzeti";
import { loadOlcekSegmentCache } from "@/lib/tsbOlcekSegmentCache.server";
import { loadTsbVeriDurumu } from "@/lib/tsbVeriDurumu";
import TsbOlcekSegmentHubKart from "@/components/tsb/TsbOlcekSegmentHubKart";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.hub);

export default async function SigortaTsbHubPage() {
  const veriDurumu = loadTsbVeriDurumu();
  const sektorOzeti = loadSektorOzeti();
  const olcekSegment = loadOlcekSegmentCache();

  return (
    <>
      <TsbJsonLd
        page={TSB_SEO.hub}
        variant="hub"
        dateModified={veriDurumu.guncellemeIso}
        seoPageId="hub"
      />
      <div className={tsb.pageBg}>
        <header className={tsb.pageHeader}>
          <div className={tsb.pageHeaderInner}>
            <Link href="/" className={tsb.backLink}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Ana Sayfa
            </Link>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className={tsb.pageTitle}>Sektör verileri (TSB)</h1>
              <span className={tsb.pageBadge}>Dashboard</span>
            </div>
            <p className={tsb.pageLead}>
              Türkiye Sigortalar Birliği (TSB) kaynaklı veriler — site içinde yeniden düzenlenmiş gösterge
              panelleri.
            </p>
            <ul className={tsb.hubLeadList} aria-label="Veri türleri">
              <li className={tsb.hubLeadItem}>
                <span className={tsb.hubLeadBullet} aria-hidden />
                <span>
                  <strong>Finansal karşılaştırma</strong> — çeyreklik gelir tablosu ve bilanço KPI&apos;ları
                </span>
              </li>
              <li className={tsb.hubLeadItem}>
                <span className={tsb.hubLeadBullet} aria-hidden />
                <span>
                  <strong>Prim panelleri</strong> — aylık prim üretimi, kanal ve branş kırılımları
                </span>
              </li>
            </ul>
            <TsbVeriDurumuBand data={veriDurumu} />
            <div className="mt-4">
              <Link
                href="/sigorta/sirket-karne"
                className={tsb.hubFeaturedCard}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className={tsb.hubPanelBadge}>Öne çıkan</span>
                    <h2 className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">Şirket karne</h2>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-600">
                      Tek şirket seçin — özet karne, sekmeler ve finansal/teknik/prim panellerine tek tıkla geçin.
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-emerald-800 group-hover:underline">
                    Karneye git →
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </header>

        <main className={tsb.main}>
          <TsbSektorOzeti data={sektorOzeti} />

          {olcekSegment ? (
            <div className="mt-4">
              <TsbOlcekSegmentHubKart data={olcekSegment} />
            </div>
          ) : null}

          {TSB_DASHBOARD_GROUPS.map((group) => {
            const panels = TSB_DASHBOARD_PANELS.filter((p) => p.group === group.id);
            return (
              <section key={group.id} aria-labelledby={`tsb-group-${group.id}`}>
                <h2 id={`tsb-group-${group.id}`} className={tsb.hubGroupTitle}>
                  {group.title}
                </h2>
                <p className={tsb.hubGroupLead}>{group.description}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {panels.map((p) => (
                    <Link key={p.href} href={p.href} className={tsb.hubPanelCard}>
                      <div className="flex items-start gap-3">
                        <span className="text-xl" aria-hidden>
                          {p.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className={tsb.hubPanelBadge}>{p.badge}</span>
                          <h3 className={tsb.hubPanelTitle}>{p.title}</h3>
                          <p className={tsb.hubPanelSubtitle}>{p.subtitle}</p>
                        </div>
                      </div>
                      <p className={tsb.hubPanelCta}>Panele git →</p>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

          <TsbSeoSection pageId="hub" />

          <p className="text-center text-[11px] text-slate-500">
            <Link href="/finans-sigorta" className="font-medium text-emerald-800 hover:underline">
              Finans &amp; Sigorta metrikleri
            </Link>
            {" · "}
            Kaynak ve yöntem için{" "}
            <a
              href="https://www.tsb.org.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-800 underline decoration-emerald-600/40"
            >
              tsb.org.tr
            </a>
          </p>
        </main>
      </div>
    </>
  );
}
