"use client";

import { usePathname, useRouter } from "next/navigation";
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

export default function TsbBransKiyasHub({ view }: { view: TsbBransKiyasView }) {
  const router = useRouter();
  const pathname = usePathname();

  const setView = useCallback(
    (next: TsbBransKiyasView) => {
      const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
      params.set("panel", "brans");
      params.set("view", next);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router],
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
