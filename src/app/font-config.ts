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

export const lxgwMarker = localFont({
  src: "./fonts/LXGWMarkerGothic-Regular-WayonSubset.woff2",
  variable: "--font-lxgw-marker",
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const notoSansSc = localFont({
  src: "./fonts/NotoSansSC.ttf",
  variable: "--font-noto-sans-sc",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const geourceSans = localFont({
  src: [
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
    {
      path: "./fonts/GeourceSansCHS-Bold-WayonSubset.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geource-sans",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const fontVariableClassName = [
  cairo.variable,
  playfair.variable,
  lxgwMarker.variable,
  notoSansSc.variable,
  geourceSans.variable,
].join(" ");
