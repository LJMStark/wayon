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

type FooterLegalKey = "privacyPolicy" | "termsOfService";

const ABOUT_LINKS = [
  { label: "whoAreWe", href: "/about#who-are-we" },
  { label: "factory", href: "/about#factory" },
  { label: "certificate", href: "/about#certificate" },
  { label: "download", href: "/download" },
] as const satisfies ReadonlyArray<FooterLink>;

const QUICK_LINKS = [
  { label: "home", href: "/" },
  { label: "collection", href: "/products" },
  { label: "solution", href: "/solution" },
  { label: "news", href: "/news" },
  { label: "contactUs", href: "/contact" },
] as const satisfies ReadonlyArray<FooterLink>;

const LEGAL_LINKS = [
  { label: "privacyPolicy", href: "/privacy" },
  { label: "termsOfService", href: "/terms" },
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

function SectionHeading({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="mb-5">
      <h3 className="text-[17px] font-semibold text-white">{children}</h3>
      <div className="mt-2 h-0.5 w-8 bg-[color:var(--accent)]" />
    </div>
  );
}

const footerBackgroundStyle = {
  backgroundImage:
    "linear-gradient(rgba(0, 43, 80, 0.94), rgba(0, 43, 80, 0.97)), url('/assets/backgrounds/footer-bg.png')",
  backgroundPosition: "center",
  backgroundSize: "cover",
};

export default function Footer(): React.JSX.Element {
  const tFooter = useTranslations("Footer");
  const tNav = useTranslations("Navigation");
  const messages = useMessages();
  const addressLines = messages.Footer.addressLines;
  const translateNav = (key: NavigationKey): string => tNav(key);
  const [contactValue, setContactValue] = useState("");
  const router = useRouter();

  const handleSubscribeSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = contactValue.trim();
    const target = trimmed ? `/contact?email=${encodeURIComponent(trimmed)}` : "/contact";
    router.push(target);
  };

  return (
    <footer
      className="relative overflow-hidden bg-[color:var(--footer)] text-white"
      style={footerBackgroundStyle}
    >
      <div className="wayon-container px-[15px] py-16 md:py-20">
        {/* Main grid */}
        <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-[2fr_1fr_1fr_1.6fr] md:gap-10">

          {/* Col 1 — Logo + Newsletter + Social */}
          <div className="flex flex-col gap-6">
            <Link href="/">
              <Image
                src="/assets/brand/logo-wayon-white.png"
                alt="Wayon Stone"
                width={160}
                height={48}
                className="object-contain object-left"
              />
            </Link>

            <div>
              <SectionHeading>{tFooter("getFreeSample")}</SectionHeading>
              <form className="flex gap-2" onSubmit={handleSubscribeSubmit}>
                <input
                  id="footer-contact"
                  name="email"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={tFooter("emailPlaceholder")}
                  className="min-w-0 flex-1 border border-white/20 bg-white/5 px-3 py-2.5 text-[13px] text-white placeholder:text-white/40 focus:border-[color:var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-1"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-[color:var(--primary)] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0a3e6f]"
                >
                  {tFooter("subscribe")}
                </button>
              </form>
            </div>

            <div>
              <p className="mb-4 text-[13px] leading-relaxed text-white/60">
                {tFooter("followUs")}
              </p>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="relative flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/5 transition-colors hover:border-white/60"
                    aria-label={link.label}
                  >
                    <Image
                      src={link.icon}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-contain p-2"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2 — About Us */}
          <div>
            <SectionHeading>{tFooter("aboutUs")}</SectionHeading>
            <ul className="space-y-3 text-[14px] font-light leading-relaxed text-white/70">
              {ABOUT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {translateNav(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Quick Links */}
          <div>
            <SectionHeading>{tFooter("quickLinks")}</SectionHeading>
            <ul className="space-y-3 text-[14px] font-light leading-relaxed text-white/70">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {translateNav(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Address */}
          <div>
            <SectionHeading>{tFooter("address")}</SectionHeading>
            <ul className="space-y-3 text-[14px] font-light leading-relaxed text-white/70">
              {addressLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-4 pt-6 text-[13px] font-light text-white/50 md:flex-row md:items-center">
          <p>{tFooter("rights")}</p>
          <div className="flex flex-wrap items-center gap-4">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="transition-colors hover:text-white">
                {tFooter(link.label)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
