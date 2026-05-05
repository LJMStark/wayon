import localFont from "next/font/local";

export const cairo = localFont({
  src: "./fonts/Cairo.ttf",
  variable: "--font-cairo",
  weight: "200 1000",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const playfair = localFont({
  src: "./fonts/PlayfairDisplay.ttf",
  variable: "--font-playfair",
  weight: "400 900",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const notoSansSc = localFont({
  src: "./fonts/NotoSansSC-WayonSubset.woff2",
  variable: "--font-noto-sans-sc",
  weight: "400 700",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const geourceSans = localFont({
  // Bold listed first so next/font emits <link rel="preload"> for the LCP weight
  // used by the home Hero (.wayon-hero-title at font-weight: 700).
  src: [
    {
      path: "./fonts/GeourceSansCHS-Bold-WayonSubset.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/GeourceSansCHS-Regular-WayonSubset.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/GeourceSansCHS-Medium-WayonSubset.woff2",
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
].join(" ");
