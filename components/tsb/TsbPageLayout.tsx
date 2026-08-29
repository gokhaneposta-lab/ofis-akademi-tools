import Link from "next/link";
import type { ReactNode } from "react";
import TsbJsonLd from "@/components/tsb/TsbJsonLd";
import TsbSeoSection from "@/components/tsb/TsbSeoSection";
import {
  tsb,
  TsbDashboardStickyNav,
  TsbPanelHelp,
} from "@/components/tsb/tsbDashboardUi";
import { tsbPanelPageTitle } from "@/lib/tsbDashboardPanels";
import { tsbPanelHelpForHref } from "@/lib/tsbPanelHelpContent";
import { TSB_SEO, type TsbSeoPageId } from "@/lib/tsbSeo";
import { loadTsbVeriDurumu } from "@/lib/tsbVeriDurumu";

type TsbPageLayoutProps = {
  /** Boş bırakılırsa `currentHref` üzerinden hub kartı başlığı kullanılır */
  title?: string;
  description: ReactNode;
  sourceNote?: ReactNode;
  currentHref: string;
  seoPageId: TsbSeoPageId;
  helpItems?: readonly string[];
  /** Prim hub sticky sekme vurgusu */
  activePrimPanel?: string;
  children: ReactNode;
};

/** TSB panel sayfa iskeleti — yalnızca server component (fs/meta okuma). */
export function TsbPageLayout({
  title,
  description,
  sourceNote,
  currentHref,
  seoPageId,
  helpItems,
  activePrimPanel,
  children,
}: TsbPageLayoutProps) {
  const help = helpItems ?? tsbPanelHelpForHref(currentHref);
  const seo = TSB_SEO[seoPageId];
  const veriDurumu = loadTsbVeriDurumu();
  const pageTitle = title ?? tsbPanelPageTitle(currentHref);

  return (
    <>
      <TsbJsonLd
        page={seo}
        variant="panel"
        dateModified={veriDurumu.guncellemeIso}
        seoPageId={seoPageId}
      />
      <div className={tsb.pageBg}>
        <header className={tsb.pageHeader}>
          <div className={tsb.pageHeaderInner}>
            <Link href="/sigorta/tsb" className={tsb.backLink}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Sektör Verileri (TSB)
            </Link>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className={tsb.pageTitle}>{pageTitle}</h1>
              <span className={tsb.pageBadge}>TSB</span>
            </div>
            <p className={tsb.pageLead}>{description}</p>
            {sourceNote ? <aside className={tsb.sourceNote}>{sourceNote}</aside> : null}
          </div>
        </header>
        <main className={tsb.main}>
          <TsbDashboardStickyNav currentHref={currentHref} activePrimPanel={activePrimPanel} />
          {children}
          {help.length > 0 ? <TsbPanelHelp items={help} /> : null}
          <TsbSeoSection pageId={seoPageId} />
        </main>
      </div>
    </>
  );
}
