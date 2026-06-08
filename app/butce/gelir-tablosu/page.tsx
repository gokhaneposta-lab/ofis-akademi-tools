import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gelir tablosu",
  robots: { index: false, follow: false },
};

export default function GelirTablosuPage() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-900">Gelir tablosu</h2>
      <p className="mt-2 text-sm text-slate-600">
        GT engine — baz × oran tahmin satırları. Faz 2 port edilecek.
      </p>
    </div>
  );
}
