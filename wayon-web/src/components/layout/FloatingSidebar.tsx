"use client";

import Link from "next/link";
import { ArrowUp, MessageCircleMore, QrCode } from "lucide-react";
import { useEffect, useState } from "react";

const BUTTON_CLASS =
  "flex size-11 items-center justify-center border border-[#dddddd] bg-white text-[#333333] transition-colors hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]";

export default function FloatingSidebar() {
  const [showQr, setShowQr] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 540);
    };

    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility, { passive: true });

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-4 z-40 hidden flex-col gap-2 transition-all duration-300 lg:flex ${
        isVisible ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-3 opacity-0"
      }`}
    >
      <div
        className="relative"
        onMouseEnter={() => setShowQr(true)}
        onMouseLeave={() => setShowQr(false)}
      >
        <button type="button" className={BUTTON_CLASS} aria-label="Show QR">
          <QrCode className="size-5" />
        </button>
        <AnimateQr show={showQr} />
      </div>

      <a
        href="https://wayonstone.com"
        className={`${BUTTON_CLASS} text-[13px] font-medium`}
        aria-label="Switch to Chinese"
      >
        简
      </a>

      <Link
        href="/contact"
        className={BUTTON_CLASS}
        aria-label="Contact us"
      >
        <MessageCircleMore className="size-5" />
      </Link>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={BUTTON_CLASS}
        aria-label="Back to top"
      >
        <ArrowUp className="size-5" />
      </button>
    </div>
  );
}

function AnimateQr({ show }: { show: boolean }) {
  return show ? (
    <div className="absolute right-[calc(100%+12px)] top-1/2 w-44 -translate-y-1/2 border border-[color:var(--border)] bg-white p-4 text-center shadow-[0_0_1rem_rgba(0,0,0,0.08)]">
      <div className="flex aspect-square items-center justify-center bg-[color:var(--surface)] px-4 text-[12px] leading-5 text-[#666666]">
        WeChat QR Code
      </div>
      <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-[#666666]">
        Scan to connect
      </p>
    </div>
  ) : null;
}
