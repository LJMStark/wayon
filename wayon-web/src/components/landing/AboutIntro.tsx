import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ABOUT_INTRO } from "@/data/home";

export function AboutIntro() {
  return (
    <section className="wayon-section">
      <div className="wayon-container grid items-start gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
        <div>
          <h2 className="wayon-title whitespace-pre-line">
            ABOUT
            <br />
            <strong>WAYON STONE</strong>
          </h2>
        </div>

        <div className="max-w-[700px] md:pt-1">
          <div className="space-y-6">
            {ABOUT_INTRO.paragraphs.map((paragraph) => (
              <p key={paragraph} className="wayon-copy">
                {paragraph}
              </p>
            ))}
          </div>
          <footer className="mt-8">
            <Link href={ABOUT_INTRO.href} className="wayon-button-link text-[16px]">
              {ABOUT_INTRO.cta}
              <ArrowRight className="size-4" />
            </Link>
          </footer>
        </div>
      </div>
    </section>
  );
}
