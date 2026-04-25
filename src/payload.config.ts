import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";

import {
  databaseUrl,
  payloadSecret,
  r2AccessKeyId,
  r2Bucket,
  r2Endpoint,
  r2SecretAccessKey,
} from "./lib/server-env.ts";
import { Categories } from "./payload/collections/Categories.ts";
import { CustomCapabilities } from "./payload/collections/CustomCapabilities.ts";
import { Inquiries } from "./payload/collections/Inquiries.ts";
import { Media } from "./payload/collections/Media.ts";
import { News } from "./payload/collections/News.ts";
import { Products } from "./payload/collections/Products.ts";
import { ProductVariants } from "./payload/collections/ProductVariants.ts";
import { Users } from "./payload/collections/Users.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    CustomCapabilities,
    Products,
    ProductVariants,
    News,
    Inquiries,
  ],
  editor: lexicalEditor({}),
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
    },
    idType: "uuid",
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
        media: true,
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
