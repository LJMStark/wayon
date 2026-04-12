import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";

import { Link } from "@/i18n/routing";

import type { ProductDetailPageData, ProductSpecification } from "../types";

function ProductSpecificationCard({
  label,
  value,
}: ProductSpecification): React.JSX.Element {
  return (
    <div className="bg-white p-6">
      <span className="mb-2 block text-[10px] uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <span className="font-medium text-[#1a1a1a]">{value}</span>
    </div>
  );
}

export function ProductDetailPageView({
  backLabel,
  requestSampleLabel,
  title,
  category,
  image,
  descriptionParagraphs,
  specifications,
}: ProductDetailPageData): React.JSX.Element {
  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="mb-12 inline-flex items-center text-sm font-medium uppercase tracking-wide text-gray-400 transition-colors hover:text-[#1a1a1a]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {backLabel}
        </Link>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div className="group relative aspect-square overflow-hidden bg-[#f8f8f8] animate-fade-in">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized
              priority
            />
          </div>

          <div
            className="flex flex-col pt-8 animate-fade-up lg:pt-0"
            style={{ animationDelay: "0.2s" }}
          >
            <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-gray-400">
              {category}
            </span>
            <h1 className="mb-6 text-4xl font-heading font-bold uppercase tracking-wide text-[#1a1a1a] md:text-5xl">
              {title}
            </h1>
            <div className="my-8 h-px w-full bg-gray-200" />

            <div className="prose prose-lg mb-10 font-light leading-relaxed text-gray-500">
              {descriptionParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mb-12 grid grid-cols-2 gap-px border border-gray-200 bg-gray-200">
              {specifications.map((specification) => (
                <ProductSpecificationCard
                  key={specification.label}
                  label={specification.label}
                  value={specification.value}
                />
              ))}
            </div>

            <div className="mt-auto">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center bg-[#1a1a1a] px-12 py-5 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-gray-800 sm:w-auto"
              >
                {requestSampleLabel}
                <ArrowRight className="ml-3 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
