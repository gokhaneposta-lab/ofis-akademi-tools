"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/butce/veri-yukle", label: "Veri yükleme" },
  { href: "/butce/prim-hedefi", label: "Prim hedefi" },
  { href: "/butce/aylik-dagilim", label: "Aylık dağılım" },
  { href: "/butce/kpk-kapanis", label: "KPK kapanış" },
  { href: "/butce/oranlar", label: "Teknik oranlar" },
  { href: "/butce/gelir-tablosu", label: "Gelir tablosu" },
  { href: "/butce/bilanco", label: "Bilanço" },
  { href: "/butce/export", label: "Excel export" },
];

export default function ButceNav({ username }: { username?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const isLoginPage = pathname === "/butce/login";

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/butce/auth", { method: "DELETE" });
      router.replace("/butce/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  if (isLoginPage) {
    return null;
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
        <div className="flex flex-wrap gap-1">
          {LINKS.map(({ href, label }) => {
            const active = pathname === href || (href !== "/butce" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <div className="flex flex-col items-end">
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60"
          >
            {loggingOut ? "Çıkış…" : "Çıkış"}
          </button>
          {username ? (
            <span className="px-3 text-xs text-slate-500" title="Giriş yapan kullanıcı">
              {username}
            </span>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
