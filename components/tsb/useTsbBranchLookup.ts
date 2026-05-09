"use client";

import { useEffect, useState } from "react";
import type { TsbBranchLookupMap } from "@/lib/tsbBranchLookup";
import { parseBranchLookupJson } from "@/lib/tsbBranchLookup";

export function useTsbBranchLookupFetch(): TsbBranchLookupMap | null {
  const [branchLookup, setBranchLookup] = useState<TsbBranchLookupMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/tsb/branch-lookup.json")
      .then((r) => {
        if (!r.ok) throw new Error("lookup");
        return r.json();
      })
      .then((raw: Record<string, { anaBrans?: string; tarifeGrubu?: string }>) => {
        if (!cancelled) setBranchLookup(parseBranchLookupJson(raw));
      })
      .catch(() => {
        if (!cancelled) setBranchLookup(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return branchLookup;
}
