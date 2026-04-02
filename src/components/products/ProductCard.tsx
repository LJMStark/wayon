import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

import { getProductSlug } from '@/data/products';

type ProductCardProps = {
  title: string;
  image: string;
  url: string;
  category: string;
};

export default function ProductCard({ title, image, url, category }: ProductCardProps) {
  return (
    <div className="group flex flex-col bg-white border border-muted/50 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
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
          <Link href={`/products/${getProductSlug(url)}`} className="inline-flex items-center text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
            View Details <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
