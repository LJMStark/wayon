import {
  formatNewsDate,
  getLocalizedNewsBody,
  getLocalizedNewsValue,
  getNewsCategoryLabel,
  type NewsArticleBody,
  type NewsArticle,
} from "@/data/news";
import type { AppLocale } from "@/i18n/types";

import type {
  NewsArticleContentBlock,
  NewsArticleVisual,
  NewsDetailPageData,
  NewsPreviewItem,
} from "../types";

const NEWS_FALLBACK_IMAGE = "/assets/fallbacks/news-fallback.jpg";
const ZYL_918_GLOBAL_OPENING_ASSET_BASE =
  "/assets/news/zyl-918-global-opening";

const NEWS_ARTICLE_VISUALS: Record<
  string,
  ReadonlyArray<{
    src: string;
    alt: Record<AppLocale, string>;
    caption: Record<AppLocale, string>;
  }>
> = {
  "zyl-918-global-opening": [
    zyl918Visual("00-cover.jpg", "opening ceremony cover", "开业封面"),
    zyl918Visual("01.jpg", "opening ceremony scene 1", "开业盛典现场图 1"),
    zyl918Visual("02.jpg", "opening ceremony scene 2", "开业盛典现场图 2"),
    zyl918Visual("03.jpg", "opening ceremony scene 3", "开业盛典现场图 3"),
    zyl918Visual("04.jpg", "opening ceremony scene 4", "开业盛典现场图 4"),
    zyl918Visual(
      "05.jpg",
      "opening ceremony scene 5",
      "开业盛典现场图 5",
      "Opening ceremony",
      "开业盛典现场"
    ),
    zyl918Visual(
      "06.jpg",
      "chairman Dai Jinping",
      "董事长戴锦平",
      "Chairman Dai Jinping",
      "众岩联董事长戴锦平"
    ),
    zyl918Visual(
      "07.jpg",
      "Foshan Ceramics Association secretary-general Pan Yongwen speaks",
      "佛山陶瓷协会秘书长潘勇文致辞",
      "Pan Yongwen speaks",
      "佛山陶瓷协会秘书长潘勇文致辞"
    ),
    zyl918Visual("08.jpg", "scene before the ribbon cutting", "剪彩前现场"),
    zyl918Visual(
      "09.jpg",
      "ribbon-cutting ceremony",
      "剪彩仪式",
      "Ribbon cutting",
      "剪彩仪式"
    ),
    zyl918Visual("10.jpg", "opening ceremony scene 10", "开业现场图 10"),
    zyl918Visual("11.jpg", "opening ceremony scene 11", "开业现场图 11"),
    zyl918Visual(
      "12.jpg",
      "opening celebration display",
      "开业大吉",
      "Opening celebration",
      "开业大吉"
    ),
    zyl918Visual("13.jpg", "showroom visit scene 13", "展厅参观图 13"),
    zyl918Visual("14.jpg", "showroom visit scene 14", "展厅参观图 14"),
    zyl918Visual("15.jpg", "showroom visit scene 15", "展厅参观图 15"),
    zyl918Visual("16.jpg", "showroom visit scene 16", "展厅参观图 16"),
    zyl918Visual("17.jpg", "showroom visit scene 17", "展厅参观图 17"),
    zyl918Visual("18.jpg", "showroom visit scene 18", "展厅参观图 18"),
    zyl918Visual(
      "19.jpg",
      "inside the ZYL 918 pavilion and global pavilion",
      "展厅内部",
      "Inside the showroom",
      "展厅内部"
    ),
  ],
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
      src: "/assets/about/yunfu.webp",
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
      src: "/assets/about/guangdong.jpg",
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
  "seo-luxury-sintered-stone-vs-tile": [
    articleVisual(
      "/assets/solutions/furniture-tops.webp",
      "Luxury sintered stone wall panels used as a seamless living room backdrop",
      "奢石岩板做成整面客厅背景墙",
      "Large-format slabs separate themselves from regular tiles by seam count, edge detailing, and the ability to turn a full wall into one continuous surface.",
      "奢石岩板和普通瓷砖的差别，先看缝线数量、收边方式，以及能不能把整面墙做成一体。"
    ),
    articleVisual(
      "/assets/solutions/scene-wall-floor.jpg",
      "Large-format sintered stone floor laid continuously through an interior",
      "室内连续铺开的岩板地面",
      "Once the material starts running continuously across walls, floors, and furniture tops, it stops behaving like a standard tile category.",
      "当同一材料开始连续用在墙面、地面和家具台面上，它就已经不是普通瓷砖那一类东西了。"
    ),
  ],
  "seo-sintered-stone-marble-replication": [
    articleVisual(
      "/assets/solutions/scene-bathroom-spaces.jpg",
      "Black marble-look sintered stone installed across a luxury bathroom interior",
      "黑色大理石纹岩板用在整套浴室空间里",
      "What buyers call '1:1 marble replication' lives in the continuity of veining, panel scale, and the way the surface reads after full installation.",
      "市场上说的“1:1 还原大理石”，关键看的是纹理连续性、板面尺度和整装后的观感。"
    ),
    articleVisual(
      "/assets/solutions/cabinet-countertops.webp",
      "Green marble-look sintered stone kitchen countertop and waterfall island",
      "绿色大理石纹岩板厨房台面和瀑布岛台",
      "A convincing marble look has to hold up on edges, waterfall ends, and reflected light, not only on a flat sample board.",
      "像不像大理石，不能只看一块平样板，还要看收边、瀑布边和光线下的整体表现。"
    ),
  ],
  "seo-wall-floor-application-sintered-stone": [
    articleVisual(
      "/assets/solutions/scene-wall-floor.jpg",
      "Large-format sintered stone floor laid continuously through an interior",
      "室内连续铺开的岩板地面",
      "Sintered stone works on walls and floors because thickness, slip rating, adhesive system, and movement joints can all be tuned by scenario.",
      "岩板能上墙下地，不是靠一句口号，而是靠厚度、防滑等级、粘结系统和伸缩缝做场景化配置。"
    ),
    articleVisual(
      "/assets/solutions/scene-furniture-tops.jpg",
      "Dining room using sintered stone across wall, floor, and round table top",
      "墙面、地面和圆桌台面连续使用岩板的餐厅空间",
      "Furniture tops are where the same slab family extends beyond architectural cladding and starts unifying the whole room.",
      "当同系列岩板继续用到餐桌和家具台面上，材料才真正从饰面变成整个空间的统一语言。"
    ),
  ],
  "seo-fireproof-sintered-stone-grade": [
    articleVisual(
      "/assets/cases/case-5-weihao-partyk.png",
      "Stone floor and table surfaces installed in a public entertainment venue",
      "公共娱乐空间里的石材地面和台面",
      "Fire rating matters most in hospitality, transit, healthcare, and other public interiors where decorative finishes still have to clear A1 non-combustible specs.",
      "A1 不燃等级最有分量的场景，是酒店、交通枢纽、医疗和其他公共空间里的饰面选材。"
    ),
    articleVisual(
      "/assets/solutions/scene-wall-floor.jpg",
      "Large-format slab wall and floor system inside a public interior",
      "公共室内空间里的大规格岩板墙地系统",
      "The real procurement question is not whether the slab looks premium, but whether the installed system can pass the project's fire-compliance checklist.",
      "工程采购真正要看的，不只是好不好看，而是整套材料系统能不能过项目的防火合规清单。"
    ),
  ],
  "seo-marble-too-expensive-sintered-stone": [
    articleVisual(
      "/assets/solutions/kitchen-countertops.webp",
      "Marble-look sintered stone staircase installed as a premium architectural feature",
      "大理石纹岩板做成的楼梯整装",
      "Luxury sintered stone enters the conversation when buyers want marble drama but need lower maintenance and more predictable project cost.",
      "当采购方想要大理石的气场，又想把维护成本和项目预算控住，奢石岩板就会进到候选名单里。"
    ),
    articleVisual(
      "/assets/solutions/scene-kitchen-countertops.jpg",
      "Marble-look slab used continuously on the countertop and backsplash",
      "大理石纹岩板连续用在台面和背景墙上",
      "The comparison is never just about purchase price; fabrication risk, replacement rate, upkeep, and installation waste all belong in the same budget sheet.",
      "这类材料比较不能只看买价，加工风险、补板率、维护成本和施工损耗都要一起算。"
    ),
  ],
};

function localizedZyl918VisualText(value: string): Record<AppLocale, string> {
  return {
    en: `ZYL 918 pavilion and global pavilion ${value}`,
    zh: `众岩联918馆、全球馆${value}`,
    es: `Pabellon ZYL 918 y pabellon global ${value}`,
    ar: `جناح ZYL 918 والجناح العالمي ${value}`,
  };
}

function zyl918Visual(
  filename: string,
  enAlt: string,
  zhAlt: string,
  enCaption = enAlt,
  zhCaption = zhAlt
): {
  src: string;
  alt: Record<AppLocale, string>;
  caption: Record<AppLocale, string>;
} {
  return {
    src: `${ZYL_918_GLOBAL_OPENING_ASSET_BASE}/${filename}`,
    alt: {
      ...localizedZyl918VisualText(enAlt),
      zh: `众岩联918馆、全球馆${zhAlt}`,
    },
    caption: {
      ...localizedZyl918VisualText(enCaption),
      zh: `众岩联918馆、全球馆${zhCaption}`,
    },
  };
}

function articleVisual(
  src: string,
  enAlt: string,
  zhAlt: string,
  enCaption = enAlt,
  zhCaption = zhAlt
): {
  src: string;
  alt: Record<AppLocale, string>;
  caption: Record<AppLocale, string>;
} {
  return {
    src,
    alt: localizedEnZhText(enAlt, zhAlt),
    caption: localizedEnZhText(enCaption, zhCaption),
  };
}

function localizedEnZhText(
  en: string,
  zh: string
): Record<AppLocale, string> {
  return {
    en,
    zh,
    es: "",
    ar: "",
  };
}

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

  const formattedDate = formatNewsDate(article.publishedAt, locale);

  return {
    date: formattedDate.full,
    dateTime: article.publishedAt,
    dateDay: formattedDate.day,
    dateYearMonth: formattedDate.yearMonth,
    category: getNewsCategoryLabel(article.category, locale),
    title,
    excerpt: getLocalizedNewsValue(article, locale, "excerpt"),
    image: getNewsPrimaryImage(article, locale) ?? NEWS_FALLBACK_IMAGE,
    slug: article.slug,
  };
}

export function getNewsPreviewImage(
  article: Pick<NewsArticle, "slug" | "imageUrl">,
  locale: AppLocale
): string | null {
  const [primaryVisual] = getNewsArticleVisuals(article.slug, locale);
  return primaryVisual?.src ?? (article.imageUrl || null);
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
  const body = rawBody ? stripReferencesSection(rawBody) : null;
  const detailVisuals = primaryVisual ? visuals.slice(1) : visuals;
  const contentBlocks = buildNewsArticleContentBlocks(
    article.slug,
    body,
    detailVisuals
  );

  return {
    backToNewsLabel: copy.backToNewsLabel,
    contactCtaTitle: copy.contactCtaTitle,
    contactLabel: copy.contactLabel,
    contentComingSoonLabel: copy.contentComingSoonLabel,
    title: getLocalizedNewsValue(article, locale, "title"),
    excerpt: getLocalizedNewsValue(article, locale, "excerpt"),
    body,
    imageUrl,
    visuals: detailVisuals,
    contentBlocks,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    dateLabel: formatNewsDate(article.publishedAt, locale).full,
    categoryLabel: getNewsCategoryLabel(article.category, locale),
  };
}

function buildNewsArticleContentBlocks(
  slug: string,
  body: NewsArticleBody | null,
  visuals: NewsArticleVisual[]
): NewsArticleContentBlock[] {
  if (slug !== "zyl-918-global-opening" || !body?.root) {
    return [];
  }

  const root = body.root as Record<string, unknown>;
  if (!Array.isArray(root["children"])) {
    return [];
  }

  const [intro, chairmanIntro, chairmanPlan] = root["children"] as unknown[];
  const blocks: NewsArticleContentBlock[] = [];

  pushBodyBlock(blocks, body, intro);
  for (const visual of visuals.slice(0, 6)) {
    blocks.push({ type: "visual", visual });
  }
  pushBodyBlock(blocks, body, chairmanIntro);
  pushBodyBlock(blocks, body, chairmanPlan);
  for (const visual of visuals.slice(6)) {
    blocks.push({ type: "visual", visual });
  }

  return blocks;
}

function pushBodyBlock(
  blocks: NewsArticleContentBlock[],
  body: NewsArticleBody,
  child: unknown
): void {
  if (!child) return;
  const root = body.root as Record<string, unknown>;
  const bodyBlock = {
    ...body,
    root: {
      ...root,
      children: [child],
    },
  } as unknown as NewsArticleBody;

  blocks.push({
    type: "body",
    body: bodyBlock,
  });
}

function getNewsPrimaryImage(
  article: NewsArticle,
  locale: AppLocale
): string | null {
  return getNewsPreviewImage(article, locale);
}

function getNewsArticleVisuals(
  slug: string,
  locale: AppLocale
): NewsArticleVisual[] {
  return (NEWS_ARTICLE_VISUALS[slug] ?? []).map((visual) => ({
    src: visual.src,
    alt: resolveNewsVisualText(visual.alt, locale),
    caption: resolveNewsVisualText(visual.caption, locale),
  }));
}

export function resolveNewsVisualText(
  value: Record<AppLocale, string>,
  locale: AppLocale
): string {
  const localeValue = value[locale]?.trim();

  if (isUsableNewsVisualText(localeValue, locale)) {
    return localeValue;
  }

  const englishValue = value.en?.trim();

  if (locale !== "zh" && isUsableNewsVisualText(englishValue, "en")) {
    return englishValue;
  }

  if (locale === "zh") {
    return value.zh?.trim() || englishValue || "";
  }

  return "";
}

function isUsableNewsVisualText(
  value: string | undefined,
  locale: AppLocale
): value is string {
  if (!value) {
    return false;
  }

  return locale === "zh" || !/[\u3400-\u9fff]/u.test(value);
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
