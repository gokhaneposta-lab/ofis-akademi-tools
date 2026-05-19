import type { ReactNode } from "react";
import { site } from "@/components/siteUi";

type Props = {
  input: ReactNode;
  output?: ReactNode;
};

export default function ToolUsageExample({ input, output }: Props) {
  if (!output) {
    return (
      <div className={site.toolExampleBox}>
        <p className={site.toolExampleLabel}>Örnek veri</p>
        <div className="text-slate-700">{input}</div>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <ExampleBlock label="Örnek veri">{input}</ExampleBlock>
      <ExampleBlock label="Beklenen sonuç">{output}</ExampleBlock>
    </div>
  );
}

function ExampleBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={site.toolExampleBox}>
      <p className={site.toolExampleLabel}>{label}</p>
      <div className="text-slate-700">{children}</div>
    </div>
  );
}
