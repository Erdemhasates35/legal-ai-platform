import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "../utils/supabase/middleware";

const protectedPaths = ["/dashboard", "/admin", "/courtroom"];

function isProtected(pathname: string) {
  return protectedPaths.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

export async function middleware(request: NextRequest) {
  if (!isProtected(request.nextUrl.pathname)) return NextResponse.next();

  const { supabase, response, user } = await updateSession(request);

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_approved")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_approved) {
    const url = request.nextUrl.clone();
    url.pathname = "/pending";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (request.nextUrl.pathname.startsWith("/admin") && profile.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/courtroom/:path*"],
};
