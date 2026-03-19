"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import ExcelFormulBlok from "@/components/ExcelFormulBlok";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter((s) => s.length > 0).length;
}

function countChars(text: string): { withSpaces: number; withoutSpaces: number } {
  const withSpaces = text.length;
  const withoutSpaces = text.replace(/\s/g, "").length;
  return { withSpaces, withoutSpaces };
}

export default function KelimeKarakterSayaciPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const words = countWords(input);
    const { withSpaces, withoutSpaces } = countChars(input);
    return { words, withSpaces, withoutSpaces };
  }, [input]);

  const copyText = `Kelime sayısı\t${stats.words}\nKarakter (boşluklu)\t${stats.withSpaces}\nKarakter (boşluksuz)\t${stats.withoutSpaces}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Kelime & Karakter Sayacı"
        description="Metindeki kelime sayısını ve karakter sayısını (boşluklu / boşluksuz) hesaplayın. Excel veya metin yapıştırın."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-2xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={[
            "Metni veya Excel'den kopyaladığınız hücreleri aşağıdaki kutuya yapıştırın.",
            "Kelime sayısı ve karakter sayıları (boşluklu / boşluksuz) anında hesaplanır.",
            "İsterseniz Sonucu Kopyala ile özeti panoya alıp rapora yapıştırın.",
          ]}
          excelAlternatif={
            <>
              <p className="text-sm text-gray-700 mb-2">
                Excel&apos;de karakter ve kelime sayısını formülle alabilirsiniz. A1 metnin bulunduğu hücredir.
              </p>
              <ExcelFormulBlok
                baslik="Karakter sayısı için:"
                formül="=UZUNLUK(A1)"
                aciklama="UZUNLUK (İngilizce: LEN) fonksiyonu metindeki toplam karakter sayısını verir; boşluklar dahildir. Boşluksuz karakter sayısı için =UZUNLUK(DEĞİŞTİR(A1;&quot; &quot;;&quot;&quot;)) kullanabilirsiniz."
              />
              <ExcelFormulBlok
                baslik="Kelime sayısı için (boşlukla ayrılmış kelimeler):"
                formül='=UZUNLUK(TRIM(A1))-UZUNLUK(DEĞİŞTİR(TRIM(A1);" ";""))+1'
                aciklama="Bu formül boşluk sayısına dayanır: TEMİZLE ile baş/son boşluk alınır, DEĞİŞTİR ile tüm boşluklar silinir; iki uzunluk farkı + 1 yaklaşık kelime sayısını verir. İngilizce Excel&apos;de TRIM → LEN, DEĞİŞTİR → SUBSTITUTE."
              />
            </>
          }
        />

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            Metin içindeki kelime sayısını ve karakter sayısını (boşluklu/boşluksuz) hızlıca hesaplar. Excel veya metinden toplu şekilde çalışır.
          </p>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Örnek girdi / çıktı</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Girdi</p>
              <p className="text-gray-700"><span className="font-mono">Merhaba Excel</span></p>
            </div>
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Çıktı</p>
              <p className="text-gray-700">Kelime/karakter sayıları kutularda anında görünür; “kopyala” ile rapora aktarabilirsin.</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold text-gray-900">Boşluklu vs boşluksuz farkı nedir?</span>
              <br />
              Boşluklu karakter sayımı boşlukları da dahil eder; boşluksuz hariç tutar.
            </p>
            <p>
              <span className="font-semibold text-gray-900">Excel’de nasıl yaparım?</span>
              <br />
              Bu araç çıktıyı saniyeler içinde üretir; Excel formülleriyle de benzer mantık kurulabilir.
            </p>
            <p>
              <span className="font-semibold text-gray-900">Kopyalama ne işe yarar?</span>
              <br />
              Kelime ve karakter sayısını tablo formatında panoya alır.
            </p>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            Daha fazla örnek için{" "}
            <Link href="/blog/excelde-kelime-ve-karakter-sayisi" className="underline" style={{ color: THEME.ribbon }}>
              kelime/karakter sayacı rehberini
            </Link>{" "}
            inceleyebilirsin.
          </p>
        </section>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Metin (yapıştırın veya yazın)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Buraya metin yapıştırın. Kelime ve karakter sayıları anında güncellenir."
            rows={8}
            className="w-full rounded-lg border p-3 text-sm bg-white resize-y"
            style={{ borderColor: THEME.gridLine }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4 text-center bg-white" style={{ borderColor: THEME.gridLine }}>
            <div className="text-2xl font-bold tabular-nums" style={{ color: THEME.ribbon }}>{stats.words}</div>
            <div className="text-xs font-medium text-gray-600 mt-1">Kelime</div>
          </div>
          <div className="rounded-lg border p-4 text-center bg-white" style={{ borderColor: THEME.gridLine }}>
            <div className="text-2xl font-bold tabular-nums" style={{ color: THEME.ribbon }}>{stats.withSpaces}</div>
            <div className="text-xs font-medium text-gray-600 mt-1">Karakter (boşluklu)</div>
          </div>
          <div className="rounded-lg border p-4 text-center bg-white" style={{ borderColor: THEME.gridLine }}>
            <div className="text-2xl font-bold tabular-nums" style={{ color: THEME.ribbon }}>{stats.withoutSpaces}</div>
            <div className="text-xs font-medium text-gray-600 mt-1">Karakter (boşluksuz)</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <CopyButton onClick={handleCopy} disabled={!input.trim()} copied={copied} label="Sonucu Kopyala" copiedLabel="Kopyalandı" />
        </div>

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/kelime-karakter-sayaci" />
        </div>
        <div className="text-xs text-gray-500">Ofis Akademi · Metin araçları</div>
      </div>
    </div>
  );
}
