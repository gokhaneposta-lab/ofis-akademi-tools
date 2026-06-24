"use client";

import { useMemo } from "react";
import type { TsbGelirTidyRowLike } from "@/lib/tsbYatirimGeliriKpi";
import {
  olcekSegmentSirketKayit,
  sirketOlcekSegmentFromRows,
  type OlcekSegmentSirketKayit,
} from "@/lib/tsbOlcekSegment";
import type { SegmentSkorPool } from "@/lib/tsbSirketSegmentSkor";
import { olcekSegmentKayitFromCache, olcekFinDonemForPrimDonem, primSegmentToOlcekPool, type OlcekSegmentCache } from "@/lib/tsbOlcekSegmentCache";
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
  finDonem: string | null;
  yukleniyor: boolean;
} {
  const { cache, yukleniyor: cacheYukleniyor } = useOlcekSegmentCache();

  const gelirKayit = useMemo(() => {
    if (!opts || opts.kaynak !== "gelir") return null;
    const sonuc = sirketOlcekSegmentFromRows(opts.rows, opts.donem, opts.sirketKodu, opts.pool);
    return sonuc ? olcekSegmentSirketKayit(sonuc, opts.sirketAdi) : null;
  }, [opts]);

  const primMeta = useMemo(() => {
    if (!opts || opts.kaynak !== "prim") return { kayit: null as OlcekSegmentSirketKayit | null, finDonem: null as string | null };
    const activeCache = opts.cache ?? cache;
    if (!activeCache) return { kayit: null, finDonem: null };
    const pool = primSegmentToOlcekPool(opts.segment);
    const finDonem = olcekFinDonemForPrimDonem(activeCache, opts.donem);
    const kayit = olcekSegmentKayitFromCache(activeCache, opts.donem, pool, opts.sirketKodu);
    return { kayit, finDonem };
  }, [opts, cache]);

  if (!opts) return { kayit: null, finDonem: null, yukleniyor: false };
  if (opts.kaynak === "gelir") {
    return { kayit: gelirKayit, finDonem: opts.donem, yukleniyor: false };
  }
  return {
    kayit: primMeta.kayit,
    finDonem: primMeta.finDonem,
    yukleniyor: cacheYukleniyor && !opts.cache,
  };
}
