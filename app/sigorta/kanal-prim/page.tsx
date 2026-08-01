import { redirect } from "next/navigation";
import { primPanelHref } from "@/lib/tsbDashboardPanels";

export default function SigortaKanalPrimRedirectPage() {
  redirect(primPanelHref("kanal-prim"));
}
