"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import type { CaseItem } from "@/data/home";

type EngineeringCaseProps = {
  title: string;
  subtitle: string;
  items: CaseItem[];
};

export function EngineeringCase({
  title,
  subtitle,
  items,
}: EngineeringCaseProps): React.JSX.Element {
  return (
    <motion.section 
      id="case" 
      className="wayon-section"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="wayon-container">
        <header className="mb-8 md:mb-10">
          <h2 className="wayon-title text-[color:var(--primary)]">{title}</h2>
          <p className="wayon-copy mt-5 max-w-[780px]">
            {subtitle}
          </p>
        </header>

        <div className="grid gap-[5px] md:grid-cols-2">
          {items.map((item) => (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="group block overflow-hidden"
            >
              <figure className="relative">
                <div className="relative aspect-[8/5]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-black/40 px-4 py-4 text-center text-[16px] font-normal text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {item.title}
                </figcaption>
              </figure>
            </a>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
