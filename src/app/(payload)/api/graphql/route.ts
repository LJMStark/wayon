/* tslint:disable */
import { GRAPHQL_POST, REST_OPTIONS } from "@payloadcms/next/routes";

import { getPayloadConfig } from "@/lib/payload-config";

type OptionsArgs = Parameters<ReturnType<typeof REST_OPTIONS>>[1];

let postHandler: Promise<ReturnType<typeof GRAPHQL_POST>> | null = null;
let optionsHandler: Promise<ReturnType<typeof REST_OPTIONS>> | null = null;

async function getPostHandler(): Promise<ReturnType<typeof GRAPHQL_POST>> {
  if (!postHandler) {
    postHandler = getPayloadConfig().then((config) => GRAPHQL_POST(config));
  }

  return postHandler;
}

async function getOptionsHandler(): Promise<ReturnType<typeof REST_OPTIONS>> {
  if (!optionsHandler) {
    optionsHandler = getPayloadConfig().then((config) => REST_OPTIONS(config));
  }

  return optionsHandler;
}

export async function POST(request: Request): Promise<Response> {
  return (await getPostHandler())(request);
}

export async function OPTIONS(
  request: Request,
  args: OptionsArgs,
): Promise<Response> {
  return (await getOptionsHandler())(request, args);
}
