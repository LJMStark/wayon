// Public absolute URL of the deployment. Used by sitemap/robots/Open Graph
// to emit canonical URLs. Optional: falls back to the canonical production
// domain so local dev and preview builds still produce valid absolute URLs.
// Production deployments SHOULD set this to their serving origin
// (e.g. https://wayon.vercel.app or https://www.zylsinteredstone.com).
const DEFAULT_SITE_URL = "https://www.zylsinteredstone.com";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL !== ""
    ? process.env.NEXT_PUBLIC_SITE_URL
    : DEFAULT_SITE_URL;
