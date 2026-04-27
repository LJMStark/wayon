/* tslint:disable */
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from "@payloadcms/next/routes";

import { getPayloadConfig } from "@/lib/payload-config";

type RestArgs = Parameters<ReturnType<typeof REST_GET>>[1];
type RestHandler = ReturnType<typeof REST_GET>;
type RestHandlers = {
  DELETE: RestHandler;
  GET: RestHandler;
  OPTIONS: RestHandler;
  PATCH: RestHandler;
  POST: RestHandler;
  PUT: RestHandler;
};

let handlers: Promise<RestHandlers> | null = null;

async function getHandlers(): Promise<RestHandlers> {
  if (!handlers) {
    handlers = getPayloadConfig().then((config) => ({
      DELETE: REST_DELETE(config),
      GET: REST_GET(config),
      OPTIONS: REST_OPTIONS(config),
      PATCH: REST_PATCH(config),
      POST: REST_POST(config),
      PUT: REST_PUT(config),
    }));
  }

  return handlers;
}

export async function GET(request: Request, args: RestArgs): Promise<Response> {
  return (await getHandlers()).GET(request, args);
}

export async function POST(request: Request, args: RestArgs): Promise<Response> {
  return (await getHandlers()).POST(request, args);
}

export async function DELETE(request: Request, args: RestArgs): Promise<Response> {
  return (await getHandlers()).DELETE(request, args);
}

export async function PATCH(request: Request, args: RestArgs): Promise<Response> {
  return (await getHandlers()).PATCH(request, args);
}

export async function PUT(request: Request, args: RestArgs): Promise<Response> {
  return (await getHandlers()).PUT(request, args);
}

export async function OPTIONS(request: Request, args: RestArgs): Promise<Response> {
  return (await getHandlers()).OPTIONS(request, args);
}
