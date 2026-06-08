import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prim hedefi",
  robots: { index: false, follow: false },
};

export default function PrimHedefiPage() {
  return (
    <Placeholder
      title="Prim hedefi"
      desc="SATIS_BUTCE Excel → 7xx branş dağıtımı. Sonraki adımda dagitim_motoru port edilecek."
    />
  );
}

function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
      <p className="mt-4 text-xs text-slate-400">Yakında — butce-modulu port devam ediyor</p>
    </div>
  );
}
