"use client";

import Image from "next/image";
import { useState } from "react";

import type { SocialPlatform } from "@/data/home";

const SOCIAL_SECTION_STYLE = {
  backgroundImage: "url('/assets/backgrounds/social-section-bg.png')",
};

function getPlatformButtonClassName(isActive: boolean): string {
  if (isActive) {
    return "flex items-center gap-4 border-b border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-4 text-left transition-colors md:px-8";
  }

  return "flex items-center gap-4 border-b border-[color:var(--border)] bg-white px-5 py-4 text-left transition-colors hover:bg-[color:var(--surface)] md:px-8";
}

type SocialTabsProps = {
  title: string;
  subtitle: string;
  platforms: SocialPlatform[];
};

export function SocialTabs({
  title,
  subtitle,
  platforms,
}: SocialTabsProps): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePlatform = platforms[activeIndex];

  return (
    <section className="wayon-section pb-20">
      <div className="wayon-container">
        <header className="mb-8">
          <h2 className="wayon-title">{title}</h2>
          <h3 className="mt-4 text-[24px] font-light text-[#333333]">{subtitle}</h3>
        </header>

        <div className="flex flex-col overflow-hidden md:h-[49rem] md:flex-row">
          <div className="md:w-[22.857%]">
            <div className="grid gap-px md:h-full md:auto-rows-fr">
              {platforms.map((platform, index) => (
                <button
                  key={platform.name}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={getPlatformButtonClassName(index === activeIndex)}
                >
                  <div className="relative size-[34px] shrink-0">
                    <Image
                      src={platform.icon}
                      alt=""
                      fill
                      sizes="34px"
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[18px] font-light text-[#333333]">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div
            className="flex-1 bg-cover bg-center bg-no-repeat px-5 py-6 md:px-10 md:py-10"
            style={SOCIAL_SECTION_STYLE}
          >
            <div className="grid gap-6 md:grid-cols-3">
              {activePlatform.posts.map((post) => (
                <a
                  key={post.title}
                  href={post.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group block"
                >
                  <div className="relative mb-4 aspect-square overflow-hidden bg-white">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="line-clamp-3 text-[14px] font-light leading-[1.5] text-[#333333]">
                    {post.title}
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
