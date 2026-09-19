import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | null = null;

export function isExamDbConfigured(): boolean {
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

/** Lazy Neon client — same DATABASE_URL as newsletter/subscription. */
export function getExamSql(): NeonQueryFunction<false, false> | null {
  const url = sanitizeDatabaseUrl(process.env.DATABASE_URL);
  if (!url) return null;
  if (!sql) sql = neon(url);
  return sql;
}

export class ExamDbNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not set");
    this.name = "ExamDbNotConfiguredError";
  }
}

export function requireExamSql(): NeonQueryFunction<false, false> {
  const client = getExamSql();
  if (!client) throw new ExamDbNotConfiguredError();
  return client;
}
