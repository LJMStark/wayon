import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getTranslations } from "next-intl/server";

type Product = {
  url: string;
  category: string;
  imageSrc: string;
  localImage?: string;
  [key: string]: string | undefined; // Supports title_en, title_zh, etc.
};

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const products: Product[] = JSON.parse(content);
  
  return products.map((p) => {
    const slug = p.url.split('/').pop()?.replace('.html', '') || '';
    return { slug };
  });
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
  const { slug, locale } = await params;
  const tHeader = await getTranslations("Header");
  
  const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');
  if (!fs.existsSync(filePath)) return notFound();
  
  const products: Product[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const originalUrlPart = `/products/${slug}.html`;
  
  const product = products.find((p) => p.url.endsWith(originalUrlPart) || p.url.includes(slug));
  
  if (!product) {
    return notFound();
  }

  // Get localized title and category
  const localizedTitle = product[`title_${locale}`] || product.title_en || product.title || "";
  const localizedCategory = product[`category_${locale}`] || product.category_en || product.category || "";

  return (
    <div className="bg-white min-h-screen pt-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/products" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-[#1a1a1a] transition-colors mb-12 uppercase tracking-wide">
          <ArrowLeft className="w-4 h-4 mr-2" /> {tHeader("back")}
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="relative aspect-square bg-[#f8f8f8] overflow-hidden animate-fade-in group">
            <Image
               src={product.localImage ? product.localImage : product.imageSrc}
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
                  Experience the exceptional durability and aesthetic beauty of our <strong>{localizedTitle}</strong> from the <em>{localizedCategory}</em> collection. Crafted with precision for high-end residential and commercial applications.
                </p>
                <p>
                  This engineered stone surface offers superior resistance to stains, scratches, and heat, making it an ideal choice for countertops, wall cladding, and flooring.
                </p>
             </div>
             
             <div className="grid grid-cols-2 gap-px bg-gray-200 mb-12 border border-gray-200">
                <div className="bg-white p-6">
                   <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-2">Thickness</span>
                   <span className="font-medium text-[#1a1a1a]">12mm / 20mm</span>
                </div>
                <div className="bg-white p-6">
                   <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-2">Finish</span>
                   <span className="font-medium text-[#1a1a1a]">Polished / Matte</span>
                </div>
             </div>
             
             <div className="mt-auto">
                <button className="w-full sm:w-auto px-12 py-5 bg-[#1a1a1a] text-white text-sm font-medium hover:bg-gray-800 transition-colors uppercase tracking-widest inline-flex items-center justify-center">
                   Request a Sample <ArrowRight className="w-4 h-4 ml-3" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
