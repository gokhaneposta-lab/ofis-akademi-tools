import { NextResponse } from "next/server";
import {
  SubscriptionDbNotConfiguredError,
  isSubscriptionDbConfigured,
} from "@/lib/subscription/db";
import { isSubscribeRateLimited } from "@/lib/subscription/rateLimit";
import { subscribe } from "@/lib/subscription/service";
import { isValidEmail, normalizeEmail } from "@/lib/subscription/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Deprecated wrapper → Domain subscribe.
 * Old clients keep { success: true }. No duplicate welcome mail.
 */
export async function POST(request: Request) {
  try {
    if (!isSubscriptionDbConfigured()) {
      return NextResponse.json(
        { error: "Abonelik veritabanı yapılandırılmamış." },
        { status: 503 },
      );
    }

    const body = await request.json();
    const emailRaw = typeof body.email === "string" ? body.email : "";
    const email = normalizeEmail(emailRaw);
    const sourceRaw = typeof body.source === "string" ? body.source.trim() : "";
    const source =
      sourceRaw.length > 0 && sourceRaw.length <= 64 ? sourceRaw : "unknown";

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "E-posta gerekli." }, { status: 400 });
    }

    console.info(
      `[abone] deprecated_endpoint=abone source=${source} email=${email}`,
    );

    if (isSubscribeRateLimited({ ip: clientIp(request), email })) {
      return NextResponse.json(
        { error: "Çok fazla istek. Lütfen daha sonra tekrar dene." },
        { status: 429 },
      );
    }

    const page =
      source === "unknown"
        ? "/"
        : source.startsWith("/")
          ? source
          : `/${source}`;

    const result = await subscribe({
      email,
      page,
      reason: "signup_form",
      channel: "legacy_api",
    });

    return NextResponse.json({
      success: true,
      ok: true,
      outcome: result.outcome,
      email: result.email,
      category: result.category,
      tags: result.tags,
      welcomeSent: result.welcomeSent,
      /** @deprecated use /api/subscriptions */
      deprecated: true,
    });
  } catch (err) {
    if (err instanceof SubscriptionDbNotConfiguredError) {
      return NextResponse.json(
        { error: "Abonelik veritabanı yapılandırılmamış." },
        { status: 503 },
      );
    }
    console.error("Abone API error:", err);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen daha sonra tekrar dene." },
      { status: 500 },
    );
  }
}
