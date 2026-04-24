"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

type CheatCategory = "Temel" | "Navigasyon" | "Biçimlendirme" | "Formüller" | "Tarih";
type CheatItem = {
  id: string;
  category: CheatCategory;
  kind: "Kısayol" | "Formül";
  value: string;
  description: string;
  purpose: string;
  popular?: boolean;
};

const CATEGORIES: CheatCategory[] = ["Temel", "Navigasyon", "Biçimlendirme", "Formüller", "Tarih"];

const CATEGORY_STYLES: Record<CheatCategory, { chipBg: string; chipText: string; ring: string; top: string }> = {
  Temel: { chipBg: "bg-emerald-50", chipText: "text-emerald-700", ring: "ring-emerald-200", top: "bg-emerald-600" },
  Navigasyon: { chipBg: "bg-sky-50", chipText: "text-sky-700", ring: "ring-sky-200", top: "bg-sky-600" },
  Biçimlendirme: { chipBg: "bg-amber-50", chipText: "text-amber-800", ring: "ring-amber-200", top: "bg-amber-500" },
  Formüller: { chipBg: "bg-violet-50", chipText: "text-violet-700", ring: "ring-violet-200", top: "bg-violet-600" },
  Tarih: { chipBg: "bg-rose-50", chipText: "text-rose-700", ring: "ring-rose-200", top: "bg-rose-600" },
};

const ITEMS: CheatItem[] = [
  { id: "sc-copy", category: "Temel", kind: "Kısayol", value: "Ctrl+C", description: "Kopyala", purpose: "Seçili hücre/alanı panoya kopyalar.", popular: true },
  { id: "sc-paste", category: "Temel", kind: "Kısayol", value: "Ctrl+V", description: "Yapıştır", purpose: "Panodaki içeriği seçili hücreye yapıştırır.", popular: true },
  { id: "sc-cut", category: "Temel", kind: "Kısayol", value: "Ctrl+X", description: "Kes", purpose: "Seçili hücre/alanı taşıma için keser." },
  { id: "sc-undo", category: "Temel", kind: "Kısayol", value: "Ctrl+Z", description: "Geri al", purpose: "Son işlemi geri alır.", popular: true },
  { id: "sc-redo", category: "Temel", kind: "Kısayol", value: "Ctrl+Y", description: "Yinele", purpose: "Geri alınanı tekrar uygular." },
  { id: "sc-save", category: "Temel", kind: "Kısayol", value: "Ctrl+S", description: "Kaydet", purpose: "Dosyayı hızlıca kaydeder.", popular: true },
  { id: "sc-find", category: "Temel", kind: "Kısayol", value: "Ctrl+F", description: "Bul", purpose: "Sayfada hızlı arama yapar.", popular: true },
  { id: "sc-replace", category: "Temel", kind: "Kısayol", value: "Ctrl+H", description: "Bul ve değiştir", purpose: "Metinleri toplu değiştirir." },
  { id: "sc-print", category: "Temel", kind: "Kısayol", value: "Ctrl+P", description: "Yazdır", purpose: "Yazdırma önizlemesine gider." },
  { id: "sc-edit", category: "Temel", kind: "Kısayol", value: "F2", description: "Hücreyi düzenle", purpose: "Hücre içinde düzenleme moduna geçer." },

  { id: "nav-a1", category: "Navigasyon", kind: "Kısayol", value: "Ctrl+Home", description: "A1'e git", purpose: "Sayfanın başına döner." },
  { id: "nav-end", category: "Navigasyon", kind: "Kısayol", value: "Ctrl+End", description: "Son kullanılan hücre", purpose: "Son kullanılan alana gider.", popular: true },
  { id: "nav-block", category: "Navigasyon", kind: "Kısayol", value: "Ctrl+Ok", description: "Veri bloğu sonu", purpose: "Boşluklara göre blok sonuna atlar." },
  { id: "nav-col", category: "Navigasyon", kind: "Kısayol", value: "Ctrl+Boşluk", description: "Sütunu seç", purpose: "Aktif sütunun tamamını seçer." },
  { id: "nav-row", category: "Navigasyon", kind: "Kısayol", value: "Shift+Boşluk", description: "Satırı seç", purpose: "Aktif satırın tamamını seçer." },
  { id: "nav-all", category: "Navigasyon", kind: "Kısayol", value: "Ctrl+A", description: "Tümünü seç", purpose: "Bitişik aralığı/tüm sayfayı seçer." },

  { id: "fmt-bold", category: "Biçimlendirme", kind: "Kısayol", value: "Ctrl+B", description: "Kalın", purpose: "Metni kalın yapar." },
  { id: "fmt-italic", category: "Biçimlendirme", kind: "Kısayol", value: "Ctrl+İ", description: "İtalik", purpose: "Metni italik yapar." },
  { id: "fmt-underline", category: "Biçimlendirme", kind: "Kısayol", value: "Ctrl+U", description: "Alt çizgi", purpose: "Metni altı çizili yapar." },
  { id: "fmt-cells", category: "Biçimlendirme", kind: "Kısayol", value: "Ctrl+1", description: "Hücre biçimi", purpose: "Sayı/kenarlık/hizalama penceresini açar." },
  { id: "fmt-table", category: "Biçimlendirme", kind: "Kısayol", value: "Ctrl+T", description: "Tabloya dönüştür", purpose: "Aralığı Excel tablosu yapar.", popular: true },
  { id: "fmt-autofit", category: "Biçimlendirme", kind: "Kısayol", value: "Alt+H+O+İ", description: "Sütun sığdır", purpose: "Sütunu içeriğe göre otomatik sığdırır." },

  { id: "fx-sum", category: "Formüller", kind: "Formül", value: "TOPLA(aralık)", description: "Toplam", purpose: "Aralıktaki sayıları toplar.", popular: true },
  { id: "fx-avg", category: "Formüller", kind: "Formül", value: "ORTALAMA(aralık)", description: "Ortalama", purpose: "Aralığın ortalamasını alır." },
  { id: "fx-minmax", category: "Formüller", kind: "Formül", value: "MİN(aralık) / MAKS(aralık)", description: "Min / Max", purpose: "En küçük/en büyük değeri bulur." },
  { id: "fx-count", category: "Formüller", kind: "Formül", value: "SAY(aralık)", description: "Sayı adedi", purpose: "Sayı içeren hücreleri sayar." },
  { id: "fx-if", category: "Formüller", kind: "Formül", value: "EĞER(koşul;doğru;yanlış)", description: "Koşullu sonuç", purpose: "Koşula göre sonuç döndürür.", popular: true },
  { id: "fx-vlookup", category: "Formüller", kind: "Formül", value: "DÜŞEYARA(aranan;tablo;sütun_no;0)", description: "Dikey arama", purpose: "Tabloda anahtara göre değer getirir." },
  { id: "fx-countif", category: "Formüller", kind: "Formül", value: "EĞERSAY(aralık;koşul)", description: "Koşula uyan sayı", purpose: "Koşulu sağlayanları sayar." },
  { id: "fx-sumifs", category: "Formüller", kind: "Formül", value: "ÇOKETOPLA(toplam_aralık;ölçüt_aralık;ölçüt)", description: "Koşullu toplam", purpose: "Koşula göre toplam alır." },
  { id: "sc-autosum", category: "Formüller", kind: "Kısayol", value: "Alt+=", description: "Otomatik TOPLA", purpose: "Hızlı TOPLA ekler.", popular: true },
  { id: "sc-formulas", category: "Formüller", kind: "Kısayol", value: "Ctrl+`", description: "Formülleri göster", purpose: "Formül/sonuç görünümünü değiştirir." },
  { id: "sc-dropdown", category: "Formüller", kind: "Kısayol", value: "Alt+↓", description: "Açılır liste", purpose: "Veri doğrulama listesini açar." },

  { id: "dt-today", category: "Tarih", kind: "Formül", value: "BUGÜN()", description: "Bugünün tarihi", purpose: "Bugünün tarihini dinamik döndürür.", popular: true },
  { id: "dt-parts", category: "Tarih", kind: "Formül", value: "GÜN(tarih) / AY(tarih) / YIL(tarih)", description: "Tarih parçaları", purpose: "Tarihin gün/ay/yılını verir." },
  { id: "dt-make", category: "Tarih", kind: "Formül", value: "TARİH(yıl;ay;gün)", description: "Tarih oluştur", purpose: "Parçalardan tarih üretir." },
  { id: "sc-date", category: "Tarih", kind: "Kısayol", value: "Ctrl+;", description: "Bugünün tarihi (sabit)", purpose: "Hücreye bugünün tarihini yazar." },
  { id: "sc-time", category: "Tarih", kind: "Kısayol", value: "Ctrl+Shift+:", description: "Şu anki saat (sabit)", purpose: "Hücreye saati yazar." },
];

const normalizeTR = (s: string) => s.toLocaleLowerCase("tr-TR");

export default function KsayolFormulKartlariPage() {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = normalizeTR(q).trim();
    if (!query) return ITEMS;
    return ITEMS.filter((it) => normalizeTR(`${it.value} ${it.description} ${it.purpose} ${it.kind} ${it.category}`).includes(query));
  }, [q]);

  const popular = useMemo(() => filtered.filter((x) => x.popular), [filtered]);
  const byCategory = useMemo(() => {
    const map: Record<CheatCategory, CheatItem[]> = { Temel: [], Navigasyon: [], Biçimlendirme: [], Formüller: [], Tarih: [] };
    for (const it of filtered) map[it.category].push(it);
    return map;
  }, [filtered]);

  const handleDownloadPdf = useCallback(async () => {
    if (typeof window === "undefined") return;
    const el = pdfRef.current;
    if (!el) return;
    setPdfLoading(true);
    try {
      await new Promise((r) => requestAnimationFrame(r));
      const [{ default: h2c }, { default: JsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      // html2canvas lab() rengini desteklemiyor; klonda Tailwind lab() değişkenlerini hex ile override et
      const hexOverrides = `
        :root, * {
          --color-slate-50: #f8fafc;
          --color-slate-100: #f1f5f9;
          --color-slate-200: #e2e8ec;
          --color-slate-300: #cbd5e1;
          --color-slate-400: #94a3b8;
          --color-slate-500: #64748b;
          --color-slate-600: #475569;
          --color-slate-700: #334155;
          --color-slate-800: #1e293b;
          --color-slate-900: #0f172a;
          --color-slate-950: #020617;
        }
      `;
      const canvas = await h2c(el, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: el.offsetWidth || el.scrollWidth,
        windowWidth: el.offsetWidth || el.scrollWidth,
        onclone(_, clonedEl) {
          const style = clonedEl.ownerDocument.createElement("style");
          style.textContent = hexOverrides;
          clonedEl.ownerDocument.head.appendChild(style);

          // Tailwind v4 bazı renkleri lab()/lch() ile üretiyor; html2canvas desteklemez.
          // Klonda computed style üzerinden lab/lch değerlerini rgb'ye çevir.
          const colorProps = [
            "color",
            "backgroundColor",
            "borderColor",
            "borderTopColor",
            "borderRightColor",
            "borderBottomColor",
            "borderLeftColor",
            "fill",
            "stroke",
          ] as const;

          const toRgb = (value: string): string | null => {
            if (!value || value === "transparent" || value === "rgba(0, 0, 0, 0)") return null;
            if (!/lab\(|lch\(/i.test(value)) return null;
            try {
              const c = clonedEl.ownerDocument.createElement("canvas");
              c.width = 1;
              c.height = 1;
              const ctx = c.getContext("2d");
              if (!ctx) return null;
              ctx.fillStyle = value;
              ctx.fillRect(0, 0, 1, 1);
              const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
              return `rgb(${r},${g},${b})`;
            } catch {
              return "rgb(75, 85, 99)";
            }
          };

          const camelToKebab = (s: string) => s.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "");
          const walk = (node: Element) => {
            const view = clonedEl.ownerDocument.defaultView;
            const computed = view?.getComputedStyle(node);
            if (computed) {
              for (const prop of colorProps) {
                const cssName = camelToKebab(prop);
                const v = computed.getPropertyValue(cssName);
                if (v) {
                  const rgb = toRgb(v);
                  if (rgb) (node as HTMLElement).style[prop] = rgb;
                }
              }
            }
            node.querySelectorAll("*").forEach(walk);
          };
          walk(clonedEl);
        },
      });

      // Tek bir yatay A4 sayfa
      const pdf = new JsPDF("l", "mm", "a4");
      const pageW = A4_HEIGHT_MM; // 297 mm
      const pageH = A4_WIDTH_MM; // 210 mm
      const imgW = canvas.width;
      const imgH = canvas.height;

      // Tek A4 yatay sayfaya sığacak şekilde ölçekle (taşma yok, minimum kenar boşluğu)
      const scale = Math.min(pageW / imgW, pageH / imgH);
      const renderW = imgW * scale;
      const renderH = imgH * scale;
      const offsetX = (pageW - renderW) / 2;
      const offsetY = (pageH - renderH) / 2;
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.9), "JPEG", offsetX, offsetY, renderW, renderH);
      // Blob + programatik tıklama: pdf.save() bazı tarayıcılarda çalışmıyor
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "OfisAkademi-Kisayol-Formul-Kartlari.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("PDF oluşturulamadı:", msg, err);
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

      <main className="mx-auto max-w-6xl px-4 py-6 pb-10">
        <div className="print:hidden">
          <NasilKullanilir
            steps={[
              "Arama kutusuna kısayol, formül veya açıklama yazarak filtreleyin.",
              "En çok kullanılanlar bölümünden hızlı erişin.",
              "PDF indir ile A4 uyumlu çıktı alın (birden fazla sayfa olabilir).",
            ]}
          />
        </div>
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto] items-start print:hidden">
          <div className="rounded-2xl border bg-white/80 px-4 py-3 shadow-sm" style={{ borderColor: THEME.gridLine }}>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Ara</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Örn: Ctrl+T, TOPLA, yazdır, tarih…"
              className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2"
              style={{ borderColor: THEME.gridLine, boxShadow: "none" }}
            />
            <p className="mt-2 text-xs text-gray-500">
              Toplam <span className="font-semibold text-gray-700">{filtered.length}</span> öğe.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white shadow transition hover:opacity-90 disabled:opacity-60"
            style={{ background: "#c53030" }}
          >
            {pdfLoading ? "Hazırlanıyor…" : "PDF İndir (A4)"}
          </button>
        </div>

        <section className="space-y-6 print:hidden">
          {CATEGORIES.map((cat) => {
            const items = byCategory[cat];
            if (!items || items.length === 0) return null;
            const s = CATEGORY_STYLES[cat];
            return (
              <div key={cat} className="rounded-3xl border bg-white/60 p-4 shadow-sm" style={{ borderColor: THEME.gridLine }}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${s.chipBg} ${s.chipText}`}>
                      {cat}
                    </span>
                    <span className="text-xs text-gray-500">{items.length} öğe</span>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                        <table className="min-w-full border-separate border-spacing-0 text-sm text-black">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-xs font-semibold text-slate-600">
                        <th className="px-3 py-2 border-b border-slate-200">Tür</th>
                        <th className="px-3 py-2 border-b border-slate-200">Kısayol / Formül</th>
                        <th className="px-3 py-2 border-b border-slate-200">Açıklama</th>
                        <th className="px-3 py-2 border-b border-slate-200">Ne işe yarar?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, idx) => (
                        <tr key={it.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                          <td className="px-3 py-1.5 text-xs text-slate-600">{it.kind}</td>
                          <td className="px-3 py-1.5 font-mono text-[13px] text-black">{it.value}</td>
                          <td className="px-3 py-1.5 text-xs font-semibold text-black">{it.description}</td>
                          <td className="px-3 py-1.5 text-xs text-black">{it.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </section>

        {/* PDF export için tek sayfa, yatay A4 layout (ekranda gizli) */}
        <div className="fixed left-[-99999px] top-0 w-[297mm]">
          <div
            ref={pdfRef}
            className="bg-white"
            style={{ width: "297mm", height: "210mm" }}
          >
            <div className="h-full px-6 py-4 flex flex-col gap-3">
              <div className="flex items-end justify-between gap-4 border-b pb-4" style={{ borderColor: THEME.gridLine }}>
                <div>
                  <div className="text-xs font-semibold tracking-wide text-slate-500">Ofis Akademi</div>
                  <h1 className="mt-1 text-xl font-extrabold tracking-tight" style={{ color: THEME.ribbon }}>
                    Excel Cheat Sheet
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">Kategorilere ayrılmış pratik kısayol ve formül kartları</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">A4 · {new Date().toLocaleDateString("tr-TR")}</div>
                  <div className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Toplam: {filtered.length}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-[9px] leading-tight flex-1">
                {["Temel", "Navigasyon", "Biçimlendirme"].map((cat) => {
                  const items = byCategory[cat as CheatCategory];
                  if (!items || items.length === 0) return null;
                  const s = CATEGORY_STYLES[cat as CheatCategory];
                  return (
                    <div key={cat} className={`rounded-2xl border bg-white p-4 ${s.ring}`}>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900">{cat}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${s.chipBg} ${s.chipText}`}>{items.length} öğe</span>
                      </div>
                      <div className="rounded-xl border" style={{ borderColor: THEME.gridLine, background: "#fbfdff" }}>
                        <table className="min-w-full border-separate border-spacing-0 text-[9px] text-black">
                          <thead>
                            <tr className="bg-slate-100 text-[9px] font-semibold text-black">
                              <th className="px-2 py-1 border-b border-slate-200 text-left">Tür</th>
                              <th className="px-2 py-1 border-b border-slate-200 text-left">Kısayol / Formül</th>
                              <th className="px-2 py-1 border-b border-slate-200 text-left">Açıklama</th>
                              <th className="px-2 py-1 border-b border-slate-200 text-left">Ne işe yarar?</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((it, idx) => (
                              <tr key={it.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                                <td className="px-2 py-1 text-[8px] text-black">{it.kind}</td>
                                <td className="px-2 py-1 font-mono text-[8px] text-black break-all">{it.value}</td>
                                <td className="px-2 py-1 text-[8px] font-semibold text-black">{it.description}</td>
                                <td className="px-2 py-1 text-[8px] text-black">{it.purpose}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 grid grid-cols-2 gap-3 text-[9px] leading-tight">
                {["Formüller", "Tarih"].map((cat) => {
                  const items = byCategory[cat as CheatCategory];
                  if (!items || items.length === 0) return null;
                  const s = CATEGORY_STYLES[cat as CheatCategory];
                  return (
                    <div key={cat} className={`rounded-2xl border bg-white p-4 ${s.ring}`}>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900">{cat}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${s.chipBg} ${s.chipText}`}>{items.length} öğe</span>
                      </div>
                      <div className="rounded-xl border" style={{ borderColor: THEME.gridLine, background: "#fbfdff" }}>
                        <table className="min-w-full border-separate border-spacing-0 text-[9px] text-black">
                          <thead>
                            <tr className="bg-slate-100 text-[9px] font-semibold text-black">
                              <th className="px-2 py-1 border-b border-slate-200 text-left">Tür</th>
                              <th className="px-2 py-1 border-b border-slate-200 text-left">Kısayol / Formül</th>
                              <th className="px-2 py-1 border-b border-slate-200 text-left">Açıklama</th>
                              <th className="px-2 py-1 border-b border-slate-200 text-left">Ne işe yarar?</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((it, idx) => (
                              <tr key={it.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                                <td className="px-2 py-1 text-[8px] text-black">{it.kind}</td>
                                <td className="px-2 py-1 font-mono text-[8px] text-black break-all">{it.value}</td>
                                <td className="px-2 py-1 text-[8px] font-semibold text-black">{it.description}</td>
                                <td className="px-2 py-1 text-[8px] text-black">{it.purpose}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between border-t pt-4 text-xs text-slate-500" style={{ borderColor: THEME.gridLine }}>
                <span>ofisakademi · Excel & Veri Analizi</span>
                <span>PDF çıktısı A4 uyumludur</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 print:hidden">
          <BenzerExcelAraclari currentHref="/excel-araclari/kisayol-formul-kartlari" />
        </div>
        <p className="mt-4 text-center text-xs text-slate-500 print:hidden">
          Ofis Akademi · Excel & Veri Analizi
        </p>
      </main>
    </div>
  );
}
