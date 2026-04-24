import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site";

const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: "Gizlilik Politikası — Ofis Akademi",
  description:
    "Ofis Akademi gizlilik politikası: hangi verileri topluyoruz, neden topluyoruz, nasıl saklıyoruz ve kullanıcı haklarınız.",
  alternates: {
    canonical: `${BASE_URL}/gizlilik`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Gizlilik Politikası — Ofis Akademi",
    description:
      "Ofis Akademi gizlilik politikası ve KVKK aydınlatma metni.",
    url: `${BASE_URL}/gizlilik`,
    type: "article",
    locale: "tr_TR",
  },
};

const UPDATED_AT = "25 Nisan 2026";

export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200"
            aria-label="Ana Sayfa"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Gizlilik Politikası</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="mb-2 text-xs text-gray-500">Son güncelleme: {UPDATED_AT}</p>
        <p className="mb-8 text-sm text-gray-600">
          Bu metin, <strong>www.ofisakademi.com</strong> sitesini kullanan ziyaretçilerin
          ve bültene abone olan kişilerin kişisel verilerinin nasıl işlendiğini açıklar.
          KVKK 6698 sayılı kanun kapsamında aydınlatma yükümlülüğümüzü yerine getirir.
        </p>

        <article className="space-y-8 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="mb-2 text-base font-bold text-gray-900">
              1. Veri sorumlusu
            </h2>
            <p>
              Veri sorumlusu: <strong>Gökhan Yıldırım</strong> — Ofis Akademi (bireysel,
              ticari amaç gütmeyen eğitim platformu).
              <br />
              İletişim: <a href="mailto:gokhaneposta@gmail.com" className="text-emerald-700 underline">
                gokhaneposta@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-gray-900">
              2. Hangi verileri topluyoruz?
            </h2>
            <ul className="list-inside list-disc space-y-1.5">
              <li>
                <strong>Bültene abone olduğunuzda:</strong> e-posta adresiniz ve formu
                doldurduğunuz sayfanın adı (analitik amaçla — örn. &quot;footer&quot;,
                &quot;blog-inline&quot;).
              </li>
              <li>
                <strong>Site ziyaretinizde:</strong> Vercel sunucularına otomatik düşen
                anonim teknik kayıtlar (IP, tarayıcı türü, ziyaret edilen sayfa).
              </li>
              <li>
                <strong>Çerezler:</strong> Yalnızca temel teknik çerezler. Üçüncü taraf
                reklam çerezi <em>kullanmıyoruz</em>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-gray-900">
              3. Verilerinizi neden işliyoruz?
            </h2>
            <ul className="list-inside list-disc space-y-1.5">
              <li>
                Bülten gönderimi, hoş geldin e-postası ve yeni içerik bildirimleri için
                (açık rızanıza dayanır).
              </li>
              <li>
                Site performansını ölçmek, hangi içeriklerin işe yaradığını anlamak için
                (meşru menfaat).
              </li>
              <li>
                Yasal zorunluluklar gerektirdiğinde (örn. yetkili kurum talebi) saklanır
                veya paylaşılır.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-gray-900">
              4. Verileriniz kimlerle paylaşılır?
            </h2>
            <p className="mb-2">
              Verilerinizi <strong>asla satmıyoruz</strong>. Yalnızca aşağıdaki teknik
              servis sağlayıcılarla paylaşılır:
            </p>
            <ul className="list-inside list-disc space-y-1.5">
              <li>
                <strong>Vercel</strong> (ABD/AB) — site barındırma ve teknik kayıtlar.
              </li>
              <li>
                <strong>Resend</strong> (ABD) — e-posta gönderimi ve abone listesi
                yönetimi.
              </li>
              <li>
                <strong>Google Search Console &amp; Bing Webmaster Tools</strong> —
                yalnızca anonim arama performansı verisi (e-postanız bunlara gönderilmez).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-gray-900">
              5. Verilerinizi ne kadar saklıyoruz?
            </h2>
            <p>
              Bülten aboneliğiniz devam ettiği sürece e-posta adresiniz Resend abone
              listesinde saklanır. Aboneliğinizi iptal ettiğinizde veriniz silinir.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-gray-900">
              6. KVKK kapsamındaki haklarınız
            </h2>
            <p className="mb-2">KVKK madde 11 uyarınca:</p>
            <ul className="list-inside list-disc space-y-1.5">
              <li>Verinizin işlenip işlenmediğini öğrenme,</li>
              <li>Hangi amaçla işlendiğini öğrenme,</li>
              <li>Düzeltme veya silme isteme,</li>
              <li>İşleme itiraz etme hakkınız vardır.</li>
            </ul>
            <p className="mt-2">
              Tüm bu talepleriniz için bize{" "}
              <a href="mailto:gokhaneposta@gmail.com" className="text-emerald-700 underline">
                gokhaneposta@gmail.com
              </a>{" "}
              adresinden yazabilirsiniz. En geç <strong>30 gün</strong> içinde dönüş yapılır.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-gray-900">
              7. Bültenden çıkmak istiyorum
            </h2>
            <p>
              Her bülten e-postasının altında <strong>tek tıkla abonelikten çık</strong>{" "}
              linki bulunur. Alternatif olarak yukarıdaki e-postaya yazarak da çıkış
              talep edebilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-gray-900">
              8. Bu politika değişebilir
            </h2>
            <p>
              İçerik veya servisler değiştikçe bu sayfa güncellenir. Önemli değişiklikleri
              bülten abonelerine ayrıca bildiririz.
            </p>
          </section>
        </article>

        <p className="mt-10 border-t border-gray-200 pt-6 text-xs text-gray-500">
          Bu metin bilgilendirme amaçlıdır ve hukuki tavsiye yerine geçmez. Spesifik bir
          uyumluluk gereksiniminiz varsa lütfen bir avukatla görüşün.
        </p>
      </main>
    </div>
  );
}
