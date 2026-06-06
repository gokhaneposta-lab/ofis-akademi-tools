import type { Metadata } from "next";
import ButceUploadPanel from "@/components/butce/ButceUploadPanel";
import { hedefToplamByBransAp, hedefToplamByTarife } from "@/lib/butce/aggregateHedef";
import { butceDataDurumu, loadButceGtBlRows, loadButceHedefRows } from "@/lib/butce/loadButceData";

export const metadata: Metadata = {
  title: "Finansal projeksiyon (bütçe)",
  robots: { index: false, follow: false },
};

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

function ytdToAylik60001(rows: ReturnType<typeof loadButceGtBlRows>) {
  const sig = rows.filter((r) => r.sirket === "sigorta" && r.hesapKodu === "60001");
  const byYear = new Map<string, typeof sig>();
  for (const r of sig) {
    const y = r.donem.slice(0, 4);
    const list = byYear.get(y) ?? [];
    list.push(r);
    byYear.set(y, list);
  }
  const out: { donem: string; ytd: number; aylik: number }[] = [];
  for (const [, list] of byYear) {
    const sorted = [...list].sort((a, b) => a.donem.localeCompare(b.donem));
    let prev = 0;
    for (const r of sorted) {
      const aylik = r.deger - prev;
      prev = r.deger;
      out.push({ donem: r.donem, ytd: r.deger, aylik });
    }
  }
  return out.sort((a, b) => a.donem.localeCompare(b.donem)).slice(-6);
}

export default function ButcePanelPage() {
  const durum = butceDataDurumu();
  const meta = durum.meta;
  const hedefRows = loadButceHedefRows();
  const gtRows = loadButceGtBlRows();

  const hedefBs = hedefRows.filter((r) => r.sirketKodu.toUpperCase() === "BS");
  const hedefHavuz = hedefRows.filter((r) => r.sirketKodu.toUpperCase() === "HAVUZ");
  const byTarife = hedefToplamByTarife(hedefBs);
  const byBrans = hedefToplamByBransAp(hedefBs, { sirketKodu: "BS" });
  const primTrend = ytdToAylik60001(gtRows);

  const hedefToplamBs = hedefBs.reduce((s, r) => s + r.hedefTutar, 0);
  const hedefToplamHavuz = hedefHavuz.reduce((s, r) => s + r.hedefTutar, 0);

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold text-slate-900">Finansal projeksiyon motoru</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Bereket Sigorta / Emeklilik — aylık GT·BL geçmişi, GM prim hedefi (tarife × kanal) ve GT branş
          dilimine toplama. <strong>Gizli panel</strong> — arama motorlarında yok.
        </p>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6">
        <ButceUploadPanel hasGtBl={durum.hasGtBl} hasHedef={durum.hasHedef} />

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Veri durumu</h2>
          <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">GT / Bilanço</dt>
              <dd className="font-medium text-emerald-800">
                {durum.hasGtBl
                  ? `${meta?.gtBlDonemMin} … ${meta?.gtBlDonemMax} · ${durum.gtBlSatir} satır`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Prim hedefi</dt>
              <dd className="font-medium text-emerald-800">
                {durum.hasHedef
                  ? `${meta?.hedefYil} · BS ${nf.format(hedefToplamBs)} TL`
                  : "—"}
              </dd>
            </div>
          </dl>
        </section>

        {durum.hasHedef ? (
          <>
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                {meta?.hedefYil} prim hedefi — tarife grubu (BS)
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                GM formatı: KANAL 1 × KANAL 2 × tarife. Toplam BS: {nf.format(hedefToplamBs)} TL
                {hedefHavuz.length > 0 ? ` · Havuz ayrı: ${nf.format(hedefToplamHavuz)} TL` : ""}
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-slate-500">
                      <th className="py-1 pr-3">Tarife</th>
                      <th className="py-1 pr-3">GT branş (Hazine)</th>
                      <th className="py-1 text-right">Hedef</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byTarife.map((t) => (
                      <tr key={t.tarifeGrupNorm} className="border-b border-slate-100">
                        <td className="py-1.5 pr-3 font-medium">{t.tarifeGrupNorm}</td>
                        <td className="py-1.5 pr-3 text-slate-600">{t.bransAp ?? "—"}</td>
                        <td className="py-1.5 text-right tabular-nums">{nf.format(t.toplam)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-amber-950">
                GT branş dilimine toplanmış hedef (kanal birleşik)
              </h2>
              <p className="mt-1 text-xs text-amber-900/80">
                Gelir tablosu 7&apos;li / branş sayfaları için GM tarifesi → Hazine branşı eşlemesi (TSB H/P ile
                aynı mantık). Yangın + DASK aynı dilimde.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-amber-200 text-amber-900/70">
                      <th className="py-1 pr-3">bransAp</th>
                      <th className="py-1 text-right">2027 hedef</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byBrans.map((b) => (
                      <tr key={b.bransAp} className="border-b border-amber-100/80">
                        <td className="py-1.5 pr-3 font-medium">{b.bransAp}</td>
                        <td className="py-1.5 text-right tabular-nums font-semibold">{nf.format(b.toplam)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="pt-2 font-semibold">Toplam</td>
                      <td className="pt-2 text-right font-bold tabular-nums">{nf.format(hedefToplamBs)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </>
        ) : null}

        {durum.hasGtBl ? (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Sigorta — brüt prim (60001) son aylar</h2>
            <p className="mt-1 text-xs text-slate-500">Kaynak: YTD kümülatif; aylık = ay içi fark.</p>
            <table className="mt-2 w-full text-xs">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-1 text-left">Dönem</th>
                  <th className="py-1 text-right">YTD</th>
                  <th className="py-1 text-right">Aylık üretim</th>
                </tr>
              </thead>
              <tbody>
                {primTrend.map((p) => (
                  <tr key={p.donem} className="border-b border-slate-100">
                    <td className="py-1">{p.donem}</td>
                    <td className="py-1 text-right tabular-nums">{nf.format(p.ytd)}</td>
                    <td className="py-1 text-right tabular-nums font-medium text-emerald-800">
                      {nf.format(p.aylik)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        <p className="text-center text-[11px] text-slate-400">
          Sonraki adım: gider girişi + aylık GT/BL projeksiyon senaryosu
        </p>
      </main>
    </div>
  );
}
