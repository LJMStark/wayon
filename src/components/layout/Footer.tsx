"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useMessages, useTranslations } from "next-intl";
import type { NavigationKey } from "@/data/navigation";

const ABOUT_LINKS = [
  { label: "whoAreWe", href: "/about#who-are-we" },
  { label: "factory", href: "/about#factory" },
  { label: "certificate", href: "/about#certificate" },
  { label: "download", href: "/download" },
] as const satisfies ReadonlyArray<{ label: NavigationKey; href: string }>;

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
] as const satisfies ReadonlyArray<{ label: NavigationKey; href: string }>;

const CASE_LINKS = [
  { label: "finishedProducts", href: "/solution" },
  { label: "applicationField", href: "/solution" },
  { label: "project", href: "/solution#case" },
  { label: "view360", href: "/solution" },
] as const satisfies ReadonlyArray<{ label: NavigationKey; href: string }>;

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/ZYLStoneGroup",
    icon: "/assets/icons/social/facebook.png",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/wayonstone/",
    icon: "/assets/icons/social/instagram.png",
  },
  {
    label: "Youtube",
    href: "https://www.youtube.com/channel/UC_SJpdXv6gQ9nhOzfO9XeLw",
    icon: "/assets/icons/social/youtube.png",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/wayonstone/",
    icon: "/assets/icons/social/linkedin.png",
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com",
    icon: "/assets/icons/social/pinterest.png",
  },
];

export default function Footer() {
  const tFooter = useTranslations("Footer");
  const tNav = useTranslations("Navigation");
  const messages = useMessages();
  const addressLines = messages.Footer.addressLines;
  const translateNav = (key: NavigationKey): string => tNav(key);
  const [contactValue, setContactValue] = useState("");

  return (
    <footer
      className="relative overflow-hidden bg-[color:var(--footer)] text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(17,17,17,0.94), rgba(17,17,17,0.97)), url('/assets/backgrounds/footer-bg.png')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
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

          <div>
            <h3 className="mb-4 text-[20px] font-medium text-white">{tFooter("aboutUs")}</h3>
            <ul className="space-y-2 text-[14px] font-light leading-7 text-white/70">
              {ABOUT_LINKS.map((link) => (
                <li key={translateNav(link.label)}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {translateNav(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[20px] font-medium text-white">{tFooter("collection")}</h3>
            <ul className="grid gap-x-8 gap-y-2 text-[14px] font-light leading-7 text-white/70 sm:grid-cols-2">
              {COLLECTION_LINKS.map((link) => (
                <li key={translateNav(link.label)}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {translateNav(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[20px] font-medium text-white">{tFooter("case")}</h3>
            <ul className="space-y-2 text-[14px] font-light leading-7 text-white/70">
              {CASE_LINKS.map((link) => (
                <li key={translateNav(link.label)}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {translateNav(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[20px] font-medium text-white">{tFooter("getFreeSample")}</h3>
            <form className="space-y-3" onSubmit={(event) => event.preventDefault()}>
              <input
                id="footer-contact"
                name="content"
                type="text"
                value={contactValue}
                onChange={(event) => setContactValue(event.target.value)}
                placeholder={tFooter("emailPlaceholder")}
                className="w-full border border-white/20 bg-white/5 px-4 py-3 text-[14px] text-white placeholder:text-white/40 focus:border-[color:var(--accent)] focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-[color:var(--primary)] px-4 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#0a3e6f]"
              >{tFooter("subscribe")}</button>
            </form>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link href="/contact" className="relative aspect-[230/68] overflow-hidden">
                <Image
                  src="/assets/footer/footer-link-1.png"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 45vw, 230px"
                  className="object-cover"
                />
              </Link>
              <Link href="/contact" className="relative aspect-[230/68] overflow-hidden">
                <Image
                  src="/assets/footer/footer-link-2.png"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 45vw, 230px"
                  className="object-cover"
                />
              </Link>
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
            <a
              href="https://www.wayon.com/page/privacy-policy.html"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-white"
            >{tFooter("privacyPolicy")}</a>
            <a
              href="https://www.wayon.com/page/terms-of-service.html"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-white"
            >{tFooter("termsOfService")}</a>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-white"
            >{tFooter("icp")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
