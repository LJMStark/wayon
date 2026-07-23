import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import {
  resolveProductsCatalogRequest,
} from "@/features/products/model/productsSearchParams";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

function getCatalogNotFoundUrl(request: NextRequest): URL {
  const pathnameLocale = request.nextUrl.pathname.split("/")[1];
  const locale =
    routing.locales.find((candidate) => candidate === pathnameLocale) ??
    routing.defaultLocale;

  return new URL(`/${locale}/catalog-not-found`, request.url);
}

export default function proxy(request: NextRequest): NextResponse {
  const resolution = resolveProductsCatalogRequest(request.method, request.url);

  if (resolution.type === "notFound") {
    return NextResponse.rewrite(getCatalogNotFoundUrl(request), {
      status: 404,
      headers: { "X-Robots-Tag": "noindex" },
    });
  }

  if (resolution.type === "redirect") {
    return NextResponse.redirect(resolution.location, 308);
  }

  return handleI18nRouting(request);
}

// `/admin` is locale-agnostic (Payload admin under src/app/(payload)/). Without
// the exclusion, next-intl would 307 /admin → /zh/admin, which has no matching
// App Router segment and 404s.
export const config = {
  matcher: [
    "/",
    "/(en|zh|es|ar)/:path*",
    "/((?!api|_next|_vercel|admin|.*\\..*).*)",
  ],
};
