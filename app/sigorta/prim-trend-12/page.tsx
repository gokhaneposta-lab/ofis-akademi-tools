import { redirect } from "next/navigation";
import { primPanelHref } from "@/lib/tsbDashboardPanels";

export default function SigortaPrimTrend12RedirectPage() {
  redirect(primPanelHref("prim-trend-12"));
}
