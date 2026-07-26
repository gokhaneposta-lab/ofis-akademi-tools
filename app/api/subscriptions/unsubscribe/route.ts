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
import { unsubscribe } from "@/lib/subscription/service";
import {
  UnsubscribeSecretMissingError,
  isUnsubscribeSecretConfigured,
  verifyUnsubscribeToken,
} from "@/lib/subscription/unsubscribeToken";
import { isValidEmail, normalizeEmail } from "@/lib/subscription/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
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
  if (!isUnsubscribeSecretConfigured()) {
    return errorBody(
      "misconfigured",
      "Çıkış imzası yapılandırılmamış (UNSUBSCRIBE_SECRET).",
      503,
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorBody("invalid_body", "Geçersiz JSON.", 400);
  }

  const emailRaw = typeof body.email === "string" ? body.email : "";
  const email = normalizeEmail(emailRaw);
  if (!isValidEmail(email)) {
    return errorBody("invalid_email", "Geçerli bir e-posta gerekli.", 400);
  }

  const token = typeof body.token === "string" ? body.token : "";
  try {
    if (!verifyUnsubscribeToken(email, token)) {
      return errorBody("invalid_token", "Geçersiz veya süresi dolmuş token.", 401);
    }
  } catch (err) {
    if (err instanceof UnsubscribeSecretMissingError) {
      return errorBody(
        "misconfigured",
        "Çıkış imzası yapılandırılmamış (UNSUBSCRIBE_SECRET).",
        503,
      );
    }
    throw err;
  }

  if (isSubscribeRateLimited({ ip: clientIp(request), email })) {
    return errorBody(
      "rate_limited",
      "Çok fazla istek. Lütfen daha sonra tekrar dene.",
      429,
    );
  }

  try {
    const result = await unsubscribe({
      email,
      reason: normalizeReason(body.reason ?? "manual"),
      channel: normalizeChannel(body.channel ?? "email_footer"),
    });

    return NextResponse.json({
      ok: true,
      outcome: result.outcome,
      email: result.email,
      tags: result.tags,
      resendOk: result.resendOk,
    });
  } catch (err) {
    if (err instanceof SubscriptionDbNotConfiguredError) {
      return errorBody(
        "misconfigured",
        "Abonelik veritabanı yapılandırılmamış (DATABASE_URL).",
        503,
      );
    }
    if (err instanceof Error && err.name === "SubscriberNotFoundError") {
      return errorBody("not_found", "Abone bulunamadı.", 404);
    }
    console.error("[subscriptions/unsubscribe] persist_failed", err);
    return errorBody(
      "persist_failed",
      "Çıkış tamamlanamadı. Lütfen daha sonra tekrar dene.",
      500,
    );
  }
}
