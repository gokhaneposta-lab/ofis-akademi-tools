"use client";

import Link from "next/link";
import { useState } from "react";
import BransDagitimIzTable from "@/components/butce/BransDagitimIzTable";
import { REFERANS_YIL_SECENEKLERI } from "@/lib/butce/config/constants";
import type { BransTarifeIzleme } from "@/lib/butce/prim/bransDagitimTrace";
import type {
  PrimBransOzet,
  PrimDagitimDetay,
  PrimDagitimLog,
  PrimDagitimOzet,
} from "@/lib/butce/types";

type TarifeOzet = {
  tarifeGrubu: string;
  oncekiYil1: number;
  oncekiYil2: number;
  tahminYilsonu: number;
  mevcutHedef: number;
  yeniHedef: number;
  artisOrani: number;
  sadeExport: boolean;
};

type Durum = {
  hasMizan: boolean;
  hasTarifeMap: boolean;
  hasTarifeBransPay: boolean;
  hasSatisButce: boolean;
  hasUretim: boolean;
  mizanSatir: number;
  tarifeMapSatir: number;
  tarifeBransPaySatir: number;
  satisButceSatir: number;
  uretimSatir: number;
  butceYili: number;
};

type Props = {
  durum: Durum;
  initialTarifeOzet: TarifeOzet[];
};

function fmt(n: number) {
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
}

export default function PrimHedefiClient({ durum, initialTarifeOzet }: Props) {
  const [tarifeRows, setTarifeRows] = useState<TarifeOzet[]>(initialTarifeOzet);
  const [referans, setReferans] = useState("Son 2 Yıl Ortalaması (2024-2025)");
  const [mizanYedek, setMizanYedek] = useState(true);
  const [dagitBusy, setDagitBusy] = useState(false);
  const [dagitErr, setDagitErr] = useState<string | null>(null);
  const [bransOzet, setBransOzet] = useState<PrimBransOzet[] | null>(null);
  const [detay, setDetay] = useState<PrimDagitimDetay[] | null>(null);
  const [log, setLog] = useState<PrimDagitimLog[] | null>(null);
  const [ozet, setOzet] = useState<PrimDagitimOzet | null>(null);
  const [izleme, setIzleme] = useState<BransTarifeIzleme | null>(null);
  const [izlemeBrans, setIzlemeBrans] = useState("701");
  const [izlemeTarife, setIzlemeTarife] = useState("YANGIN");

  const butceYili = durum.butceYili;
  const hazir = durum.hasSatisButce && durum.hasTarifeBransPay;

  function updateTarife(idx: number, field: "yeniHedef" | "artisOrani", value: number) {
    setTarifeRows((prev) => {
      const next = [...prev];
      const row = { ...next[idx] };
      if (field === "yeniHedef") {
        row.yeniHedef = value;
        if (row.mevcutHedef > 0) row.artisOrani = value / row.mevcutHedef - 1;
      } else {
        row.artisOrani = value;
        row.yeniHedef = row.mevcutHedef * (1 + value);
      }
      next[idx] = row;
      return next;
    });
  }

  async function dagit() {
    setDagitBusy(true);
    setDagitErr(null);
    const tarifeHedefleri: Record<string, number> = {};
    for (const r of tarifeRows) tarifeHedefleri[r.tarifeGrubu] = r.yeniHedef;
    try {
      const res = await fetch("/api/butce/prim-dagit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referansEtiket: referans,
          mizanYedek,
          tarifeHedefleri,
          izlemeBrans,
          izlemeTarife,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDagitErr(data.error ?? "Dağıtım başarısız");
        return;
      }
      setBransOzet(data.bransOzet ?? []);
      setDetay(data.detay ?? []);
      setLog(data.log ?? []);
      setOzet(data.ozet ?? null);
      setIzleme(data.izleme ?? null);
    } catch (e) {
      setDagitErr(e instanceof Error ? e.message : "Bağlantı hatası");
    } finally {
      setDagitBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-950">
        <strong>Prim hedefi akışı:</strong> Tarife grubu hedeflerini kontrol et → referans yılı seç →
        geçmiş tarife-branş paylarına göre 7xx branşlara dağıt.
      </section>

      {!hazir && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Bu hesap için <strong>Bütçe Prim Hedefi</strong> ve{" "}
          <strong>Tarife Grubu → Hazine Branşı Dağılımı</strong> verileri gerekli. Dosyaları{" "}
          <Link href="/butce/veri-yukle" className="font-semibold underline">
            Veri yükleme
          </Link>{" "}
          sekmesinden yükleyin.
        </section>
      )}

      {tarifeRows.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Adım 2 — Tarife grubu hedefleri</h2>
          <p className="mt-1 text-sm text-slate-600">
            {butceYili} hedef kolonunu düzenleyin veya artış oranını değiştirin.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th className="py-2 pr-4">Tarife</th>
                  {!tarifeRows[0]?.sadeExport && (
                    <>
                      <th className="py-2 pr-4">2023</th>
                      <th className="py-2 pr-4">2024</th>
                      <th className="py-2 pr-4">2025 tahmin</th>
                      <th className="py-2 pr-4">Excel hedef</th>
                    </>
                  )}
                  <th className="py-2 pr-4">{butceYili} hedef</th>
                  <th className="py-2">Artış %</th>
                </tr>
              </thead>
              <tbody>
                {tarifeRows.map((row, idx) => (
                  <tr key={row.tarifeGrubu} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium">{row.tarifeGrubu}</td>
                    {!row.sadeExport && (
                      <>
                        <td className="py-2 pr-4 text-slate-600">{fmt(row.oncekiYil1)}</td>
                        <td className="py-2 pr-4 text-slate-600">{fmt(row.oncekiYil2)}</td>
                        <td className="py-2 pr-4 text-slate-600">{fmt(row.tahminYilsonu)}</td>
                        <td className="py-2 pr-4 text-slate-600">{fmt(row.mevcutHedef)}</td>
                      </>
                    )}
                    <td className="py-2 pr-4">
                      <input
                        type="number"
                        value={Math.round(row.yeniHedef)}
                        onChange={(e) => updateTarife(idx, "yeniHedef", Number(e.target.value))}
                        className="w-32 rounded border border-slate-300 px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={row.artisOrani}
                        onChange={(e) => updateTarife(idx, "artisOrani", Number(e.target.value))}
                        className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Adım 3 — Branşlara dağıtım (A motoru)</h2>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="text-slate-600">Referans yıl</span>
            <select
              value={referans}
              onChange={(e) => setReferans(e.target.value)}
              className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {Object.keys(REFERANS_YIL_SECENEKLERI).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={mizanYedek} onChange={(e) => setMizanYedek(e.target.checked)} />
            MIZAN yedek
          </label>
          <button
            type="button"
            onClick={dagit}
            disabled={!hazir || dagitBusy}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {dagitBusy ? "Dağıtılıyor…" : "A motoru ile dağıt"}
          </button>
        </div>
        {!hazir && (
          <p className="mt-2 text-sm text-amber-800">
            Dağıtım için SATIS_BUTCE ve tarife-branş pay tablosu gerekli.
          </p>
        )}
        {dagitErr && <p className="mt-2 text-sm text-red-700">{dagitErr}</p>}
        {ozet && (
          <p className="mt-3 text-sm text-emerald-800">
            Dağıtılan: <strong>{fmt(ozet.dagitilan)} TL</strong> · Aktif branş:{" "}
            <strong>{ozet.bransSayisi}</strong>
            {ozet.dagitilamayan > 0 && ` · Dağıtılamayan: ${fmt(ozet.dagitilamayan)} TL`}
            {ozet.uyariSayisi > 0 && ` · ${ozet.uyariSayisi} uyarı`}
          </p>
        )}
      </section>

      {bransOzet && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Branş bazlı hedef özeti</h2>
          <div className="mt-3 overflow-x-auto max-h-[480px]">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th className="py-2 pr-3">Kod</th>
                  <th className="py-2 pr-3">Branş</th>
                  <th className="py-2 pr-3">Ana branş</th>
                  <th className="py-2">Hedef (TL)</th>
                </tr>
              </thead>
              <tbody>
                {bransOzet
                  .filter((r) => r.hedefPrim > 0)
                  .map((r) => (
                    <tr key={r.bransKodu} className="border-b border-slate-100">
                      <td className="py-1.5 pr-3 font-mono text-xs">{r.bransKodu}</td>
                      <td className="py-1.5 pr-3">{r.bransAdi}</td>
                      <td className="py-1.5 pr-3 text-slate-600">{r.anaBrans}</td>
                      <td className="py-1.5 font-medium">{fmt(r.hedefPrim)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {izleme && (
        <section className="rounded-xl border border-indigo-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Branş dağılım izi — nasıl hesaplandı?
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Tarife hedefinin SATIS_BUTCE satırlarına, oradan seçilen branşa nasıl gittiğini gösterir.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <label className="text-sm">
              Branş
              <input
                type="text"
                value={izlemeBrans}
                onChange={(e) => setIzlemeBrans(e.target.value)}
                className="ml-2 w-20 rounded border border-slate-300 px-2 py-1 font-mono text-sm"
              />
            </label>
            <label className="text-sm">
              Tarife
              <select
                value={izlemeTarife}
                onChange={(e) => setIzlemeTarife(e.target.value)}
                className="ml-2 rounded border border-slate-300 px-2 py-1 text-sm"
              >
                {tarifeRows.map((r) => (
                  <option key={r.tarifeGrubu} value={r.tarifeGrubu}>
                    {r.tarifeGrubu}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={dagitBusy}
              onClick={dagit}
              className="self-end rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 disabled:opacity-50"
            >
              İz tablosunu yenile
            </button>
          </div>
          <div className="mt-4">
            <BransDagitimIzTable iz={izleme} />
          </div>
        </section>
      )}

      {log && log.length > 0 && (
        <details className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-sm">
          <summary className="cursor-pointer font-medium text-amber-900">
            Dağıtım uyarıları ({log.length})
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-amber-950">
            {log.slice(0, 50).map((l, i) => (
              <li key={i}>
                {l.kanal1}/{l.kanal2} · {l.tarifeGrubu}: {l.mesaj}
              </li>
            ))}
          </ul>
        </details>
      )}

      {detay && detay.length > 0 && (
        <details className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <summary className="cursor-pointer font-medium text-slate-800">
            Detay dağıtım ({detay.length} satır)
          </summary>
          <p className="mt-2 text-xs text-slate-500">Kanal × tarife × branş kırılımı</p>
        </details>
      )}
    </div>
  );
}
