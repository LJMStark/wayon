import Image from "next/image";
import Link from "next/link";

import { NEWS_FEATURE, NEWS_ITEMS } from "@/data/home";

export function NewsSection() {
  return (
    <section className="wayon-section pb-16">
      <div className="wayon-container">
        <header className="mb-8 md:mb-10">
          <h2 className="wayon-title">NEWS</h2>
        </header>

        <div className="grid gap-10 lg:grid-cols-[0.46fr_0.54fr] lg:gap-16">
          <article>
            <Link href={NEWS_FEATURE.href} className="group block">
              <div className="relative mb-5 aspect-[129/76] overflow-hidden bg-[color:var(--surface)]">
                <Image
                  src={NEWS_FEATURE.image}
                  alt={NEWS_FEATURE.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-[20px] font-medium leading-[1.6] text-[#262626]">
                {NEWS_FEATURE.title}
              </h3>
              <p className="mt-4 text-[16px] font-light leading-[1.7] text-[#737373]">
                {NEWS_FEATURE.excerpt}
              </p>
            </Link>
          </article>

          <div>
            <ul>
              {NEWS_ITEMS.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-6 border-b border-[color:var(--border)] py-6 transition-colors hover:text-[color:var(--primary)]"
                  >
                    <h3 className="max-w-[75%] text-[20px] font-normal leading-[1.45] text-[#2e2e2e]">
                      {item.title}
                    </h3>
                    <time className="shrink-0 text-right text-[color:var(--primary)]">
                      <span className="block text-[42px] font-bold leading-none md:text-[56px]">
                        {item.day}
                      </span>
                      <span className="text-[14px] font-light">{item.yearMonth}</span>
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
