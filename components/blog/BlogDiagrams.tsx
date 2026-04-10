/** Basit, erişilebilir SVG şemalar — blog içeriği için (TFRS 17 vb.). */

export function Tfrs17PolicyCoverageDiagram() {
  const titleId = "tfrs17-policy-coverage-title";
  return (
    <figure className="my-6 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-white p-4 sm:p-5">
      <figcaption id={titleId} className="mb-3 text-sm font-semibold text-gray-900">
        Poliçe kapsamı ve zaman ekseni (kavramsal)
      </figcaption>
      <svg
        role="img"
        aria-labelledby={titleId}
        viewBox="0 0 640 200"
        className="h-auto w-full max-h-[220px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Poliçe başlangıcı, kapsam dönemi ve olası hasar zamanı</title>
        <defs>
          <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        <rect x="24" y="88" width="592" height="36" rx="8" fill="url(#barGrad)" stroke="#34d399" strokeWidth="1.5" />
        <text x="40" y="72" className="fill-gray-700 text-[13px]" fontFamily="system-ui,sans-serif" fontSize="13">
          Poliçe başlangıcı
        </text>
        <text x="280" y="72" className="fill-gray-800 text-[13px] font-semibold" fontFamily="system-ui,sans-serif" fontSize="13">
          Risk kapsamı (poliçe süresi)
        </text>
        <text x="480" y="72" className="fill-gray-700 text-[13px]" fontFamily="system-ui,sans-serif" fontSize="13">
          Vade / yenileme
        </text>
        <circle cx="56" cy="106" r="10" fill="#047857" />
        <text x="52" y="110" fill="white" fontSize="12" fontFamily="system-ui,sans-serif" fontWeight="bold">
          1
        </text>
        <text x="44" y="148" className="fill-gray-600 text-[11px]" fontFamily="system-ui,sans-serif" fontSize="11">
          Sözleşme aktif
        </text>
        <path d="M 320 44 L 320 80" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="4 3" />
        <polygon points="320,36 314,44 326,44" fill="#6b7280" />
        <text x="332" y="42" className="fill-gray-700 text-[12px]" fontFamily="system-ui,sans-serif" fontSize="12">
          Hasar / olay bu aralıkta oluşabilir
        </text>
        <rect x="400" y="96" width="72" height="20" rx="4" fill="#fbbf24" fillOpacity="0.35" stroke="#d97706" />
        <text x="408" y="110" className="fill-gray-800 text-[10px]" fontFamily="system-ui,sans-serif" fontSize="10">
          Örnek: tahsilat
        </text>
      </svg>
      <p className="mt-2 text-xs text-gray-500">
        Nakit (tahsilat) ile muhasebe döneminde tanınan hizmet sonucu aynı güne denk gelmeyebilir; TFRS 17 bu uyumu tabloda ayrıştırır.
      </p>
    </figure>
  );
}

export function Tfrs17PremiumFlowDiagram() {
  const titleId = "tfrs17-premium-flow-title";
  return (
    <figure className="my-6 rounded-2xl border border-sky-200 bg-gradient-to-b from-sky-50/80 to-white p-4 sm:p-5">
      <figcaption id={titleId} className="mb-3 text-sm font-semibold text-gray-900">
        Prim tahsilatı ile tabloya yansıma (basitleştirilmiş akış)
      </figcaption>
      <svg
        role="img"
        aria-labelledby={titleId}
        viewBox="0 0 640 240"
        className="h-auto w-full max-h-[280px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Tahsilat nakit akışı ve gelir tablosunda hizmet sonucu</title>
        <rect x="32" y="32" width="140" height="56" rx="10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
        <text x="102" y="58" textAnchor="middle" className="fill-gray-900 text-[12px] font-semibold" fontFamily="system-ui,sans-serif" fontSize="12">
          Müşteri öder
        </text>
        <text x="102" y="76" textAnchor="middle" className="fill-gray-600 text-[10px]" fontFamily="system-ui,sans-serif" fontSize="10">
          (tahsilat)
        </text>
        <defs>
          <marker id="tfrs17pf-arrowBlue" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#0369a1" />
          </marker>
        </defs>
        <path d="M 180 60 L 248 60" stroke="#0369a1" strokeWidth="2" markerEnd="url(#tfrs17pf-arrowBlue)" />
        <rect x="256" y="32" width="160" height="56" rx="10" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
        <text x="336" y="58" textAnchor="middle" className="fill-gray-900 text-[12px] font-semibold" fontFamily="system-ui,sans-serif" fontSize="12">
          Nakit / alacak
        </text>
        <text x="336" y="76" textAnchor="middle" className="fill-gray-600 text-[10px]" fontFamily="system-ui,sans-serif" fontSize="10">
          bilanço tarafı
        </text>
        <path d="M 336 96 L 336 118" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="3 3" />
        <rect x="220" y="128" width="232" height="88" rx="12" fill="#f9fafb" stroke="#9ca3af" strokeWidth="1.5" />
        <text x="336" y="152" textAnchor="middle" className="fill-gray-900 text-[11px] font-semibold" fontFamily="system-ui,sans-serif" fontSize="11">
          TFRS 17 — dönem içi tanıma
        </text>
        <text x="336" y="174" textAnchor="middle" className="fill-gray-600 text-[10px]" fontFamily="system-ui,sans-serif" fontSize="10">
          Hizmet sunumu ile orantılı gelir / gider etkileri
        </text>
        <text x="336" y="198" textAnchor="middle" className="fill-gray-500 text-[9px]" fontFamily="system-ui,sans-serif" fontSize="9">
          (CSM itfa, risk ayarlaması vb. — şirket politikasına göre değişir)
        </text>
        <text x="480" y="168" className="fill-gray-500 text-[10px]" fontFamily="system-ui,sans-serif" fontSize="10">
          ← Gelir tablosu
        </text>
      </svg>
      <p className="mt-2 text-xs text-gray-500">
        Tahsilatın yapıldığı ay ile gelirin tabloda göründüğü dönem birebir örtüşmeyebilir; bu ayrım sigorta çalışanları için rapor yorumunda kritiktir.
      </p>
    </figure>
  );
}

/** Eşit aylık itfa varsayımı: 12 ay × 20 TL (hayali CSM 240 TL). */
export function Tfrs17CsmAmortizationDiagram() {
  const titleId = "tfrs17-csm-bars-title";
  const barW = 38;
  const gap = 6;
  const baseY = 168;
  const maxH = 90;
  const startX = 32;
  return (
    <figure className="my-6 rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50/80 to-white p-4 sm:p-5">
      <figcaption id={titleId} className="mb-3 text-sm font-semibold text-gray-900">
        Beklenen kârın aylara yayılması (eşit itfa — illüstrasyon)
      </figcaption>
      <svg
        role="img"
        aria-labelledby={titleId}
        viewBox="0 0 640 220"
        className="h-auto w-full max-h-[260px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>On iki ay boyunca her ay yirmi TL eşit itfa sütun grafiği</title>
        <defs>
          <linearGradient id="tfrs17csmBar" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <text x="320" y="28" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="12" fill="#4b5563">
          Her sütun: dönemde gelire yansıyan itfa (ör. 20 TL)
        </text>
        {Array.from({ length: 12 }, (_, i) => {
          const x = startX + i * (barW + gap);
          const h = maxH;
          const y = baseY - h;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={h} rx={4} fill="url(#tfrs17csmBar)" stroke="#6d28d9" strokeWidth={1} />
              <text x={x + barW / 2} y={baseY + 18} textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="11" fill="#374151">
                {i + 1}
              </text>
            </g>
          );
        })}
        <text x="320" y="206" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="11" fill="#6b7280">
          Ay (1–12)
        </text>
      </svg>
      <p className="mt-2 text-xs text-gray-500">
        Gerçek uygulamada itfa hızı kapsam birimlerine göre değişir; bu grafik yalnızca “neden düzgün dağılıyor gibi görünüyor?” sezgisini destekler.
      </p>
    </figure>
  );
}
