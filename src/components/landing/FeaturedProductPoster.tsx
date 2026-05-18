import Image from "next/image";

import { Link } from "@/i18n/routing";

import type { FeaturedProductPosterSectionData } from "@/features/home/types";

type FeaturedProductPosterProps = {
  data: FeaturedProductPosterSectionData;
};

export function FeaturedProductPoster({
  data,
}: FeaturedProductPosterProps): React.JSX.Element {
  return (
    <section className="relative z-10 px-4 py-12 sm:px-6 lg:py-[4.5rem]">
      <div className="mx-auto max-w-[90rem]">
        <div className="mb-8 text-center">
          <h2 className="zyl-brand-title text-[clamp(2.125rem,4vw,3.5rem)] uppercase leading-[1.12] text-[color:var(--primary)]">
            {data.eyebrow}
          </h2>
        </div>

        <Link
          href={data.href}
          aria-label={data.eyebrow}
          className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-4"
        >
          <div className="relative overflow-hidden border border-[#002b50]/12 bg-[#e6eef3] shadow-[0_36px_100px_-62px_rgba(0,43,80,0.55)]">
            <div className="relative aspect-[1890/1063]">
              <Image
                src={data.image}
                alt={data.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1536px) 92vw, 1440px"
                className="object-cover object-center transition-transform duration-[1.4s] ease-out group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:transform-none"
              />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
