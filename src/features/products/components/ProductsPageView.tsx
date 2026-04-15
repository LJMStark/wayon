import Image from "next/image";

import ProductGrid from "@/components/products/ProductGrid";
import { Link } from "@/i18n/routing";

import type { ProductCategoryShowcase, ProductsPageData } from "../types";

function getCategoryBackgroundClassName(
  background: ProductCategoryShowcase["background"]
): string {
  if (background === "gray") {
    return "bg-[#f8f9fa]";
  }

  return "bg-white";
}

function getCategoryOrderClassNames(isImageRight: boolean): {
  content: string;
  image: string;
} {
  if (isImageRight) {
    return {
      content: "order-2 md:order-1",
      image: "order-1 md:order-2",
    };
  }

  return {
    content: "order-2 md:order-2",
    image: "order-1 md:order-1",
  };
}

export function ProductsPageView({
  heroTitle,
  heroSubtitle,
  breadcrumbLabel,
  homeLabel,
  collectionLabel,
  collectionDescription,
  readMoreLabel,
  noProductsFoundLabel,
  showcases,
  directoryTitle,
  directoryDescription,
  filterLabels,
  products,
}: ProductsPageData): React.JSX.Element {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative flex h-[300px] w-full items-center justify-center bg-neutral-100 md:h-[350px]">
        <div className="absolute inset-0 bg-[#e5e5e5] opacity-50" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="mb-2 text-3xl font-light tracking-wide text-[#1a1a1a] md:text-5xl">
            {heroTitle}
          </h1>
          <p className="text-sm tracking-wider text-gray-600">{heroSubtitle}</p>
        </div>
      </section>

      <div className="mx-auto mb-8 max-w-[1400px] border-b border-gray-100 px-6 py-4 text-[13px] text-gray-500">
        <span className="text-gray-400">◆</span> {breadcrumbLabel}:{" "}
        <Link href="/" className="hover:text-black">
          {homeLabel}
        </Link>{" "}
        &gt; <span className="text-black">{collectionLabel}</span>
      </div>

      <div className="mx-auto mb-16 max-w-[1400px] px-6">
        <h2 className="mb-2 text-2xl font-bold">{collectionLabel}</h2>
        <p className="text-[15px] leading-relaxed text-gray-500">
          {collectionDescription}
        </p>
      </div>

      <div className="flex w-full flex-col">
        {showcases.map((showcase, index) => {
          const isImageRight = index % 2 === 0;
          const orderClassNames = getCategoryOrderClassNames(isImageRight);
          const backgroundClassName = getCategoryBackgroundClassName(
            showcase.background
          );

          return (
            <div
              key={showcase.slug}
              id={showcase.slug}
              className={`scroll-mt-24 flex min-h-[500px] w-full flex-col md:flex-row ${backgroundClassName}`}
            >
              <div
                className={`flex w-full items-center justify-center p-12 md:w-1/2 lg:p-24 ${orderClassNames.content}`}
              >
                <div className="w-full max-w-md">
                  <h2 className="mb-6 text-3xl font-bold text-[#1a1a1a] lg:text-4xl">
                    {showcase.title}
                  </h2>
                  <p className="mb-10 w-[95%] text-[15px] leading-relaxed text-gray-600">
                    {showcase.description}
                  </p>
                  <Link
                    href="/products#directory"
                    className="inline-block rounded-full bg-[#0f2858] px-8 py-3 text-sm tracking-widest text-white shadow-sm transition-colors hover:bg-black"
                  >
                    {readMoreLabel}
                  </Link>
                </div>
              </div>

              <div
                className={`relative min-h-[300px] w-full md:min-h-full md:w-1/2 ${orderClassNames.image}`}
              >
                <div className="absolute inset-0 m-auto max-h-[85%] max-w-[85%] scale-[0.9] transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-95">
                  <Image
                    src={showcase.imageSrc}
                    alt={showcase.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="bg-neutral-200 object-cover shadow-sm"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section id="directory" className="mx-auto max-w-[1400px] px-6 py-20">
        <div className="mb-10 max-w-3xl">
          <h2 className="mb-3 text-3xl font-bold text-[#1a1a1a]">
            {directoryTitle}
          </h2>
          <p className="text-[15px] leading-relaxed text-gray-600">
            {directoryDescription}
          </p>
        </div>

        <ProductGrid
          products={products}
          filterLabels={filterLabels}
          readMoreLabel={readMoreLabel}
          noProductsFoundLabel={noProductsFoundLabel}
        />
      </section>
    </main>
  );
}
