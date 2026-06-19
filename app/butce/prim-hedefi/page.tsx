import type { Metadata } from "next";
import PrimHedefiClient from "@/components/butce/PrimHedefiClient";
import { butceDataDurumu, loadSatisButceRows } from "@/lib/butce/loadData";
import { tarifeOzetFromSatis } from "@/lib/butce/prim/dagitimMotoru";

export const metadata: Metadata = {
  title: "Prim hedefi",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PrimHedefiPage() {
  const durum = await butceDataDurumu();
  const satisRows = await loadSatisButceRows();
  const initialTarifeOzet = satisRows.length > 0 ? tarifeOzetFromSatis(satisRows) : [];

  return (
    <PrimHedefiClient
      key={`${durum.satisButceSatir}-${durum.mizanSatir}`}
      durum={{
        hasMizan: durum.hasMizan,
        hasTarifeMap: durum.hasTarifeMap,
        hasSatisButce: durum.hasSatisButce,
        hasUretim: durum.hasUretim,
        mizanSatir: durum.mizanSatir,
        tarifeMapSatir: durum.tarifeMapSatir,
        satisButceSatir: durum.satisButceSatir,
        uretimSatir: durum.uretimSatir,
        butceYili: durum.butceYili,
      }}
      initialTarifeOzet={initialTarifeOzet}
    />
  );
}
