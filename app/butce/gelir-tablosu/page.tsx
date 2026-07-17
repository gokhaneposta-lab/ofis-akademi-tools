import type { Metadata } from "next";
import Link from "next/link";
import GelirTablosuClient from "@/components/butce/GelirTablosuClient";
import {
  butceDataDurumu,
  loadAylikPrim,
  loadFaaliyetGiderRows,
  loadKpkKapanisTahmin,
  loadKpkVadeRows,
  loadMizanAylikFullRows,
  loadMizanAylikRows,
  loadMizanRows,
  loadOranAyarlar,
  loadPrimBransEndirekt,
  loadPrimBransHedef,
  loadTarifeBransPayRows,
} from "@/lib/butce/loadData";
import { buildGelirTablosu } from "@/lib/butce/gelir/gelirTablosu";

export const metadata: Metadata = {
  title: "Gelir tablosu",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Uyari({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      {children}
    </div>
  );
}

export default async function GelirTablosuPage() {
  const durum = await butceDataDurumu();

  if (!durum.hasMizan) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Gelir tablosu</h2>
        <Uyari>
          <p className="font-medium">Teknik oran verisi (MIZAN) yok</p>
          <p className="mt-1">
            Önce <strong>Aylık GT</strong> dosyasını içe aktarın — teknik oranlar buradan üretilir.
          </p>
          <Link href="/butce" className="mt-2 inline-block font-medium underline">
            Ana sayfaya git
          </Link>
        </Uyari>
      </div>
    );
  }

  const hedefler = await loadPrimBransHedef();
  if (!hedefler || Object.keys(hedefler).length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Gelir tablosu</h2>
        <Uyari>
          <p className="font-medium">Branş prim hedefi yok</p>
          <p className="mt-1">
            Gelir tablosunun bazı (brüt prim) branş hedeflerinden gelir. Önce{" "}
            <strong>Prim hedefi</strong> sayfasında A motoru ile dağıtın.
          </p>
          <Link href="/butce/prim-hedefi" className="mt-2 inline-block font-medium underline">
            Prim hedefi sayfasına git
          </Link>
        </Uyari>
      </div>
    );
  }

  const [mizan, endirekt, aylikPrim, oranAyar, mizanAylik, mizanAylikFull, tarifeBransPay, kpkVade, kapanisTahmin, faaliyetGider] =
    await Promise.all([
      loadMizanRows(),
      loadPrimBransEndirekt(),
      loadAylikPrim(),
      loadOranAyarlar(),
      loadMizanAylikRows(),
      loadMizanAylikFullRows(),
      loadTarifeBransPayRows(),
      loadKpkVadeRows(),
      loadKpkKapanisTahmin(),
      loadFaaliyetGiderRows(),
    ]);

  const sonuc = buildGelirTablosu({
    mizan,
    butceYili: durum.butceYili,
    primHedefleri: hedefler,
    endirektPrim: endirekt,
    aylikPrim,
    oranAyar,
    mizanAylik,
    mizanAylikFull,
    tarifeBransPay,
    kpkVade,
    kapanisTahmin,
    faaliyetGider,
  });

  return <GelirTablosuClient sonuc={sonuc} hasAylikPrim={aylikPrim != null} />;
}
