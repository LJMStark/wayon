"use client";

import Image from "next/image";
import { useMessages, useTranslations } from "next-intl";
import { useState } from "react";

import type { NavigationKey } from "@/data/navigation";
import { Link, useRouter } from "@/i18n/routing";

type FooterLink = {
  label: NavigationKey;
  href: string;
};

type FooterSection = {
  title: string;
  links: readonly FooterLink[];
  listClassName: string;
};

type FooterLegalKey = "privacyPolicy" | "termsOfService";

type FooterLinkSectionProps = FooterSection & {
  translateNav: (key: NavigationKey) => string;
};

const ABOUT_LINKS = [
  { label: "whoAreWe", href: "/about#who-are-we" },
  { label: "factory", href: "/about#factory" },
  { label: "certificate", href: "/about#certificate" },
  { label: "download", href: "/download" },
] as const satisfies ReadonlyArray<FooterLink>;

const COLLECTION_LINKS = [
  { label: "quartzStone", href: "/products?category=quartz" },
  { label: "terrazzo", href: "/products?category=terrazzo" },
  { label: "flexibleStone", href: "/products?category=flexible-stone" },
  { label: "marble", href: "/products?category=marble" },
  { label: "gemStone", href: "/products?category=gem-stone" },
  { label: "cementStone", href: "/products?category=cement-stone" },
  { label: "artificialMarble", href: "/products?category=artificial-marble" },
  { label: "porcelainSlab", href: "/products?category=porcelain-slab" },
  { label: "silicaFree", href: "/products?category=silica-free" },
] as const satisfies ReadonlyArray<FooterLink>;

const CASE_LINKS = [
  { label: "finishedProducts", href: "/solution" },
  { label: "applicationField", href: "/solution" },
  { label: "project", href: "/solution#case" },
  { label: "view360", href: "/solution" },
] as const satisfies ReadonlyArray<FooterLink>;

const FOOTER_PROMO_LINKS = [
  { href: "/contact", image: "/assets/footer/footer-link-1.png" },
  { href: "/contact", image: "/assets/footer/footer-link-2.png" },
] as const;

const LEGAL_LINKS = [
  {
    label: "privacyPolicy",
    href: "/privacy",
  },
  {
    label: "termsOfService",
    href: "/terms",
  },
] as const satisfies ReadonlyArray<{ label: FooterLegalKey; href: string }>;

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/zyl.stone.slab/",
    icon: "/assets/icons/social/instagram.png",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@ZYLStoneSlabEngineering",
    icon: "/assets/icons/social/youtube.png",
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/ZYLstoneslabengineering/",
    icon: "/assets/icons/social/pinterest.png",
  },
] as const;

function FooterLinkSection({
  title,
  links,
  listClassName,
  translateNav,
}: FooterLinkSectionProps): React.JSX.Element {
  return (
    <div>
      <h3 className="mb-4 text-[20px] font-medium text-white">{title}</h3>
      <ul className={listClassName}>
        {links.map((link) => (
          <li key={translateNav(link.label)}>
            <Link href={link.href} className="transition-colors hover:text-white">
              {translateNav(link.label)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer(): React.JSX.Element {
  const tFooter = useTranslations("Footer");
  const tNav = useTranslations("Navigation");
  const messages = useMessages();
  const addressLines = messages.Footer.addressLines;
  const translateNav = (key: NavigationKey): string => tNav(key);
  const [contactValue, setContactValue] = useState("");
  const router = useRouter();

  // The newsletter/subscribe affordance does not have its own backend
  // (no Resend Audience, no dedicated schema). Instead of silently
  // swallowing the submission, forward the visitor to the contact
  // page with their email prefilled so the inquiry pipeline handles
  // the follow-up.
  const handleSubscribeSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = contactValue.trim();
    const target = trimmed ? `/contact?email=${encodeURIComponent(trimmed)}` : "/contact";
    router.push(target);
  };
  const footerSections: FooterSection[] = [
    {
      title: tFooter("aboutUs"),
      links: ABOUT_LINKS,
      listClassName: "space-y-2 text-[14px] font-light leading-7 text-white/70",
    },
    {
      title: tFooter("collection"),
      links: COLLECTION_LINKS,
      listClassName:
        "grid gap-x-8 gap-y-2 text-[14px] font-light leading-7 text-white/70 sm:grid-cols-2",
    },
    {
      title: tFooter("case"),
      links: CASE_LINKS,
      listClassName: "space-y-2 text-[14px] font-light leading-7 text-white/70",
    },
  ];
  const footerBackgroundStyle = {
    backgroundImage:
      "linear-gradient(rgba(17,17,17,0.94), rgba(17,17,17,0.97)), url('/assets/backgrounds/footer-bg.png')",
    backgroundPosition: "center",
    backgroundSize: "cover",
  };

  return (
    <footer className="relative overflow-hidden bg-[color:var(--footer)] text-white" style={footerBackgroundStyle}>
      <div className="wayon-container px-[15px] py-16 md:py-20">
        <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-[1.05fr_0.9fr_1.15fr_0.8fr_1.1fr] md:gap-10">
          <div>
            <h3 className="mb-4 text-[20px] font-medium text-white">{tFooter("address")}</h3>
            <div className="space-y-2 text-[14px] font-light leading-7 text-white/70">
              {addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <FooterLinkSection
              key={section.title}
              title={section.title}
              links={section.links}
              listClassName={section.listClassName}
              translateNav={translateNav}
            />
          ))}

          <div>
            <h3 className="mb-4 text-[20px] font-medium text-white">{tFooter("getFreeSample")}</h3>
            <form className="space-y-3" onSubmit={handleSubscribeSubmit}>
              <input
                id="footer-contact"
                name="email"
                type="email"
                value={contactValue}
                onChange={(event) => setContactValue(event.target.value)}
                placeholder={tFooter("emailPlaceholder")}
                className="w-full border border-white/20 bg-white/5 px-4 py-3 text-[14px] text-white placeholder:text-white/40 focus:border-[color:var(--accent)] focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-[color:var(--primary)] px-4 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#0a3e6f]"
              >
                {tFooter("subscribe")}
              </button>
            </form>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {FOOTER_PROMO_LINKS.map((link) => (
                <Link key={link.image} href={link.href} className="relative aspect-[230/68] overflow-hidden">
                  <Image
                    src={link.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 45vw, 230px"
                    className="object-cover"
                  />
                </Link>
              ))}
            </div>

            <h3 className="mb-4 mt-6 text-[20px] font-medium text-white">{tFooter("followUs")}</h3>
            <div className="flex flex-wrap gap-3">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="relative flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/5 transition-colors hover:border-white/60"
                  aria-label={link.label}
                >
                  <Image src={link.icon} alt="" fill sizes="40px" className="object-contain p-2.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 py-6 text-[13px] font-light text-white/50 md:flex-row md:items-center">
          <p>{tFooter("rights")}</p>
          <div className="flex flex-wrap items-center gap-4">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {tFooter(link.label)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
