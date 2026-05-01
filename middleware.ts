import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  // La ruta "/" ahora es pública (Landing Page)
  const isPublicRoute = ["/", "/login", "/register", "/moderators/login"].includes(nextUrl.pathname);
  const isAuthRoute = ["/login", "/register", "/moderators/login"].includes(nextUrl.pathname);

  if (isApiAuthRoute) return NextResponse.next();

  if (isAuthRoute) {
    if (isLoggedIn) {
      // Si ya está logueado e intenta ir a login/register, lo mandamos a su lugar
      const target = (role === "ADMIN" || role === "MODERATOR") ? "/dashboard" : "/inicio";
      return NextResponse.redirect(new URL(target, nextUrl));
    }
    return NextResponse.next();
  }

  // Si no está logueado y no es una ruta pública, al login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Redirección inteligente post-login según rol
  if (isLoggedIn && !isPublicRoute) {
    // Si un ADMIN entra a /inicio, lo mandamos a su panel
    if ((role === "ADMIN" || role === "MODERATOR") && nextUrl.pathname === "/inicio") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    // Si un CLIENTE intenta entrar al panel admin, lo mandamos a inicio
    if (role === "CLIENT" && nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/inicio", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
