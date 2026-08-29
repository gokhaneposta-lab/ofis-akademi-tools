import Link from "next/link";
import type { Metadata } from "next";
import TsbJsonLd from "@/components/tsb/TsbJsonLd";
import TsbSeoSection from "@/components/tsb/TsbSeoSection";
import TsbSektorOzeti from "@/components/tsb/TsbSektorOzeti";
import TsbVeriDurumuBand from "@/components/tsb/TsbVeriDurumuBand";
import { tsb } from "@/components/tsb/tsbDashboardUi";
import {
  TSB_DASHBOARD_GROUPS,
  TSB_DASHBOARD_PANELS,
  TSB_HUB_PAGE_TITLE,
  TSB_OLCEK_DASHBOARD_PANEL,
} from "@/lib/tsbDashboardPanels";
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
  const olcekHref = TSB_OLCEK_DASHBOARD_PANEL.href;

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
            <h1 className={tsb.pageTitle}>{TSB_HUB_PAGE_TITLE}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-snug text-slate-600">
              TSB kaynaklı prim, finansal ve teknik gösterge panelleri.
            </p>
          </div>
        </header>

        <main className={tsb.main}>
          <TsbVeriDurumuBand data={veriDurumu} variant="band" />

          <TsbSektorOzeti data={sektorOzeti} />

          {TSB_DASHBOARD_GROUPS.map((group) => {
            const panels = TSB_DASHBOARD_PANELS.filter(
              (p) => p.group === group.id && p.href !== olcekHref,
            );
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

          <section aria-labelledby="tsb-group-olcek" className="mt-2">
            <h2 id="tsb-group-olcek" className={tsb.hubGroupTitle}>
              Ölçek Segmentasyonu
            </h2>
            <p className={tsb.hubGroupLead}>
              Şirketler prim, özsermaye ve aktif büyüklüğüne göre A+…D gruplarına ayrılır — karşılaştırma ve
              peer seçiminde kullanılır.
            </p>
            {olcekSegment ? (
              <div className="mt-4">
                <TsbOlcekSegmentHubKart data={olcekSegment} />
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Link href={TSB_OLCEK_DASHBOARD_PANEL.href} className={tsb.hubPanelCard}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl" aria-hidden>
                      {TSB_OLCEK_DASHBOARD_PANEL.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className={tsb.hubPanelBadge}>{TSB_OLCEK_DASHBOARD_PANEL.badge}</span>
                      <h3 className={tsb.hubPanelTitle}>{TSB_OLCEK_DASHBOARD_PANEL.title}</h3>
                      <p className={tsb.hubPanelSubtitle}>{TSB_OLCEK_DASHBOARD_PANEL.subtitle}</p>
                    </div>
                  </div>
                  <p className={tsb.hubPanelCta}>Panele git →</p>
                </Link>
              </div>
            )}
          </section>

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
