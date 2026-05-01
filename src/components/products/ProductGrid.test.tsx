import { expect, test } from "vitest";

import { vi } from "vitest";

vi.mock("@/i18n/routing", () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import ProductGrid from "./ProductGrid";
import type { ProductDirectoryItem, ProductTaxonomyCard } from "@/features/products/types";

const product: ProductDirectoryItem = {
  slug: "xi-nai-jin",
  title: "西奈金",
  category: "岩板产品",
  catalogMode: "standard",
  seriesTypes: ["名石岩板"],
  coverImageUrl: "/cover.jpg",
  variants: [{ code: "LV826L064", size: "800X2600mm" }],
  summaryTags: ["800X2600mm"],
};

const taxonomyCards: ProductTaxonomyCard[] = [
  {
    key: "800X2600mm",
    value: "800X2600mm",
    label: "800 × 2600mm",
    count: 1,
    imageSrc: "/cover.jpg",
  },
];

function findProductCardTitles(node: unknown): string[] {
  if (!node || typeof node !== "object") {
    return [];
  }

  if (Array.isArray(node)) {
    return node.flatMap(findProductCardTitles);
  }

  const element = node as {
    type?: { name?: string };
    props?: { title?: string; children?: unknown };
  };

  const ownTitle =
    element.type?.name === "ProductCard" && typeof element.props?.title === "string"
      ? [element.props.title]
      : [];

  return [...ownTitle, ...findProductCardTitles(element.props?.children)];
}

test("search mode renders product result cards without a selected taxonomy value", () => {
  const props = {
    activeSection: "size" as const,
    activeSectionLabel: "规格",
    activeValue: null,
    activeValueLabel: null,
    allLabel: "全部",
    taxonomyCards,
    products: [product],
    noProductsFoundLabel: "该分类下暂无产品。",
    emptyTaxonomyTemplate: "当前“{section}”栏目还没有可展示的二级分类。",
    backToCategoriesLabel: "返回分类",
    productCountTemplate: "共 {count} 个产品",
    searchQuery: "西奈",
    searchResultsLabel: "搜索结果",
    searchResultsForTemplate: "“{query}”的搜索结果",
  };

  expect(findProductCardTitles(ProductGrid(props))).toEqual(["西奈金"]);
});

test("missing search props fall back to the taxonomy card view", () => {
  const props = {
    activeSection: "size" as const,
    activeSectionLabel: "规格",
    activeValue: null,
    activeValueLabel: null,
    allLabel: "全部",
    taxonomyCards,
    products: [product],
    noProductsFoundLabel: "该分类下暂无产品。",
    emptyTaxonomyTemplate: "当前“{section}”栏目还没有可展示的二级分类。",
    backToCategoriesLabel: "返回分类",
    productCountTemplate: "共 {count} 个产品",
  };

  expect(() =>
    ProductGrid(props as React.ComponentProps<typeof ProductGrid>)
  ).not.toThrow();
  expect(
    findProductCardTitles(
      ProductGrid(props as React.ComponentProps<typeof ProductGrid>)
    )
  ).toEqual([]);
});
