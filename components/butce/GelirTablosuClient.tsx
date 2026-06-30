"use client";

import { useMemo, useState } from "react";
import type { GelirTablosuSonuc } from "@/lib/butce/gelir/gelirTablosu";

function fmt(n: number) {
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString("tr-TR");
}

function huc(n: number) {
  const cls =
    n < -0.5 ? "text-red-700" : n > 0.5 ? "text-slate-800" : "text-slate-400";
  return <span className={cls}>{fmt(n)}</span>;
}

export default function GelirTablosuClient({
  sonuc,
  hasAylikPrim,
}: {
  sonuc: GelirTablosuSonuc;
  hasAylikPrim: boolean;
}) {
  const [gorunum, setGorunum] = useState<"yillik" | "aylik">("yillik");
  const [aylikBrans, setAylikBrans] = useState<string>("TOPLAM");

  const teknikKar = sonuc.toplam[8] ?? 0;
  const brutPrim = sonuc.brutPrimToplam;
  const karMarji = brutPrim > 0 ? teknikKar / brutPrim : 0;

  const aylikData = useMemo(() => {
    if (aylikBrans === "TOPLAM") return sonuc.aylikToplam;
    return sonuc.aylikBrans[aylikBrans] ?? {};
  }, [aylikBrans, sonuc]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Gelir tablosu projeksiyonu — {sonuc.butceYili}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Her kalem = uygun baz (brüt/direkt/endirekt prim) × teknik oran. Excel GT formül yapısı
            (kâr/zarar zinciri) branş bazında değerlendirilir.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setGorunum("yillik")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              gorunum === "yillik" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Yıllık (branş)
          </button>
          <button
            type="button"
            onClick={() => setGorunum("aylik")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              gorunum === "aylik" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Aylık
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Kart baslik="Brüt yazılan prim" deger={fmt(brutPrim)} />
        <Kart
          baslik="Teknik kâr / zarar"
          deger={fmt(teknikKar)}
          renk={teknikKar < 0 ? "text-red-700" : "text-emerald-700"}
        />
        <Kart
          baslik="Teknik kâr marjı"
          deger={`% ${(karMarji * 100).toFixed(1)}`}
          renk={teknikKar < 0 ? "text-red-700" : "text-emerald-700"}
        />
      </div>

      {sonuc.eksikGirdiler.length > 0 && (
        <details className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <summary className="cursor-pointer font-medium">
            Kapsam notu — {sonuc.eksikGirdiler.length} kalem dış girdiye bağlı (V1&apos;de 0)
          </summary>
          <p className="mt-2">
            Aşağıdaki kalemler Excel&apos;de ayrı sayfalardan (Genel Gider, KPK, Nakit Akış, hasar
            alt-kırılım split&apos;leri) gelir; 3 dosyalı modelde olmadıkları için{" "}
            <strong>0</strong> alınır. Bu yüzden teknik sonuç bu kalemler hariç bir{" "}
            <em>çekirdek teknik projeksiyon</em>dur (özellikle personel/yönetim giderleri ve KPK
            değişimi dahil değildir).
          </p>
          <ul className="mt-2 grid gap-x-6 gap-y-0.5 text-xs sm:grid-cols-2">
            {sonuc.eksikGirdiler.map((e) => (
              <li key={e.satir}>
                <span className="font-mono">{e.kod ?? `F${e.satir}`}</span> — {e.ad}
              </li>
            ))}
          </ul>
        </details>
      )}

      {gorunum === "yillik" ? (
        <YillikTablo sonuc={sonuc} />
      ) : (
        <AylikTablo
          sonuc={sonuc}
          aylikBrans={aylikBrans}
          setAylikBrans={setAylikBrans}
          aylikData={aylikData}
          hasAylikPrim={hasAylikPrim}
        />
      )}
    </div>
  );
}

function Kart({ baslik, deger, renk }: { baslik: string; deger: string; renk?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{baslik}</p>
      <p className={`mt-1 text-xl font-semibold ${renk ?? "text-slate-900"}`}>{deger}</p>
    </div>
  );
}

function satirClass(s: GelirTablosuSonuc["satirlar"][number]): string {
  if (s.vurgu) return "bg-slate-900 text-white font-semibold";
  if (s.kalin) return "bg-slate-50 font-semibold text-slate-900";
  return "text-slate-700";
}

function YillikTablo({ sonuc }: { sonuc: GelirTablosuSonuc }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-white text-xs text-slate-500">
              <th className="sticky left-0 z-10 bg-white px-3 py-2 text-left">Kalem</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-700">TOPLAM</th>
              {sonuc.branslar.map((b) => (
                <th key={b.bransKodu} className="whitespace-nowrap px-3 py-2 text-right" title={b.bransAdi}>
                  {b.bransAdi.length > 16 ? `${b.bransAdi.slice(0, 16)}…` : b.bransAdi}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sonuc.satirlar.map((s) => (
              <tr key={s.satir} className={`border-b border-slate-100 ${satirClass(s)}`}>
                <td
                  className={`sticky left-0 z-10 px-3 py-1.5 text-left ${
                    s.vurgu ? "bg-slate-900" : s.kalin ? "bg-slate-50" : "bg-white"
                  }`}
                  style={{ paddingLeft: 12 + s.seviye * 14 }}
                >
                  {s.ad}
                  {s.disGirdi && <span className="ml-1 text-[10px] text-amber-600">●</span>}
                </td>
                <td className="px-3 py-1.5 text-right font-medium tabular-nums">
                  {s.vurgu ? fmt(sonuc.toplam[s.satir] ?? 0) : huc(sonuc.toplam[s.satir] ?? 0)}
                </td>
                {sonuc.branslar.map((b) => (
                  <td key={b.bransKodu} className="px-3 py-1.5 text-right tabular-nums">
                    {s.vurgu ? fmt(b.degerler[s.satir] ?? 0) : huc(b.degerler[s.satir] ?? 0)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="px-3 py-2 text-xs text-slate-400">
        ● dış girdiye bağlı (V1&apos;de 0). Negatif tutarlar gider/indirim olarak kırmızı.
      </p>
    </section>
  );
}

function AylikTablo({
  sonuc,
  aylikBrans,
  setAylikBrans,
  aylikData,
  hasAylikPrim,
}: {
  sonuc: GelirTablosuSonuc;
  aylikBrans: string;
  setAylikBrans: (v: string) => void;
  aylikData: Record<number, number[]>;
  hasAylikPrim: boolean;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-3 py-2">
        <label className="text-sm text-slate-600">
          Branş:{" "}
          <select
            value={aylikBrans}
            onChange={(e) => setAylikBrans(e.target.value)}
            className="ml-1 rounded border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="TOPLAM">TOPLAM (tüm branşlar)</option>
            {sonuc.branslar.map((b) => (
              <option key={b.bransKodu} value={b.bransKodu}>
                {b.bransAdi}
              </option>
            ))}
          </select>
        </label>
        {!hasAylikPrim && (
          <span className="text-xs text-amber-600">
            Aylık prim dağılımı yok — eşit 1/12 varsayımı kullanılıyor.
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-white text-xs text-slate-500">
              <th className="sticky left-0 z-10 bg-white px-3 py-2 text-left">Kalem</th>
              {sonuc.aylar.map((ay) => (
                <th key={ay} className="whitespace-nowrap px-3 py-2 text-right">
                  {ay}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-semibold text-slate-700">Yıl</th>
            </tr>
          </thead>
          <tbody>
            {sonuc.satirlar.map((s) => {
              const aylar = aylikData[s.satir] ?? Array.from({ length: 12 }, () => 0);
              const yil = aylar.reduce((a, b) => a + b, 0);
              return (
                <tr key={s.satir} className={`border-b border-slate-100 ${satirClass(s)}`}>
                  <td
                    className={`sticky left-0 z-10 px-3 py-1.5 text-left ${
                      s.vurgu ? "bg-slate-900" : s.kalin ? "bg-slate-50" : "bg-white"
                    }`}
                    style={{ paddingLeft: 12 + s.seviye * 14 }}
                  >
                    {s.ad}
                  </td>
                  {aylar.map((v, i) => (
                    <td key={i} className="px-3 py-1.5 text-right tabular-nums">
                      {s.vurgu ? fmt(v) : huc(v)}
                    </td>
                  ))}
                  <td className="px-3 py-1.5 text-right font-medium tabular-nums">
                    {s.vurgu ? fmt(yil) : huc(yil)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
