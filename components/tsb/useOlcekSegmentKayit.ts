"use client";

import { useMemo } from "react";
import type { TsbGelirTidyRowLike } from "@/lib/tsbYatirimGeliriKpi";
import {
  olcekSegmentSirketKayit,
  sirketOlcekSegmentFromRows,
  type OlcekSegmentSirketKayit,
} from "@/lib/tsbOlcekSegment";
import type { SegmentSkorPool } from "@/lib/tsbSirketSegmentSkor";
import { olcekSegmentKayitFromCache, primSegmentToOlcekPool, type OlcekSegmentCache } from "@/lib/tsbOlcekSegmentCache";
import { useOlcekSegmentCache } from "@/components/tsb/useOlcekSegmentCache";

type GelirOpts = {
  kaynak: "gelir";
  rows: TsbGelirTidyRowLike[];
  donem: string;
  pool: SegmentSkorPool;
  sirketKodu: number;
  sirketAdi: string;
};

type PrimOpts = {
  kaynak: "prim";
  donem: string;
  segment: "hayatdisi" | "hayat";
  sirketKodu: number;
  sirketAdi: string;
  cache?: OlcekSegmentCache | null;
};

export function useOlcekSegmentKayit(opts: GelirOpts | PrimOpts | null): {
  kayit: OlcekSegmentSirketKayit | null;
  yukleniyor: boolean;
} {
  const { cache, yukleniyor: cacheYukleniyor } = useOlcekSegmentCache();

  const gelirKayit = useMemo(() => {
    if (!opts || opts.kaynak !== "gelir") return null;
    const sonuc = sirketOlcekSegmentFromRows(opts.rows, opts.donem, opts.sirketKodu, opts.pool);
    return sonuc ? olcekSegmentSirketKayit(sonuc, opts.sirketAdi) : null;
  }, [opts]);

  const primKayit = useMemo(() => {
    if (!opts || opts.kaynak !== "prim") return null;
    const activeCache = opts.cache ?? cache;
    if (!activeCache) return null;
    const pool = primSegmentToOlcekPool(opts.segment);
    return olcekSegmentKayitFromCache(activeCache, opts.donem, pool, opts.sirketKodu);
  }, [opts, cache]);

  if (!opts) return { kayit: null, yukleniyor: false };
  if (opts.kaynak === "gelir") return { kayit: gelirKayit, yukleniyor: false };
  return { kayit: primKayit, yukleniyor: cacheYukleniyor && !opts.cache };
}
