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
  if (ton === "notr") return tsbDelta.notr;
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
              <li key={satir.sirketKodu}>
                <Link
                  href={satir.href}
                  className={tsb.sektorOzetiSatirLink}
                  title={`${satir.sirketAdi} — detay paneline git`}
                >
                  <span className={tsb.sektorOzetiSira} aria-hidden={!!medal}>
                    {medal ?? satir.sira}
                  </span>
                  <span className={tsb.sektorOzetiAd}>{satir.sirketAdi}</span>
                  <span className={cn(tsb.sektorOzetiDeger, degerSinifi(satir.ton))}>{satir.degerMetin}</span>
                </Link>
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

  const donemNotu = useMemo(() => {
    const fin = data.finDonemOnceki
      ? `Finansal/teknik: ${data.finDonem} · önceki yıl ${data.finDonemOnceki}`
      : `Finansal/teknik: ${data.finDonem}`;
    const prim = data.primDonemOnceki
      ? `Prim/pay: ${data.primDonem} · önceki yıl ${data.primDonemOnceki}`
      : `Prim/pay: ${data.primDonem}`;
    return `${fin} · ${prim} · Hayat dışı (HD)`;
  }, [data]);

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
          Seçili son dönem verilerine göre öne çıkan şirketler ve sıralamalar.
        </p>
        <p className={tsb.sektorOzetiDonemNotu}>{donemNotu}</p>
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
