import { NextResponse } from "next/server";
import {
  SubscriptionDbNotConfiguredError,
  isSubscriptionDbConfigured,
} from "@/lib/subscription/db";
import { isSubscribeRateLimited } from "@/lib/subscription/rateLimit";
import {
  normalizeChannel,
  normalizeReason,
} from "@/lib/subscription/rules";
import { subscribe } from "@/lib/subscription/service";
import type { UtmPayload } from "@/lib/subscription/types";
import {
  isValidEmail,
  normalizeEmail,
  normalizeReferrer,
  normalizeSessionId,
} from "@/lib/subscription/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function parseUtm(raw: unknown): UtmPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return {
    source: typeof o.source === "string" ? o.source : null,
    medium: typeof o.medium === "string" ? o.medium : null,
    campaign: typeof o.campaign === "string" ? o.campaign : null,
    term: typeof o.term === "string" ? o.term : null,
    content: typeof o.content === "string" ? o.content : null,
  };
}

function errorBody(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  if (!isSubscriptionDbConfigured()) {
    return errorBody(
      "misconfigured",
      "Abonelik veritabanı yapılandırılmamış (DATABASE_URL).",
      503,
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorBody("invalid_body", "Geçersiz JSON.", 400);
  }

  if ("category" in body || "tag" in body || "interest" in body) {
    console.info("[subscriptions] client category/tag ignored");
  }

  const emailRaw = typeof body.email === "string" ? body.email : "";
  const email = normalizeEmail(emailRaw);
  if (!isValidEmail(email)) {
    return errorBody("invalid_email", "Geçerli bir e-posta gerekli.", 400);
  }

  const page =
    typeof body.page === "string" && body.page.trim()
      ? body.page.trim()
      : "/";

  if (isSubscribeRateLimited({ ip: clientIp(request), email })) {
    return errorBody(
      "rate_limited",
      "Çok fazla istek. Lütfen daha sonra tekrar dene.",
      429,
    );
  }

  try {
    const result = await subscribe({
      email,
      page,
      reason: normalizeReason(body.reason),
      channel: normalizeChannel(body.channel),
      referrer: normalizeReferrer(body.referrer),
      sessionId: normalizeSessionId(body.session_id ?? body.sessionId),
      utm: parseUtm(body.utm),
    });

    return NextResponse.json({
      ok: true,
      outcome: result.outcome,
      email: result.email,
      category: result.category,
      tags: result.tags,
      welcomeSent: result.welcomeSent,
    });
  } catch (err) {
    if (err instanceof SubscriptionDbNotConfiguredError) {
      return errorBody(
        "misconfigured",
        "Abonelik veritabanı yapılandırılmamış (DATABASE_URL).",
        503,
      );
    }
    console.error("[subscriptions] persist_failed", err);
    return errorBody(
      "persist_failed",
      "Kayıt tamamlanamadı. Lütfen daha sonra tekrar dene.",
      500,
    );
  }
}

/** Sprint 1 health — DATABASE_URL tanımlı mı. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: isSubscriptionDbConfigured(),
    sprint: 1,
  });
}
