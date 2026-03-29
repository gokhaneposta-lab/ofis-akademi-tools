"use client";

import { useState } from "react";

function parseNum(s: string): number {
  const t = s.replace(/\./g, "").replace(",", ".").trim();
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : 0;
}

function fmt(n: number, frac = 2) {
  return n.toLocaleString("tr-TR", {
    minimumFractionDigits: frac,
    maximumFractionDigits: frac,
  });
}

export function CariOranCalculator() {
  const [donen, setDonen] = useState("");
  const [kisa, setKisa] = useState("");
  const d = parseNum(donen);
  const k = parseNum(kisa);
  const ratio = k > 0 ? d / k : 0;
  const has = d > 0 && k > 0;
  return (
    <CalculatorShell title="Cari Oran Hesaplayıcı" emoji="📐">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Dönen Varlıklar (₺)" value={donen} onChange={setDonen} ph="15.000.000" />
        <Field label="Kısa Vadeli Yükümlülükler (₺)" value={kisa} onChange={setKisa} ph="7.000.000" />
      </div>
      {has ? (
        <ResultBox>
          <p className="text-lg font-bold text-emerald-800">Cari oran = {fmt(ratio)}</p>
          <p className="text-xs text-gray-600 mt-1">
            (Bilanço kalemlerini aynı tarih / tutarlı TFRS kapsamıyla kullanın.)
          </p>
        </ResultBox>
      ) : (
        <Placeholder />
      )}
    </CalculatorShell>
  );
}

export function NakitOranCalculator() {
  const [nakit, setNakit] = useState("");
  const [benzeri, setBenzeri] = useState("");
  const [kisa, setKisa] = useState("");
  const n = parseNum(nakit) + parseNum(benzeri);
  const k = parseNum(kisa);
  const ratio = k > 0 ? n / k : 0;
  const has = n >= 0 && k > 0 && (parseNum(nakit) > 0 || parseNum(benzeri) > 0);
  return (
    <CalculatorShell title="Nakit Oranı Hesaplayıcı" emoji="💵">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Field label="Nakit (₺)" value={nakit} onChange={setNakit} ph="2.000.000" />
        <Field label="Nakit Benzerleri (₺)" value={benzeri} onChange={setBenzeri} ph="1.500.000" />
        <Field label="Kısa Vadeli Yükümlülükler (₺)" value={kisa} onChange={setKisa} ph="7.000.000" />
      </div>
      {has ? (
        <ResultBox>
          <p className="text-lg font-bold text-emerald-800">Nakit oranı = {fmt(ratio)}</p>
          <p className="text-xs text-gray-600 mt-1">Nakit + nakit benzerleri toplamının kısa vadeli borca bölümü.</p>
        </ResultBox>
      ) : (
        <Placeholder />
      )}
    </CalculatorShell>
  );
}

export function AsitTestCalculator() {
  const [donen, setDonen] = useState("");
  const [stok, setStok] = useState("");
  const [kisa, setKisa] = useState("");
  const d = parseNum(donen);
  const s = parseNum(stok);
  const k = parseNum(kisa);
  const pay = d - s;
  const ratio = k > 0 ? pay / k : 0;
  const has = k > 0 && pay > 0;
  return (
    <CalculatorShell title="Asit-Test (Hızlı) Oranı" emoji="⚡">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Field label="Dönen Varlıklar (₺)" value={donen} onChange={setDonen} ph="15.000.000" />
        <Field label="Stoklar (₺)" value={stok} onChange={setStok} ph="4.000.000" />
        <Field label="Kısa Vadeli Yükümlülükler (₺)" value={kisa} onChange={setKisa} ph="7.000.000" />
      </div>
      {has ? (
        <ResultBox>
          <p className="text-lg font-bold text-emerald-800">Asit-test = {fmt(ratio)}</p>
          <p className="text-xs text-gray-600 mt-1">
            Hızlı varlıklar (dönen − stok) / kısa vadeli yükümlülük = {fmt(pay)} ₺ / {fmt(k)} ₺
          </p>
        </ResultBox>
      ) : pay <= 0 && d > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          Dönen varlıklar stoktan küçük veya eşit — formül pratikte anlamlı değil; bilançoyu kontrol edin.
        </div>
      ) : (
        <Placeholder />
      )}
    </CalculatorShell>
  );
}

export function VokRoeCalculator() {
  const [netKar, setNetKar] = useState("");
  const [ozkaynak, setOzkaynak] = useState("");
  const nk = parseNum(netKar);
  const oz = parseNum(ozkaynak);
  const pct = oz !== 0 ? (nk / oz) * 100 : 0;
  const has = oz !== 0;
  return (
    <CalculatorShell title="VÖK (Öz Sermaye Kârlılığı / ROE)" emoji="📈">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Net Dönem Kârı (₺)" value={netKar} onChange={setNetKar} ph="2.400.000" />
        <Field label="Öz Kaynaklar (ortalama veya dönem sonu) (₺)" value={ozkaynak} onChange={setOzkaynak} ph="18.000.000" />
      </div>
      {has ? (
        <ResultBox>
          <p className="text-lg font-bold text-emerald-800">VÖK = % {fmt(pct)}</p>
          <p className="text-xs text-gray-600 mt-1">
            Karşılaştırma için sektör ve geçmiş yıllar ortalaması kullanın; dönem sonu öz kaynak tek başına yanıltıcı olabilir.
          </p>
        </ResultBox>
      ) : (
        <Placeholder />
      )}
    </CalculatorShell>
  );
}

export function NetKarMarjiCalculator() {
  const [netKar, setNetKar] = useState("");
  const [ciro, setCiro] = useState("");
  const nk = parseNum(netKar);
  const c = parseNum(ciro);
  const pct = c > 0 ? (nk / c) * 100 : 0;
  const has = c > 0;
  return (
    <CalculatorShell title="Net Kâr Marjı" emoji="📉">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Net Dönem Kârı (₺)" value={netKar} onChange={setNetKar} ph="2.400.000" />
        <Field label="Satış Hasılatı / Ciro (₺)" value={ciro} onChange={setCiro} ph="48.000.000" />
      </div>
      {has ? (
        <ResultBox>
          <p className="text-lg font-bold text-emerald-800">Net kâr marjı = % {fmt(pct)}</p>
        </ResultBox>
      ) : (
        <Placeholder />
      )}
    </CalculatorShell>
  );
}

export function BorcOzkaynakCalculator() {
  const [borc, setBorc] = useState("");
  const [oz, setOz] = useState("");
  const b = parseNum(borc);
  const o = parseNum(oz);
  const ratio = o !== 0 ? b / o : 0;
  const has = o !== 0 && b >= 0;
  return (
    <CalculatorShell title="Borç / Özkaynak Oranı" emoji="⚖️">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Toplam Borçlar (₺)" value={borc} onChange={setBorc} ph="22.000.000" />
        <Field label="Öz Kaynaklar (₺)" value={oz} onChange={setOz} ph="18.000.000" />
      </div>
      {has ? (
        <ResultBox>
          <p className="text-lg font-bold text-emerald-800">Borç / Özkaynak = {fmt(ratio)}</p>
          <p className="text-xs text-gray-600 mt-1">Her 1 ₺ öz kaynak için kaç ₺ borç olduğunu gösterir.</p>
        </ResultBox>
      ) : (
        <Placeholder />
      )}
    </CalculatorShell>
  );
}

function CalculatorShell({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-sm">{emoji}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  ph,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  ph: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={ph}
        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">{children}</div>
  );
}

function Placeholder() {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center text-xs text-gray-400">
      Tutarları girin; sonuç otomatik hesaplanır.
    </div>
  );
}
