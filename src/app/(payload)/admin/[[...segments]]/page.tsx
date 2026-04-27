/* tslint:disable */
import type { Metadata } from "next";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";

import { getPayloadConfig } from "@/lib/payload-config";

import { importMap } from "../importMap.js";

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config: getPayloadConfig(), params, searchParams });

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config: getPayloadConfig(), params, searchParams, importMap });

export default Page;
