import type { Metadata } from "next";
import Link from "next/link";
import ButceUploadGuide from "@/components/butce/ButceUploadGuide";
import ButceUploadMizan from "@/components/butce/ButceUploadMizan";
import { butceDataDurumu } from "@/lib/butce/loadData";
import { oranKalemListesi } from "@/lib/butce/oran/mizanOranlar";
import { BUTCE_MAP_TARIFE_SPEC, BUTCE_PRIM_SPEC } from "@/lib/butce/uploadSpecs";

export const metadata: Metadata = {
  title: "Bütçe — ana sayfa",
  robots: { index: false, follow: false },
};

const STEPS = [
  { href: "/butce/prim-hedefi", title: "2. Prim hedefi", desc: "SATIS_BUTCE → 7xx dağıtım", needs: "SATIS_BUTCE_ + TARIFE_MAP" },
  { href: "/butce/aylik-dagilim", title: "3. Aylık dağılım", desc: "Yıllık hedef → 12 ay", needs: "Prim hedefi" },
  { href: "/butce/oranlar", title: "4. Teknik oranlar", desc: "MIZAN → GT oranları", needs: "MIZAN" },
  { href: "/butce/gelir-tablosu", title: "5. Gelir tablosu", desc: "baz × oran tahmin", needs: "Oranlar + prim" },
  { href: "/butce/bilanco", title: "6. Bilanço", desc: "GT türevi", needs: "Gelir tablosu" },
  { href: "/butce/export", title: "7. Excel export", desc: "Rapor indir", needs: "Tamamlanmış adımlar" },
];

export default async function ButceHomePage() {
  const durum = await butceDataDurumu();
  const kalemSayisi = oranKalemListesi().length;

  const mizanOzet = durum.hasMizan
    ? `${durum.meta?.mizanYilMin}–${durum.meta?.mizanYilMax}, ${durum.mizanSatir.toLocaleString("tr-TR")} satır`
    : undefined;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-950">
        <strong>Başlangıç:</strong> Önce MIZAN yükleyin → ardından{" "}
        <Link href="/butce/oranlar" className="font-medium underline">
          Teknik oranlar
        </Link>{" "}
        sayfasında branş oranlarını kontrol edin. Diğer adımlar (prim hedefi, GT) sırayla eklenecek.
      </section>

      <ButceUploadMizan
        hasMizan={durum.hasMizan}
        butceYili={durum.butceYili}
        mizanOzet={mizanOzet}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-sm font-semibold text-slate-900">Diğer veri dosyaları (yakında)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Aynı <strong>BUTCE_MAP.xlsx</strong> içindeki TARIFE_MAP ve ayrı bütçe Excel&apos;indeki
          SATIS_BUTCE_ sayfaları prim dağıtımı için kullanılacak — import henüz bu sürümde yok.
        </p>
        <div className="mt-3 space-y-2">
          <ButceUploadGuide spec={BUTCE_MAP_TARIFE_SPEC} />
          <ButceUploadGuide spec={BUTCE_PRIM_SPEC} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Veri durumu</h2>
        <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">MIZAN</dt>
            <dd className="font-medium text-emerald-800">
              {durum.hasMizan ? mizanOzet : "— henüz yüklenmedi"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Bütçe yılı</dt>
            <dd className="font-medium">{durum.butceYili}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Oran kalemleri (tanım)</dt>
            <dd className="font-medium">{kalemSayisi} kalem</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">İş akışı</h2>
        <ol className="mt-3 space-y-2">
          {STEPS.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="block rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
              >
                <span className="font-medium text-slate-900">{s.title}</span>
                <span className="ml-2 text-sm text-slate-500">{s.desc}</span>
                <span className="mt-0.5 block text-xs text-slate-400">Gerekli: {s.needs}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
