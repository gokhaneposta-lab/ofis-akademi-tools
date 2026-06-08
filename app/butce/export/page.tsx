import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excel export",
  robots: { index: false, follow: false },
};

export default function ExportPage() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-900">Excel export</h2>
      <p className="mt-2 text-sm text-slate-600">GT + prim + oran raporu indirme.</p>
    </div>
  );
}
