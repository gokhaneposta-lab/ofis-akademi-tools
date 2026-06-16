import type { Metadata } from "next";
import { cookies } from "next/headers";
import ButceNav from "@/components/butce/ButceNav";
import { getButceLoggedInUser } from "@/lib/butce/auth";

export const metadata: Metadata = {
  title: "Bütçe modülü",
  robots: { index: false, follow: false },
};

export default async function ButceLayout({ children }: { children: React.ReactNode }) {
  const loggedInUser = getButceLoggedInUser(await cookies());

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold text-slate-900">Bütçe GT modülü</h1>
        <p className="mt-1 text-sm text-slate-600">
          Bereket Sigorta / Emeklilik — prim hedefi, teknik oranlar, gelir tablosu projeksiyonu.
          Gizli panel.
        </p>
      </header>
      <ButceNav username={loggedInUser} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
