import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCampaign,
  listRecentCampaignSends,
} from "@/lib/subscription/campaign";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };

export default async function CampaignResultPage({ params }: Props) {
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) notFound();

  const sends = await listRecentCampaignSends(id, 30);
  const failed = sends.filter((s) => s.status === "failed");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Kampanya sonucu
        </p>
        <h1 className="mt-1 text-xl font-bold text-gray-900">
          {campaign.subject}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Tag: <span className="font-medium">{campaign.tag}</span> · Durum:{" "}
          <span className="font-medium">{campaign.status}</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs text-gray-500">Alıcı</p>
          <p className="text-lg font-semibold text-gray-900">
            {campaign.audience_count}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs text-gray-500">Başarılı</p>
          <p className="text-lg font-semibold text-emerald-700">
            {campaign.sent_ok}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs text-gray-500">Hatalı</p>
          <p className="text-lg font-semibold text-red-600">
            {campaign.sent_fail}
          </p>
        </div>
      </div>

      {failed.length > 0 ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Son hatalar</p>
          <ul className="mt-2 space-y-1 text-xs text-red-700">
            {failed.slice(0, 15).map((f) => (
              <li key={`${f.email}-${f.sent_at.toISOString()}`}>
                {f.email}: {f.error ?? "bilinmeyen hata"}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Link
        href="/newsletter-admin"
        className="inline-flex rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
      >
        Yeni kampanya
      </Link>
    </div>
  );
}
