export const CUSTOM_CAPABILITIES = [
  {
    key: "custom-thickness",
    title: "定制厚度",
    description: "支持多种厚度方案与项目级结构适配。",
  },
  {
    key: "custom-cutting-processing",
    title: "定制切割和加工",
    description: "支持异形切割、开孔、倒角与工程加工。",
  },
  {
    key: "custom-size",
    title: "定制尺寸",
    description: "按项目需求调整版面尺寸与落地规格。",
  },
  {
    key: "custom-surface",
    title: "定制表面",
    description: "根据空间风格匹配定制表面效果与触感。",
  },
  {
    key: "custom-color",
    title: "定制颜色",
    description: "围绕项目综合色体系提供定制配色。",
  },
  {
    key: "custom-pattern-design",
    title: "定制图案设计",
    description: "支持纹理开发、图案深化与连纹方案。",
  },
  {
    key: "custom-hot-bending",
    title: "定制热弯",
    description: "适配曲面墙体、造型结构与特殊安装需求。",
  },
  {
    key: "custom-logo-branding",
    title: "定制徽标和品牌",
    description: "支持品牌标识、专属纹样与项目联名呈现。",
  },
] as const;

export type CustomCapabilityKey = (typeof CUSTOM_CAPABILITIES)[number]["key"];

export const CUSTOM_CAPABILITY_KEYS = CUSTOM_CAPABILITIES.map(
  (capability) => capability.key
) as CustomCapabilityKey[];

export function getCustomCapabilityFallback(
  key: string
): (typeof CUSTOM_CAPABILITIES)[number] | null {
  return CUSTOM_CAPABILITIES.find((capability) => capability.key === key) ?? null;
}
