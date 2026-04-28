export type SocialPlatform =
  | "facebook"
  | "instagram"
  | "pinterest"
  | "youtube"
  | "tiktok"
  | "linkedin"
  | "whatsapp";

export type SocialLink = {
  label: string;
  href: string;
  platform: SocialPlatform;
};

export const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/ZYLSinteredStone",
    platform: "facebook",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/zylsinteredstone/",
    platform: "instagram",
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/ZYLSinteredStone/",
    platform: "pinterest",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@ZYLStoneSlabEngineering",
    platform: "youtube",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@zylsinteredstone",
    platform: "tiktok",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/zylsinteredstone/",
    platform: "linkedin",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/8613202957096",
    platform: "whatsapp",
  },
] as const satisfies ReadonlyArray<SocialLink>;
