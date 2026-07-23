"use client";

import { useSearchParams } from "next/navigation";

import ProductGrid from "@/components/products/ProductGrid";
import {
  buildCatalogHref,
  CATALOG_URL_SECTION_KEYS,
} from "@/features/products/model/catalogUrl";
import { buildProductsPageState } from "@/features/products/model/productsPageState";

import type { AppLocale } from "@/i18n/types";
import type {
  ProductCatalogSectionKey,
  ProductCustomCapabilitySummary,
  ProductDirectoryItem,
  ProductTaxonomyCard,
  ProductsPageData,
} from "../types";

function getCatalogBasePath(locale: AppLocale): string {
  return `/${locale}/products`;
}

type ProductsCatalogClientProps = Pick<
  ProductsPageData,
  | "allLabel"
  | "backToCategoriesLabel"
  | "emptyTaxonomyTemplate"
  | "navSections"
  | "noProductsFoundLabel"
  | "productCountTemplate"
  | "searchResultsForTemplate"
  | "searchResultsLabel"
  | "seriesQuickLinks"
> & {
  customCapabilities: ProductCustomCapabilitySummary[];
  initialActiveSection: ProductCatalogSectionKey;
  initialActiveValue: string | null;
  initialActiveValueLabel: string | null;
  initialProducts: ProductDirectoryItem[];
  initialSearchQuery: string;
  initialTaxonomyCards: ProductTaxonomyCard[];
  locale: AppLocale;
  products: ProductDirectoryItem[];
};

function readCurrentSearchParams(
  searchParams: ReturnType<typeof useSearchParams>
) {
  const currentParams: Record<string, string | undefined> = {
    category: searchParams.get("category") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    section: searchParams.get("section") ?? undefined,
    value: searchParams.get("value") ?? undefined,
  };

  for (const section of CATALOG_URL_SECTION_KEYS) {
    currentParams[section] = searchParams.get(section) ?? undefined;
  }

  return currentParams;
}

function pushCatalogState(href: string): void {
  const nextUrl = new URL(href, window.location.href);
  window.history.pushState(
    null,
    "",
    `${window.location.pathname}${nextUrl.search}${nextUrl.hash}`
  );
}

function ProductsCatalogView({
  activeSection,
  activeValue,
  activeValueLabel,
  allLabel,
  backToCategoriesLabel,
  emptyTaxonomyTemplate,
  locale,
  navSections,
  noProductsFoundLabel,
  productCountTemplate,
  products,
  searchQuery,
  searchResultsForTemplate,
  searchResultsLabel,
  seriesQuickLinks,
  taxonomyCards,
  onCatalogNavigate,
}: Pick<
  ProductsPageData,
  | "activeSection"
  | "activeValue"
  | "activeValueLabel"
  | "allLabel"
  | "backToCategoriesLabel"
  | "emptyTaxonomyTemplate"
  | "locale"
  | "navSections"
  | "noProductsFoundLabel"
  | "productCountTemplate"
  | "products"
  | "searchQuery"
  | "searchResultsForTemplate"
  | "searchResultsLabel"
  | "seriesQuickLinks"
  | "taxonomyCards"
> & {
  onCatalogNavigate?: (href: string) => void;
}): React.JSX.Element {
  const activeSectionLabel =
    navSections.find((section) => section.key === activeSection)?.label ??
    allLabel;

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <nav className="flex flex-col border-s border-[color:var(--border)] py-2 ps-0 lg:min-h-[500px]">
          {seriesQuickLinks.map((link) => {
            const isLinkActive =
              activeSection === "series" && activeValue === link.value;

            return (
              <a
                key={link.key}
                href={link.href}
                onClick={
                  onCatalogNavigate
                    ? (event) => {
                        event.preventDefault();
                        onCatalogNavigate(link.href);
                      }
                    : undefined
                }
                aria-current={isLinkActive ? "page" : undefined}
                className={`relative flex items-center px-7 py-5 text-[15px] font-medium tracking-[0.02em] transition-colors duration-200 ${
                  isLinkActive
                    ? "text-[color:var(--primary)]"
                    : "text-[#333333] hover:text-[color:var(--primary)]"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute inset-y-2 start-[-1px] w-[2px] origin-center bg-[color:var(--primary)] transition-transform duration-300 ease-out ${
                    isLinkActive ? "scale-y-100" : "scale-y-0"
                  }`}
                />
                {link.label}
              </a>
            );
          })}
          {navSections.map((section) => {
            const isActive = section.key === activeSection && !activeValue;

            return (
              <a
                key={section.key}
                href={buildCatalogHref(
                  section.key,
                  null,
                  getCatalogBasePath(locale)
                )}
                onClick={
                  onCatalogNavigate
                    ? (event) => {
                        event.preventDefault();
                        onCatalogNavigate(
                          buildCatalogHref(
                            section.key,
                            null,
                            getCatalogBasePath(locale)
                          )
                        );
                      }
                    : undefined
                }
                aria-current={isActive ? "page" : undefined}
                className={`relative flex items-center px-7 py-5 text-[15px] font-medium tracking-[0.02em] transition-colors duration-200 ${
                  isActive
                    ? "text-[color:var(--primary)]"
                    : "text-[#333333] hover:text-[color:var(--primary)]"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute inset-y-2 start-[-1px] w-[2px] origin-center bg-[color:var(--primary)] transition-transform duration-300 ease-out ${
                    isActive ? "scale-y-100" : "scale-y-0"
                  }`}
                />
                {section.label}
              </a>
            );
          })}
        </nav>
      </aside>

      <div className="space-y-8">
        <ProductGrid
          activeSection={activeSection}
          activeSectionLabel={activeSectionLabel}
          activeValue={activeValue}
          activeValueLabel={activeValueLabel}
          allLabel={allLabel}
          taxonomyCards={taxonomyCards}
          products={products}
          searchQuery={searchQuery}
          searchResultsLabel={searchResultsLabel}
          searchResultsForTemplate={searchResultsForTemplate}
          noProductsFoundLabel={noProductsFoundLabel}
          emptyTaxonomyTemplate={emptyTaxonomyTemplate}
          backToCategoriesLabel={backToCategoriesLabel}
          productCountTemplate={productCountTemplate}
          onCatalogNavigate={onCatalogNavigate}
          catalogBasePath={getCatalogBasePath(locale)}
        />
      </div>
    </div>
  );
}

export function ProductsCatalogFallback({
  allLabel,
  backToCategoriesLabel,
  emptyTaxonomyTemplate,
  initialActiveSection,
  initialActiveValue,
  initialActiveValueLabel,
  initialProducts,
  initialSearchQuery,
  initialTaxonomyCards,
  locale,
  navSections,
  noProductsFoundLabel,
  productCountTemplate,
  searchResultsForTemplate,
  searchResultsLabel,
  seriesQuickLinks,
}: ProductsCatalogClientProps): React.JSX.Element {
  return (
    <ProductsCatalogView
      activeSection={initialActiveSection}
      activeValue={initialActiveValue}
      activeValueLabel={initialActiveValueLabel}
      allLabel={allLabel}
      backToCategoriesLabel={backToCategoriesLabel}
      emptyTaxonomyTemplate={emptyTaxonomyTemplate}
      locale={locale}
      navSections={navSections}
      noProductsFoundLabel={noProductsFoundLabel}
      productCountTemplate={productCountTemplate}
      products={initialProducts}
      searchQuery={initialSearchQuery}
      searchResultsForTemplate={searchResultsForTemplate}
      searchResultsLabel={searchResultsLabel}
      seriesQuickLinks={seriesQuickLinks}
      taxonomyCards={initialTaxonomyCards}
    />
  );
}

export function ProductsCatalogClient({
  allLabel,
  backToCategoriesLabel,
  customCapabilities,
  emptyTaxonomyTemplate,
  initialActiveSection,
  initialActiveValue,
  initialActiveValueLabel,
  initialProducts,
  initialSearchQuery,
  initialTaxonomyCards,
  locale,
  navSections,
  noProductsFoundLabel,
  productCountTemplate,
  products,
  searchResultsForTemplate,
  searchResultsLabel,
  seriesQuickLinks,
}: ProductsCatalogClientProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const {
    activeSection,
    activeValue,
    activeValueLabel,
    filteredProducts,
    searchQuery,
    taxonomyCards,
  } = searchParams.size
    ? buildProductsPageState({
        customCapabilities,
        locale,
        products,
        searchParams: readCurrentSearchParams(searchParams),
      })
    : {
        activeSection: initialActiveSection,
        activeValue: initialActiveValue,
        activeValueLabel: initialActiveValueLabel,
        filteredProducts: initialProducts,
        searchQuery: initialSearchQuery,
        taxonomyCards: initialTaxonomyCards,
      };

  return (
    <ProductsCatalogView
      activeSection={activeSection}
      activeValue={activeValue}
      activeValueLabel={activeValueLabel}
      allLabel={allLabel}
      backToCategoriesLabel={backToCategoriesLabel}
      emptyTaxonomyTemplate={emptyTaxonomyTemplate}
      locale={locale}
      navSections={navSections}
      noProductsFoundLabel={noProductsFoundLabel}
      productCountTemplate={productCountTemplate}
      products={filteredProducts}
      searchQuery={searchQuery}
      searchResultsForTemplate={searchResultsForTemplate}
      searchResultsLabel={searchResultsLabel}
      seriesQuickLinks={seriesQuickLinks}
      taxonomyCards={taxonomyCards}
      onCatalogNavigate={pushCatalogState}
    />
  );
}
