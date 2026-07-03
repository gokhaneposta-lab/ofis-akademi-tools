import type { Metadata } from "next";
import KpkKapanisClient from "@/components/butce/KpkKapanisClient";

export const metadata: Metadata = {
  title: "Bütçe — KPK kapanış tahmini",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function KpkKapanisPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">KPK — önceki yıl kapanış tahmini</h1>
        <p className="mt-1 text-sm text-slate-600">
          Devreden KPK hesabı için bir önceki yılın eksik aylarını tarife grubu bazında tahminleyin.
        </p>
      </div>
      <KpkKapanisClient />
    </div>
  );
}
