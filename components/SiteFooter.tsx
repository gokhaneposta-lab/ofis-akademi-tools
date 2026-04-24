import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import { BLOG_CATEGORIES, getPopularPosts } from "@/lib/blog-posts";

const ACCENT = "#217346";

const quickLinks = [
  { label: "Excel Araçları", href: "/excel-araclari" },
  { label: "Eğitimler", href: "/egitimler" },
  { label: "Blog", href: "/blog" },
  { label: "Formül Kütüphanesi", href: "/formul-kutuphanesi" },
  { label: "Finans & Sigorta", href: "/finans-sigorta" },
  { label: "Ücretsiz Kaynaklar", href: "/kaynaklar" },
];

export default function SiteFooter() {
  const popularPosts = getPopularPosts(5);

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Üst grid: Marka + Hızlı + Popüler Konular + Bülten */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-3">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ background: ACCENT }}
              >
                OA
              </span>
              <span className="text-sm font-bold text-gray-900">Ofis Akademi</span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed">
              Excel ve veri analizi becerilerini geliştirmek isteyenler için
              ücretsiz araçlar, eğitimler ve rehberler sunan bağımsız bir
              eğitim platformu.
            </p>

            {/* İletişim */}
            <div className="mt-5 space-y-2">
              <p className="text-xs text-gray-600">
                <span className="font-medium text-gray-800">Gökhan Yıldırım</span>
                <br />
                <span className="text-gray-500">Ofis Akademi Kurucusu</span>
              </p>
              <a
                href="mailto:gokhaneposta@gmail.com"
                className="flex items-center gap-2 text-xs text-gray-600 transition hover:text-emerald-700"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                gokhaneposta@gmail.com
              </a>
              <a
                href="https://www.linkedin.com/in/gokhan-y%C4%B1ld%C4%B1r%C4%B1m-72276551/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-gray-600 transition hover:text-emerald-700"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn Profilim
              </a>
            </div>
          </div>

          {/* Hızlı Bağlantılar */}
          <div className="md:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Hızlı Bağlantılar
            </p>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-gray-600 transition hover:text-emerald-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popüler Konular */}
          <div className="md:col-span-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Popüler Konular
            </p>
            <ul className="space-y-2">
              {BLOG_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/blog/kategori/${cat.slug}`}
                    className="text-xs text-gray-600 transition hover:text-emerald-700"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>

            {popularPosts.length > 0 && (
              <>
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Öne Çıkan Rehberler
                </p>
                <ul className="space-y-1.5">
                  {popularPosts.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="text-xs text-gray-600 transition hover:text-emerald-700 line-clamp-1"
                        title={p.title}
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4">
            <NewsletterForm variant="footer" source="footer" />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-gray-100 pt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400">
            © {new Date().getFullYear()} Ofis Akademi · Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/gizlilik"
              className="text-[11px] text-gray-500 hover:text-emerald-700 underline-offset-2 hover:underline"
            >
              Gizlilik Politikası
            </Link>
            <p className="text-[11px] text-gray-400">
              Excel & Veri Analizi ile ofis hayatını kolaylaştır.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
