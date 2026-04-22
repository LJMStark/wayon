import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

// `/admin` is locale-agnostic (Payload admin under src/app/(payload)/). Without
// the exclusion, next-intl would 307 /admin → /zh/admin, which has no matching
// App Router segment and 404s.
export const config = {
  matcher: [
    "/",
    "/(en|zh|es|ar|ru)/:path*",
    "/((?!api|_next|_vercel|admin|.*\\..*).*)",
  ],
};
