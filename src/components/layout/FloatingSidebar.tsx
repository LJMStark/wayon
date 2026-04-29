"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";

import { SOCIAL_LINKS } from "@/data/socialLinks";
import {
  getSocialIconBrandColor,
  SocialIcon,
} from "@/components/ui/SocialIcon";

const BUTTON_CLASS =
  "group flex size-11 items-center justify-center rounded-full border border-white/90 bg-white text-[var(--social-brand-color)] shadow-[0_10px_30px_rgba(2,22,40,0.2)] backdrop-blur-md transition-[transform,border-color] duration-200 hover:scale-105 hover:border-[var(--social-brand-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#083355]";

const TRIGGER_BUTTON_CLASS =
  "flex size-12 items-center justify-center rounded-full border border-white/30 bg-[#083355]/80 text-white shadow-[0_16px_34px_rgba(2,22,40,0.28)] backdrop-blur-md transition-[transform,border-color,background-color] duration-200 hover:scale-105 hover:border-white/60 hover:bg-[#083355]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#083355]";

const SIDEBAR_CLASS =
  "fixed bottom-24 right-3 z-40 translate-x-0 opacity-100 sm:right-4 lg:bottom-6";

function getLinksClassName(isExpanded: boolean): string {
  if (isExpanded) {
    return "absolute bottom-full right-0 mb-3 flex flex-col gap-2 transition-[transform,opacity] duration-200 translate-y-0 opacity-100";
  }

  return "absolute bottom-full right-0 mb-3 flex flex-col gap-2 transition-[transform,opacity] duration-200 pointer-events-none translate-y-3 opacity-0";
}

export default function FloatingSidebar(): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded]);

  return (
    <div
      ref={rootRef}
      className={SIDEBAR_CLASS}
      onMouseEnter={() => {
        setIsExpanded(true);
      }}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget instanceof Node ? event.relatedTarget : null;

        if (!event.currentTarget.contains(nextTarget)) {
          setIsExpanded(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setIsExpanded(false);
        }
      }}
    >
      <nav
        id="floating-social-links"
        aria-label="Social media links"
        aria-hidden={!isExpanded}
        className={getLinksClassName(isExpanded)}
      >
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={BUTTON_CLASS}
            style={
              {
                "--social-brand-color": getSocialIconBrandColor(link.platform),
              } as CSSProperties
            }
            tabIndex={isExpanded ? undefined : -1}
            aria-label={link.label}
            title={link.label}
          >
            <SocialIcon platform={link.platform} className="size-5" />
          </a>
        ))}
      </nav>

      <button
        type="button"
        className={TRIGGER_BUTTON_CLASS}
        aria-controls="floating-social-links"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Close social links" : "Open social links"}
        onClick={() => setIsExpanded((current) => !current)}
      >
        {isExpanded ? (
          <X className="size-5" aria-hidden="true" strokeWidth={2.2} />
        ) : (
          <MessageCircle className="size-5" aria-hidden="true" strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
}
