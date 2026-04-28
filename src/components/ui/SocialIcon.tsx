import type { CSSProperties } from "react";
import Image from "next/image";
import type { SimpleIcon } from "simple-icons";
import {
  siFacebook,
  siInstagram,
  siPinterest,
  siTiktok,
  siWhatsapp,
  siYoutube,
} from "simple-icons";

import type { SocialPlatform } from "@/data/socialLinks";

type SimpleIconPlatform = Exclude<SocialPlatform, "linkedin">;

type SocialIconProps = {
  platform: SocialPlatform;
  className?: string;
  style?: CSSProperties;
  variant?: "default" | "brand";
};

const SIMPLE_ICON_MAP = {
  facebook: siFacebook,
  instagram: siInstagram,
  pinterest: siPinterest,
  youtube: siYoutube,
  tiktok: siTiktok,
  whatsapp: siWhatsapp,
} satisfies Record<SimpleIconPlatform, SimpleIcon>;

const LINKEDIN_ICON = {
  brandColor: "#0A66C2",
  brandSrc: "/assets/social/linkedin-in-blue.png",
  src: "/assets/social/linkedin-in-white.png",
};

export function getSocialIconBrandColor(platform: SocialPlatform): string {
  if (platform === "linkedin") {
    return LINKEDIN_ICON.brandColor;
  }

  return `#${SIMPLE_ICON_MAP[platform].hex}`;
}

export function SocialIcon({
  platform,
  className,
  style,
  variant = "brand",
}: SocialIconProps): React.JSX.Element {
  const brandStyle =
    variant === "brand"
      ? ({
          color: getSocialIconBrandColor(platform),
          ...style,
        } satisfies CSSProperties)
      : style;

  if (platform === "linkedin") {
    if (variant === "brand") {
      return (
        <span
          aria-hidden="true"
          className={`relative inline-block ${className ?? ""}`}
          style={brandStyle}
        >
          <Image
            src={LINKEDIN_ICON.brandSrc}
            alt=""
            width={24}
            height={24}
            className="size-full object-contain"
            draggable={false}
          />
        </span>
      );
    }

    return (
      <span
        aria-hidden="true"
        className={`relative inline-block ${className ?? ""}`}
        style={style}
      >
        <Image
          src={LINKEDIN_ICON.src}
          alt=""
          width={24}
          height={24}
          className="size-full object-contain transition-opacity duration-200 group-hover:opacity-0"
          draggable={false}
        />
        <Image
          src={LINKEDIN_ICON.brandSrc}
          alt=""
          width={24}
          height={24}
          className="absolute inset-0 size-full object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          draggable={false}
        />
      </span>
    );
  }

  const icon = SIMPLE_ICON_MAP[platform];

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      style={brandStyle}
    >
      <path d={icon.path} />
    </svg>
  );
}
