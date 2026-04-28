import type { SVGProps } from "react";

import type { SocialPlatform } from "@/data/socialLinks";

type SocialIconProps = SVGProps<SVGSVGElement> & {
  platform: SocialPlatform;
};

export function SocialIcon({
  platform,
  ...props
}: SocialIconProps): React.JSX.Element {
  switch (platform) {
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
          <path d="M14.2 22v-7.4h2.7l.4-3.1h-3.1V9.6c0-.9.3-1.6 1.6-1.6h1.7V5.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H8v3.1h2.8V22h3.4Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="4.5"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="2" />
          <circle cx="16.8" cy="7.2" r="1.2" fill="currentColor" />
        </svg>
      );
    case "pinterest":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
          <path d="M12.1 2C6.6 2 3.2 5.9 3.2 9.8c0 2.4 1.3 4.2 3.2 4.9.3.1.5 0 .6-.3.1-.2.2-.8.3-1 .1-.3 0-.4-.2-.7-.6-.7-.9-1.6-.9-2.6 0-3.5 2.6-6.8 6.7-6.8 3.7 0 5.7 2.2 5.7 5.2 0 3.9-1.7 7.2-4.3 7.2-1.4 0-2.4-1.1-2.1-2.5.4-1.6 1.1-3.4 1.1-4.6 0-1.1-.6-1.9-1.7-1.9-1.3 0-2.4 1.4-2.4 3.3 0 1.2.4 2 .4 2s-1.4 5.8-1.6 6.8c-.5 2.1-.1 4.7 0 5 .1.2.3.2.4.1.2-.3 2.5-3.1 3.3-5.9.2-.8 1.2-4.6 1.2-4.6.6 1.1 2.2 2.1 3.9 2.1 5.1 0 8.6-4.7 8.6-10.9C21.3 5.5 17.3 2 12.1 2Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
          <rect
            x="3.5"
            y="6.5"
            width="17"
            height="11"
            rx="3"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="m10.5 9.6 4.8 2.9-4.8 2.9V9.6Z" fill="currentColor" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
          <path d="M14.7 3c.4 2.4 1.8 4 4.4 4.2V10c-1.5 0-2.9-.5-4.1-1.4v6.2c0 3.2-2.6 5.8-5.8 5.8s-5.8-2.6-5.8-5.8S6 9 9.2 9c.4 0 .8 0 1.2.1v3.2c-.4-.2-.8-.3-1.2-.3-1.6 0-2.8 1.3-2.8 2.8s1.3 2.8 2.8 2.8 2.8-1.3 2.8-2.8V3h2.7Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
          <path d="M6.4 8.7H3.5V20h2.9V8.7ZM5 4C4 4 3.2 4.7 3.2 5.7S4 7.4 5 7.4s1.8-.7 1.8-1.7S6 4 5 4Zm15.8 9.8c0-3.1-1.7-5.3-4.6-5.3-1.5 0-2.6.8-3.1 1.6V8.7h-2.8V20h2.9v-6c0-1.6.8-2.8 2.3-2.8 1.4 0 2.3 1 2.3 2.8v6h3v-6.2Z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
          <path
            d="M5.1 19.2 6 16.1A7.9 7.9 0 1 1 8 18l-2.9 1.2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M9.2 8.7c.2-.5.4-.5.8-.5h.6c.2 0 .5 0 .7.5l.5 1.2c.2.4.1.6-.1.9l-.4.5c-.1.2-.2.3 0 .6.4.8 1.1 1.5 2 2 .3.2.5.2.6 0l.6-.7c.2-.2.4-.3.8-.2l1.3.6c.4.2.5.4.5.6 0 .4-.2 1.1-.8 1.6-.4.4-1 .6-1.8.5-1.5-.2-3.3-1-4.7-2.4-1.4-1.4-2.4-3.4-2.5-4.8 0-.7.3-1.2.6-1.5.3-.4.7-.5 1.3-.5Z"
            fill="currentColor"
          />
        </svg>
      );
  }
}
