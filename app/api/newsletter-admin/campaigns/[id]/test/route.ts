import { NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/subscription/campaign";
import {
  SubscriptionDbNotConfiguredError,
  isSubscriptionDbConfigured,
} from "@/lib/subscription/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
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

  const to = typeof body.to === "string" ? body.to : "";
  const { id } = await ctx.params;

  try {
    const result = await sendTestEmail({ campaignId: id, to });
    if (!result.ok) {
      const code = result.error ?? "send_failed";
      const status =
        code === "not_found" ? 404 : code === "invalid_email" ? 400 : 502;
      return NextResponse.json(
        {
          error: {
            code,
            message:
              code === "invalid_email"
                ? "Geçerli test e-postası gerekli."
                : code === "not_found"
                  ? "Kampanya yok."
                  : "Test maili gönderilemedi.",
          },
        },
        { status },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof SubscriptionDbNotConfiguredError) {
      return NextResponse.json(
        { error: { code: "misconfigured", message: "DATABASE_URL missing" } },
        { status: 503 },
      );
    }
    console.error("[newsletter-admin/test]", err);
    return NextResponse.json(
      { error: { code: "persist_failed", message: "Test başarısız." } },
      { status: 500 },
    );
  }
}
