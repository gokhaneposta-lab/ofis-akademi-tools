import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ kod: string }>;
};

/** Kısa URL: /sigorta/sirket/1004 → şirket karne */
export default async function SigortaSirketKodRedirectPage({ params }: PageProps) {
  const { kod } = await params;
  const n = Number(kod);
  if (!Number.isFinite(n) || n <= 0) {
    redirect("/sigorta/sirket-karne");
  }
  redirect(`/sigorta/sirket-karne?sirket=${n}`);
}
