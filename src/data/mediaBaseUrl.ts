/**
 * Single source of truth for the public R2 media origin.
 *
 * Why this module exists: the origin used to be written out by hand in several
 * places (the navigation preview images, the home hero videos) on top of the two
 * env vars. When the bucket moved off R2's Public Development URL
 * (`pub-*.r2.dev` — rate-limited, uncacheable, and blocked by ISPs in Turkey,
 * South Korea and mainland China) onto the custom domain, every copy had to be
 * hunted down individually. Import from here instead of writing the host again.
 *
 * Client/server parity matters: `src/data/navigation.ts` is pulled into the
 * client Header bundle. Next.js inlines `NEXT_PUBLIC_*` at build time but leaves
 * non-public vars `undefined` in the browser, so `DEFAULT_R2_PUBLIC_URL` below
 * must stay in sync with whatever `R2_PUBLIC_URL` is set to on the server.
 * If they diverge, SSR and hydration emit different `src` attributes.
 */
const DEFAULT_R2_PUBLIC_URL = "https://cdn.zylsinteredstone.com";

export const R2_PUBLIC_BASE_URL = (
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  process.env.R2_PUBLIC_URL ||
  DEFAULT_R2_PUBLIC_URL
).replace(/\/+$/, "");

/**
 * Build an absolute URL for a file stored in the media bucket.
 *
 * `pathname` is used as-is apart from a leading-slash trim, so callers keep
 * control over percent-encoding — R2 object keys here include CJK filenames
 * that must stay encoded (see `encodeMediaUrl` in ./_payload.ts).
 */
export function mediaAssetUrl(pathname: string): string {
  return `${R2_PUBLIC_BASE_URL}/${pathname.replace(/^\/+/, "")}`;
}
