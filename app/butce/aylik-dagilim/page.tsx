import type { Metadata } from "next";
import AylikDagilimClient from "@/components/butce/AylikDagilimClient";
import {
  butceDataDurumu,
  loadAylikPrim,
  loadMizanAylikRows,
  loadPrimBransHedef,
} from "@/lib/butce/loadData";
import { aylikOranlariFromMizan } from "@/lib/butce/prim/mizanAylikOranlari";

export const metadata: Metadata = {
  title: "Aylık dağılım",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AylikDagilimPage() {
  const durum = await butceDataDurumu();
  const hedefler = await loadPrimBransHedef();
  const saved = await loadAylikPrim();
  const mizanAylik = await loadMizanAylikRows();
  const referansYil = saved?.referansYil ?? durum.meta?.mizanYilMax ?? 2024;
  const oranSonuc = aylikOranlariFromMizan(mizanAylik, [referansYil]);

  return (
    <AylikDagilimClient
      initialDurum={{
        hasPrimBransHedef: hedefler != null && Object.keys(hedefler).length > 0,
        hasMizanAylik: durum.hasMizanAylik,
        mizanAylikSatir: durum.mizanAylikSatir,
        butceYili: durum.butceYili,
      }}
      initialReferansYil={referansYil}
      initialGenelOranlar={saved?.genelOranlar ?? oranSonuc.genelOranlar}
      initialOranKaynak={saved?.kaynak ?? oranSonuc.kaynak}
      initialSaved={saved}
    />
  );
}
