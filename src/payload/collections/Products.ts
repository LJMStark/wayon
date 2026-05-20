import type { CollectionConfig } from "payload";

import { PRODUCT_CACHE_TAG } from "../../data/cacheTags.ts";
import { TRADE_SERIES_TYPES } from "../../features/products/lib/tradeCatalog.ts";
import { autoPinyinTitleAfterChange } from "../hooks/autoPinyin.ts";
import {
  variantAttributeFields,
  variantMediaFields,
} from "../lib/variantFields.ts";
import {
  revalidateSiteCacheAfterChange,
  revalidateSiteCacheAfterDelete,
} from "../hooks/revalidateSiteCache.ts";
import { setProductCodeFromSlug } from "../hooks/productCode.ts";
import { slugifyBeforeValidate } from "../hooks/slug.ts";

export const Products: CollectionConfig = {
  slug: "products",
  labels: {
    singular: "产品",
    plural: "产品",
  },
  admin: {
    group: "产品管理",
    useAsTitle: "slug",
    defaultColumns: [
      "slug",
      "title",
      "published",
      "sortOrder",
    ],
    description:
      "管理官网展示的所有产品，一个产品的全部信息都在这一页编辑。新增产品的推荐顺序：① 填中文产品名 → ② 选产品系列 + 产品分类 → ③ 上传产品封面图 → ④ 往下填尺寸、厚度、工艺、颜色，并上传材质纹理图、实景应用图、工地实拍图、视频 → ⑤ 打开「发布到官网」。产品名称、产品介绍是多语言字段，用页面右上角的语言切换按 4 种语言分别填写；外语留空时官网会自动用英文兜底。",
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
    beforeChange: [setProductCodeFromSlug],
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
      label: "产品名称",
      type: "text",
      localized: true,
      required: true,
      admin: {
        description:
          "中文产品名（如「鱼肚金」）。英文、西班牙语、阿拉伯语版的官网页会自动用中文名的大写拼音显示（如「花开富贵」→「HUA KAI FU GUI」），外语栏一般可以留空。如需自定义外语名，在外语栏填写对应翻译，且不能含中文字符。",
      },
    },
    {
      name: "slug",
      label: "产品型号",
      type: "text",
      unique: true,
      required: true,
      index: true,
      admin: {
        description:
          "产品的唯一编号，例如 LV930R45。一个编号对应一个产品。列表页用大写显示，官网网址用小写。搜索时大小写都能匹配。",
        components: {
          Cell: "@/payload/components/ProductCodeCell#ProductCodeCell",
        },
      },
    },
    // productCode mirrors slug.toUpperCase(). Maintained by the
    // setProductCodeFromSlug beforeChange hook so every save (create or
    // slug-changing update) refreshes it; existing rows were populated by the
    // variants → products backfill (2026-05-20). Hidden in admin since
    // editors should never need to set it by hand.
    {
      name: "productCode",
      label: "产品编号",
      type: "text",
      index: true,
      admin: {
        hidden: true,
        description:
          "产品的大写编号，例如 LV930R45。由系统从「产品型号」自动派生，请勿手动修改。",
      },
    },
    {
      name: "normalizedName",
      label: "系统识别码",
      type: "text",
      admin: {
        hidden: true,
        description: "导入工具自动生成的识别码，请勿手动修改。",
      },
    },
    {
      name: "published",
      label: "发布到官网",
      type: "checkbox",
      defaultValue: false,
      index: true,
      admin: {
        description:
          "打开后官网会展示该产品。新建产品默认是关闭的，等图片、文案准备好再打开。",
      },
    },
    {
      name: "image",
      label: "产品封面图",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "官网产品列表卡片和详情页首屏的封面图。留空时官网会自动从下方「产品规格」的材质纹理图、实景应用图、工地实拍图里依次挑一张兜底。",
        components: {
          afterInput: [
            "@/payload/components/ProductAdminFields#ProductCoverPreviewField",
          ],
        },
      },
    },
    // One product = one set of specs + media, edited inline on this page.
    // 规格（尺寸/厚度/工艺/颜色/纹理）紧跟封面图，下面是各类产品图片与视频。
    ...variantAttributeFields,
    ...variantMediaFields,
    {
      name: "catalogMode",
      label: "产品分类",
      type: "select",
      defaultValue: "standard",
      options: [
        { label: "常规产品", value: "standard" },
        { label: "定制产品", value: "custom" },
      ],
      admin: {
        description:
          "常规现货选「常规产品」（归入官网「岩板系列」入口），客户定制款选「定制产品」（选了之后下方会出现「定制类型」字段）。多数情况选常规。",
      },
    },
    {
      name: "customCapability",
      label: "定制类型",
      type: "relationship",
      relationTo: "customCapabilities",
      admin: {
        condition: (_, siblingData) => siblingData?.catalogMode === "custom",
        description:
          "仅「定制产品」时填写。选一种定制类型（如「定制颜色」「定制图案」），官网「定制产品」栏目会把本产品归入对应分组。",
      },
    },
    {
      name: "description",
      label: "产品介绍",
      type: "textarea",
      localized: true,
      admin: {
        description:
          "多语言字段。请用页面右上角的语言切换分别填写中/英/西/阿四种语言的真实翻译，不要把中文复制到外语栏。",
      },
    },
    {
      name: "seriesTypes",
      label: "产品系列（可多选）",
      type: "select",
      hasMany: true,
      options: TRADE_SERIES_TYPES.map((value) => ({ label: value, value })),
      admin: {
        placeholder: "选一项或多项",
        description:
          "官网「岩板系列」里的子分类（质感岩板、名石岩板、洞石岩板、木纹岩板等），可多选。尺寸、厚度、颜色、工艺这些是官网另外的筛选入口，会从「产品规格」自动归类，不在这里填。",
        components: {
          afterInput: [
            "@/payload/components/ProductAdminFields#ProductSeriesTypesSummaryField",
          ],
        },
      },
    },
    {
      name: "coverImageUrl",
      label: "备用封面图地址",
      type: "text",
      admin: {
        hidden: true,
        description: "系统导入时自动填写，请勿手动修改。",
      },
    },
    {
      name: "coverVideoPosterUrl",
      label: "备用视频封面地址",
      type: "text",
      admin: {
        hidden: true,
        description: "系统导入时自动填写，请勿手动修改。",
      },
    },
    {
      name: "sortOrder",
      label: "列表顺序",
      type: "number",
      defaultValue: 0,
      index: true,
      admin: {
        position: "sidebar",
        description: "数字越小越靠前。默认 0。",
      },
    },
  ],
};
