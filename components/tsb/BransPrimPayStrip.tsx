"use client";

import type { BransPayDilim } from "@/lib/tsbBransDegisim";

const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

/** Aynı etiket her zaman aynı renk (iki grafikte eşleşir) */
export function renkForEtiket(etiket: string): string {
  let h = 2166136261;
  for (let i = 0; i < etiket.length; i++) {
    h ^= etiket.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 58% 48%)`;
}

function stripFromPay(items: BransPayDilim[], key: "sirketPay" | "sektorPay"): { etiket: string; pay: number }[] {
  const raw = items.map((x) => ({
    etiket: x.etiket,
    pay: Math.max(0, Number.isFinite(x[key]) ? x[key] : 0),
  }));
  const sum = raw.reduce((a, x) => a + x.pay, 0);
  if (sum <= 0) return raw.map((x) => ({ ...x, pay: 0 }));
  return raw.map((x) => ({ etiket: x.etiket, pay: (x.pay / sum) * 100 }));
}

function PayStrip({
  title,
  items,
  payKey,
}: {
  title: string;
  items: BransPayDilim[];
  payKey: "sirketPay" | "sektorPay";
}) {
  const norm = stripFromPay(items, payKey);
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold text-gray-800">{title}</p>
      <div className="flex h-9 w-full overflow-hidden rounded-md border border-gray-200 shadow-inner">
        {norm.map((x) =>
          x.pay > 0.05 ? (
            <div
              key={x.etiket}
              className="min-w-0 shrink-0 border-r border-white/40 last:border-r-0"
              style={{
                width: `${x.pay}%`,
                backgroundColor: renkForEtiket(x.etiket),
              }}
              title={`${x.etiket}: %${pf.format(x.pay)}`}
            />
          ) : null,
        )}
      </div>
    </div>
  );
}

/** Tablo ile aynı kırılımda şirket vs sektör üretim payı — %100 yığılmış şerit */
export default function BransPrimPayStrip({
  dilimler,
  sirketAdi,
  donemEtiket,
}: {
  dilimler: BransPayDilim[];
  sirketAdi: string;
  /** Gösterilen tek dönem (örn. 2024-06); verilmezse metinde “bu dönem” kullanılır */
  donemEtiket?: string;
}) {
  if (dilimler.length === 0) return null;

  const siralıDilim = [...dilimler].sort((a, b) => b.sektorPay - a.sektorPay);
  const donemMetni = donemEtiket?.trim() ? donemEtiket.trim() : "bu dönem";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Üretim payları ({donemMetni})
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-gray-600">
        Solda <strong>{sirketAdi}</strong> portföyündeki dağılım, sağda aynı kırılımda <strong>sektör</strong>; aynı kategori
        her iki şeritte <strong>aynı renk</strong>. Çok dilimde pasta yerine okunabilirlik için{" "}
        <strong>%100 yığılmış şerit</strong> kullanıldı. Aşağıda her satır için şirket ve sektör yüzdeleri birlikte verilir.
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <PayStrip title={`Şirket — ${sirketAdi}`} items={dilimler} payKey="sirketPay" />
        <PayStrip title="Sektör" items={dilimler} payKey="sektorPay" />
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-gray-100 pt-3 text-[10px] text-gray-700">
        {siralıDilim.map(({ etiket, sirketPay, sektorPay }) => (
          <li key={etiket} className="flex max-w-full flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: renkForEtiket(etiket) }} />
            <span className="max-w-[14rem] truncate font-medium" title={etiket}>
              {etiket}
            </span>
            <span className="tabular-nums text-gray-500">
              Şirket %{pf.format(sirketPay)} · Sektör %{pf.format(sektorPay)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
