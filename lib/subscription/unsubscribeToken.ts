import { createHmac, timingSafeEqual } from "crypto";
import { normalizeEmail } from "./validate";

/** Default token lifetime: 90 days. */
export const UNSUBSCRIBE_TOKEN_TTL_SEC = 90 * 24 * 60 * 60;

export class UnsubscribeSecretMissingError extends Error {
  constructor() {
    super("UNSUBSCRIBE_SECRET is not configured");
    this.name = "UnsubscribeSecretMissingError";
  }
}

function requireSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET?.trim();
  if (!secret) throw new UnsubscribeSecretMissingError();
  return secret;
}

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Token format: base64url(email.exp).sig
 * Secret: UNSUBSCRIBE_SECRET (dedicated; do not derive from other secrets).
 */
export function createUnsubscribeToken(
  email: string,
  ttlSec: number = UNSUBSCRIBE_TOKEN_TTL_SEC,
): string {
  const secret = requireSecret();
  const normalized = normalizeEmail(email);
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const payload = `${normalized}.${exp}`;
  const body = Buffer.from(payload, "utf8").toString("base64url");
  const sig = signPayload(payload, secret);
  return `${body}.${sig}`;
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!token || typeof token !== "string") return false;
  const secret = requireSecret();
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [body, sig] = parts;
  if (!body || !sig) return false;

  let payload: string;
  try {
    payload = Buffer.from(body, "base64url").toString("utf8");
  } catch {
    return false;
  }

  const expectedSig = signPayload(payload, secret);
  if (!safeEqual(sig, expectedSig)) return false;

  const lastDot = payload.lastIndexOf(".");
  if (lastDot <= 0) return false;
  const tokenEmail = payload.slice(0, lastDot);
  const expRaw = payload.slice(lastDot + 1);
  const exp = Number(expRaw);
  if (!Number.isFinite(exp)) return false;
  if (Math.floor(Date.now() / 1000) > exp) return false;

  return tokenEmail === normalizeEmail(email);
}

export function isUnsubscribeSecretConfigured(): boolean {
  return Boolean(process.env.UNSUBSCRIBE_SECRET?.trim());
}
