import { redirect } from "next/navigation";
import { primPanelHref } from "@/lib/tsbDashboardPanels";

export default function SigortaBransDegisimRedirectPage() {
  redirect(primPanelHref("brans", "degisim"));
}
