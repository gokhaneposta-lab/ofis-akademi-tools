"use client";

import { useEffect, useState } from "react";
import type { OlcekSegmentCache } from "@/lib/tsbOlcekSegmentCache";
import { OLCEK_SEGMENT_CACHE_URL } from "@/lib/tsbOlcekSegmentCache";

let cachePromise: Promise<OlcekSegmentCache> | null = null;

export function fetchOlcekSegmentCache(): Promise<OlcekSegmentCache> {
  if (!cachePromise) {
    cachePromise = fetch(OLCEK_SEGMENT_CACHE_URL)
      .then((r) => {
        if (!r.ok) throw new Error("Ölçek segment verisi yüklenemedi");
        return r.json() as Promise<OlcekSegmentCache>;
      })
      .catch((e) => {
        cachePromise = null;
        throw e;
      });
  }
  return cachePromise;
}

export function useOlcekSegmentCache(): {
  cache: OlcekSegmentCache | null;
  yukleniyor: boolean;
  hata: string | null;
} {
  const [cache, setCache] = useState<OlcekSegmentCache | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchOlcekSegmentCache()
      .then((data) => {
        if (!cancelled) {
          setCache(data);
          setYukleniyor(false);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setHata(e instanceof Error ? e.message : "Ölçek segment verisi yüklenemedi");
          setYukleniyor(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { cache, yukleniyor, hata };
}
