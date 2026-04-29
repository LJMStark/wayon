import {
  formatNewsDate,
  getLocalizedNewsBody,
  getLocalizedNewsValue,
  getNewsCategoryLabel,
  type NewsArticle,
} from "@/data/news";
import type { AppLocale } from "@/i18n/types";

import type {
  NewsArticleVisual,
  NewsDetailPageData,
  NewsPreviewItem,
} from "../types";

import { TRADE_YELLOW_PLACEHOLDER_IMAGE } from "@/features/products/model/productExposure";

const NEWS_FALLBACK_IMAGE = TRADE_YELLOW_PLACEHOLDER_IMAGE;

const NEWS_ARTICLE_VISUALS: Record<
  string,
  ReadonlyArray<{
    src: string;
    alt: Record<AppLocale, string>;
    caption: Record<AppLocale, string>;
  }>
> = {
  "what-is-sintered-stone": [
    {
      src: "/assets/solutions/scene-kitchen-countertops.jpg",
      alt: {
        en: "Sintered stone kitchen counter and full-height backsplash",
        zh: "岩板厨房台面和整面挡水墙",
        es: "Encimera de piedra sinterizada y salpicadero de altura completa",
        ar: "سطح مطبخ وحائط خلفي كامل من الحجر الملبد",
      },
      caption: {
        en: "Kitchen counters were the first mass-market use case. Full-height backsplash panels made it an architectural material.",
        zh: "厨房台面是岩板最早跑通的大众场景；整面挡水墙让它从台面材料变成空间饰面。",
        es: "Las encimeras de cocina fueron el primer uso masivo. Los paneles de pared completa lo convirtieron en un material arquitectónico.",
        ar: "كانت أسطح المطابخ أول استخدام واسع. ألواح الجدار الكاملة جعلته مادة معمارية.",
      },
    },
    {
      src: "/assets/solutions/scene-wall-floor.jpg",
      alt: {
        en: "Large porcelain slabs used across a commercial floor",
        zh: "商业空间里连续铺设的大规格瓷质岩板",
        es: "Grandes losas porcelánicas instaladas en un pavimento comercial",
        ar: "ألواح بورسلان كبيرة مستخدمة في أرضية تجارية",
      },
      caption: {
        en: "Large slabs mean fewer visible seams. This is why designers choose them for walls, floors, and feature surfaces.",
        zh: "大板减少了缝线，设计师才会把它放到墙面、地面和大面积视觉面上。",
        es: "El gran formato reduce las juntas. Por eso los diseñadores lo eligen para paredes, suelos y superficies protagonistas.",
        ar: "تقلل الألواح الكبيرة من الفواصل المرئية، وهذا هو السبب الرئيسي وراء اختيار المصممين لها للجدران والأرضيات والأسطح البارزة.",
      },
    },
  ],
  "sintered-stone-vs-quartz-vs-marble": [
    {
      src: "/assets/solutions/cabinet-countertops.webp",
      alt: {
        en: "Kitchen countertop surface used for daily cooking",
        zh: "日常厨房使用场景里的台面材料",
        es: "Superficie de encimera en una cocina de uso diario",
        ar: "سطح مطبخ مستخدم في الطهي اليومي",
      },
      caption: {
        en: "When choosing kitchen or bathroom surfaces, focus on heat and stain resistance, edge detailing, and fabrication safety.",
        zh: "厨卫台面真正要比的，是耐热、防污、边型加工和加工安全。",
        es: "Para superficies de cocina y baño, prioriza la resistencia al calor y manchas, el acabado de los cantos y la seguridad en el montaje.",
        ar: "عند اختيار أسطح المطابخ والحمامات، ركز على مقاومة الحرارة والبقع، وتفاصيل الحافة، وسلامة التصنيع.",
      },
    },
    {
      src: "/assets/products/products-hero-lauren-black-gold.jpg",
      alt: {
        en: "Black marble-look slab with fine gold veining",
        zh: "带细金线的黑色大理石纹理大板",
        es: "Losa efecto mármol negro con vetas doradas finas",
        ar: "لوح بتأثير الرخام الأسود مع عروق ذهبية رفيعة",
      },
      caption: {
        en: "Stone-look slabs can carry a strong marble language, but fabrication details still decide the result.",
        zh: "类大理石纹理可以做得很强，但最终效果还是取决于加工细节。",
        es: "Las losas efecto mármol pueden ser muy expresivas, pero el resultado depende del detalle de fabricación.",
        ar: "يمكن للألواح بتأثير الرخام أن تكون قوية بصريا، لكن النتيجة تعتمد على تفاصيل التصنيع.",
      },
    },
  ],
  "sintered-slab-thickness-guide": [
    {
      src: "/assets/solutions/wall-floor.jpg",
      alt: {
        en: "Wall and floor slab application in a clean interior",
        zh: "室内墙地一体岩板应用",
        es: "Aplicación de losas en pared y suelo",
        ar: "استخدام الألواح في الجدار والأرضية داخل مساحة نظيفة",
      },
      caption: {
        en: "Thickness starts with load and installation method, not the visual edge you want.",
        zh: "厚度先看受力和安装方式，不要先看想做多厚的视觉边。",
        es: "El espesor se decide por carga e instalación, no por el canto visual deseado.",
        ar: "يبدأ اختيار السماكة من الحمل وطريقة التركيب، لا من شكل الحافة فقط.",
      },
    },
    {
      src: "/assets/solutions/scene-wall-floor.jpg",
      alt: {
        en: "Large polished floor slabs in a commercial interior",
        zh: "商业室内大规格亮面地面岩板",
        es: "Grandes losas pulidas en un interior comercial",
        ar: "ألواح أرضية كبيرة مصقولة في مساحة تجارية",
      },
      caption: {
        en: "Commercial floors and rolling loads usually push the spec toward thicker slabs.",
        zh: "商业地面和滚动荷载，通常会把规格推向更厚的板。",
        es: "Los suelos comerciales y las cargas rodantes suelen exigir mayor espesor.",
        ar: "الأرضيات التجارية والأحمال المتحركة تحتاج غالبا إلى ألواح أكثر سماكة.",
      },
    },
  ],
  "sourcing-sintered-slabs-from-china": [
    {
      src: "/assets/about/yunfu-wayon.webp",
      alt: {
        en: "Sintered slab production line inside a Guangdong factory",
        zh: "广东工厂内的岩板生产线",
        es: "Línea de producción de losas sinterizadas en Guangdong",
        ar: "خط إنتاج ألواح حجر ملبد داخل مصنع في قوانغدونغ",
      },
      caption: {
        en: "For direct sourcing, production line visibility matters more than a polished quotation sheet.",
        zh: "做直采时，能不能看到产线，比报价单做得漂亮更重要。",
        es: "En compra directa, ver la línea de producción pesa más que una cotización bonita.",
        ar: "في الشراء المباشر، رؤية خط الإنتاج أهم من عرض سعر منسق.",
      },
    },
    {
      src: "/assets/about/guangdong-wayon.jpg",
      alt: {
        en: "Roller kiln and production equipment for slab manufacturing",
        zh: "用于板材制造的辊道窑和生产设备",
        es: "Horno de rodillos y equipos de producción de losas",
        ar: "فرن أسطواني ومعدات إنتاج الألواح",
      },
      caption: {
        en: "Factory capability shows up in kiln control, sorting, packaging, and batch consistency.",
        zh: "工厂能力会落在窑炉控制、分选、包装和批次稳定性上。",
        es: "La capacidad real se ve en el horno, la selección, el embalaje y la estabilidad del lote.",
        ar: "تظهر قدرة المصنع في ضبط الفرن والفرز والتغليف وثبات الدفعات.",
      },
    },
  ],
  "sintered-slab-architectural-applications": [
    {
      src: "/assets/solutions/scene-commercial-showcase.jpg",
      alt: {
        en: "Commercial bar clad with black marble-look sintered slabs",
        zh: "黑色大理石纹岩板包覆的商业吧台",
        es: "Bar comercial revestido con losas sinterizadas efecto mármol negro",
        ar: "بار تجاري مكسو بألواح حجر ملبد بتأثير الرخام الأسود",
      },
      caption: {
        en: "Hospitality projects use slabs as counters, cladding, and light-backed feature surfaces.",
        zh: "酒店和商业空间会把岩板同时用在台面、包覆和背光视觉面上。",
        es: "La hostelería usa las losas en barras, revestimientos y superficies retroiluminadas.",
        ar: "تستخدم مشاريع الضيافة الألواح في الأسطح والكسوة والعناصر المضيئة.",
      },
    },
    {
      src: "/assets/solutions/scene-furniture-tops.jpg",
      alt: {
        en: "Dining area with sintered slab wall, floor, and table top",
        zh: "墙面、地面和餐桌台面连续使用岩板的餐厅空间",
        es: "Comedor con losas sinterizadas en pared, suelo y mesa",
        ar: "منطقة طعام تستخدم الحجر الملبد في الجدار والأرضية وسطح الطاولة",
      },
      caption: {
        en: "Furniture tops and wall cladding are where the material moves beyond countertops.",
        zh: "家具台面和墙面包覆，是岩板走出台面的两个主要方向。",
        es: "Las mesas y los revestimientos muestran cómo el material va más allá de la encimera.",
        ar: "أسطح الأثاث وكسوة الجدران يوضحان انتقال المادة إلى ما بعد أسطح المطابخ.",
      },
    },
  ],
};

export function getNewsHref(slug: string): string {
  return `/news/${slug}`;
}

export function getEmptyNewsMessage(locale: AppLocale): string {
  return {
    en: "No news available yet.",
    zh: "暂时还没有新闻内容。",
    es: "Aun no hay noticias disponibles.",
    ar: "لا توجد أخبار متاحة بعد.",
  }[locale];
}

export function toNewsPreviewItem(
  article: NewsArticle,
  locale: AppLocale
): NewsPreviewItem | null {
  if (!article.slug) {
    return null;
  }

  const title = getLocalizedNewsValue(article, locale, "title");

  if (!title) {
    return null;
  }

  return {
    date: formatNewsDate(article.publishedAt, locale).full,
    category: getNewsCategoryLabel(article.category, locale),
    title,
    excerpt: getLocalizedNewsValue(article, locale, "excerpt"),
    image: getNewsPrimaryImage(article, locale) ?? NEWS_FALLBACK_IMAGE,
    slug: article.slug,
  };
}

export function buildNewsDetailPageData(
  article: NewsArticle,
  locale: AppLocale,
  copy: {
    backToNewsLabel: string;
    contactCtaTitle: string;
    contactLabel: string;
    contentComingSoonLabel: string;
  }
): NewsDetailPageData {
  const rawBody = getLocalizedNewsBody(article, locale);
  const visuals = getNewsArticleVisuals(article.slug, locale);
  const primaryVisual = visuals[0];
  const imageUrl = primaryVisual?.src ?? (article.imageUrl || null);

  return {
    backToNewsLabel: copy.backToNewsLabel,
    contactCtaTitle: copy.contactCtaTitle,
    contactLabel: copy.contactLabel,
    contentComingSoonLabel: copy.contentComingSoonLabel,
    title: getLocalizedNewsValue(article, locale, "title"),
    excerpt: getLocalizedNewsValue(article, locale, "excerpt"),
    body: rawBody ? stripReferencesSection(rawBody) : null,
    imageUrl,
    visuals: primaryVisual ? visuals.slice(1) : visuals,
    publishedAt: article.publishedAt,
    dateLabel: formatNewsDate(article.publishedAt, locale).full,
    categoryLabel: getNewsCategoryLabel(article.category, locale),
  };
}

function getNewsPrimaryImage(
  article: NewsArticle,
  locale: AppLocale
): string | null {
  const [primaryVisual] = getNewsArticleVisuals(article.slug, locale);
  return primaryVisual?.src ?? (article.imageUrl || null);
}

function getNewsArticleVisuals(
  slug: string,
  locale: AppLocale
): NewsArticleVisual[] {
  return (NEWS_ARTICLE_VISUALS[slug] ?? []).map((visual) => ({
    src: visual.src,
    alt: resolveLocalized(visual.alt, locale),
    caption: resolveLocalized(visual.caption, locale),
  }));
}

function resolveLocalized(
  value: Record<AppLocale, string>,
  locale: AppLocale
): string {
  return value[locale] || value.en || value.zh || "";
}

// Keywords that identify a references/sources section heading in any supported locale.
const REFERENCES_HEADING_PATTERNS = [
  /^\s*资料来源\s*$/,
  /^\s*参考资料\s*$/,
  /^\s*references?\s*$/i,
  /^\s*sources?\s*$/i,
  /^\s*bibliography\s*$/i,
  /^\s*المراجع\s*$/,
  /^\s*referencias?\s*$/i,
];

function extractNodeText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  if (typeof n["text"] === "string") return n["text"];
  if (Array.isArray(n["children"])) {
    return (n["children"] as unknown[]).map(extractNodeText).join("");
  }
  return "";
}

function isReferencesHeading(node: unknown): boolean {
  if (!node || typeof node !== "object") return false;
  const n = node as Record<string, unknown>;
  if (n["type"] !== "heading") return false;
  const text = extractNodeText(n);
  return REFERENCES_HEADING_PATTERNS.some((pattern) => pattern.test(text));
}

function stripReferencesSection<T extends { root?: unknown }>(body: T): T {
  if (!body?.root || typeof body.root !== "object") return body;
  const root = body.root as Record<string, unknown>;
  if (!Array.isArray(root["children"])) return body;

  const children = root["children"] as unknown[];
  const cutIndex = children.findIndex(isReferencesHeading);
  if (cutIndex === -1) return body;

  return {
    ...body,
    root: { ...root, children: children.slice(0, cutIndex) },
  };
}
