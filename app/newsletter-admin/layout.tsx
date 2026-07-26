import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Newsletter Admin — Ofis Akademi",
  robots: { index: false, follow: false },
};

export default function NewsletterAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/newsletter-admin"
            className="text-sm font-semibold text-gray-900"
          >
            Newsletter Admin
          </Link>
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-gray-800"
          >
            Siteye dön
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
