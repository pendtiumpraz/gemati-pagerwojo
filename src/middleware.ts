import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { isRouteAllowed, type Role } from "@/lib/menu";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev_secret_change_me"
);
const COOKIE = "gemati_session";

async function readSession(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as { role: Role; nama: string };
  } catch {
    return null;
  }
}

const PUBLIC = ["/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await readSession(req);

  // halaman publik
  if (PUBLIC.includes(pathname)) {
    if (session) return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.next();
  }

  // root → dashboard/login
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(session ? "/dashboard" : "/login", req.url)
    );
  }

  // butuh login
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // guard role untuk halaman (bukan API)
  if (!isRouteAllowed(session.role, pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico)$).*)",
  ],
};
