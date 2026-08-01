"use client";

import TsbBransKiyasHub from "@/components/tsb/TsbBransKiyasHub";
import TsbKanalDagilimDashboard from "@/components/tsb/TsbKanalDagilimDashboard";
import TsbKanalPrimDashboard from "@/components/tsb/TsbKanalPrimDashboard";
import TsbPazarYogunlasmaDashboard from "@/components/tsb/TsbPazarYogunlasmaDashboard";
import TsbPrimTrend12Dashboard from "@/components/tsb/TsbPrimTrend12Dashboard";
import type { TsbBransKiyasView, TsbPrimPanelId } from "@/lib/tsbDashboardPanels";

/** Prim hub içeriği — sticky nav sekmesi hangi paneli göstereceğini belirler. */
export default function TsbPrimUretimHub({
  panel,
  bransView = "degisim",
}: {
  panel: TsbPrimPanelId;
  bransView?: TsbBransKiyasView;
}) {
  switch (panel) {
    case "brans":
      return <TsbBransKiyasHub view={bransView} />;
    case "kanal-prim":
      return <TsbKanalPrimDashboard />;
    case "kanal-dagilim":
      return <TsbKanalDagilimDashboard />;
    case "prim-trend-12":
      return <TsbPrimTrend12Dashboard />;
    case "pazar-yogunlasma":
      return <TsbPazarYogunlasmaDashboard />;
    default:
      return <TsbBransKiyasHub view={bransView} />;
  }
}
