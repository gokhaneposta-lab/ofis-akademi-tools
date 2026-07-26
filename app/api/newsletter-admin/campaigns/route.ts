import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getButceLoggedInUser } from "@/lib/butce/auth";
import {
  assertCampaignTag,
  createCampaign,
} from "@/lib/subscription/campaign";
import {
  SubscriptionDbNotConfiguredError,
  isSubscriptionDbConfigured,
} from "@/lib/subscription/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSubscriptionDbConfigured()) {
    return NextResponse.json(
      { error: { code: "misconfigured", message: "DATABASE_URL missing" } },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_body", message: "Geçersiz JSON." } },
      { status: 400 },
    );
  }

  try {
    const tag = assertCampaignTag(String(body.tag ?? ""));
    const subject = typeof body.subject === "string" ? body.subject : "";
    const htmlBody =
      typeof body.htmlBody === "string"
        ? body.htmlBody
        : typeof body.html_body === "string"
          ? body.html_body
          : "";
    const cookieStore = await cookies();
    const createdBy = getButceLoggedInUser(cookieStore) ?? null;

    const campaign = await createCampaign({
      tag,
      subject,
      htmlBody,
      createdBy,
    });

    return NextResponse.json({
      ok: true,
      campaign: {
        id: campaign.id,
        tag: campaign.tag,
        subject: campaign.subject,
        status: campaign.status,
        audienceCount: campaign.audience_count,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("invalid_tag")) {
      return NextResponse.json(
        { error: { code: "invalid_tag", message: "Geçersiz tag." } },
        { status: 400 },
      );
    }
    if (err instanceof Error && err.message === "invalid_subject") {
      return NextResponse.json(
        { error: { code: "invalid_subject", message: "Konu gerekli (max 200)." } },
        { status: 400 },
      );
    }
    if (err instanceof Error && err.message === "invalid_html") {
      return NextResponse.json(
        { error: { code: "invalid_html", message: "İçerik gerekli." } },
        { status: 400 },
      );
    }
    if (err instanceof SubscriptionDbNotConfiguredError) {
      return NextResponse.json(
        { error: { code: "misconfigured", message: "DATABASE_URL missing" } },
        { status: 503 },
      );
    }
    console.error("[newsletter-admin/campaigns]", err);
    return NextResponse.json(
      { error: { code: "persist_failed", message: "Kampanya oluşturulamadı." } },
      { status: 500 },
    );
  }
}
