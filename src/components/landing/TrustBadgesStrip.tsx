import Image from "next/image";
import { Link } from "@/i18n/routing";

const BADGE_ITEMS = [
  {
    src: "/assets/certificates/patent-press-plate-1.jpg",
    label: "实用新型专利",
    sub: "ZL 2024 2 2240073.X",
    portrait: true,
  },
  {
    src: "/assets/certificates/patent-corner-bracket-1.jpg",
    label: "实用新型专利",
    sub: "ZL 2024 2 2416690.0",
    portrait: true,
  },
  {
    src: "/assets/certificates/patent-beveling-machine-1.jpg",
    label: "实用新型专利",
    sub: "ZL 2024 2 2506238.3",
    portrait: true,
  },
  {
    src: "/assets/certificates/association-cert-1.jpg",
    label: "佛山市网商协会",
    sub: "理事单位",
    portrait: false,
  },
  {
    src: "/assets/certificates/association-cert-2.jpg",
    label: "佛山市网商协会",
    sub: "常务理事单位",
    portrait: false,
  },
  {
    src: "/assets/certificates/cert-misc-1.jpg",
    label: "营业执照",
    sub: "GR20254013255",
    portrait: false,
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

        <div className="flex gap-4 overflow-x-auto pb-1">
          {BADGE_ITEMS.map((badge) => (
            <Link
              key={badge.src}
              href="/about#certifications"
              className="group flex shrink-0 flex-col items-center gap-2"
            >
              <div
                className="relative h-40 overflow-hidden border border-gray-200 bg-white transition-shadow duration-300 group-hover:shadow-md"
                style={{ aspectRatio: badge.portrait ? "3/4" : "4/3" }}
              >
                <Image
                  src={badge.src}
                  alt={badge.label}
                  fill
                  sizes="200px"
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
