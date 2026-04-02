import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingSidebar from "@/components/layout/FloatingSidebar";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.wayon.com"),
  title: "China Quartz Stone Manufacturers | Engineered Stone Factory - Wayon",
  description:
    "With over 40 years of expertise, WAYON offers premium quartz, marble, terrazzo, flexible stone, zero-silica quartz, and other engineered stone solutions for global commercial projects.",
  icons: {
    icon: "/assets/brand/favicon-wayon.jpg",
  },
  openGraph: {
    title: "China Quartz Stone Manufacturers | Engineered Stone Factory - Wayon",
    description:
      "With over 40 years of expertise, WAYON offers premium quartz, marble, terrazzo, flexible stone, zero-silica quartz, and other engineered stone solutions for global commercial projects.",
    url: "https://www.wayon.com/",
    siteName: "Wayon",
    images: [
      {
        url: "/assets/hero/home-hero-slide-2.png",
        width: 1920,
        height: 1080,
        alt: "Wayon Stone hero",
      },
    ],
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={`${montserrat.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col relative text-left rtl:text-right">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="grow flex flex-col">
            {children}
          </main>
          <Footer />
          <FloatingSidebar />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
