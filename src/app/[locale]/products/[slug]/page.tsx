import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getTranslations } from "next-intl/server";
import {
  findProductBySlug,
  getLocalizedProductValue,
  getProductImage,
  getProductSlugs,
} from '@/data/products';
import { hasLocale } from '@/i18n/types';
import {
  formatCopy,
  getCommonCopy,
  getMetadataCopy,
  getProductDetailPageCopy,
} from '@/data/siteCopy';
import { buildPageMetadata } from '@/lib/metadata';

export async function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/products/[slug]'>) {
  const { slug, locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const product = findProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const metadataCopy = getMetadataCopy(locale).productDetail;
  const localizedTitle = getLocalizedProductValue(product, locale, "title");
  const localizedCategory = getLocalizedProductValue(product, locale, "category");

  return buildPageMetadata({
    locale,
    title: formatCopy(metadataCopy.title, { title: localizedTitle }),
    description: formatCopy(metadataCopy.description, {
      title: localizedTitle,
      category: localizedCategory,
    }),
    path: `/products/${slug}`,
  });
}

export default async function ProductDetailPage({
  params,
}: PageProps<'/[locale]/products/[slug]'>) {
  const { slug, locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const tHeader = await getTranslations("Header");
  const commonCopy = getCommonCopy(locale);
  const detailCopy = getProductDetailPageCopy(locale);

  const product = findProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const localizedTitle = getLocalizedProductValue(product, locale, "title");
  const localizedCategory = getLocalizedProductValue(product, locale, "category");

  return (
    <div className="bg-white min-h-screen pt-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/products" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-[#1a1a1a] transition-colors mb-12 uppercase tracking-wide">
          <ArrowLeft className="w-4 h-4 mr-2" /> {tHeader("back")}
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="relative aspect-square bg-[#f8f8f8] overflow-hidden animate-fade-in group">
            <Image
               src={getProductImage(product)}
               alt={localizedTitle}
               fill
               className="object-cover transition-transform duration-700 group-hover:scale-105"
               unoptimized
               priority
            />
          </div>

          <div className="flex flex-col animate-fade-up pt-8 lg:pt-0" style={{ animationDelay: '0.2s' }}>
             <span className="text-gray-400 font-bold tracking-widest uppercase text-xs mb-4 block">
                {localizedCategory}
             </span>
             <h1 className="text-4xl md:text-5xl font-heading font-bold text-[#1a1a1a] mb-6 uppercase tracking-wide">
                {localizedTitle}
             </h1>
             <div className="h-px w-full bg-gray-200 my-8" />
             
             <div className="prose prose-lg text-gray-500 mb-10 font-light leading-relaxed">
                <p>
                  {formatCopy(detailCopy.description1, {
                    title: localizedTitle,
                    category: localizedCategory,
                  })}
                </p>
                <p>
                  {detailCopy.description2}
                </p>
             </div>
             
             <div className="grid grid-cols-2 gap-px bg-gray-200 mb-12 border border-gray-200">
                <div className="bg-white p-6">
                   <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-2">{detailCopy.thicknessLabel}</span>
                   <span className="font-medium text-[#1a1a1a]">{detailCopy.thicknessValue}</span>
                </div>
                <div className="bg-white p-6">
                   <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-2">{detailCopy.finishLabel}</span>
                   <span className="font-medium text-[#1a1a1a]">{detailCopy.finishValue}</span>
                </div>
             </div>
             
             <div className="mt-auto">
                <button className="w-full sm:w-auto px-12 py-5 bg-[#1a1a1a] text-white text-sm font-medium hover:bg-gray-800 transition-colors uppercase tracking-widest inline-flex items-center justify-center">
                   {commonCopy.requestSample} <ArrowRight className="w-4 h-4 ml-3" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
