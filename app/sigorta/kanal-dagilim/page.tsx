import { redirect } from "next/navigation";
import { primPanelHref } from "@/lib/tsbDashboardPanels";

export default function SigortaKanalDagilimRedirectPage() {
  redirect(primPanelHref("kanal-dagilim"));
}
