import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  BUTCE_SESSION_COOKIE,
  BUTCE_USER_COOKIE,
  isNewsletterAdminUser,
  verifyButceSession,
} from "@/lib/butce/auth";

const BUTCE_PREFIX = "/butce";
const NEWSLETTER_ADMIN_PREFIX = "/newsletter-admin";
const NEWSLETTER_API_PREFIX = "/api/newsletter-admin";

function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith(BUTCE_PREFIX) ||
    pathname.startsWith(NEWSLETTER_ADMIN_PREFIX) ||
    pathname.startsWith(NEWSLETTER_API_PREFIX)
  );
}

function isNewsletterPath(pathname: string): boolean {
  return (
    pathname.startsWith(NEWSLETTER_ADMIN_PREFIX) ||
    pathname.startsWith(NEWSLETTER_API_PREFIX)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (
    pathname === `${BUTCE_PREFIX}/login` ||
    pathname.startsWith("/api/butce/auth")
  ) {
    return NextResponse.next();
  }

  const token = process.env.BUTCE_SESSION_TOKEN?.trim();
  if (!token) {
    if (pathname.startsWith(NEWSLETTER_API_PREFIX) || pathname.startsWith("/api/butce")) {
      return NextResponse.json(
        { error: "Panel yapılandırılmamış (BUTCE_SESSION_TOKEN)." },
        { status: 503 },
      );
    }
    return new NextResponse("Panel yapılandırılmamış (BUTCE_SESSION_TOKEN).", {
      status: 503,
    });
  }

  const session = request.cookies.get(BUTCE_SESSION_COOKIE)?.value;
  if (!verifyButceSession(session)) {
    if (
      pathname.startsWith("/api/butce") ||
      pathname.startsWith(NEWSLETTER_API_PREFIX)
    ) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const login = new URL(`${BUTCE_PREFIX}/login`, request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  // Newsletter: oturum yetmez — yalnızca NEWSLETTER_ADMIN_USERS listesindeki kullanıcı
  if (isNewsletterPath(pathname)) {
    const user = request.cookies.get(BUTCE_USER_COOKIE)?.value;
    if (!isNewsletterAdminUser(user)) {
      if (pathname.startsWith(NEWSLETTER_API_PREFIX)) {
        return NextResponse.json(
          { error: "Newsletter Admin yetkisi yok." },
          { status: 403 },
        );
      }
      return new NextResponse("Newsletter Admin yetkisi yok.", { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/butce/:path*",
    "/api/butce/:path*",
    "/newsletter-admin",
    "/newsletter-admin/:path*",
    "/api/newsletter-admin/:path*",
  ],
};
