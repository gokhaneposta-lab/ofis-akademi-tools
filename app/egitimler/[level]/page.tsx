"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ExcelPracticeGrid from "@/components/ExcelPracticeGrid";
import { buildLevelWorkbook, downloadWorkbook } from "@/lib/egitimExcelExport";
import {
  levelConfig,
  practiceDefs,
  practiceByGroupTitle,
  ileriEkSayfalar,
  getLevelPracticeSheets,
  type FunctionDef,
  type LevelKey,
} from "@/lib/egitimData";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import RelatedBlogForLevel from "@/components/RelatedBlogForLevel";

const svgProps = { width: 24, height: 24, viewBox: "0 0 24 24" as const, fill: "none" as const, stroke: "#374151", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

function ShortcutIcon({ type, className = "h-4 w-4" }: { type: "cut" | "copy" | "paste" | "table"; className?: string }) {
  const c = className;
  if (type === "cut") {
    return (
      <svg className={c} {...svgProps}>
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
        <line x1="15.5" y1="8.5" x2="8.5" y2="15.5" />
      </svg>
    );
  }
  if (type === "copy") {
    return (
      <svg className={c} {...svgProps}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
    );
  }
  if (type === "paste") {
    return (
      <svg className={c} {...svgProps}>
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    );
  }
  if (type === "table") {
    return (
      <svg className={c} {...svgProps}>
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
      </svg>
    );
  }
  return null;
}

export default function TrainingLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = use(params);
  const config = levelConfig[level as LevelKey];
  const levelKey = level as LevelKey;

  const pdfContentRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfFallback, setPdfFallback] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    return () => {
      if (pdfFallback?.url) URL.revokeObjectURL(pdfFallback.url);
    };
  }, [pdfFallback?.url]);

  const handleDownloadExcel = useCallback(() => {
    const sheets = getLevelPracticeSheets(levelKey);
    const extraSheets = levelKey === "ileri" ? ileriEkSayfalar : [];
    const wb = buildLevelWorkbook(config.label, sheets, practiceDefs, extraSheets);
    const safeName = config.label.replace(/\s+/g, "-").replace(/·/g, "") + "-Ornekler.xlsx";
    downloadWorkbook(wb, safeName);
  }, [levelKey, config.label]);

  const handleDownloadPdf = useCallback(async () => {
    if (typeof window === "undefined") return;
    const el = pdfContentRef.current;
    if (!el) return;
    if (pdfFallback?.url) {
      URL.revokeObjectURL(pdfFallback.url);
    }
    setPdfFallback(null);
    setPdfLoading(true);
    try {
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => setTimeout(r, 100));
      let h = el.scrollHeight || el.offsetHeight;
      let w = el.scrollWidth || el.offsetWidth;
      if (!h || !w) {
        console.warn("PDF: içerik alanı henüz boyutlanmamış, kısa bekleniyor…");
        await new Promise((r) => setTimeout(r, 300));
        h = el.scrollHeight || el.offsetHeight;
        w = el.scrollWidth || el.offsetWidth;
      }
      if (!h || !w) {
        console.warn("PDF: içerik alanı boyutlanamadı.");
        setPdfLoading(false);
        return;
      }
      const [{ default: h2c }, { default: JsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const a4LandscapeW = 1122;
      const PDF_RENDER_SCALE = 1.5;
      const pageWidthMm = 297;
      const pageHeightMm = 210;
      const LINE_HEIGHT_PX = 24;
      const pageHeightPxLayout = Math.floor(Math.floor((pageHeightMm / pageWidthMm) * a4LandscapeW) / LINE_HEIGHT_PX) * LINE_HEIGHT_PX;
      const pageHeightPx = Math.max(1, Math.round(pageHeightPxLayout * PDF_RENDER_SCALE));
      const canvas = await h2c(el, {
        scale: PDF_RENDER_SCALE,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: Math.max(w, a4LandscapeW),
        windowWidth: Math.max(w, a4LandscapeW),
        onclone: (clonedDoc, clonedEl) => {
          clonedEl.style.width = `${a4LandscapeW}px`;
          clonedEl.style.maxWidth = `${a4LandscapeW}px`;
          const colorProps = ["color", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "fill", "stroke"] as const;
          const toRgb = (value: string): string | null => {
            if (!value || value === "transparent" || value === "rgba(0, 0, 0, 0)") return null;
            if (!/lab\(|lch\(/i.test(value)) return null;
            try {
              const canvas = clonedDoc.createElement("canvas");
              canvas.width = 1;
              canvas.height = 1;
              const ctx = canvas.getContext("2d");
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
          const walk = (el: Element) => {
            const style = clonedDoc.defaultView?.getComputedStyle(el);
            if (style) {
              for (const prop of colorProps) {
                const value = style.getPropertyValue(camelToKebab(prop));
                if (value) {
                  const rgb = toRgb(value);
                  if (rgb) (el as HTMLElement).style[prop] = rgb;
                }
              }
            }
            el.querySelectorAll("*").forEach(walk);
          };
          walk(clonedEl);
          clonedEl.querySelectorAll("svg").forEach((svg) => {
            svg.setAttribute("width", "24");
            svg.setAttribute("height", "24");
            if (!svg.getAttribute("stroke") || svg.getAttribute("stroke") === "currentColor") svg.setAttribute("stroke", "#374151");
          });

          const container = clonedEl as HTMLElement;
          const imgs = Array.from(container.querySelectorAll("img")) as HTMLImageElement[];

          const getTop = (node: HTMLElement) => {
            const r = node.getBoundingClientRect();
            const c = container.getBoundingClientRect();
            return r.top - c.top + container.scrollTop;
          };

          const addSpacerBefore = (target: HTMLElement, spacerH: number) => {
            const spacer = clonedDoc.createElement("div");
            spacer.setAttribute("data-pdf-spacer", "1");
            spacer.style.height = `${spacerH}px`;
            spacer.style.width = "100%";
            spacer.style.display = "block";
            spacer.style.background = "transparent";
            target.parentElement?.insertBefore(spacer, target);
          };

          const pushToNextPageIfSplits = (node: HTMLElement) => {
            const h = node.offsetHeight || node.getBoundingClientRect().height;
            if (!h || h >= pageHeightPxLayout) return false;
            const top = getTop(node);
            if (top < 0) return false;
            const pageEnd = (Math.floor(top / pageHeightPxLayout) + 1) * pageHeightPxLayout;
            const bottom = top + h;
            const overflow = bottom - pageEnd;
            if (overflow <= 8) return false;
            const push = Math.min(pageHeightPxLayout, Math.max(0, pageEnd - top));
            if (push <= 0) return false;
            addSpacerBefore(node, push);
            return true;
          };

          for (let pass = 0; pass < 4; pass++) {
            let changed = false;
            for (const img of imgs) {
              if (pushToNextPageIfSplits(img)) changed = true;
            }
            if (!changed) break;
          }

          const keepBlocks = [
            ...Array.from(container.querySelectorAll("article > div.px-4.py-2")) as HTMLElement[],
            ...Array.from(container.querySelectorAll("article > div.px-4.pt-3")) as HTMLElement[],
            ...Array.from(container.querySelectorAll("article div.rounded-lg.border.p-3")) as HTMLElement[],
          ];
          keepBlocks.sort((a, b) => getTop(a) - getTop(b));

          for (let pass = 0; pass < 6; pass++) {
            let changed = false;
            for (const block of keepBlocks) {
              if (block.matches("article > div.px-4.py-2")) {
                const article = block.closest("article") as HTMLElement | null;
                const imgWrap = article?.querySelector(":scope > div.px-4.pt-3") as HTMLElement | null;
                if (imgWrap) {
                  const top = getTop(block);
                  const bottom = getTop(imgWrap) + (imgWrap.offsetHeight || imgWrap.getBoundingClientRect().height);
                  const h = bottom - top;
                  if (h > 0 && h < pageHeightPxLayout) {
                    const pageEnd = (Math.floor(top / pageHeightPxLayout) + 1) * pageHeightPxLayout;
                    if (bottom - pageEnd > 8) {
                      const push = Math.min(pageHeightPxLayout, Math.max(0, pageEnd - top));
                      if (push > 0) {
                        addSpacerBefore(block, push);
                        changed = true;
                        continue;
                      }
                    }
                  }
                }
              }

              if (pushToNextPageIfSplits(block)) changed = true;
            }
            if (!changed) break;
          }
        },
      });

      const getTrimmedHeightPx = (src: HTMLCanvasElement) => {
        const ctx = src.getContext("2d", { willReadFrequently: true });
        if (!ctx) return src.height;
        const { width, height } = src;
        const stepX = 12;
        const stepY = 4;
        const threshold = 12;
        const sampleXs: number[] = [];
        for (let x = 0; x < width; x += stepX) sampleXs.push(x);
        if (sampleXs[sampleXs.length - 1] !== width - 1) sampleXs.push(width - 1);
        for (let y = height - 1; y >= 0; y -= stepY) {
          const row = ctx.getImageData(0, y, width, 1).data;
          for (const x of sampleXs) {
            const idx = x * 4;
            const r = row[idx];
            const g = row[idx + 1];
            const b = row[idx + 2];
            const a = row[idx + 3];
            if (a > 0 && (Math.abs(255 - r) > threshold || Math.abs(255 - g) > threshold || Math.abs(255 - b) > threshold)) {
              return Math.min(height, y + stepY + 2);
            }
          }
        }
        return 1;
      };

      const pdf = new JsPDF("l", "mm", "a4");
      const imgW = canvas.width;
      const imgH = Math.min(canvas.height, Math.max(1, getTrimmedHeightPx(canvas)));
      const totalPages = Math.ceil(imgH / pageHeightPx);
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage([297, 210], "l");
        const sy = i * pageHeightPx;
        const sh = Math.min(pageHeightPx, imgH - sy);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = imgW;
        sliceCanvas.height = sh;
        const ctx = sliceCanvas.getContext("2d");
        if (!ctx) {
          pdf.addImage(canvas.toDataURL("image/jpeg", 0.88), "JPEG", 0, -i * pageHeightMm, pageWidthMm, imgH * (pageWidthMm / imgW));
          continue;
        }
        ctx.drawImage(canvas, 0, sy, imgW, sh, 0, 0, imgW, sh);
        const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.88);
        const sliceHeightMm = (sh / pageHeightPx) * pageHeightMm;
        pdf.addImage(sliceData, "JPEG", 0, 0, pageWidthMm, sliceHeightMm);
      }
      const safeName = config.label.replace(/\s+/g, "-").replace(/·/g, "") + "-Egitim-Ozeti.pdf";
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = safeName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setPdfFallback({ url, name: safeName });
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setPdfFallback((prev) => (prev?.url === url ? null : prev));
      }, 60_000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("PDF oluşturulamadı:", msg, err);
    } finally {
      setPdfLoading(false);
    }
  }, [config.label, pdfFallback?.url]);

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/80">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
            <Link href="/egitimler" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200" aria-label="Eğitimler">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Eğitim bulunamadı</h1>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">
              Lütfen adres çubuğundaki seviyeyi kontrol edin veya{" "}
              <Link href="/egitimler" className="font-medium text-emerald-700 underline">
                Excel eğitim içerikleri
              </Link>{" "}
              bölümünden tekrar seçim yapın.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/80">
      <BreadcrumbJsonLd
        items={[
          { name: "Ana Sayfa", path: "/" },
          { name: "Eğitimler", path: "/egitimler" },
          { name: config.label, path: `/egitimler/${levelKey}` },
        ]}
      />
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/egitimler" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200" aria-label="Eğitimler">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{config.title}</h1>
            <p className="text-xs text-gray-500 truncate">{config.label}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl flex flex-col px-4 py-5 sm:px-6 lg:px-8 pb-10 min-h-screen">
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-[13px] leading-relaxed text-slate-600">
          {config.description}
        </p>
        <div className="mb-4">
          <Link href="/egitimler" className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            <span>Tüm Eğitim Seviyeleri</span>
          </Link>
        </div>
        <div ref={pdfContentRef} className="space-y-4 mx-auto w-full max-w-[1122px] print:max-w-none pb-24">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="grid gap-0 text-sm grid-cols-1 sm:grid-cols-2">
            <div className="p-4 border-b sm:border-b-0 sm:border-r border-gray-200 bg-gray-50">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Kimler için?</h2>
              <p className="mt-1 text-gray-800 text-[13px]">{config.target}</p>
            </div>
            <div className="p-4 bg-white">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Odak</h2>
              <ul className="mt-1 space-y-1 text-gray-700 text-[13px]">
                {config.focus.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/80 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-600 w-full sm:w-auto">Bu seviyedeki tüm uygulama örneklerini indir:</span>
            <button type="button" onClick={handleDownloadExcel} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90" style={{ background: "#217346" }}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.576a1 1 0 01.707.293l3.854 3.854a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Excel İndir
            </button>
            <button type="button" onClick={handleDownloadPdf} disabled={pdfLoading} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-60" style={{ background: "#c53030" }}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              {pdfLoading ? "Hazırlanıyor…" : "PDF İndir"}
            </button>
            {pdfFallback && (
              <a href={pdfFallback.url} download={pdfFallback.name} onClick={() => { setTimeout(() => { URL.revokeObjectURL(pdfFallback.url); setPdfFallback(null); }, 500); }} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition">
                PDF hazır — tıklayın
              </a>
            )}
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {config.functionGroups.map((group) => (
            <article key={group.title} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-800 sm:text-base">{group.title}</h2>
                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{group.description}</p>
              </div>
              {group.image && (
                <div className="px-4 pt-3">
                  <img src={group.image} alt="" className="max-w-[640px] w-full rounded-xl border border-gray-200 shadow-sm object-cover" />
                </div>
              )}
              <div className="p-4 space-y-4">
                {group.functions.map((fn: FunctionDef) => (
                  <div key={fn.name} className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 space-y-2">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">{fn.name}</span>
                      {fn.name.includes("Ctrl+T") && <ShortcutIcon type="table" className="h-3.5 w-3.5 opacity-70" />}
                      {fn.syntax?.includes("Ctrl+X") && <ShortcutIcon type="cut" className="h-3.5 w-3.5 opacity-70" />}
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed">{fn.use}</p>
                    {fn.details && (
                      <p className="text-xs text-gray-600 leading-relaxed">{fn.details}</p>
                    )}
                    {fn.steps && fn.steps.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[10px] font-semibold uppercase text-gray-500 mb-1">Adım adım</p>
                        <ol className="space-y-1 text-xs text-gray-700 list-decimal list-inside">
                          {fn.steps.map((step, i) => (
                            <li key={i} className="leading-relaxed">{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {fn.syntax && (
                      <div className="mt-2">
                        <p className="text-[10px] font-semibold uppercase text-gray-500 mb-0.5">Yazım (sözdizimi)</p>
                        <code className="block text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 break-all">{fn.syntax}</code>
                      </div>
                    )}
                    {fn.params && fn.params.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[10px] font-semibold uppercase text-gray-500 mb-1">Parametreler</p>
                        <ul className="space-y-0.5 text-xs text-gray-700">
                          {fn.params.map((p) => (
                            <li key={p.name}><span className="font-medium text-gray-800">{p.name}:</span> {p.description}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {fn.tips && fn.tips.length > 0 && (
                      <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-2">
                        <p className="text-[10px] font-semibold uppercase text-amber-700 mb-1">İpucu / Dikkat</p>
                        <ul className="space-y-0.5 text-xs text-amber-900">
                          {fn.tips.map((tip, i) => (
                            <li key={i} className="flex gap-1.5 leading-relaxed"><span className="mt-0.5 flex-shrink-0">💡</span><span>{tip}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {practiceByGroupTitle[group.title] ? (() => {
                const { key, label } = practiceByGroupTitle[group.title];
                const def = practiceDefs[key];
                if (!def) return null;
                return (
                  <div key={key} className="px-4 pb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">{label}</h3>
                    <ExcelPracticeGrid def={def} />
                  </div>
                );
              })() : levelKey === "ileri" && (group.title === "PivotTable ve Özetleme" || group.title === "Dinamik Dizi & Gelişmiş Fonksiyonlar") ? (
                <div className="px-4 pb-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 bg-white">
                  <p className="font-medium text-gray-700">Uygulama</p>
                  <p className="mt-1">
                    Bu gruptaki araçlar için örnek veri, sayfa başındaki <strong>Örnek Excel İndir</strong> butonuyla indirdiğiniz dosyada yer alır: PivotTable için &quot;PivotTable Ornek Veri&quot;, FİLTRE/SIRALA/BENZERSİZ için &quot;Filtre Siralar Benzersiz&quot; sayfasını kullanabilirsiniz.
                  </p>
                </div>
              ) : null}
            </article>
          ))}
        </section>
        </div>

        <RelatedBlogForLevel level={levelKey} />

        <div className="mt-8 text-center text-xs text-gray-500">Ofis Akademi · Excel & Veri Analizi</div>
      </main>
    </div>
  );
}
