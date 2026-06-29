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

export const dynamic = "force-dynamic";

const STEPS = [
  { href: "/butce/prim-hedefi", title: "2. Prim hedefi", desc: "SATIS_BUTCE → 7xx dağıtım", needs: "SATIS_BUTCE_ + TARIFE_MAP" },
  { href: "/butce/aylik-dagilim", title: "3. Aylık dağılım", desc: "Yıllık hedef → 12 ay", needs: "Prim hedefi" },
  { href: "/butce/oranlar", title: "4. Teknik oranlar", desc: "MIZAN → GT oranları", needs: "Aylık GT" },
  { href: "/butce/gelir-tablosu", title: "5. Gelir tablosu", desc: "baz × oran tahmin", needs: "Oranlar + prim" },
  { href: "/butce/bilanco", title: "6. Bilanço", desc: "GT türevi", needs: "Gelir tablosu" },
  { href: "/butce/export", title: "7. Excel export", desc: "Rapor indir", needs: "Tamamlanmış adımlar" },
];

export default async function ButceHomePage() {
  const durum = await butceDataDurumu();
  const kalemSayisi = oranKalemListesi().length;
  const meta = durum.meta;

  const mizanOzet = durum.hasMizan
    ? `${meta?.mizanYilMin}–${meta?.mizanYilMax}, ${durum.mizanSatir.toLocaleString("tr-TR")} satır`
    : undefined;
  const mizanGtKaynak = meta?.mizanKaynak === "aylik-gt-koprusu";
  const aylikOzet = durum.hasMizanAylik
    ? `${meta?.mizanAylikYilMin}–${meta?.mizanAylikYilMax}, ${durum.mizanAylikSatir.toLocaleString("tr-TR")} satır`
    : undefined;
  const bilancoSatir = meta?.bilancoAylikSatirSayisi ?? 0;

  const durumRozet = (ok: boolean, text?: string) =>
    ok ? (
      <dd className="font-medium text-emerald-800">{text}</dd>
    ) : (
      <dd className="font-medium text-slate-400">— henüz yok</dd>
    );

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-950">
        <strong>Tek veri kaynağı:</strong> <strong>Aylık GT ve Bilanço.xlsx</strong> dosyası yerel
        script ile içe aktarılır ({" "}
        <code className="rounded bg-blue-100 px-1">npm run butce:import-aylik-gt</code>) ve tek seferde{" "}
        <em>yıl-sonu mizan (teknik oranlar), aylık prim dağılımı ve bilanço</em> verilerini üretir.
        Ayrıca sadece <strong>Tarife Map</strong> ve <strong>Bütçe Hedefi (SATIS_BUTCE_)</strong>{" "}
        yüklenir. Geçmiş ayrı MIZAN/üretim yüklemelerine gerek yok.
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Veri durumu</h2>
        <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Yıl-sonu MIZAN {mizanGtKaynak ? "(aylık GT köprüsü)" : ""}</dt>
            {durumRozet(durum.hasMizan, mizanOzet)}
          </div>
          <div>
            <dt className="text-slate-500">Aylık prim (GT)</dt>
            {durumRozet(durum.hasMizanAylik, aylikOzet)}
          </div>
          <div>
            <dt className="text-slate-500">Bilanço (aylık)</dt>
            {durumRozet(bilancoSatir > 0, `${bilancoSatir.toLocaleString("tr-TR")} satır`)}
          </div>
          <div>
            <dt className="text-slate-500">Tarife Map</dt>
            {durumRozet(durum.hasTarifeMap, `${durum.tarifeMapSatir.toLocaleString("tr-TR")} satır`)}
          </div>
          <div>
            <dt className="text-slate-500">Bütçe Hedefi (SATIS_BUTCE_)</dt>
            {durumRozet(durum.hasSatisButce, `${durum.satisButceSatir.toLocaleString("tr-TR")} satır`)}
          </div>
          <div>
            <dt className="text-slate-500">Bütçe yılı / oran kalemleri</dt>
            <dd className="font-medium">{durum.butceYili} · {kalemSayisi} kalem</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-sm font-semibold text-slate-900">Web&apos;den yüklenecekler</h2>
        <p className="mt-1 text-sm text-slate-600">
          Tarife Map ve Bütçe Hedefi küçük dosyalardır —{" "}
          <Link href="/butce/prim-hedefi" className="font-medium underline">
            Prim hedefi
          </Link>{" "}
          sayfasından yükleyin. (Aylık GT ve Bilanço dosyası boyut nedeniyle yerel script ile içe aktarılır.)
        </p>
        <div className="mt-3 space-y-2">
          <ButceUploadGuide spec={BUTCE_MAP_TARIFE_SPEC} />
          <ButceUploadGuide spec={BUTCE_PRIM_SPEC} />
        </div>
        <details className="mt-3 text-xs text-slate-500">
          <summary className="cursor-pointer">Alternatif: ayrı BUTCE_MAP MIZAN web yüklemesi (eski yöntem)</summary>
          <div className="mt-2">
            <ButceUploadMizan
              hasMizan={durum.hasMizan}
              butceYili={durum.butceYili}
              mizanOzet={mizanOzet}
            />
          </div>
        </details>
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
