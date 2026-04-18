function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined || v === "") {
    throw new Error(errorMessage);
  }
  return v;
}

// Public absolute URL of the deployment. Used by sitemap/robots/Open Graph
// to emit canonical URLs. Optional: falls back to the canonical production
// domain so local dev and preview builds still produce valid absolute URLs.
// Production deployments SHOULD set this to their serving origin
// (e.g. https://wayon.vercel.app or https://www.zylsinteredstone.com).
const DEFAULT_SITE_URL = "https://www.zylstone.com";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL !== ""
    ? process.env.NEXT_PUBLIC_SITE_URL
    : DEFAULT_SITE_URL;

export const sanityApiToken = assertValue(
  process.env.SANITY_API_TOKEN,
  "Missing environment variable: SANITY_API_TOKEN"
);

export const resendApiKey = assertValue(
  process.env.RESEND_API_KEY,
  "Missing environment variable: RESEND_API_KEY"
);

export const resendFromEmail = assertValue(
  process.env.RESEND_FROM_EMAIL,
  "Missing environment variable: RESEND_FROM_EMAIL"
);

export const inquiryNotifyTo = assertValue(
  process.env.INQUIRY_NOTIFY_TO,
  "Missing environment variable: INQUIRY_NOTIFY_TO"
);
