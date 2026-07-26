import { NextResponse } from "next/server";
import {
  SubscriptionDbNotConfiguredError,
  isSubscriptionDbConfigured,
} from "@/lib/subscription/db";
import {
  assertCampaignTag,
  countAudience,
} from "@/lib/subscription/campaign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isSubscriptionDbConfigured()) {
    return NextResponse.json(
      { error: { code: "misconfigured", message: "DATABASE_URL missing" } },
      { status: 503 },
    );
  }

  const tagRaw = new URL(request.url).searchParams.get("tag") ?? "";
  try {
    const tag = assertCampaignTag(tagRaw);
    const count = await countAudience(tag);
    return NextResponse.json({ ok: true, tag, count });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("invalid_tag")) {
      return NextResponse.json(
        { error: { code: "invalid_tag", message: "Geçersiz tag." } },
        { status: 400 },
      );
    }
    if (err instanceof SubscriptionDbNotConfiguredError) {
      return NextResponse.json(
        { error: { code: "misconfigured", message: "DATABASE_URL missing" } },
        { status: 503 },
      );
    }
    console.error("[newsletter-admin/audience]", err);
    return NextResponse.json(
      { error: { code: "persist_failed", message: "Sayım başarısız." } },
      { status: 500 },
    );
  }
}
