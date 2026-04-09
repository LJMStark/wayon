import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import {
  getProductBySlug,
  getLocalizedProductValue,
  getProductImage,
  getProductSlugs,
} from "@/data/products";
import {
  formatCopy,
  getCommonCopy,
  getMetadataCopy,
  getProductDetailPageCopy,
} from "@/data/siteCopy";
import { Link } from "@/i18n/routing";
import { hasLocale, type AppLocale } from "@/i18n/types";
import { buildPageMetadata } from "@/lib/metadata";

type ProductSpecification = {
  label: string;
  value: string;
};

const FINISH_LABELS: Record<AppLocale, Record<string, string>> = {
  en: {
    polished: "Polished",
    honed: "Honed",
    leathered: "Leathered",
    brushed: "Brushed",
    sandblasted: "Sandblasted",
  },
  zh: {
    polished: "亮光",
    honed: "哑光",
    leathered: "皮革面",
    brushed: "拉丝",
    sandblasted: "喷砂",
  },
  es: {
    polished: "Pulido",
    honed: "Apomazado",
    leathered: "Cuero",
    brushed: "Cepillado",
    sandblasted: "Arenado",
  },
  ar: {
    polished: "مصقول",
    honed: "مطفي",
    leathered: "جلدي",
    brushed: "مصقول بفرشاة",
    sandblasted: "رملي",
  },
  ru: {
    polished: "Полированный",
    honed: "Матовый",
    leathered: "Кожаный",
    brushed: "Брашированный",
    sandblasted: "Пескоструйный",
  },
};

const SIZE_LABELS: Record<AppLocale, string> = {
  en: "Slab Size",
  zh: "板材规格",
  es: "Tamano de placa",
  ar: "مقاس اللوح",
  ru: "Размер плиты",
};

function toReadableText(value: string): string {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(" ");
}

function formatFinishValue(value: string, locale: AppLocale): string {
  const dictionary = FINISH_LABELS[locale];

  const values = value
    .split(/[\/,]/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => dictionary[segment.toLowerCase()] ?? toReadableText(segment));

  return values.length > 0 ? values.join(" / ") : value;
}

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

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/products/[slug]">): Promise<import("next").Metadata> {
  const { slug, locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const product = await getProductBySlug(slug);

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
}: PageProps<"/[locale]/products/[slug]">): Promise<React.JSX.Element> {
  const { slug, locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const tHeader = await getTranslations("Header");
  const commonCopy = getCommonCopy(locale);
  const detailCopy = getProductDetailPageCopy(locale);

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const localizedTitle = getLocalizedProductValue(product, locale, "title");
  const localizedCategory = getLocalizedProductValue(product, locale, "category");
  const productImage = getProductImage(product);
  const productDescription = formatCopy(detailCopy.description1, {
    title: localizedTitle,
    category: localizedCategory,
  });
  const thicknessValue = product.thickness?.trim() || detailCopy.thicknessValue;
  const finishValue = product.finish?.trim()
    ? formatFinishValue(product.finish, locale)
    : detailCopy.finishValue;
  const sizeValue = product.size?.trim();

  const productSpecifications: ProductSpecification[] = [
    {
      label: detailCopy.thicknessLabel,
      value: thicknessValue,
    },
    {
      label: detailCopy.finishLabel,
      value: finishValue,
    },
  ];

  if (sizeValue) {
    productSpecifications.push({
      label: SIZE_LABELS[locale],
      value: sizeValue,
    });
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="mb-12 inline-flex items-center text-sm font-medium uppercase tracking-wide text-gray-400 transition-colors hover:text-[#1a1a1a]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {tHeader("back")}
        </Link>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div className="group relative aspect-square overflow-hidden bg-[#f8f8f8] animate-fade-in">
            <Image
              src={productImage}
              alt={localizedTitle}
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
              {localizedCategory}
            </span>
            <h1 className="mb-6 text-4xl font-heading font-bold uppercase tracking-wide text-[#1a1a1a] md:text-5xl">
              {localizedTitle}
            </h1>
            <div className="my-8 h-px w-full bg-gray-200" />

            <div className="prose prose-lg mb-10 font-light leading-relaxed text-gray-500">
              <p>{productDescription}</p>
              <p>{detailCopy.description2}</p>
            </div>

            <div className="mb-12 grid grid-cols-2 gap-px border border-gray-200 bg-gray-200">
              {productSpecifications.map((specification) => (
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
                {commonCopy.requestSample}
                <ArrowRight className="ml-3 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
