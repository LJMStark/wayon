"use client";

import Script from "next/script";

export function BaiduAnalytics() {
  const id = process.env.NEXT_PUBLIC_BAIDU_TONGJI_ID;
  if (!id) return null;

  return (
    <Script
      src={`https://hm.baidu.com/hm.js?${id}`}
      strategy="afterInteractive"
    />
  );
}
