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

/** IFRS 17 — PAA vs GMM karar akışı */
export function Tfrs17PaaVsGmmDiagram() {
  const titleId = "tfrs17-paa-vs-gmm-title";
  return (
    <figure className="my-6 rounded-2xl border border-teal-200 bg-gradient-to-b from-teal-50/80 to-white p-4 sm:p-5">
      <figcaption id={titleId} className="mb-3 text-sm font-semibold text-gray-900">
        PAA vs GMM — Hangi model kullanılmalı? (karar akışı)
      </figcaption>
      <svg role="img" aria-labelledby={titleId} viewBox="0 0 640 320" className="h-auto w-full max-h-[340px]" xmlns="http://www.w3.org/2000/svg">
        <title>Kapsama süresine göre PAA ve GMM seçimini gösteren karar akış şeması</title>
        <defs>
          <marker id="paaArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#0f766e" />
          </marker>
        </defs>
        {/* Start */}
        <rect x="240" y="16" width="160" height="48" rx="24" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1.5" />
        <text x="320" y="46" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="13" fontWeight="600" fill="#0f766e">Sözleşme grubu</text>
        {/* Decision: <=1 yıl? */}
        <path d="M 320 64 L 320 96" stroke="#0f766e" strokeWidth="2" markerEnd="url(#paaArrow)" />
        <polygon points="320,100 420,150 320,200 220,150" fill="#f0fdfa" stroke="#14b8a6" strokeWidth="1.5" />
        <text x="320" y="145" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="12" fontWeight="600" fill="#0f766e">Kapsama süresi</text>
        <text x="320" y="162" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="12" fontWeight="600" fill="#0f766e">≤ 1 yıl mı?</text>
        {/* Yes branch */}
        <path d="M 220 150 L 120 150 L 120 220" stroke="#0f766e" strokeWidth="2" markerEnd="url(#paaArrow)" />
        <text x="155" y="142" fontFamily="system-ui,sans-serif" fontSize="11" fill="#0f766e" fontWeight="600">Evet</text>
        <rect x="40" y="224" width="160" height="64" rx="10" fill="#a7f3d0" stroke="#059669" strokeWidth="1.5" />
        <text x="120" y="252" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="13" fontWeight="700" fill="#065f46">PAA</text>
        <text x="120" y="270" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="10" fill="#065f46">Basitleştirilmiş yaklaşım</text>
        {/* No branch */}
        <path d="M 420 150 L 520 150 L 520 220" stroke="#0f766e" strokeWidth="2" markerEnd="url(#paaArrow)" />
        <text x="460" y="142" fontFamily="system-ui,sans-serif" fontSize="11" fill="#0f766e" fontWeight="600">Hayır</text>
        <rect x="440" y="224" width="160" height="64" rx="10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
        <text x="520" y="248" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="12" fontWeight="700" fill="#075985">GMM</text>
        <text x="520" y="264" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="10" fill="#075985">(veya PAA — GMM'e</text>
        <text x="520" y="276" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="10" fill="#075985">yakınsa kanıtla)</text>
      </svg>
      <p className="mt-2 text-xs text-gray-500">
        Karar ağacı basitleştirilmiştir. Gerçek uygulamada sözleşme özellikleri, reasürans ve ölçüm birimi gibi faktörler de değerlendirilir.
      </p>
    </figure>
  );
}

/** IFRS 17 — Risk ayarlaması güven aralığı görseli */
export function Tfrs17RaConfidenceDiagram() {
  const titleId = "tfrs17-ra-confidence-title";
  return (
    <figure className="my-6 rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/80 to-white p-4 sm:p-5">
      <figcaption id={titleId} className="mb-3 text-sm font-semibold text-gray-900">
        Risk Ayarlaması — Güven aralığı yaklaşımı (kavramsal)
      </figcaption>
      <svg role="img" aria-labelledby={titleId} viewBox="0 0 640 260" className="h-auto w-full max-h-[280px]" xmlns="http://www.w3.org/2000/svg">
        <title>Hasar dağılımı çan eğrisi üzerinde beklenen değer, yüzde yetmiş beş güven düzeyi ve risk ayarlaması</title>
        <defs>
          <linearGradient id="raBellFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {/* Axis */}
        <line x1="40" y1="200" x2="600" y2="200" stroke="#6b7280" strokeWidth="1.5" />
        <text x="600" y="220" textAnchor="end" fontFamily="system-ui,sans-serif" fontSize="11" fill="#6b7280">Hasar (TL)</text>
        {/* Bell curve (approx via path) */}
        <path d="M 40 200 C 160 200, 220 40, 320 40 S 480 200, 600 200 Z" fill="url(#raBellFill)" stroke="#6366f1" strokeWidth="1.5" />
        {/* Expected (median) line */}
        <line x1="320" y1="40" x2="320" y2="200" stroke="#4338ca" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="320" y="30" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="11" fontWeight="600" fill="#4338ca">Beklenen değer (100)</text>
        {/* 75% line */}
        <line x1="410" y1="80" x2="410" y2="200" stroke="#059669" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="410" y="72" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="11" fontWeight="600" fill="#059669">%75 güven (110)</text>
        {/* RA bracket */}
        <path d="M 320 220 L 320 232 L 410 232 L 410 220" stroke="#ea580c" strokeWidth="1.5" fill="none" />
        <text x="365" y="250" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="12" fontWeight="700" fill="#c2410c">RA = 10</text>
      </svg>
      <p className="mt-2 text-xs text-gray-500">
        Güven düzeyi büyüdükçe RA (ve LRC) büyür, CSM küçülür. Yöntem ve düzey seçimi şirket politikası ve dipnot açıklamalarının konusudur.
      </p>
    </figure>
  );
}

/** Excel Pivot — alan bölgeleri yerleşim diyagramı */
export function ExcelPivotFieldsDiagram() {
  const titleId = "excel-pivot-fields-title";
  return (
    <figure className="my-6 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-white p-4 sm:p-5">
      <figcaption id={titleId} className="mb-3 text-sm font-semibold text-gray-900">
        PivotTable alan paneli — 4 bölge
      </figcaption>
      <svg role="img" aria-labelledby={titleId} viewBox="0 0 640 320" className="h-auto w-full max-h-[340px]" xmlns="http://www.w3.org/2000/svg">
        <title>Pivot alan panelindeki Filtreler, Sütunlar, Satırlar ve Değerler bölgelerini gösteren yerleşim</title>
        {/* Filter row */}
        <rect x="40" y="16" width="560" height="48" rx="10" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
        <text x="60" y="40" fontFamily="system-ui,sans-serif" fontSize="12" fontWeight="700" fill="#92400e">FİLTRELER</text>
        <text x="60" y="56" fontFamily="system-ui,sans-serif" fontSize="10" fill="#92400e">Tüm rapor için üst filtre — ör. Yıl</text>
        {/* Columns row */}
        <rect x="200" y="80" width="400" height="48" rx="10" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.5" />
        <text x="220" y="104" fontFamily="system-ui,sans-serif" fontSize="12" fontWeight="700" fill="#1d4ed8">SÜTUNLAR</text>
        <text x="220" y="120" fontFamily="system-ui,sans-serif" fontSize="10" fill="#1d4ed8">Çapraz yayılacak kategori — ör. Ay</text>
        {/* Rows + Values */}
        <rect x="40" y="144" width="160" height="144" rx="10" fill="#d1fae5" stroke="#059669" strokeWidth="1.5" />
        <text x="60" y="168" fontFamily="system-ui,sans-serif" fontSize="12" fontWeight="700" fill="#065f46">SATIRLAR</text>
        <text x="60" y="184" fontFamily="system-ui,sans-serif" fontSize="10" fill="#065f46">Dikey gruplama</text>
        <text x="60" y="196" fontFamily="system-ui,sans-serif" fontSize="10" fill="#065f46">ör. Departman,</text>
        <text x="60" y="208" fontFamily="system-ui,sans-serif" fontSize="10" fill="#065f46">Ürün, Bölge</text>
        <rect x="216" y="144" width="384" height="144" rx="10" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5" />
        <text x="236" y="168" fontFamily="system-ui,sans-serif" fontSize="12" fontWeight="700" fill="#5b21b6">DEĞERLER</text>
        <text x="236" y="184" fontFamily="system-ui,sans-serif" fontSize="10" fill="#5b21b6">Toplanan / sayılan sayısal alan — ör. Ciro (TOPLA)</text>
        {/* Sample cells */}
        <g>
          <rect x="244" y="200" width="90" height="24" rx="4" fill="#fff" stroke="#a78bfa" />
          <text x="289" y="216" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="11" fill="#5b21b6">Ciro — TOPLA</text>
          <rect x="344" y="200" width="90" height="24" rx="4" fill="#fff" stroke="#a78bfa" />
          <text x="389" y="216" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="11" fill="#5b21b6">Adet — TOPLA</text>
          <rect x="444" y="200" width="140" height="24" rx="4" fill="#fff" stroke="#a78bfa" />
          <text x="514" y="216" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="11" fill="#5b21b6">Birim Fiyat — ORTALAMA</text>
        </g>
        <text x="320" y="310" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="11" fill="#6b7280">Alanları panelden bu 4 bölgeye sürükleyerek raporunuzu oluşturursunuz.</text>
      </svg>
      <p className="mt-2 text-xs text-gray-500">
        Değer özet fonksiyonu varsayılanda TOPLA'dır; değere sağ tıklayıp Değer Alanı Ayarları ile ORTALAMA, SAY, MAKS vb. değiştirebilirsiniz.
      </p>
    </figure>
  );
}

/** Excel Dashboard — layout diyagramı */
export function ExcelDashboardLayoutDiagram() {
  const titleId = "excel-dashboard-layout-title";
  return (
    <figure className="my-6 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-white p-4 sm:p-5">
      <figcaption id={titleId} className="mb-3 text-sm font-semibold text-gray-900">
        Dashboard yerleşim planı — önerilen taslak
      </figcaption>
      <svg role="img" aria-labelledby={titleId} viewBox="0 0 640 360" className="h-auto w-full max-h-[360px]" xmlns="http://www.w3.org/2000/svg">
        <title>Dashboard için üst KPI şeridi, sol trend, sağ kategori kırılımı ve alt dilimleyici alanı yerleşim planı</title>
        {/* Frame */}
        <rect x="16" y="16" width="608" height="328" rx="14" fill="#ffffff" stroke="#d1d5db" strokeWidth="1.5" />
        {/* KPI cards */}
        <g>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={40 + i * 140} y={32} width={120} height={72} rx="8" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
              <text x={100 + i * 140} y={58} textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="9" fill="#047857">KPI {i + 1}</text>
              <text x={100 + i * 140} y={80} textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="18" fontWeight="700" fill="#065f46">#.###</text>
              <text x={100 + i * 140} y={96} textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="9" fill="#059669">▲ %_,_</text>
            </g>
          ))}
        </g>
        {/* Trend chart area */}
        <rect x="40" y="120" width="280" height="150" rx="10" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.5" />
        <text x="52" y="138" fontFamily="system-ui,sans-serif" fontSize="11" fontWeight="700" fill="#075985">Zaman Trendi</text>
        <text x="52" y="152" fontFamily="system-ui,sans-serif" fontSize="10" fill="#075985">(Çizgi grafik)</text>
        {/* mock line */}
        <path d="M 60 240 L 110 220 L 160 228 L 210 180 L 260 195 L 300 160" stroke="#0ea5e9" strokeWidth="2.5" fill="none" />
        {/* Category chart */}
        <rect x="336" y="120" width="260" height="150" rx="10" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
        <text x="348" y="138" fontFamily="system-ui,sans-serif" fontSize="11" fontWeight="700" fill="#92400e">Kategori Kırılımı</text>
        <text x="348" y="152" fontFamily="system-ui,sans-serif" fontSize="10" fill="#92400e">(Yığılmış sütun)</text>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={360 + i * 44} y={180} width="32" height={60 - i * 8} fill="#f59e0b" />
        ))}
        {/* Slicers area */}
        <rect x="40" y="286" width="556" height="44" rx="10" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="60" y="312" fontFamily="system-ui,sans-serif" fontSize="11" fontWeight="700" fill="#5b21b6">DİLİMLEYİCİLER</text>
        <text x="200" y="312" fontFamily="system-ui,sans-serif" fontSize="10" fill="#5b21b6">Departman · Bölge · Ürün · Zaman Çizelgesi</text>
      </svg>
      <p className="mt-2 text-xs text-gray-500">
        Üstte büyük KPI kartları, solda trend, sağda kırılım, altta etkileşim şeridi — kullanıcı 3 saniyede durumu anlar.
      </p>
    </figure>
  );
}

/** Excel — Slicer + Timeline örneği */
export function ExcelSlicerTimelineDiagram() {
  const titleId = "excel-slicer-timeline-title";
  return (
    <figure className="my-6 rounded-2xl border border-purple-200 bg-gradient-to-b from-purple-50/80 to-white p-4 sm:p-5">
      <figcaption id={titleId} className="mb-3 text-sm font-semibold text-gray-900">
        Dilimleyici (Slicer) ve Zaman Çizelgesi görünümü
      </figcaption>
      <svg role="img" aria-labelledby={titleId} viewBox="0 0 640 220" className="h-auto w-full max-h-[240px]" xmlns="http://www.w3.org/2000/svg">
        <title>Dilimleyici kartları ve zaman çizelgesi bantının Excel dashboard kullanımı</title>
        {/* Slicer box */}
        <rect x="24" y="20" width="280" height="170" rx="10" fill="#fff" stroke="#7c3aed" strokeWidth="1.5" />
        <text x="40" y="44" fontFamily="system-ui,sans-serif" fontSize="12" fontWeight="700" fill="#5b21b6">Departman</text>
        {["Satış", "Pazarlama", "İK", "Finans", "Operasyon"].map((label, i) => {
          const selected = i === 0 || i === 3;
          return (
            <g key={label}>
              <rect x={40 + (i % 3) * 82} y={60 + Math.floor(i / 3) * 44} width="72" height="32" rx="4" fill={selected ? "#7c3aed" : "#f3f4f6"} stroke="#7c3aed" strokeWidth="1" />
              <text x={76 + (i % 3) * 82} y={80 + Math.floor(i / 3) * 44} textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="10" fontWeight="600" fill={selected ? "#fff" : "#374151"}>
                {label}
              </text>
            </g>
          );
        })}
        {/* Timeline box */}
        <rect x="320" y="20" width="296" height="170" rx="10" fill="#fff" stroke="#0284c7" strokeWidth="1.5" />
        <text x="336" y="44" fontFamily="system-ui,sans-serif" fontSize="12" fontWeight="700" fill="#075985">Zaman Çizelgesi — 2026</text>
        {/* Month bars */}
        {["O", "Ş", "M", "N", "M", "H", "T", "A", "E", "E", "K", "A"].map((m, i) => {
          const active = i >= 2 && i <= 5;
          return (
            <g key={i}>
              <rect x={340 + i * 22} y={72} width={18} height={72} rx="3" fill={active ? "#0284c7" : "#e5e7eb"} />
              <text x={349 + i * 22} y={164} textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="9" fill="#6b7280">{m}</text>
            </g>
          );
        })}
        {/* Range handles */}
        <circle cx="340" cy="108" r="6" fill="#fff" stroke="#0284c7" strokeWidth="2" />
        <circle cx="474" cy="108" r="6" fill="#fff" stroke="#0284c7" strokeWidth="2" />
        <text x="468" y="184" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="10" fill="#075985">Mart - Haziran seçili</text>
      </svg>
      <p className="mt-2 text-xs text-gray-500">
        Dilimleyici kategorik filtre için (Satış, Finans seçili); zaman çizelgesi aralıklı tarih filtresi için (Mart-Haziran). Her ikisi birden fazla Pivot'a bağlanabilir.
      </p>
    </figure>
  );
}
