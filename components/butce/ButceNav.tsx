"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/butce", label: "Ana sayfa" },
  { href: "/butce/prim-hedefi", label: "Prim hedefi" },
  { href: "/butce/aylik-dagilim", label: "Aylık dağılım" },
  { href: "/butce/oranlar", label: "Teknik oranlar" },
  { href: "/butce/gelir-tablosu", label: "Gelir tablosu" },
  { href: "/butce/bilanco", label: "Bilanço" },
  { href: "/butce/export", label: "Excel export" },
];

export default function ButceNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 py-2 sm:px-6">
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
    </nav>
  );
}
