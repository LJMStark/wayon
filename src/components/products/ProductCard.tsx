import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useLocale } from "next-intl";

import { getLandingCopy } from "@/data/siteCopy";
import { Link } from "@/i18n/routing";

type ProductCardProps = {
  title: string;
  image: string;
  slug: string;
  category: string;
};

const CARD_CLASS_NAME =
  "group flex flex-col overflow-hidden rounded-xl border border-muted/50 bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5";

const DETAILS_LINK_CLASS_NAME =
  "inline-flex items-center text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary";

export default function ProductCard({
  title,
  image,
  slug,
  category,
}: ProductCardProps): React.JSX.Element {
  const locale = useLocale();
  const copy = getLandingCopy(locale);
  const detailsHref = `/products/${slug}`;

  return (
    <div className={CARD_CLASS_NAME}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300 z-10" />
      </div>

      <div className="p-6 flex flex-col grow">
        <span className="text-xs font-bold text-gold uppercase tracking-widest mb-2 block">
          {category}
        </span>
        <h3 className="text-lg font-heading font-semibold text-primary mb-4 grow">
          {title}
        </h3>

        <div className="mt-auto pt-4 border-t border-muted">
          <Link href={detailsHref} className={DETAILS_LINK_CLASS_NAME}>
            {copy.productCard.viewDetails}
            <ArrowRight className="ml-1 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
