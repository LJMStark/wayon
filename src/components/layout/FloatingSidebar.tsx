"use client";

import { Link } from "@/i18n/routing";
import { ArrowUp, MessageCircleMore, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

import { getFloatingSidebarCopy } from "@/data/siteCopy";

const BUTTON_CLASS =
  "flex size-11 items-center justify-center border border-[#dddddd] bg-white text-[#333333] transition-colors hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-1";

function getSidebarClassName(isVisible: boolean): string {
  if (isVisible) {
    return "fixed bottom-6 right-4 z-40 hidden flex-col gap-2 transition-all duration-300 lg:flex translate-x-0 opacity-100";
  }

  return "fixed bottom-6 right-4 z-40 hidden flex-col gap-2 transition-all duration-300 lg:flex pointer-events-none translate-x-3 opacity-0";
}

type AnimateQrProps = {
  show: boolean;
  title: string;
  hint: string;
};

export default function FloatingSidebar(): React.JSX.Element {
  const locale = useLocale();
  const copy = getFloatingSidebarCopy(locale);
  const [showQr, setShowQr] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = (): void => {
      setIsVisible(window.scrollY > 540);
    };

    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility, { passive: true });

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div className={getSidebarClassName(isVisible)}>
      <div
        className="relative"
        onMouseEnter={() => setShowQr(true)}
        onMouseLeave={() => setShowQr(false)}
      >
        <button
          type="button"
          className={BUTTON_CLASS}
          aria-label={copy.showQr}
          onFocus={() => setShowQr(true)}
          onBlur={() => setShowQr(false)}
        >
          <QrCode className="size-5" aria-hidden="true" />
        </button>
        <AnimateQr show={showQr} title={copy.qrTitle} hint={copy.qrHint} />
      </div>

      <Link
        href="/contact"
        className={BUTTON_CLASS}
        aria-label={copy.contactUs}
      >
        <MessageCircleMore className="size-5" aria-hidden="true" />
      </Link>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={BUTTON_CLASS}
        aria-label={copy.backToTop}
      >
        <ArrowUp className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}

function AnimateQr({
  show,
  title,
  hint,
}: AnimateQrProps): React.JSX.Element | null {
  return show ? (
    <div className="absolute right-[calc(100%+12px)] top-1/2 w-44 -translate-y-1/2 border border-[color:var(--border)] bg-white p-4 text-center shadow-[0_0_1rem_rgba(0,0,0,0.08)]">
      <div className="flex aspect-square items-center justify-center bg-[color:var(--surface)] px-4 text-[12px] leading-5 text-[#4a4a4a]">
        {title}
      </div>
      <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-[#4a4a4a]">
        {hint}
      </p>
    </div>
  ) : null;
}
