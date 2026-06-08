import type { Metadata } from "next";
import OranlarPanel from "@/components/butce/OranlarPanel";
import { butceDataDurumu } from "@/lib/butce/loadData";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Teknik oranlar",
  robots: { index: false, follow: false },
};

export default function OranlarPage() {
  const durum = butceDataDurumu();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Teknik oranlar</h2>
        <p className="mt-1 text-sm text-slate-600">
          MIZAN geçmişinden branş bazlı GT oranları. Excel GT ağırlıklı yıl birleştirme (Faz 1).
        </p>
      </div>

      {!durum.hasMizan ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-medium">MIZAN verisi yok</p>
          <p className="mt-1">
            <strong>BUTCE_MAP.xlsx</strong> dosyasındaki <code className="rounded bg-amber-100 px-1">MIZAN</code>{" "}
            sayfasını ana sayfadan yükleyin. Kolon düzeni (A=yıl, B=hesap, D=branş, E=tutar) rehberde
            açıklanmıştır.
          </p>
          <Link href="/butce" className="mt-2 inline-block font-medium underline">
            Ana sayfaya git → veri yükle
          </Link>
        </div>
      ) : (
        <OranlarPanel />
      )}
    </div>
  );
}
