"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import TsbBransDegisimDashboard from "@/components/tsb/TsbBransDegisimDashboard";
import TsbBransSiraDashboard from "@/components/tsb/TsbBransSiraDashboard";
import { TsbSubPageNav } from "@/components/tsb/TsbSubPageNav";
import { tsb } from "@/components/tsb/tsbDashboardUi";
import type { TsbBransKiyasView } from "@/lib/tsbDashboardPanels";

const BRANS_SUB_PAGES = [
  {
    id: "degisim" as const,
    label: "Değişim ve pay",
    hint: "Şirket vs sektör · yıllık değişim",
  },
  {
    id: "sira" as const,
    label: "Sıra özeti",
    hint: "Sektör içi sıra · YoY Δ sıra",
  },
];

const BRANS_PATHS: Record<TsbBransKiyasView, string> = {
  degisim: "/sigorta/brans-degisim",
  sira: "/sigorta/brans-sira",
};

export default function TsbBransKiyasHub({ view }: { view: TsbBransKiyasView }) {
  const router = useRouter();

  const setView = useCallback(
    (next: TsbBransKiyasView) => {
      router.push(BRANS_PATHS[next], { scroll: false });
    },
    [router],
  );

  return (
    <div className={tsb.dashboardStack}>
      <TsbSubPageNav
        label="Branş kıyası — alt sayfa"
        items={BRANS_SUB_PAGES}
        value={view}
        onChange={setView}
      />
      {view === "sira" ? <TsbBransSiraDashboard /> : <TsbBransDegisimDashboard />}
    </div>
  );
}
