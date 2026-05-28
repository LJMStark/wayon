import localFont from "next/font/local";
import { Inter } from "next/font/google";

// Latin variable font for body text in en/es and any extended-Latin glyphs
// (e.g. Spanish á/é/í/ó/ú/ñ) outside the NotoSansSC subset.
export const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

export const cairo = localFont({
  src: "./fonts/Cairo.woff2",
  variable: "--font-cairo",
  weight: "200 1000",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const playfair = localFont({
  src: "./fonts/PlayfairDisplay.woff2",
  variable: "--font-playfair",
  weight: "400 900",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const notoSansSc = localFont({
  src: "./fonts/NotoSansSC-Subset.woff2",
  variable: "--font-noto-sans-sc",
  weight: "400 700",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const geourceSans = localFont({
  // Bold listed first so if preload is ever turned back on, next/font emits
  // <link rel="preload"> for the LCP weight (.zyl-hero-title at font-weight: 700).
  src: [
    {
      path: "./fonts/GeourceSansCHS-Bold-Subset.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/GeourceSansCHS-Regular-Subset.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/GeourceSansCHS-Medium-Subset.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-geource-sans",
  display: "swap",
  // Disabled 2026-05-28 after PSI flagged 3 woff2 preloads as the single
  // largest render-blocking request on mobile home — ~2,850 ms of LCP
  // budget gated on font download. With `display: swap` the browser
  // paints with the CJK fallback immediately and seamlessly swaps to
  // GeourceSans once the font lands (~1-2s on slow 4G). Stable-state
  // typography is unchanged — only the first-visit cold-start sees the
  // temporary system-font frame.
  preload: false,
  // Disable next/font's default Latin Arial fallback. Without this, the
  // generated --font-geource-sans variable resolves to
  // `"geourceSans", "geourceSans Fallback"` where the Fallback face is
  // `local(Arial)` with metrics tuned for Latin glyphs. Arial almost
  // always matches on the user's system, so the browser uses it during
  // the swap window — but Arial has no CJK coverage AND its metrics do
  // not match Chinese characters, producing the CLS we measured at 0.303.
  // Turning this off lets our hand-rolled "GeourceSansFallback" @font-face
  // (declared in globals.css with CJK-tuned override metrics) become the
  // real fallback, dramatically reducing layout shift on font swap.
  // The other locale fonts already pass `false` for the same reason.
  adjustFontFallback: false,
});

export const fontVariableClassName = [
  cairo.variable,
  playfair.variable,
  notoSansSc.variable,
  geourceSans.variable,
  inter.variable,
].join(" ");
