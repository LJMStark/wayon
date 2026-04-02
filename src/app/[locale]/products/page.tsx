import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/routing";
import type { NavigationKey } from "@/data/navigation";
import {
  getCommonCopy,
  getMetadataCopy,
  getProductsPageCopy,
} from "@/data/siteCopy";
import { buildPageMetadata } from "@/lib/metadata";
import { hasLocale } from "@/i18n/types";

interface CategoryShowcase {
  category: string;
  titleKey: NavigationKey;
  descriptionKey: NavigationKey;
  imageSrc: string;
  bgType: "gray" | "white";
}

const MAIN_CATEGORIES: CategoryShowcase[] = [
  {
    category: "quartz",
    titleKey: "quartzStone",
    descriptionKey: "quartzDesc",
    imageSrc: "/assets/products/8498fbd0b0355c5a308df93e65b41cbc.jpg",
    bgType: "gray",
  },
  {
    category: "silica-free",
    titleKey: "silicaFree",
    descriptionKey: "silicaDesc",
    imageSrc: "/assets/products/4dfad52bc4f8b2c2bceabe1eb954a8de.jpg",
    bgType: "white",
  },
  {
    category: "terrazzo",
    titleKey: "terrazzo",
    descriptionKey: "terrazzoDesc",
    imageSrc: "/assets/products/c534a997a58eef6a2aa52b5d5d56c8a5.jpg",
    bgType: "gray",
  },
  {
    category: "flexible-stone",
    titleKey: "flexibleStone",
    descriptionKey: "flexibleDesc",
    imageSrc: "/assets/products/9ac3cb95ac618347328625a26f0f9df5.jpg",
    bgType: "white",
  },
  {
    category: "marble",
    titleKey: "marble",
    descriptionKey: "marbleDesc",
    imageSrc: "/assets/products/4114a4ac18610909eb9728c75328bcff.jpg",
    bgType: "gray",
  },
  {
    category: "gem-stone",
    titleKey: "gemStone",
    descriptionKey: "gemDesc",
    imageSrc: "/assets/products/7037b74ccb409b9cca57110044283d96.jpg",
    bgType: "white",
  },
  {
    category: "cement-stone",
    titleKey: "cementStone",
    descriptionKey: "cementDesc",
    imageSrc: "/assets/products/b3939f4e7c1209a0d06c922bc717b30a.jpg",
    bgType: "gray",
  },
  {
    category: "artificial-marble",
    titleKey: "artificialMarble",
    descriptionKey: "artificialDesc",
    imageSrc: "/assets/products/9ac3cb95ac618347328625a26f0f9df5.jpg",
    bgType: "white",
  },
  {
    category: "porcelain-slab",
    titleKey: "porcelainSlab",
    descriptionKey: "porcelainDesc",
    imageSrc: "/assets/products/8498fbd0b0355c5a308df93e65b41cbc.jpg",
    bgType: "gray",
  },
];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/products">) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const metadataCopy = getMetadataCopy(locale).products;

  return buildPageMetadata({
    locale,
    title: metadataCopy.title,
    description: metadataCopy.description,
    path: "/products",
  });
}

export default async function CollectionsPage({
  params,
}: PageProps<"/[locale]/products">) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const tNav = await getTranslations({ locale, namespace: "Navigation" });
  const commonCopy = getCommonCopy(locale);
  const productsCopy = getProductsPageCopy(locale);
  const translateNav = (key: NavigationKey): string => tNav(key);

  return (
    <main className="min-h-screen bg-white">
      <section className="relative flex h-[300px] w-full items-center justify-center bg-neutral-100 md:h-[350px]">
        <div className="absolute inset-0 bg-[#e5e5e5] opacity-50" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="mb-2 text-3xl font-light tracking-wide text-[#1a1a1a] md:text-5xl">
            {productsCopy.heroTitle}
          </h1>
          <p className="text-sm tracking-wider text-gray-600">
            {productsCopy.heroSubtitle}
          </p>
        </div>
      </section>

      <div className="mx-auto mb-8 max-w-[1400px] border-b border-gray-100 px-6 py-4 text-[13px] text-gray-500">
        <span className="text-gray-400">◆</span> {commonCopy.breadcrumbLabel}:{" "}
        <Link href="/" className="hover:text-black">
          {tNav("home")}
        </Link>{" "}
        &gt; <span className="text-black">{tNav("collection")}</span>
      </div>

      <div className="mx-auto mb-16 max-w-[1400px] px-6">
        <h2 className="mb-2 text-2xl font-bold">{productsCopy.collectionLabel}</h2>
        <p className="text-[15px] leading-relaxed text-gray-500">
          {tNav("quartzDesc")}
        </p>
      </div>

      <div className="flex w-full flex-col">
        {MAIN_CATEGORIES.map((category, index) => {
          const isImageRight = index % 2 === 0;

          return (
            <div
              key={category.category}
              id={category.category}
              className={`scroll-mt-24 flex min-h-[500px] w-full flex-col md:flex-row ${
                category.bgType === "gray" ? "bg-[#f8f9fa]" : "bg-white"
              }`}
            >
              <div
                className={`flex w-full items-center justify-center p-12 lg:p-24 md:w-1/2 ${
                  isImageRight ? "order-2 md:order-1" : "order-2 md:order-2"
                }`}
              >
                <div className="w-full max-w-md">
                  <h2 className="mb-6 text-3xl font-bold text-[#1a1a1a] lg:text-4xl">
                    {translateNav(category.titleKey)}
                  </h2>
                  <p className="mb-10 w-[95%] text-[15px] leading-relaxed text-gray-600">
                    {translateNav(category.descriptionKey)}
                  </p>
                  <Link
                    href={`/products?category=${category.category}`}
                    className="inline-block rounded-full bg-[#0f2858] px-8 py-3 text-sm tracking-widest text-white shadow-sm transition-colors hover:bg-black"
                  >
                    {commonCopy.readMore}
                  </Link>
                </div>
              </div>

              <div
                className={`relative w-full min-h-[300px] md:w-1/2 md:min-h-full ${
                  isImageRight ? "order-1 md:order-2" : "order-1 md:order-1"
                }`}
              >
                <div className="absolute inset-0 m-auto max-h-[85%] max-w-[85%] scale-[0.9] transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-95">
                  <Image
                    src={category.imageSrc}
                    alt={translateNav(category.titleKey)}
                    fill
                    className="bg-neutral-200 object-cover shadow-sm"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
