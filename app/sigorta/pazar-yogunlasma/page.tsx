import { redirect } from "next/navigation";
import { primPanelHref } from "@/lib/tsbDashboardPanels";

export default function SigortaPazarYogunlasmaRedirectPage() {
  redirect(primPanelHref("pazar-yogunlasma"));
}
