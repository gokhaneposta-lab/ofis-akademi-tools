export const EXAM_ATTEMPT_COOKIE = "exam_attempt_id";

export function attemptCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.max(60, maxAgeSeconds),
  };
}
