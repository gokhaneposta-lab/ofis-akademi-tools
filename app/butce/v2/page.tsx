import type { Metadata } from "next";
import V2DashboardClient from "@/components/butce/V2DashboardClient";

export const metadata: Metadata = {
  title: "Bütçe V2",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ButceV2Page() {
  return <V2DashboardClient />;
}
