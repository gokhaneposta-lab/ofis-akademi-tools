import { ORAN_TORPU_VARSAYILAN } from "../config/constants";
import type { BilesenSpec, OranKalemSpec } from "./oranKalemLoader";
import { ORAN_KALEM_MIZAN } from "./oranKalemLoader";

export type YilOranParcasi = {
  yil: number;
  oran: number;
  agirlik: number;
  dahil: boolean;
  dislendi: boolean;
  neden: string;
};

export type BilesenOran = {
  bilesenId: string;
  ad: string;
  agirlik: number;
  yilParcalari: YilOranParcasi[];
  hamOran: number;
  torpuOran: number;
};

export type KalemOranSonuc = {
  kalemKodu: string;
  bransKodu: string;
  bilesenler: BilesenOran[];
  etkinOran: number;
  torpuUygulandi: boolean;
};

type YilOraniFn = (brans: string, yil: number, bilesen: BilesenSpec) => number | null;

function normSpec(kalemKodu: string): OranKalemSpec & { bilesenler: BilesenSpec[] } {
  if (!(kalemKodu in ORAN_KALEM_MIZAN)) {
    throw new Error(`ORAN_KALEM_MIZAN içinde '${kalemKodu}' yok`);
  }
  const spec = ORAN_KALEM_MIZAN[kalemKodu];
  if (spec.bilesenler?.length) {
    return spec as OranKalemSpec & { bilesenler: BilesenSpec[] };
  }
  return {
    ...spec,
    bilesenler: [{
      id: "ana",
      ad: spec.ad ?? kalemKodu,
      pay: spec.pay,
      baz: spec.baz,
      agirlik: 1,
      hesap_eslesme: spec.hesap_eslesme,
      baz_toplam_sirket: spec.baz_toplam_sirket,
    }],
  };
}

function torpuCfg(spec: OranKalemSpec) {
  return { ...ORAN_TORPU_VARSAYILAN, ...spec.torpu };
}

function yilCiftleri(spec: OranKalemSpec, yillar: number[]): [number, number][] {
  if (yillar.length === 0) return [];
  const maxY = yillar[yillar.length - 1];
  const out: [number, number][] = [];
  for (const [ofset, agirlik] of spec.yil_birlestirme) {
    const y = maxY - (ofset - 1);
    if (yillar.includes(y)) out.push([y, agirlik]);
  }
  return out;
}

function agirlikliOrtalama(
  parcalar: [number, number][],
  yilDisiMax: number | null | undefined,
): [number | null, YilOranParcasi[]] {
  const detay: YilOranParcasi[] = [];
  const kullanilan: [number, number][] = [];

  for (const [o, w] of parcalar) {
    let dislendi = false;
    let neden = "";
    if (yilDisiMax != null && Math.abs(o) > yilDisiMax) {
      dislendi = true;
      neden = `|oran|>${yilDisiMax}`;
    }
    detay.push({ yil: 0, oran: o, agirlik: w, dahil: !dislendi, dislendi, neden });
    if (!dislendi) kullanilan.push([o, w]);
  }

  if (kullanilan.length === 0) return [null, detay];
  const payda = kullanilan.reduce((s, [, w]) => s + w, 0);
  const ort = kullanilan.reduce((s, [o, w]) => s + o * w, 0) / payda;
  return [ort, detay];
}

function sinirla(oran: number, torpu: ReturnType<typeof torpuCfg>): number {
  let o = oran;
  if (torpu.oran_min != null) o = Math.max(o, torpu.oran_min);
  if (torpu.oran_max != null) o = Math.min(o, torpu.oran_max);
  return o;
}

export function hesaplaBilesenOrani(
  yilOraniFn: YilOraniFn,
  bilesen: BilesenSpec,
  brans: string,
  spec: OranKalemSpec,
  yillar: number[],
): BilesenOran {
  const torpu = torpuCfg(spec);
  const yilCift = yilCiftleri(spec, yillar);
  const hamParcalar: [number, number][] = [];
  const detayRows: YilOranParcasi[] = [];

  for (const [yil, agirlik] of yilCift) {
    const o = yilOraniFn(brans, yil, bilesen);
    if (o == null) {
      detayRows.push({
        yil, oran: 0, agirlik, dahil: false, dislendi: true, neden: "baz/prim yok",
      });
      continue;
    }
    hamParcalar.push([o, agirlik]);
    detayRows.push({ yil, oran: o, agirlik, dahil: true, dislendi: false, neden: "" });
  }

  let [ham] = agirlikliOrtalama(hamParcalar, torpu.yil_disi_max);
  if (ham == null) ham = 0;

  if (torpu.yil_disi_max != null) {
    const esik = torpu.yil_disi_max;
    for (const row of detayRows) {
      if (row.dahil && Math.abs(row.oran) > esik) {
        row.dahil = false;
        row.dislendi = true;
        row.neden = `|oran|>${esik}`;
      }
    }
  }

  const torpuOran = sinirla(ham, torpu);

  return {
    bilesenId: bilesen.id ?? "ana",
    ad: bilesen.ad ?? "",
    agirlik: bilesen.agirlik ?? 1,
    yilParcalari: detayRows,
    hamOran: ham,
    torpuOran,
  };
}

export function hesaplaEtkinOran(
  kalemKodu: string,
  brans: string,
  yilOraniFn: YilOraniFn,
  yillar: number[],
): KalemOranSonuc {
  const spec = normSpec(kalemKodu);
  const torpu = torpuCfg(spec);

  const bilesenSonuclar = spec.bilesenler.map((b) =>
    hesaplaBilesenOrani(yilOraniFn, b, brans, spec, yillar),
  );

  const agirlikToplam = bilesenSonuclar.reduce((s, b) => s + b.agirlik, 0) || 1;
  const hamEtkin = bilesenSonuclar.reduce((s, b) => s + b.agirlik * b.hamOran, 0) / agirlikToplam;
  let etkin = bilesenSonuclar.reduce((s, b) => s + b.agirlik * b.torpuOran, 0) / agirlikToplam;

  const etkinOnce = etkin;
  etkin = sinirla(etkin, torpu);
  const torpuUygulandi =
    Math.abs(etkin - hamEtkin) > 1e-9 ||
    bilesenSonuclar.some((b) => b.hamOran !== b.torpuOran) ||
    etkin !== etkinOnce;

  return {
    kalemKodu,
    bransKodu: brans,
    bilesenler: bilesenSonuclar,
    etkinOran: etkin,
    torpuUygulandi,
  };
}

export function exportNormSpec(kalemKodu: string) {
  return normSpec(kalemKodu);
}
