import Link from "next/link";
import { cn, tsb } from "@/components/tsb/tsbDashboardUi";
import type { TsbHazirSorgu } from "@/lib/tsbHazirSorgular";

type Props = {
  sorgular: TsbHazirSorgu[];
  className?: string;
};

export default function TsbHazirSorguChips({ sorgular, className }: Props) {
  if (sorgular.length === 0) return null;
  return (
    <div className={cn(tsb.chipWrap, className)}>
      <p className={tsb.chipTitle}>Hazır sorgular</p>
      <p className={tsb.chipSubtitle}>Seçili şirket ve dönemle ilgili panellere geçiş</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {sorgular.map((s) => (
          <Link key={s.id} href={s.href} className={tsb.chipLink}>
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
