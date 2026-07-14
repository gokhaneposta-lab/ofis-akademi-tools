import type { Metadata } from "next";
import BacktestPanel from "@/components/butce/BacktestPanel";

export const metadata: Metadata = {
  title: "Backtest",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function BacktestPage() {
  return <BacktestPanel />;
}
