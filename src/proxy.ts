import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

// `/studio` and `/studio/*` are explicitly excluded: Sanity Studio is a
// locale-agnostic admin UI mounted at src/app/studio/[[...tool]]/page.tsx.
// Without this exclusion, next-intl would 307 /studio → /zh/studio, which
// has no matching App Router segment and 404s.
export const config = {
  matcher: [
    "/",
    "/(en|zh|es|ar|ru)/:path*",
    "/((?!api|_next|_vercel|studio|.*\\..*).*)",
  ],
};
