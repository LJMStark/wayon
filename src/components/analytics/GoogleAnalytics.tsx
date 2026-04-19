"use client";

import Script from "next/script";

export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      {/*
       * Consent Mode v2 defaults — must run before gtag.js loads.
       * We use strategy="afterInteractive" (the only safe strategy in App
       * Router layouts) and rely on dataLayer being flushed before the
       * gtag.js bundle executes because this script block is emitted first.
       * All consent types are denied by default; cookieless pings are sent.
       */}
      <Script id="ga-consent" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'denied',
          wait_for_update: 500
        });
      `}</Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${id}', { anonymize_ip: true });
      `}</Script>
    </>
  );
}
