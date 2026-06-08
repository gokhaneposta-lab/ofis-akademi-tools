import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aylık dağılım",
  robots: { index: false, follow: false },
};

export default function AylikDagilimPage() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-900">Aylık dağılım</h2>
      <p className="mt-2 text-sm text-slate-600">
        Yıllık prim hedefi → 12 ay oran slider. prim_dagilim port edilecek.
      </p>
    </div>
  );
}
