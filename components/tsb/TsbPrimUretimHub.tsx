"use client";

import TsbBransDegisimDashboard from "@/components/tsb/TsbBransDegisimDashboard";
import TsbBransSiraDashboard from "@/components/tsb/TsbBransSiraDashboard";
import TsbKanalDagilimDashboard from "@/components/tsb/TsbKanalDagilimDashboard";
import TsbKanalPrimDashboard from "@/components/tsb/TsbKanalPrimDashboard";
import TsbPazarYogunlasmaDashboard from "@/components/tsb/TsbPazarYogunlasmaDashboard";
import TsbPrimTrend12Dashboard from "@/components/tsb/TsbPrimTrend12Dashboard";
import type { TsbPrimPanelId } from "@/lib/tsbDashboardPanels";

/** Prim hub içeriği — sticky nav sekmesi hangi paneli göstereceğini belirler. */
export default function TsbPrimUretimHub({ panel }: { panel: TsbPrimPanelId }) {
  switch (panel) {
    case "kanal-prim":
      return <TsbKanalPrimDashboard />;
    case "kanal-dagilim":
      return <TsbKanalDagilimDashboard />;
    case "brans-degisim":
      return <TsbBransDegisimDashboard />;
    case "brans-sira":
      return <TsbBransSiraDashboard />;
    case "prim-trend-12":
      return <TsbPrimTrend12Dashboard />;
    case "pazar-yogunlasma":
      return <TsbPazarYogunlasmaDashboard />;
    default:
      return <TsbKanalPrimDashboard />;
  }
}
