import type { Metadata } from "next";
import { Montserrat, Cairo } from "next/font/google";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingSidebar from "@/components/layout/FloatingSidebar";
import { buildPageMetadata } from "@/lib/metadata";
import { getLocaleDirection } from "@/i18n/types";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getMetadataCopy } from "@/data/siteCopy";
import { getLocaleParams } from "@/features/shared/server/locale";
import { SanityLive } from "@/sanity/lib/live";
import { organizationJsonLd } from "@/lib/jsonLd";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { BaiduAnalytics } from "@/components/analytics/BaiduAnalytics";
import { SentryInit } from "@/components/analytics/SentryInit";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await getLocaleParams(params);
  const metadataCopy = getMetadataCopy(locale).root;

  return buildPageMetadata({
    locale,
    title: metadataCopy.title,
    description: metadataCopy.description,
    imageAlt: metadataCopy.imageAlt,
    includeIcons: true,
  });
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await getLocaleParams(params);
  setRequestLocale(locale);
  const messages = await getMessages({ locale });
  const direction = getLocaleDirection(locale);

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${montserrat.variable} ${cairo.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        {/* Warm up the Sanity image CDN early — every page pulls cover and */}
        {/* variant imagery from cdn.sanity.io, so paying the TCP+TLS cost */}
        {/* during HTML parsing saves several hundred ms on LCP. */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="//cdn.sanity.io" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(locale)) }}
        />
      </head>
      <body className="min-h-full flex flex-col relative text-left rtl:text-right">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="grow flex flex-col">
            {children}
          </main>
          <Footer />
          <FloatingSidebar />
          <SanityLive />
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
        <BaiduAnalytics />
        <SentryInit />
      </body>
    </html>
  );
}
