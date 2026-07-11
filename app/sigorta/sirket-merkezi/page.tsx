import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Eski URL — /sigorta/sirket-merkezi → şirket karne */
export default async function SigortaSirketMerkeziRedirectPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const v of value) q.append(key, v);
    } else {
      q.set(key, value);
    }
  }
  const s = q.toString();
  redirect(s ? `/sigorta/sirket-karne?${s}` : "/sigorta/sirket-karne");
}
