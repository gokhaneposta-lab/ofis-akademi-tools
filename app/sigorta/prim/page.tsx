import { permanentRedirect, redirect } from "next/navigation";
import {
  parseBransKiyasView,
  parsePrimPanelId,
  primPanelHref,
} from "@/lib/tsbDashboardPanels";

type PageProps = {
  searchParams: Promise<{ panel?: string; view?: string }>;
};

export default async function SigortaPrimRedirectPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  if (!sp.panel) {
    redirect("/sigorta/kanal-prim");
  }

  if (sp.panel === "brans-sira") {
    permanentRedirect("/sigorta/brans-sira");
  }

  const panel = parsePrimPanelId(sp.panel);
  if (panel === "brans") {
    const view = parseBransKiyasView(sp.view);
    permanentRedirect(primPanelHref("brans", view));
  }

  permanentRedirect(primPanelHref(panel));
}
