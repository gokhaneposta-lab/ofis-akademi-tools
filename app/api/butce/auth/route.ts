import { NextResponse } from "next/server";
import {
  BUTCE_SESSION_COOKIE,
  BUTCE_USER_COOKIE,
  butceSessionToken,
  isButceAuthConfigured,
  verifyButceCredentials,
} from "@/lib/butce/auth";

export async function POST(request: Request) {
  if (!isButceAuthConfigured()) {
    return NextResponse.json({ error: "Panel yapılandırılmamış" }, { status: 503 });
  }

  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");

  if (!verifyButceCredentials(username, password)) {
    return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
  res.cookies.set(BUTCE_SESSION_COOKIE, butceSessionToken()!, cookieOpts);
  res.cookies.set(BUTCE_USER_COOKIE, username.toLocaleLowerCase("tr-TR"), cookieOpts);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  const clear = { httpOnly: true, path: "/", maxAge: 0 };
  res.cookies.set(BUTCE_SESSION_COOKIE, "", clear);
  res.cookies.set(BUTCE_USER_COOKIE, "", clear);
  return res;
}
