"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import type { AboutIntroData } from "@/data/home";
import { Link } from "@/i18n/routing";

type AboutIntroProps = {
  data: AboutIntroData;
};

export function AboutIntro({ data }: AboutIntroProps): React.JSX.Element {
  return (
    <motion.section 
      className="wayon-section"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="wayon-container grid items-start gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
        <div>
          <h2 className="wayon-title whitespace-pre-line">
            {data.title}
          </h2>
        </div>

        <div className="max-w-[700px] md:pt-1">
          <div className="space-y-6">
            {data.paragraphs.map((paragraph) => (
              <p key={paragraph} className="wayon-copy">
                {paragraph}
              </p>
            ))}
          </div>
          <footer className="mt-8">
            <Link href={data.href} className="wayon-button-link text-[16px]">
              {data.cta}
              <ArrowRight className="size-4" />
            </Link>
          </footer>
        </div>
      </div>
    </motion.section>
  );
}
