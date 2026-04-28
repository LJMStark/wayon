import type { AppLocale } from "@/i18n/types";
import { SOCIAL_LINKS } from "@/data/socialLinks";

type LocalizedValue<T> = Record<AppLocale, T>;
type ResolvedCopy<T> = T extends readonly (infer U)[]
  ? ResolvedCopy<U>[]
  : T extends LocalizedValue<infer V>
    ? V
    : T extends object
      ? { [K in keyof T]: ResolvedCopy<T[K]> }
      : T;

const LOCALES = ["en", "zh", "es", "ar"] as const satisfies readonly AppLocale[];

function isLocalizedValue(value: unknown): value is LocalizedValue<unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return LOCALES.every((locale) => locale in record);
}

function resolveLocale<T>(value: T, locale: AppLocale): ResolvedCopy<T> {
  if (Array.isArray(value)) {
    return value.map((item) => resolveLocale(item, locale)) as ResolvedCopy<T>;
  }

  if (isLocalizedValue(value)) {
    return value[locale] as ResolvedCopy<T>;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        resolveLocale(nestedValue, locale),
      ])
    ) as ResolvedCopy<T>;
  }

  return value as ResolvedCopy<T>;
}

export function formatCopy(
  template: string,
  values: Record<string, string | number>
) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

const SITE_COPY = {
  common: {
    breadcrumbLabel: {
      en: "You are here",
      zh: "您当前的位置",
      es: "Usted está aquí",
      ar: "أنت هنا",
    },
    contactUs: {
      en: "Contact Us",
      zh: "联系我们",
      es: "Contáctenos",
      ar: "اتصل بنا",
    },
    readMore: {
      en: "Read More",
      zh: "了解更多",
      es: "Leer más",
      ar: "اقرأ المزيد",
    },
    download: {
      en: "Download",
      zh: "下载",
      es: "Descargar",
      ar: "تنزيل",
    },
    loading: {
      en: "Loading...",
      zh: "加载中...",
      es: "Cargando...",
      ar: "جارٍ التحميل...",
    },
    allCases: {
      en: "All Cases",
      zh: "全部案例",
      es: "Todos los casos",
      ar: "جميع الحالات",
    },
    recentUpdates: {
      en: "Recent Updates",
      zh: "近期更新",
      es: "Actualizaciones recientes",
      ar: "آخر التحديثات",
    },
    allCollections: {
      en: "All Collections",
      zh: "全部系列",
      es: "Todas las colecciones",
      ar: "كل المجموعات",
    },
    noProductsFound: {
      en: "No products found for this category.",
      zh: "该分类下暂无产品。",
      es: "No se encontraron productos en esta categoría.",
      ar: "لم يتم العثور على منتجات في هذه الفئة.",
    },
    emptyTaxonomy: {
      en: "There are no subcategories to display under \"{section}\" yet.",
      zh: "当前“{section}”栏目还没有可展示的二级分类。",
      es: "Aún no hay subcategorías para mostrar en «{section}».",
      ar: "لا توجد فئات فرعية لعرضها ضمن «{section}» حتى الآن.",
    },
    requestSample: {
      en: "Request a Sample",
      zh: "申请样品",
      es: "Solicitar una muestra",
      ar: "اطلب عينة",
    },
    backToNews: {
      en: "Back to News",
      zh: "返回新闻",
      es: "Volver a noticias",
      ar: "العودة إلى الأخبار",
    },
    errorTitle: {
      en: "Something went wrong",
      zh: "出错了",
      es: "Algo salió mal",
      ar: "حدث خطأ ما",
    },
    errorMessage: {
      en: "We couldn't load this page. Please try again in a moment.",
      zh: "页面加载失败，请稍后重试。",
      es: "No pudimos cargar esta página. Inténtelo de nuevo en un momento.",
      ar: "تعذر تحميل هذه الصفحة. حاول مرة أخرى بعد قليل.",
    },
    tryAgain: {
      en: "Try again",
      zh: "重试",
      es: "Reintentar",
      ar: "حاول مرة أخرى",
    },
    backToHome: {
      en: "Back to home",
      zh: "返回首页",
      es: "Volver al inicio",
      ar: "العودة إلى الصفحة الرئيسية",
    },
    notFoundTitle: {
      en: "Page not found",
      zh: "页面未找到",
      es: "Página no encontrada",
      ar: "الصفحة غير موجودة",
    },
    notFoundMessage: {
      en: "The page you're looking for doesn't exist or has moved.",
      zh: "您查找的页面不存在或已被移动。",
      es: "La página que busca no existe o se ha movido.",
      ar: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    },
    skipToMain: {
      en: "Skip to main content",
      zh: "跳转到主要内容",
      es: "Saltar al contenido principal",
      ar: "تخطي إلى المحتوى الرئيسي",
    },
    contentComingSoon: {
      en: "Content coming soon.",
      zh: "内容即将更新。",
      es: "Contenido próximamente.",
      ar: "سيتم نشر المحتوى قريبًا.",
    },
  },
  header: {
    toggleSearch: {
      en: "Toggle search",
      zh: "切换搜索框",
      es: "Mostrar u ocultar búsqueda",
      ar: "تبديل البحث",
    },
    searchAction: {
      en: "Search",
      zh: "搜索",
      es: "Buscar",
      ar: "بحث",
    },
    openNavigation: {
      en: "Open navigation",
      zh: "打开导航菜单",
      es: "Abrir navegación",
      ar: "فتح التنقل",
    },
    closeNavigationOverlay: {
      en: "Close navigation overlay",
      zh: "关闭导航蒙层",
      es: "Cerrar superposición de navegación",
      ar: "إغلاق طبقة التنقل",
    },
    closeNavigation: {
      en: "Close navigation",
      zh: "关闭导航菜单",
      es: "Cerrar navegación",
      ar: "إغلاق التنقل",
    },
    toggleSection: {
      en: "Toggle {section}",
      zh: "展开或收起 {section}",
      es: "Mostrar u ocultar {section}",
      ar: "تبديل {section}",
    },
  },
  floatingSidebar: {
    showQr: {
      en: "Show QR code",
      zh: "显示二维码",
      es: "Mostrar código QR",
      ar: "إظهار رمز QR",
    },
    contactUs: {
      en: "Contact us",
      zh: "联系我们",
      es: "Contáctenos",
      ar: "اتصل بنا",
    },
    backToTop: {
      en: "Back to top",
      zh: "返回顶部",
      es: "Volver arriba",
      ar: "العودة إلى الأعلى",
    },
    qrTitle: {
      en: "WeChat QR Code",
      zh: "微信二维码",
      es: "Código QR de WeChat",
      ar: "رمز WeChat QR",
    },
    qrHint: {
      en: "Scan to connect",
      zh: "扫码立即沟通",
      es: "Escanee para contactar",
      ar: "امسح للتواصل",
    },
  },
  landing: {
    hero: {
      slideLabel: {
        en: "Go to hero slide {index}",
        zh: "切换到第 {index} 张首屏图",
        es: "Ir a la diapositiva principal {index}",
        ar: "الانتقال إلى شريحة الواجهة {index}",
      },
    },
    aboutAlbum: {
      learnMore: {
        en: "Learn More About Us",
        zh: "了解我们的更多信息",
        es: "Conozca más sobre nosotros",
        ar: "اعرف المزيد عنا",
      },
      previous: {
        en: "Previous album item",
        zh: "上一张相册内容",
        es: "Elemento anterior del álbum",
        ar: "عنصر الألبوم السابق",
      },
      next: {
        en: "Next album item",
        zh: "下一张相册内容",
        es: "Siguiente elemento del álbum",
        ar: "عنصر الألبوم التالي",
      },
    },
    productsCarousel: {
      title: {
        en: "ZYL Product",
        zh: "众岩联产品系列",
        es: "Productos ZYL",
        ar: "منتجات ZYL",
      },
      description: {
        en: "Explore quartz, terrazzo, flexible stone, marble, porcelain slab and other fabrication-ready materials tailored for global architectural projects.",
        zh: "覆盖石英石、水磨石、柔性石材、大理石、岩板等多类可加工材料，面向全球建筑与室内项目提供稳定供应。",
        es: "Explore cuarzo, terrazo, piedra flexible, mármol, porcelánico y otros materiales listos para fabricación para proyectos arquitectónicos globales.",
        ar: "استكشف الكوارتز والتيرازو والحجر المرن والرخام وألواح البورسلان وغيرها من المواد الجاهزة للتصنيع للمشاريع المعمارية العالمية.",
      },
      detail: {
        en: "View Collection",
        zh: "查看产品系列",
        es: "Ver colección",
        ar: "عرض المجموعة",
      },
      previous: {
        en: "Previous products",
        zh: "上一组产品",
        es: "Productos anteriores",
        ar: "المنتجات السابقة",
      },
      next: {
        en: "Next products",
        zh: "下一组产品",
        es: "Productos siguientes",
        ar: "المنتجات التالية",
      },
    },
    solutionTabs: {
      cta: {
        en: "Learn More [{title}]",
        zh: "了解更多 [{title}]",
        es: "Conozca más [{title}]",
        ar: "اعرف المزيد [{title}]",
      },
      previous: {
        en: "Previous solution",
        zh: "上一项方案",
        es: "Solución anterior",
        ar: "الحل السابق",
      },
      next: {
        en: "Next solution",
        zh: "下一项方案",
        es: "Siguiente solución",
        ar: "الحل التالي",
      },
    },
    partnerCarousel: {
      previous: {
        en: "Previous partner",
        zh: "上一类合作伙伴",
        es: "Socio anterior",
        ar: "الشريك السابق",
      },
      next: {
        en: "Next partner",
        zh: "下一类合作伙伴",
        es: "Siguiente socio",
        ar: "الشريك التالي",
      },
    },
    socialTabs: {
      title: {
        en: "Social Media",
        zh: "社交媒体",
        es: "Redes sociales",
        ar: "وسائل التواصل الاجتماعي",
      },
      description: {
        en: "Follow our latest project updates, product launches and factory news across every platform.",
        zh: "关注我们的项目动态、产品上新和工厂新闻，第一时间获取最新内容。",
        es: "Siga nuestras actualizaciones de proyectos, lanzamientos y noticias de fábrica en todas las plataformas.",
        ar: "تابع أحدث تحديثات المشاريع وإطلاقات المنتجات وأخبار المصنع عبر جميع المنصات.",
      },
    },
    newsSection: {
      title: {
        en: "News",
        zh: "新闻动态",
        es: "Noticias",
        ar: "الأخبار",
      },
    },
    productCard: {
      viewDetails: {
        en: "View Details",
        zh: "查看详情",
        es: "Ver detalles",
        ar: "عرض التفاصيل",
      },
    },
  },
  aboutPage: {
    heroTitle: {
      en: "About ZYL",
      zh: "关于众岩联",
      es: "Sobre ZYL",
      ar: "عن ZYL",
    },
    breadcrumbCurrent: {
      en: "About Us",
      zh: "关于我们",
      es: "Sobre nosotros",
      ar: "من نحن",
    },
    introTitle: {
      en: "Guangdong ZYL Sintered Stone Technology Co., Ltd.",
      zh: "广东众岩联岩板科技有限公司",
      es: "ZYL Stone | Calidad en cada paso",
      ar: "ZYL Stone | الجودة في كل خطوة",
    },
    introSubtitle: {
      en: "Professional Sintered Stone Supply Chain Platform",
      zh: "专业岩板供应链平台",
      es: "Proveedor profesional de ingeniería en piedra",
      ar: "مورد محترف لحلول هندسة الحجر",
    },
    paragraphs: [
      {
        en: "Founded in 2014 and based in Foshan, Guangdong ZYL Sintered Stone Technology Co., Ltd. is a professional sintered stone supply chain platform integrating R&D, design, sales and service.",
        zh: "广东众岩联岩板科技有限公司成立于 2014 年，坐落于佛山，是一家集研发、设计、销售、服务于一体的专业岩板供应链平台。",
        es: "Fundada en China en 1982, ZYL Stone opera una red integrada de fabricación que cubre cuarzo, terrazo, mármol, mármol artificial, gemas, porcelánico, piedra de cemento y otros materiales decorativos avanzados.",
        ar: "تأسست ZYL Stone في الصين عام 1982 وتدير شبكة تصنيع متكاملة تشمل الكوارتز والتيرازو والرخام والرخام الصناعي والأحجار الكريمة وألواح البورسلان وحجر الأسمنت ومواد زخرفية متقدمة أخرى.",
      },
      {
        en: "The company operates a 53,000 sqm modern warehouse with more than 2,000,000 sqm of ready-stock slabs, enabling faster response for distributors, project contractors and home customization clients.",
        zh: "公司拥有 53,000㎡ 现代化仓储中心，常备岩板现货超 200 万㎡，能够更快响应渠道分销、工程项目与家居定制需求。",
        es: "Nuestros equipos suministran losas, encimeras, cubiertas de tocador, sistemas murales, pisos y paquetes de ingeniería personalizados para hoteles, desarrollos comerciales y marcas residenciales en más de 80 países y regiones.",
        ar: "تدعم فرقنا الألواح والأسطح وواجهات الحمامات وأنظمة الجدران والأرضيات وحزم الهندسة المخصصة للفنادق والمشاريع التجارية والعلامات السكنية في أكثر من 80 دولة ومنطقة.",
      },
      {
        en: "Supported by two modern production bases, approximately 160,000,000 sqm of annual capacity and a professional marketing and service team of over 100 members, ZYL provides one-stop support from material selection to delivery.",
        zh: "依托两大现代化生产基地、约 1.6 亿㎡ 年产能以及 100+ 专业营销与服务团队，众岩联可为客户提供从选材到交付的一站式服务。",
        es: "Respaldada por canteras, showrooms, I+D y centros de procesamiento, ZYL ofrece un sistema integral desde la selección de materiales y la optimización del diseño hasta la fabricación y la ejecución del proyecto.",
        ar: "وبدعم من المحاجر وصالات العرض والبحث والتطوير ومراكز المعالجة، تقدم ZYL نظامًا متكاملاً يبدأ من اختيار المواد وتحسين التصميم وصولاً إلى التوجيه التصنيعي وتنفيذ المشروع.",
      },
    ],
    stats: [
      {
        value: "2014",
        suffix: {
          en: "",
          zh: "",
          es: " años",
          ar: " سنة",
        },
        label: {
          en: "Founded",
          zh: "成立时间",
          es: "Trayectoria",
          ar: "سنوات الخبرة",
        },
      },
      {
        value: "53,000",
        suffix: {
          en: " sqm",
          zh: " ㎡",
          es: " m²",
          ar: " م²",
        },
        label: {
          en: "Warehouse",
          zh: "现代仓储",
          es: "Área de fábrica",
          ar: "مساحة المصنع",
        },
      },
      {
        value: "2,000,000",
        suffix: {
          en: " sqm",
          zh: " ㎡",
          es: " m²",
          ar: " م²",
        },
        label: {
          en: "Ready Stock",
          zh: "常备现货",
          es: "Producción anual",
          ar: "الطاقة السنوية",
        },
      },
      {
        value: "160M",
        suffix: {
          en: " sqm/yr",
          zh: " ㎡/年",
          es: " m²",
          ar: " م²",
        },
        label: {
          en: "Annual Capacity",
          zh: "年产能力",
          es: "Inventario regular",
          ar: "مخزون دائم",
        },
      },
    ],
    whyTitle: {
      en: "Core Strengths",
      zh: "核心优势",
      es: "Por qué ZYL",
      ar: "لماذا ZYL",
    },
    whyDescription: {
      en: "A 53,000 sqm modern warehouse, more than 2,000,000 sqm of ready stock and a 100+ professional marketing and service team help ZYL respond quickly across quotation, sampling, project coordination and delivery.",
      zh: "53,000㎡ 现代化仓储中心、超 200 万㎡ 常备现货以及 100+ 专业营销与服务团队，使众岩联能够高效响应报价、打样、项目协同与交付需求。",
      es: "Con más de cuatro décadas de experiencia, ZYL combina producción a gran escala, conocimiento de ingeniería y servicio ágil para acelerar el paso del concepto a la instalación.",
      ar: "بخبرة تزيد على أربعة عقود، تجمع ZYL بين الإنتاج واسع النطاق والخبرة الهندسية والخدمة السريعة لمساعدة العملاء على الانتقال من الفكرة إلى التركيب بكفاءة.",
    },
    whyCta: {
      en: "Contact Sales",
      zh: "联系业务团队",
      es: "Conozca la fábrica",
      ar: "تعرف على المصنع",
    },
    philosophyTitle: {
      en: "Philosophy",
      zh: "经营理念",
      es: "Filosofía",
      ar: "الفلسفة",
    },
    philosophyDescription: {
      en: "Mission: Empower users' better life with efficient sintered stone services. Vision: To become the world's leading branded sintered stone service platform. Core values: Users first, service-oriented, altruism and win-win cooperation.",
      zh: "使命：用快捷岩板服务成就用户美好生活。愿景：成为世界第一的品牌岩板服务平台。价值观：用户第一、服务为本、利他共赢。",
      es: "Misión: Impulsar la vida mejor de los usuarios con servicios de piedra sinterizada rápidos y confiables. Visión: Convertirnos en la plataforma de servicios de piedra sinterizada de marca número 1 del mundo. Valores: Los usuarios primero · Orientados al servicio · Altruismo y cooperación beneficiosa para todos.",
      ar: "المهمة: تمكين حياة أفضل للمستخدمين من خلال خدمات لوح الصخور السريعة والموثوقة. الرؤية: أن نصبح منصة خدمات لوح الصخور ذات العلامة التجارية الأولى في العالم. القيم: المستخدمون أولاً · خدمة موجّهة · إيثار وتعاون مربح للجميع.",
    },
    philosophyTabs: {
      en: ["Philosophy", "Mission", "Vision", "Values"],
      zh: ["理念", "使命", "愿景", "价值观"],
      es: ["Filosofía", "Misión", "Visión", "Valores"],
      ar: ["الفلسفة", "الرسالة", "الرؤية", "القيم"],
    },
    philosophyMission: {
      en: "Empower users' better life with fast, reliable sintered stone services.",
      zh: "用快捷岩板服务成就用户美好生活",
      es: "Impulsar la vida mejor de los usuarios con servicios de piedra sinterizada rápidos y confiables.",
      ar: "تمكين حياة أفضل للمستخدمين من خلال خدمات لوح الصخور السريعة والموثوقة.",
    },
    philosophyVision: {
      en: "To become the world's #1 branded sintered stone service platform.",
      zh: "成为世界第一的品牌岩板服务平台",
      es: "Convertirnos en la plataforma de servicios de piedra sinterizada de marca número 1 del mundo.",
      ar: "أن نصبح منصة خدمات لوح الصخور ذات العلامة التجارية الأولى في العالم.",
    },
    philosophyValues: {
      en: "Users first · Service-oriented · Altruism & win-win cooperation",
      zh: "用户第一 · 服务为本 · 利他共赢",
      es: "Los usuarios primero · Orientados al servicio · Altruismo y cooperación beneficiosa para todos",
      ar: "المستخدمون أولاً · خدمة موجّهة · إيثار وتعاون مربح للجميع",
    },
    certificatesTitle: {
      en: "Certificates",
      zh: "资质证书",
      es: "Certificaciones",
      ar: "الشهادات",
    },
    certificatesDescription: {
      en: "Management certifications, export credentials and test reports are being organized for upload. If you need specific qualification files for a project, please contact our team directly.",
      zh: "管理体系认证、出口资质与检测报告资料正在整理中，页面将根据工厂资质文件同步更新。如需具体项目认证文件，请直接联系业务团队。",
      es: "ZYL ha establecido un sistema de gestión de calidad alineado con los requisitos internacionales, con certificaciones y credenciales de ingeniería para exportación y suministro a gran escala.",
      ar: "أنشأت ZYL نظام إدارة جودة متوافقًا مع متطلبات المشاريع الدولية، مع شهادات واعتمادات هندسية تدعم التصدير والتوريد واسع النطاق.",
    },
    certificatesCta: {
      en: "View Certificate",
      zh: "查看证书",
      es: "Ver certificados",
      ar: "عرض الشهادات",
    },
    certificatesPlaceholder: {
      en: "Certificate display area",
      zh: "证书展示区域",
      es: "Área de exhibición de certificados",
      ar: "منطقة عرض الشهادات",
    },
    teamTitle: {
      en: "Team",
      zh: "团队实力",
      es: "Equipo",
      ar: "الفريق",
    },
    teamDescription: {
      en: "ZYL is supported by a 100+ professional marketing and service team that helps clients across sampling, quotation, order coordination, fabrication and delivery.",
      zh: "众岩联拥有 100+ 专业营销与服务团队，可围绕选材、报价、下单、加工协同与交付节点提供持续支持。",
      es: "Nuestros equipos de fabricación, diseño y soporte de proyectos trabajan juntos para convertir la intención arquitectónica en soluciones de piedra listas para fabricar e instalar.",
      ar: "يتعاون فريق التصنيع والتصميم ودعم المشاريع لدينا لتحويل الرؤية المعمارية إلى حلول حجرية قابلة للتصنيع والتركيب.",
    },
    teamPlaceholder: {
      en: "Team story area",
      zh: "团队展示区域",
      es: "Área de presentación del equipo",
      ar: "منطقة عرض الفريق",
    },
    exhibitionTitle: {
      en: "Exhibition",
      zh: "展会活动",
      es: "Exposiciones",
      ar: "المعارض",
    },
    exhibitionDescription: {
      en: "ZYL participates in major trade fairs to connect with global distributors, designers and contractors, showcasing new materials and engineering delivery capabilities.",
      zh: "众岩联持续参加国内外重点展会，与全球经销商、设计师和工程客户保持连接，展示最新材料能力与工程交付实力。",
      es: "ZYL participa en ferias clave para conectar con distribuidores, diseñadores y contratistas globales, mostrando nuevos materiales y capacidades de entrega.",
      ar: "تشارك ZYL في المعارض الرئيسية للتواصل مع الموزعين والمصممين والمقاولين حول العالم وعرض المواد الجديدة وقدرات التنفيذ الهندسي.",
    },
    exhibitionTabs: {
      en: ["Canton Fair", "Xiamen Exhibition", "Other Exhibitions"],
      zh: ["广交会", "厦门石材展", "其他展会"],
      es: ["Feria de Cantón", "Exposición de Xiamen", "Otras ferias"],
      ar: ["معرض كانتون", "معرض شيامن", "معارض أخرى"],
    },
    exhibitionCardCaption: {
      en: "2023 Spring Canton Fair",
      zh: "2023 春季广交会",
      es: "Feria de Cantón Primavera 2023",
      ar: "معرض كانتون ربيع 2023",
    },
    developmentTitleLead: {
      en: "Company",
      zh: "企业",
      es: "Desarrollo",
      ar: "التطور",
    },
    developmentTitleStrong: {
      en: "Highlights",
      zh: "亮点",
      es: "Histórico",
      ar: "المسيرة",
    },
    developmentHistory: [
      {
        year: "2014",
        text: {
          en: "Guangdong ZYL Sintered Stone Technology Co., Ltd. was founded in Foshan in 2014 as a professional sintered stone supply chain platform.",
          zh: "广东众岩联岩板科技有限公司于 2014 年在佛山成立，定位为专业岩板供应链平台。",
          es: "ZYL fue seleccionada para promoción oficial en la Feria de Cantón y mantuvo su presencia continua, reforzando el reconocimiento de marca entre compradores globales.",
          ar: "تم اختيار ZYL للترويج الرسمي في معرض كانتون واستمرت في حضورها المتواصل، ما عزز حضور العلامة لدى المشترين العالميين.",
        },
      },
      {
        year: "53,000㎡",
        text: {
          en: "ZYL operates a 53,000 sqm modern warehouse with more than 2,000,000 sqm of ready-stock slabs for fast project response.",
          zh: "众岩联拥有 53,000㎡ 现代化仓储中心与超 200 万㎡ 常备现货，可快速响应项目需求。",
          es: "La empresa recibió el reconocimiento como proveedor preferido en la industria de decoración de Shenzhen, validando su calidad y capacidad de servicio.",
          ar: "حصلت الشركة على لقب المورد المفضل في قطاع الديكور في شنتشن، ما أكد جودة منتجاتها وقدرتها على خدمة المشاريع.",
        },
      },
      {
        year: "160M㎡",
        text: {
          en: "Two modern production bases equipped with top-tier Italian SACMI 38,000-ton press, Italian SITI 6D inkjet printing, fully automated wide-body precision kiln and KEDA high-precision edging and polishing line support approximately 160,000,000 sqm of annual capacity.",
          zh: "两大现代化生产基地,配备意大利萨克米 38000 吨压机、意大利西斯特姆 6D 喷墨、全自动宽体精密窑炉与科达高精度磨边抛光系统,年产能约 1.6 亿㎡。",
          es: "Dos modernas bases de producción equipadas con la prensa italiana SACMI de 38.000 toneladas, impresión por inyección de tinta SITI 6D italiana, horno de precisión de cuerpo ancho totalmente automatizado y línea de canteado y pulido de alta precisión KEDA, con una capacidad anual de aproximadamente 160.000.000 m².",
          ar: "قاعدتا إنتاج حديثتان مجهزتان بمكبس SACMI الإيطالي بقوة 38,000 طن، وطباعة نافثة للحبر SITI 6D الإيطالية، وفرن واسع عالي الدقة متكامل الأتمتة، وخط تحرير وتلميع KEDA عالي الدقة، بطاقة إنتاجية سنوية تبلغ نحو 160,000,000 م².",
        },
      },
    ],
    moreButton: {
      en: "More",
      zh: "查看更多",
      es: "Más",
      ar: "المزيد",
    },
  },
  contactPage: {
    heroTitle: {
      en: "Contact Us",
      zh: "联系我们",
      es: "Contáctenos",
      ar: "اتصل بنا",
    },
    heroSubtitle: {
      en: "Project quotation, ready-stock inquiry, fabrication support and partnership discussion.",
      zh: "项目报价、现货咨询、加工配套与合作洽谈。",
      es: "Cotizaciones de proyecto, consulta de productos y cooperación.",
      ar: "تسعير المشاريع واستشارات المنتجات ومناقشة التعاون.",
    },
    breadcrumbCurrent: {
      en: "Contact Us",
      zh: "联系我们",
      es: "Contáctenos",
      ar: "اتصل بنا",
    },
    mapTitle: {
      en: "Foshan office and showroom map",
      zh: "佛山展厅与办公中心地图",
      es: "Mapa de la oficina y sala de exposición en Foshan",
      ar: "خريطة المكتب وصالة العرض في فوشان",
    },
    mapSubtitle: {
      en: "Office, showroom and factory contact information",
      zh: "展厅、办公与工厂联络信息",
      es: "Información de contacto de oficina, showroom y fábrica",
      ar: "معلومات الاتصال بالمكتب وصالة العرض والمصنع",
    },
    mapEmbedUrl:
      "https://www.google.com/maps?q=No.%207-8,%2010,%2011-2,%2012,%20Block%203,%20Taobo%203rd%20Road,%20Huaxia%20Ceramic%20Expo%20City,%20Nanzhuang%20Town,%20Chancheng%20District,%20Foshan,%20Guangdong,%20China&output=embed",
    locations: [
      {
        name: {
          en: "Foshan Office & Showroom",
          zh: "佛山展厅与办公中心",
          es: "Oficina y showroom de Foshan",
          ar: "مكتب وصالة عرض فوشان",
        },
        address: {
          en: "No. 7-8, 10, 11-2, 12, Block 3, Taobo 3rd Road, Huaxia Ceramic Expo City, Nanzhuang Town, Chancheng District, Foshan, Guangdong, China",
          zh: "佛山市禅城区南庄镇华夏陶瓷博览城陶博三路3座7-8号，10号，11号之二，12号",
          es: "N.º 7-8, 10, 11-2 y 12, Bloque 3, Taobo 3rd Road, Huaxia Ceramic Expo City, Nanzhuang, Chancheng, Foshan, Guangdong, China",
          ar: "رقم 7-8 و10 و11-2 و12، المبنى 3، طريق تاوبو الثالث، مدينة هواشيا لمعرض السيراميك، نانتشوانغ، تشانتشنغ، فوشان، قوانغدونغ، الصين",
        },
        tel: "+86 132 2924 6894",
        email: "zyl.stone.slab@gmail.com",
        businessHours: {
          en: "Mon-Sat 8:30-17:30",
          zh: "周一至周六 8:30-17:30",
          es: "Lun-Sáb 8:30-17:30",
          ar: "الإثنين-السبت 8:30-17:30",
        },
      },
      {
        name: {
          en: "Zhaoqing Production Base",
          zh: "肇庆生产基地",
          es: "Base de producción de Zhaoqing",
          ar: "قاعدة إنتاج تشاوتشينغ",
        },
        address: {
          en: "Songlong Industrial Park, Baitu Town, Gaoyao District, Zhaoqing, Guangdong, China",
          zh: "广东省肇庆市高要区白土镇宋隆工业园",
          es: "Parque Industrial Songlong, Baitu, distrito de Gaoyao, Zhaoqing, Guangdong, China",
          ar: "منتزه سونغلونغ الصناعي، بلدة بايتو، منطقة غاوياؤ، تشاوتشينغ، قوانغدونغ، الصين",
        },
        tel: "+86 132 2924 6894",
        email: "zyl.stone.slab@gmail.com",
        businessHours: {
          en: "Mon-Sat 8:30-17:30",
          zh: "周一至周六 8:30-17:30",
          es: "Lun-Sáb 8:30-17:30",
          ar: "الإثنين-السبت 8:30-17:30",
        },
      },
    ],
    labels: {
      address: {
        en: "Address",
        zh: "地址",
        es: "Dirección",
        ar: "العنوان",
      },
      tel: {
        en: "Tel",
        zh: "电话",
        es: "Teléfono",
        ar: "الهاتف",
      },
      email: {
        en: "Email",
        zh: "邮箱",
        es: "Correo",
        ar: "البريد الإلكتروني",
      },
      businessHours: {
        en: "Business Hours",
        zh: "服务时间",
        es: "Horario",
        ar: "ساعات العمل",
      },
      fax: {
        en: "Fax",
        zh: "传真",
        es: "Fax",
        ar: "فاكس",
      },
      postalCode: {
        en: "Post Code",
        zh: "邮编",
        es: "Código postal",
        ar: "الرمز البريدي",
      },
    },
    socialLinks: SOCIAL_LINKS.map(({ label, href }) => ({ label, href })),
    formTitle: {
      en: "Leave us a message",
      zh: "给我们留言",
      es: "Déjenos un mensaje",
      ar: "اترك لنا رسالة",
    },
    fields: {
      name: {
        label: {
          en: "Your Name",
          zh: "您的姓名",
          es: "Su nombre",
          ar: "اسمك",
        },
        placeholder: {
          en: "Enter your name *",
          zh: "请输入您的姓名 *",
          es: "Ingrese su nombre *",
          ar: "أدخل اسمك *",
        },
      },
      role: {
        label: {
          en: "You are",
          zh: "您的身份",
          es: "Usted es",
          ar: "أنت",
        },
        placeholder: {
          en: "Select your role *",
          zh: "请选择您的身份 *",
          es: "Seleccione su rol *",
          ar: "اختر دورك *",
        },
        options: {
          en: ["Builder", "Designer", "Homeowner"],
          zh: ["工程承包商", "设计师", "业主"],
          es: ["Constructor", "Diseñador", "Propietario"],
          ar: ["مقاول", "مصمم", "مالك منزل"],
        },
      },
      email: {
        label: {
          en: "E-mail",
          zh: "电子邮箱",
          es: "Correo electrónico",
          ar: "البريد الإلكتروني",
        },
        placeholder: {
          en: "Enter your e-mail *",
          zh: "请输入您的邮箱 *",
          es: "Ingrese su correo *",
          ar: "أدخل بريدك الإلكتروني *",
        },
      },
      company: {
        label: {
          en: "Company",
          zh: "公司名称",
          es: "Empresa",
          ar: "الشركة",
        },
        placeholder: {
          en: "Enter your company *",
          zh: "请输入公司名称 *",
          es: "Ingrese su empresa *",
          ar: "أدخل اسم الشركة *",
        },
      },
      contact: {
        label: {
          en: "Website / WhatsApp / Phone / WeChat",
          zh: "网站 / WhatsApp / 电话 / 微信",
          es: "Sitio web / WhatsApp / Teléfono / WeChat",
          ar: "الموقع / واتساب / الهاتف / ويتشات",
        },
        placeholder: {
          en: "Enter your contact details",
          zh: "请输入您的联系方式",
          es: "Ingrese su contacto",
          ar: "أدخل بيانات التواصل",
        },
      },
      country: {
        label: {
          en: "Country / Region",
          zh: "国家 / 地区",
          es: "País / Región",
          ar: "الدولة / المنطقة",
        },
        placeholder: {
          en: "Enter your country / region",
          zh: "请输入国家或地区",
          es: "Ingrese su país / región",
          ar: "أدخل دولتك / منطقتك",
        },
      },
      message: {
        label: {
          en: "Your message",
          zh: "您的需求",
          es: "Su mensaje",
          ar: "رسالتك",
        },
        placeholder: {
          en: "Enter your message",
          zh: "请输入您的留言内容",
          es: "Ingrese su mensaje",
          ar: "أدخل رسالتك",
        },
      },
    },
    submit: {
      en: "Send Inquiry",
      zh: "提交咨询",
      es: "Enviar consulta",
      ar: "إرسال الاستفسار",
    },
    submitting: {
      en: "Submitting...",
      zh: "提交中...",
      es: "Enviando...",
      ar: "جاري الإرسال...",
    },
    successMessage: {
      en: "Inquiry submitted successfully! We will get back to you soon.",
      zh: "咨询提交成功！我们将尽快与您联系。",
      es: "¡Consulta enviada exitosamente! Nos pondremos en contacto con usted pronto.",
      ar: "تم إرسال الاستفسار بنجاح! سنرد عليك قريبًا.",
    },
    errorMessage: {
      en: "Failed to submit inquiry. Please try again.",
      zh: "提交咨询失败，请重试。",
      es: "No se pudo enviar la consulta. Inténtelo de nuevo.",
      ar: "فشل إرسال الاستفسار. يرجى المحاولة مرة أخرى.",
    },
    rateLimitedMessage: {
      en: "You have submitted several inquiries recently. Please wait a few minutes before trying again.",
      zh: "您近期已提交多次咨询，请稍后再试。",
      es: "Ya ha enviado varias consultas recientemente. Espere unos minutos antes de volver a intentarlo.",
      ar: "لقد قمت بإرسال عدة استفسارات مؤخرًا. يُرجى الانتظار بضع دقائق قبل المحاولة مرة أخرى.",
    },
    productInquiryPrefill: {
      en: "I'm interested in product {slug} and would like to request a sample.",
      zh: "我对产品 {slug} 感兴趣，希望索取样品。",
      es: "Estoy interesado en el producto {slug} y me gustaría solicitar una muestra.",
      ar: "أنا مهتم بالمنتج {slug} وأود طلب عينة.",
    },
    honeypotLabel: {
      en: "Website (leave this field empty)",
      zh: "网站（请留空）",
      es: "Sitio web (deje este campo vacío)",
      ar: "الموقع الإلكتروني (اترك هذا الحقل فارغًا)",
    },
    finePrint: {
      en: "By submitting, you agree that we may contact you about your inquiry.",
      zh: "提交后，即表示您同意我们就本次咨询与您联系。",
      es: "Al enviar el formulario, acepta que podamos contactarle sobre su consulta.",
      ar: "بإرسال النموذج، فإنك توافق على أن نتواصل معك بخصوص استفسارك.",
    },
    sampleTitleLine1: {
      en: "Contact us",
      zh: "联系众岩联",
      es: "Contáctenos",
      ar: "تواصل معنا",
    },
    sampleTitleLine2: {
      en: "Get free sample!",
      zh: "获取免费样品",
      es: "¡Obtenga muestras gratis!",
      ar: "احصل على عينة مجانية!",
    },
    samplePlaceholder: {
      en: "Sample book mockup graphic",
      zh: "样册展示效果图",
      es: "Gráfico de muestra del catálogo",
      ar: "تصور بصري لكتاب العينات",
    },
  },
  solutionPage: {
    heroTitle: {
      en: "Master of Stone",
      zh: "石材场景大师",
      es: "Maestría en piedra",
      ar: "إتقان الحجر",
    },
    heroSubtitle: {
      en: "Countertops, wall systems, flooring and finished products tailored for residential and commercial projects.",
      zh: "面向住宅与商业项目的台面、墙面系统、地面系统与成品交付方案。",
      es: "Encimeras, sistemas murales, pisos y productos terminados para proyectos residenciales y comerciales.",
      ar: "أسطح عمل وأنظمة جدران وأرضيات ومنتجات نهائية مخصصة للمشاريع السكنية والتجارية.",
    },
  },
  casesPage: {
    heroTitle: {
      en: "Proven Engineering Excellence",
      zh: "工程实力，有目共睹",
      es: "Excelencia en ingeniería probada",
      ar: "تميز هندسي موثوق",
    },
    heroSubtitle: {
      en: "ZYL sintered stone has been specified across hundreds of residential and commercial projects worldwide — from countertops to façades, every installation speaks for itself.",
      zh: "众岩联岩板已落地全球数百个住宅与商业项目，从台面到幕墙，每一处应用都是品质的见证。",
      es: "La piedra sinterizada ZYL se ha especificado en cientos de proyectos residenciales y comerciales en todo el mundo, desde encimeras hasta fachadas.",
      ar: "تم تنفيذ حجر ZYL الملبد في مئات المشاريع السكنية والتجارية حول العالم — من أسطح العمل إلى الواجهات، كل تركيب يتحدث عن نفسه.",
    },
    galleryAlt: {
      en: "Engineering case {index}",
      zh: "工程案例 {index}",
      es: "Caso de ingeniería {index}",
      ar: "حالة هندسية {index}",
    },
    salesCaseNames: {
      en: [
        "Weihao PARTYK", "Weihao PARTYK", "Weihao PARTYK", "Weihao Hotel", "Weihao Hotel", "Guangzhou Yuehai Land",
        "Lincheng Shanshui Hotel", "Yuehai · Yungang City", "Qingyu Garden Hotel", "Qingyu Garden Hotel", "Qingyu Garden Hotel", "Weihao PARTYK",
      ],
      zh: [
        "威豪PARTYK", "威豪PARTYK", "威豪PARTYK", "威豪酒店", "威豪酒店", "广州粤海置地",
        "林城山水酒店", "粤海·云港城", "青语花园酒店", "青语花园酒店", "青语花园酒店", "威豪PARTYK",
      ],
      es: [
        "Weihao PARTYK", "Weihao PARTYK", "Weihao PARTYK", "Hotel Weihao", "Hotel Weihao", "Yuehai Land Guangzhou",
        "Hotel Lincheng Shanshui", "Yuehai · Ciudad Yungang", "Hotel Qingyu Garden", "Hotel Qingyu Garden", "Hotel Qingyu Garden", "Weihao PARTYK",
      ],
      ar: [
        "وييهاو PARTYK", "وييهاو PARTYK", "وييهاو PARTYK", "فندق وييهاو", "فندق وييهاو", "يويهاي لاند قوانغتشو",
        "فندق لينتشنغ شانشوي", "يويهاي · مدينة يونغانغ", "فندق تشينغيو غاردن", "فندق تشينغيو غاردن", "فندق تشينغيو غاردن", "وييهاو PARTYK",
      ],
    },
    factoryCaseNames: {
      en: [
        "Wenling People's Court", "Xiangyang Intermediate People's Court", "Liaoning Provincial Archives", "Baigou Town Government",
        "Guangzhou Agile Hotel", "CWTC International Hotel", "International Grand Hotel", "Junhao Hotel",
        "Kailai International Hotel", "Changchun Convention Center Hotel", "Wulate Grand Hotel", "Chongqing Sheraton Hotel",
        "Beijing Children's Palace", "Yangzhou Library", "Ewenki Museum", "Suzhou Art Museum",
        "Shengsi County Cultural Center", "Longshan Culture Museum", "Sanfu Art Gallery", "Buchang Library",
        "Hubei Xiangfan Greenwich Tower", "Zhengzhou Meijing Tiancheng (Shihua Rd.)", "Times Beauty Residence", "Zhengzhou Arcadia (Huanghe East Rd.)",
        "Heilongjiang University", "Huanggang Middle School Guangzhou Campus", "Nankai University", "Hangzhou Greentown Yuhua School",
        "Beijing Capital International Airport", "World Expo Command Center", "Guangzhou Baiyun International Airport", "Guangzhou Metro Line 5",
      ],
      zh: [
        "温岭市人民法院", "襄阳市中级人民法院", "辽宁省档案馆", "白沟镇人民政府",
        "广州雅居乐酒店", "华贸国际酒店", "国际大酒店", "君豪酒店",
        "凯利莱国际酒店", "长春会展中心大酒店", "乌拉特大酒店", "重庆喜来登大酒店",
        "北京市少年宫", "扬州市图书馆", "鄂温克博物馆", "苏州美术馆",
        "嵊泗县文化馆", "龙山文化博物馆", "三福艺术馆", "步长图书馆",
        "湖北省襄樊格林威治大厦", "郑州市石化路美景天城", "时代倾城", "郑州市黄河东路阿卡迪亚",
        "黑龙江大学", "黄冈中学广州学校", "南开大学", "杭州绿城育华学校",
        "北京首都机场", "世博指挥中心", "广州新白云国际机场", "广州地铁五号线",
      ],
      es: [
        "Tribunal Popular de Wenling", "Tribunal Intermedio de Xiangyang", "Archivo Provincial de Liaoning", "Gobierno del Municipio de Baigou",
        "Hotel Agile Guangzhou", "Hotel Internacional CWTC", "Gran Hotel Internacional", "Hotel Junhao",
        "Hotel Internacional Kailai", "Hotel del Centro de Convenciones de Changchun", "Gran Hotel Wulate", "Hotel Sheraton Chongqing",
        "Palacio Infantil de Beijing", "Biblioteca de Yangzhou", "Museo Ewenki", "Museo de Arte de Suzhou",
        "Centro Cultural del Condado de Shengsi", "Museo de la Cultura Longshan", "Galería de Arte Sanfu", "Biblioteca Buchang",
        "Torre Greenwich Xiangfan (Hubei)", "Zhengzhou Meijing Tiancheng (Av. Shihua)", "Times Beauty Residence", "Zhengzhou Arcadia (Av. Huanghe Este)",
        "Universidad de Heilongjiang", "Escuela Huanggang Campus Guangzhou", "Universidad de Nankai", "Escuela Greentown Yuhua de Hangzhou",
        "Aeropuerto Internacional de Beijing-Capital", "Centro de Mando de la Expo Mundial", "Aeropuerto Internacional Baiyun de Guangzhou", "Metro de Guangzhou Línea 5",
      ],
      ar: [
        "محكمة الشعب في وينلينغ", "محكمة الشعب المتوسطة في شيانغيانغ", "أرشيف مقاطعة لياونينغ", "حكومة بلدة بايقو",
        "فندق أجيل قوانغتشو", "فندق CWTC الدولي", "الفندق الدولي الكبير", "فندق جونهاو",
        "فندق كايلاي الدولي", "فندق مركز مؤتمرات تشانغتشون", "فندق وولاتي الكبير", "فندق شيراتون تشونغتشينغ",
        "قصر الأطفال في بكين", "مكتبة يانغتشو", "متحف إيونكي", "متحف سوتشو للفنون",
        "المركز الثقافي لمقاطعة شنغسي", "متحف ثقافة لونغشان", "صالة سانفو للفنون", "مكتبة بوتشانغ",
        "برج غرينتش في شيانغفان (هوبي)", "ميجينغ تيانتشنغ بزنغتشو (طريق شيهوا)", "تايمز بيوتي ريزيدنس", "أركاديا بزنغتشو (طريق هوانغهي الشرقي)",
        "جامعة هيلونغجيانغ", "مدرسة هوانغقانغ - فرع قوانغتشو", "جامعة نانكاي", "مدرسة قرينتاون يوهوا في هانغتشو",
        "مطار بكين العاصمة الدولي", "مركز قيادة معرض إكسبو العالمي", "مطار قوانغتشو باييون الدولي", "مترو قوانغتشو الخط 5",
      ],
    },
  },
  downloadPage: {
    heroTitle: {
      en: "Download",
      zh: "下载中心",
      es: "Descargas",
      ar: "مركز التنزيل",
    },
    heroDescription: {
      en: "Access product catalogs, technical specifications and installation references prepared for distributors, designers and project teams.",
      zh: "获取面向经销商、设计师与项目团队准备的产品图册、技术参数与安装参考资料。",
      es: "Acceda a catálogos, especificaciones técnicas y guías de instalación preparadas para distribuidores, diseñadores y equipos de proyecto.",
      ar: "احصل على كتالوجات المنتجات والمواصفات الفنية ومواد التركيب المخصصة للموزعين والمصممين وفرق المشاريع.",
    },
    requestCatalog: {
      en: "Request file",
      zh: "索取资料",
      es: "Solicitar archivo",
      ar: "اطلب الملف",
    },
    catalogs: [
      {
        title: {
          en: "Quartz Stone Catalog",
          zh: "石英石产品图册",
          es: "Catálogo de piedra de cuarzo",
          ar: "كتالوج حجر الكوارتز",
        },
        description: {
          en: "Full quartz collection covering Natural, Pure, Crystal, Multi-Color and Platinum ranges.",
          zh: "覆盖自然、纯色、水晶、多色和铂金系列的完整石英石资料。",
          es: "Colección completa de cuarzo con líneas Natural, Pure, Crystal, Multi-Color y Platinum.",
          ar: "مجموعة كاملة من الكوارتز تشمل سلاسل Natural وPure وCrystal وMulti-Color وPlatinum.",
        },
        size: "12.5 MB",
        year: "2025",
      },
      {
        title: {
          en: "Terrazzo Collection",
          zh: "无机水磨石图册",
          es: "Colección de terrazo",
          ar: "مجموعة التيرازو",
        },
        description: {
          en: "Color ranges, slab specifications and application recommendations for terrazzo projects.",
          zh: "水磨石色系、板材规格与应用建议汇总。",
          es: "Gamas de color, especificaciones y recomendaciones de uso para proyectos de terrazo.",
          ar: "ألوان ومقاسات وتوصيات تطبيق لمشاريع التيرازو.",
        },
        size: "8.3 MB",
        year: "2025",
      },
      {
        title: {
          en: "Flexible Stone Guide",
          zh: "柔性石材指南",
          es: "Guía de piedra flexible",
          ar: "دليل الحجر المرن",
        },
        description: {
          en: "Series overview, installation method and technical notes for flexible stone solutions.",
          zh: "柔性石材系列、安装方式与技术说明。",
          es: "Resumen de series, método de instalación y notas técnicas para piedra flexible.",
          ar: "نظرة عامة على السلاسل وطريقة التركيب والملاحظات الفنية للحجر المرن.",
        },
        size: "6.1 MB",
        year: "2025",
      },
      {
        title: {
          en: "Marble Collection",
          zh: "大理石图册",
          es: "Colección de mármol",
          ar: "مجموعة الرخام",
        },
        description: {
          en: "Marble color families, finishes and reference applications for hospitality and luxury spaces.",
          zh: "大理石色系、表面工艺与酒店及高端空间参考案例。",
          es: "Familias de color, acabados y referencias para hoteles y espacios de lujo.",
          ar: "عائلات الألوان والتشطيبات والتطبيقات المرجعية لمساحات الضيافة والفخامة.",
        },
        size: "15.2 MB",
        year: "2025",
      },
      {
        title: {
          en: "Gem Stone Catalog",
          zh: "半宝石图册",
          es: "Catálogo de piedra semipreciosa",
          ar: "كتالوج الأحجار شبه الكريمة",
        },
        description: {
          en: "Luxury translucent surfaces, agate series and custom decorative applications.",
          zh: "透光奢石、玛瑙系列与定制装饰应用展示。",
          es: "Superficies translúcidas de lujo, serie ágata y aplicaciones decorativas personalizadas.",
          ar: "أسطح فاخرة شبه شفافة وسلسلة العقيق وتطبيقات ديكورية مخصصة.",
        },
        size: "9.7 MB",
        year: "2025",
      },
      {
        title: {
          en: "Cement Stone Guide",
          zh: "水泥石指南",
          es: "Guía de piedra de cemento",
          ar: "دليل حجر الأسمنت",
        },
        description: {
          en: "Industrial-style cement stone ranges designed for contemporary architecture and interiors.",
          zh: "面向现代建筑与室内项目的工业风水泥石资料。",
          es: "Líneas de piedra de cemento de estética industrial para arquitectura contemporánea.",
          ar: "سلاسل حجر الأسمنت بطابع صناعي للمشاريع المعمارية الحديثة.",
        },
        size: "5.4 MB",
        year: "2024",
      },
      {
        title: {
          en: "Artificial Marble Catalog",
          zh: "人造大理石图册",
          es: "Catálogo de mármol artificial",
          ar: "كتالوج الرخام الصناعي",
        },
        description: {
          en: "Cost-efficient marble alternatives with multiple color families and fabrication notes.",
          zh: "多色系人造大理石资料及加工说明。",
          es: "Alternativas rentables al mármol con múltiples familias de color y notas de fabricación.",
          ar: "بدائل اقتصادية للرخام مع عدة عائلات لونية وملاحظات تصنيع.",
        },
        size: "7.8 MB",
        year: "2024",
      },
      {
        title: {
          en: "Porcelain Slab Collection",
          zh: "岩板图册",
          es: "Colección de porcelánico",
          ar: "مجموعة ألواح البورسلان",
        },
        description: {
          en: "Texture systems, thickness options and engineering references for porcelain slabs.",
          zh: "岩板纹理体系、厚度方案及工程应用参考。",
          es: "Sistemas de textura, espesores y referencias técnicas de porcelánico.",
          ar: "أنظمة الملمس وخيارات السماكة والمراجع الهندسية لألواح البورسلان.",
        },
        size: "11.0 MB",
        year: "2025",
      },
      {
        title: {
          en: "Silica-Free Stone Brochure",
          zh: "零硅石材手册",
          es: "Folleto de piedra sin sílice",
          ar: "كتيب الحجر الخالي من السيليكا",
        },
        description: {
          en: "Safety-focused surface system with certification highlights and comparison data.",
          zh: "聚焦安全属性的零硅石材资料，含认证亮点与对比数据。",
          es: "Sistema seguro de superficies con certificaciones y datos comparativos.",
          ar: "نظام أسطح يركز على السلامة مع الشهادات وبيانات المقارنة.",
        },
        size: "3.2 MB",
        year: "2025",
      },
    ],
    ctaTitle: {
      en: "Need custom documentation?",
      zh: "需要定制资料吗？",
      es: "¿Necesita documentación personalizada?",
      ar: "هل تحتاج إلى وثائق مخصصة؟",
    },
    ctaDescription: {
      en: "Contact our team for project-specific specifications, custom brochures and technical support documents.",
      zh: "如需项目专属规格书、定制画册或技术支持文件，欢迎联系我们。",
      es: "Contacte con nuestro equipo para fichas técnicas, catálogos a medida y soporte documental.",
      ar: "تواصل مع فريقنا للحصول على مواصفات خاصة بالمشروع وكتيبات مخصصة ووثائق دعم فني.",
    },
  },
  newsPage: {
    eyebrow: {
      en: "Press Room",
      zh: "新闻中心",
      es: "Sala de prensa",
      ar: "المركز الإعلامي",
    },
    heroTitle: {
      en: "Company News & Updates",
      zh: "企业新闻与动态",
      es: "Noticias y actualizaciones de la empresa",
      ar: "أخبار الشركة وتحديثاتها",
    },
    heroDescription: {
      en: "Stay current on product launches, project milestones and exhibition highlights from ZYL Stone.",
      zh: "了解众岩联最新的产品发布、项目里程碑与展会动态。",
      es: "Manténgase al día con lanzamientos, hitos de proyecto y exhibiciones de ZYL Stone.",
      ar: "ابق على اطلاع على إطلاقات المنتجات ومحطات المشاريع وأبرز المعارض لدى ZYL Stone.",
    },
    readLabel: {
      en: "Read",
      zh: "查看",
      es: "Leer",
      ar: "قراءة",
    },
    items: [
      {
        date: "2023-11-15",
        category: {
          en: "Company Update",
          zh: "企业动态",
          es: "Actualización corporativa",
          ar: "تحديث الشركة",
        },
        title: {
          en: "ZYL showcases zero-silica quartz at Verona Marmomac",
          zh: "众岩联在维罗纳 Marmomac 展出零硅石英石方案",
          es: "ZYL presenta cuarzo sin sílice en Verona Marmomac",
          ar: "ZYL تعرض كوارتزًا خاليًا من السيليكا في Marmomac فيرونا",
        },
        excerpt: {
          en: "Our silica-free engineered stone series received strong attention from architects seeking safer and more sustainable interior surfaces.",
          zh: "面向更安全、更可持续室内饰面的零硅人造石系列，受到建筑师群体的高度关注。",
          es: "Nuestra serie de piedra sin sílice recibió gran interés de arquitectos que buscan superficies interiores más seguras y sostenibles.",
          ar: "حصلت سلسلة الحجر الهندسي الخالي من السيليكا على اهتمام قوي من المعماريين الباحثين عن أسطح داخلية أكثر أمانًا واستدامة.",
        },
        img: "https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=80",
        slug: "marmomac-zero-silica-showcase",
      },
      {
        date: "2023-09-08",
        category: {
          en: "Product Launch",
          zh: "新品发布",
          es: "Lanzamiento",
          ar: "إطلاق منتج",
        },
        title: {
          en: "Introducing the new luxury terrazzo collection",
          zh: "全新高端水磨石系列正式发布",
          es: "Presentamos la nueva colección de terrazo de lujo",
          ar: "إطلاق مجموعة التيرازو الفاخرة الجديدة",
        },
        excerpt: {
          en: "The new terrazzo line combines contemporary binders with classic aggregate expression for high-traffic commercial projects.",
          zh: "新系列将现代胶结体系与经典骨料表达结合，面向高人流商业空间提供更稳定的落地选择。",
          es: "La nueva línea combina aglomerantes contemporáneos con la expresión clásica del agregado para proyectos comerciales de alto tránsito.",
          ar: "يجمع الخط الجديد بين الروابط الحديثة والتعبير الكلاسيكي للركام لمشاريع تجارية عالية الحركة.",
        },
        img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80",
        slug: "luxury-terrazzo-launch",
      },
      {
        date: "2023-06-22",
        category: {
          en: "Milestone",
          zh: "发展里程碑",
          es: "Hito",
          ar: "إنجاز مهم",
        },
        title: {
          en: "Guangdong factory reaches new annual output milestone",
          zh: "广东工厂年产能力再上新台阶",
          es: "La fábrica de Guangdong alcanza un nuevo hito de producción",
          ar: "مصنع قوانغدونغ يصل إلى مستوى جديد في الطاقة الإنتاجية",
        },
        excerpt: {
          en: "Ongoing automation upgrades continue to improve throughput, consistency and delivery reliability across major product lines.",
          zh: "持续推进的自动化升级进一步提升了主要品类的产能、稳定性与交付可靠性。",
          es: "Las mejoras continuas de automatización siguen elevando la capacidad, la consistencia y la fiabilidad de entrega.",
          ar: "تواصل ترقيات الأتمتة تحسين الإنتاجية والثبات وموثوقية التسليم عبر خطوط الإنتاج الرئيسية.",
        },
        img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
        slug: "annual-output-milestone",
      },
      {
        date: "2023-03-30",
        category: {
          en: "Design Award",
          zh: "设计奖项",
          es: "Premio de diseño",
          ar: "جائزة تصميم",
        },
        title: {
          en: "Flexible stone receives architectural design recognition",
          zh: "柔性石材方案获得建筑设计认可",
          es: "La piedra flexible recibe reconocimiento en diseño arquitectónico",
          ar: "الحجر المرن ينال تقديرًا في التصميم المعماري",
        },
        excerpt: {
          en: "Its realistic texture and bendable substrate continue to open new opportunities for curved wall and custom façade applications.",
          zh: "凭借逼真的石材质感与可弯折基层，柔性石材正在为曲面墙体和定制立面创造更多可能。",
          es: "Su textura realista y soporte flexible abren nuevas posibilidades para muros curvos y fachadas personalizadas.",
          ar: "تفتح خامته الواقعية وطبقته القابلة للانحناء فرصًا جديدة للجدران المنحنية والواجهات المخصصة.",
        },
        img: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80",
        slug: "design-award-2023",
      },
    ],
  },
  productsPage: {
    heroTitle: {
      en: "Product Collection",
      zh: "产品系列",
      es: "Colección de productos",
      ar: "مجموعة المنتجات",
    },
    heroSubtitle: {
      en: "Browse ZYL's core material systems for countertops, cladding, flooring and custom fabrication.",
      zh: "查看众岩联面向台面、墙面、地面与定制加工的核心材料体系。",
      es: "Explore los sistemas de materiales de ZYL para encimeras, revestimientos, pisos y fabricación personalizada.",
      ar: "استعرض أنظمة المواد الأساسية من ZYL لأسطح العمل والكسوة والأرضيات والتصنيع المخصص.",
    },
    collectionLabel: {
      en: "Collection Overview",
      zh: "",
      es: "Resumen de colecciones",
      ar: "نظرة عامة على المجموعات",
    },
    directoryTitle: {
      en: "Trade Materials Directory",
      zh: "外贸产品目录",
      es: "Directorio de materiales",
      ar: "دليل مواد التصدير",
    },
    directoryDescription: {
      en: "Browse product families and filter by size, process, series type and color. Open a family to switch between available variants and media sets.",
      zh: "按规格、工艺、系列类型和颜色筛选产品家族，进入详情后可切换不同变体与现有素材。",
      es: "Filtre las familias de producto por tamaño, proceso, serie y color. En la ficha podrá cambiar entre variantes y recursos disponibles.",
      ar: "استعرض عائلات المنتجات حسب المقاس والتشطيب والنوع واللون، ثم بدّل بين المتغيرات والوسائط المتاحة داخل الصفحة.",
    },
    allFilter: {
      en: "All",
      zh: "全部",
      es: "Todos",
      ar: "الكل",
    },
    backToCategories: {
      en: "Back to categories",
      zh: "返回分类",
      es: "Volver a categorías",
      ar: "العودة إلى الفئات",
    },
    productCount: {
      en: "{count} products",
      zh: "共 {count} 个产品",
      es: "{count} productos",
      ar: "{count} منتج",
    },
    sizeFilterLabel: {
      en: "Size",
      zh: "规格",
      es: "Tamaño",
      ar: "المقاس",
    },
    processFilterLabel: {
      en: "Process",
      zh: "工艺",
      es: "Proceso",
      ar: "التشطيب",
    },
    seriesTypeFilterLabel: {
      en: "Series Type",
      zh: "系列类型",
      es: "Tipo de serie",
      ar: "نوع السلسلة",
    },
    colorGroupFilterLabel: {
      en: "Color",
      zh: "颜色",
      es: "Color",
      ar: "اللون",
    },
  },
  productDetailPage: {
    overviewTitle: {
      en: "Material Overview",
      zh: "材料概览",
      es: "Resumen del material",
      ar: "نظرة عامة على المادة",
    },
    description1: {
      en: "Discover the durability and refined surface quality of {title} from the {category} category, designed for premium residential and commercial applications.",
      zh: "了解 {category} 系列中的 {title}，它兼具耐用性能与精致表面表现，可用于高端住宅与商业项目。",
      es: "Descubra la durabilidad y la calidad superficial de {title} de la categoría {category}, diseñada para aplicaciones residenciales y comerciales de alto nivel.",
      ar: "اكتشف متانة وجودة سطح {title} من فئة {category}، المصمم للتطبيقات السكنية والتجارية الراقية.",
    },
    description2: {
      en: "This surface is suitable for countertops, wall cladding, hospitality fit-outs and custom fabrication programs that require reliable performance and visual consistency.",
      zh: "该材料适用于厨房台面、墙面包覆、酒店配套与定制加工等对性能稳定性和视觉一致性要求较高的场景。",
      es: "La superficie es adecuada para encimeras, revestimientos, hoteles y programas de fabricación personalizada que exigen rendimiento y consistencia visual.",
      ar: "هذه المادة مناسبة لأسطح العمل وكسوة الجدران وتجهيزات الضيافة وبرامج التصنيع المخصص التي تتطلب أداءً موثوقًا واتساقًا بصريًا.",
    },
    thicknessLabel: {
      en: "Thickness",
      zh: "厚度",
      es: "Espesor",
      ar: "السماكة",
    },
    thicknessValue: {
      en: "12mm / 20mm",
      zh: "12mm / 20mm",
      es: "12 mm / 20 mm",
      ar: "12 مم / 20 مم",
    },
    finishLabel: {
      en: "Finish",
      zh: "表面工艺",
      es: "Acabado",
      ar: "التشطيب",
    },
    finishValue: {
      en: "Polished / Matte",
      zh: "亮光 / 哑光",
      es: "Pulido / Mate",
      ar: "لامع / مطفي",
    },
    categoryFallback: {
      en: "Stone Surface",
      zh: "岩板产品",
      es: "Superficie mineral",
      ar: "سطح حجري",
    },
    variantSelectorLabel: {
      en: "Variant",
      zh: "规格 / 工艺 / 编号",
      es: "Variante",
      ar: "المتغير",
    },
    productCodeLabel: {
      en: "Code",
      zh: "编号",
      es: "Código",
      ar: "الكود",
    },
    colorGroupLabel: {
      en: "Color",
      zh: "颜色",
      es: "Color",
      ar: "اللون",
    },
    sizeLabel: {
      en: "Size",
      zh: "规格",
      es: "Tamaño",
      ar: "المقاس",
    },
    processLabel: {
      en: "Process",
      zh: "工艺",
      es: "Proceso",
      ar: "التشطيب",
    },
    faceCountLabel: {
      en: "Face Count",
      zh: "面数",
      es: "Numero de caras",
      ar: "عدد الوجوه",
    },
    facePatternNoteLabel: {
      en: "Pattern Note",
      zh: "连纹说明",
      es: "Nota de patrón",
      ar: "ملاحظة النمط",
    },
    elementImagesTitle: {
      en: "Element Images",
      zh: "元素图",
      es: "Imágenes de elemento",
      ar: "صور العناصر",
    },
    spaceImagesTitle: {
      en: "Space Images",
      zh: "空间图",
      es: "Imágenes de espacio",
      ar: "صور المساحة",
    },
    realImagesTitle: {
      en: "Real Photos",
      zh: "实拍图",
      es: "Fotos reales",
      ar: "صور واقعية",
    },
    videosTitle: {
      en: "Videos",
      zh: "展示视频",
      es: "Videos",
      ar: "الفيديوهات",
    },
    videoFallback: {
      en: "Your browser does not support this video format.",
      zh: "当前浏览器不支持该视频格式，可直接下载查看。",
      es: "Su navegador no es compatible con este formato de video.",
      ar: "متصفحك لا يدعم هذا النوع من الفيديو.",
    },
  },
  metadata: {
    root: {
      title: {
        en: "ZYL | Sintered Stone Supply Chain Platform",
        zh: "众岩联 | 岩板供应链平台",
        es: "ZYL Stone | Fabricante de piedra técnica",
        ar: "ZYL Stone | مُصنّع الأحجار الهندسية",
      },
      description: {
        en: "Guangdong ZYL Sintered Stone Technology Co., Ltd. provides ready-stock slabs, fabrication support and project supply services from Foshan, China.",
        zh: "广东众岩联岩板科技有限公司立足佛山，提供现货岩板、加工配套与工程供应服务。",
        es: "ZYL suministra cuarzo, terrazo, piedra flexible, mármol, porcelánico y soluciones de piedra técnica para proyectos globales.",
        ar: "توفر ZYL الكوارتز والتيرازو والحجر المرن والرخام وألواح البورسلان وحلول الأحجار الهندسية للمشاريع السكنية والتجارية العالمية.",
      },
      imageAlt: {
        en: "ZYL Stone hero",
        zh: "众岩联石材主视觉",
        es: "Imagen principal de ZYL Stone",
        ar: "الصورة الرئيسية لـ ZYL Stone",
      },
    },
    about: {
      title: {
        en: "About ZYL | Sintered Stone Supply Chain & Manufacturing",
        zh: "关于众岩联 | 岩板供应链与制造能力",
        es: "Sobre ZYL Stone | Fabricación e ingeniería",
        ar: "عن ZYL Stone | التصنيع والهندسة",
      },
      description: {
        en: "Learn about ZYL's warehouse strength, production capacity, service team and manufacturing support for slab projects.",
        zh: "了解众岩联的仓储实力、产能布局、服务团队与岩板项目配套能力。",
        es: "Conozca la red de fabricación, experiencia en ingeniería y capacidad de entrega global de ZYL.",
        ar: "تعرف على شبكة التصنيع والخبرة الهندسية وقدرة ZYL على التسليم طويل الأمد في المشاريع العالمية.",
      },
    },
    contact: {
      title: {
        en: "Contact ZYL | Quotations, Stock & Project Support",
        zh: "联系众岩联 | 报价、现货与项目支持",
        es: "Contacto ZYL Stone | Ventas y soporte",
        ar: "اتصل بـ ZYL Stone | المبيعات ودعم المشاريع",
      },
      description: {
        en: "Reach ZYL for project quotation, ready-stock slab inquiry, fabrication support and factory cooperation.",
        zh: "联系众岩联，获取项目报价、现货咨询、加工配套与工厂合作支持。",
        es: "Contacte con ZYL para cotizaciones, consultas de producto, cooperación de fábrica y soporte de ingeniería.",
        ar: "تواصل مع ZYL للحصول على عروض الأسعار واستشارات المنتجات والتعاون الصناعي والدعم الهندسي.",
      },
    },
    solution: {
      title: {
        en: "Stone Solutions | Countertops, Walls & Flooring",
        zh: "石材解决方案 | 台面、墙面与地面",
        es: "Soluciones en piedra | Encimeras, muros y pisos",
        ar: "حلول الحجر | الأسطح والجدران والأرضيات",
      },
      description: {
        en: "Explore ZYL application scenarios for finished products, wall systems, flooring and engineering projects.",
        zh: "查看众岩联在成品、墙面系统、地面系统及工程项目中的应用场景。",
        es: "Explore los escenarios de aplicación de ZYL en productos terminados, muros, pisos y proyectos.",
        ar: "استكشف سيناريوهات تطبيق ZYL في المنتجات النهائية وأنظمة الجدران والأرضيات والمشاريع.",
      },
    },
    cases: {
      title: {
        en: "Project Cases | Sales & Factory Cooperation",
        zh: "合作案例 | 销售与工厂合作",
        es: "Casos de proyecto | Ventas y cooperación de fábrica",
        ar: "دراسات المشاريع | تعاون المبيعات والمصانع",
      },
      description: {
        en: "Explore ZYL cooperation cases for distributors, fabricators and factory partners across global stone projects.",
        zh: "查看众岩联面向经销商、加工厂与工厂伙伴的全球石材项目合作案例。",
        es: "Explore casos de cooperación de ZYL para distribuidores, fabricantes y socios de fábrica en proyectos globales de piedra.",
        ar: "استكشف حالات تعاون ZYL مع الموزعين والمصنعين وشركاء المصانع في مشاريع الحجر العالمية.",
      },
    },
    download: {
      title: {
        en: "Download Center | Catalogs & Technical Files",
        zh: "下载中心 | 图册与技术资料",
        es: "Centro de descargas | Catálogos y fichas técnicas",
        ar: "مركز التنزيل | الكتالوجات والملفات الفنية",
      },
      description: {
        en: "Download ZYL product catalogs, specifications and installation documents for project planning and sourcing.",
        zh: "下载众岩联产品图册、规格参数和安装资料，用于项目规划与采购。",
        es: "Descargue catálogos, especificaciones y documentos de instalación de ZYL para planificación y compras.",
        ar: "قم بتنزيل كتالوجات ZYL والمواصفات والوثائق الفنية للتخطيط والشراء.",
      },
    },
    news: {
      title: {
        en: "News | Product Launches & Company Updates",
        zh: "新闻动态 | 新品发布与企业资讯",
        es: "Noticias | Lanzamientos y novedades",
        ar: "الأخبار | الإطلاقات وتحديثات الشركة",
      },
      description: {
        en: "Track ZYL's latest product launches, exhibition highlights and manufacturing milestones.",
        zh: "跟踪众岩联最新产品发布、展会亮点与制造里程碑。",
        es: "Siga los últimos lanzamientos, exposiciones y hitos de fabricación de ZYL.",
        ar: "تابع أحدث إطلاقات المنتجات وأبرز المعارض ومحطات التصنيع لدى ZYL.",
      },
    },
    products: {
      title: {
        en: "Product Collection | Quartz, Terrazzo, Marble & More",
        zh: "产品系列 | 石英石、水磨石、大理石等",
        es: "Colección de productos | Cuarzo, terrazo, mármol y más",
        ar: "مجموعة المنتجات | كوارتز وتيرازو ورخام وأكثر",
      },
      description: {
        en: "Browse ZYL's material portfolio across quartz, terrazzo, flexible stone, marble, artificial marble, porcelain slab and silica-free surfaces.",
        zh: "查看众岩联石英石、水磨石、柔性石材、大理石、人造大理石、岩板与零硅表面材料组合。",
        es: "Explore el portafolio de ZYL en cuarzo, terrazo, piedra flexible, mármol, mármol artificial, porcelánico y superficies sin sílice.",
        ar: "تصفح مجموعة ZYL من الكوارتز والتيرازو والحجر المرن والرخام والرخام الصناعي وألواح البورسلان والأسطح الخالية من السيليكا.",
      },
    },
    productDetail: {
      title: {
        en: "{title} | ZYL Stone",
        zh: "{title} | 众岩联石材",
        es: "{title} | ZYL Stone",
        ar: "{title} | ZYL Stone",
      },
      description: {
        en: "View specifications and application guidance for {title}, a {category} surface from ZYL Stone.",
        zh: "查看众岩联 {category} 产品 {title} 的规格参数与应用建议。",
        es: "Consulte especificaciones y aplicaciones de {title}, una superficie de {category} de ZYL Stone.",
        ar: "اطلع على مواصفات وتطبيقات {title}، وهي سطح من فئة {category} لدى ZYL Stone.",
      },
    },
  },
} as const;

export function getCommonCopy(locale: AppLocale) {
  return resolveLocale(SITE_COPY.common, locale);
}

export function getHeaderCopy(locale: AppLocale) {
  return resolveLocale(SITE_COPY.header, locale);
}

export function getFloatingSidebarCopy(locale: AppLocale) {
  return resolveLocale(SITE_COPY.floatingSidebar, locale);
}

export function getLandingCopy(locale: AppLocale) {
  return resolveLocale(SITE_COPY.landing, locale);
}

export function getAboutPageCopy(locale: AppLocale) {
  return resolveLocale(SITE_COPY.aboutPage, locale);
}

export function getContactPageCopy(locale: AppLocale) {
  return resolveLocale(SITE_COPY.contactPage, locale);
}

export function getSolutionPageCopy(locale: AppLocale) {
  return resolveLocale(SITE_COPY.solutionPage, locale);
}

export function getCasesPageCopy(locale: AppLocale) {
  return resolveLocale(SITE_COPY.casesPage, locale);
}

export function getDownloadPageCopy(locale: AppLocale) {
  return resolveLocale(SITE_COPY.downloadPage, locale);
}

export function getNewsPageCopy(locale: AppLocale) {
  return resolveLocale(SITE_COPY.newsPage, locale);
}

export function getProductsPageCopy(locale: AppLocale) {
  return resolveLocale(SITE_COPY.productsPage, locale);
}

export function getProductDetailPageCopy(locale: AppLocale) {
  return resolveLocale(SITE_COPY.productDetailPage, locale);
}

export function getMetadataCopy(locale: AppLocale) {
  return resolveLocale(SITE_COPY.metadata, locale);
}
