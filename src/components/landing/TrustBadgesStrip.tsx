import Image from "next/image";
import { Link } from "@/i18n/routing";

const BADGE_ITEMS = [
  {
    src: "/assets/certificates/patent-press-plate-1.jpg",
    label: "实用新型专利",
    sub: "ZL 2024 2 2240073.X",
  },
  {
    src: "/assets/certificates/patent-corner-bracket-1.jpg",
    label: "实用新型专利",
    sub: "ZL 2024 2 2416690.0",
  },
  {
    src: "/assets/certificates/patent-beveling-machine-1.jpg",
    label: "实用新型专利",
    sub: "ZL 2024 2 2506238.3",
  },
  {
    src: "/assets/certificates/association-cert-1.jpg",
    label: "佛山市网商协会",
    sub: "理事单位",
  },
  {
    src: "/assets/certificates/association-cert-2.jpg",
    label: "佛山市网商协会",
    sub: "常务理事单位",
  },
  {
    src: "/assets/certificates/cert-misc-1.jpg",
    label: "营业执照",
    sub: "GR20254013255",
  },
];

type TrustBadgesStripProps = {
  title: string;
  viewAllLabel: string;
};

export function TrustBadgesStrip({
  title,
  viewAllLabel,
}: TrustBadgesStripProps) {
  return (
    <section className="border-y border-gray-100 bg-[#fafafa] py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="wayon-brand-title text-xl font-normal uppercase tracking-widest text-[#1a1a1a]">
            {title}
          </h2>
          <Link
            href="/about#certifications"
            className="text-xs tracking-wider text-[#555555] transition-colors hover:text-black"
          >
            {viewAllLabel} →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {BADGE_ITEMS.map((badge) => (
            <Link
              key={badge.src}
              href="/about#certifications"
              className="group flex flex-col items-center gap-2"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden border border-gray-200 bg-white transition-shadow duration-300 group-hover:shadow-md">
                <Image
                  src={badge.src}
                  alt={badge.label}
                  fill
                  sizes="(min-width: 640px) 16vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-medium text-[#1a1a1a]">
                  {badge.label}
                </p>
                <p className="font-mono text-[10px] text-gray-400">
                  {badge.sub}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
