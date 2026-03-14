"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import PageRibbon from "@/components/PageRibbon";
import { THEME } from "@/lib/theme";

/** A4: 210×297 mm - tek sayfa cheat sheet */
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

const SHORTCUTS = {
  "Genel": [
    { keys: "Ctrl+C", desc: "Kopyala" },
    { keys: "Ctrl+V", desc: "Yapıştır" },
    { keys: "Ctrl+X", desc: "Kes" },
    { keys: "Ctrl+Z", desc: "Geri al" },
    { keys: "Ctrl+Y", desc: "Yinele" },
    { keys: "Ctrl+S", desc: "Kaydet" },
    { keys: "Ctrl+F", desc: "Bul" },
    { keys: "Ctrl+H", desc: "Bul ve değiştir" },
    { keys: "Ctrl+P", desc: "Yazdır" },
    { keys: "F2", desc: "Hücreyi düzenle" },
  ],
  "Geçiş & Seçim": [
    { keys: "Ctrl+Home", desc: "A1'e git" },
    { keys: "Ctrl+End", desc: "Son kullanılan hücreye git" },
    { keys: "Ctrl+Ok", desc: "Veri bloğu sonuna atla" },
    { keys: "Ctrl+Boşluk", desc: "Tüm sütunu seç" },
    { keys: "Shift+Boşluk", desc: "Tüm satırı seç" },
    { keys: "Ctrl+A", desc: "Tümünü seç" },
  ],
  "Biçimlendirme": [
    { keys: "Ctrl+B", desc: "Kalın" },
    { keys: "Ctrl+İ", desc: "İtalik" },
    { keys: "Ctrl+U", desc: "Alt çizgi" },
    { keys: "Ctrl+1", desc: "Hücre biçimi penceresi" },
    { keys: "Ctrl+T", desc: "Tablo olarak biçimlendir" },
    { keys: "Alt+H+O+İ", desc: "Sütun genişliği otomatik" },
  ],
  "Formül & Veri": [
    { keys: "Alt+=", desc: "TOPLA otomatik ekle" },
    { keys: "Ctrl+;", desc: "Bugünün tarihi" },
    { keys: "Ctrl+Shift+:", desc: "Şu anki saat" },
    { keys: "Ctrl+`", desc: "Formülleri göster/gizle" },
    { keys: "Alt+↓", desc: "Açılır liste (doğrulama)" },
  ],
};

const FORMULAS = {
  "Temel": [
    { fn: "TOPLA(aralık)", desc: "Toplam" },
    { fn: "ORTALAMA(aralık)", desc: "Ortalama" },
    { fn: "MİN / MAKS(aralık)", desc: "Min / Max" },
    { fn: "SAY(aralık)", desc: "Sayı adedi" },
    { fn: "EĞER(koşul;doğru;yanlış)", desc: "Koşullu sonuç" },
  ],
  "Arama & Koşul": [
    { fn: "DÜŞEYARA(aranan;tablo;sütun_no;0)", desc: "Dikey arama" },
    { fn: "EĞERSAY(aralık;koşul)", desc: "Koşula uyan sayı" },
    { fn: "ÇOKETOPLA(toplam_aralık;ölçüt_aralık;ölçüt)", desc: "Koşullu toplam" },
    { fn: "İNDİS(aralık;satır;sütun)", desc: "Hücre değeri" },
    { fn: "KAÇINCI(aranan;aralık;0)", desc: "Konum (satır/sütun)" },
  ],
  "Metin": [
    { fn: "BİRLEŞTİR(metin1;metin2;...)", desc: "Metin birleştir" },
    { fn: "SOL(metin;adet)", desc: "Soldan karakter" },
    { fn: "SAĞ(metin;adet)", desc: "Sağdan karakter" },
    { fn: "PARÇAAL(metin;başlangıç;uzunluk)", desc: "Ortadan parça" },
    { fn: "UZUNLUK(metin)", desc: "Karakter sayısı" },
  ],
  "Tarih": [
    { fn: "BUGÜN()", desc: "Bugünün tarihi" },
    { fn: "GÜN(tarih) / AY(tarih) / YIL(tarih)", desc: "Tarih parçaları" },
    { fn: "TARİH(yıl;ay;gün)", desc: "Tarih oluştur" },
  ],
};

export default function KsayolFormulKartlariPage() {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadPdf = useCallback(async () => {
    const el = sheetRef.current;
    if (!el) return;
    setPdfLoading(true);
    try {
      const [{ default: h2c }, { default: JsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await h2c(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        height: el.offsetHeight,
        width: el.offsetWidth,
        windowHeight: el.offsetHeight,
        windowWidth: el.offsetWidth,
      });
      const pdf = new JsPDF("p", "mm", "a4");
      const pageW = A4_WIDTH_MM;
      const pageH = A4_HEIGHT_MM;
      const imgW = canvas.width;
      const imgH = canvas.height;
      const scale = Math.min(pageW / imgW, pageH / imgH);
      const w = imgW * scale;
      const h = imgH * scale;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, h);
      pdf.save("OfisAkademi-Kisayol-Formul-Kartlari.pdf");
    } catch (err) {
      console.error("PDF oluşturulamadı:", err);
    } finally {
      setPdfLoading(false);
    }
  }, []);

  return (
    <div
      className="min-h-screen bg-[#e2e8ec]"
      style={{ fontFamily: THEME.font }}
    >
      <div className="print:hidden">
        <PageRibbon
          title="Kısayol & Formül Kartları"
          description="En çok kullanılan Excel kısayolları ve formülleri — tek sayfa, yazdırılabilir PDF."
        >
          <Link
            href="/excel-araclari"
            className="ml-auto text-sm font-medium text-white/90 hover:text-white underline"
          >
            ← Excel Araçları
          </Link>
        </PageRibbon>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-6 pb-10 print:py-0 print:max-w-none">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <p className="text-sm text-slate-600">
            A4 sayfaya sığacak şekilde tasarlandı. Yazdırabilir veya PDF indirebilirsiniz.
          </p>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:opacity-90 disabled:opacity-60"
            style={{ background: THEME.ribbon }}
          >
            {pdfLoading ? "Hazırlanıyor…" : "PDF İndir"}
          </button>
        </div>

        {/* Cheat sheet — A4 tek sayfa (cheat sheet tarzı) */}
        <div
          ref={sheetRef}
          className="mx-auto bg-white shadow-lg cheat-sheet"
          style={{
            width: "210mm",
            height: "297mm",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          <div className="flex h-full flex-col p-4 text-slate-800" style={{ boxSizing: "border-box", fontSize: "10px" }}>
            {/* Başlık */}
            <div className="border-b-2 pb-1.5 mb-2 flex-shrink-0" style={{ borderColor: THEME.ribbon }}>
              <h1 className="text-base font-bold tracking-tight" style={{ color: THEME.ribbon }}>
                Excel · Kısayol & Formül Kartı
              </h1>
              <p className="text-[9px] text-slate-500">En sık kullanılan kısayollar ve formüller</p>
            </div>

            <div className="flex flex-1 gap-3 min-h-0 overflow-hidden">
              {/* Sol: Kısayollar */}
              <div className="flex-1 overflow-hidden space-y-1">
                <h2 className="text-[10px] font-bold uppercase tracking-wide text-slate-600 border-b border-slate-300 pb-0.5">
                  Kısayollar
                </h2>
                {Object.entries(SHORTCUTS).map(([group, items]) => (
                  <div key={group}>
                    <h3 className="text-[9px] font-semibold text-slate-700">{group}</h3>
                    <table className="w-full border-collapse text-[8px]">
                      <tbody>
                        {items.map((item, i) => (
                          <tr key={i} className="border-b border-slate-100">
                            <td className="py-0.5 pr-1.5 font-mono font-semibold text-slate-800 w-[40%] leading-tight">
                              {item.keys}
                            </td>
                            <td className="py-0.5 text-slate-600 leading-tight">{item.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              {/* Sağ: Formüller */}
              <div className="flex-1 overflow-hidden space-y-1">
                <h2 className="text-[10px] font-bold uppercase tracking-wide text-slate-600 border-b border-slate-300 pb-0.5">
                  Formüller
                </h2>
                {Object.entries(FORMULAS).map(([group, items]) => (
                  <div key={group}>
                    <h3 className="text-[9px] font-semibold text-slate-700">{group}</h3>
                    <table className="w-full border-collapse text-[8px]">
                      <tbody>
                        {items.map((item, i) => (
                          <tr key={i} className="border-b border-slate-100">
                            <td className="py-0.5 pr-1.5 font-mono text-slate-800 w-[58%] leading-tight" style={{ fontSize: "7px" }}>
                              {item.fn}
                            </td>
                            <td className="py-0.5 text-slate-600 leading-tight">{item.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>

            {/* ofisakademi — sayfa altında bir kenar */}
            <div className="flex-shrink-0 pt-2 mt-auto border-t border-slate-200 flex justify-between items-center">
              <span className="text-[8px] text-slate-400">Tek sayfa · Yazdırıp masana as</span>
              <span className="text-[10px] font-semibold tracking-wide" style={{ color: THEME.ribbon }}>
                ofisakademi
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500 print:hidden">
          Ofis Akademi · Excel & Veri Analizi
        </p>
      </main>
    </div>
  );
}
