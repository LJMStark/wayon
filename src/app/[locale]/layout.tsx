import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingSidebar from "@/components/layout/FloatingSidebar";
import { fontVariableClassName } from "@/app/font-config";
import { buildPageMetadata } from "@/lib/metadata";
import { getLocaleDirection } from "@/i18n/types";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { getCommonCopy, getMetadataCopy } from "@/data/siteCopy";
import { getLocaleParams } from "@/features/shared/server/locale";
import { organizationJsonLd } from "@/lib/jsonLd";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { BaiduAnalytics } from "@/components/analytics/BaiduAnalytics";
import { routing } from "@/i18n/routing";

export function generateStaticParams(): Array<{ locale: string }> {
  return routing.locales.map((locale) => ({ locale }));
}

// Open the TCP/TLS connection to the R2 (Cloudflare) media origin early. The
// home hero videos and other media are served directly from R2, so preconnecting
// shaves the connection setup off the first media request. Null-safe: emits no
// tag if the public R2 URL is unset.
const R2_PRECONNECT_ORIGIN = (() => {
  try {
    // Same resolution order as the media URL builder (src/data/home.ts): the
    // public var is preferred, but only R2_PUBLIC_URL is set in this project's
    // env. Read server-side and baked into the SSR HTML (the R2 domain is public).
    const url =
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? process.env.R2_PUBLIC_URL;
    return url ? new URL(url).origin : null;
  } catch {
    return null;
  }
})();

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
  const commonCopy = getCommonCopy(locale);

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${fontVariableClassName} h-full`}
      suppressHydrationWarning
    >
      <head>
        {R2_PRECONNECT_ORIGIN ? (
          <link rel="preconnect" href={R2_PRECONNECT_ORIGIN} />
        ) : null}
        {/* Preload the home hero video poster image. This is the LCP element
         * on the home page. Declared statically in <head> so the browser's
         * preload scanner discovers it in the first HTML chunk, before the
         * streamed body containing the actual <video poster="..."> tag is
         * flushed (Next 16 + React 19 stream the body after the head, so a
         * <link> rendered from a server component in page.tsx arrives at the
         * client too late to race with the critical CSS). The URL matches
         * HERO_SLIDE_CONFIG[0].poster in src/data/home.ts — if that changes,
         * update here. Wasted bandwidth on non-home pages (~157KB) is offset
         * by the 30-day /assets cache header. */}
        <link
          rel="preload"
          as="image"
          href="/assets/about/zyl-global-pavilion.webp"
          fetchPriority="high"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(locale)).replace(/</g, "\\u003c") }}
        />
      </head>
      <body className="min-h-full flex flex-col relative overflow-x-clip text-left rtl:text-right">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[200] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#002b50] focus:shadow-lg"
        >
          {commonCopy.skipToMain}
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main id="main-content" className="grow flex flex-col">
            {children}
          </main>
          <Footer />
          <FloatingSidebar />
        </NextIntlClientProvider>
        <GoogleAnalytics />
        <BaiduAnalytics />
      </body>
    </html>
  );
}
