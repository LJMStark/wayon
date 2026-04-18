import type { AppLocale } from "@/i18n/types";

type LocalizedValue<T> = Record<AppLocale, T>;
type ResolvedCopy<T> = T extends readonly (infer U)[]
  ? ResolvedCopy<U>[]
  : T extends LocalizedValue<infer V>
    ? V
    : T extends object
      ? { [K in keyof T]: ResolvedCopy<T[K]> }
      : T;

const LOCALES = ["en", "zh", "es", "ar", "ru"] as const satisfies readonly AppLocale[];

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
      ru: "Вы находитесь здесь",
    },
    contactUs: {
      en: "Contact Us",
      zh: "联系我们",
      es: "Contáctenos",
      ar: "اتصل بنا",
      ru: "Связаться с нами",
    },
    readMore: {
      en: "Read More",
      zh: "了解更多",
      es: "Leer más",
      ar: "اقرأ المزيد",
      ru: "Подробнее",
    },
    download: {
      en: "Download",
      zh: "下载",
      es: "Descargar",
      ar: "تنزيل",
      ru: "Скачать",
    },
    loading: {
      en: "Loading...",
      zh: "加载中...",
      es: "Cargando...",
      ar: "جارٍ التحميل...",
      ru: "Загрузка...",
    },
    allCases: {
      en: "All Cases",
      zh: "全部案例",
      es: "Todos los casos",
      ar: "جميع الحالات",
      ru: "Все кейсы",
    },
    recentUpdates: {
      en: "Recent Updates",
      zh: "近期更新",
      es: "Actualizaciones recientes",
      ar: "آخر التحديثات",
      ru: "Последние обновления",
    },
    allCollections: {
      en: "All Collections",
      zh: "全部系列",
      es: "Todas las colecciones",
      ar: "كل المجموعات",
      ru: "Все коллекции",
    },
    noProductsFound: {
      en: "No products found for this category.",
      zh: "该分类下暂无产品。",
      es: "No se encontraron productos en esta categoría.",
      ar: "لم يتم العثور على منتجات في هذه الفئة.",
      ru: "В этой категории товары не найдены.",
    },
    requestSample: {
      en: "Request a Sample",
      zh: "申请样品",
      es: "Solicitar una muestra",
      ar: "اطلب عينة",
      ru: "Запросить образец",
    },
    backToNews: {
      en: "Back to News",
      zh: "返回新闻",
      es: "Volver a noticias",
      ar: "العودة إلى الأخبار",
      ru: "Назад к новостям",
    },
    errorTitle: {
      en: "Something went wrong",
      zh: "出错了",
      es: "Algo salió mal",
      ar: "حدث خطأ ما",
      ru: "Что-то пошло не так",
    },
    errorMessage: {
      en: "We couldn't load this page. Please try again in a moment.",
      zh: "页面加载失败，请稍后重试。",
      es: "No pudimos cargar esta página. Inténtelo de nuevo en un momento.",
      ar: "تعذر تحميل هذه الصفحة. حاول مرة أخرى بعد قليل.",
      ru: "Не удалось загрузить эту страницу. Попробуйте снова через мгновение.",
    },
    tryAgain: {
      en: "Try again",
      zh: "重试",
      es: "Reintentar",
      ar: "حاول مرة أخرى",
      ru: "Повторить",
    },
    backToHome: {
      en: "Back to home",
      zh: "返回首页",
      es: "Volver al inicio",
      ar: "العودة إلى الصفحة الرئيسية",
      ru: "На главную",
    },
    notFoundTitle: {
      en: "Page not found",
      zh: "页面未找到",
      es: "Página no encontrada",
      ar: "الصفحة غير موجودة",
      ru: "Страница не найдена",
    },
    notFoundMessage: {
      en: "The page you're looking for doesn't exist or has moved.",
      zh: "您查找的页面不存在或已被移动。",
      es: "La página que busca no existe o se ha movido.",
      ar: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
      ru: "Запрашиваемая страница не существует или была перемещена.",
    },
  },
  header: {
    toggleSearch: {
      en: "Toggle search",
      zh: "切换搜索框",
      es: "Mostrar u ocultar búsqueda",
      ar: "تبديل البحث",
      ru: "Показать или скрыть поиск",
    },
    searchAction: {
      en: "Search",
      zh: "搜索",
      es: "Buscar",
      ar: "بحث",
      ru: "Поиск",
    },
    openNavigation: {
      en: "Open navigation",
      zh: "打开导航菜单",
      es: "Abrir navegación",
      ar: "فتح التنقل",
      ru: "Открыть навигацию",
    },
    closeNavigationOverlay: {
      en: "Close navigation overlay",
      zh: "关闭导航蒙层",
      es: "Cerrar superposición de navegación",
      ar: "إغلاق طبقة التنقل",
      ru: "Закрыть навигационное окно",
    },
    closeNavigation: {
      en: "Close navigation",
      zh: "关闭导航菜单",
      es: "Cerrar navegación",
      ar: "إغلاق التنقل",
      ru: "Закрыть навигацию",
    },
    toggleSection: {
      en: "Toggle {section}",
      zh: "展开或收起 {section}",
      es: "Mostrar u ocultar {section}",
      ar: "تبديل {section}",
      ru: "Развернуть или свернуть {section}",
    },
  },
  floatingSidebar: {
    showQr: {
      en: "Show QR code",
      zh: "显示二维码",
      es: "Mostrar código QR",
      ar: "إظهار رمز QR",
      ru: "Показать QR-код",
    },
    contactUs: {
      en: "Contact us",
      zh: "联系我们",
      es: "Contáctenos",
      ar: "اتصل بنا",
      ru: "Связаться с нами",
    },
    backToTop: {
      en: "Back to top",
      zh: "返回顶部",
      es: "Volver arriba",
      ar: "العودة إلى الأعلى",
      ru: "Наверх",
    },
    qrTitle: {
      en: "WeChat QR Code",
      zh: "微信二维码",
      es: "Código QR de WeChat",
      ar: "رمز WeChat QR",
      ru: "QR-код WeChat",
    },
    qrHint: {
      en: "Scan to connect",
      zh: "扫码立即沟通",
      es: "Escanee para contactar",
      ar: "امسح للتواصل",
      ru: "Сканируйте, чтобы связаться",
    },
  },
  landing: {
    hero: {
      slideLabel: {
        en: "Go to hero slide {index}",
        zh: "切换到第 {index} 张首屏图",
        es: "Ir a la diapositiva principal {index}",
        ar: "الانتقال إلى شريحة الواجهة {index}",
        ru: "Перейти к слайду {index}",
      },
    },
    aboutAlbum: {
      learnMore: {
        en: "Learn More About Us",
        zh: "了解我们的更多信息",
        es: "Conozca más sobre nosotros",
        ar: "اعرف المزيد عنا",
        ru: "Узнать больше о нас",
      },
      previous: {
        en: "Previous album item",
        zh: "上一张相册内容",
        es: "Elemento anterior del álbum",
        ar: "عنصر الألبوم السابق",
        ru: "Предыдущий элемент альбома",
      },
      next: {
        en: "Next album item",
        zh: "下一张相册内容",
        es: "Siguiente elemento del álbum",
        ar: "عنصر الألبوم التالي",
        ru: "Следующий элемент альбома",
      },
    },
    productsCarousel: {
      title: {
        en: "ZYL Product",
        zh: "ZYL 产品系列",
        es: "Productos ZYL",
        ar: "منتجات ZYL",
        ru: "Продукция ZYL",
      },
      description: {
        en: "Explore quartz, terrazzo, flexible stone, marble, porcelain slab and other fabrication-ready materials tailored for global architectural projects.",
        zh: "覆盖石英石、水磨石、柔性石材、大理石、岩板等多类可加工材料，面向全球建筑与室内项目提供稳定供应。",
        es: "Explore cuarzo, terrazo, piedra flexible, mármol, porcelánico y otros materiales listos para fabricación para proyectos arquitectónicos globales.",
        ar: "استكشف الكوارتز والتيرازو والحجر المرن والرخام وألواح البورسلان وغيرها من المواد الجاهزة للتصنيع للمشاريع المعمارية العالمية.",
        ru: "Изучите кварц, терраццо, гибкий камень, мрамор, керамогранит и другие материалы, готовые к изготовлению для международных проектов.",
      },
      detail: {
        en: "View Collection",
        zh: "查看产品系列",
        es: "Ver colección",
        ar: "عرض المجموعة",
        ru: "Смотреть коллекцию",
      },
      previous: {
        en: "Previous products",
        zh: "上一组产品",
        es: "Productos anteriores",
        ar: "المنتجات السابقة",
        ru: "Предыдущие продукты",
      },
      next: {
        en: "Next products",
        zh: "下一组产品",
        es: "Productos siguientes",
        ar: "المنتجات التالية",
        ru: "Следующие продукты",
      },
    },
    solutionTabs: {
      cta: {
        en: "Learn More [{title}]",
        zh: "了解更多 [{title}]",
        es: "Conozca más [{title}]",
        ar: "اعرف المزيد [{title}]",
        ru: "Узнать больше [{title}]",
      },
      previous: {
        en: "Previous solution",
        zh: "上一项方案",
        es: "Solución anterior",
        ar: "الحل السابق",
        ru: "Предыдущее решение",
      },
      next: {
        en: "Next solution",
        zh: "下一项方案",
        es: "Siguiente solución",
        ar: "الحل التالي",
        ru: "Следующее решение",
      },
    },
    partnerCarousel: {
      previous: {
        en: "Previous partner",
        zh: "上一类合作伙伴",
        es: "Socio anterior",
        ar: "الشريك السابق",
        ru: "Предыдущий партнер",
      },
      next: {
        en: "Next partner",
        zh: "下一类合作伙伴",
        es: "Siguiente socio",
        ar: "الشريك التالي",
        ru: "Следующий партнер",
      },
    },
    socialTabs: {
      title: {
        en: "Social Media",
        zh: "社交媒体",
        es: "Redes sociales",
        ar: "وسائل التواصل الاجتماعي",
        ru: "Социальные сети",
      },
      description: {
        en: "Follow our latest project updates, product launches and factory news across every platform.",
        zh: "关注我们的项目动态、产品上新和工厂新闻，第一时间获取最新内容。",
        es: "Siga nuestras actualizaciones de proyectos, lanzamientos y noticias de fábrica en todas las plataformas.",
        ar: "تابع أحدث تحديثات المشاريع وإطلاقات المنتجات وأخبار المصنع عبر جميع المنصات.",
        ru: "Следите за обновлениями проектов, новыми продуктами и новостями производства на всех платформах.",
      },
    },
    newsSection: {
      title: {
        en: "News",
        zh: "新闻动态",
        es: "Noticias",
        ar: "الأخبار",
        ru: "Новости",
      },
    },
    productCard: {
      viewDetails: {
        en: "View Details",
        zh: "查看详情",
        es: "Ver detalles",
        ar: "عرض التفاصيل",
        ru: "Подробнее",
      },
    },
  },
  aboutPage: {
    heroTitle: {
      en: "About ZYL",
      zh: "关于 ZYL",
      es: "Sobre ZYL",
      ar: "عن ZYL",
      ru: "О ZYL",
    },
    breadcrumbCurrent: {
      en: "About Us",
      zh: "关于我们",
      es: "Sobre nosotros",
      ar: "من نحن",
      ru: "О компании",
    },
    introTitle: {
      en: "Guangdong ZYL Sintered Stone Technology Co., Ltd.",
      zh: "广东众岩联岩板科技有限公司",
      es: "ZYL Stone | Calidad en cada paso",
      ar: "ZYL Stone | الجودة في كل خطوة",
      ru: "ZYL Stone | Качество на всём пути",
    },
    introSubtitle: {
      en: "Professional Sintered Stone Supply Chain Platform",
      zh: "专业岩板供应链平台",
      es: "Proveedor profesional de ingeniería en piedra",
      ar: "مورد محترف لحلول هندسة الحجر",
      ru: "Профессиональный поставщик камня для инженерных проектов",
    },
    paragraphs: [
      {
        en: "Founded in 2014 and based in Foshan, Guangdong ZYL Sintered Stone Technology Co., Ltd. is a professional sintered stone supply chain platform integrating R&D, design, sales and service.",
        zh: "广东众岩联岩板科技有限公司成立于 2014 年，坐落于佛山，是一家集研发、设计、销售、服务于一体的专业岩板供应链平台。",
        es: "Fundada en China en 1982, ZYL Stone opera una red integrada de fabricación que cubre cuarzo, terrazo, mármol, mármol artificial, gemas, porcelánico, piedra de cemento y otros materiales decorativos avanzados.",
        ar: "تأسست ZYL Stone في الصين عام 1982 وتدير شبكة تصنيع متكاملة تشمل الكوارتز والتيرازو والرخام والرخام الصناعي والأحجار الكريمة وألواح البورسلان وحجر الأسمنت ومواد زخرفية متقدمة أخرى.",
        ru: "Основанная в Китае в 1982 году, ZYL Stone управляет интегрированной производственной сетью, охватывающей кварц, терраццо, мрамор, искусственный мрамор, полудрагоценный камень, керамогранит, цементный камень и другие современные декоративные материалы.",
      },
      {
        en: "The company operates a 53,000 sqm modern warehouse with more than 2,000,000 sqm of ready-stock slabs, enabling faster response for distributors, project contractors and home customization clients.",
        zh: "公司拥有 53,000㎡ 现代化仓储中心，常备岩板现货超 200 万㎡，能够更快响应渠道分销、工程项目与家居定制需求。",
        es: "Nuestros equipos suministran losas, encimeras, cubiertas de tocador, sistemas murales, pisos y paquetes de ingeniería personalizados para hoteles, desarrollos comerciales y marcas residenciales en más de 80 países y regiones.",
        ar: "تدعم فرقنا الألواح والأسطح وواجهات الحمامات وأنظمة الجدران والأرضيات وحزم الهندسة المخصصة للفنادق والمشاريع التجارية والعلامات السكنية في أكثر من 80 دولة ومنطقة.",
        ru: "Наши команды поставляют плиты, столешницы, поверхности для ванных комнат, настенные системы, напольные решения и индивидуальные инженерные пакеты для отелей, коммерческих объектов и жилых брендов более чем в 80 странах и регионах.",
      },
      {
        en: "Supported by two modern production bases, approximately 160,000,000 sqm of annual capacity and a professional marketing and service team of over 100 members, ZYL provides one-stop support from material selection to delivery.",
        zh: "依托两大现代化生产基地、约 1.6 亿㎡ 年产能以及 100+ 专业营销与服务团队，众岩联可为客户提供从选材到交付的一站式服务。",
        es: "Respaldada por canteras, showrooms, I+D y centros de procesamiento, ZYL ofrece un sistema integral desde la selección de materiales y la optimización del diseño hasta la fabricación y la ejecución del proyecto.",
        ar: "وبدعم من المحاجر وصالات العرض والبحث والتطوير ومراكز المعالجة، تقدم ZYL نظامًا متكاملاً يبدأ من اختيار المواد وتحسين التصميم وصولاً إلى التوجيه التصنيعي وتنفيذ المشروع.",
        ru: "Опираясь на карьеры, шоурумы, R&D и перерабатывающие центры, ZYL обеспечивает полный цикл: от выбора материала и оптимизации дизайна до изготовления и реализации проекта.",
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
          ru: " лет",
        },
        label: {
          en: "Founded",
          zh: "成立时间",
          es: "Trayectoria",
          ar: "سنوات الخبرة",
          ru: "Лет опыта",
        },
      },
      {
        value: "53,000",
        suffix: {
          en: " sqm",
          zh: " ㎡",
          es: " m²",
          ar: " م²",
          ru: " м²",
        },
        label: {
          en: "Warehouse",
          zh: "现代仓储",
          es: "Área de fábrica",
          ar: "مساحة المصنع",
          ru: "Площадь фабрик",
        },
      },
      {
        value: "2,000,000",
        suffix: {
          en: " sqm",
          zh: " ㎡",
          es: " m²",
          ar: " م²",
          ru: " м²",
        },
        label: {
          en: "Ready Stock",
          zh: "常备现货",
          es: "Producción anual",
          ar: "الطاقة السنوية",
          ru: "Годовой выпуск",
        },
      },
      {
        value: "160M",
        suffix: {
          en: " sqm/yr",
          zh: " ㎡/年",
          es: " m²",
          ar: " م²",
          ru: " м²",
        },
        label: {
          en: "Annual Capacity",
          zh: "年产能力",
          es: "Inventario regular",
          ar: "مخزون دائم",
          ru: "Постоянный склад",
        },
      },
    ],
    whyTitle: {
      en: "Core Strengths",
      zh: "核心优势",
      es: "Por qué ZYL",
      ar: "لماذا ZYL",
      ru: "Почему ZYL",
    },
    whyDescription: {
      en: "A 53,000 sqm modern warehouse, more than 2,000,000 sqm of ready stock and a 100+ professional marketing and service team help ZYL respond quickly across quotation, sampling, project coordination and delivery.",
      zh: "53,000㎡ 现代化仓储中心、超 200 万㎡ 常备现货以及 100+ 专业营销与服务团队，使众岩联能够高效响应报价、打样、项目协同与交付需求。",
      es: "Con más de cuatro décadas de experiencia, ZYL combina producción a gran escala, conocimiento de ingeniería y servicio ágil para acelerar el paso del concepto a la instalación.",
      ar: "بخبرة تزيد على أربعة عقود، تجمع ZYL بين الإنتاج واسع النطاق والخبرة الهندسية والخدمة السريعة لمساعدة العملاء على الانتقال من الفكرة إلى التركيب بكفاءة.",
      ru: "Более чем за четыре десятилетия ZYL объединила крупномасштабное производство, инженерную экспертизу и оперативный сервис, чтобы ускорять путь от концепции до монтажа.",
    },
    whyCta: {
      en: "Contact Sales",
      zh: "联系业务团队",
      es: "Conozca la fábrica",
      ar: "تعرف على المصنع",
      ru: "Посмотреть производство",
    },
    philosophyTitle: {
      en: "Philosophy",
      zh: "经营理念",
      es: "Filosofía",
      ar: "الفلسفة",
      ru: "Философия",
    },
    philosophyDescription: {
      en: "Mission: Empower users' better life with efficient sintered stone services. Vision: To become the world's leading branded sintered stone service platform. Core values: Users first, service-oriented, altruism and win-win cooperation.",
      zh: "使命：用快捷岩板服务成就用户美好生活。愿景：成为世界第一的品牌岩板服务平台。价值观：用户第一、服务为本、利他共赢。",
      es: "La integridad, la calidad y la disciplina de entrega a largo plazo guían cada proyecto. Desde la selección de materia prima hasta la inspección final, la consistencia es nuestro estándar.",
      ar: "تشكل النزاهة والجودة والانضباط في التسليم طويل الأمد أساس كل مشروع ننفذه. من اختيار المواد الخام إلى الفحص النهائي، يظل الاتساق معيارنا الثابت.",
      ru: "Честность, качество и дисциплина долгосрочной поставки определяют каждый наш проект. От выбора сырья до финальной инспекции неизменность качества остаётся нашим стандартом.",
    },
    philosophyTabs: {
      en: ["Philosophy", "Mission", "Vision", "Values"],
      zh: ["理念", "使命", "愿景", "价值观"],
      es: ["Filosofía", "Misión", "Visión", "Valores"],
      ar: ["الفلسفة", "الرسالة", "الرؤية", "القيم"],
      ru: ["Философия", "Миссия", "Видение", "Ценности"],
    },
    certificatesTitle: {
      en: "Certificates",
      zh: "资质证书",
      es: "Certificaciones",
      ar: "الشهادات",
      ru: "Сертификаты",
    },
    certificatesDescription: {
      en: "Management certifications, export credentials and test reports are being organized for upload. If you need specific qualification files for a project, please contact our team directly.",
      zh: "管理体系认证、出口资质与检测报告资料正在整理中，页面将根据工厂资质文件同步更新。如需具体项目认证文件，请直接联系业务团队。",
      es: "ZYL ha establecido un sistema de gestión de calidad alineado con los requisitos internacionales, con certificaciones y credenciales de ingeniería para exportación y suministro a gran escala.",
      ar: "أنشأت ZYL نظام إدارة جودة متوافقًا مع متطلبات المشاريع الدولية، مع شهادات واعتمادات هندسية تدعم التصدير والتوريد واسع النطاق.",
      ru: "ZYL выстроила систему управления качеством в соответствии с международными требованиями проектов и обладает сертификатами, поддерживающими экспорт и крупные поставки.",
    },
    certificatesCta: {
      en: "View Certificate",
      zh: "查看证书",
      es: "Ver certificados",
      ar: "عرض الشهادات",
      ru: "Смотреть сертификаты",
    },
    certificatesPlaceholder: {
      en: "Certificate display area",
      zh: "证书展示区域",
      es: "Área de exhibición de certificados",
      ar: "منطقة عرض الشهادات",
      ru: "Зона показа сертификатов",
    },
    teamTitle: {
      en: "Team",
      zh: "团队实力",
      es: "Equipo",
      ar: "الفريق",
      ru: "Команда",
    },
    teamDescription: {
      en: "ZYL is supported by a 100+ professional marketing and service team that helps clients across sampling, quotation, order coordination, fabrication and delivery.",
      zh: "众岩联拥有 100+ 专业营销与服务团队，可围绕选材、报价、下单、加工协同与交付节点提供持续支持。",
      es: "Nuestros equipos de fabricación, diseño y soporte de proyectos trabajan juntos para convertir la intención arquitectónica en soluciones de piedra listas para fabricar e instalar.",
      ar: "يتعاون فريق التصنيع والتصميم ودعم المشاريع لدينا لتحويل الرؤية المعمارية إلى حلول حجرية قابلة للتصنيع والتركيب.",
      ru: "Наши производственные, дизайнерские и проектные команды тесно взаимодействуют, превращая архитектурный замысел в готовые к изготовлению и монтажу каменные решения.",
    },
    teamPlaceholder: {
      en: "Team story area",
      zh: "团队展示区域",
      es: "Área de presentación del equipo",
      ar: "منطقة عرض الفريق",
      ru: "Зона истории команды",
    },
    exhibitionTitle: {
      en: "Exhibition",
      zh: "展会活动",
      es: "Exposiciones",
      ar: "المعارض",
      ru: "Выставки",
    },
    exhibitionDescription: {
      en: "ZYL participates in major trade fairs to connect with global distributors, designers and contractors, showcasing new materials and engineering delivery capabilities.",
      zh: "众岩联持续参加国内外重点展会，与全球经销商、设计师和工程客户保持连接，展示最新材料能力与工程交付实力。",
      es: "ZYL participa en ferias clave para conectar con distribuidores, diseñadores y contratistas globales, mostrando nuevos materiales y capacidades de entrega.",
      ar: "تشارك ZYL في المعارض الرئيسية للتواصل مع الموزعين والمصممين والمقاولين حول العالم وعرض المواد الجديدة وقدرات التنفيذ الهندسي.",
      ru: "ZYL участвует в ключевых отраслевых выставках, чтобы взаимодействовать с мировыми дистрибьюторами, дизайнерами и подрядчиками и показывать новые материалы и инженерные возможности.",
    },
    exhibitionTabs: {
      en: ["Canton Fair", "Xiamen Exhibition", "Other Exhibitions"],
      zh: ["广交会", "厦门石材展", "其他展会"],
      es: ["Feria de Cantón", "Exposición de Xiamen", "Otras ferias"],
      ar: ["معرض كانتون", "معرض شيامن", "معارض أخرى"],
      ru: ["Кантонская ярмарка", "Выставка в Сямыне", "Другие выставки"],
    },
    exhibitionCardCaption: {
      en: "2023 Spring Canton Fair",
      zh: "2023 春季广交会",
      es: "Feria de Cantón Primavera 2023",
      ar: "معرض كانتون ربيع 2023",
      ru: "Весенняя Кантонская ярмарка 2023",
    },
    developmentTitleLead: {
      en: "Company",
      zh: "企业",
      es: "Desarrollo",
      ar: "التطور",
      ru: "Развитие",
    },
    developmentTitleStrong: {
      en: "Highlights",
      zh: "亮点",
      es: "Histórico",
      ar: "المسيرة",
      ru: "История",
    },
    developmentHistory: [
      {
        year: "2014",
        text: {
          en: "Guangdong ZYL Sintered Stone Technology Co., Ltd. was founded in Foshan in 2014 as a professional sintered stone supply chain platform.",
          zh: "广东众岩联岩板科技有限公司于 2014 年在佛山成立，定位为专业岩板供应链平台。",
          es: "ZYL fue seleccionada para promoción oficial en la Feria de Cantón y mantuvo su presencia continua, reforzando el reconocimiento de marca entre compradores globales.",
          ar: "تم اختيار ZYL للترويج الرسمي في معرض كانتون واستمرت في حضورها المتواصل، ما عزز حضور العلامة لدى المشترين العالميين.",
          ru: "ZYL была выбрана для официального продвижения на Кантонской ярмарке и продолжила постоянное участие, усилив узнаваемость бренда среди международных покупателей.",
        },
      },
      {
        year: "53,000㎡",
        text: {
          en: "ZYL operates a 53,000 sqm modern warehouse with more than 2,000,000 sqm of ready-stock slabs for fast project response.",
          zh: "众岩联拥有 53,000㎡ 现代化仓储中心与超 200 万㎡ 常备现货，可快速响应项目需求。",
          es: "La empresa recibió el reconocimiento como proveedor preferido en la industria de decoración de Shenzhen, validando su calidad y capacidad de servicio.",
          ar: "حصلت الشركة على لقب المورد المفضل في قطاع الديكور في شنتشن، ما أكد جودة منتجاتها وقدرتها على خدمة المشاريع.",
          ru: "Компания получила статус предпочтительного поставщика в индустрии отделки Шэньчжэня, что подтвердило качество продукции и сервис для проектов.",
        },
      },
      {
        year: "160M㎡",
        text: {
          en: "Two modern production bases and Italian SACMI and DURST equipment support approximately 160,000,000 sqm of annual capacity.",
          zh: "两大现代化生产基地配合意大利 SACMI 压机与 DURST 数码喷墨设备，可支撑约 1.6 亿㎡ 年产能。",
          es: "ZYL obtuvo varios premios de diseño y servicio de materiales, reflejando un reconocimiento creciente por parte de arquitectos y desarrolladores.",
          ar: "حصلت ZYL على عدة جوائز في التصميم وخدمة المواد، ما يعكس اعترافًا متزايدًا من المعماريين والمطورين والشركاء الهندسيين.",
          ru: "ZYL получила ряд наград в области дизайна и сервисов материалов, что отражает растущее признание со стороны архитекторов, девелоперов и инженерных партнёров.",
        },
      },
    ],
    moreButton: {
      en: "More",
      zh: "查看更多",
      es: "Más",
      ar: "المزيد",
      ru: "Больше",
    },
  },
  contactPage: {
    heroTitle: {
      en: "Contact Us",
      zh: "联系我们",
      es: "Contáctenos",
      ar: "اتصل بنا",
      ru: "Связаться с нами",
    },
    heroSubtitle: {
      en: "Project quotation, ready-stock inquiry, fabrication support and partnership discussion.",
      zh: "项目报价、现货咨询、加工配套与合作洽谈。",
      es: "Cotizaciones de proyecto, consulta de productos y cooperación.",
      ar: "تسعير المشاريع واستشارات المنتجات ومناقشة التعاون.",
      ru: "Расчёт проекта, консультация по продукту и партнёрское взаимодействие.",
    },
    breadcrumbCurrent: {
      en: "Contact Us",
      zh: "联系我们",
      es: "Contáctenos",
      ar: "اتصل بنا",
      ru: "Связаться с нами",
    },
    mapTitle: {
      en: "Foshan office and showroom map",
      zh: "佛山展厅与办公中心地图",
      es: "Foshan office and showroom map",
      ar: "Foshan office and showroom map",
      ru: "Foshan office and showroom map",
    },
    mapSubtitle: {
      en: "Office, showroom and factory contact information",
      zh: "展厅、办公与工厂联络信息",
      es: "Office, showroom and factory contact information",
      ar: "Office, showroom and factory contact information",
      ru: "Office, showroom and factory contact information",
    },
    mapEmbedUrl:
      "https://www.google.com/maps?q=No.%207-8,%2010,%2011-2,%2012,%20Block%203,%20Taobo%203rd%20Road,%20Huaxia%20Ceramic%20Expo%20City,%20Nanzhuang%20Town,%20Chancheng%20District,%20Foshan,%20Guangdong,%20China&output=embed",
    locations: [
      {
        name: {
          en: "Foshan Office & Showroom",
          zh: "佛山展厅与办公中心",
          es: "Foshan Office & Showroom",
          ar: "Foshan Office & Showroom",
          ru: "Foshan Office & Showroom",
        },
        address: {
          en: "No. 7-8, 10, 11-2, 12, Block 3, Taobo 3rd Road, Huaxia Ceramic Expo City, Nanzhuang Town, Chancheng District, Foshan, Guangdong, China",
          zh: "佛山市禅城区南庄镇华夏陶瓷博览城陶博三路3座7-8号，10号，11号之二，12号",
          es: "No. 7-8, 10, 11-2, 12, Block 3, Taobo 3rd Road, Huaxia Ceramic Expo City, Nanzhuang Town, Chancheng District, Foshan, Guangdong, China",
          ar: "No. 7-8, 10, 11-2, 12, Block 3, Taobo 3rd Road, Huaxia Ceramic Expo City, Nanzhuang Town, Chancheng District, Foshan, Guangdong, China",
          ru: "No. 7-8, 10, 11-2, 12, Block 3, Taobo 3rd Road, Huaxia Ceramic Expo City, Nanzhuang Town, Chancheng District, Foshan, Guangdong, China",
        },
        tel: "+86 132 2924 6894",
        email: "zyl.stone.slab@gmail.com",
        businessHours: "Mon-Sat 8:30-17:30",
      },
      {
        name: {
          en: "Zhaoqing Production Base",
          zh: "肇庆生产基地",
          es: "Zhaoqing Production Base",
          ar: "Zhaoqing Production Base",
          ru: "Zhaoqing Production Base",
        },
        address: {
          en: "Songlong Industrial Park, Baitu Town, Gaoyao District, Zhaoqing, Guangdong, China",
          zh: "广东省肇庆市高要区白土镇宋隆工业园",
          es: "Songlong Industrial Park, Baitu Town, Gaoyao District, Zhaoqing, Guangdong, China",
          ar: "Songlong Industrial Park, Baitu Town, Gaoyao District, Zhaoqing, Guangdong, China",
          ru: "Songlong Industrial Park, Baitu Town, Gaoyao District, Zhaoqing, Guangdong, China",
        },
        tel: "+86 132 2924 6894",
        email: "zyl.stone.slab@gmail.com",
        businessHours: "Mon-Sat 8:30-17:30",
      },
    ],
    labels: {
      address: {
        en: "Address",
        zh: "地址",
        es: "Dirección",
        ar: "العنوان",
        ru: "Адрес",
      },
      tel: {
        en: "Tel",
        zh: "电话",
        es: "Tel",
        ar: "الهاتف",
        ru: "Телефон",
      },
      email: {
        en: "Email",
        zh: "邮箱",
        es: "Email",
        ar: "Email",
        ru: "Email",
      },
      businessHours: {
        en: "Business Hours",
        zh: "服务时间",
        es: "Business Hours",
        ar: "Business Hours",
        ru: "Business Hours",
      },
      fax: {
        en: "Fax",
        zh: "传真",
        es: "Fax",
        ar: "فاكس",
        ru: "Факс",
      },
      postalCode: {
        en: "Post Code",
        zh: "邮编",
        es: "Código postal",
        ar: "الرمز البريدي",
        ru: "Почтовый индекс",
      },
    },
    socialLinks: [
      {
        label: "WhatsApp",
        href: "https://wa.me/8613229246894",
      },
      {
        label: "Instagram",
        href: "https://www.instagram.com/zyl.stone.slab/",
      },
      {
        label: "YouTube",
        href: "https://www.youtube.com/@ZYLStoneSlabEngineering",
      },
      {
        label: "Pinterest",
        href: "https://www.pinterest.com/ZYLstoneslabengineering/",
      },
    ],
    formTitle: {
      en: "Leave us a message",
      zh: "给我们留言",
      es: "Déjenos un mensaje",
      ar: "اترك لنا رسالة",
      ru: "Оставьте сообщение",
    },
    fields: {
      name: {
        label: {
          en: "Your Name",
          zh: "您的姓名",
          es: "Su nombre",
          ar: "اسمك",
          ru: "Ваше имя",
        },
        placeholder: {
          en: "Enter your name *",
          zh: "请输入您的姓名 *",
          es: "Ingrese su nombre *",
          ar: "أدخل اسمك *",
          ru: "Введите ваше имя *",
        },
      },
      role: {
        label: {
          en: "You are",
          zh: "您的身份",
          es: "Usted es",
          ar: "أنت",
          ru: "Ваш профиль",
        },
        placeholder: {
          en: "Select your role *",
          zh: "请选择您的身份 *",
          es: "Seleccione su rol *",
          ar: "اختر دورك *",
          ru: "Выберите вашу роль *",
        },
        options: {
          en: ["Builder", "Designer", "Homeowner"],
          zh: ["工程承包商", "设计师", "业主"],
          es: ["Constructor", "Diseñador", "Propietario"],
          ar: ["مقاول", "مصمم", "مالك منزل"],
          ru: ["Подрядчик", "Дизайнер", "Собственник"],
        },
      },
      email: {
        label: {
          en: "E-mail",
          zh: "电子邮箱",
          es: "Correo electrónico",
          ar: "البريد الإلكتروني",
          ru: "Электронная почта",
        },
        placeholder: {
          en: "Enter your e-mail *",
          zh: "请输入您的邮箱 *",
          es: "Ingrese su correo *",
          ar: "أدخل بريدك الإلكتروني *",
          ru: "Введите ваш e-mail *",
        },
      },
      company: {
        label: {
          en: "Company",
          zh: "公司名称",
          es: "Empresa",
          ar: "الشركة",
          ru: "Компания",
        },
        placeholder: {
          en: "Enter your company *",
          zh: "请输入公司名称 *",
          es: "Ingrese su empresa *",
          ar: "أدخل اسم الشركة *",
          ru: "Введите название компании *",
        },
      },
      contact: {
        label: {
          en: "Website / WhatsApp / Phone / WeChat",
          zh: "网站 / WhatsApp / 电话 / 微信",
          es: "Sitio web / WhatsApp / Teléfono / WeChat",
          ar: "الموقع / واتساب / الهاتف / ويتشات",
          ru: "Сайт / WhatsApp / Телефон / WeChat",
        },
        placeholder: {
          en: "Enter your contact details",
          zh: "请输入您的联系方式",
          es: "Ingrese su contacto",
          ar: "أدخل بيانات التواصل",
          ru: "Введите ваши контакты",
        },
      },
      country: {
        label: {
          en: "Country / Region",
          zh: "国家 / 地区",
          es: "País / Región",
          ar: "الدولة / المنطقة",
          ru: "Страна / Регион",
        },
        placeholder: {
          en: "Enter your country / region",
          zh: "请输入国家或地区",
          es: "Ingrese su país / región",
          ar: "أدخل دولتك / منطقتك",
          ru: "Введите страну / регион",
        },
      },
      message: {
        label: {
          en: "Your message",
          zh: "您的需求",
          es: "Su mensaje",
          ar: "رسالتك",
          ru: "Ваше сообщение",
        },
        placeholder: {
          en: "Enter your message",
          zh: "请输入您的留言内容",
          es: "Ingrese su mensaje",
          ar: "أدخل رسالتك",
          ru: "Введите ваше сообщение",
        },
      },
    },
    submit: {
      en: "Send Inquiry",
      zh: "提交咨询",
      es: "Enviar consulta",
      ar: "إرسال الاستفسار",
      ru: "Отправить запрос",
    },
    submitting: {
      en: "Submitting...",
      zh: "提交中...",
      es: "Enviando...",
      ar: "جاري الإرسال...",
      ru: "Отправка...",
    },
    successMessage: {
      en: "Inquiry submitted successfully! We will get back to you soon.",
      zh: "咨询提交成功！我们将尽快与您联系。",
      es: "¡Consulta enviada exitosamente! Nos pondremos en contacto con usted pronto.",
      ar: "تم إرسال الاستفسار بنجاح! سنرد عليك قريبًا.",
      ru: "Запрос успешно отправлен! Мы свяжемся с вами в ближайшее время.",
    },
    errorMessage: {
      en: "Failed to submit inquiry. Please try again.",
      zh: "提交咨询失败，请重试。",
      es: "No se pudo enviar la consulta. Inténtelo de nuevo.",
      ar: "فشل إرسال الاستفسار. يرجى المحاولة مرة أخرى.",
      ru: "Не удалось отправить запрос. Пожалуйста, попробуйте еще раз.",
    },
    sampleTitleLine1: {
      en: "Contact us",
      zh: "联系众岩联",
      es: "Contáctenos",
      ar: "تواصل معنا",
      ru: "Свяжитесь с нами",
    },
    sampleTitleLine2: {
      en: "Get free sample!",
      zh: "获取免费样品",
      es: "¡Obtenga muestras gratis!",
      ar: "احصل على عينة مجانية!",
      ru: "Получите бесплатный образец!",
    },
    samplePlaceholder: {
      en: "Sample book mockup graphic",
      zh: "样册展示效果图",
      es: "Gráfico de muestra del catálogo",
      ar: "تصور بصري لكتاب العينات",
      ru: "Макет книги образцов",
    },
  },
  solutionPage: {
    heroTitle: {
      en: "Master of Stone",
      zh: "石材场景大师",
      es: "Maestría en piedra",
      ar: "إتقان الحجر",
      ru: "Мастерство камня",
    },
    heroSubtitle: {
      en: "Countertops, wall systems, flooring and finished products tailored for residential and commercial projects.",
      zh: "面向住宅与商业项目的台面、墙面系统、地面系统与成品交付方案。",
      es: "Encimeras, sistemas murales, pisos y productos terminados para proyectos residenciales y comerciales.",
      ar: "أسطح عمل وأنظمة جدران وأرضيات ومنتجات نهائية مخصصة للمشاريع السكنية والتجارية.",
      ru: "Столешницы, настенные системы, полы и готовые изделия для жилых и коммерческих проектов.",
    },
    galleryAlt: {
      en: "Engineering case {index}",
      zh: "工程案例 {index}",
      es: "Caso de ingeniería {index}",
      ar: "حالة هندسية {index}",
      ru: "Инженерный кейс {index}",
    },
  },
  downloadPage: {
    heroTitle: {
      en: "Download",
      zh: "下载中心",
      es: "Descargas",
      ar: "مركز التنزيل",
      ru: "Загрузки",
    },
    heroDescription: {
      en: "Access product catalogs, technical specifications and installation references prepared for distributors, designers and project teams.",
      zh: "获取面向经销商、设计师与项目团队准备的产品图册、技术参数与安装参考资料。",
      es: "Acceda a catálogos, especificaciones técnicas y guías de instalación preparadas para distribuidores, diseñadores y equipos de proyecto.",
      ar: "احصل على كتالوجات المنتجات والمواصفات الفنية ومواد التركيب المخصصة للموزعين والمصممين وفرق المشاريع.",
      ru: "Получайте продуктовые каталоги, технические спецификации и монтажные материалы для дистрибьюторов, дизайнеров и проектных команд.",
    },
    requestCatalog: {
      en: "Request file",
      zh: "索取资料",
      es: "Solicitar archivo",
      ar: "اطلب الملف",
      ru: "Запросить файл",
    },
    catalogs: [
      {
        title: {
          en: "Quartz Stone Catalog",
          zh: "石英石产品图册",
          es: "Catálogo de piedra de cuarzo",
          ar: "كتالوج حجر الكوارتز",
          ru: "Каталог кварцевого камня",
        },
        description: {
          en: "Full quartz collection covering Natural, Pure, Crystal, Multi-Color and Platinum ranges.",
          zh: "覆盖自然、纯色、水晶、多色和铂金系列的完整石英石资料。",
          es: "Colección completa de cuarzo con líneas Natural, Pure, Crystal, Multi-Color y Platinum.",
          ar: "مجموعة كاملة من الكوارتز تشمل سلاسل Natural وPure وCrystal وMulti-Color وPlatinum.",
          ru: "Полная коллекция кварца: Natural, Pure, Crystal, Multi-Color и Platinum.",
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
          ru: "Коллекция терраццо",
        },
        description: {
          en: "Color ranges, slab specifications and application recommendations for terrazzo projects.",
          zh: "水磨石色系、板材规格与应用建议汇总。",
          es: "Gamas de color, especificaciones y recomendaciones de uso para proyectos de terrazo.",
          ar: "ألوان ومقاسات وتوصيات تطبيق لمشاريع التيرازو.",
          ru: "Цветовые серии, форматы плит и рекомендации по применению терраццо.",
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
          ru: "Руководство по гибкому камню",
        },
        description: {
          en: "Series overview, installation method and technical notes for flexible stone solutions.",
          zh: "柔性石材系列、安装方式与技术说明。",
          es: "Resumen de series, método de instalación y notas técnicas para piedra flexible.",
          ar: "نظرة عامة على السلاسل وطريقة التركيب والملاحظات الفنية للحجر المرن.",
          ru: "Обзор серий, монтаж и технические примечания по гибкому камню.",
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
          ru: "Коллекция мрамора",
        },
        description: {
          en: "Marble color families, finishes and reference applications for hospitality and luxury spaces.",
          zh: "大理石色系、表面工艺与酒店及高端空间参考案例。",
          es: "Familias de color, acabados y referencias para hoteles y espacios de lujo.",
          ar: "عائلات الألوان والتشطيبات والتطبيقات المرجعية لمساحات الضيافة والفخامة.",
          ru: "Цветовые семейства, отделки и примеры применения мрамора в гостиничных и премиальных пространствах.",
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
          ru: "Каталог полудрагоценного камня",
        },
        description: {
          en: "Luxury translucent surfaces, agate series and custom decorative applications.",
          zh: "透光奢石、玛瑙系列与定制装饰应用展示。",
          es: "Superficies translúcidas de lujo, serie ágata y aplicaciones decorativas personalizadas.",
          ar: "أسطح فاخرة شبه شفافة وسلسلة العقيق وتطبيقات ديكورية مخصصة.",
          ru: "Роскошные светопроницаемые поверхности, агатовые серии и декоративные индивидуальные применения.",
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
          ru: "Руководство по цементному камню",
        },
        description: {
          en: "Industrial-style cement stone ranges designed for contemporary architecture and interiors.",
          zh: "面向现代建筑与室内项目的工业风水泥石资料。",
          es: "Líneas de piedra de cemento de estética industrial para arquitectura contemporánea.",
          ar: "سلاسل حجر الأسمنت بطابع صناعي للمشاريع المعمارية الحديثة.",
          ru: "Линейки цементного камня в индустриальном стиле для современной архитектуры и интерьеров.",
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
          ru: "Каталог искусственного мрамора",
        },
        description: {
          en: "Cost-efficient marble alternatives with multiple color families and fabrication notes.",
          zh: "多色系人造大理石资料及加工说明。",
          es: "Alternativas rentables al mármol con múltiples familias de color y notas de fabricación.",
          ar: "بدائل اقتصادية للرخام مع عدة عائلات لونية وملاحظات تصنيع.",
          ru: "Экономичные альтернативы мрамору с различными цветовыми сериями и рекомендациями по изготовлению.",
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
          ru: "Коллекция керамогранита",
        },
        description: {
          en: "Texture systems, thickness options and engineering references for porcelain slabs.",
          zh: "岩板纹理体系、厚度方案及工程应用参考。",
          es: "Sistemas de textura, espesores y referencias técnicas de porcelánico.",
          ar: "أنظمة الملمس وخيارات السماكة والمراجع الهندسية لألواح البورسلان.",
          ru: "Текстурные системы, варианты толщины и инженерные применения керамогранита.",
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
          ru: "Брошюра по камню без кремнезёма",
        },
        description: {
          en: "Safety-focused surface system with certification highlights and comparison data.",
          zh: "聚焦安全属性的零硅石材资料，含认证亮点与对比数据。",
          es: "Sistema seguro de superficies con certificaciones y datos comparativos.",
          ar: "نظام أسطح يركز على السلامة مع الشهادات وبيانات المقارنة.",
          ru: "Безопасная система поверхностей с сертификациями и сравнительными данными.",
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
      ru: "Нужна индивидуальная документация?",
    },
    ctaDescription: {
      en: "Contact our team for project-specific specifications, custom brochures and technical support documents.",
      zh: "如需项目专属规格书、定制画册或技术支持文件，欢迎联系我们。",
      es: "Contacte con nuestro equipo para fichas técnicas, catálogos a medida y soporte documental.",
      ar: "تواصل مع فريقنا للحصول على مواصفات خاصة بالمشروع وكتيبات مخصصة ووثائق دعم فني.",
      ru: "Свяжитесь с нашей командой, если вам нужны спецификации под проект, индивидуальные брошюры и технические документы.",
    },
  },
  newsPage: {
    eyebrow: {
      en: "Press Room",
      zh: "新闻中心",
      es: "Sala de prensa",
      ar: "المركز الإعلامي",
      ru: "Пресс-центр",
    },
    heroTitle: {
      en: "Company News & Updates",
      zh: "企业新闻与动态",
      es: "Noticias y actualizaciones de la empresa",
      ar: "أخبار الشركة وتحديثاتها",
      ru: "Новости и обновления компании",
    },
    heroDescription: {
      en: "Stay current on product launches, project milestones and exhibition highlights from ZYL Stone.",
      zh: "了解众岩联最新的产品发布、项目里程碑与展会动态。",
      es: "Manténgase al día con lanzamientos, hitos de proyecto y exhibiciones de ZYL Stone.",
      ar: "ابق على اطلاع على إطلاقات المنتجات ومحطات المشاريع وأبرز المعارض لدى ZYL Stone.",
      ru: "Следите за новыми продуктами, этапами проектов и выставочными событиями ZYL Stone.",
    },
    readLabel: {
      en: "Read",
      zh: "查看",
      es: "Leer",
      ar: "قراءة",
      ru: "Читать",
    },
    items: [
      {
        date: "2023-11-15",
        category: {
          en: "Company Update",
          zh: "企业动态",
          es: "Actualización corporativa",
          ar: "تحديث الشركة",
          ru: "Новости компании",
        },
        title: {
          en: "ZYL showcases zero-silica quartz at Verona Marmomac",
          zh: "众岩联在维罗纳 Marmomac 展出零硅石英石方案",
          es: "ZYL presenta cuarzo sin sílice en Verona Marmomac",
          ar: "ZYL تعرض كوارتزًا خاليًا من السيليكا في Marmomac فيرونا",
          ru: "ZYL представила кварц без кремнезёма на Verona Marmomac",
        },
        excerpt: {
          en: "Our silica-free engineered stone series received strong attention from architects seeking safer and more sustainable interior surfaces.",
          zh: "面向更安全、更可持续室内饰面的零硅人造石系列，受到建筑师群体的高度关注。",
          es: "Nuestra serie de piedra sin sílice recibió gran interés de arquitectos que buscan superficies interiores más seguras y sostenibles.",
          ar: "حصلت سلسلة الحجر الهندسي الخالي من السيليكا على اهتمام قوي من المعماريين الباحثين عن أسطح داخلية أكثر أمانًا واستدامة.",
          ru: "Наша серия искусственного камня без кремнезёма привлекла внимание архитекторов, ищущих более безопасные и устойчивые интерьерные поверхности.",
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
          ru: "Новый продукт",
        },
        title: {
          en: "Introducing the new luxury terrazzo collection",
          zh: "全新高端水磨石系列正式发布",
          es: "Presentamos la nueva colección de terrazo de lujo",
          ar: "إطلاق مجموعة التيرازو الفاخرة الجديدة",
          ru: "Представляем новую премиальную коллекцию терраццо",
        },
        excerpt: {
          en: "The new terrazzo line combines contemporary binders with classic aggregate expression for high-traffic commercial projects.",
          zh: "新系列将现代胶结体系与经典骨料表达结合，面向高人流商业空间提供更稳定的落地选择。",
          es: "La nueva línea combina aglomerantes contemporáneos con la expresión clásica del agregado para proyectos comerciales de alto tránsito.",
          ar: "يجمع الخط الجديد بين الروابط الحديثة والتعبير الكلاسيكي للركام لمشاريع تجارية عالية الحركة.",
          ru: "Новая линейка сочетает современные связующие и классическую фактуру заполнителя для коммерческих пространств с высокой нагрузкой.",
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
          ru: "Веха",
        },
        title: {
          en: "Guangdong factory reaches new annual output milestone",
          zh: "广东工厂年产能力再上新台阶",
          es: "La fábrica de Guangdong alcanza un nuevo hito de producción",
          ar: "مصنع قوانغدونغ يصل إلى مستوى جديد في الطاقة الإنتاجية",
          ru: "Фабрика в Гуандуне достигла нового производственного рубежа",
        },
        excerpt: {
          en: "Ongoing automation upgrades continue to improve throughput, consistency and delivery reliability across major product lines.",
          zh: "持续推进的自动化升级进一步提升了主要品类的产能、稳定性与交付可靠性。",
          es: "Las mejoras continuas de automatización siguen elevando la capacidad, la consistencia y la fiabilidad de entrega.",
          ar: "تواصل ترقيات الأتمتة تحسين الإنتاجية والثبات وموثوقية التسليم عبر خطوط الإنتاج الرئيسية.",
          ru: "Постоянные обновления автоматизации повышают производительность, стабильность и надёжность поставок по ключевым продуктовым линиям.",
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
          ru: "Награда в дизайне",
        },
        title: {
          en: "Flexible stone receives architectural design recognition",
          zh: "柔性石材方案获得建筑设计认可",
          es: "La piedra flexible recibe reconocimiento en diseño arquitectónico",
          ar: "الحجر المرن ينال تقديرًا في التصميم المعماري",
          ru: "Гибкий камень получил признание в архитектурном дизайне",
        },
        excerpt: {
          en: "Its realistic texture and bendable substrate continue to open new opportunities for curved wall and custom façade applications.",
          zh: "凭借逼真的石材质感与可弯折基层，柔性石材正在为曲面墙体和定制立面创造更多可能。",
          es: "Su textura realista y soporte flexible abren nuevas posibilidades para muros curvos y fachadas personalizadas.",
          ar: "تفتح خامته الواقعية وطبقته القابلة للانحناء فرصًا جديدة للجدران المنحنية والواجهات المخصصة.",
          ru: "Реалистичная текстура и гибкая основа открывают новые возможности для изогнутых стен и индивидуальных фасадов.",
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
      ru: "Коллекция продуктов",
    },
    heroSubtitle: {
      en: "Browse ZYL's core material systems for countertops, cladding, flooring and custom fabrication.",
      zh: "查看众岩联面向台面、墙面、地面与定制加工的核心材料体系。",
      es: "Explore los sistemas de materiales de ZYL para encimeras, revestimientos, pisos y fabricación personalizada.",
      ar: "استعرض أنظمة المواد الأساسية من ZYL لأسطح العمل والكسوة والأرضيات والتصنيع المخصص.",
      ru: "Изучите ключевые материалы ZYL для столешниц, облицовки, напольных решений и индивидуального изготовления.",
    },
    collectionLabel: {
      en: "Collection Overview",
      zh: "系列总览",
      es: "Resumen de colecciones",
      ar: "نظرة عامة على المجموعات",
      ru: "Обзор коллекций",
    },
    directoryTitle: {
      en: "Trade Materials Directory",
      zh: "外贸产品目录",
      es: "Directorio de materiales",
      ar: "دليل مواد التصدير",
      ru: "Каталог экспортных материалов",
    },
    directoryDescription: {
      en: "Browse product families and filter by size, process, series type and color. Open a family to switch between available variants and media sets.",
      zh: "按规格、工艺、系列类型和颜色筛选产品家族，进入详情后可切换不同变体与现有素材。",
      es: "Filtre las familias de producto por tamaño, proceso, serie y color. En la ficha podrá cambiar entre variantes y recursos disponibles.",
      ar: "استعرض عائلات المنتجات حسب المقاس والتشطيب والنوع واللون، ثم بدّل بين المتغيرات والوسائط المتاحة داخل الصفحة.",
      ru: "Фильтруйте семейства продуктов по размеру, процессу, типу серии и цвету, а в карточке переключайтесь между вариантами и доступными материалами.",
    },
    allFilter: {
      en: "All",
      zh: "全部",
      es: "Todos",
      ar: "الكل",
      ru: "Все",
    },
    sizeFilterLabel: {
      en: "Size",
      zh: "规格",
      es: "Tamaño",
      ar: "المقاس",
      ru: "Размер",
    },
    processFilterLabel: {
      en: "Process",
      zh: "工艺",
      es: "Proceso",
      ar: "التشطيب",
      ru: "Процесс",
    },
    seriesTypeFilterLabel: {
      en: "Series Type",
      zh: "系列类型",
      es: "Tipo de serie",
      ar: "نوع السلسلة",
      ru: "Тип серии",
    },
    colorGroupFilterLabel: {
      en: "Color",
      zh: "颜色",
      es: "Color",
      ar: "اللون",
      ru: "Цвет",
    },
  },
  productDetailPage: {
    overviewTitle: {
      en: "Material Overview",
      zh: "材料概览",
      es: "Resumen del material",
      ar: "نظرة عامة على المادة",
      ru: "Обзор материала",
    },
    description1: {
      en: "Discover the durability and refined surface quality of {title} from the {category} category, designed for premium residential and commercial applications.",
      zh: "了解 {category} 系列中的 {title}，它兼具耐用性能与精致表面表现，可用于高端住宅与商业项目。",
      es: "Descubra la durabilidad y la calidad superficial de {title} de la categoría {category}, diseñada para aplicaciones residenciales y comerciales de alto nivel.",
      ar: "اكتشف متانة وجودة سطح {title} من فئة {category}، المصمم للتطبيقات السكنية والتجارية الراقية.",
      ru: "Откройте для себя долговечность и выразительную фактуру {title} из категории {category}, разработанного для жилых и коммерческих проектов высокого уровня.",
    },
    description2: {
      en: "This surface is suitable for countertops, wall cladding, hospitality fit-outs and custom fabrication programs that require reliable performance and visual consistency.",
      zh: "该材料适用于厨房台面、墙面包覆、酒店配套与定制加工等对性能稳定性和视觉一致性要求较高的场景。",
      es: "La superficie es adecuada para encimeras, revestimientos, hoteles y programas de fabricación personalizada que exigen rendimiento y consistencia visual.",
      ar: "هذه المادة مناسبة لأسطح العمل وكسوة الجدران وتجهيزات الضيافة وبرامج التصنيع المخصص التي تتطلب أداءً موثوقًا واتساقًا بصريًا.",
      ru: "Материал подходит для столешниц, облицовки стен, гостиничных объектов и программ индивидуального изготовления, где важны стабильные характеристики и визуальная целостность.",
    },
    thicknessLabel: {
      en: "Thickness",
      zh: "厚度",
      es: "Espesor",
      ar: "السماكة",
      ru: "Толщина",
    },
    thicknessValue: {
      en: "12mm / 20mm",
      zh: "12mm / 20mm",
      es: "12 mm / 20 mm",
      ar: "12 مم / 20 مم",
      ru: "12 мм / 20 мм",
    },
    finishLabel: {
      en: "Finish",
      zh: "表面工艺",
      es: "Acabado",
      ar: "التشطيب",
      ru: "Отделка",
    },
    finishValue: {
      en: "Polished / Matte",
      zh: "亮光 / 哑光",
      es: "Pulido / Mate",
      ar: "لامع / مطفي",
      ru: "Полировка / Матовый",
    },
    categoryFallback: {
      en: "Stone Surface",
      zh: "岩板产品",
      es: "Superficie mineral",
      ar: "سطح حجري",
      ru: "Каменная поверхность",
    },
    variantSelectorLabel: {
      en: "Variant",
      zh: "规格 / 工艺 / 编号",
      es: "Variante",
      ar: "المتغير",
      ru: "Вариант",
    },
    productCodeLabel: {
      en: "Code",
      zh: "编号",
      es: "Código",
      ar: "الكود",
      ru: "Код",
    },
    colorGroupLabel: {
      en: "Color",
      zh: "颜色",
      es: "Color",
      ar: "اللون",
      ru: "Цвет",
    },
    sizeLabel: {
      en: "Size",
      zh: "规格",
      es: "Tamaño",
      ar: "المقاس",
      ru: "Размер",
    },
    processLabel: {
      en: "Process",
      zh: "工艺",
      es: "Proceso",
      ar: "التشطيب",
      ru: "Процесс",
    },
    faceCountLabel: {
      en: "Face Count",
      zh: "面数",
      es: "Numero de caras",
      ar: "عدد الوجوه",
      ru: "Количество лиц",
    },
    facePatternNoteLabel: {
      en: "Pattern Note",
      zh: "连纹说明",
      es: "Nota de patrón",
      ar: "ملاحظة النمط",
      ru: "Примечание по рисунку",
    },
    elementImagesTitle: {
      en: "Element Images",
      zh: "元素图",
      es: "Imágenes de elemento",
      ar: "صور العناصر",
      ru: "Элементные изображения",
    },
    spaceImagesTitle: {
      en: "Space Images",
      zh: "空间图",
      es: "Imágenes de espacio",
      ar: "صور المساحة",
      ru: "Интерьерные изображения",
    },
    realImagesTitle: {
      en: "Real Photos",
      zh: "实拍图",
      es: "Fotos reales",
      ar: "صور واقعية",
      ru: "Фото образцов",
    },
    videosTitle: {
      en: "Videos",
      zh: "展示视频",
      es: "Videos",
      ar: "الفيديوهات",
      ru: "Видео",
    },
    videoFallback: {
      en: "Your browser does not support this video format.",
      zh: "当前浏览器不支持该视频格式，可直接下载查看。",
      es: "Su navegador no es compatible con este formato de video.",
      ar: "متصفحك لا يدعم هذا النوع من الفيديو.",
      ru: "Ваш браузер не поддерживает этот формат видео.",
    },
  },
  metadata: {
    root: {
      title: {
        en: "ZYL | Sintered Stone Supply Chain Platform",
        zh: "众岩联 | 岩板供应链平台",
        es: "ZYL Stone | Fabricante de piedra técnica",
        ar: "ZYL Stone | مُصنّع الأحجار الهندسية",
        ru: "ZYL Stone | Производитель инженерного камня",
      },
      description: {
        en: "Guangdong ZYL Sintered Stone Technology Co., Ltd. provides ready-stock slabs, fabrication support and project supply services from Foshan, China.",
        zh: "广东众岩联岩板科技有限公司立足佛山，提供现货岩板、加工配套与工程供应服务。",
        es: "ZYL suministra cuarzo, terrazo, piedra flexible, mármol, porcelánico y soluciones de piedra técnica para proyectos globales.",
        ar: "توفر ZYL الكوارتز والتيرازو والحجر المرن والرخام وألواح البورسلان وحلول الأحجار الهندسية للمشاريع السكنية والتجارية العالمية.",
        ru: "ZYL поставляет кварц, терраццо, гибкий камень, мрамор, керамогранит и другие инженерные материалы для международных проектов.",
      },
      imageAlt: {
        en: "ZYL Stone hero",
        zh: "众岩联石材主视觉",
        es: "Imagen principal de ZYL Stone",
        ar: "الصورة الرئيسية لـ ZYL Stone",
        ru: "Главный визуал ZYL Stone",
      },
    },
    about: {
      title: {
        en: "About ZYL | Sintered Stone Supply Chain & Manufacturing",
        zh: "关于众岩联 | 岩板供应链与制造能力",
        es: "Sobre ZYL Stone | Fabricación e ingeniería",
        ar: "عن ZYL Stone | التصنيع والهندسة",
        ru: "О ZYL Stone | Производство и инжиниринг",
      },
      description: {
        en: "Learn about ZYL's warehouse strength, production capacity, service team and manufacturing support for slab projects.",
        zh: "了解众岩联的仓储实力、产能布局、服务团队与岩板项目配套能力。",
        es: "Conozca la red de fabricación, experiencia en ingeniería y capacidad de entrega global de ZYL.",
        ar: "تعرف على شبكة التصنيع والخبرة الهندسية وقدرة ZYL على التسليم طويل الأمد في المشاريع العالمية.",
        ru: "Узнайте о производственной сети, инженерном опыте и возможностях долгосрочных поставок ZYL на международных проектах.",
      },
    },
    contact: {
      title: {
        en: "Contact ZYL | Quotations, Stock & Project Support",
        zh: "联系众岩联 | 报价、现货与项目支持",
        es: "Contacto ZYL Stone | Ventas y soporte",
        ar: "اتصل بـ ZYL Stone | المبيعات ودعم المشاريع",
        ru: "Связаться с ZYL Stone | Продажи и проектная поддержка",
      },
      description: {
        en: "Reach ZYL for project quotation, ready-stock slab inquiry, fabrication support and factory cooperation.",
        zh: "联系众岩联，获取项目报价、现货咨询、加工配套与工厂合作支持。",
        es: "Contacte con ZYL para cotizaciones, consultas de producto, cooperación de fábrica y soporte de ingeniería.",
        ar: "تواصل مع ZYL للحصول على عروض الأسعار واستشارات المنتجات والتعاون الصناعي والدعم الهندسي.",
        ru: "Свяжитесь с ZYL по вопросам расчётов, консультаций, производственного сотрудничества и инженерной поддержки.",
      },
    },
    solution: {
      title: {
        en: "Stone Solutions | Countertops, Walls & Flooring",
        zh: "石材解决方案 | 台面、墙面与地面",
        es: "Soluciones en piedra | Encimeras, muros y pisos",
        ar: "حلول الحجر | الأسطح والجدران والأرضيات",
        ru: "Каменные решения | Столешницы, стены и полы",
      },
      description: {
        en: "Explore ZYL application scenarios for finished products, wall systems, flooring and engineering projects.",
        zh: "查看众岩联在成品、墙面系统、地面系统及工程项目中的应用场景。",
        es: "Explore los escenarios de aplicación de ZYL en productos terminados, muros, pisos y proyectos.",
        ar: "استكشف سيناريوهات تطبيق ZYL في المنتجات النهائية وأنظمة الجدران والأرضيات والمشاريع.",
        ru: "Изучите сценарии применения ZYL для готовых изделий, стеновых систем, полов и инженерных проектов.",
      },
    },
    download: {
      title: {
        en: "Download Center | Catalogs & Technical Files",
        zh: "下载中心 | 图册与技术资料",
        es: "Centro de descargas | Catálogos y fichas técnicas",
        ar: "مركز التنزيل | الكتالوجات والملفات الفنية",
        ru: "Центр загрузок | Каталоги и техдокументы",
      },
      description: {
        en: "Download ZYL product catalogs, specifications and installation documents for project planning and sourcing.",
        zh: "下载众岩联产品图册、规格参数和安装资料，用于项目规划与采购。",
        es: "Descargue catálogos, especificaciones y documentos de instalación de ZYL para planificación y compras.",
        ar: "قم بتنزيل كتالوجات ZYL والمواصفات والوثائق الفنية للتخطيط والشراء.",
        ru: "Скачивайте каталоги ZYL, спецификации и монтажные документы для планирования и закупок.",
      },
    },
    news: {
      title: {
        en: "News | Product Launches & Company Updates",
        zh: "新闻动态 | 新品发布与企业资讯",
        es: "Noticias | Lanzamientos y novedades",
        ar: "الأخبار | الإطلاقات وتحديثات الشركة",
        ru: "Новости | Новые продукты и обновления компании",
      },
      description: {
        en: "Track ZYL's latest product launches, exhibition highlights and manufacturing milestones.",
        zh: "跟踪众岩联最新产品发布、展会亮点与制造里程碑。",
        es: "Siga los últimos lanzamientos, exposiciones y hitos de fabricación de ZYL.",
        ar: "تابع أحدث إطلاقات المنتجات وأبرز المعارض ومحطات التصنيع لدى ZYL.",
        ru: "Следите за новыми продуктами, выставками и производственными достижениями ZYL.",
      },
    },
    products: {
      title: {
        en: "Product Collection | Quartz, Terrazzo, Marble & More",
        zh: "产品系列 | 石英石、水磨石、大理石等",
        es: "Colección de productos | Cuarzo, terrazo, mármol y más",
        ar: "مجموعة المنتجات | كوارتز وتيرازو ورخام وأكثر",
        ru: "Коллекция продуктов | Кварц, терраццо, мрамор и другое",
      },
      description: {
        en: "Browse ZYL's material portfolio across quartz, terrazzo, flexible stone, marble, artificial marble, porcelain slab and silica-free surfaces.",
        zh: "查看众岩联石英石、水磨石、柔性石材、大理石、人造大理石、岩板与零硅表面材料组合。",
        es: "Explore el portafolio de ZYL en cuarzo, terrazo, piedra flexible, mármol, mármol artificial, porcelánico y superficies sin sílice.",
        ar: "تصفح مجموعة ZYL من الكوارتز والتيرازو والحجر المرن والرخام والرخام الصناعي وألواح البورسلان والأسطح الخالية من السيليكا.",
        ru: "Изучите портфель ZYL: кварц, терраццо, гибкий камень, мрамор, искусственный мрамор, керамогранит и поверхности без кремнезёма.",
      },
    },
    productDetail: {
      title: {
        en: "{title} | ZYL Stone",
        zh: "{title} | 众岩联石材",
        es: "{title} | ZYL Stone",
        ar: "{title} | ZYL Stone",
        ru: "{title} | ZYL Stone",
      },
      description: {
        en: "View specifications and application guidance for {title}, a {category} surface from ZYL Stone.",
        zh: "查看众岩联 {category} 产品 {title} 的规格参数与应用建议。",
        es: "Consulte especificaciones y aplicaciones de {title}, una superficie de {category} de ZYL Stone.",
        ar: "اطلع على مواصفات وتطبيقات {title}، وهي سطح من فئة {category} لدى ZYL Stone.",
        ru: "Изучите характеристики и рекомендации по применению {title}, материала категории {category} от ZYL Stone.",
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
