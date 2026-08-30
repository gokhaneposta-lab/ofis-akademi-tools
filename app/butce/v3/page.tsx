import type { Metadata } from "next";
import V3DashboardClient from "@/components/butce/V3DashboardClient";

export const metadata: Metadata = {
  title: "Bütçe V3 — Mizan Tahmini",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ButceV3Page() {
  return <V3DashboardClient />;
}
