"use client";

import { useEffect, useState } from "react";

import { SOCIAL_LINKS } from "@/data/socialLinks";
import { SocialIcon } from "@/components/ui/SocialIcon";

const BUTTON_CLASS =
  "flex size-11 items-center justify-center border border-[#dddddd] bg-white text-[#333333] transition-colors hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-1";

function getSidebarClassName(isVisible: boolean): string {
  if (isVisible) {
    return "fixed bottom-6 right-4 z-40 hidden flex-col gap-2 transition-all duration-300 lg:flex translate-x-0 opacity-100";
  }

  return "fixed bottom-6 right-4 z-40 hidden flex-col gap-2 transition-all duration-300 lg:flex pointer-events-none translate-x-3 opacity-0";
}

export default function FloatingSidebar(): React.JSX.Element {
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
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={BUTTON_CLASS}
          aria-label={link.label}
          title={link.label}
        >
          <SocialIcon platform={link.platform} className="size-5" />
        </a>
      ))}
    </div>
  );
}
