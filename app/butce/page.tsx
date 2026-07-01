import type { Metadata } from "next";
import Link from "next/link";
import { butceDataDurumu } from "@/lib/butce/loadData";
import { oranKalemListesi } from "@/lib/butce/oran/mizanOranlar";

export const metadata: Metadata = {
  title: "Bütçe — ana sayfa",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STEPS = [
  { href: "/butce/veri-yukle", title: "1. Veri yükleme", desc: "Bütçe için gerekli iş verilerini yükle", needs: "Hedef, dağılım, mizan, sabit tanımlar" },
  { href: "/butce/prim-hedefi", title: "2. Prim hedefi", desc: "Tarife hedefi → 7xx branş hedefi", needs: "Bütçe Prim Hedefi + Tarife-Branş Dağılımı" },
  { href: "/butce/aylik-dagilim", title: "3. Aylık dağılım", desc: "Yıllık branş hedefi → 12 ay", needs: "Prim hedefi + Aylık GT mizanı" },
  { href: "/butce/oranlar", title: "4. Teknik oranlar", desc: "Gerçekleşen veriden oran kontrolü", needs: "Aylık GT ve Bilanço Mizanı" },
  { href: "/butce/gelir-tablosu", title: "5. Gelir tablosu", desc: "Prim ve oranlardan GT projeksiyonu", needs: "Oranlar + prim" },
  { href: "/butce/bilanco", title: "6. Bilanço", desc: "Bilanço projeksiyonu", needs: "Aylık mizan + gelir tablosu" },
  { href: "/butce/export", title: "7. Excel export", desc: "Rapor indir", needs: "Tamamlanmış adımlar" },
];

export default async function ButceHomePage() {
  const durum = await butceDataDurumu();
  const kalemSayisi = oranKalemListesi().length;
  const meta = durum.meta;

  const mizanOzet = durum.hasMizan
    ? `${meta?.mizanYilMin}–${meta?.mizanYilMax}, ${durum.mizanSatir.toLocaleString("tr-TR")} satır`
    : undefined;
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
        <strong>Bütçe GT modülü:</strong> Önce gerekli iş verilerini yükleyin, sonra sırasıyla prim
        hedefi, aylık dağılım, teknik oranlar, gelir tablosu ve bilanço kontrollerini yapın.
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Veri durumu</h2>
        <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Yıl-sonu mizan</dt>
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
            <dt className="text-slate-500">Tarife-branş dağılımı</dt>
            {durumRozet(durum.hasTarifeBransPay, `${durum.tarifeBransPaySatir.toLocaleString("tr-TR")} satır`)}
          </div>
          <div>
            <dt className="text-slate-500">KPK vade tanımları</dt>
            {durumRozet(durum.hasKpkVade, `${durum.kpkVadeSatir.toLocaleString("tr-TR")} branş`)}
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

      <Link
        href="/butce/veri-yukle"
        className="block rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
      >
        Veri yükleme sayfasına git
      </Link>

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
