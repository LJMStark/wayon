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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(locale)) }}
        />
      </head>
      <body className="min-h-full flex flex-col relative text-left rtl:text-right">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[200] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#002b50] focus:shadow-lg"
        >
          Skip to main content
        </a>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main id="main-content" className="grow flex flex-col">
            {children}
          </main>
          <Footer />
          <FloatingSidebar />
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
