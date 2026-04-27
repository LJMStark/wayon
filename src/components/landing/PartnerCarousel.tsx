import type { CSSProperties } from "react";

import type { PartnerItem } from "@/data/home";
import type { PartnerCarouselCopy } from "@/features/home/types";

const SCALE_CLASS_NAMES: Record<PartnerItem["scale"], string> = {
  sm: "partner-cloud__item--sm",
  md: "partner-cloud__item--md",
  lg: "partner-cloud__item--lg",
  xl: "partner-cloud__item--xl",
};

const TONE_CLASS_NAMES: Record<PartnerItem["tone"], string> = {
  muted: "partner-cloud__item--muted",
  primary: "partner-cloud__item--primary",
  strong: "partner-cloud__item--strong",
};

type PartnerWordStyle = CSSProperties & {
  "--partner-delay": string;
  "--partner-drift": string;
  "--partner-x": string;
  "--partner-y": string;
};

type PartnerCarouselProps = {
  title: string;
  description: string;
  items: PartnerItem[];
  copy: PartnerCarouselCopy;
};

function getPartnerWordStyle(partner: PartnerItem): PartnerWordStyle {
  return {
    "--partner-delay": `${partner.delay}ms`,
    "--partner-drift": `${partner.drift}px`,
    "--partner-x": `${partner.x}%`,
    "--partner-y": `${partner.y}%`,
  };
}

export function PartnerCarousel({
  title,
  description,
  items,
}: PartnerCarouselProps): React.JSX.Element {
  return (
    <section className="partner-cloud wayon-section pb-16 md:pb-20">
      <div className="wayon-container-wide">
        <div className="partner-cloud__canvas">
          <header className="relative z-10 mx-auto max-w-3xl text-center">
            <p className="text-[14px] font-medium leading-none tracking-[0] text-[color:var(--primary)]">
              {description}
            </p>
            <h2 className="mt-3 text-[clamp(2.2rem,4vw,3.4rem)] font-light leading-tight tracking-[0] text-[#242424]">
              {title}
            </h2>
          </header>

          <div className="partner-cloud__stage" aria-hidden="true">
            {items.map((partner) => (
              <span
                key={partner.title}
                className={[
                  "partner-cloud__item",
                  SCALE_CLASS_NAMES[partner.scale],
                  TONE_CLASS_NAMES[partner.tone],
                ].join(" ")}
                style={getPartnerWordStyle(partner)}
              >
                {partner.title}
              </span>
            ))}
          </div>

          <ul className="sr-only">
            {items.map((partner) => (
              <li key={partner.title}>{partner.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
