import type { CollectionConfig } from "payload";

import { PRODUCT_CACHE_TAG } from "../../data/cacheTags.ts";
import { TRADE_SERIES_TYPES } from "../../features/products/lib/tradeCatalog.ts";
import { autoPinyinTitleAfterChange } from "../hooks/autoPinyin.ts";
import {
  revalidateSiteCacheAfterChange,
  revalidateSiteCacheAfterDelete,
} from "../hooks/revalidateSiteCache.ts";
import { slugifyBeforeValidate } from "../hooks/slug.ts";

export const Products: CollectionConfig = {
  slug: "products",
  labels: {
    singular: "产品",
    plural: "产品",
  },
  admin: {
    group: "产品管理",
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "image",
      "slug",
      "published",
      "variants",
      "sortOrder",
      "localeStatus",
    ],
    description:
      "前台产品目录按大类入口展示：规格、岩板产品系列、特惠系列、厚度、颜色、表面工艺、定制产品。新增产品时建议顺序：填标题 → 选择“岩板产品系列小类”或“产品类型/关联定制能力” → 上传主图 → 在下方“产品型号”里补规格、厚度、颜色、表面工艺 → 打开“发布到前台”。标题与描述为多语言字段，请使用页面右上角的语言切换器，按 4 个语种分别填写。某语种留空时，前台会自动回落显示英文；英文也为空时，对应语种页面会显示空白。",
    components: {
      beforeListTable: [
        "@/payload/components/ProductListToolbar#ProductListToolbar",
      ],
    },
  },
  access: {
    // Public REST (/api/products) must not leak drafts. Authenticated users
    // (CMS editors) see everything; anonymous callers get a where-filter
    // limiting results to published documents.
    read: ({ req }) => (req.user ? true : { published: { equals: true } }),
  },
  hooks: {
    beforeValidate: [slugifyBeforeValidate],
    afterChange: [
      autoPinyinTitleAfterChange,
      revalidateSiteCacheAfterChange([PRODUCT_CACHE_TAG]),
    ],
    afterDelete: [revalidateSiteCacheAfterDelete([PRODUCT_CACHE_TAG])],
  },
  fields: [
    {
      name: "localeCompletenessWarning",
      type: "ui",
      admin: {
        components: {
          Field:
            "@/payload/components/LocaleCompletenessWarning#LocaleCompletenessWarning",
        },
      },
    },
    {
      name: "title",
      label: "标题",
      type: "text",
      localized: true,
      required: true,
      admin: {
        description: "中文标题为主字段。注意：产品前台非中文页（英/西/阿语）始终显示中文标题的大写拼音转写（如「花开富贵」→ HUA KAI FU GUI），不会读取英/西/阿语 title。英/西/阿语 title 仅在中文为空时作为兜底用，且不能含中文字符（否则徽章/警告判为未填）。",
      },
    },
    {
      name: "slug",
      label: "链接标识",
      type: "text",
      unique: true,
      required: true,
      index: true,
    },
    {
      name: "normalizedName",
      label: "标准化名称",
      type: "text",
      admin: {
        hidden: true,
        description: "导入产品时生成的族系名称，用作导入识别键。不要手动修改。",
      },
    },
    {
      name: "published",
      label: "发布到前台",
      type: "checkbox",
      defaultValue: false,
      index: true,
      admin: {
        description:
          "控制产品是否在官网显示。导入产品会自动发布，手动新建产品默认不发布，内容准备好后再打开。",
      },
    },
    {
      name: "image",
      label: "主图",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "产品列表卡片和详情页首屏优先使用这张图。如果留空，前台会自动从该产品的第一个型号里取图（优先级：元素图 → 空间图 → 实拍图），列表页的“封面”列也会显示该兜底图。",
        components: {
          Cell: "@/payload/components/ProductCoverCell#ProductCoverCell",
        },
      },
    },
    {
      name: "description",
      label: "描述",
      type: "textarea",
      localized: true,
      admin: {
        description: "多语言字段，请在每个语言下分别填写真实的目标语言翻译（不要把中文复制到英文/西语/阿语字段）。",
      },
    },
    {
      name: "seriesTypes",
      label: "岩板产品系列小类（可多选）",
      type: "select",
      hasMany: true,
      options: TRADE_SERIES_TYPES.map((value) => ({ label: value, value })),
      admin: {
        description:
          "这里填的是前台「岩板产品系列」里的小类，例如质感岩板、名石岩板、洞石岩板、木纹岩板等，可同时勾选多项。前台左侧的「规格 / 岩板产品系列 / 特惠系列 / 厚度 / 颜色 / 表面工艺 / 定制产品」是大类入口，不需要在这里重复填写。",
      },
    },
    {
      name: "catalogMode",
      label: "产品类型",
      type: "select",
      defaultValue: "standard",
      options: [
        { label: "标准产品", value: "standard" },
        { label: "定制产品", value: "custom" },
      ],
      admin: {
        description:
          "「标准产品」= 常规现货，进入官网“岩板产品系列”分类。「定制产品」= 客户按需定制的产品，选择后下方会出现“关联定制能力”字段。大部分情况保持「标准产品」。",
      },
    },
    {
      name: "customCapability",
      label: "关联定制能力",
      type: "relationship",
      relationTo: "customCapabilities",
      admin: {
        condition: (_, siblingData) => siblingData?.catalogMode === "custom",
        description:
          "仅在“产品类型”选了「定制产品」时显示。选一项定制能力（如“定制颜色”“定制图案设计”），前台“定制产品”栏目会把本产品归入对应能力分组下。",
      },
    },
    {
      name: "coverImageUrl",
      label: "封面图 URL",
      type: "text",
      admin: {
        hidden: true,
        description:
          "导入脚本写入的 /api/trade-media/... URL。这里是字符串，不是媒体上传。",
      },
    },
    {
      name: "coverVideoPosterUrl",
      label: "封面视频海报 URL",
      type: "text",
      admin: {
        hidden: true,
        description: "导入脚本写入的封面视频海报 URL。",
      },
    },
    {
      name: "sortOrder",
      label: "排序",
      type: "number",
      defaultValue: 0,
      index: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "variants",
      label: "产品型号",
      type: "join",
      collection: "productVariants",
      on: "productRef",
      admin: {
        description:
          "该产品下的所有型号，可直接在此处新增或编辑，无需跳转到【产品型号】集合。",
        defaultColumns: [
          "code",
          "size",
          "thickness",
          "process",
          "colorGroup",
          "sortOrder",
        ],
      },
    },
    {
      name: "localeStatus",
      label: "语言",
      type: "ui",
      admin: {
        components: {
          Cell: "@/payload/components/LocaleStatusCell#ProductLocaleStatusCell",
        },
      },
    },
  ],
};
