import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BUTCE_SESSION_COOKIE, verifyButceSession } from "@/lib/butce/auth";

const BUTCE_PREFIX = "/butce";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith(BUTCE_PREFIX)) {
    return NextResponse.next();
  }

  if (pathname === `${BUTCE_PREFIX}/login` || pathname.startsWith("/api/butce/auth")) {
    return NextResponse.next();
  }

  const token = process.env.BUTCE_SESSION_TOKEN?.trim();
  if (!token) {
    return new NextResponse("Bütçe paneli yapılandırılmamış (BUTCE_SESSION_TOKEN).", { status: 503 });
  }

  const session = request.cookies.get(BUTCE_SESSION_COOKIE)?.value;
  if (!verifyButceSession(session)) {
    if (pathname.startsWith("/api/butce")) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const login = new URL(`${BUTCE_PREFIX}/login`, request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/butce/:path*", "/api/butce/:path*"],
};
