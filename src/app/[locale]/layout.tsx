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
