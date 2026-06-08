import type { Metadata } from "next";
import ButceUploadMizan from "@/components/butce/ButceUploadMizan";
import { butceDataDurumu } from "@/lib/butce/loadData";
import { oranKalemListesi } from "@/lib/butce/oran/mizanOranlar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bütçe — ana sayfa",
  robots: { index: false, follow: false },
};

const STEPS = [
  { href: "/butce/prim-hedefi", title: "1. Prim hedefi", desc: "SATIS_BUTCE → 7xx dağıtım" },
  { href: "/butce/aylik-dagilim", title: "2. Aylık dağılım", desc: "Yıllık hedef → 12 ay" },
  { href: "/butce/oranlar", title: "3. Teknik oranlar", desc: "MIZAN → GT oranları (Faz 1)" },
  { href: "/butce/gelir-tablosu", title: "4. Gelir tablosu", desc: "baz × oran tahmin" },
  { href: "/butce/bilanco", title: "5. Bilanço", desc: "GT türevi" },
  { href: "/butce/export", title: "6. Excel export", desc: "Rapor indir" },
];

export default function ButceHomePage() {
  const durum = butceDataDurumu();
  const kalemSayisi = oranKalemListesi().length;

  return (
    <div className="space-y-5">
      <ButceUploadMizan hasMizan={durum.hasMizan} butceYili={durum.butceYili} />

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Veri durumu</h2>
        <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">MIZAN</dt>
            <dd className="font-medium text-emerald-800">
              {durum.hasMizan
                ? `${durum.meta?.mizanYilMin}–${durum.meta?.mizanYilMax} · ${durum.mizanSatir} satır`
                : "— yükleyin"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Bütçe yılı</dt>
            <dd className="font-medium">{durum.butceYili}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Oran kalemleri</dt>
            <dd className="font-medium">{kalemSayisi} kalem tanımlı</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">İş akışı</h2>
        <ol className="mt-3 space-y-2">
          {STEPS.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="block rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50">
                <span className="font-medium text-slate-900">{s.title}</span>
                <span className="ml-2 text-sm text-slate-500">{s.desc}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
