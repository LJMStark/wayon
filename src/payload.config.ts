import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import {
  BlockquoteFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { zh } from "@payloadcms/translations/languages/zh";
import { buildConfig } from "payload";
import sharp from "sharp";

import {
  databaseUrl,
  payloadSecret,
  r2AccessKeyId,
  r2Bucket,
  r2Endpoint,
  r2PublicUrl,
  r2SecretAccessKey,
} from "./lib/server-env.ts";
import { CustomCapabilities } from "./payload/collections/CustomCapabilities.ts";
import { Inquiries } from "./payload/collections/Inquiries.ts";
import { Media } from "./payload/collections/Media.ts";
import { News } from "./payload/collections/News.ts";
import { Products } from "./payload/collections/Products.ts";
import { Users } from "./payload/collections/Users.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    theme: "light",
    meta: {
      titleSuffix: "- 众岩联岩板 CMS",
      description: "众岩联岩板官网后台管理。",
      icons: [
        { rel: "icon", type: "image/png", url: "/assets/brand/favicon.png" },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeLogin: ["@/payload/components/AdminBrand#AdminLoginIntro"],
      beforeNav: ["@/payload/components/AdminBrand#AdminNavBrand"],
      graphics: {
        Icon: "@/payload/components/AdminBrand#AdminIcon",
        Logo: "@/payload/components/AdminBrand#AdminLogo",
      },
    },
    dashboard: {
      defaultLayout: [
        { widgetSlug: "zyl-overview", width: "full" },
        { widgetSlug: "zyl-quick-actions", width: "medium" },
        { widgetSlug: "zyl-latest-inquiries", width: "medium" },
        { widgetSlug: "zyl-latest-news", width: "medium" },
        { widgetSlug: "zyl-workflow", width: "medium" },
      ],
      widgets: [
        {
          slug: "zyl-overview",
          label: "运营概览",
          Component: "@/payload/components/AdminDashboard#AdminOverviewWidget",
          minWidth: "full",
        },
        {
          slug: "zyl-quick-actions",
          label: "常用入口",
          Component:
            "@/payload/components/AdminDashboard#AdminQuickActionsWidget",
          minWidth: "medium",
        },
        {
          slug: "zyl-latest-inquiries",
          label: "最新询盘",
          Component:
            "@/payload/components/AdminDashboard#AdminLatestInquiriesWidget",
          minWidth: "medium",
        },
        {
          slug: "zyl-latest-news",
          label: "最近新闻",
          Component:
            "@/payload/components/AdminDashboard#AdminLatestNewsWidget",
          minWidth: "medium",
        },
        {
          slug: "zyl-workflow",
          label: "编辑顺序",
          Component: "@/payload/components/AdminDashboard#AdminWorkflowWidget",
          minWidth: "medium",
        },
      ],
    },
  },
  collections: [
    Users,
    Media,
    CustomCapabilities,
    Products,
    News,
    Inquiries,
  ],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
      BlockquoteFeature(),
      HorizontalRuleFeature(),
    ],
  }),
  graphQL: { disable: true },
  i18n: {
    fallbackLanguage: "zh",
    supportedLanguages: { zh },
  },
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
      keepAlive: true,
      idleTimeoutMillis: 0,
    },
    idType: "uuid",
    // DATABASE_URL points at production Postgres on Zeabur; never let dev mode
    // auto-push schema diffs. Schema changes go through src/migrations/* only.
    push: false,
  }),
  sharp,
  localization: {
    locales: [
      { code: "zh", label: "中文" },
      { code: "en", label: "English" },
      { code: "es", label: "Español" },
      { code: "ar", label: "العربية", rtl: true },
    ],
    defaultLocale: "zh",
    fallback: true,
  },
  plugins: [
    s3Storage({
      collections: {
        media: {
          generateFileURL: ({ filename, prefix }) =>
            `${r2PublicUrl}/${prefix ? `${prefix}/` : ""}${filename}`,
        },
      },
      bucket: r2Bucket,
      config: {
        endpoint: r2Endpoint,
        region: "auto",
        forcePathStyle: true,
        credentials: {
          accessKeyId: r2AccessKeyId,
          secretAccessKey: r2SecretAccessKey,
        },
      },
    }),
  ],
});
