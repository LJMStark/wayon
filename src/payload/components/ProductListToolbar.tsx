"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { CUSTOM_CAPABILITIES } from "@/features/products/content/customCapabilities";
import {
  TRADE_COLOR_GROUPS,
  TRADE_PROCESSES,
  TRADE_SERIES_TYPES,
  TRADE_SIZES,
  TRADE_THICKNESSES,
} from "@/features/products/lib/tradeCatalog";

type FilterLink = {
  label: string;
  params?: Record<string, string>;
};

type CatalogSection =
  | "size"
  | "series"
  | "special"
  | "thickness"
  | "color"
  | "process"
  | "custom";

type CatalogLink = FilterLink & {
  section: CatalogSection;
};

const PRIMARY_FILTERS: FilterLink[] = [
  { label: "全部产品" },
  {
    label: "仅标准产品",
    params: { "where[catalogMode][equals]": "standard" },
  },
  {
    label: "仅定制产品",
    params: { "where[catalogMode][equals]": "custom" },
  },
  {
    label: "已发布",
    params: { "where[published][equals]": "true" },
  },
  {
    label: "未发布",
    params: { "where[published][equals]": "false" },
  },
];

const STANDARD_PRODUCT_PARAMS = {
  "where[catalogMode][equals]": "standard",
};

const CUSTOM_PRODUCT_PARAMS = {
  "where[catalogMode][equals]": "custom",
};

const CATALOG_SECTION_PARAM = "catalogSection";
const SPECIAL_SERIES = "特惠系列";
const SERIES_SUBCATEGORY_TYPES = TRADE_SERIES_TYPES.filter(
  (seriesType) => seriesType !== SPECIAL_SERIES,
);

const CATALOG_SECTIONS: CatalogLink[] = [
  {
    label: "规格",
    section: "size",
    params: { [CATALOG_SECTION_PARAM]: "size", ...STANDARD_PRODUCT_PARAMS },
  },
  {
    label: "岩板产品系列",
    section: "series",
    params: { [CATALOG_SECTION_PARAM]: "series", ...STANDARD_PRODUCT_PARAMS },
  },
  {
    label: "特惠系列",
    section: "special",
    params: {
      [CATALOG_SECTION_PARAM]: "special",
      ...STANDARD_PRODUCT_PARAMS,
      "where[seriesTypes][contains]": SPECIAL_SERIES,
    },
  },
  {
    label: "厚度",
    section: "thickness",
    params: {
      [CATALOG_SECTION_PARAM]: "thickness",
      ...STANDARD_PRODUCT_PARAMS,
    },
  },
  {
    label: "颜色",
    section: "color",
    params: { [CATALOG_SECTION_PARAM]: "color", ...STANDARD_PRODUCT_PARAMS },
  },
  {
    label: "表面工艺",
    section: "process",
    params: {
      [CATALOG_SECTION_PARAM]: "process",
      ...STANDARD_PRODUCT_PARAMS,
    },
  },
  {
    label: "定制产品",
    section: "custom",
    params: { [CATALOG_SECTION_PARAM]: "custom", ...CUSTOM_PRODUCT_PARAMS },
  },
];

function buildHref(
  pathname: string,
  currentParams: URLSearchParams,
  filter?: FilterLink["params"],
) {
  const nextParams = new URLSearchParams(currentParams);

  for (const key of [...nextParams.keys()]) {
    if (key.startsWith("where[")) {
      nextParams.delete(key);
    }
  }
  nextParams.delete(CATALOG_SECTION_PARAM);
  nextParams.delete("page");

  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      nextParams.set(key, value);
    }
  }

  const query = nextParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function isPrimaryFilterActive(
  currentParams: URLSearchParams,
  filter?: FilterLink["params"],
): boolean {
  const whereKeys = [...currentParams.keys()].filter((key) =>
    key.startsWith("where["),
  );

  if (!filter) {
    return whereKeys.length === 0 && !currentParams.get(CATALOG_SECTION_PARAM);
  }

  if (currentParams.get(CATALOG_SECTION_PARAM)) {
    return false;
  }

  const filterEntries = Object.entries(filter);

  return (
    whereKeys.length === filterEntries.length &&
    filterEntries.every(([key, value]) => currentParams.get(key) === value)
  );
}

function isSubcategoryFilterActive(
  currentParams: URLSearchParams,
  filter?: FilterLink["params"],
): boolean {
  if (!filter) return false;

  const filterEntries = Object.entries(filter);
  const currentWhereKeys = [...currentParams.keys()].filter((key) =>
    key.startsWith("where["),
  );
  const filterWhereKeys = filterEntries.filter(([key]) =>
    key.startsWith("where["),
  );

  if (currentWhereKeys.length !== filterWhereKeys.length) {
    return false;
  }

  return filterEntries.every(
    ([key, value]) => currentParams.get(key) === value,
  );
}

function readCatalogSection(params: URLSearchParams): CatalogSection | null {
  const explicitSection = params.get(CATALOG_SECTION_PARAM);
  if (
    explicitSection === "size" ||
    explicitSection === "series" ||
    explicitSection === "special" ||
    explicitSection === "thickness" ||
    explicitSection === "color" ||
    explicitSection === "process" ||
    explicitSection === "custom"
  ) {
    return explicitSection;
  }

  if (params.get("where[seriesTypes][contains]") === SPECIAL_SERIES) {
    return "special";
  }
  if (params.has("where[seriesTypes][contains]")) {
    return "series";
  }
  if (params.has("where[variants.size][equals]")) {
    return "size";
  }
  if (params.has("where[variants.thickness][equals]")) {
    return "thickness";
  }
  if (params.has("where[variants.colorGroup][equals]")) {
    return "color";
  }
  if (params.has("where[variants.process][equals]")) {
    return "process";
  }
  if (
    params.get("where[catalogMode][equals]") === "custom" ||
    params.has("where[customCapability.capabilityKey][equals]")
  ) {
    return "custom";
  }
  return null;
}

function formatSizeLabel(size: string): string {
  return size.replace(/X/g, " × ");
}

function buildSubcategoryLinks(
  section: CatalogSection | null,
): { label: string; links: FilterLink[] } | null {
  switch (section) {
    case "size":
      return {
        label: "规格小类",
        links: [
          {
            label: "全部规格",
            params: {
              [CATALOG_SECTION_PARAM]: "size",
              ...STANDARD_PRODUCT_PARAMS,
            },
          },
          ...TRADE_SIZES.map((size) => ({
            label: formatSizeLabel(size),
            params: {
              [CATALOG_SECTION_PARAM]: "size",
              ...STANDARD_PRODUCT_PARAMS,
              "where[variants.size][equals]": size,
            },
          })),
        ],
      };
    case "series":
      return {
        label: "岩板产品系列小类",
        links: [
          {
            label: "全部岩板产品",
            params: {
              [CATALOG_SECTION_PARAM]: "series",
              ...STANDARD_PRODUCT_PARAMS,
            },
          },
          ...SERIES_SUBCATEGORY_TYPES.map((seriesType) => ({
            label: seriesType,
            params: {
              [CATALOG_SECTION_PARAM]: "series",
              ...STANDARD_PRODUCT_PARAMS,
              "where[seriesTypes][contains]": seriesType,
            },
          })),
        ],
      };
    case "thickness":
      return {
        label: "厚度小类",
        links: [
          {
            label: "全部厚度",
            params: {
              [CATALOG_SECTION_PARAM]: "thickness",
              ...STANDARD_PRODUCT_PARAMS,
            },
          },
          ...TRADE_THICKNESSES.map((thickness) => ({
            label: thickness,
            params: {
              [CATALOG_SECTION_PARAM]: "thickness",
              ...STANDARD_PRODUCT_PARAMS,
              "where[variants.thickness][equals]": thickness,
            },
          })),
          {
            label: "其他",
            params: {
              [CATALOG_SECTION_PARAM]: "thickness",
              ...STANDARD_PRODUCT_PARAMS,
              "where[variants.thickness][equals]": "custom",
            },
          },
        ],
      };
    case "color":
      return {
        label: "颜色小类",
        links: [
          {
            label: "全部颜色",
            params: {
              [CATALOG_SECTION_PARAM]: "color",
              ...STANDARD_PRODUCT_PARAMS,
            },
          },
          ...TRADE_COLOR_GROUPS.map((colorGroup) => ({
            label: colorGroup,
            params: {
              [CATALOG_SECTION_PARAM]: "color",
              ...STANDARD_PRODUCT_PARAMS,
              "where[variants.colorGroup][equals]": colorGroup,
            },
          })),
        ],
      };
    case "process":
      return {
        label: "表面工艺小类",
        links: [
          {
            label: "全部工艺",
            params: {
              [CATALOG_SECTION_PARAM]: "process",
              ...STANDARD_PRODUCT_PARAMS,
            },
          },
          ...TRADE_PROCESSES.map((process) => ({
            label: process,
            params: {
              [CATALOG_SECTION_PARAM]: "process",
              ...STANDARD_PRODUCT_PARAMS,
              "where[variants.process][equals]": process,
            },
          })),
        ],
      };
    case "custom":
      return {
        label: "定制产品小类",
        links: [
          {
            label: "全部定制产品",
            params: {
              [CATALOG_SECTION_PARAM]: "custom",
              ...CUSTOM_PRODUCT_PARAMS,
            },
          },
          ...CUSTOM_CAPABILITIES.map((capability) => ({
            label: capability.title.zh,
            params: {
              [CATALOG_SECTION_PARAM]: "custom",
              ...CUSTOM_PRODUCT_PARAMS,
              "where[customCapability.capabilityKey][equals]": capability.key,
            },
          })),
        ],
      };
    default:
      return null;
  }
}

export function ProductListToolbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentParams = new URLSearchParams(searchParams.toString());
  const activeCatalogSection = readCatalogSection(currentParams);
  const subcategoryGroup = buildSubcategoryLinks(activeCatalogSection);

  return (
    <section className="zyl-list-toolbar" aria-label="产品快捷筛选">
      <div className="zyl-list-toolbar__group">
        <span>快捷筛选</span>
        <div className="zyl-list-toolbar__links">
          {PRIMARY_FILTERS.map((filter) => (
            <a
              aria-current={
                isPrimaryFilterActive(currentParams, filter.params)
                  ? "page"
                  : undefined
              }
              href={buildHref(pathname, currentParams, filter.params)}
              key={filter.label}
            >
              {filter.label}
            </a>
          ))}
        </div>
      </div>
      <div className="zyl-list-toolbar__group">
        <span>前台大类</span>
        <div className="zyl-list-toolbar__links">
          {CATALOG_SECTIONS.map((filter) => (
            <a
              aria-current={
                activeCatalogSection === filter.section ? "page" : undefined
              }
              href={buildHref(pathname, currentParams, filter.params)}
              key={filter.label}
            >
              {filter.label}
            </a>
          ))}
        </div>
      </div>
      {subcategoryGroup ? (
        <div className="zyl-list-toolbar__group zyl-list-toolbar__group--nested">
          <span>{subcategoryGroup.label}</span>
          <div className="zyl-list-toolbar__links">
            {subcategoryGroup.links.map((filter) => (
              <a
                aria-current={
                  isSubcategoryFilterActive(currentParams, filter.params)
                    ? "page"
                    : undefined
                }
                href={buildHref(pathname, currentParams, filter.params)}
                key={filter.label}
              >
                {filter.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
