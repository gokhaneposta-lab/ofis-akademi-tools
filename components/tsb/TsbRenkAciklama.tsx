import { cn, tsb, tsbDelta } from "@/components/tsb/tsbDashboardUi";

export type TsbRenkAciklamaItem = {
  label: string;
  /** iyi | kotu | notr | ozel */
  ton?: "iyi" | "kotu" | "notr" | "ozel";
  ozelClass?: string;
};

/** Tablo altı renk kodu şeridi (sıra, değişim vb.). */
export function TsbRenkAciklama({
  baslik,
  items,
  className,
}: {
  baslik?: string;
  items: readonly TsbRenkAciklamaItem[];
  className?: string;
}) {
  return (
    <div className={cn(tsb.renkAciklamaWrap, className)}>
      {baslik ? <p className={tsb.renkAciklamaBaslik}>{baslik}</p> : null}
      <ul className={tsb.renkAciklamaList}>
        {items.map((item) => (
          <li key={item.label} className={tsb.renkAciklamaItem}>
            <span
              className={cn(
                tsb.renkAciklamaNokta,
                item.ton === "iyi" && "bg-emerald-500",
                item.ton === "kotu" && "bg-rose-500",
                item.ton === "notr" && "bg-amber-400",
                item.ton === "ozel" && (item.ozelClass ?? "bg-slate-400"),
              )}
              aria-hidden
            />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Kanal grafiği: sol dolu = şirket, sağ çizgili = sektör. */
export function TsbSirketSektorGrafikLegend({ sirketAdi }: { sirketAdi?: string }) {
  return (
    <div className={tsb.grafikLegendWrap} aria-label="Grafik açıklaması">
      <span className={tsb.grafikLegendItem}>
        <span className="inline-block h-3 w-3 rounded-sm bg-emerald-500" aria-hidden />
        <strong>Şirket</strong>
        {sirketAdi ? ` · ${sirketAdi}` : ""}
        <span className="text-slate-500"> — dolu çubuk, sol (Ş)</span>
      </span>
      <span className={tsb.grafikLegendItem}>
        <span
          className="inline-block h-3 w-3 rounded-sm border-2 border-slate-500 bg-slate-100 bg-[repeating-linear-gradient(-45deg,#cbd5e1_0_2px,transparent_2px_4px)]"
          aria-hidden
        />
        <strong>Sektör</strong>
        <span className="text-slate-500"> — çizgili çubuk, sağ (S)</span>
      </span>
    </div>
  );
}

export { tsbDelta };
