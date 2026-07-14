import type { Metadata } from "next";
import PrimHedefiClient from "@/components/butce/PrimHedefiClient";
import {
  butceDataDurumu,
  loadPrimBransHedefStore,
  loadSatisButceRows,
} from "@/lib/butce/loadData";
import { hydrateTarifeOzet, tarifeOzetFromSatis } from "@/lib/butce/prim/dagitimMotoru";

export const metadata: Metadata = {
  title: "Prim hedefi",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PrimHedefiPage() {
  const durum = await butceDataDurumu();
  const satisRows = await loadSatisButceRows();
  const store = await loadPrimBransHedefStore();
  const baseOzet = satisRows.length > 0 ? tarifeOzetFromSatis(satisRows) : [];
  const initialTarifeOzet = hydrateTarifeOzet(baseOzet, store?.tarifeHedefleri);

  return (
    <PrimHedefiClient
      key={`${durum.satisButceSatir}-${durum.mizanSatir}-${store?.guncellemeIso ?? "none"}`}
      durum={{
        hasMizan: durum.hasMizan,
        hasTarifeMap: durum.hasTarifeMap,
        hasTarifeBransPay: durum.hasTarifeBransPay,
        hasSatisButce: durum.hasSatisButce,
        hasUretim: durum.hasUretim,
        mizanSatir: durum.mizanSatir,
        tarifeMapSatir: durum.tarifeMapSatir,
        tarifeBransPaySatir: durum.tarifeBransPaySatir,
        satisButceSatir: durum.satisButceSatir,
        uretimSatir: durum.uretimSatir,
        butceYili: durum.butceYili,
      }}
      initialTarifeOzet={initialTarifeOzet}
      initialReferans={store?.referansEtiket}
      initialYilAgirliklari={store?.yilAgirliklari}
      excelTarifeOzet={baseOzet}
    />
  );
}
