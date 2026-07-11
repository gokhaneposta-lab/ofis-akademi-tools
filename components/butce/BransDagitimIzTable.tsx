"use client";

import type { BransTarifeIzleme } from "@/lib/butce/prim/bransDagitimTrace";

function fmt(n: number, digits = 0) {
  return n.toLocaleString("tr-TR", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function pct(n: number) {
  return `% ${(n * 100).toLocaleString("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}

export default function BransDagitimIzTable({ iz }: { iz: BransTarifeIzleme }) {
  if (iz.satirlar.length === 0) {
    return (
      <p className="text-sm text-amber-800">
        {iz.bransKodu} / {iz.tarifeGrubu} için dağıtım satırı bulunamadı.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
        <p>
          <strong>{iz.tarifeGrubu}</strong> tarife hedefi:{" "}
          <strong>{fmt(iz.tarifeHedef)} TL</strong>
        </p>
        <p className="mt-1">
          Branş <strong>{iz.bransKodu}</strong> toplam payı:{" "}
          <strong>{fmt(iz.toplamBransHedef)} TL</strong> ({pct(iz.tarifeIcindeOran)} tarife
          hedefinin)
        </p>
        <p className="mt-2 text-xs text-slate-600">
          Formül: tarife grubu hedefi geçmiş üretim payına göre 7xx branşlara dağıtılır.
        </p>
        <ol className="mt-1 list-decimal pl-5 text-xs font-mono text-slate-700 space-y-0.5">
          <li>
            {iz.bransKodu} tutarı = tarife hedefi × {iz.bransKodu} geçmiş branş payı
          </li>
        </ol>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-white text-left text-xs text-slate-500">
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Dağıtım</th>
              <th className="px-2 py-2">Kırılım</th>
              <th className="px-2 py-2">Tip</th>
              <th className="px-2 py-2 text-right">Tarife hedef payı</th>
              <th className="px-2 py-2 text-right">Tarife hedefi</th>
              <th className="px-2 py-2 text-right">Branş payı</th>
              <th className="px-2 py-2 text-right font-semibold text-slate-800">
                {iz.bransKodu} tutarı
              </th>
              <th className="px-2 py-2">Hesap</th>
              <th className="px-2 py-2">Kaynak</th>
            </tr>
          </thead>
          <tbody>
            {iz.satirlar.map((r) => (
              <tr key={`${r.satisSatir}-${r.primTipi}`} className="border-b border-slate-100">
                <td className="px-2 py-1.5 font-mono text-xs text-slate-500">{r.satisSatir + 1}</td>
                <td className="px-2 py-1.5">{r.kanal1}</td>
                <td className="px-2 py-1.5">{r.kanal2}</td>
                <td className="px-2 py-1.5 text-xs text-slate-600">{r.primTipi}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{pct(r.tarifeSatirPayi)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmt(r.satirHedef)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{pct(r.bransPayi)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums font-medium">
                  {fmt(r.bransHedef)}
                </td>
                <td className="px-2 py-1.5 text-[11px] text-slate-700">
                  <div className="font-mono whitespace-nowrap">
                    {fmt(iz.tarifeHedef)} × {pct(r.bransPayi)} ={" "}
                    <span className="font-semibold text-slate-900">{fmt(r.bransHedef)}</span>
                  </div>
                </td>
                <td className="px-2 py-1.5 text-xs text-slate-500">{r.kaynak}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
              <td colSpan={7} className="px-2 py-2 text-right">
                {iz.bransKodu} toplam ({iz.dagitilanSatirSayisi} satır)
              </td>
              <td className="px-2 py-2 text-right tabular-nums">{fmt(iz.toplamBransHedef)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>

      <details className="text-xs text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-700">
          Örnek hesap
        </summary>
        {iz.satirlar[0] && (
          <div className="mt-2 space-y-1 font-mono">
            <p>
              {fmt(iz.tarifeHedef)} × {pct(iz.satirlar[0].bransPayi)} ={" "}
              {fmt(iz.satirlar[0].bransHedef)} TL ({iz.bransKodu} payı)
            </p>
          </div>
        )}
      </details>
    </div>
  );
}
