import type { AppLocale } from "@/i18n/types";

type LocalizedText = Record<AppLocale, string>;

type CustomCapabilityDefinition = {
  key: string;
  title: LocalizedText;
  description: LocalizedText;
};

export const CUSTOM_CAPABILITIES: readonly CustomCapabilityDefinition[] = [
  {
    key: "custom-thickness",
    title: {
      en: "Custom Thickness",
      zh: "定制厚度",
      es: "Espesor personalizado",
      ar: "سماكة مخصصة",
    },
    description: {
      en: "Multiple thickness options engineered to match project-level structural needs.",
      zh: "支持多种厚度方案与项目级结构适配。",
      es: "Múltiples opciones de espesor adaptadas a los requisitos estructurales del proyecto.",
      ar: "خيارات سماكة متعددة مصممة لتلبية احتياجات المشاريع الإنشائية.",
    },
  },
  {
    key: "custom-cutting-processing",
    title: {
      en: "Custom Cutting & Fabrication",
      zh: "定制切割和加工",
      es: "Corte y fabricación a medida",
      ar: "قص ومعالجة مخصصة",
    },
    description: {
      en: "Shaped cutting, drilling, chamfering and project-grade fabrication.",
      zh: "支持异形切割、开孔、倒角与工程加工。",
      es: "Corte de formas, taladrado, biselado y mecanizado de nivel proyecto.",
      ar: "قص بأشكال خاصة وثقب وحواف مشطوفة ومعالجة مخصصة للمشاريع.",
    },
  },
  {
    key: "custom-size",
    title: {
      en: "Custom Sizes",
      zh: "定制尺寸",
      es: "Dimensiones personalizadas",
      ar: "مقاسات مخصصة",
    },
    description: {
      en: "Slab dimensions tailored to project specifications and installation needs.",
      zh: "按项目需求调整版面尺寸与落地规格。",
      es: "Dimensiones de placa adaptadas a las especificaciones e instalación del proyecto.",
      ar: "مقاسات الألواح وفقًا لمتطلبات المشروع والتركيب.",
    },
  },
  {
    key: "custom-surface",
    title: {
      en: "Custom Surface",
      zh: "定制表面",
      es: "Superficie personalizada",
      ar: "سطح مخصص",
    },
    description: {
      en: "Surface finishes and textures matched to the design language of each space.",
      zh: "根据空间风格匹配定制表面效果与触感。",
      es: "Acabados y texturas que combinan con el lenguaje de diseño del espacio.",
      ar: "تشطيبات وأنسجة تتوافق مع لغة التصميم لكل فضاء.",
    },
  },
  {
    key: "custom-color",
    title: {
      en: "Custom Color",
      zh: "定制颜色",
      es: "Color personalizado",
      ar: "ألوان مخصصة",
    },
    description: {
      en: "Bespoke color matching aligned with the project's overall palette.",
      zh: "围绕项目综合色体系提供定制配色。",
      es: "Coordinación de color a medida alineada con la paleta general del proyecto.",
      ar: "مطابقة ألوان حسب الطلب تتوافق مع لوحة الألوان العامة للمشروع.",
    },
  },
  {
    key: "custom-pattern-design",
    title: {
      en: "Custom Pattern Design",
      zh: "定制图案设计",
      es: "Diseño de patrón personalizado",
      ar: "تصميم نمط مخصص",
    },
    description: {
      en: "Texture development, pattern refinement and book-matched solutions.",
      zh: "支持纹理开发、图案深化与连纹方案。",
      es: "Desarrollo de texturas, definición de patrones y soluciones simétricas.",
      ar: "تطوير الأنسجة وتعميق الأنماط وحلول التطابق.",
    },
  },
  {
    key: "custom-hot-bending",
    title: {
      en: "Custom Hot Bending",
      zh: "定制热弯",
      es: "Curvado en caliente personalizado",
      ar: "ثني حراري مخصص",
    },
    description: {
      en: "Adapts to curved walls, sculpted forms and special installation requirements.",
      zh: "适配曲面墙体、造型结构与特殊安装需求。",
      es: "Se adapta a muros curvos, formas escultóricas y requisitos de instalación especiales.",
      ar: "يناسب الجدران المنحنية والأشكال المنحوتة ومتطلبات التركيب الخاصة.",
    },
  },
  {
    key: "custom-logo-branding",
    title: {
      en: "Custom Logo & Branding",
      zh: "定制徽标和品牌",
      es: "Logotipo y marca personalizados",
      ar: "شعار وعلامة تجارية مخصصة",
    },
    description: {
      en: "Brand marks, signature patterns and co-branded project finishes.",
      zh: "支持品牌标识、专属纹样与项目联名呈现。",
      es: "Marcas, patrones distintivos y acabados con marca compartida del proyecto.",
      ar: "علامات تجارية وأنماط مميزة وتشطيبات بعلامة مشتركة للمشروع.",
    },
  },
] as const;

export type CustomCapabilityKey = (typeof CUSTOM_CAPABILITIES)[number]["key"];

export const CUSTOM_CAPABILITY_KEYS = CUSTOM_CAPABILITIES.map(
  (capability) => capability.key
) as CustomCapabilityKey[];

export function getCustomCapabilityFallback(
  key: string
): CustomCapabilityDefinition | null {
  return CUSTOM_CAPABILITIES.find((capability) => capability.key === key) ?? null;
}

export function getLocalizedCapabilityTitle(
  fallback: CustomCapabilityDefinition,
  locale: AppLocale
): string {
  return fallback.title[locale] ?? fallback.title.en;
}

export function getLocalizedCapabilityDescription(
  fallback: CustomCapabilityDefinition,
  locale: AppLocale
): string {
  return fallback.description[locale] ?? fallback.description.en;
}
