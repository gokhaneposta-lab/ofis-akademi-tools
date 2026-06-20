"use client";

import { TSB_KIRILIM_TABLOSU } from "@/lib/tsbKirilimSozluk";
import { tsb } from "@/components/tsb/tsbDashboardUi";

/** Branş / ana branş / tarife farklarını gösteren referans tablosu. */
export default function TsbKirilimReferans() {
  return (
    <details className={tsb.kirilimReferansWrap}>
      <summary className={tsb.kirilimReferansSummary}>
        <span className={tsb.panelHelpChevron} aria-hidden>
          ›
        </span>
        <span>
          <span className="block font-semibold text-slate-800">Branş kırılımları ne anlama geliyor?</span>
          <span className="block text-[11px] font-normal text-slate-500">Ana branş (TSB) ile gelir tablosu branşını karşılaştırın</span>
        </span>
      </summary>
      <div className={tsb.kirilimReferansBody}>
        <div className="overflow-x-auto">
          <table className={tsb.kirilimTable}>
            <thead>
              <tr>
                <th>Kavram</th>
                <th>Veri kaynağı</th>
                <th>Hangi paneller</th>
                <th>Örnek</th>
              </tr>
            </thead>
            <tbody>
              {TSB_KIRILIM_TABLOSU.map((s) => (
                <tr key={s.kavram}>
                  <td className="font-medium text-slate-900">{s.kavram}</td>
                  <td>{s.veriKaynagi}</td>
                  <td>{s.hangiPaneller}</td>
                  <td className="text-slate-700">{s.ornek}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
          <strong>Hasar/prim oranı</strong> panelindeki &quot;Branş&quot; gelir tablosu dilimidir;{" "}
          <strong>kanal prim</strong> panelindeki &quot;Ana branş (TSB)&quot; aylık prim istatistiği dilimidir.
          İkisi farklı sınıflandırmadır — aynı isimle karıştırmayın.
        </p>
      </div>
    </details>
  );
}
