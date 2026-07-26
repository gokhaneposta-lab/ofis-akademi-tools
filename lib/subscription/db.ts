import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | null = null;

export function isSubscriptionDbConfigured(): boolean {
  return Boolean(sanitizeDatabaseUrl(process.env.DATABASE_URL));
}

function sanitizeDatabaseUrl(raw: string | undefined | null): string | null {
  if (!raw) return null;
  let u = raw.trim();
  if (
    (u.startsWith('"') && u.endsWith('"')) ||
    (u.startsWith("'") && u.endsWith("'"))
  ) {
    u = u.slice(1, -1).trim();
  }
  return u || null;
}

/** Lazy Neon client — DATABASE_URL yoksa null. */
export function getSubscriptionSql(): NeonQueryFunction<false, false> | null {
  const url = sanitizeDatabaseUrl(process.env.DATABASE_URL);
  if (!url) return null;
  if (!sql) sql = neon(url);
  return sql;
}

export class SubscriptionDbNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not set");
    this.name = "SubscriptionDbNotConfiguredError";
  }
}

export function requireSubscriptionSql(): NeonQueryFunction<false, false> {
  const client = getSubscriptionSql();
  if (!client) throw new SubscriptionDbNotConfiguredError();
  return client;
}
