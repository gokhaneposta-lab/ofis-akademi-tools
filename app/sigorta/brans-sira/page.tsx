import { redirect } from "next/navigation";
import { primPanelHref } from "@/lib/tsbDashboardPanels";

export default function SigortaBransSiraRedirectPage() {
  redirect(primPanelHref("brans", "sira"));
}