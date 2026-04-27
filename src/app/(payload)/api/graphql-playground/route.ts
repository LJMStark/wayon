/* tslint:disable */
import { GRAPHQL_PLAYGROUND_GET } from "@payloadcms/next/routes";

import { getPayloadConfig } from "@/lib/payload-config";

let handler: Promise<ReturnType<typeof GRAPHQL_PLAYGROUND_GET>> | null = null;

async function getHandler(): Promise<ReturnType<typeof GRAPHQL_PLAYGROUND_GET>> {
  if (!handler) {
    handler = Promise.resolve(GRAPHQL_PLAYGROUND_GET(getPayloadConfig()));
  }

  return handler;
}

export async function GET(request: Request): Promise<Response> {
  return (await getHandler())(request);
}
