import Image from "next/image";
import { useTranslations } from "next-intl";

import { getEngineeringCases } from "@/data/home";

const DEFAULT_CASE_TITLE = "ENGINEERING CASE";
const DEFAULT_CASE_SUBTITLE =
  "Showcasing ZYL's successful applications in global projects, including residential, commercial, and public spaces.";

export function EngineeringCase(): React.JSX.Element {
  const t = useTranslations();
  const cases = getEngineeringCases(t);
  const title = t("Navigation.case") || DEFAULT_CASE_TITLE;
  const subtitle = t("Hero.subtitle") || DEFAULT_CASE_SUBTITLE;

  return (
    <section id="case" className="wayon-section">
      <div className="wayon-container">
        <header className="mb-8 md:mb-10">
          <h2 className="wayon-title text-[color:var(--primary)]">{title}</h2>
          <p className="wayon-copy mt-5 max-w-[780px]">
            {subtitle}
          </p>
        </header>

        <div className="grid gap-[5px] md:grid-cols-2">
          {cases.map((item) => (
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
    </section>
  );
}
