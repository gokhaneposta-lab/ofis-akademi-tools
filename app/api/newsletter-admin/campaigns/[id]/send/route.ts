import { NextResponse } from "next/server";
import { sendCampaign } from "@/lib/subscription/campaign";
import {
  SubscriptionDbNotConfiguredError,
  isSubscriptionDbConfigured,
} from "@/lib/subscription/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  if (!isSubscriptionDbConfigured()) {
    return NextResponse.json(
      { error: { code: "misconfigured", message: "DATABASE_URL missing" } },
      { status: 503 },
    );
  }

  try {
    const { id } = await ctx.params;
    const campaign = await sendCampaign(id);
    return NextResponse.json({
      ok: true,
      campaign: {
        id: campaign.id,
        status: campaign.status,
        audienceCount: campaign.audience_count,
        sentOk: campaign.sent_ok,
        sentFail: campaign.sent_fail,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "not_found") {
      return NextResponse.json(
        { error: { code: "not_found", message: "Kampanya yok." } },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "already_sending") {
      return NextResponse.json(
        { error: { code: "already_sending", message: "Gönderim sürüyor." } },
        { status: 409 },
      );
    }
    if (err instanceof Error && err.message === "already_sent") {
      return NextResponse.json(
        { error: { code: "already_sent", message: "Kampanya zaten gönderildi." } },
        { status: 409 },
      );
    }
    if (err instanceof SubscriptionDbNotConfiguredError) {
      return NextResponse.json(
        { error: { code: "misconfigured", message: "DATABASE_URL missing" } },
        { status: 503 },
      );
    }
    console.error("[newsletter-admin/send]", err);
    return NextResponse.json(
      { error: { code: "persist_failed", message: "Gönderim başarısız." } },
      { status: 500 },
    );
  }
}
