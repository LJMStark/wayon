"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const ADDRESS_LINES = [
  "Showroom: Foshan, Guangdong, China",
  "Factory 1&2 :Yunfu, Guangdong, China",
  "Factory 3 :Heyuan, Guangdong, China",
];

const ABOUT_LINKS = [
  { label: "Who Are We", href: "/about#who-are-we" },
  { label: "Factory", href: "/about#factory" },
  { label: "Certificate", href: "/about#certificate" },
  { label: "Download", href: "/download" },
];

const COLLECTION_LINKS = [
  { label: "Quartz Stone", href: "/products?category=quartz" },
  { label: "Terrazzo", href: "/products?category=terrazzo" },
  { label: "Flexible Stone", href: "/products?category=flexible-stone" },
  { label: "Marble", href: "/products?category=marble" },
  { label: "Gem Stone", href: "/products?category=gem-stone" },
  { label: "Cement Stone", href: "/products?category=cement-stone" },
  { label: "Artifical Marble", href: "/products?category=artificial-marble" },
  { label: "Porcelain Slab", href: "/products?category=porcelain-slab" },
  { label: "Silica-Free Stone", href: "/products?category=silica-free" },
];

const CASE_LINKS = [
  { label: "Finished Products", href: "/solution" },
  { label: "Application field", href: "/solution" },
  { label: "Project", href: "/solution#case" },
  { label: "360°View", href: "/solution" },
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/WayonStoneGroup",
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
            <h3 className="mb-4 text-[20px] font-medium text-white">Address</h3>
            <div className="space-y-2 text-[14px] font-light leading-7 text-white/70">
              {ADDRESS_LINES.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[20px] font-medium text-white">About Us</h3>
            <ul className="space-y-2 text-[14px] font-light leading-7 text-white/70">
              {ABOUT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[20px] font-medium text-white">Collection</h3>
            <ul className="grid gap-x-8 gap-y-2 text-[14px] font-light leading-7 text-white/70 sm:grid-cols-2">
              {COLLECTION_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[20px] font-medium text-white">Case</h3>
            <ul className="space-y-2 text-[14px] font-light leading-7 text-white/70">
              {CASE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[20px] font-medium text-white">Get Free Sample</h3>
            <form className="space-y-3" onSubmit={(event) => event.preventDefault()}>
              <input
                id="footer-contact"
                name="content"
                type="text"
                value={contactValue}
                onChange={(event) => setContactValue(event.target.value)}
                placeholder="Your Email/WhatsApp/Phone/Wechat"
                className="w-full border border-white/20 bg-white/5 px-4 py-3 text-[14px] text-white placeholder:text-white/40 focus:border-[color:var(--accent)] focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-[color:var(--primary)] px-4 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#0a3e6f]"
              >
                Subscribe
              </button>
            </form>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <a href="/contact" className="relative aspect-[230/68] overflow-hidden">
                <Image
                  src="/assets/footer/footer-link-1.png"
                  alt="footer-link-1"
                  fill
                  sizes="(max-width: 768px) 45vw, 230px"
                  className="object-cover"
                />
              </a>
              <a href="/contact" className="relative aspect-[230/68] overflow-hidden">
                <Image
                  src="/assets/footer/footer-link-2.png"
                  alt="footer-link-2"
                  fill
                  sizes="(max-width: 768px) 45vw, 230px"
                  className="object-cover"
                />
              </a>
            </div>

            <h3 className="mb-4 mt-6 text-[20px] font-medium text-white">Follow Us</h3>
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
          <p>© 2026 WAYON STONE CO., LTD. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://www.wayon.com/page/privacy-policy.html"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </a>
            <a
              href="https://www.wayon.com/page/terms-of-service.html"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-white"
            >
              Terms of Service
            </a>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-white"
            >
              粤ICP备13028888号
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
