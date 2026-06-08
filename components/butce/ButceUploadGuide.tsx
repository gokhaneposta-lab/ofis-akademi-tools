import type { UploadSpec } from "@/lib/butce/uploadSpecs";

type Props = {
  spec: UploadSpec;
  defaultOpen?: boolean;
};

export default function ButceUploadGuide({ spec, defaultOpen = false }: Props) {
  return (
    <details
      open={defaultOpen}
      className="mt-4 rounded-lg border border-slate-200 bg-slate-50/80 text-sm"
    >
      <summary className="cursor-pointer select-none px-4 py-3 font-medium text-slate-800 hover:bg-slate-100/80">
        Dosya formatı ve yükleme rehberi
        {spec.comingSoon && (
          <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-normal text-amber-900">
            Yakında
          </span>
        )}
      </summary>

      <div className="space-y-4 border-t border-slate-200 px-4 py-4 text-slate-700">
        <p>{spec.summary}</p>

        <dl className="grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Dosya</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{spec.fileHint}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Excel sayfası</dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold text-slate-900">{spec.sheetName}</dd>
          </div>
        </dl>

        {spec.steps.length > 0 && !spec.comingSoon && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Adımlar</h4>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5">
              {spec.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        )}

        {spec.columns.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Kolon düzeni ({spec.sheetName})
            </h4>
            <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="min-w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Kolon</th>
                    <th className="px-3 py-2">Alan</th>
                    <th className="px-3 py-2">Örnek</th>
                    <th className="px-3 py-2">Not</th>
                  </tr>
                </thead>
                <tbody>
                  {spec.columns.map((c) => (
                    <tr key={c.col} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-2 font-mono font-semibold">{c.col}</td>
                      <td className="px-3 py-2">{c.field}</td>
                      <td className="px-3 py-2 font-mono text-slate-600">{c.example}</td>
                      <td className="px-3 py-2 text-slate-500">{c.note ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {spec.checks.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Yüklemeden önce</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {spec.checks.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {spec.errors && spec.errors.length > 0 && (
          <div className="rounded-lg border border-red-100 bg-red-50/80 px-3 py-2">
            <h4 className="text-xs font-semibold text-red-800">Sık hatalar</h4>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-red-900/90">
              {spec.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}
