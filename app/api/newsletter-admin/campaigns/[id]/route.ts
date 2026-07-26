import { NextResponse } from "next/server";
import {
  getCampaign,
  listRecentCampaignSends,
} from "@/lib/subscription/campaign";
import {
  SubscriptionDbNotConfiguredError,
  isSubscriptionDbConfigured,
} from "@/lib/subscription/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  if (!isSubscriptionDbConfigured()) {
    return NextResponse.json(
      { error: { code: "misconfigured", message: "DATABASE_URL missing" } },
      { status: 503 },
    );
  }

  try {
    const { id } = await ctx.params;
    const campaign = await getCampaign(id);
    if (!campaign) {
      return NextResponse.json(
        { error: { code: "not_found", message: "Kampanya yok." } },
        { status: 404 },
      );
    }
    const sends = await listRecentCampaignSends(id, 50);
    return NextResponse.json({
      ok: true,
      campaign: {
        id: campaign.id,
        tag: campaign.tag,
        subject: campaign.subject,
        htmlBody: campaign.html_body,
        status: campaign.status,
        audienceCount: campaign.audience_count,
        sentOk: campaign.sent_ok,
        sentFail: campaign.sent_fail,
        testEmail: campaign.test_email,
        createdBy: campaign.created_by,
        createdAt: campaign.created_at.toISOString(),
        startedAt: campaign.started_at?.toISOString() ?? null,
        finishedAt: campaign.finished_at?.toISOString() ?? null,
      },
      sends: sends.map((s) => ({
        email: s.email,
        status: s.status,
        error: s.error,
        sentAt: s.sent_at.toISOString(),
      })),
    });
  } catch (err) {
    if (err instanceof SubscriptionDbNotConfiguredError) {
      return NextResponse.json(
        { error: { code: "misconfigured", message: "DATABASE_URL missing" } },
        { status: 503 },
      );
    }
    console.error("[newsletter-admin/campaigns/id]", err);
    return NextResponse.json(
      { error: { code: "persist_failed", message: "Okuma başarısız." } },
      { status: 500 },
    );
  }
}
