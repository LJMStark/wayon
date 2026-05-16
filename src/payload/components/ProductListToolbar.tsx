"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { TRADE_SERIES_TYPES } from "@/features/products/lib/tradeCatalog";

type FilterLink = {
  label: string;
  params?: Record<string, string>;
};

const PRIMARY_FILTERS: FilterLink[] = [
  { label: "全部产品" },
  {
    label: "标准产品",
    params: { "where[catalogMode][equals]": "standard" },
  },
  {
    label: "定制产品",
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

  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      nextParams.set(key, value);
    }
  }

  const query = nextParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function isActive(
  currentParams: URLSearchParams,
  filter?: FilterLink["params"],
): boolean {
  const whereKeys = [...currentParams.keys()].filter((key) =>
    key.startsWith("where["),
  );

  if (!filter) {
    return whereKeys.length === 0;
  }

  const filterEntries = Object.entries(filter);

  return (
    whereKeys.length === filterEntries.length &&
    filterEntries.every(([key, value]) => currentParams.get(key) === value)
  );
}

export function ProductListToolbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentParams = new URLSearchParams(searchParams.toString());
  const seriesFilters: FilterLink[] = TRADE_SERIES_TYPES.map((seriesType) => ({
    label: seriesType,
    params: { "where[seriesTypes][contains]": seriesType },
  }));

  return (
    <section className="wayon-list-toolbar" aria-label="产品快捷筛选">
      <div className="wayon-list-toolbar__group">
        <span>快捷筛选</span>
        <div className="wayon-list-toolbar__links">
          {PRIMARY_FILTERS.map((filter) => (
            <a
              aria-current={
                isActive(currentParams, filter.params) ? "page" : undefined
              }
              href={buildHref(pathname, currentParams, filter.params)}
              key={filter.label}
            >
              {filter.label}
            </a>
          ))}
        </div>
      </div>
      <div className="wayon-list-toolbar__group">
        <span>系列类型</span>
        <div className="wayon-list-toolbar__links">
          {seriesFilters.map((filter) => (
            <a
              aria-current={
                isActive(currentParams, filter.params) ? "page" : undefined
              }
              href={buildHref(pathname, currentParams, filter.params)}
              key={filter.label}
            >
              {filter.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
