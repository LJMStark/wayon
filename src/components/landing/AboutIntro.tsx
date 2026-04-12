import { ArrowRight } from "lucide-react";

import type { AboutIntroData } from "@/data/home";
import { Link } from "@/i18n/routing";

type AboutIntroProps = {
  data: AboutIntroData;
};

export function AboutIntro({ data }: AboutIntroProps): React.JSX.Element {
  return (
    <section className="wayon-section">
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
    </section>
  );
}
