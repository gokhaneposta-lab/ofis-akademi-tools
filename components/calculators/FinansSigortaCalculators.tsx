"use client";

import Link from "next/link";
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

function parseIntTr(s: string): number {
  const t = s.replace(/\./g, "").replace(/,/g, "").trim();
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? n : 0;
}

/** SLA / servis: hedef süre veya kalite eşiği içinde kapanınların payı */
export function SlaServisSeviyesiCalculator() {
  const [icinde, setIcinde] = useState("");
  const [toplam, setToplam] = useState("");
  const i = parseIntTr(icinde);
  const t = parseIntTr(toplam);
  const pct = t > 0 ? (i / t) * 100 : 0;
  const has = t > 0 && i >= 0 && i <= t;
  return (
    <CalculatorShell title="SLA / Servis Seviyesi" emoji="🎯">
      <p className="text-xs text-gray-500 mb-3">
        Örnek: &quot;Hedef süre içinde kapanan ticket&quot; / &quot;Toplam ticket&quot; veya aynı mantıkla çağrı / talep.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Hedef içinde (adet)</label>
          <input
            type="text"
            inputMode="numeric"
            value={icinde}
            onChange={(e) => setIcinde(e.target.value)}
            placeholder="820"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Toplam iş / talep (adet)</label>
          <input
            type="text"
            inputMode="numeric"
            value={toplam}
            onChange={(e) => setToplam(e.target.value)}
            placeholder="1000"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>
      {has ? (
        <ResultBox>
          <p className="text-lg font-bold text-emerald-800">Servis seviyesi = %{fmt(pct)}</p>
          <p className="text-xs text-gray-600 mt-1">
            ({i} / {t}) — Tanımınızı (SLA süresi, önce çözüm vb.) raporda yazılı tutun.
          </p>
        </ResultBox>
      ) : i > t ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          Hedef içindeki adet, toplamdan büyük olamaz.
        </div>
      ) : (
        <Placeholder />
      )}
    </CalculatorShell>
  );
}

/** Turnover: dönem içi ayrılan / ortalama FTE */
export function PersonelDevirCalculator() {
  const [ayrilan, setAyrilan] = useState("");
  const [bas, setBas] = useState("");
  const [bit, setBit] = useState("");
  const a = parseIntTr(ayrilan);
  const b = parseIntTr(bas);
  const c = parseIntTr(bit);
  const ort = (b + c) / 2;
  const pct = ort > 0 ? (a / ort) * 100 : 0;
  const has = ort > 0 && a >= 0;
  return (
    <CalculatorShell title="Personel Devir Oranı (Turnover)" emoji="👥">
      <p className="text-xs text-gray-500 mb-3">
        Dönem: ay / çeyrek / yıl — başlangıç ve bitişteki tam zamanlı eşdeğeri (FTE) ortalaması.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Dönemde ayrılan (kişi)</label>
          <input
            type="text"
            inputMode="numeric"
            value={ayrilan}
            onChange={(e) => setAyrilan(e.target.value)}
            placeholder="12"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Dönem başı FTE</label>
          <input
            type="text"
            inputMode="numeric"
            value={bas}
            onChange={(e) => setBas(e.target.value)}
            placeholder="240"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Dönem sonu FTE</label>
          <input
            type="text"
            inputMode="numeric"
            value={bit}
            onChange={(e) => setBit(e.target.value)}
            placeholder="228"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>
      {has ? (
        <ResultBox>
          <p className="text-lg font-bold text-emerald-800">Devir oranı ≈ %{fmt(pct)}</p>
          <p className="text-xs text-gray-600 mt-1">
            Ortalama FTE = {fmt(ort, 1)} — Yıllık kıyas için aynı dönemi 12 ay ile ölçeklemeyi unutmayın (ör. aylık ×12 yaklaşık).
          </p>
        </ResultBox>
      ) : (
        <Placeholder />
      )}
    </CalculatorShell>
  );
}

/** Devamsızlık: toplam devamsız gün / toplam planlı iş günü (organizasyon veya birey düzeyinde) */
export function DevamsizlikOraniCalculator() {
  const [devGun, setDevGun] = useState("");
  const [planGun, setPlanGun] = useState("");
  const d = parseNum(devGun);
  const p = parseNum(planGun);
  const pct = p > 0 ? (d / p) * 100 : 0;
  const has = p > 0 && d >= 0;
  return (
    <CalculatorShell title="Devamsızlık Oranı" emoji="📋">
      <p className="text-xs text-gray-500 mb-3">
        Örnek: Tüm çalışanların devamsızlık günleri toplamı ÷ (çalışan × iş günü) veya tek kişi için devamsız ÷ planlı iş günü.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field
          label="Devamsızlık günü (toplam veya kişi bazlı)"
          value={devGun}
          onChange={setDevGun}
          ph="186"
        />
        <Field label="Planlanan iş günü (payda)" value={planGun} onChange={setPlanGun} ph="6200" />
      </div>
      {has ? (
        <ResultBox>
          <p className="text-lg font-bold text-emerald-800">Devamsızlık oranı ≈ %{fmt(pct)}</p>
          <p className="text-xs text-gray-600 mt-1">Payda tanımınızı (brüt iş günü, izin hariç vb.) raporda tek cümleyle yazın.</p>
        </ResultBox>
      ) : (
        <Placeholder />
      )}
    </CalculatorShell>
  );
}

/** Çalışan başına ciro / üretkenlik */
export function CalisanBasinaCiroCalculator() {
  const [ciro, setCiro] = useState("");
  const [fte, setFte] = useState("");
  const c = parseNum(ciro);
  const f = parseNum(fte);
  const per = f > 0 ? c / f : 0;
  const has = f > 0;
  return (
    <CalculatorShell title="Çalışan Başına Ciro" emoji="🏢">
      <p className="text-xs text-gray-500 mb-3">
        Satış hasılatı ÷ ortalama FTE — İK ve finans ortak KPI&apos;sı.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Dönem satış hasılatı (₺)" value={ciro} onChange={setCiro} ph="48.000.000" />
        <Field label="Ortalama FTE (kişi)" value={fte} onChange={setFte} ph="234" />
      </div>
      {has ? (
        <ResultBox>
          <p className="text-lg font-bold text-emerald-800">
            Çalışan başına ciro ≈ {fmt(per, 0)} ₺
          </p>
          <p className="text-xs text-gray-600 mt-1">Sektör ve sezonluk etkiyi aynı tabloda not edin.</p>
        </ResultBox>
      ) : (
        <Placeholder />
      )}
    </CalculatorShell>
  );
}

/** Kayıp oranı: hasar / kazanılmış prim — H/P brüt-net için ayrı sayfa */
export function KayipOraniCalculator() {
  const [hasar, setHasar] = useState("");
  const [ep, setEp] = useState("");
  const h = parseNum(hasar);
  const e = parseNum(ep);
  const pct = e > 0 ? (h / e) * 100 : 0;
  const has = e > 0 && h >= 0;
  return (
    <CalculatorShell title="Kayıp Oranı (Kazanılmış Prim)" emoji="📉">
      <p className="text-xs text-gray-500 mb-3">
        Reasürans ve brüt/net ayrımı için{" "}
        <Link href="/finans-sigorta/hasar-prim-orani" className="font-medium text-emerald-700 underline hover:no-underline">
          Hasar/Prim (H/P)
        </Link>{" "}
        hesaplayıcısını kullanın.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Dönem hasarı (₺)" value={hasar} onChange={setHasar} ph="4.200.000" />
        <Field label="Kazanılmış prim (₺)" value={ep} onChange={setEp} ph="6.000.000" />
      </div>
      {has ? (
        <ResultBox>
          <p className="text-lg font-bold text-emerald-800">Kayıp oranı = % {fmt(pct)}</p>
          <p className="text-xs text-gray-600 mt-1">Hasar ÷ kazanılmış prim × 100</p>
        </ResultBox>
      ) : (
        <Placeholder />
      )}
    </CalculatorShell>
  );
}

export function BirlesikOranCalculator() {
  const [hasar, setHasar] = useState("");
  const [gider, setGider] = useState("");
  const [ep, setEp] = useState("");
  const h = parseNum(hasar);
  const g = parseNum(gider);
  const e = parseNum(ep);
  const lr = e > 0 ? (h / e) * 100 : 0;
  const er = e > 0 ? (g / e) * 100 : 0;
  const cr = lr + er;
  const has = e > 0;
  return (
    <CalculatorShell title="Birleşik Oran" emoji="➕">
      <p className="text-xs text-gray-500 mb-3">
        UW gideri: komisyon + idari/satış giderleri gibi tek dönem toplamını girin (tanımınıza göre).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Field label="Dönem hasarı (₺)" value={hasar} onChange={setHasar} ph="7.000.000" />
        <Field label="Kazanılmış prim (₺)" value={ep} onChange={setEp} ph="10.000.000" />
        <Field label="Underwriting gideri (₺)" value={gider} onChange={setGider} ph="2.800.000" />
      </div>
      {has ? (
        <ResultBox>
          <p className="text-lg font-bold text-emerald-800">Birleşik oran = % {fmt(cr)}</p>
          <p className="text-xs text-gray-600 mt-1">
            Kayıp % {fmt(lr)} + Gider % {fmt(er)} — yaygın eşik: %100 altı teknik kâr (basit tanım).
          </p>
        </ResultBox>
      ) : (
        <Placeholder />
      )}
    </CalculatorShell>
  );
}

export function PrimTahsilatOraniCalculator() {
  const [tahsil, setTahsil] = useState("");
  const [payda, setPayda] = useState("");
  const t = parseNum(tahsil);
  const p = parseNum(payda);
  const pct = p > 0 ? (t / p) * 100 : 0;
  const has = p > 0;
  return (
    <CalculatorShell title="Prim Tahsilat Oranı" emoji="💳">
      <p className="text-xs text-gray-500 mb-3">
        Payda: yazılan / tahakkuk prim veya vadesi gelen tutar — raporda hangisini kullandığınızı yazın.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Tahsil edilen prim (₺)" value={tahsil} onChange={setTahsil} ph="8.400.000" />
        <Field label="Payda prim / alacak tutarı (₺)" value={payda} onChange={setPayda} ph="9.000.000" />
      </div>
      {has ? (
        <ResultBox>
          <p className="text-lg font-bold text-emerald-800">Tahsilat oranı = % {fmt(pct)}</p>
        </ResultBox>
      ) : (
        <Placeholder />
      )}
    </CalculatorShell>
  );
}

export function HasarCozumSuresiCalculator() {
  const [toplamGun, setToplamGun] = useState("");
  const [adet, setAdet] = useState("");
  const tg = parseNum(toplamGun);
  const a = parseNum(adet);
  const avg = a > 0 ? tg / a : 0;
  const has = a > 0 && tg >= 0;
  return (
    <CalculatorShell title="Ortalama Hasar Çözüm Süresi" emoji="⏱️">
      <p className="text-xs text-gray-500 mb-3">
        Kapalı dosyalarda gün farklarının toplamını ve dosya adedini girin (veya toplam/adet ile ortalama).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Toplam gün (Σ çözüm süreleri)" value={toplamGun} onChange={setToplamGun} ph="15000" />
        <Field label="Kapalı dosya adedi" value={adet} onChange={setAdet} ph="1000" />
      </div>
      {has ? (
        <ResultBox>
          <p className="text-lg font-bold text-emerald-800">Ortalama ≈ {fmt(avg)} gün</p>
        </ResultBox>
      ) : (
        <Placeholder />
      )}
    </CalculatorShell>
  );
}

export function IptalOraniCalculator() {
  const [iptal, setIptal] = useState("");
  const [referans, setReferans] = useState("");
  const i = parseNum(iptal);
  const r = parseNum(referans);
  const pct = r > 0 ? (i / r) * 100 : 0;
  const has = r > 0 && i >= 0;
  return (
    <CalculatorShell title="Poliçe İptal Oranı" emoji="🚫">
      <p className="text-xs text-gray-500 mb-3">
        Payda: örn. dönem başı aktif poliçe — kurum tanımınızla uyumlu tutun.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="İptal edilen poliçe (adet)" value={iptal} onChange={setIptal} ph="340" />
        <Field label="Referans poliçe adedi (payda)" value={referans} onChange={setReferans} ph="12500" />
      </div>
      {has ? (
        <ResultBox>
          <p className="text-lg font-bold text-emerald-800">İptal oranı = % {fmt(pct)}</p>
        </ResultBox>
      ) : (
        <Placeholder />
      )}
    </CalculatorShell>
  );
}

export function PoliceBasinaMaliyetCalculator() {
  const [gider, setGider] = useState("");
  const [adet, setAdet] = useState("");
  const g = parseNum(gider);
  const a = parseNum(adet);
  const per = a > 0 ? g / a : 0;
  const has = a > 0;
  return (
    <CalculatorShell title="Poliçe Başına Maliyet" emoji="📑">
      <p className="text-xs text-gray-500 mb-3">Gider kapsamınızı (sadece dağıtım, tüm UW vb.) raporda not edin.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Toplam gider (seçilen kapsam) (₺)" value={gider} onChange={setGider} ph="4.500.000" />
        <Field label="Poliçe / işlem adedi" value={adet} onChange={setAdet} ph="15000" />
      </div>
      {has ? (
        <ResultBox>
          <p className="text-lg font-bold text-emerald-800">Poliçe başına ≈ {fmt(per, 2)} ₺</p>
        </ResultBox>
      ) : (
        <Placeholder />
      )}
    </CalculatorShell>
  );
}
