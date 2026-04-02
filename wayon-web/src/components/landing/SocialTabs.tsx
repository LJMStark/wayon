"use client";

import { useState } from "react";
import Image from "next/image";

import { SOCIAL_PLATFORMS } from "@/data/home";

export function SocialTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePlatform = SOCIAL_PLATFORMS[activeIndex];

  return (
    <section className="wayon-section pb-20">
      <div className="wayon-container">
        <header className="mb-8">
          <h2 className="wayon-title">SOCIAL MEDIA</h2>
          <h3 className="mt-4 text-[24px] font-light text-[#333333]">Follow our updates</h3>
        </header>

        <div className="flex flex-col overflow-hidden md:h-[49rem] md:flex-row">
          <div className="md:w-[22.857%]">
            <div className="grid md:h-full md:grid-rows-7">
              {SOCIAL_PLATFORMS.map((platform, index) => (
                <button
                  key={platform.name}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`flex items-center gap-4 border-b border-[color:var(--border)] bg-white px-5 py-4 text-left transition-colors md:px-8 ${
                    index === activeIndex ? "bg-[color:var(--surface)]" : "hover:bg-[color:var(--surface)]"
                  }`}
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
            style={{ backgroundImage: "url('/assets/backgrounds/social-section-bg.png')" }}
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
