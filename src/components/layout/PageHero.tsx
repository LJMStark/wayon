import Image from "next/image";

type PageHeroProps = {
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
};

/**
 * Shared full-bleed page hero used by sub-level pages (about, solution,
 * contact, etc.). Pulls up behind the fixed transparent header via
 * -mt-[var(--header-height)], matching the home carousel and product
 * detail hero treatment.
 */
export function PageHero({
  imageSrc,
  imageAlt,
  title,
  subtitle,
}: PageHeroProps): React.JSX.Element {
  return (
    <section className="relative -mt-[var(--header-height)] w-full min-h-[480px] md:min-h-[560px] overflow-hidden bg-neutral-900">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        sizes="100vw"
        priority
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/55"
      />
      <div className="relative z-10 flex min-h-[480px] md:min-h-[560px] flex-col items-center justify-center px-6 pt-[var(--header-height)] text-center text-white">
        <h1 className="font-heading text-[2rem] font-light tracking-[-0.015em] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] md:text-[3rem]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-5 max-w-2xl text-[15px] font-light leading-relaxed text-white/80">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
