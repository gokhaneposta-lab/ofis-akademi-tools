import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bilanço",
  robots: { index: false, follow: false },
};

export default function BilancoPage() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-900">Bilanço</h2>
      <p className="mt-2 text-sm text-slate-600">GT türevi bilanço projeksiyonu (V1).</p>
    </div>
  );
}
