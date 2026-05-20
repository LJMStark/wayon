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
  // Bold listed first so next/font emits <link rel="preload"> for the LCP weight
  // used by the home Hero (.zyl-hero-title at font-weight: 700).
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
  preload: true,
});

export const fontVariableClassName = [
  cairo.variable,
  playfair.variable,
  notoSansSc.variable,
  geourceSans.variable,
  inter.variable,
].join(" ");
