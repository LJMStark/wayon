import {
  getLocalizedProductValue,
  getProductImage,
  type Product,
} from "@/data/products";
import { formatCopy } from "@/data/siteCopy";
import type { AppLocale } from "@/i18n/types";

import type { ProductDetailPageData, ProductSpecification } from "../types";

type ProductDetailCopy = {
  description1: string;
  description2: string;
  thicknessLabel: string;
  thicknessValue: string;
  finishLabel: string;
  finishValue: string;
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

function buildProductSpecifications(
  product: Product,
  locale: AppLocale,
  detailCopy: ProductDetailCopy
): ProductSpecification[] {
  const thicknessValue = product.thickness?.trim() || detailCopy.thicknessValue;
  const finishValue = product.finish?.trim()
    ? formatFinishValue(product.finish, locale)
    : detailCopy.finishValue;
  const sizeValue = product.size?.trim();

  const specifications: ProductSpecification[] = [
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
    specifications.push({
      label: SIZE_LABELS[locale],
      value: sizeValue,
    });
  }

  return specifications;
}

export function buildProductDetailPageData(
  product: Product,
  locale: AppLocale,
  copy: {
    backLabel: string;
    requestSampleLabel: string;
    detail: ProductDetailCopy;
  }
): ProductDetailPageData {
  const title = getLocalizedProductValue(product, locale, "title");
  const category = getLocalizedProductValue(product, locale, "category");

  return {
    backLabel: copy.backLabel,
    requestSampleLabel: copy.requestSampleLabel,
    title,
    category,
    image: getProductImage(product),
    descriptionParagraphs: [
      formatCopy(copy.detail.description1, { title, category }),
      copy.detail.description2,
    ],
    specifications: buildProductSpecifications(product, locale, copy.detail),
  };
}
