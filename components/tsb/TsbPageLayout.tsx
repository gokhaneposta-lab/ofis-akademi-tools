import Link from "next/link";
import type { ReactNode } from "react";
import TsbJsonLd from "@/components/tsb/TsbJsonLd";
import TsbSeoSection from "@/components/tsb/TsbSeoSection";
import {
  tsb,
  TsbDashboardStickyNav,
  TsbPanelHelp,
} from "@/components/tsb/tsbDashboardUi";
import { tsbPanelHelpForHref } from "@/lib/tsbPanelHelpContent";
import { TSB_SEO, type TsbSeoPageId } from "@/lib/tsbSeo";
import { loadTsbVeriDurumu } from "@/lib/tsbVeriDurumu";

type TsbPageLayoutProps = {
  title: string;
  description: ReactNode;
  sourceNote?: ReactNode;
  currentHref: string;
  seoPageId: TsbSeoPageId;
  helpItems?: readonly string[];
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
  children,
}: TsbPageLayoutProps) {
  const help = helpItems ?? tsbPanelHelpForHref(currentHref);
  const seo = TSB_SEO[seoPageId];
  const veriDurumu = loadTsbVeriDurumu();

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
              Sektör verileri (TSB)
            </Link>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className={tsb.pageTitle}>{title}</h1>
              <span className={tsb.pageBadge}>TSB</span>
            </div>
            <p className={tsb.pageLead}>{description}</p>
            {sourceNote ? <aside className={tsb.sourceNote}>{sourceNote}</aside> : null}
          </div>
        </header>
        <main className={tsb.main}>
          <TsbDashboardStickyNav currentHref={currentHref} />
          {help.length > 0 ? <TsbPanelHelp items={help} /> : null}
          {children}
          <TsbSeoSection pageId={seoPageId} />
        </main>
      </div>
    </>
  );
}
