"use client";

import type { CSSProperties } from "react";

import { SOCIAL_LINKS, type SocialPlatform } from "@/data/socialLinks";
import {
  getSocialIconBrandColor,
  SocialIcon,
} from "@/components/ui/SocialIcon";

const VISIBLE_PLATFORMS: ReadonlySet<SocialPlatform> = new Set([
  "facebook",
  "instagram",
  "tiktok",
  "linkedin",
  "whatsapp",
]);

const VISIBLE_LINKS = SOCIAL_LINKS.filter((link) =>
  VISIBLE_PLATFORMS.has(link.platform),
);

const BUTTON_CLASS =
  "group flex size-11 items-center justify-center rounded-full border border-white/90 bg-white text-[var(--social-brand-color)] shadow-[0_10px_30px_rgba(2,22,40,0.2)] backdrop-blur-md transition-[transform,border-color] duration-200 hover:scale-105 hover:border-[var(--social-brand-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#083355]";

const SIDEBAR_CLASS =
  "fixed bottom-24 right-3 z-40 flex flex-col gap-2 sm:right-4 lg:bottom-6";

export default function FloatingSidebar(): React.JSX.Element {
  return (
    <nav
      aria-label="Social media links"
      className={SIDEBAR_CLASS}
    >
      {VISIBLE_LINKS.map((link) => (
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
          aria-label={link.label}
          title={link.label}
        >
          <SocialIcon platform={link.platform} className="size-5" />
        </a>
      ))}
    </nav>
  );
}
