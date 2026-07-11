import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ kod: string }>;
};

/** Kısa URL: /sigorta/sirket/1004 → şirket merkezi */
export default async function SigortaSirketKodRedirectPage({ params }: PageProps) {
  const { kod } = await params;
  const n = Number(kod);
  if (!Number.isFinite(n) || n <= 0) {
    redirect("/sigorta/sirket-merkezi");
  }
  redirect(`/sigorta/sirket-merkezi?sirket=${n}`);
}
