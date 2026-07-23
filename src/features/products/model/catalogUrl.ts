import type {
  TradeColorGroup,
  TradeProcess,
  TradeSeriesType,
  TradeSize,
  TradeThickness,
} from "../lib/tradeCatalog";
import type { CustomCapabilityKey } from "../content/customCapabilities";
import type { ProductCatalogSectionKey } from "../types";

export const CATALOG_URL_SECTION_KEYS = [
  "size",
  "series",
  "thickness",
  "color",
  "process",
  "custom",
] as const satisfies readonly ProductCatalogSectionKey[];

type SearchParamValue = string | string[] | undefined;

export type CatalogUrlSearchParams = Readonly<
  Record<string, SearchParamValue>
>;

export type CatalogUrlResolution = {
  section?: ProductCatalogSectionKey;
  value?: string;
  invalid: boolean;
  redirectHref: string | null;
};

const SIZE_URL_IDS = {
  "800X2600mm": "800x2600mm",
  "900X2700mm": "900x2700mm",
  "900X3000mm": "900x3000mm",
  "900X1800mm": "900x1800mm",
  "1000X3000mm": "1000x3000mm",
  "1200X2400mm": "1200x2400mm",
  "1200X2700mm": "1200x2700mm",
  "1200X3200mm": "1200x3200mm",
  "1600X3200mm": "1600x3200mm",
} as const satisfies Record<TradeSize, string>;

const SERIES_URL_IDS = {
  "质感岩板": "texture-slab",
  "名石岩板": "classic-stone-slab",
  "洞石岩板": "travertine-slab",
  "木纹岩板": "wood-grain-slab",
  "护墙岩板": "wall-cladding-slab",
  "艺术岩板": "art-slab",
  "连纹岩板": "continuous-vein-slab",
  "创意网红": "trending-design",
  "新品系列": "new-arrivals",
  "特惠系列": "special-offers",
} as const satisfies Record<TradeSeriesType, string>;

const THICKNESS_URL_IDS = {
  "3mm": "3mm",
  "6mm": "6mm",
  "9mm": "9mm",
  "12mm": "12mm",
  "15mm": "15mm",
  custom: "custom",
} as const satisfies Record<TradeThickness | "custom", string>;

const COLOR_URL_IDS = {
  "白色": "white",
  "米白": "off-white",
  "黑色": "black",
  "灰色": "grey",
  "米黄": "beige",
  "棕色": "brown",
  "金黄色": "gold",
  "素色": "solid",
  "蓝色": "blue",
  "绿色": "green",
  "紫色": "purple",
  "红色": "red",
} as const satisfies Record<TradeColorGroup, string>;

const PROCESS_URL_IDS = {
  "亮光": "high-gloss",
  "哑光": "matte",
  "亮面(奢石釉)": "luxury-stone-glaze",
  "真石镜面釉": "real-stone-mirror-glaze",
  "肌肤釉": "skin-touch-glaze",
  "透光石": "translucent-slab",
  "高白": "super-white",
  "数码模具面": "digital-mould-texture",
  "火烧面": "flamed-finish",
  "精雕": "precision-carved",
  "复刻釉": "replica-glaze",
  "定位彩晶": "positioned-crystal-inlay",
} as const satisfies Record<TradeProcess, string>;

const CUSTOM_URL_IDS = {
  "custom-thickness": "custom-thickness",
  "custom-cutting-processing": "custom-cutting-processing",
  "custom-size": "custom-size",
  "custom-surface": "custom-surface",
  "custom-color": "custom-color",
  "custom-pattern-design": "custom-pattern-design",
  "custom-hot-bending": "custom-hot-bending",
  "custom-logo-branding": "custom-logo-branding",
} as const satisfies Record<CustomCapabilityKey, string>;

const VALUE_TO_URL_ID: Record<
  ProductCatalogSectionKey,
  Readonly<Record<string, string>>
> = {
  size: SIZE_URL_IDS,
  series: SERIES_URL_IDS,
  thickness: THICKNESS_URL_IDS,
  color: COLOR_URL_IDS,
  process: PROCESS_URL_IDS,
  custom: CUSTOM_URL_IDS,
};

const URL_ID_TO_VALUE = Object.fromEntries(
  CATALOG_URL_SECTION_KEYS.map((section) => [
    section,
    Object.fromEntries(
      Object.entries(VALUE_TO_URL_ID[section]).map(([value, urlId]) => [
        urlId,
        value,
      ])
    ),
  ])
) as Record<ProductCatalogSectionKey, Readonly<Record<string, string>>>;

const LEGACY_PARAM_KEYS = new Set(["section", "value", "category"]);
const CATALOG_PARAM_KEYS = new Set<string>(CATALOG_URL_SECTION_KEYS);

function isCatalogSectionKey(value: string): value is ProductCatalogSectionKey {
  return CATALOG_URL_SECTION_KEYS.includes(
    value as ProductCatalogSectionKey
  );
}

function getOwnMapValue(
  map: Readonly<Record<string, string>>,
  key: string
): string | null {
  return Object.hasOwn(map, key) ? map[key] ?? null : null;
}

export function getCatalogUrlId(
  section: ProductCatalogSectionKey,
  storedValue: string
): string | null {
  return getOwnMapValue(VALUE_TO_URL_ID[section], storedValue);
}

export function getCatalogStoredValue(
  section: ProductCatalogSectionKey,
  urlValue: string
): string | null {
  return (
    getOwnMapValue(URL_ID_TO_VALUE[section], urlValue) ??
    (Object.hasOwn(VALUE_TO_URL_ID[section], urlValue) ? urlValue : null)
  );
}

export function buildCatalogHref(
  section: ProductCatalogSectionKey,
  storedValue?: string | null,
  basePath = "/products"
): string {
  const params = new URLSearchParams();

  if (!storedValue) {
    params.set("section", section);
  } else {
    const urlId = getCatalogUrlId(section, storedValue);

    if (!urlId) {
      throw new Error(
        `Catalog value "${storedValue}" has no URL identifier for ${section}.`
      );
    }

    params.set(section, urlId);
  }

  return `${basePath}?${params.toString()}`;
}

function appendPassthroughParams(
  output: URLSearchParams,
  input: CatalogUrlSearchParams
): void {
  for (const [key, rawValue] of Object.entries(input)) {
    if (LEGACY_PARAM_KEYS.has(key) || CATALOG_PARAM_KEYS.has(key)) {
      continue;
    }

    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    for (const value of values) {
      if (value !== undefined) {
        output.append(key, value);
      }
    }
  }
}

function buildRedirectHref(
  section: ProductCatalogSectionKey,
  storedValue: string,
  basePath: string,
  input: CatalogUrlSearchParams
): string {
  const href = buildCatalogHref(section, storedValue, basePath);
  const url = new URL(href, "https://catalog.invalid");
  appendPassthroughParams(url.searchParams, input);
  return `${url.pathname}${url.search}`;
}

function invalidResolution(): CatalogUrlResolution {
  return {
    invalid: true,
    redirectHref: null,
  };
}

export function resolveCatalogUrlSelection(
  searchParams: CatalogUrlSearchParams,
  basePath = "/products"
): CatalogUrlResolution {
  const catalogKeys = [
    ...CATALOG_URL_SECTION_KEYS,
    "section",
    "value",
  ] as const;

  if (catalogKeys.some((key) => Array.isArray(searchParams[key]))) {
    return invalidResolution();
  }

  const directEntries = CATALOG_URL_SECTION_KEYS.flatMap((section) => {
    const value = searchParams[section];
    return value === undefined ? [] : [[section, value] as const];
  });
  const hasLegacySection = searchParams.section !== undefined;
  const hasLegacyValue = searchParams.value !== undefined;

  if (
    directEntries.length > 1 ||
    (directEntries.length === 1 && (hasLegacySection || hasLegacyValue))
  ) {
    return invalidResolution();
  }

  if (directEntries.length === 1) {
    const [section, rawUrlValue] = directEntries[0];

    if (typeof rawUrlValue !== "string" || !rawUrlValue) {
      return invalidResolution();
    }

    const storedValue = getCatalogStoredValue(section, rawUrlValue);
    if (!storedValue) {
      return invalidResolution();
    }

    const canonicalUrlId = getCatalogUrlId(section, storedValue);
    return {
      section,
      value: storedValue,
      invalid: false,
      redirectHref:
        rawUrlValue === canonicalUrlId
          ? null
          : buildRedirectHref(section, storedValue, basePath, searchParams),
    };
  }

  if (!hasLegacySection && !hasLegacyValue) {
    return {
      invalid: false,
      redirectHref: null,
    };
  }

  if (
    typeof searchParams.section !== "string" ||
    !isCatalogSectionKey(searchParams.section)
  ) {
    return invalidResolution();
  }

  const section = searchParams.section;
  if (!hasLegacyValue) {
    return {
      section,
      invalid: false,
      redirectHref: null,
    };
  }

  if (typeof searchParams.value !== "string" || !searchParams.value) {
    return invalidResolution();
  }

  const storedValue = getCatalogStoredValue(section, searchParams.value);
  if (!storedValue) {
    return invalidResolution();
  }

  return {
    section,
    value: storedValue,
    invalid: false,
    redirectHref: buildRedirectHref(
      section,
      storedValue,
      basePath,
      searchParams
    ),
  };
}
