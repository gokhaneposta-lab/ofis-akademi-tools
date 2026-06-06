import type { Metadata } from "next";
import { Suspense } from "react";
import ButceLoginForm from "@/components/butce/ButceLoginForm";

export const metadata: Metadata = {
  title: "Bütçe girişi",
  robots: { index: false, follow: false },
};

export default function ButceLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f9] px-4">
      <Suspense>
        <ButceLoginForm />
      </Suspense>
    </div>
  );
}
