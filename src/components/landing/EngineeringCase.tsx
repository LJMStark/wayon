import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import type { CaseItem } from "@/data/home";
import { RevealSection } from "./RevealSection";

type EngineeringCaseProps = {
  title: string;
  subtitle: string;
  items: CaseItem[];
};

type EngineeringCaseCardProps = {
  item: CaseItem;
  index: number;
  isDuplicate?: boolean;
};

function EngineeringCaseCard({
  item,
  index,
  isDuplicate = false,
}: EngineeringCaseCardProps): React.JSX.Element {
  const caseNumber = String(index + 1).padStart(2, "0");

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      role="listitem"
      tabIndex={isDuplicate ? -1 : undefined}
      aria-hidden={isDuplicate || undefined}
      className="engineering-case__card group"
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="(max-width: 767px) 78vw, (max-width: 1279px) 36vw, 28vw"
        className="engineering-case__image"
      />
      <span className="engineering-case__index" aria-hidden="true">
        {caseNumber}
      </span>
      <span className="engineering-case__rail" aria-hidden="true" />
      <div className="engineering-case__caption">
        <h3>{item.title}</h3>
        <span className="engineering-case__button" aria-hidden="true">
          <ArrowUpRight className="size-5" />
        </span>
      </div>
    </a>
  );
}

export function EngineeringCase({
  title,
  subtitle,
  items,
}: EngineeringCaseProps): React.JSX.Element {
  return (
    <RevealSection
      id="case"
      className="engineering-case overflow-hidden py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1920px] px-4 md:px-8">
        <header className="engineering-case__header mb-10 flex flex-col justify-between gap-8 border-b border-[#002b50]/12 pb-8 md:mb-14 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="mb-6 text-[clamp(2.5rem,5vw,4.5rem)] font-light uppercase leading-[1.1] tracking-wide text-[color:var(--primary)]">
              {title}
            </h2>
            <p className="max-w-md text-[15px] leading-relaxed text-[#4a4a4a]">
              {subtitle}
            </p>
          </div>
        </header>
      </div>

      <div className="engineering-case__marquee" aria-label={title}>
        <div className="engineering-case__track">
          <div className="engineering-case__group" aria-hidden="true">
            {items.map((item, index) => (
              <EngineeringCaseCard
                key={`duplicate-${item.title}`}
                item={item}
                index={index}
                isDuplicate
              />
            ))}
          </div>

          <div className="engineering-case__group" role="list">
            {items.map((item, index) => (
              <EngineeringCaseCard
                key={item.title}
                item={item}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
