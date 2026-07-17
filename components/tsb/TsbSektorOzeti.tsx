"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn, tsb, tsbDelta, TsbToggleButton } from "@/components/tsb/tsbDashboardUi";
import { SEKTOR_OZETI_METODOLOJI } from "@/lib/tsbSektorOzetiEligibility";
import type {
  SektorOzetiData,
  SektorOzetiListe,
  SektorOzetiSatir,
  SektorOzetiSekmeId,
} from "@/lib/tsbSektorOzeti";

function madalya(sira: number): string | null {
  if (sira === 1) return "🥇";
  if (sira === 2) return "🥈";
  if (sira === 3) return "🥉";
  return null;
}

function degerSinifi(ton: SektorOzetiSatir["ton"]): string {
  if (ton === "iyi") return tsbDelta.iyi;
  if (ton === "kotu") return tsbDelta.kotu;
  if (ton === "notr") return "text-slate-700";
  return "text-slate-700";
}

function LeaderboardKart({ liste }: { liste: SektorOzetiListe }) {
  return (
    <article className={tsb.sektorOzetiKart}>
      <h3 className={tsb.sektorOzetiKartBaslik}>{liste.baslik}</h3>
      {liste.satirlar.length === 0 ? (
        <p className={tsb.sektorOzetiBos}>Bu dönem için yeterli veri yok.</p>
      ) : (
        <ol className={tsb.sektorOzetiListe}>
          {liste.satirlar.map((satir) => {
            const medal = madalya(satir.sira);
            return (
              <li key={satir.sirketKodu} className={tsb.sektorOzetiSatir}>
                <span className={tsb.sektorOzetiSira} aria-hidden={!!medal}>
                  {medal ?? satir.sira}
                </span>
                <Link
                  href={satir.href}
                  className={tsb.sektorOzetiAdLink}
                  title={`${satir.sirketAdi} — detay paneline git`}
                >
                  {satir.sirketAdi}
                </Link>
                <span className={cn(tsb.sektorOzetiDeger, degerSinifi(satir.ton))}>{satir.degerMetin}</span>
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
}

function MetodolojiInfo() {
  return (
    <details className={tsb.sektorOzetiMetodolojiWrap}>
      <summary className={tsb.sektorOzetiMetodolojiBtn} aria-label="Liderlik listesi metodolojisi — tıklayarak açın">
        <span className={tsb.sektorOzetiMetodolojiIcon} aria-hidden>
          ℹ
        </span>
        <span>Metodoloji</span>
      </summary>
      <div className={tsb.sektorOzetiMetodolojiPanel}>
        <p className={tsb.sektorOzetiMetodolojiPanelBaslik}>Liste metodolojisi</p>
        <p className={tsb.sektorOzetiMetodolojiPanelTitle}>{SEKTOR_OZETI_METODOLOJI.kisa}</p>
        <p className={tsb.sektorOzetiMetodolojiPanelDetay}>{SEKTOR_OZETI_METODOLOJI.detay}</p>
      </div>
    </details>
  );
}

export default function TsbSektorOzeti({ data }: { data: SektorOzetiData }) {
  const [aktif, setAktif] = useState<SektorOzetiSekmeId>("karlilik");

  const sekme = useMemo(() => data.sekmeler.find((s) => s.id === aktif) ?? data.sekmeler[0], [data, aktif]);

  const donemChips = useMemo(() => {
    const chips: { label: string; value: string; sub?: string }[] = [
      {
        label: "Finansal KPI",
        value: data.finDonem || "—",
        sub: data.finDonemOnceki ? `geçen yıl: ${data.finDonemOnceki}` : undefined,
      },
      {
        label: aktif === "buyume" ? "Prim büyümesi" : "Prim sıralama",
        value: data.primDonem || "—",
        sub: data.primDonemOnceki ? `geçen yıl: ${data.primDonemOnceki}` : undefined,
      },
      { label: "Havuz", value: "Hayat dışı (HD)" },
    ];
    return chips;
  }, [data, aktif]);

  return (
    <section className={tsb.sektorOzetiWrap} aria-labelledby="tsb-sektor-ozeti-baslik">
      <div className={tsb.sektorOzetiBaslikWrap}>
        <div className={tsb.sektorOzetiBaslikRow}>
          <h2 id="tsb-sektor-ozeti-baslik" className={tsb.sektorOzetiBaslik}>
            Sektör Özeti
          </h2>
          <MetodolojiInfo />
        </div>
        <p className={tsb.sektorOzetiAltBaslik}>
          Son dönemde sektörde öne çıkan şirketler — karlılık, teknik sonuç, büyüme ve pazar payına göre
          sıralanmış kısa listeler.
        </p>
        <div className={tsb.sektorOzetiDonemGrid} aria-label="Kullanılan dönemler">
          {donemChips.map((c) => (
            <div key={c.label} className={tsb.sektorOzetiDonemChip}>
              <span className={tsb.sektorOzetiDonemChipLabel}>{c.label}: </span>
              {c.value}
              {c.sub ? <span className="text-slate-500"> · {c.sub}</span> : null}
            </div>
          ))}
        </div>
      </div>

      <div className={cn(tsb.btnGroup, "mb-3")} role="tablist" aria-label="Sektör özeti kategorileri">
        {data.sekmeler.map((s) => (
          <TsbToggleButton
            key={s.id}
            pressed={aktif === s.id}
            onClick={() => setAktif(s.id)}
            variant="tab"
          >
            {s.label}
          </TsbToggleButton>
        ))}
      </div>

      <div role="tabpanel" aria-label={sekme.label} className={tsb.sektorOzetiGrid}>
        {sekme.listeler.map((liste) => (
          <LeaderboardKart key={liste.id} liste={liste} />
        ))}
      </div>
    </section>
  );
}
